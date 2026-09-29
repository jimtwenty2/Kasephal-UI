"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { uploadAttachmentAction } from "@/action/upload.action";
import { uploadIdentityDocumentAction } from "../action-components/uploadIdentityDocumentAction";
import { pushToast } from "@/lib/toastStore";

type DocumentType = "ID_CARD" | "PASSPORT";

interface FormState {
  documentType: DocumentType;
  frontFile: File | null;
  backFile: File | null;
}

interface FormErrors {
  frontFile?: string;
  backFile?: string;
  submit?: string;
}

const DOCUMENT_TYPES: { value: DocumentType; label: string }[] = [
  { value: "ID_CARD", label: "National ID Card" },
  { value: "PASSPORT", label: "Passport" },
];

const INITIAL_FORM: FormState = {
  documentType: "ID_CARD",
  frontFile: null,
  backFile: null,
};

function UploadIcon({ side }: { side: "front" | "back" }) {
  return (
    <svg
      width="36"
      height="36"
      viewBox="0 0 36 36"
      fill="none"
      className="mb-2"
    >
      <rect width="36" height="36" rx="10" fill="#FEF3DC" />
      {side === "front" ? (
        <>
          <rect
            x="9"
            y="13"
            width="18"
            height="12"
            rx="2"
            stroke="#E8A020"
            strokeWidth="1.5"
          />
          <circle cx="13" cy="17" r="2" fill="#E8A020" />
          <path
            d="M9 22l4-3 3 2 3-3 5 4"
            stroke="#E8A020"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      ) : (
        <>
          <rect
            x="9"
            y="13"
            width="18"
            height="12"
            rx="2"
            stroke="#E8A020"
            strokeWidth="1.5"
          />
          <path
            d="M9 18h18"
            stroke="#E8A020"
            strokeWidth="1.2"
            strokeDasharray="2 2"
          />
          <path
            d="M12 21h8M12 23h5"
            stroke="#E8A020"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </>
      )}
    </svg>
  );
}

interface UploadZoneProps {
  label: string;
  side: "front" | "back";
  file: File | null;
  onFileChange: (file: File) => void;
  error?: string;
}

function UploadZone({
  label,
  side,
  file,
  onFileChange,
  error,
}: UploadZoneProps) {
  const [dragging, setDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let objectUrl: string | null = null;
    const timeoutId = window.setTimeout(() => {
      if (!file) {
        setPreviewUrl(null);
        return;
      }

      objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [file]);

  const processFile = useCallback(
    (incoming: File | undefined) => {
      if (!incoming || !incoming.type.startsWith("image/")) return;
      if (incoming.size > 10 * 1024 * 1024) return;
      onFileChange(incoming);
    },
    [onFileChange],
  );

  return (
    <div className="flex-1 min-w-0">
      <p className="text-[13px] font-semibold text-[#2D5016] mb-1.5">
        {label} <span className="text-red-500">*</span>
      </p>

      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          processFile(e.dataTransfer.files[0]);
        }}
        className={[
          "relative flex items-center justify-center h-36 rounded-xl cursor-pointer",
          "transition-all duration-150 overflow-hidden",
          previewUrl
            ? "border border-[#E8A020]/40 bg-[#FFFAF0]"
            : "border-[1.5px] border-dashed bg-[#FFFDF7]",
          dragging
            ? "border-[#E8A020] bg-[#FEF3DC]"
            : previewUrl
              ? ""
              : "border-[#C8D5B0] hover:border-[#E8A020] hover:bg-[#FEF3DC]/50",
          error ? "border-red-400 bg-red-50/30" : "",
        ].join(" ")}
      >
        {previewUrl ? (
          <>
            <img
              src={previewUrl}
              alt={`${label} preview`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/40 transition-all group">
              <span className="text-white text-xs font-semibold bg-black/50 px-3 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                Replace
              </span>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center text-center px-3">
            <UploadIcon side={side} />
            <span className="text-[13px] font-semibold text-[#2D5016]">
              Upload front image
            </span>
            <span className="text-[11.5px] text-[#7A9A5A] mt-0.5">
              Drag and drop your image here, or click to browse
            </span>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => processFile(e.target.files?.[0])}
        />
      </div>

      {error && (
        <p className="mt-1 text-xs font-medium text-red-500">{error}</p>
      )}
    </div>
  );
}

interface IdentityDocumentModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function IdentityDocumentModal({
  open,
  onClose,
  onSuccess,
}: IdentityDocumentModalProps) {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const validate = (): FormErrors => {
    const e: FormErrors = {};
    if (!form.frontFile) e.frontFile = "Front image is required";
    if (form.documentType === "ID_CARD" && !form.backFile)
      e.backFile = "Back image is required";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      // Step 1: upload front image
      const frontFormData = new FormData();
      frontFormData.append("file", form.frontFile!);

      const frontUpload = await uploadAttachmentAction(frontFormData);
      if (!frontUpload.success || !frontUpload.fileName) {
        throw new Error(frontUpload.error ?? "Front image upload failed");
      }

      // Step 2: upload back image (ID_CARD only)
      let backFileName = "";
      if (form.documentType === "ID_CARD" && form.backFile) {
        const backFormData = new FormData();
        backFormData.append("file", form.backFile);

        const backUpload = await uploadAttachmentAction(backFormData);
        if (!backUpload.success || !backUpload.fileName) {
          throw new Error(backUpload.error ?? "Back image upload failed");
        }
        backFileName = backUpload.fileName;
      }

      // Step 3: submit identity document
      const result = await uploadIdentityDocumentAction({
        documentType: form.documentType,
        frontImageUrl: frontUpload.fileName,
        backImageUrl: backFileName,
      });

      if (!result.success) {
        throw new Error(result.error ?? "Upload identity document failed");
      }

      pushToast({
        title: "Identity document submitted",
        message: "Your document was uploaded successfully.",
        variant: "success",
      });
      setSubmitted(true);
      onSuccess?.();
    } catch (error) {
      setErrors({
        submit:
          error instanceof Error
            ? error.message
            : "Something went wrong. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    onClose();
    setTimeout(() => {
      setForm(INITIAL_FORM);
      setErrors({});
      setSubmitted(false);
    }, 200);
  };

  if (!open) return null;
  const getFileErrorMessage = (message: string) => {
    return message.replace(/\s*Allowed documents:.*/i, "");
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{
        background: "rgba(15,25,10,0.55)",
        backdropFilter: "blur(4px)",
      }}
    >
      <div
        className="w-full max-w-[560px] bg-white rounded-[18px] overflow-hidden shadow-2xl"
        style={{ animation: "slideUp 0.22s ease-out" }}
      >
        {/* Header */}
        <div
          className="flex items-start justify-between px-7 pt-6 pb-5 border-b"
          style={{ borderColor: "#E8F0D8" }}
        >
          <div>
            <p className="text-[11px] font-semibold tracking-widest uppercase text-[#E8A020] mb-0.5">
              Id Verification
            </p>
            <h2 className="text-[19px] font-bold text-[#2D5016] tracking-tight">
              Verify Your Identity
            </h2>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            aria-label="Close"
            className="w-[34px] h-[34px] flex items-center justify-center rounded-lg text-[#2D5016] hover:bg-[#F5F0E8] transition-colors disabled:opacity-50"
            style={{ background: "#EEF3E8" }}
          >
            ✕
          </button>
        </div>

        {/* Success state */}
        {submitted ? (
          <div className="flex flex-col items-center text-center px-8 py-12 gap-3">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mb-2"
              style={{ background: "#E8A020" }}
            >
              <span className="text-white text-3xl">✓</span>
            </div>
            <h3 className="text-xl font-bold text-[#2D5016]">
              Document Submitted
            </h3>
            <p className="text-sm text-[#7A9A5A] leading-relaxed max-w-sm mb-4">
              Your{" "}
              {DOCUMENT_TYPES.find((d) => d.value === form.documentType)?.label}{" "}
              has been uploaded successfully.
            </p>
            <button
              onClick={handleClose}
              className="px-6 py-2.5 text-white rounded-lg text-sm font-semibold transition-colors"
              style={{ background: "#E8A020" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#D4911A")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "#E8A020")
              }
            >
              Done
            </button>
          </div>
        ) : (
          <div className="px-7 py-6 flex flex-col gap-5">
            {/* Document type toggle */}
            <div>
              <p className="text-[13px] font-semibold text-[#2D5016] mb-2">
                Select Document Type <span className="text-red-500">*</span>
              </p>
              <div
                className="flex gap-1.5 rounded-xl p-1"
                style={{ background: "#EEF3E8" }}
              >
                {DOCUMENT_TYPES.map((dt) => (
                  <button
                    key={dt.value}
                    type="button"
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        documentType: dt.value,
                        backFile: null,
                      }))
                    }
                    className="flex-1 py-2 px-2.5 rounded-lg text-[13px] font-medium transition-all duration-150"
                    style={
                      form.documentType === dt.value
                        ? {
                            background: "#E8A020",
                            color: "#ffffff",
                            fontWeight: 600,
                            boxShadow: "0 1px 4px rgba(232,160,32,0.25)",
                          }
                        : { color: "#4A7A2A" }
                    }
                  >
                    {dt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Upload zones */}
            <div className="flex gap-3.5">
              <UploadZone
                label="Front of Document"
                side="front"
                file={form.frontFile}
                error={errors.frontFile}
                onFileChange={(file) => {
                  setForm((prev) => ({ ...prev, frontFile: file }));
                  setErrors((prev) => ({ ...prev, frontFile: undefined }));
                }}
              />
              {form.documentType === "ID_CARD" && (
                <UploadZone
                  label="Back of Document"
                  side="back"
                  file={form.backFile}
                  error={errors.backFile}
                  onFileChange={(file) => {
                    setForm((prev) => ({ ...prev, backFile: file }));
                    setErrors((prev) => ({ ...prev, backFile: undefined }));
                  }}
                />
              )}
            </div>

            <div className="text-xs text-[#7A9A5A] leading-relaxed">
              Accepted formats: PNG, JPEG, JPG. Maximum file size: 10 MB. Please
              make sure all text and details are clear and readable.
            </div>

            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2.5 text-sm text-red-600">
                {getFileErrorMessage(errors.submit)}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2.5 justify-end pt-1">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="px-5 py-2.5 rounded-[9px] text-sm font-semibold transition-colors disabled:opacity-50"
                style={{
                  border: "1px solid #C8D5B0",
                  color: "#4A7A2A",
                  background: "transparent",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#EEF3E8")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="px-5 py-2.5 text-white rounded-[9px] text-sm font-semibold transition-colors disabled:opacity-60"
                style={{ background: "#E8A020" }}
                onMouseEnter={(e) =>
                  !loading && (e.currentTarget.style.background = "#D4911A")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "#E8A020")
                }
              >
                {loading ? "Uploading..." : "Submit For Review"}
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(16px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
