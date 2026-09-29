"use client";

import { useState, useEffect } from "react";
import { BuyerInfoShcema, buyerInfoSchema } from "@/schema/buyer-info.schema";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import FormHeader from "./FormHeader";
import Input from "./Input";
import SubmitButton from "./SubmitButton";
import AvatarUpload from "./AvatarUpload";
import PlaceOfBirthLocation from "./PlaceOfBirthLocation";
import LocationSelector from "./LocationSelector";
import { setupBuyerProfileAction } from "@/action/auth/buyer-profile-setup.action";
import { pushToast } from "@/lib/toastStore";
import { uploadFileAction } from "@/action/auth/upload-file.action";
import { DatePickerComponent } from "@/components/ui/DatePickerComponent";

export type BuyerPersonalInfoDraft = Pick<
  BuyerInfoShcema,
  "fullName" | "dateOfBirth" | "placeOfBirthProvinceId" | "profileUrl"
> & {
  profileFile: File | null;
};

type BuyerPersonalFormData = Pick<
  BuyerInfoShcema,
  "fullName" | "dateOfBirth" | "placeOfBirthProvinceId" | "profileUrl"
>;

type BuyerBusinessFormData = Pick<
  BuyerInfoShcema,
  | "businessProvinceId"
  | "businessDistrictId"
  | "businessCommuneId"
  | "businessVillageId"
  | "businessName"
  | "businessType"
>;

type Props =
  | {
      mode: "personal";
      initialPersonalInfo?: BuyerPersonalInfoDraft | null;
      onPersonalNext: (values: BuyerPersonalInfoDraft) => void;
    }
  | {
      mode: "business";
      profileSetupToken: string;
      personalInfo: BuyerPersonalInfoDraft | null;
      isProfileSetupComplete?: boolean;
      onProfileSetupComplete?: () => void;
      onNext: () => void;
    };

const buyerPersonalInfoSchema = buyerInfoSchema.pick({
  fullName: true,
  dateOfBirth: true,
  placeOfBirthProvinceId: true,
  profileUrl: true,
});

const buyerBusinessInfoSchema = buyerInfoSchema.pick({
  businessProvinceId: true,
  businessDistrictId: true,
  businessCommuneId: true,
  businessVillageId: true,
  businessName: true,
  businessType: true,
});

function isProfileAlreadyCreatedError(error?: string) {
  return /already.*profile|profile.*already|have.*profile|profile.*exist/i.test(
    error ?? "",
  );
}

export default function BuyerInfoForm(props: Props) {
  if (props.mode === "personal") {
    return <BuyerPersonalInfoStep {...props} />;
  }

  return <BuyerBusinessInfoStep {...props} />;
}

function BuyerPersonalInfoStep({
  initialPersonalInfo,
  onPersonalNext,
}: Extract<Props, { mode: "personal" }>) {
  const STORAGE_KEY = "buyer-personal-info";
  const [profileFile, setProfileFile] = useState<File | null>(
    initialPersonalInfo?.profileFile ?? null,
  );
  const [isLoaded, setIsLoaded] = useState(false);
  const form = useForm<BuyerPersonalFormData>({
    resolver: zodResolver(buyerPersonalInfoSchema),
    mode: "onChange",
    defaultValues: {
      fullName: initialPersonalInfo?.fullName ?? "",
      dateOfBirth: initialPersonalInfo?.dateOfBirth ?? "",
      placeOfBirthProvinceId: initialPersonalInfo?.placeOfBirthProvinceId ?? "",
      profileUrl: initialPersonalInfo?.profileUrl ?? null,
    },
  });

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = form;

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
      reset(JSON.parse(saved));
    }

    setIsLoaded(true);
  }, [reset]);

  useEffect(() => {
    if (!isLoaded) return;

    const subscription = watch((values) => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(values));
    });

    return () => subscription.unsubscribe();
  }, [watch, isLoaded]);

  function onSubmit(values: BuyerPersonalFormData) {
    onPersonalNext({
      ...values,
      profileFile,
    });
  }
  const today = new Date();

  const minDate = new Date(
    today.getFullYear() - 90,
    today.getMonth(),
    today.getDate(),
  )
    .toISOString()
    .split("T")[0];

  const maxDate = new Date(
    today.getFullYear() - 18,
    today.getMonth(),
    today.getDate(),
  )
    .toISOString()
    .split("T")[0];

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mx-auto w-full max-w-150 px-4 sm:px-0"
    >
      <FormHeader
        title="Personal Information"
        description="Add your identity details before setting up your business."
      />

      <div className="mt-7 grid gap-6 md:grid-cols-[120px_1fr]">
        <AvatarUpload
          value={watch("profileUrl")}
          onFileChange={(file) => {
            setProfileFile(file);
          }}
        />

        <div className="grid gap-4">
          <Input
            label="Full Name"
            {...register("fullName")}
            error={errors.fullName?.message}
          />

          <div className="grid gap-4">
            <div>
              <label className="mb-2 block text-sm font-bold text-primary">
                <span className="text-red-500">*</span> Date of Birth
              </label>
              <Controller
                name="dateOfBirth"
                control={control}
                render={({ field }) => (
                  <DatePickerComponent
                    id="buyer-date-of-birth"
                    label="Date of Birth"
                    value={field.value ?? ""}
                    minDate={minDate}
                    maxDate={maxDate}
                    invalid={Boolean(errors.dateOfBirth)}
                    onBlur={field.onBlur}
                    onChange={field.onChange}
                    popoverClassName="w-72!"
                  />
                )}
              />
              {errors.dateOfBirth?.message && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.dateOfBirth.message}
                </p>
              )}
            </div>

            <PlaceOfBirthLocation
              value={watch("placeOfBirthProvinceId")}
              error={errors.placeOfBirthProvinceId?.message}
              onChange={(value) =>
                setValue("placeOfBirthProvinceId", value, {
                  shouldValidate: true,
                  shouldDirty: true,
                  shouldTouch: true,
                })
              }
            />
          </div>

          <SubmitButton>CONTINUE</SubmitButton>
        </div>
      </div>
    </form>
  );
}

function BuyerBusinessInfoStep({
  profileSetupToken,
  personalInfo,
  isProfileSetupComplete = false,
  onProfileSetupComplete,
  onNext,
}: Extract<Props, { mode: "business" }>) {
  const STORAGE_KEY = "buyer-business-info";
  const [isPending, setIsPending] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const form = useForm<BuyerBusinessFormData>({
    resolver: zodResolver(buyerBusinessInfoSchema),
    defaultValues: {
      businessProvinceId: "",
      businessDistrictId: "",
      businessCommuneId: null,
      businessVillageId: null,
      businessName: "",
      businessType: "",
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    setError,
    formState: { errors },
  } = form;

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
      reset(JSON.parse(saved));
    }

    setIsLoaded(true);
  }, [reset]);

  useEffect(() => {
    if (!isLoaded) return;

    const subscription = watch((values) => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(values));
    });

    return () => subscription.unsubscribe();
  }, [watch, isLoaded]);

  async function onSubmit(values: BuyerBusinessFormData) {
    if (isProfileSetupComplete) {
      onNext();
      return;
    }

    if (!personalInfo) {
      pushToast({
        title: "Personal information missing",
        message: "Please complete the personal information step first.",
        variant: "error",
      });
      return;
    }

    setIsPending(true);

    try {
      let profileUrl = personalInfo.profileUrl;

      if (personalInfo.profileFile) {
        const uploadResult = await uploadFileAction(
          personalInfo.profileFile,
          profileSetupToken,
        );

        if (!uploadResult.success) {
          pushToast({
            title: "Upload image failed",
            message: uploadResult.error,
            variant: "error",
          });

          return;
        }

        profileUrl = uploadResult.fileName;
      }

      const finalValues: BuyerInfoShcema = {
        fullName: personalInfo.fullName,
        dateOfBirth: personalInfo.dateOfBirth,
        placeOfBirthProvinceId: personalInfo.placeOfBirthProvinceId,
        profileUrl,
        ...values,
      };

      const result = await setupBuyerProfileAction(
        finalValues,
        profileSetupToken,
      );

      if (!result.success) {
        if (isProfileAlreadyCreatedError(result.error)) {
          onProfileSetupComplete?.();
          onNext();
          return;
        }

        Object.entries(result.fieldErrors ?? {}).forEach(([field, message]) => {
          setError(field as keyof BuyerBusinessFormData, {
            type: "server",
            message,
          });
        });
        pushToast({
          title: "Buyer setup profile failed",
          message: result.error,
          variant: "error",
        });
        return;
      }

      pushToast({
        title: "Buyer setup profile",
        message: "Buyer profile setup completed successfully.",
        variant: "success",
      });
      onProfileSetupComplete?.();
      onNext();
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mx-auto w-full max-w-150 px-4 sm:px-0"
    >
      <FormHeader
        title="Business Information"
        description="Add your business details and operating location."
      />

      <div className="mt-4 grid gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Company Name"
            {...register("businessName")}
            error={errors.businessName?.message}
          />
          <Input
            label="Business Type"
            {...register("businessType")}
            error={errors.businessType?.message}
          />
        </div>

        <LocationSelector
          value={{
            provinceId: watch("businessProvinceId"),
            districtId: watch("businessDistrictId"),
            communeId: watch("businessCommuneId"),
            villageId: watch("businessVillageId"),
          }}
          errors={{
            provinceId: errors.businessProvinceId?.message,
            districtId: errors.businessDistrictId?.message,
            communeId: errors.businessCommuneId?.message,
            villageId: errors.businessVillageId?.message,
          }}
          onChange={(location) => {
            setValue("businessProvinceId", location.provinceId, {
              shouldDirty: true,
              shouldTouch: true,
              shouldValidate: true,
            });

            setValue("businessDistrictId", location.districtId, {
              shouldDirty: true,
              shouldTouch: true,
              shouldValidate: true,
            });

            setValue("businessCommuneId", location.communeId, {
              shouldDirty: true,
              shouldTouch: true,
              shouldValidate: true,
            });

            setValue("businessVillageId", location.villageId, {
              shouldDirty: true,
              shouldTouch: true,
              shouldValidate: true,
            });
          }}
        />

        <SubmitButton disabled={isPending}>
          {isPending ? "CONTINUING..." : "CONTINUE"}
        </SubmitButton>
      </div>
    </form>
  );
}
