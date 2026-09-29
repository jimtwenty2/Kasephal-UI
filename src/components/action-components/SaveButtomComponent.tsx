"use client";

// import { CropDemandPost } from "@/types/crop-demand";
import React, { useState } from "react";
import {
  addFavoriteAction,
  deleteFavoriteAction,
} from "@/action/favorite.action";
import { showApiSuccess, showApiToast } from "@/lib/apiToast";

interface SaveIconProps {
  isFavorite: boolean;
  color?: "primary" | "secondary" | "white";
}

const SaveIcon = ({ isFavorite, color = "white" }: SaveIconProps) => {
  const getColor = () => {
    if (isFavorite) return "#F9C156";

    switch (color) {
      case "primary":
        return "#16A34A"; // green
      case "secondary":
        return "#667085"; // gray
      case "white":
      default:
        return "#F6FBF0";
    }
  };

  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M16.8203 2H7.18031C5.05031 2 3.32031 3.74 3.32031 5.86V19.95C3.32031 21.75 4.61031 22.51 6.19031 21.64L11.0703 18.93C11.5903 18.64 12.4303 18.64 12.9403 18.93L17.8203 21.64C19.4003 22.52 20.6903 21.76 20.6903 19.95V5.86C20.6803 3.74 18.9503 2 16.8203 2ZM14.5003 11.4H9.50031C9.09031 11.4 8.75031 11.06 8.75031 10.65C8.75031 10.24 9.09031 9.9 9.50031 9.9H14.5003C14.9103 9.9 15.2503 10.24 15.2503 10.65C15.2503 11.06 14.9103 11.4 14.5003 11.4Z"
        fill={getColor()}
      />
    </svg>
  );
};

function SaveSpinner({ color = "white" }: { color?: "primary" | "secondary" | "white" }) {
  const spinnerColor =
    color === "primary" ? "text-primary" : color === "secondary" ? "text-secondary-body" : "text-white";

  return (
    <span
      className={`h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent ${spinnerColor}`}
      aria-hidden="true"
    />
  );
}

interface SaveButtonComponentProps {
  // data: CropDemandPost;
  postId?: string;
  initialFavorite?: boolean;
  color?: "primary" | "secondary" | "white";
}

export default function SaveButtonComponent({
  //data,
  postId,
  initialFavorite = false,
  color = "white",
}: SaveButtonComponentProps) {
  const [isFavorite, setIsFavorite] = useState(initialFavorite);
  const [isSaving, setIsSaving] = useState(false);

  const handleFavoriteClick = async (
    e: React.MouseEvent<HTMLButtonElement>,
  ) => {
    e.stopPropagation();

    if (!postId || isSaving) return;

    const nextFavorite = !isFavorite;

    setIsFavorite(nextFavorite);
    setIsSaving(true);

    const result = nextFavorite
      ? await addFavoriteAction(postId)
      : await deleteFavoriteAction(postId);

    setIsSaving(false);

    if (!result.success) {
      setIsFavorite(!nextFavorite);
      showApiToast(result, {
        successTitle: "Saved",
        errorTitle: "Favorite failed",
        errorMessage: "Failed to update favorite.",
      });
      return;
    }

    showApiSuccess(
      nextFavorite ? "Saved to favorites" : "Removed from favorites",
      nextFavorite
        ? "This post has been added to your saved list."
        : "This post has been removed from your saved list.",
    );
  };

  return (
    <button
      onClick={handleFavoriteClick}
      disabled={isSaving}
      aria-busy={isSaving}
      aria-label={isFavorite ? "Remove from favorites" : "Save to favorites"}
      className="
        rounded-[8px] transition-all flex items-center justify-center
        w-[44px] h-[44px] p-[11px] border hover:scale-105
        border-none bg-no-repeat disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:scale-100
      "
    >
      {isSaving ? (
        <SaveSpinner color={color} />
      ) : (
        <SaveIcon isFavorite={isFavorite} color={color} />
      )}
    </button>
  );
}
