"use server";

import { requireGovernmentContentManager } from "@/lib/roleGuards";
import { revalidatePath } from "next/cache";

import { updateOfficialDocument } from "@/services/official-document.service";

export async function updateOfficialDocumentAction(
  id: string,
  title: string,
  description: string,
  existingFileName: string,
) {
  try {
    await requireGovernmentContentManager();

    const payload = {
      title,
      description,
      fileName: [
        {
          fileName: existingFileName,
        },
      ],
    };

    const result = await updateOfficialDocument(id, payload);

    revalidatePath("/market-price");

    return {
      success: true,
      payload: result,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update document",
    };
  }
}
