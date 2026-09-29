"use client";

import { X } from "lucide-react";
import { useEffect, useRef } from "react";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { formatCurrency } from "@/utils/formatCurrency";
import { useI18n } from "@/lib/i18n/I18nContext";

interface KhqrModalProps {
  isOpen: boolean;
  amount: number;
  currencyCode: "USD" | "KHR";
  qrPayload: string;
  expiresIn: string;
  isExpired: boolean;
  onClose: () => void;
}

const TEXT = {
  payment: { en: "Payment", kh: "ការទូទាត់" },
  close: { en: "Close", kh: "បិទ" },
  amount: { en: "Amount", kh: "ចំនួនទឹកប្រាក់" },
  qrCodeExpired: { en: "QR Code Expired", kh: "QR Code បានផុតកំណត់" },
  closeAndGenerate: {
    en: "Close and generate a new one.",
    kh: "បិទ ហើយបង្កើតថ្មីម្តងទៀត។",
  },
  expiresIn: { en: "Expires in", kh: "ផុតកំណត់នៅក្នុង" },
  scanBeforeTimerEnds: {
    en: "Scan before timer ends",
    kh: "សូមស្កេនមុនពេលម៉ោងផុតកំណត់",
  },
  scanToPay: { en: "Scan to Pay", kh: "ស្កេនដើម្បីទូទាត់" },
  scanWithBankingApp: {
    en: "Scan with any banking app that supports",
    kh: "ស្កេនជាមួយកម្មវិធីធនាគារណាមួយដែលគាំទ្រ",
  },
} as const;

type Language = keyof (typeof TEXT)[keyof typeof TEXT];
type TextKey = keyof typeof TEXT;

function getText(language: Language) {
  return (key: TextKey) => TEXT[key][language] ?? TEXT[key].en;
}

function KHQRLogoWhite() {
  return (
    <svg
      width="166"
      height="40"
      viewBox="0 0 166 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-[28px] w-auto"
      aria-label="KHQR"
    >
      <path d="M107.798 14.5845V26.9495H95.4329C94.1647 26.9495 93.2136 25.9191 93.2136 24.7302V14.5845C93.2136 13.3163 94.244 12.3651 95.4329 12.3651H105.499C106.847 12.3651 107.798 13.3163 107.798 14.5845Z" fill="white" />
      <path d="M165.739 19.578H159.557C159.557 12.2065 153.533 6.18253 146.161 6.18253C140.296 6.18253 135.144 9.98717 133.4 15.5356C133.004 16.8831 132.766 18.2305 132.766 19.578V39.2353H132.607C129.278 39.2353 126.583 36.5404 126.583 33.2113V19.578H126.663C126.663 14.1881 128.882 9.03601 132.845 5.31064C136.491 1.90232 141.247 0 146.241 0C157.02 0 165.739 8.79822 165.739 19.578Z" fill="white" />
      <path d="M165.819 39.2353L157.1 39.3146L154.96 37.1745L150.204 32.4187L143.625 25.8398H152.344L165.819 39.2353Z" fill="white" />
      <path d="M109.859 33.132H91.232C88.9333 33.132 87.1103 31.309 87.1103 29.0103V10.3042C87.1103 8.00559 88.9333 6.18253 91.232 6.18253H109.859C112.157 6.18253 113.981 8.00559 113.981 10.3042V28.9311L120.163 35.1136V6.02401C120.163 2.69495 117.468 0 114.139 0H86.9517C83.6227 0 80.9277 2.69495 80.9277 6.02401V33.2113C80.9277 36.5404 83.6227 39.2353 86.9517 39.2353H116.041L109.859 33.132Z" fill="white" />
      <path d="M34.1625 39.3146H25.4435L7.21295 21.0048V39.3146H0V0H7.21295V17.5172L24.6509 0H33.2906L14.2674 18.8647L34.1625 39.3146Z" fill="white" />
      <path d="M66.7397 0H73.7941V39.3146H66.7397V22.1937H46.6068V39.2353H39.5524V0H46.6068V16.4075H66.7397V0Z" fill="white" />
    </svg>
  );
}

function QRFromString({ value }: { value: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function draw() {
      const QRCode = await import("qrcode");

      if (cancelled || !canvasRef.current) return;

      await QRCode.toCanvas(canvasRef.current, value, {
        errorCorrectionLevel: "M",
        margin: 2,
        width: 210,
        color: { dark: "#000000", light: "#FFFFFF" },
      });
    }

    draw();

    return () => {
      cancelled = true;
    };
  }, [value]);

  return <canvas ref={canvasRef} className="h-[210px] w-[210px]" />;
}

function CornerFrame() {
  const base = "absolute h-[34px] w-[34px] border-[#C8C8C8]";

  return (
    <>
      <div
        className={`${base} left-0 top-0 rounded-tl-[14px] border-l-[3px] border-t-[3px]`}
      />
      <div
        className={`${base} right-0 top-0 rounded-tr-[14px] border-r-[3px] border-t-[3px]`}
      />
      <div
        className={`${base} bottom-0 left-0 rounded-bl-[14px] border-b-[3px] border-l-[3px]`}
      />
      <div
        className={`${base} bottom-0 right-0 rounded-br-[14px] border-b-[3px] border-r-[3px]`}
      />
    </>
  );
}

function parseSeconds(formatted: string): number {
  const parts = formatted.split(":");
  const m = parseInt(parts[0] ?? "0", 10);
  const s = parseInt(parts[1] ?? "0", 10);

  return m * 60 + s;
}

const TOTAL_SECONDS = 300;

export default function KhqrModal({
  isOpen,
  amount,
  currencyCode,
  qrPayload,
  expiresIn,
  isExpired,
  onClose,
}: KhqrModalProps) {
  const { language } = useI18n();
  const t = getText(language as Language);

  useBodyScrollLock(isOpen);

  if (!isOpen) return null;

  const remaining = parseSeconds(expiresIn);
  const progressPct = Math.max(
    0,
    Math.min(100, (remaining / TOTAL_SECONDS) * 100),
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-[400px] overflow-hidden rounded-[24px] bg-white shadow-[0_24px_72px_rgba(15,23,42,0.18)] transition-all duration-300">
        <div className="flex h-14 items-center justify-between bg-[#E51C2A] px-6">
          <KHQRLogoWhite />

          <div className="flex items-center gap-3">
            <div className="rounded-full bg-white/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-white ring-1 ring-white/10">
              {t("payment")}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-white/80 transition-colors hover:bg-white/30 hover:text-white"
              aria-label={t("close")}
            >
              <X size={15} />
            </button>
          </div>
        </div>

        <div className="px-6 pb-4 pt-4">
          <div className="border-b border-[#E8E8E8] pb-2.5 text-center">
            <h2 className="text-[19px] font-semibold leading-tight tracking-[0.02em] text-[#111111]">
              Kasephal
            </h2>
            <p className="mt-0.5 text-[12px] font-medium text-[#6F6F6F]">
              Phnom Penh
            </p>
          </div>

          <div className="pt-2.5 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9A9A9A]">
              {t("amount")}
            </p>
            <p className="mt-0.5 text-[36px] font-bold leading-none tracking-[0.01em] text-[#111111]">
              {formatCurrency(amount, currencyCode)}
            </p>
          </div>

          <div className="mx-auto mt-3 w-fit rounded-[18px] border border-[#EEEEEE] bg-white p-2.5 shadow-[0_10px_32px_rgba(15,23,42,0.09)]">
            <div className="relative flex h-[228px] w-[228px] items-center justify-center bg-white">
              {isExpired && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-2xl bg-white/95 text-center">
                  <p className="text-[15px] font-bold text-[#E51C2A]">
                    {t("qrCodeExpired")}
                  </p>
                  <p className="mt-1 text-[11px] text-[#777777]">
                    {t("closeAndGenerate")}
                  </p>
                </div>
              )}

              <CornerFrame />
              <QRFromString value={qrPayload || "KHQR"} />
            </div>
          </div>

          {!isExpired && (
            <div className="mt-3 rounded-[12px] bg-[#F7F7F7] px-3.5 py-2">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-white text-[#E51C2A] shadow-sm">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden="true"
                    >
                      <circle
                        cx="12"
                        cy="12"
                        r="9"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                      <path
                        d="M12 7v5l3 2"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>

                  <div>
                    <p className="text-[11px] font-semibold text-[#222222]">
                      {t("expiresIn")}
                    </p>
                    <p className="text-[10px] font-medium text-[#777777]">
                      {t("scanBeforeTimerEnds")}
                    </p>
                  </div>
                </div>

                <p className="text-[18px] font-semibold tabular-nums text-[#E51C2A]">
                  {expiresIn}
                </p>
              </div>

              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#E1E1E1]">
                <div
                  className="h-full rounded-full bg-[#E51C2A] transition-all duration-1000"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          )}

          <div className="mt-3 border-t border-[#E8E8E8] pt-3 text-center">
            <p className="text-[13px] font-semibold text-[#111111]">
              {t("scanToPay")}
            </p>
            <p className="mt-0.5 text-[11px] font-medium text-[#777777]">
              {t("scanWithBankingApp")}{" "}
              <span className="font-semibold text-[#E51C2A]">KHQR</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}