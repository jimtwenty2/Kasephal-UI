"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { UserIcon } from "@heroicons/react/24/outline";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { pushToast } from "@/lib/toastStore";
import FormHeader from "./FormHeader";
import SubmitButton from "./SubmitButton";

import {
  IdentityDocumentSchema,
  identityDocumentSchema,
} from "@/schema/identity.schema";
import { uploadFileAction } from "@/action/auth/upload-file.action";
import { uploadIdentityDocumentAction } from "@/action/auth/identity-document.action";
import { skipIdentityVerificationAction } from "@/action/auth/identity-document.action";

type Props = {
  language: string;
  profileSetupToken: string;
  onNext: () => void;
};

export default function IdentityForm({language, profileSetupToken, onNext }: Props) {
  const [selectedDocument, setSelectedDocument] = useState<
    "ID_CARD" | "PASSPORT" | null
  >(null);

  const [idFrontPreview, setIdFrontPreview] = useState<string | null>(null);
  const [idBackPreview, setIdBackPreview] = useState<string | null>(null);
  const [passportPreview, setPassportPreview] = useState<string | null>(null);

  const [idFrontFile, setIdFrontFile] = useState<File | null>(null);
  const [idBackFile, setIdBackFile] = useState<File | null>(null);
  const [passportFile, setPassportFile] = useState<File | null>(null);

  const [serverError, setServerError] = useState("");
  const [isPending, setIsPending] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<IdentityDocumentSchema>({
    resolver: zodResolver(identityDocumentSchema),
    defaultValues: {
      documentType: undefined,
      frontImageUrl: "",
      backImageUrl: "",
    },
  });

  const handleDocumentChange = (value: "ID_CARD" | "PASSPORT") => {
    setSelectedDocument(value);
    setServerError("");

    setValue("documentType", value, { shouldValidate: true });
    setValue("frontImageUrl", "", { shouldValidate: false });
    setValue("backImageUrl", "", { shouldValidate: false });

    setIdFrontPreview(null);
    setIdBackPreview(null);
    setPassportPreview(null);

    setIdFrontFile(null);
    setIdBackFile(null);
    setPassportFile(null);
  };

  const handleSelectFile = (
    file: File,
    fieldName: "frontImageUrl" | "backImageUrl",
    setPreview: (url: string | null) => void,
    setFile: (file: File | null) => void,
  ) => {
    if (!file.type.startsWith("image/")) {
      setPreview(null);
      setFile(null);

      pushToast({
        title: "Invalid file",
        message: "Please upload an image file only.",
        variant: "error",
      });

      return;
    }

    const previewUrl = URL.createObjectURL(file);

    setPreview(previewUrl);
    setFile(file);

    setValue(fieldName, file.name, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const uploadSelectedFile = async (file: File) => {
    const result = await uploadFileAction(file, profileSetupToken);

    if (!result.success) {
      throw new Error(result.error);
    }

    return result.fileName;
  };

  const onSkip = async () => {
    setIsPending(true);

    try {
      const result = await skipIdentityVerificationAction(profileSetupToken);

      if (!result.success) {
        pushToast({
          title: "Skip identity verification failed",
          message: result.error,
          variant: "error",
        });
        return;
      }

      pushToast({
        title: "Success",
        message: result.message,
        variant: "success",
      });
      
      localStorage.removeItem("farmer-farm-info");
      localStorage.removeItem("farmer-personal-info");
      localStorage.removeItem("buyer-business-info");
      localStorage.removeItem("buyer-personal-info");
      onNext();
    } finally {
      setIsPending(false);
    }
  };

  const onSubmit = async (values: IdentityDocumentSchema) => {
    setIsPending(true);
    setServerError("");

    try {
      let frontImageUrl = "";
      let backImageUrl = "";

      if (values.documentType === "ID_CARD") {
        if (!idFrontFile || !idBackFile) {
          throw new Error("Please upload both front and back side of ID card.");
        }

        frontImageUrl = await uploadSelectedFile(idFrontFile);
        backImageUrl = await uploadSelectedFile(idBackFile);
      }

      if (values.documentType === "PASSPORT") {
        if (!passportFile) {
          throw new Error("Please upload your passport image.");
        }

        frontImageUrl = await uploadSelectedFile(passportFile);
        backImageUrl = "";
      }

      const payload: IdentityDocumentSchema = {
        ...values,
        frontImageUrl,
        backImageUrl,
      };

      const result = profileSetupToken
        ? await uploadIdentityDocumentAction(payload, profileSetupToken)
        : await uploadIdentityDocumentAction(payload);

      if (!result.success) {
        throw new Error(result.error);
      }

      pushToast({
        title: "Identity Submission",
        message: "Identity submitted successfully.",
        variant: "success",
      });

      localStorage.removeItem("farmer-farm-info");
      localStorage.removeItem("farmer-personal-info");
      localStorage.removeItem("buyer-business-info");
      localStorage.removeItem("buyer-personal-info");
      onNext();
    } catch (error) {
      pushToast({
        title: "Submit Identity document failed",
        message:
          error instanceof Error
            ? error.message
            : "Identity document submission failed.",
        variant: "error",
      });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mx-auto w-full max-w-165 px-4 sm:px-0"
    >
      <FormHeader
        title="Identity Verification"
        description="Upload a valid government-issued document to secure your profile. You can complete this step later, but unverified accounts will have limited trading features."
      />

      {serverError && (
        <p className="mt-5 rounded-md bg-red-50 px-4 py-3 text-sm text-red-600">
          {serverError}
        </p>
      )}

      <div className="mt-8 space-y-4">
        <label className="flex cursor-pointer items-center gap-2 text-base font-medium text-heading">
          <input
            type="radio"
            value="ID_CARD"
            {...register("documentType")}
            checked={selectedDocument === "ID_CARD"}
            onChange={() => handleDocumentChange("ID_CARD")}
            className="h-4 w-4 accent-primary"
          />
          National ID Card
        </label>

        <label className="flex cursor-pointer items-center gap-2 text-base font-medium text-heading">
          <input
            type="radio"
            value="PASSPORT"
            {...register("documentType")}
            checked={selectedDocument === "PASSPORT"}
            onChange={() => handleDocumentChange("PASSPORT")}
            className="h-4 w-4 accent-primary"
          />
          Passport
        </label>
      </div>

      {errors.documentType && (
        <p className="mt-2 text-sm text-red-500">
          {errors.documentType.message}
        </p>
      )}

      {selectedDocument && (
        <div className="mt-8">
          <h3 className="text-lg font-bold text-heading">
            Upload your{" "}
            {selectedDocument === "ID_CARD" ? "National ID Card" : "Passport"}
          </h3>

          {selectedDocument === "ID_CARD" ? (
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="mb-3 text-base font-medium text-heading">
                  Front of ID
                </p>

                <UploadBox
                  text="*Please upload front side"
                  preview={idFrontPreview}
                  onSelect={(file) =>
                    handleSelectFile(
                      file,
                      "frontImageUrl",
                      setIdFrontPreview,
                      setIdFrontFile,
                    )
                  }
                />

                {!idFrontFile && errors.frontImageUrl && (
                  <p className="mt-2 text-sm text-red-500">
                    {errors.frontImageUrl.message}
                  </p>
                )}
              </div>

              <div>
                <p className="mb-3 text-base font-medium text-heading">
                  Back of ID
                </p>

                <UploadBox
                  text="*Please upload back side"
                  preview={idBackPreview}
                  onSelect={(file) =>
                    handleSelectFile(
                      file,
                      "backImageUrl",
                      setIdBackPreview,
                      setIdBackFile,
                    )
                  }
                />

                {!idBackFile && errors.backImageUrl && (
                  <p className="mt-2 text-sm text-red-500">
                    {errors.backImageUrl.message}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="mt-6">
              <UploadBox
                text="*Please upload front side"
                large
                preview={passportPreview}
                onSelect={(file) =>
                  handleSelectFile(
                    file,
                    "frontImageUrl",
                    setPassportPreview,
                    setPassportFile,
                  )
                }
              />

              {!passportFile && errors.frontImageUrl && (
                <p className="mt-2 text-sm text-red-500">
                  {errors.frontImageUrl.message}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      <div className="cursor-pointer">
        <SubmitButton disabled={isPending}>
          {isPending ? "SUBMITTING..." : "CONTINUE"}
        </SubmitButton>
      </div>

      <button
        type="button"
        disabled={isPending}
        onClick={onSkip}
        className="mt-5 w-full text-sm disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "SKIPPING..." : "SKIP"}
      </button>
    </form>
  );
}

function UploadBox({
  text,
  large,
  preview,
  onSelect,
}: {
  text: string;
  large?: boolean;
  preview: string | null;
  onSelect: (file: File) => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      e.target.value = "";

      pushToast({
        title: "Invalid file",
        message: "Please upload an image file only.",
        variant: "error",
      });

      return;
    }

    onSelect(file);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={`flex w-full flex-col items-center justify-center overflow-hidden rounded-[10px] border border-dashed border-primary bg-white ${
          large ? "h-35" : "h-27.5"
        }`}
      >
        {preview ? (
          <Image
            src={preview}
            alt="Uploaded document"
            width={400}
            height={200}
            className="h-full w-full object-cover"
          />
        ) : (
          <>
            <UserIcon className="h-7 w-7 text-[#667085]" />
            <p className="mt-3 text-sm text-description">{text}</p>
          </>
        )}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </>
  );
}
