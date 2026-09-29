"use server";

import { uploadFileService } from "@/services/auth/identity-document.service";

export type UploadFileActionResult =
  | {
      success: true;
      fileName: string;
    }
  | {
      success: false;
      error: string;
    };

export async function uploadFileAction(
  file: File,
  profileSetupToken: string,
): Promise<UploadFileActionResult> {
  try {
    const fileName = await uploadFileService(file,profileSetupToken);

    return {
      success: true,
      fileName,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to upload file",
    };
  }
}