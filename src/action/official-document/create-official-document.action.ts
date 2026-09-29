"use server";

import { requireGovernmentContentManager } from "@/lib/roleGuards";
import { revalidatePath } from "next/cache";

import { uploadAttachment } from "@/services/upload.service";
import { createOfficialDocument } from "@/services/official-document.service";

export async function createOfficialDocumentAction(
  prevState: unknown,
  formData: FormData,
) {
  try {
    await requireGovernmentContentManager();

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const file = formData.get("file") as File;

    const IMAGE_TYPES = ["image/png", "image/jpeg"];

    const DOCUMENT_TYPES = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];

    if (!file || file.size === 0) {
      throw new Error("Please select a file");
    }
    const isImage = IMAGE_TYPES.includes(file.type);
    const isDocument = DOCUMENT_TYPES.includes(file.type);

    if (!isImage && !isDocument) {
      throw new Error("Unsupported file type");
    }

    if (isImage && file.size > 25 * 1024 * 1024) {
      throw new Error("Images must be under 25 MB");
    }

    if (isDocument && file.size > 100 * 1024 * 1024) {
      throw new Error("Documents must be under 100 MB");
    }

    if (!title?.trim()) {
      throw new Error("Title is required");
    }

    if (!description?.trim()) {
      throw new Error("Description is required");
    }

    
    const uploadResult = await uploadAttachment(file);
   

    if (!uploadResult.success || !uploadResult.fileName) {
      throw new Error(uploadResult.error ?? "Failed to upload file");
    }

    
    await createOfficialDocument({
      title,
      description,
      fileName: [
        {
          fileName: uploadResult.fileName,
        },
      ],
    });

    revalidatePath("/market-price");

    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create document",
    };
  }
}
