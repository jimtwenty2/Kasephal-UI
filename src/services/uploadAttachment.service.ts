"use server";

import { env } from "@/lib/env";
import { auth } from "@/auth";

export interface UploadedFile {
  fileName: string;
  fileSize: string;
  fileUrl: string;
}

/**
 * Uploads a file to POST /uploads/attachment and returns the first stored file.
 * The endpoint is multipart/form-data with a `file` field, so we set the
 * Authorization header manually and let fetch add the multipart boundary
 * (headerToken() can't be reused here — it hardcodes application/json).
 */
export async function uploadAttachment(
  formData: FormData,
): Promise<UploadedFile> {
  const session = await auth();
  const accessToken = session?.user?.accessToken;

  if (!accessToken) {
    throw new Error("User is not authenticated");
  }

  const res = await fetch(`${env.NEXT_BASE_API_URL}/uploads/attachment`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: formData,
    cache: "no-store",
  });

  const data = await res.json().catch(() => null);

  if (!res.ok || data?.success === false) {
    throw new Error(
      data?.message || data?.detail || "Failed to upload image.",
    );
  }

  const file = Array.isArray(data?.payload) ? data.payload[0] : null;

  if (!file?.fileUrl && !file?.fileName) {
    throw new Error("Upload succeeded but no file URL was returned.");
  }

  return file as UploadedFile;
}
