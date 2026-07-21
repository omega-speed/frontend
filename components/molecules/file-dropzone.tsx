"use client";

import { useDropzone } from "react-dropzone";
import { Upload, FileCheck, X, File } from "lucide-react";
import { useCallback, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

interface FileDropzoneProps {
  onFileChange: (file: File | null) => void;
  accept?: Record<string, string[]>;
  maxFiles?: number;
  label: string;
  helperText?: string;
  file?: File | null;
  previewUrl?: string | null;
}

export default function FileDropzone({
  onFileChange,
  accept = {
    "image/*": [".png", ".jpg", ".jpeg"],
    "application/pdf": [".pdf"],
  },
  maxFiles = 1,
  label,
  helperText = "PNG, JPG, JPEG or PDF (max 10MB)",
  file: externalFile,
  previewUrl,
}: FileDropzoneProps) {
  const [internalFile, setInternalFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(previewUrl || null);

  const file = externalFile ?? internalFile;

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: useCallback(
      (acceptedFiles: File[]) => {
        const selectedFile = acceptedFiles[0];
        setInternalFile(selectedFile);
        onFileChange(selectedFile);

        // Generate preview for images and PDFs
        if (selectedFile) {
          const reader = new FileReader();
          reader.onload = () => {
            setPreview(reader.result as string);
          };
          reader.readAsDataURL(selectedFile);
        } else {
          setPreview(null);
        }
      },
      [onFileChange]
    ),
    accept,
    maxFiles,
  });

  const removeFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setInternalFile(null);
    setPreview(null);
    onFileChange(null);
  };

  // Extract file path from URL (remove query parameters for type detection)
  const getFilePathFromUrl = (url: string) => {
    try {
      const urlObj = new URL(url);
      return urlObj.pathname; // Gets the path without query params
    } catch {
      return url; // Fallback to original if not a valid URL
    }
  };

  const isPDF = file
    ? file.type === "application/pdf"
    : previewUrl
    ? getFilePathFromUrl(previewUrl).toLowerCase().endsWith(".pdf")
    : false;

  const isImage = file
    ? file.type.startsWith("image/")
    : previewUrl
    ? /\.(jpg|jpeg|png|gif|webp|bmp|svg|ico|tiff)$/i.test(
        getFilePathFromUrl(previewUrl)
      ) ||
      // Fallback: if it's not a PDF and has a previewUrl, assume it's an image
      // (signed URLs often lack a recognizable extension)
      !isPDF
    : false;

  return (
    <div className="w-full">
      <label className="text-sm font-bolder mb-2 block">{label}</label>
      <div
        {...getRootProps()}
        className={`relative border-2 border-dashed overflow-hidden text-center cursor-pointer transition-all ${
          isDragActive
            ? "border-primary bg-primary/10"
            : "border-border hover:border-primary/50 hover:bg-accent/50"
        } ${preview ? "p-0" : "p-6"}`}
      >
        <input {...getInputProps()} />

        {/* Preview for images */}
        {(preview || previewUrl) && isImage && (
          <div className="relative w-full h-64 group">
            <Image
              src={preview || previewUrl || ""}
              alt="Preview"
              fill
              className="object-contain"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Button
                type="button"
                variant="destructive"
                size="icon"
                onClick={removeFile}
                className="z-10"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Preview for PDFs using iframe */}
        {(preview || previewUrl) && isPDF && (
          <div className="relative w-full h-96 group">
            <iframe
              src={preview || previewUrl || ""}
              className="w-full h-full border-0"
              title="PDF Preview"
            />
            <div className="absolute top-2 right-2">
              <Button
                type="button"
                variant="destructive"
                size="icon"
                onClick={removeFile}
                className="z-10"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* File info for files without preview (non-image, non-PDF files) */}
        {file && !preview && (
          <div className="flex flex-col items-center gap-2 p-6">
            <div className="relative">
              <FileCheck className="h-10 w-10 text-primary" />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={removeFile}
                className="absolute -top-2 -right-2 h-6 w-6 bg-destructive hover:bg-destructive/90"
              >
                <X className="h-3 w-3 text-white" />
              </Button>
            </div>
            <p className="text-sm font-medium">{file.name}</p>
            <p className="text-xs text-muted-foreground">
              {(file.size / 1024).toFixed(2)} KB
            </p>
          </div>
        )}

        {/* Empty state */}
        {!file && !previewUrl && (
          <div className="flex flex-col items-center gap-2">
            <Upload className="h-10 w-10 text-muted-foreground" />
            <p className="text-sm font-medium">
              {isDragActive
                ? "Drop the file here"
                : "Drag & drop your file, or click to browse"}
            </p>
            <p className="text-xs text-muted-foreground">{helperText}</p>
          </div>
        )}
      </div>
    </div>
  );
}
