"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash } from "lucide-react";
import { deleteCropProductAction } from "@/action/crop-product.action";
import { showApiError, showApiSuccess } from "@/lib/apiToast";
import DeleteConfirmationModal from "./DeleteConfirmationModal";

type DeleteButtonProps = {
  cropProductId?: string;
  productName?: string;
  currentUserId?: string;
  productOwnerId?: string;
  userId?: string;
};

const buttonClass =
  "flex w-full items-center justify-center gap-2 rounded-xl bg-[#F6B941] px-5 py-3 text-xs font-bold text-[#1D2939] shadow-xs transition-transform hover:bg-[#e0a634] active:scale-[0.99] sm:w-auto";

export default function DeleteButton({
  cropProductId,
  productName,
  currentUserId,
  productOwnerId,
  userId,
}: DeleteButtonProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Check if current user is the owner of the product
  // Use userId first (from JWT), fallback to currentUserId
  const effectiveUserId = userId || currentUserId;
  const isOwner = effectiveUserId && productOwnerId && effectiveUserId === productOwnerId;

  const handleDelete = async () => {
    if (!cropProductId) return;

    // Double-check ownership before deletion
    if (!isOwner) {
      showApiError(
        new Error("Unauthorized"),
        "You are not authorized to delete this product.",
      );
      return;
    }

    setIsDeleting(true);
    try {
      const result = await deleteCropProductAction(cropProductId);

      if (result.success) {
        showApiSuccess(
          "Product Deleted",
          "Your crop product has been successfully deleted.",
        );
        setIsModalOpen(false);
        router.push("/crop-product-management");
        router.refresh();
      } else {
        showApiError(
          new Error(result.error || "Failed to delete product"),
          "Unable to delete the product. Please try again.",
        );
      }
    } catch (error) {
      showApiError(
        error,
        "An unexpected error occurred while deleting the product.",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  // Hide button if not owner
  if (!isOwner) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        className={buttonClass}
        onClick={() => setIsModalOpen(true)}
        disabled={isDeleting}
      >
        <Trash size={16} />
        Delete
      </button>

      <DeleteConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleDelete}
        productName={productName}
        isDeleting={isDeleting}
      />
    </>
  );
}
