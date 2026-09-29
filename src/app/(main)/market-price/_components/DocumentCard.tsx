"use client";

import { DocumentItem } from "@/types/document";

export interface DocumentCardProps {
  doc: DocumentItem;
  isGovernment: boolean;
  onEdit: (doc: DocumentItem) => void;
  onDelete: (doc: DocumentItem) => void;
}

import { useState, useRef, useEffect } from "react";
import { useMarketPriceText } from "./marketPriceText";
import { pushToast } from "@/lib/toastStore";

export default function DocumentCard({
  doc,
  isGovernment,
  onEdit,
  onDelete,
}: DocumentCardProps) {
  const { t, fontClass } = useMarketPriceText();

  // ----------------------
  const handleDownload = async () => {
    try {
      const response = await fetch(
        `/api/download/${encodeURIComponent(doc.attachmentFileName)}`,
      );

      if (!response.ok) {
        throw new Error();
      }

      const blob = await response.blob();

      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");

      a.href = url;
      a.download = doc.attachmentFileName;

      document.body.appendChild(a);
      a.click();
      a.remove();

      URL.revokeObjectURL(url);
    } catch {
      pushToast({
        title: t("market.toast.downloadFailed.title"),
        message: t("market.toast.downloadFailed.message"),
        variant: "error",
      });
    }
  };
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div
      className={` relative flex min-h-[350px] w-full flex-col rounded-xl border border-border bg-[#FCFCFA] px-5 py-5 transition-all duration-200 hover:shadow-md pt-5 ${fontClass}`}
    >
      {/* Top content */}
      <div className="flex flex-1 flex-col">
        {isGovernment && (
          <div ref={menuRef} className="absolute right-4 top-4">
            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              className="rounded-md p-1 hover:bg-gray-100"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M11 12C11 12.5523 11.4477 13 12 13C12.5523 13 13 12.5523 13 12C13 11.4477 12.5523 11 12 11C11.4477 11 11 11.4477 11 12Z"
                  stroke="#525252"
                  strokeWidth="1.5"
                />
                <path
                  d="M11 19C11 19.5523 11.4477 20 12 20C12.5523 20 13 19.5523 13 19C13 18.4477 12.5523 18 12 18C11.4477 18 11 18.4477 11 19Z"
                  stroke="#525252"
                  strokeWidth="1.5"
                />
                <path
                  d="M11 5C11 5.55228 11.4477 6 12 6C12.5523 6 13 5.55228 13 5C13 4.44772 12.5523 4 12 4C11.4477 4 11 4.44772 11 5Z"
                  stroke="#525252"
                  strokeWidth="1.5"
                />
              </svg>
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-32 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onEdit(doc);
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50"
                >
                  {t("market.action.edit")}
                </button>

                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onDelete(doc);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                >
                  {t("market.action.delete")}
                </button>
              </div>
            )}
          </div>
        )}
        {/* Document icon */}
        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-[#EBF0F5]">
          <svg
            width="30"
            height="30"
            viewBox="0 0 30 30"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M19.04 3.04395C19.1605 2.99654 19.2953 3.01508 19.3965 3.11621C21.2456 4.96538 24.4678 8.22575 26.2695 10.04L26.2715 10.042C26.3613 10.1321 26.3728 10.2407 26.3281 10.3418C26.282 10.446 26.1814 10.5254 26.0371 10.5254C24.6236 10.5254 22.9763 10.5252 21.792 10.5127H21.7871C20.1625 10.5127 18.8497 9.21148 18.8496 7.67578V3.31348C18.8496 3.18835 18.9206 3.09106 19.04 3.04395Z"
              fill="#107446"
              stroke="#107446"
            />
            <path
              d="M10.0879 3H15.3877C15.799 3.00011 16.1377 3.33871 16.1377 3.75V7.3623C16.1377 10.6009 18.7741 13.2373 22.0127 13.2373H25.625C26.0363 13.2373 26.3749 13.576 26.375 13.9873V20.5371C26.375 22.6457 25.6432 24.2499 24.4951 25.3281C23.3421 26.4109 21.7299 27 19.9121 27H10.0879C8.27013 27 6.65787 26.4109 5.50488 25.3281C4.35683 24.2499 3.625 22.6457 3.625 20.5371V9.46289C3.625 7.3543 4.35683 5.75014 5.50488 4.67188C6.65787 3.58911 8.27013 3 10.0879 3ZM9.375 19.8125C8.58636 19.8125 7.9375 20.4614 7.9375 21.25C7.9375 22.0386 8.58636 22.6875 9.375 22.6875H14.375C15.1636 22.6875 15.8125 22.0386 15.8125 21.25C15.8125 20.4614 15.1636 19.8125 14.375 19.8125H9.375ZM9.375 14.8125C8.58636 14.8125 7.9375 15.4614 7.9375 16.25C7.9375 17.0386 8.58636 17.6875 9.375 17.6875H16.875C17.6636 17.6875 18.3125 17.0386 18.3125 16.25C18.3125 15.4614 17.6636 14.8125 16.875 14.8125H9.375Z"
              fill="#107446"
              stroke="#107446"
            />
          </svg>
        </div>

        {/* Title */}
        <h3 className="mb-2 line-clamp-2 min-h-13.5 text-[20px] font-bold leading-[1.35] text-primary-heading">
          {doc.title}
        </h3>

        {/* Date */}
        <div className="mb-3 flex items-center gap-2 text-secondary-body">
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M9.77162 2.07602V1.16602C9.77162 0.926849 9.57328 0.728516 9.33412 0.728516C9.09495 0.728516 8.89662 0.926849 8.89662 1.16602V2.04102H5.10495V1.16602C5.10495 0.926849 4.90662 0.728516 4.66745 0.728516C4.42828 0.728516 4.22995 0.926849 4.22995 1.16602V2.07602C2.65495 2.22185 1.89078 3.16102 1.77412 4.55518C1.76245 4.72435 1.90245 4.86435 2.06578 4.86435H11.9358C12.1049 4.86435 12.245 4.71852 12.2275 4.55518C12.1108 3.16102 11.3466 2.22185 9.77162 2.07602Z"
              fill="#889299"
            />
            <path
              d="M11.6667 5.74023H2.33333C2.0125 5.74023 1.75 6.00273 1.75 6.32357V9.9169C1.75 11.6669 2.625 12.8336 4.66667 12.8336H9.33333C11.375 12.8336 12.25 11.6669 12.25 9.9169V6.32357C12.25 6.00273 11.9875 5.74023 11.6667 5.74023ZM5.3725 10.6227C5.34333 10.6461 5.31417 10.6752 5.285 10.6927C5.25 10.7161 5.215 10.7336 5.18 10.7452C5.145 10.7627 5.11 10.7744 5.075 10.7802C5.03417 10.7861 4.99917 10.7919 4.95833 10.7919C4.8825 10.7919 4.80667 10.7744 4.73667 10.7452C4.66083 10.7161 4.6025 10.6752 4.54417 10.6227C4.43917 10.5119 4.375 10.3602 4.375 10.2086C4.375 10.0569 4.43917 9.90523 4.54417 9.7944C4.6025 9.7419 4.66083 9.70107 4.73667 9.6719C4.84167 9.62523 4.95833 9.61357 5.075 9.6369C5.11 9.64273 5.145 9.6544 5.18 9.6719C5.215 9.68357 5.25 9.70107 5.285 9.7244C5.31417 9.74773 5.34333 9.77107 5.3725 9.7944C5.4775 9.90523 5.54167 10.0569 5.54167 10.2086C5.54167 10.3602 5.4775 10.5119 5.3725 10.6227ZM5.3725 8.58107C5.26167 8.68607 5.11 8.75023 4.95833 8.75023C4.80667 8.75023 4.655 8.68607 4.54417 8.58107C4.43917 8.47023 4.375 8.31857 4.375 8.1669C4.375 8.01523 4.43917 7.86357 4.54417 7.75273C4.7075 7.5894 4.96417 7.5369 5.18 7.63023C5.25583 7.6594 5.32 7.70023 5.3725 7.75273C5.4775 7.86357 5.54167 8.01523 5.54167 8.1669C5.54167 8.31857 5.4775 8.47023 5.3725 8.58107ZM7.41417 10.6227C7.30333 10.7277 7.15167 10.7919 7 10.7919C6.84833 10.7919 6.69667 10.7277 6.58583 10.6227C6.48083 10.5119 6.41667 10.3602 6.41667 10.2086C6.41667 10.0569 6.48083 9.90523 6.58583 9.7944C6.80167 9.57857 7.19833 9.57857 7.41417 9.7944C7.51917 9.90523 7.58333 10.0569 7.58333 10.2086C7.58333 10.3602 7.51917 10.5119 7.41417 10.6227ZM7.41417 8.58107C7.385 8.6044 7.35583 8.62773 7.32667 8.65107C7.29167 8.6744 7.25667 8.6919 7.22167 8.70357C7.18667 8.72107 7.15167 8.73273 7.11667 8.73857C7.07583 8.7444 7.04083 8.75023 7 8.75023C6.84833 8.75023 6.69667 8.68607 6.58583 8.58107C6.48083 8.47023 6.41667 8.31857 6.41667 8.1669C6.41667 8.01523 6.48083 7.86357 6.58583 7.75273C6.63833 7.70023 6.7025 7.6594 6.77833 7.63023C6.99417 7.5369 7.25083 7.5894 7.41417 7.75273C7.51917 7.86357 7.58333 8.01523 7.58333 8.1669C7.58333 8.31857 7.51917 8.47023 7.41417 8.58107ZM9.45583 10.6227C9.345 10.7277 9.19333 10.7919 9.04167 10.7919C8.89 10.7919 8.73833 10.7277 8.6275 10.6227C8.5225 10.5119 8.45833 10.3602 8.45833 10.2086C8.45833 10.0569 8.5225 9.90523 8.6275 9.7944C8.84333 9.57857 9.24 9.57857 9.45583 9.7944C9.56083 9.90523 9.625 10.0569 9.625 10.2086C9.625 10.3602 9.56083 10.5119 9.45583 10.6227ZM9.45583 8.58107C9.42667 8.6044 9.3975 8.62773 9.36833 8.65107C9.33333 8.6744 9.29833 8.6919 9.26333 8.70357C9.22833 8.72107 9.19333 8.73273 9.15833 8.73857C9.1175 8.7444 9.07667 8.75023 9.04167 8.75023C8.89 8.75023 8.73833 8.68607 8.6275 8.58107C8.5225 8.47023 8.45833 8.31857 8.45833 8.1669C8.45833 8.01523 8.5225 7.86357 8.6275 7.75273C8.68583 7.70023 8.74417 7.6594 8.82 7.63023C8.925 7.58357 9.04167 7.5719 9.15833 7.59523C9.19333 7.60107 9.22833 7.61273 9.26333 7.63023C9.29833 7.6419 9.33333 7.6594 9.36833 7.68273C9.3975 7.70607 9.42667 7.7294 9.45583 7.75273C9.56083 7.86357 9.625 8.01523 9.625 8.1669C9.625 8.31857 9.56083 8.47023 9.45583 8.58107Z"
              fill="#889299"
            />
          </svg>

          <span className="text-[14px] font-medium">{doc.date}</span>
        </div>

        {/* Description */}
        <p className="line-clamp-3 min-h-18.5 text-[16px] leading-[1.65] text-description-text font-light">
          {doc.description}
        </p>
      </div>

      {/* Download button */}
      <div className=" mt-auto pt-3 flex justify-end ">
        <button
          onClick={handleDownload}
          className="group flex h-9.5 w-32.75 items-center justify-center gap-2 rounded-[10px] border border-primary bg-transparent text-[14px] font-semibold text-primary transition-all duration-200 hover:bg-primary hover:text-white active:scale-95 hover:cursor-pointer"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M5.37891 1.83398H8.20605C8.29656 1.83401 8.37305 1.91046 8.37305 2.00098V3.92773C8.37327 5.78366 9.8833 7.2939 11.7393 7.29395H13.666C13.7565 7.29395 13.833 7.37041 13.833 7.46094V10.9541C13.833 12.0214 13.4636 12.8126 12.9033 13.3389C12.338 13.8696 11.5385 14.167 10.6191 14.167H5.37891C4.45954 14.1669 3.65993 13.8697 3.09473 13.3389C2.53443 12.8126 2.16604 12.0214 2.16602 10.9541V5.04688C2.16612 3.97999 2.53467 3.1893 3.09473 2.66309C3.65993 2.13224 4.45954 1.83408 5.37891 1.83398ZM6.49902 6.50098C5.9497 6.50115 5.49902 6.95161 5.49902 7.50098V9.2168C5.17918 9.10736 4.8138 9.16343 4.54102 9.38574L4.46582 9.4541C4.07744 9.84266 4.07744 10.4786 4.46582 10.8672L5.79883 12.2012L5.7998 12.1992C5.81612 12.2159 5.82952 12.2315 5.84277 12.2422C5.90763 12.302 5.99842 12.3693 6.10938 12.416V12.418C6.11632 12.4211 6.12386 12.4229 6.13086 12.4258C6.13288 12.4266 6.13468 12.4279 6.13672 12.4287V12.4277C6.25034 12.4744 6.37005 12.5009 6.49902 12.501C6.63804 12.501 6.76729 12.4718 6.88867 12.418L6.8877 12.416C7.01475 12.3655 7.12441 12.2896 7.20605 12.208L8.54004 10.874C8.9041 10.5096 8.92626 9.92757 8.60742 9.53613L8.54004 9.45996L8.46387 9.39258C8.18897 9.16867 7.82056 9.11369 7.49902 9.22656V7.50098C7.49902 6.9515 7.0485 6.50098 6.49902 6.50098Z"
              fill="#107446"
              stroke="#107446"
              className="fill-primary stroke-primary transition-colors duration-200 group-hover:fill-white group-hover:stroke-white"
            />
            <path
              d="M13.7061 5.37891C12.9958 5.37887 12.2062 5.38013 11.626 5.37402H11.6201C10.8765 5.37385 10.2872 4.77772 10.2871 4.09375V1.93359C11.2379 2.88565 12.7612 4.42684 13.7061 5.37891Z"
              fill="#107446"
              stroke="#107446"
              className="fill-primary stroke-primary transition-colors duration-200 group-hover:fill-white group-hover:stroke-white"
            />
          </svg>
          {t("market.action.download")}
        </button>
      </div>
    </div>
  );
}
