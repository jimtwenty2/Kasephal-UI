"use server";

import {
  deleteFiles,
  uploadAttachment,
  type DeleteFilesResult,
  type UploadAttachmentResult,
} from "@/services/upload.service";

export async function uploadAttachmentAction(formData: FormData): Promise<UploadAttachmentResult> {
  return uploadAttachment(formData);
}

export async function deleteFilesAction(fileNames: string[]): Promise<DeleteFilesResult> {
  return deleteFiles(fileNames);
}

