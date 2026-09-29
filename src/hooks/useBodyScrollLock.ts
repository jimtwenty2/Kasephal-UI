"use client";

import { useEffect } from "react";

let lockCount = 0;
let previousBodyOverflow = "";
let previousHtmlOverflow = "";
let previousPaddingRight = "";
let lockedContainers: { el: HTMLElement; previousOverflow: string }[] = [];

export function useBodyScrollLock(isLocked: boolean) {
  useEffect(() => {
    if (!isLocked) return;

    if (lockCount === 0) {
      const body = document.body;
      const html = document.documentElement;

      previousBodyOverflow = body.style.overflow;
      previousHtmlOverflow = html.style.overflow;
      previousPaddingRight = body.style.paddingRight;

      const scrollbarWidth = window.innerWidth - html.clientWidth;

      html.style.overflow = "hidden";
      body.style.overflow = "hidden";
      if (scrollbarWidth > 0) {
        body.style.paddingRight = `${scrollbarWidth}px`;
      }

      lockedContainers = Array.from(
        document.querySelectorAll<HTMLElement>("[data-scroll-lock]"),
      ).map((el) => {
        const previousOverflow = el.style.overflow;
        el.style.overflow = "hidden";
        return { el, previousOverflow };
      });
    }

    lockCount += 1;

    return () => {
      lockCount = Math.max(0, lockCount - 1);

      if (lockCount === 0) {
        document.body.style.overflow = previousBodyOverflow;
        document.documentElement.style.overflow = previousHtmlOverflow;
        document.body.style.paddingRight = previousPaddingRight;
        lockedContainers.forEach(({ el, previousOverflow }) => {
          el.style.overflow = previousOverflow;
        });
        lockedContainers = [];
      }
    };
  }, [isLocked]);
}
