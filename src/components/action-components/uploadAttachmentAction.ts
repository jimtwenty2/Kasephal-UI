"use server";

import { uploadAttachment } from "@/services/upload.service";

export async function uploadAttachmentAction(file: File) {
    return await uploadAttachment(file);
}