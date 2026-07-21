"use server";

import { getAccessToken } from "@/lib/auth";

export async function getPresignedUrl(
  folder: string,
  fileName: string,
  contentType: string,
): Promise<{ signedUrl: string; key: string }> {
  const token = await getAccessToken();
  const params = new URLSearchParams({ folder, fileName, contentType });
  const res = await fetch(`${process.env.BASE_URL}/storage/presign?${params}`, {
    headers: {
      Authorization: `Bearer ${token ?? ""}`,
    },
  });
  if (!res.ok) throw new Error("Failed to get presigned upload URL");
  const json = await res.json();
  return json.data as { signedUrl: string; key: string };
}
