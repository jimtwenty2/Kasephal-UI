"use client";

import { RefObject, useEffect } from "react";

type DismissibleDropdownOptions = {
  open: boolean;
  containerRef: RefObject<HTMLElement | null>;
  additionalRefs?: RefObject<HTMLElement | null>[];
  onClose: () => void;
};

export function useDismissibleDropdown({
  open,
  containerRef,
  additionalRefs = [],
  onClose,
}: DismissibleDropdownOptions) {
  useEffect(() => {
    if (!open) return;

    function isInsideDropdown(target: EventTarget | null) {
      if (!(target instanceof Node)) return false;

      return (
        containerRef.current?.contains(target) ||
        additionalRefs.some((ref) => ref.current?.contains(target))
      );
    }

    function handlePointerDown(event: PointerEvent) {
      if (isInsideDropdown(event.target)) return;
      onClose();
    }

    function handleFocusIn(event: FocusEvent) {
      if (isInsideDropdown(event.target)) return;
      onClose();
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    function handleScroll(event: Event) {
      if (isInsideDropdown(event.target)) return;
      onClose();
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("focusin", handleFocusIn);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("scroll", handleScroll, true);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("focusin", handleFocusIn);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [additionalRefs, containerRef, onClose, open]);
}
