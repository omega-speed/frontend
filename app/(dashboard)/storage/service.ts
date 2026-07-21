import { getPresignedUrl } from "./actions";

const MAX_UPLOAD_BYTES = 20 * 1024 * 1024; // hard ceiling before we even try to compress
const TARGET_BYTES = 3 * 1024 * 1024;      // compress all images down to this

type UploadResult =
  | { success: true; status_code: number; message: string; data: { key: string } }
  | { success: false; status_code: number; message: string; data: null };

/**
 * Compress an image file to under TARGET_BYTES using the Canvas API.
 * - Scales down to max 2048px on the longest side first.
 * - Then iterates quality from 0.85 → 0.1 until the blob is small enough.
 * - Returns the original file untouched if it's already within the target
 *   or if the browser can't decode the format (e.g. HEIC on some browsers).
 */
async function compressImage(file: File, targetBytes = TARGET_BYTES): Promise<File> {
  if (file.size <= targetBytes || !file.type.startsWith("image/")) return file;

  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      const MAX_DIM = 2048;
      let { width, height } = img;
      if (width > MAX_DIM || height > MAX_DIM) {
        if (width >= height) {
          height = Math.round((height * MAX_DIM) / width);
          width = MAX_DIM;
        } else {
          width = Math.round((width * MAX_DIM) / height);
          height = MAX_DIM;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      canvas.getContext("2d")!.drawImage(img, 0, 0, width, height);

      let quality = 0.85;

      const attempt = () => {
        canvas.toBlob(
          (blob) => {
            if (!blob) { resolve(file); return; }
            if (blob.size <= targetBytes || quality <= 0.1) {
              resolve(new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), { type: "image/jpeg" }));
            } else {
              quality = Math.round((quality - 0.1) * 10) / 10;
              attempt();
            }
          },
          "image/jpeg",
          quality,
        );
      };

      attempt();
    };

    // If the browser can't decode the format, upload as-is
    img.onerror = () => { URL.revokeObjectURL(objectUrl); resolve(file); };
    img.src = objectUrl;
  });
}

export async function UploadFile(formData: FormData): Promise<UploadResult> {
  const raw = formData.get("file") as File | null;
  const folder = (formData.get("folder") as string | null) ?? "uploads";

  if (!raw) {
    return { success: false, status_code: 400, message: "No file provided", data: null };
  }

  if (raw.size > MAX_UPLOAD_BYTES) {
    return { success: false, status_code: 413, message: "File too large. Maximum allowed size is 20 MB.", data: null };
  }

  const file = await compressImage(raw);

  try {
    const { signedUrl, key } = await getPresignedUrl(folder, file.name, file.type);

    const uploadRes = await fetch(signedUrl, {
      method: "PUT",
      body: file,
      headers: { "Content-Type": file.type },
    });

    if (!uploadRes.ok) {
      return { success: false, status_code: uploadRes.status, message: "Upload to S3 failed", data: null };
    }

    return { success: true, status_code: 200, message: "File uploaded successfully", data: { key } };
  } catch {
    return { success: false, status_code: 500, message: "Upload failed. Please try again.", data: null };
  }
}
