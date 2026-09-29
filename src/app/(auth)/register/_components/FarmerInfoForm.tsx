"use client";

import { useState, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import PlaceOfBirthLocation from "./PlaceOfBirthLocation";
import {
  farmerInfoSchema,
  type FarmerInfoSchema,
  type FarmerInfoSchemaInput,
} from "@/schema/farmer-info.schema";
import { setupFarmerProfileAction } from "@/action/auth/farmer-profile-setup.action";
import FormHeader from "./FormHeader";
import Input from "./Input";
import SubmitButton from "./SubmitButton";
import AvatarUpload from "./AvatarUpload";
import LocationSelector from "./LocationSelector";
import { pushToast } from "@/lib/toastStore";
import { uploadFileAction } from "@/action/auth/upload-file.action";
import { DatePickerComponent } from "@/components/ui/DatePickerComponent";
import { REGISTER_TEXT } from "../translation";
import { createTranslator } from "../../login/LoginFlow";

export type FarmerPersonalInfoDraft = Pick<
  FarmerInfoSchemaInput,
  "fullName" | "dateOfBirth" | "placeOfBirthProvinceId" | "profileUrl"
> & {
  profileFile: File | null;
};

type FarmerPersonalFormData = Pick<
  FarmerInfoSchemaInput,
  "fullName" | "dateOfBirth" | "placeOfBirthProvinceId" | "profileUrl"
>;

type FarmerFarmFormInput = Pick<
  FarmerInfoSchemaInput,
  | "farmProvinceId"
  | "farmDistrictId"
  | "farmCommuneId"
  | "farmVillageId"
  | "farmName"
  | "farmSize"
>;

type FarmerFarmFormData = Pick<
  FarmerInfoSchema,
  | "farmProvinceId"
  | "farmDistrictId"
  | "farmCommuneId"
  | "farmVillageId"
  | "farmName"
  | "farmSize"
>;

type Props =
  | {
      language: string;
      mode: "personal";
      initialPersonalInfo?: FarmerPersonalInfoDraft | null;
      onPersonalNext: (values: FarmerPersonalInfoDraft) => void;
    }
  | {
      language: string;
      mode: "farm";
      profileSetupToken: string;
      personalInfo: FarmerPersonalInfoDraft | null;
      isProfileSetupComplete?: boolean;
      onProfileSetupComplete?: () => void;
      onNext: () => void;
    };

const farmerPersonalInfoSchema = farmerInfoSchema.pick({
  fullName: true,
  dateOfBirth: true,
  placeOfBirthProvinceId: true,
  profileUrl: true,
});

const farmerFarmInfoSchema = farmerInfoSchema.pick({
  farmProvinceId: true,
  farmDistrictId: true,
  farmCommuneId: true,
  farmVillageId: true,
  farmName: true,
  farmSize: true,
});

function isProfileAlreadyCreatedError(error?: string) {
  return /already.*profile|profile.*already|have.*profile|profile.*exist/i.test(
    error ?? "",
  );
}

export default function FarmerInfoForm(props: Props) {
  if (props.mode === "personal") {
    return <FarmerPersonalInfoStep {...props} />;
  }

  return <FarmerFarmInfoStep {...props} />;
}

function FarmerPersonalInfoStep({
  language,
  initialPersonalInfo,
  onPersonalNext,
}: Extract<Props, { mode: "personal" }>) {
  const t = createTranslator(REGISTER_TEXT, language);

  const STORAGE_KEY = "farmer-personal-info";

  const [profileFile, setProfileFile] = useState<File | null>(
    initialPersonalInfo?.profileFile ?? null,
  );

  const [isLoaded, setIsLoaded] = useState(false);

  const form = useForm<FarmerPersonalFormData>({
    resolver: zodResolver(farmerPersonalInfoSchema),
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

  function onSubmit(values: FarmerPersonalFormData) {
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
      noValidate
      className="mx-auto w-full max-w-2xl px-3 sm:px-4"
    >
      <FormHeader
        title={t("register.personal.title")}
        description={t("register.personal.description")}
      />

      <div className="mt-6 grid gap-6 md:grid-cols-[120px_1fr] md:items-start">
        <div className="flex justify-center md:block">
          <AvatarUpload
            value={watch("profileUrl")}
            onFileChange={(file) => setProfileFile(file)}
          />
        </div>

        <div className="space-y-4">
          <Input
            label={t("register.personal.fullName")}
            {...register("fullName")}
            error={errors.fullName?.message}
          />

          <div>
            <label className="mb-2 block text-sm font-bold text-primary">
              <span className="text-red-500">*</span>{" "}
              {t("register.personal.dateOfBirth")}
            </label>

            <Controller
              name="dateOfBirth"
              control={control}
              render={({ field }) => (
                <DatePickerComponent
                  id="farmer-date-of-birth"
                  label={t("register.personal.dateOfBirth")}
                  value={field.value ?? ""}
                  minDate={minDate}
                  maxDate={maxDate}
                  invalid={Boolean(errors.dateOfBirth)}
                  onBlur={field.onBlur}
                  onChange={field.onChange}
                  popoverClassName="w-full sm:w-72!"
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

          <SubmitButton>{t("register.personal.continue")}</SubmitButton>
        </div>
      </div>
    </form>
  );
}

function FarmerFarmInfoStep({
  profileSetupToken,
  personalInfo,
  isProfileSetupComplete = false,
  onProfileSetupComplete,
  onNext,
}: Extract<Props, { mode: "farm" }>) {
  const STORAGE_KEY = "farmer-farm-info";
  const [isPending, setIsPending] = useState(false);
  const form = useForm<FarmerFarmFormInput, unknown, FarmerFarmFormData>({
    resolver: zodResolver(farmerFarmInfoSchema),
    defaultValues: {
      farmProvinceId: "",
      farmDistrictId: "",
      farmCommuneId: null,
      farmVillageId: null,
      farmName: "",
      farmSize: "",
    },
  });
  const {
    register,
    handleSubmit,
    setError,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = form;

  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    console.log("farme info", saved);

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

  async function onSubmit(values: FarmerFarmFormData) {
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

      const finalValues: FarmerInfoSchema = {
        fullName: personalInfo.fullName,
        dateOfBirth: personalInfo.dateOfBirth,
        placeOfBirthProvinceId: personalInfo.placeOfBirthProvinceId,
        profileUrl,
        ...values,
      };

      const result = await setupFarmerProfileAction(
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
          setError(field as keyof FarmerFarmFormData, {
            type: "server",
            message,
          });
        });

        pushToast({
          title: "Farmer setup profile failed",
          message:
            Object.values(result.fieldErrors ?? {})[0] ??
            result.error ??
            "Please correct the highlighted fields.",
          variant: "error",
        });

        return;
      }

      pushToast({
        title: "Farmer setup profile",
        message: "Farmer profile setup completed successfully.",
        variant: "success",
      });

      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem("farmer-personal-info");

      onProfileSetupComplete?.();
      onNext();
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="mx-auto w-full max-w-150 px-4 sm:px-0"
    >
      <FormHeader
        title="Farm Information"
        description="Add your farm details and location."
      />

      <div className="mt-4 grid gap-4">
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Farm Name"
            {...register("farmName")}
            error={errors.farmName?.message}
          />

          <Input
            label="Farm Size"
            type="number"
            step="1"
            min="1"
            suffix="ha"
            {...register("farmSize")}
            placeholder="Enter farm size"
            error={errors.farmSize?.message}
          />
        </div>

        <LocationSelector
          value={{
            provinceId: watch("farmProvinceId"),
            districtId: watch("farmDistrictId"),
            communeId: watch("farmCommuneId"),
            villageId: watch("farmVillageId"),
          }}
          errors={{
            provinceId: errors.farmProvinceId?.message,
            districtId: errors.farmDistrictId?.message,
            communeId: errors.farmCommuneId?.message,
            villageId: errors.farmVillageId?.message,
          }}
          onChange={(location) => {
            setValue("farmProvinceId", location.provinceId, {
              shouldDirty: true,
              shouldTouch: true,
              shouldValidate: true,
            });

            setValue("farmDistrictId", location.districtId, {
              shouldDirty: true,
              shouldTouch: true,
              shouldValidate: true,
            });

            setValue("farmCommuneId", location.communeId, {
              shouldDirty: true,
              shouldTouch: true,
              shouldValidate: true,
            });

            setValue("farmVillageId", location.villageId, {
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
