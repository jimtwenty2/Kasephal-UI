"use server";

import { requireGovernmentContentManager } from "@/lib/roleGuards";
import { revalidatePath } from "next/cache";

import { deleteOfficialDocument } from "@/services/official-document.service";

export async function deleteOfficialDocumentAction(id: string) {
  try {
    await requireGovernmentContentManager();

    await deleteOfficialDocument(id);

    revalidatePath("/market-price");

    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to delete document",
    };
  }
}
