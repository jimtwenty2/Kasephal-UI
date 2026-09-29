"use client";

import React, {
  ChangeEvent,
  useEffect,
  useRef,
  useState,
  useMemo,
  memo,
} from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X, Eye, EyeClosed, Camera } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { UseFormRegisterReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { DatePickerComponent } from "@/components/ui/DatePickerComponent";

import type { UserRole } from "./ProfileHeader";
import type { UserProfilePayload } from "@/types/user";
import type { LocationItem } from "@/types/updateOwnProfileInfo";
import {
  updateBuyerProfile,
  updateFarmerProfile,
  updateGovernmentProfile,
  updateBakong,
  changePassword,
  getCommunes,
  getDistricts,
  getProvinces,
  getVillages,
} from "@/action/profile.action";                         
import { uploadAttachment } from "@/services/uploadAttachment.service";
import {
  sanitizeLettersAndSpaces,
  readString,
  type FormData as PersonalInfoFormData,
} from "@/schema/personal-info.schema";
import { showApiError, showApiSuccess } from "@/lib/apiToast";
import { getFileUrl } from "@/utils/getFileUrl";
import { emitProfileImageUpdated } from "@/lib/profileImageEvent";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { addLoginIdentifierOtpAction, updateLoginIdentifierAction } from "@/action/profile-identifier.action";
import { logoutAction } from "@/action/auth/login.action";
import { maskIdentifier } from "@/utils/maskIdentifier";
import { useI18n } from "@/lib/i18n/I18nContext";

const PROFILE_TEXT = {
  "profile.address": { en: "Address", kh: "អាសយដ្ឋាន" },
  "profile.bakong.account": { en: "Bakong Account", kh: "គណនីបាគង" },
  "profile.bakong.description": { en: "Add your Bakong ID for payment transactions.", kh: "បន្ថែមលេខសម្គាល់បាគងសម្រាប់ប្រតិបត្តិការទូទាត់។" },
  "profile.bakong.id": { en: "Bakong ID", kh: "លេខសម្គាល់បាគង" },
  "profile.bakong.notAdded": { en: "Not Added", kh: "មិនទាន់បានបន្ថែម" },
  "profile.bakong.notFound": { en: "This Bakong account does not exist. Please check the Bakong ID and try again.", kh: "គណនីបាគងនេះមិនមានទេ។ សូមពិនិត្យលេខសម្គាល់បាគង ហើយព្យាយាមម្តងទៀត។" },
  "profile.bakong.required": { en: "Bakong ID is required", kh: "ត្រូវបញ្ចូលលេខសម្គាល់បាគង" },
  "profile.bakong.updateFail": { en: "Couldn't update your Bakong account. Please try again.", kh: "មិនអាចធ្វើបច្ចុប្បន្នភាពគណនីបាគងបានទេ។ សូមព្យាយាមម្តងទៀត។" },
  "profile.bakong.updateSuccess": { en: "Bakong account updated successfully.", kh: "បានធ្វើបច្ចុប្បន្នភាពគណនីបាគងដោយជោគជ័យ។" },
  "profile.bio": { en: "Bio", kh: "ជីវប្រវត្តិ" },
  "profile.btn-cancel": { en: "Cancel", kh: "បោះបង់" },
  "profile.busInfo": { en: "Business Information", kh: "ព័ត៌មានអាជីវកម្ម" },
  "profile.busType": { en: "Business Type", kh: "ប្រភេទអាជីវកម្ម" },
  "profile.businessAddress": { en: "Business Address", kh: "អាសយដ្ឋានអាជីវកម្ម" },
  "profile.commune": { en: "Commune", kh: "ឃុំ/សង្កាត់" },
  "profile.companyName": { en: "Company Name", kh: "ឈ្មោះក្រុមហ៊ុន" },
  "profile.confirmPw": { en: "Confirm Password", kh: "បញ្ជាក់ពាក្យសម្ងាត់" },
  "profile.currentPw": { en: "Current Password", kh: "ពាក្យសម្ងាត់បច្ចុប្បន្ន" },
  "profile.currentPw.required": { en: "Current password is required", kh: "ត្រូវបញ្ចូលពាក្យសម្ងាត់បច្ចុប្បន្ន" },
  "profile.date": { en: "Date of Birth", kh: "ថ្ងៃខែឆ្នាំកំណើត" },
  "profile.district": { en: "District", kh: "ស្រុក/ខណ្ឌ" },
  "profile.edit-bakong": { en: "Update Bakong", kh: "ធ្វើបច្ចុប្បន្នភាពបាគង" },
  "profile.edit-personalInfo": { en: "Personal Information", kh: "ព័ត៌មានផ្ទាល់ខ្លួន" },
  "profile.editPro": { en: "Edit Profile", kh: "កែប្រែប្រវត្តិរូប" },
  "profile.error.editFailed": { en: "Failed to update profile information.", kh: "បរាជ័យក្នុងការធ្វើបច្ចុប្បន្នភាពព័ត៌មានប្រវត្តិរូប។" },
  "profile.farm": { en: "Farm Size", kh: "ទំហំកសិដ្ឋាន" },
  "profile.farmInfo": { en: "Farm Information", kh: "ព័ត៌មានកសិដ្ឋាន" },
  "profile.farmLoc": { en: "Farm Location", kh: "ទីតាំងកសិដ្ឋាន" },
  "profile.farmName": { en: "Farm Name", kh: "ឈ្មោះកសិដ្ឋាន" },
  "profile.fullN": { en: "Full Name", kh: "ឈ្មោះពេញ" },
  "profile.govAddress": { en: "Government Address", kh: "អាសយដ្ឋានរដ្ឋាភិបាល" },
  "profile.identifier.add": { en: "Add", kh: "បន្ថែម" },
  "profile.identifier.addEmailDescription": { en: "Add your email address to your account.", kh: "បន្ថែមអាសយដ្ឋានអ៊ីមែលទៅគណនីរបស់អ្នក។" },
  "profile.identifier.addPhoneDescription": { en: "Add your phone number to your account.", kh: "បន្ថែមលេខទូរស័ព្ទទៅគណនីរបស់អ្នក។" },
  "profile.identifier.addedSuccess": { en: "added successfully.", kh: "បានបន្ថែមដោយជោគជ័យ។" },
  "profile.identifier.emailAddress": { en: "Email Address", kh: "អាសយដ្ឋានអ៊ីមែល" },
  "profile.identifier.phoneNumber": { en: "Phone Number", kh: "លេខទូរស័ព្ទ" },
  "profile.identifier.verifyOtp": { en: "Verify OTP", kh: "ផ្ទៀងផ្ទាត់ OTP" },
  "profile.image.invalidType": { en: "Only PNG, JPG, and JPEG images are allowed.", kh: "អនុញ្ញាតតែរូបភាព PNG, JPG និង JPEG ប៉ុណ្ណោះ។" },
  "profile.label.change": { en: "Change", kh: "ផ្លាស់ប្តូរ" },
  "profile.label.saving": { en: "Saving...", kh: "កំពុងរក្សាទុក..." },
  "profile.label.sending": { en: "SENDING...", kh: "កំពុងផ្ញើ..." },
  "profile.label.submitting": { en: "Submitting...", kh: "កំពុងដាក់ស្នើ..." },
  "profile.label.updating": { en: "Updating...", kh: "កំពុងធ្វើបច្ចុប្បន្នភាព..." },
  "profile.mName": { en: "Ministry Name", kh: "ឈ្មោះក្រសួង" },
  "profile.newPw": { en: "New Password", kh: "ពាក្យសម្ងាត់ថ្មី" },
  "profile.otp.enterCodeSentTo": { en: "Enter the 6-digit code sent to", kh: "បញ្ចូលលេខកូដ ៦ ខ្ទង់ដែលបានផ្ញើទៅ" },
  "profile.otp.mustBeSixDigits": { en: "OTP must be 6 digits", kh: "OTP ត្រូវមាន ៦ ខ្ទង់" },
  "profile.otp.notReceived": { en: "Didn't receive a code?", kh: "មិនបានទទួលលេខកូដទេ?" },
  "profile.otp.required": { en: "OTP code is required", kh: "ត្រូវបញ្ចូលលេខកូដ OTP" },
  "profile.otp.resendCode": { en: "Resend Code", kh: "ផ្ញើលេខកូដម្តងទៀត" },
  "profile.otp.resendIn": { en: "Resend in", kh: "ផ្ញើម្តងទៀតក្នុង" },
  "profile.otp.sendCode": { en: "SEND CODE", kh: "ផ្ញើលេខកូដ" },
  "profile.otp.sentSuccess": { en: "OTP sent successfully.", kh: "បានផ្ញើ OTP ដោយជោគជ័យ។" },
  "profile.otp.sentTo": { en: "Verification code sent to", kh: "លេខកូដផ្ទៀងផ្ទាត់ត្រូវបានផ្ញើទៅ" },
  "profile.otp.verifyCode": { en: "VERIFY CODE", kh: "ផ្ទៀងផ្ទាត់លេខកូដ" },
  "profile.password.hide": { en: "Hide password", kh: "លាក់ពាក្យសម្ងាត់" },
  "profile.password.show": { en: "Show password", kh: "បង្ហាញពាក្យសម្ងាត់" },
  "profile.placeholder.bakong": { en: "Enter Bakong ID", kh: "បញ្ចូលលេខសម្គាល់បាគង" },
  "profile.placeholder.email": { en: "Enter Email Address", kh: "បញ្ចូលអាសយដ្ឋានអ៊ីមែល" },
  "profile.placeholder.enter": { en: "Enter", kh: "បញ្ចូល" },
  "profile.placeholder.phone": { en: "Enter Phone Number", kh: "បញ្ចូលលេខទូរស័ព្ទ" },
  "profile.placeholder.select": { en: "Select", kh: "ជ្រើសរើស" },
  "profile.pob": { en: "Place of Birth Province", kh: "ខេត្ត/រាជធានីកំណើត" },
  "profile.popupEditSucc": { en: "Profile updated successfully", kh: "បានធ្វើបច្ចុប្បន្នភាពប្រវត្តិរូបដោយជោគជ័យ" },
  "profile.province": { en: "Province", kh: "ខេត្ត/រាជធានី" },
  "profile.pw.confirm": { en: "Confirm password is required", kh: "ត្រូវបញ្ចូលការបញ្ជាក់ពាក្យសម្ងាត់" },
  "profile.pw.description": { en: "Password must include at least one uppercase letter, one lowercase letter, one number, one special character and least 8 characters", kh: "ពាក្យសម្ងាត់ត្រូវមានអក្សរធំយ៉ាងតិចមួយ អក្សរតូចយ៉ាងតិចមួយ លេខយ៉ាងតិចមួយ តួអក្សរពិសេសយ៉ាងតិចមួយ និងមានយ៉ាងតិច ៨ តួអក្សរ" },
  "profile.pw.pattern": { en: "Password must include at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)", kh: "ពាក្យសម្ងាត់ត្រូវមានអក្សរធំយ៉ាងតិចមួយ អក្សរតូចយ៉ាងតិចមួយ លេខយ៉ាងតិចមួយ និងតួអក្សរពិសេសមួយ (@$!%*?&)" },
  "profile.pw.message": { en: "Password does not match", kh: "ពាក្យសម្ងាត់មិនត្រូវគ្នាទេ" },
  "profile.pw.sameAsCurrent": { en: "New password must be different from your current password", kh: "ពាក្យសម្ងាត់ថ្មីត្រូវតែខុសពីពាក្យសម្ងាត់បច្ចុប្បន្ន" },
  "profile.pw.currentIncorrect": { en: "Your current password is incorrect", kh: "ពាក្យសម្ងាត់បច្ចុប្បន្នរបស់អ្នកមិនត្រឹមត្រូវ" },
  "profile.pw.redirectConfirm": { en: "After your password is changed successfully, you will be redirected to login and need to sign in again. Do you want to continue?", kh: "បន្ទាប់ពីផ្លាស់ប្តូរពាក្យសម្ងាត់ជោគជ័យ អ្នកនឹងត្រូវបានបញ្ជូនទៅទំព័រចូលប្រើ ហើយត្រូវចូលប្រើម្តងទៀត។ តើអ្នកចង់បន្តទេ?" },
  "profile.pw.redirectContinue": { en: "Continue", kh: "បន្ត" },
  "profile.pw.redirectTitle": { en: "Login required after password change", kh: "ត្រូវចូលប្រើម្តងទៀតបន្ទាប់ពីផ្លាស់ប្តូរពាក្យសម្ងាត់" },
  "profile.pw.updateFail": { en: "Couldn't update your password. Please try again.", kh: "មិនអាចធ្វើបច្ចុប្បន្នភាពពាក្យសម្ងាត់បានទេ។ សូមព្យាយាមម្តងទៀត។" },
  "profile.pw.updateSuc": { en: "Password updated successfully. Please login again.", kh: "បានធ្វើបច្ចុប្បន្នភាពពាក្យសម្ងាត់ដោយជោគជ័យ។ សូមចូលប្រើម្តងទៀត។" },
  "profile.submit": { en: "Submit", kh: "ដាក់ស្នើ" },
  "profile.serviceUnavailable": { en: "Service unavailable. Please try again later.", kh: "សេវាកម្មមិនអាចប្រើបានទេ។ សូមព្យាយាមម្តងទៀតនៅពេលក្រោយ។" },
  "profile.update": { en: "Update", kh: "ធ្វើបច្ចុប្បន្នភាព" },
  "profile.updatePw": { en: "Update Password", kh: "ធ្វើបច្ចុប្បន្នភាពពាក្យសម្ងាត់" },
  "profile.updatePw.description": { en: "Enter your current password and create a new one", kh: "បញ្ចូលពាក្យសម្ងាត់បច្ចុប្បន្ន និងបង្កើតពាក្យសម្ងាត់ថ្មី" },
  "profile.validation.addressDistrictRequired": { en: "Address district is required.", kh: "ត្រូវជ្រើសរើសស្រុក/ខណ្ឌអាសយដ្ឋាន។" },
  "profile.validation.addressProvinceRequired": { en: "Address province is required.", kh: "ត្រូវជ្រើសរើសខេត្ត/រាជធានីអាសយដ្ឋាន។" },
  "profile.validation.bioRequired": { en: "Bio is required.", kh: "ត្រូវបញ្ចូលជីវប្រវត្តិ។" },
  "profile.validation.businessDistrictRequired": { en: "Business district is required.", kh: "ត្រូវជ្រើសរើសស្រុក/ខណ្ឌអាជីវកម្ម។" },
  "profile.validation.businessProvinceRequired": { en: "Business province is required.", kh: "ត្រូវជ្រើសរើសខេត្ត/រាជធានីអាជីវកម្ម។" },
  "profile.validation.businessTypeRequired": { en: "Business type is required.", kh: "ត្រូវបញ្ចូលប្រភេទអាជីវកម្ម។" },
  "profile.validation.cambodianPhone": { en: "Please enter a valid Cambodian phone number", kh: "សូមបញ្ចូលលេខទូរស័ព្ទកម្ពុជាត្រឹមត្រូវ" },
  "profile.validation.companyNameRequired": { en: "Company name is required.", kh: "ត្រូវបញ្ចូលឈ្មោះក្រុមហ៊ុន។" },
  "profile.validation.dateOfBirthRequired": { en: "Date of birth is required.", kh: "ត្រូវបញ្ចូលថ្ងៃខែឆ្នាំកំណើត។" },
  "profile.validation.email": { en: "Please enter a valid email address", kh: "សូមបញ្ចូលអាសយដ្ឋានអ៊ីមែលត្រឹមត្រូវ" },
  "profile.validation.farmDistrictRequired": { en: "Farm district is required.", kh: "ត្រូវជ្រើសរើសស្រុក/ខណ្ឌកសិដ្ឋាន។" },
  "profile.validation.farmNameRequired": { en: "Farm name is required.", kh: "ត្រូវបញ្ចូលឈ្មោះកសិដ្ឋាន។" },
  "profile.validation.farmProvinceRequired": { en: "Farm province is required.", kh: "ត្រូវជ្រើសរើសខេត្ត/រាជធានីកសិដ្ឋាន។" },
  "profile.validation.farmSizeRequired": { en: "Farm size is required.", kh: "ត្រូវបញ្ចូលទំហំកសិដ្ឋាន។" },
  "profile.validation.fullNameRequired": { en: "Full name is required.", kh: "ត្រូវបញ្ចូលឈ្មោះពេញ។" },
  "profile.validation.fullNameMax": { en: "Full name cannot exceed 100 characters.", kh: "Full name cannot exceed 100 characters." },
  "profile.validation.ministryNameRequired": { en: "Ministry name is required.", kh: "ត្រូវបញ្ចូលឈ្មោះក្រសួង។" },
  "profile.validation.ministryNameMax": { en: "Ministry name cannot exceed 255 characters.", kh: "Ministry name cannot exceed 255 characters." },
  "profile.validation.placeOfBirthRequired": { en: "Place of birth is required.", kh: "ត្រូវបញ្ចូលទីកន្លែងកំណើត។" },
  "profile.validation.required": { en: "is required", kh: "ត្រូវបំពេញ" },
  "profile.validation.bioMax": { en: "Bio cannot exceed 100 characters.", kh: "Bio cannot exceed 100 characters." },
  "profile.validation.birthDateAge": { en: "Date of birth must be between 18 and 90 years old.", kh: "Date of birth must be between 18 and 90 years old." },
  "profile.validation.textOnly": { en: "Only letters and spaces are allowed.", kh: "Only letters and spaces are allowed." },
  "profile.village": { en: "Village", kh: "ភូមិ" },
} as const;

function getProfileText(language: string) {
  const lang: "en" | "kh" = language === "kh" ? "kh" : "en";

  return (key: string) =>
    PROFILE_TEXT[key as keyof typeof PROFILE_TEXT]?.[lang] ?? key;
}

function getFontClass(language: string) {
  return language === "kh" ? "font-khmer" : "font-thicccboi";
}

function isServiceUnavailableError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error ?? "");

  return (
    message === "SERVICE_UNAVAILABLE" ||
    /\b(5\d\d|service unavailable|external service|bad gateway|upstream|timeout)\b/i.test(
      message,
    )
  );
}


// ─── Shared Modal Backdrop ────────────────────────────────────────────────────

function ModalBackdrop({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useBodyScrollLock(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-1000 flex items-center justify-center bg-black/45 px-3 sm:px-4">
      {children}
    </div>,
    document.body,
  );
}

// ─── Shared Input ─────────────────────────────────────────────────────────────

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  required?: boolean;
  isDatePicker?: boolean;
};

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, required, isDatePicker, type, ...props }, ref) => {
    const internalRef = useRef<HTMLInputElement | null>(null);
    const { language } = useI18n();
  const t = getProfileText(language);
  const fontClass = getFontClass(language);
return (
      <div className={fontClass}>
        <label className="mb-2 block text-[14px] font-bold text-primary">
          {required && <span className="mr-1 text-red-500">*</span>}
          {label}
        </label>
        <div className="relative w-full">
          <input
            {...props}
            type={type}
            ref={(node) => {
              internalRef.current = node;
              if (typeof ref === "function") ref(node);
              else if (ref) ref.current = node;
            }}
            placeholder={`${t("profile.placeholder.enter")} ${label.toLowerCase()}`}
            className={`h-12 w-full rounded-4xl border bg-white px-4 text-[14px] font-medium text-primary-heading outline-none transition-all
              placeholder:text-[#9AA3AD] focus:bg-primary/5
              disabled:cursor-not-allowed disabled:opacity-60
              ${isDatePicker ? "cursor-pointer select-none" : ""}
              ${
                error
                  ? "border-red-400 focus:border-red-500"
                  : "border-light-grey focus:border-primary hover:border-primary/40"
              }`}
            onClick={() => {
              if (isDatePicker && internalRef.current) {
                try {
                  internalRef.current.showPicker();
                } catch {
                  internalRef.current.click();
                }
              }
            }}
          />
        </div>
        {error && (
          <p className="mt-1 text-[12px] font-medium text-red-500">{error}</p>
        )}
      </div>
    );
  },
);
Input.displayName = "Input";

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="mb-2 block text-[14px] font-bold text-primary">
        {label}
      </label>
      <input
        type="text"
        value={value}
        readOnly
        aria-readonly="true"
        className="h-12 w-full rounded-4xl border border-light-grey bg-gray-50 px-4 text-[14px]
          font-medium text-primary-heading outline-none"
      />
    </div>
  );
}

// ─── Shared Select ────────────────────────────────────────────────────────────

const SelectInput = memo(function SelectInput({
  label,
  value,
  options,
  onChange,
  error,
  disabled,
}: {
  label: string;
  value: string;
  options: LocationItem[];
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
}) {
  const { language } = useI18n();
  const t = getProfileText(language);
  const fontClass = getFontClass(language);
return (
    <div className={fontClass}>
      <label className="mb-2 block text-[14px] font-bold text-primary">
        {label}
      </label>
      <div className="relative w-full">
        <select
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className={`h-12 w-full appearance-none rounded-4xl border bg-white pl-4 pr-10 text-[14px] font-medium
            text-primary-heading outline-none transition-all
            disabled:cursor-not-allowed disabled:bg-gray-100
            ${
              error
                ? "border-red-400 focus:border-red-500"
                : "border-light-grey focus:border-primary hover:border-primary/40"
            }`}
        >
          <option value="">{t("profile.placeholder.select")} {label}</option>
          {options.map((item) => (
            <option key={item.id} value={item.id}>
              {item.nameKh ? `${item.nameKh} / ${item.nameEn}` : item.nameEn}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#9AA3AD]">
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>
      {error && (
        <p className="mt-1 text-[12px] font-medium text-red-500">{error}</p>
      )}
    </div>
  );
});

// ─── Province Select (auto-loads provinces) ───────────────────────────────────

const ProvinceSelect = memo(function ProvinceSelect({
  label,
  value,
  onChange,
  error,
  fallbackName,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  fallbackName?: string;
}) {
  const [items, setItems] = useState<LocationItem[]>([]);

  useEffect(() => {
    let active = true;
    (async () => {
      const provinces = await getProvinces().catch(() => []);
      if (!active) return;
      setItems(provinces);

      if (!value && fallbackName) {
        const match = findLocationByName(provinces, fallbackName);
        if (match) onChange(match.id);
      }
    })();
    return () => {
      active = false;
    };
  }, [fallbackName, onChange, value]);

  return (
    <SelectInput
      label={label}
      value={value}
      options={items}
      onChange={onChange}
      error={error}
    />
  );
});

// ─── Location Cascade (Province → District → Commune → Village) ───────────────

const LocationCascade = memo(function LocationCascade({
  label,
  provinceId,
  districtId,
  communeId,
  villageId,
  fallbackLocation,
  onChange,
  errors,
}: {
  label: string;
  provinceId: string;
  districtId: string;
  communeId: string;
  villageId: string;
  fallbackLocation?: string;
  onChange: (v: {
    provinceId: string;
    districtId: string;
    communeId: string;
    villageId: string;
  }) => void;
  errors?: {
    province?: string;
    district?: string;
    commune?: string;
    village?: string;
  };
}) {
  const [provinces, setProvinces] = useState<LocationItem[]>([]);
  const [districts, setDistricts] = useState<LocationItem[]>([]);
  const [communes, setCommunes] = useState<LocationItem[]>([]);
  const [villages, setVillages] = useState<LocationItem[]>([]);
  const { language } = useI18n();
  const t = getProfileText(language);
  const {
    provinceName,
    districtName,
    communeName,
    villageName,
  } = splitLocation(fallbackLocation);

  useEffect(() => {
    let active = true;

    getProvinces()
      .then((items) => {
        if (active) setProvinces(items);
      })
      .catch(() => {
        if (active) setProvinces([]);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    if (!provinceId) {
      setDistricts([]);
      return () => {
        active = false;
      };
    }

    getDistricts(provinceId)
      .then((items) => {
        if (active) setDistricts(items);
      })
      .catch(() => {
        if (active) setDistricts([]);
      });

    return () => {
      active = false;
    };
  }, [provinceId]);

  useEffect(() => {
    let active = true;

    if (!districtId) {
      setCommunes([]);
      return () => {
        active = false;
      };
    }

    getCommunes(districtId)
      .then((items) => {
        if (active) setCommunes(items);
      })
      .catch(() => {
        if (active) setCommunes([]);
      });

    return () => {
      active = false;
    };
  }, [districtId]);

  useEffect(() => {
    let active = true;

    if (!communeId) {
      setVillages([]);
      return () => {
        active = false;
      };
    }

    getVillages(communeId)
      .then((items) => {
        if (active) setVillages(items);
      })
      .catch(() => {
        if (active) setVillages([]);
      });

    return () => {
      active = false;
    };
  }, [communeId]);

  useEffect(() => {
    if (provinceId || !provinceName || provinces.length === 0) return;

    const matchedProvince = findLocationByName(provinces, provinceName);
    if (!matchedProvince) return;

    onChange({
      provinceId: matchedProvince.id,
      districtId: "",
      communeId: "",
      villageId: "",
    });
  }, [onChange, provinceId, provinceName, provinces]);

  useEffect(() => {
    if (!provinceId || districtId || !districtName || districts.length === 0) {
      return;
    }

    const matchedDistrict = findLocationByName(districts, districtName);
    if (!matchedDistrict) return;

    onChange({
      provinceId,
      districtId: matchedDistrict.id,
      communeId: "",
      villageId: "",
    });
  }, [districtId, districtName, districts, onChange, provinceId]);

  useEffect(() => {
    if (
      !provinceId ||
      !districtId ||
      communeId ||
      !communeName ||
      communes.length === 0
    ) {
      return;
    }

    const matchedCommune = findLocationByName(communes, communeName);
    if (!matchedCommune) return;

    onChange({
      provinceId,
      districtId,
      communeId: matchedCommune.id,
      villageId: "",
    });
  }, [communeId, communeName, communes, districtId, onChange, provinceId]);

  useEffect(() => {
    if (
      !provinceId ||
      !districtId ||
      !communeId ||
      villageId ||
      !villageName ||
      villages.length === 0
    ) {
      return;
    }

    const matchedVillage = findLocationByName(villages, villageName);
    if (!matchedVillage) return;

    onChange({
      provinceId,
      districtId,
      communeId,
      villageId: matchedVillage.id,
    });
  }, [
    communeId,
    districtId,
    onChange,
    provinceId,
    villageId,
    villageName,
    villages,
  ]);

  return (
    <div className="grid grid-cols-1 gap-x-5 gap-y-4 md:col-span-2 md:grid-cols-2">
      <SelectInput
        label={`${label} ${t("profile.province")}`}
        value={provinceId}
        options={provinces}
        error={errors?.province}
        onChange={(val) =>
          onChange({
            provinceId: val,
            districtId: "",
            communeId: "",
            villageId: "",
          })
        }
      />
      <SelectInput
        label={`${label} ${t("profile.district")}`}
        value={districtId}
        options={districts}
        disabled={!provinceId}
        error={errors?.district}
        onChange={(val) =>
          onChange({ provinceId, districtId: val, communeId: "", villageId: "" })
        }
      />
      <SelectInput
        label={`${label} ${t("profile.commune")}`}
        value={communeId}
        options={communes}
        disabled={!districtId}
        error={errors?.commune}
        onChange={(val) =>
          onChange({ provinceId, districtId, communeId: val, villageId: "" })
        }
      />
      <SelectInput
        label={`${label} ${t("profile.village")}`}
        value={villageId}
        options={villages}
        disabled={!communeId}
        error={errors?.village}
        onChange={(val) =>
          onChange({ provinceId, districtId, communeId, villageId: val })
        }
      />
    </div>
  );
});

// ─── Modal footer buttons (shared layout) ────────────────────────────────────

function ModalFooter({
  onClose,
  isLoading,
  submitLabel,
  loadingLabel,
  cols = 2,
}: {
  onClose: () => void;
  isLoading: boolean;
  submitLabel: string;
  loadingLabel: string;
  cols?: 1 | 2;
}) {
  const { language } = useI18n();
  const t = getProfileText(language);
  const fontClass = getFontClass(language);
return (
    <div
      className={`grid gap-3 border-t border-light-grey px-5 py-4 sm:gap-5 sm:px-6 ${fontClass} ${
        cols === 2 ? "grid-cols-2" : "flex justify-end"
      }`}
    >
      <button
        type="button"
        onClick={onClose}
        disabled={isLoading}
        className="h-12 cursor-pointer rounded-3xl border border-[#C9CED6] bg-white text-[14px] font-bold text-muted
          transition-colors duration-200 hover:border-muted hover:bg-muted/10
          disabled:cursor-not-allowed disabled:opacity-50"
      >
        {t("profile.btn-cancel")}
      </button>
      <button
        type="submit"
        disabled={isLoading}
        className="h-12 cursor-pointer rounded-3xl bg-primary text-[14px] font-bold text-white
          transition-colors duration-200 hover:bg-primary/90
          disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isLoading ? loadingLabel : submitLabel}
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 1.  PERSONAL INFORMATION MODAL
// ═══════════════════════════════════════════════════════════════════════════════

const FALLBACK_IMAGE = "/assets/no-profile.jpg";

function normalizeLocationName(value?: string | null) {
  return (value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/province$/i, "")
    .replace(/district$/i, "")
    .replace(/khan$/i, "")
    .replace(/commune$/i, "")
    .replace(/sangkat$/i, "")
    .replace(/village$/i, "")
    .trim();
}

function splitLocation(location?: string | null) {
  const parts = (location ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  return {
    // Supports old saved text like:
    // "District, Province"
    // "Village, Commune, District, Province"
    provinceName: parts.length >= 1 ? parts[parts.length - 1] : "",
    districtName: parts.length >= 2 ? parts[parts.length - 2] : "",
    communeName: parts.length >= 3 ? parts[parts.length - 3] : "",
    villageName: parts.length >= 4 ? parts[parts.length - 4] : "",
  };
}

function findLocationByName(items: LocationItem[], name?: string | null) {
  const normalized = normalizeLocationName(name);
  if (!normalized) return undefined;

  return items.find((item) => {
    const en = normalizeLocationName(item.nameEn);
    const kh = (item.nameKh ?? "").trim();
    const rawName = (name ?? "").trim();

    return en === normalized || kh === rawName;
  });
}

function readLocationValue(
  record: Record<string, unknown>,
  keys: string[],
): string {
  for (const key of keys) {
    const value = record[key];

    if (typeof value === "string") return value;
    if (typeof value === "number") return String(value);

    if (value && typeof value === "object") {
      const obj = value as Record<string, unknown>;

      if (typeof obj.id === "string") return obj.id;
      if (typeof obj.locationId === "string") return obj.locationId;
      if (typeof obj.provinceId === "string") return obj.provinceId;
      if (typeof obj.districtId === "string") return obj.districtId;
      if (typeof obj.communeId === "string") return obj.communeId;
      if (typeof obj.villageId === "string") return obj.villageId;
    }
  }

  return "";
}

function getDefaultValues(
  role: UserRole,
  profile: UserProfilePayload,
): PersonalInfoFormData {
  const basicInfo = (profile?.basicInfo ?? {}) as unknown as Record<
    string,
    unknown
  >;
  const personalInfo = (profile?.personalInfo ?? {}) as unknown as Record<
    string,
    unknown
  >;

  const rawDate = readString(personalInfo, ["dateOfBirth"]);
  const dateOfBirth = rawDate.includes("T") ? rawDate.split("T")[0] : rawDate;

  return {
    fullName: sanitizeLettersAndSpaces(readString(personalInfo, ["fullName"])),
    dateOfBirth,
    placeOfBirthProvinceId: readLocationValue(personalInfo, [
      "placeOfBirthProvinceId",
      "placeOfBirthProvince",
      "provinceId",
    ]),
    bio: readString(basicInfo, ["bio"]),

    farmName:
      role === "farmer"
        ? sanitizeLettersAndSpaces(readString(personalInfo, ["farmName"]))
        : "",
    farmSize: role === "farmer" ? readString(personalInfo, ["farmSize"]) : "",
    farmProvinceId:
      role === "farmer"
        ? readLocationValue(personalInfo, ["farmProvinceId", "farmProvince"])
        : "",
    farmDistrictId:
      role === "farmer"
        ? readLocationValue(personalInfo, ["farmDistrictId", "farmDistrict"])
        : "",
    farmCommuneId:
      role === "farmer"
        ? readLocationValue(personalInfo, ["farmCommuneId", "farmCommune"])
        : "",
    farmVillageId:
      role === "farmer"
        ? readLocationValue(personalInfo, ["farmVillageId", "farmVillage"])
        : "",

    companyName:
      role === "buyer"
        ? sanitizeLettersAndSpaces(readString(personalInfo, ["businessName"]))
        : "",
    businessType:
      role === "buyer"
        ? sanitizeLettersAndSpaces(readString(personalInfo, ["businessType"]))
        : "",
    businessProvinceId:
      role === "buyer"
        ? readLocationValue(personalInfo, ["businessProvinceId", "businessProvince"])
        : "",
    businessDistrictId:
      role === "buyer"
        ? readLocationValue(personalInfo, ["businessDistrictId", "businessDistrict"])
        : "",
    businessCommuneId:
      role === "buyer"
        ? readLocationValue(personalInfo, ["businessCommuneId", "businessCommune"])
        : "",
    businessVillageId:
      role === "buyer"
        ? readLocationValue(personalInfo, ["businessVillageId", "businessVillage"])
        : "",

    ministryName:
      role === "government"
        ? sanitizeLettersAndSpaces(readString(personalInfo, ["ministryName"]))
        : "",
    addressProvinceId:
      role === "government"
        ? readLocationValue(personalInfo, ["addressProvinceId", "addressProvince"])
        : "",
    addressDistrictId:
      role === "government"
        ? readLocationValue(personalInfo, ["addressDistrictId", "addressDistrict"])
        : "",
    addressCommuneId:
      role === "government"
        ? readLocationValue(personalInfo, ["addressCommuneId", "addressCommune"])
        : "",
    addressVillageId:
      role === "government"
        ? readLocationValue(personalInfo, ["addressVillageId", "addressVillage"])
        : "",
  };
}

type PersonalInfoProps = {
  role: UserRole;
  profile: UserProfilePayload;
  onClose: () => void;
};

const PROFILE_TEXT_ONLY_REGEX = /^[A-Za-z\s]*$/;

function getAgeFromDateInput(value: string) {
  const [year, month, day] = value.split("-").map(Number);

  if (!year || !month || !day) return null;

  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  const today = new Date();
  let age = today.getFullYear() - date.getFullYear();
  const monthDiff = today.getMonth() - date.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < date.getDate())
  ) {
    age -= 1;
  }

  return age;
}

function isAgeBetween(value: string, minimumAge: number, maximumAge: number) {
  if (!value) return true;

  const age = getAgeFromDateInput(value);

  return age !== null && age >= minimumAge && age <= maximumAge;
}

function normalizeTextOnlyValue(value?: string) {
  return sanitizeLettersAndSpaces(value ?? "")
    .replace(/\s+/g, " ")
    .trim();
}

const createPersonalInfoSchema = (
  t: (key: string) => string,
  role: UserRole,
) =>
  z
    .object({
      fullName: z
        .string()
        .max(100, t("profile.validation.fullNameMax"))
        .regex(PROFILE_TEXT_ONLY_REGEX, t("profile.validation.textOnly"))
        .optional(),
      dateOfBirth: z
        .string()
        .refine((value) => isAgeBetween(value, 18, 90), {
          message: t("profile.validation.birthDateAge"),
        })
        .optional(),
      placeOfBirthProvinceId: z.string().optional(),

      bio: z.string().max(100, t("profile.validation.bioMax")).optional(),

      farmName: z.string().optional(),
      farmSize: z.string().optional(),
      farmProvinceId: z.string().optional(),
      farmDistrictId: z.string().optional(),
      farmCommuneId: z.string().optional(),
      farmVillageId: z.string().optional(),

      companyName: z.string().optional(),
      businessType: z.string().optional(),
      businessProvinceId: z.string().optional(),
      businessDistrictId: z.string().optional(),
      businessCommuneId: z.string().optional(),
      businessVillageId: z.string().optional(),

      ministryName: z
        .string()
        .max(255, t("profile.validation.ministryNameMax"))
        .regex(PROFILE_TEXT_ONLY_REGEX, t("profile.validation.textOnly"))
        .optional(),
      addressProvinceId: z.string().optional(),
      addressDistrictId: z.string().optional(),
      addressCommuneId: z.string().optional(),
      addressVillageId: z.string().optional(),
    })
    .superRefine((data, ctx) => {
      const required = (
        field: keyof PersonalInfoFormData,
        message: string,
      ) => {
        const value = data[field];

        if (!value || String(value).trim() === "") {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: [field],
            message,
          });
        }
      };

      if (role === "farmer") {
        required("fullName", t("profile.validation.fullNameRequired"));
        required("dateOfBirth", t("profile.validation.dateOfBirthRequired"));
        required(
          "placeOfBirthProvinceId",
          t("profile.validation.placeOfBirthRequired"),
        );
        required("farmName", t("profile.validation.farmNameRequired"));
        required("farmSize", t("profile.validation.farmSizeRequired"));
        required("farmProvinceId", t("profile.validation.farmProvinceRequired"));
        required("farmDistrictId", t("profile.validation.farmDistrictRequired"));
      }

      if (role === "buyer") {
        required("fullName", t("profile.validation.fullNameRequired"));
        required("dateOfBirth", t("profile.validation.dateOfBirthRequired"));
        required(
          "placeOfBirthProvinceId",
          t("profile.validation.placeOfBirthRequired"),
        );
        required("companyName", t("profile.validation.companyNameRequired"));
        required("businessType", t("profile.validation.businessTypeRequired"));
        required(
          "businessProvinceId",
          t("profile.validation.businessProvinceRequired"),
        );
        required(
          "businessDistrictId",
          t("profile.validation.businessDistrictRequired"),
        );
      }

      if (role === "government") {
        required("ministryName", t("profile.validation.ministryNameRequired"));
        required(
          "addressProvinceId",
          t("profile.validation.addressProvinceRequired"),
        );
        required(
          "addressDistrictId",
          t("profile.validation.addressDistrictRequired"),
        );
      }
    });

export function PersonalInformation({
  role,
  profile,
  onClose,
}: PersonalInfoProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { language } = useI18n();
  const t = getProfileText(language);
  const fontClass = getFontClass(language);
  const defaultValues = getDefaultValues(role, profile);

  const schema = useMemo(
    () => createPersonalInfoSchema(t, role),
    [t, role],
  );

  const initialProfileUrl =
    getFileUrl(profile?.basicInfo?.profileUrl) || FALLBACK_IMAGE;

  const [profileImage, setProfileImage] = useState(initialProfileUrl);
  const [isImageDirty, setIsImageDirty] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    getValues,
    setValue,
    watch,
  } = useForm<PersonalInfoFormData>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues,
  });

  const personalInfoRecord = (profile?.personalInfo ?? {}) as unknown as Record<
    string,
    unknown
  >;
  const rawBakongAccountId = readString(personalInfoRecord, [
    "bakongAccountId",
    "bakong_account_id",
  ]).trim();
  const bakongAccountId =
    rawBakongAccountId && rawBakongAccountId.toLowerCase() !== "string"
      ? rawBakongAccountId
      : t("profile.bakong.notAdded");

  const farmLocationFallback = readString(personalInfoRecord, [
    "farmLocation",
    "farmAddress",
  ]);

  const businessLocationFallback = readString(personalInfoRecord, [
    "businessAddress",
    "businessLocation",
  ]);

  const governmentLocationFallback = readString(personalInfoRecord, [
    "address",
    "governmentAddress",
  ]);

  const farmDistrictId = watch("farmDistrictId");
  const farmCommuneId = watch("farmCommuneId");
  const farmVillageId = watch("farmVillageId");

  const businessDistrictId = watch("businessDistrictId");
  const businessCommuneId = watch("businessCommuneId");
  const businessVillageId = watch("businessVillageId");

  const addressDistrictId = watch("addressDistrictId");
  const addressCommuneId = watch("addressCommuneId");
  const addressVillageId = watch("addressVillageId");

  const handleProfileImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedTypes = ["image/png", "image/jpg", "image/jpeg"];

    if (!allowedTypes.includes(file.type)) {
      showApiError(new Error(t("profile.image.invalidType")));
      event.target.value = "";
      return;
    }

    setProfileImage(URL.createObjectURL(file));
    setSelectedFile(file);
    setIsImageDirty(true);
    event.target.value = "";
  };

  const handleLettersOnlyInput = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    event.target.value = sanitizeLettersAndSpaces(event.target.value);
  };

  const onSubmit = async () => {
    const currentValues = getValues();

    const values = {
      ...currentValues,
      fullName: normalizeTextOnlyValue(currentValues.fullName),
      companyName: normalizeTextOnlyValue(currentValues.companyName),
      businessType: normalizeTextOnlyValue(currentValues.businessType),
      farmName: normalizeTextOnlyValue(currentValues.farmName),
      ministryName: normalizeTextOnlyValue(currentValues.ministryName),
    };

    setValue("fullName", values.fullName, { shouldValidate: true });
    setValue("companyName", values.companyName, { shouldValidate: true });
    setValue("businessType", values.businessType, { shouldValidate: true });
    setValue("farmName", values.farmName, { shouldValidate: true });
    setValue("ministryName", values.ministryName, { shouldValidate: true });

    try {
      setIsSubmitting(true);

      let profileUrl = profile.basicInfo.profileUrl || "";

      if (isImageDirty && selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);

        const uploaded = await uploadAttachment(formData);
        profileUrl = uploaded.fileUrl || uploaded.fileName || profileUrl;
      }

      const commonPayload = {
        bio: values.bio || "",
        profileUrl,
      };

      if (role === "farmer") {
        await updateFarmerProfile({
          ...commonPayload,
          fullName: values.fullName || "",
          dateOfBirth: values.dateOfBirth || "",
          placeOfBirthProvinceId: values.placeOfBirthProvinceId || "",
          farmName: values.farmName || "",
          farmSize: Number(values.farmSize || 0),
          farmProvinceId: values.farmProvinceId || "",
          farmDistrictId: values.farmDistrictId || "",
          farmCommuneId: values.farmCommuneId || "",
          farmVillageId: values.farmVillageId || "",
        });
      } else if (role === "buyer") {
        await updateBuyerProfile({
          ...commonPayload,
          fullName: values.fullName || "",
          dateOfBirth: values.dateOfBirth || "",
          placeOfBirthProvinceId: values.placeOfBirthProvinceId || "",
          businessName: values.companyName || "",
          businessType: values.businessType || "",
          businessProvinceId: values.businessProvinceId || "",
          businessDistrictId: values.businessDistrictId || "",
          businessCommuneId: values.businessCommuneId || "",
          businessVillageId: values.businessVillageId || "",
        });
      } else if (role === "government") {
        await updateGovernmentProfile({
          ...commonPayload,
          ministryName: values.ministryName || "",
          addressProvinceId: values.addressProvinceId || "",
          addressDistrictId: values.addressDistrictId || "",
          addressCommuneId: values.addressCommuneId || "",
          addressVillageId: values.addressVillageId || "",
        });
      }

      emitProfileImageUpdated(profileUrl);

      showApiSuccess(t("profile.popupEditSucc"));
      router.refresh();
      setTimeout(onClose, 800);
    } catch (error) {
      showApiError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ModalBackdrop>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className={`relative flex max-h-[88vh] w-full max-w-[95vw] flex-col rounded-[24px] bg-white
          shadow-[0_20px_60px_rgba(0,0,0,0.18)]
          sm:max-w-140 md:max-w-162.5 lg:max-w-180
          animate-in fade-in zoom-in-95 duration-200 ${fontClass}`}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-light-grey px-5 py-4 sm:px-6">
          <h2 className="text-[20px] font-bold text-primary-heading sm:text-[22px]">
            {t("profile.editPro")}
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-full p-2 transition-colors hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 sm:px-6">
          {/* Avatar picker */}
          <div className="mb-6 flex justify-center">
            <div className="relative h-30 w-30">
              <div className="absolute inset-0 overflow-hidden rounded-full border-4 border-[#F6EBD0] bg-light-grey">
                {profileImage && (
                  <Image
                    src={profileImage}
                    alt="Profile image"
                    fill
                    className="object-cover transition-opacity duration-300"
                    onError={() => setProfileImage(FALLBACK_IMAGE)}
                    unoptimized={profileImage.startsWith("blob:")}
                  />
                )}
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-2 flex h-10 w-10 cursor-pointer items-center justify-center
                  rounded-full border-4 border-white bg-light-grey text-primary shadow-lg
                  transition-transform duration-150 hover:scale-110 active:scale-95"
              >
                <Camera className="h-4 w-4" />
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept=".png,.jpg,.jpeg,image/png,image/jpg,image/jpeg"
                onChange={handleProfileImageChange}
                className="hidden"
              />
            </div>
          </div>

          {/* Personal info section */}
          <section>
            <div className="mb-4 border-b border-light-grey pb-3">
              <h3 className="text-[17px] font-bold text-primary-heading">
                {t("profile.edit-personalInfo")}
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-x-5 gap-y-4 md:grid-cols-2">
              {role !== "government" && (
                <>
                  <Input
                    label={t("profile.fullN")}
                    error={errors.fullName?.message}
                    maxLength={100}
                    {...register("fullName", {
                      onChange: handleLettersOnlyInput,
                    })}
                  />

                  <div>
                    <label className="mb-2 block text-[14px] font-bold text-primary">
                      {t("profile.date")}
                    </label>
                    <Controller
                      name="dateOfBirth"
                      control={control}
                      render={({ field }) => (
                        <DatePickerComponent
                          id="profile-date-of-birth"
                          label={t("profile.date")}
                          value={field.value ?? ""}
                          minDate="1900-01-01"
                          invalid={Boolean(errors.dateOfBirth)}
                          onBlur={field.onBlur}
                          onChange={field.onChange}
                          groupClassName="rounded-4xl"
                        />
                      )}
                    />
                    {errors.dateOfBirth?.message && (
                      <p className="mt-1 text-[12px] font-medium text-red-500">
                        {errors.dateOfBirth.message}
                      </p>
                    )}
                  </div>

                  <Controller
                    name="placeOfBirthProvinceId"
                    control={control}
                    render={({ field }) => (
                      <ProvinceSelect
                        label={t("profile.pob")}
                        value={field.value ?? ""}
                        onChange={field.onChange}
                        error={errors.placeOfBirthProvinceId?.message}
                        fallbackName={profile?.personalInfo?.placeOfBirth}
                      />
                    )}
                  />

                  <ReadOnlyField
                    label={t("profile.bakong.id")}
                    value={bakongAccountId}
                  />
                </>
              )}

              {role === "government" && (
                <>
                  <Input
                    label={t("profile.mName")}
                    error={errors.ministryName?.message}
                    maxLength={255}
                    {...register("ministryName", {
                      onChange: handleLettersOnlyInput,
                    })}
                  />

                  <ReadOnlyField
                    label={t("profile.bakong.id")}
                    value={bakongAccountId}
                  />
                </>
              )}

              <div className="md:col-span-2">
                <label className="mb-2 block text-[14px] font-bold text-primary">
                  {t("profile.bio")}
                </label>

                <textarea
                  {...register("bio")}
                  maxLength={100}
                  rows={3}
                  className={`w-full resize-none rounded-4xl border bg-white px-4 py-3 text-[14px] font-medium
                    text-primary-heading outline-none transition-all
                    ${
                      errors.bio
                        ? "border-red-400 focus:border-red-500"
                        : "border-light-grey focus:border-primary hover:border-primary/40"
                    }`}
                />

                {errors.bio?.message && (
                  <p className="mt-1 text-[12px] font-medium text-red-500">
                    {errors.bio.message}
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* Farmer — Farm Information */}
          {role === "farmer" && (
            <section className="mt-6">
              <div className="mb-4 border-b border-light-grey pb-3">
                <h3 className="text-[17px] font-bold text-primary-heading">
                  {t("profile.farmInfo")}
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-x-5 gap-y-4 md:grid-cols-2">
                <Input
                  label={t("profile.farmName")}
                  error={errors.farmName?.message}
                  {...register("farmName", {
                    onChange: handleLettersOnlyInput,
                  })}
                />

                <Input
                  label={t("profile.farm")}
                  error={errors.farmSize?.message}
                  {...register("farmSize")}
                />

                <Controller
                  name="farmProvinceId"
                  control={control}
                  render={({ field }) => (
                    <LocationCascade
                      label={t("profile.farmLoc")}
                      provinceId={field.value ?? ""}
                      districtId={farmDistrictId ?? ""}
                      communeId={farmCommuneId ?? ""}
                      villageId={farmVillageId ?? ""}
                      fallbackLocation={farmLocationFallback}
                      errors={{
                        province: errors.farmProvinceId?.message,
                        district: errors.farmDistrictId?.message,
                        commune: errors.farmCommuneId?.message,
                        village: errors.farmVillageId?.message,
                      }}
                      onChange={(loc) => {
                        setValue("farmProvinceId", loc.provinceId, {
                          shouldValidate: true,
                          shouldDirty: true,
                        });
                        setValue("farmDistrictId", loc.districtId, {
                          shouldValidate: true,
                          shouldDirty: true,
                        });
                        setValue("farmCommuneId", loc.communeId, {
                          shouldValidate: true,
                          shouldDirty: true,
                        });
                        setValue("farmVillageId", loc.villageId, {
                          shouldValidate: true,
                          shouldDirty: true,
                        });
                      }}
                    />
                  )}
                />
              </div>
            </section>
          )}

          {/* Buyer — Business Information */}
          {role === "buyer" && (
            <section className="mt-6">
              <div className="mb-4 border-b border-light-grey pb-3">
                <h3 className="text-[17px] font-bold text-primary-heading">
                  {t("profile.busInfo")}
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-x-5 gap-y-4 md:grid-cols-2">
                <Input
                  label={t("profile.companyName")}
                  error={errors.companyName?.message}
                  {...register("companyName", {
                    onChange: handleLettersOnlyInput,
                  })}
                />

                <Input
                  label={t("profile.busType")}
                  error={errors.businessType?.message}
                  {...register("businessType", {
                    onChange: handleLettersOnlyInput,
                  })}
                />

                <Controller
                  name="businessProvinceId"
                  control={control}
                  render={({ field }) => (
                    <LocationCascade
                      label={t("profile.businessAddress")}
                      provinceId={field.value ?? ""}
                      districtId={businessDistrictId ?? ""}
                      communeId={businessCommuneId ?? ""}
                      villageId={businessVillageId ?? ""}
                      fallbackLocation={businessLocationFallback}
                      errors={{
                        province: errors.businessProvinceId?.message,
                        district: errors.businessDistrictId?.message,
                        commune: errors.businessCommuneId?.message,
                        village: errors.businessVillageId?.message,
                      }}
                      onChange={(loc) => {
                        setValue("businessProvinceId", loc.provinceId, {
                          shouldValidate: true,
                          shouldDirty: true,
                        });
                        setValue("businessDistrictId", loc.districtId, {
                          shouldValidate: true,
                          shouldDirty: true,
                        });
                        setValue("businessCommuneId", loc.communeId, {
                          shouldValidate: true,
                          shouldDirty: true,
                        });
                        setValue("businessVillageId", loc.villageId, {
                          shouldValidate: true,
                          shouldDirty: true,
                        });
                      }}
                    />
                  )}
                />
              </div>
            </section>
          )}

          {/* Government — Address */}
          {role === "government" && (
            <section className="mt-6">
              <div className="mb-4 border-b border-light-grey pb-3">
                <h3 className="text-[17px] font-bold text-primary-heading">
                  {t("profile.govAddress")}
                </h3>
              </div>

              <Controller
                name="addressProvinceId"
                control={control}
                render={({ field }) => (
                  <LocationCascade
                    label={t("profile.address")}
                    provinceId={field.value ?? ""}
                    districtId={addressDistrictId ?? ""}
                    communeId={addressCommuneId ?? ""}
                    villageId={addressVillageId ?? ""}
                    fallbackLocation={governmentLocationFallback}
                    errors={{
                      province: errors.addressProvinceId?.message,
                      district: errors.addressDistrictId?.message,
                      commune: errors.addressCommuneId?.message,
                      village: errors.addressVillageId?.message,
                    }}
                    onChange={(loc) => {
                      setValue("addressProvinceId", loc.provinceId, {
                        shouldValidate: true,
                        shouldDirty: true,
                      });
                      setValue("addressDistrictId", loc.districtId, {
                        shouldValidate: true,
                        shouldDirty: true,
                      });
                      setValue("addressCommuneId", loc.communeId, {
                        shouldValidate: true,
                        shouldDirty: true,
                      });
                      setValue("addressVillageId", loc.villageId, {
                        shouldValidate: true,
                        shouldDirty: true,
                      });
                    }}
                  />
                )}
              />
            </section>
          )}
        </div>

        <ModalFooter
          onClose={onClose}
          isLoading={isSubmitting}
          submitLabel={t("profile.submit")}
          loadingLabel={t("profile.label.submitting")}
        />
      </form>
    </ModalBackdrop>
  );
}

// Password modal
const getPasswordSchema = (t: (key: string) => string) => 
  z.object({
    currentPassword: z.string().min(1, t("profile.currentPw.required")),
    newPassword: z
      .string()
      .min(8, t("profile.pw.description"))
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).+$/,
        t("profile.pw.pattern"),
      ),
    confirmPassword: z.string().min(1, t("profile.pw.confirm")),
  }).refine((data) => data.newPassword === data.confirmPassword, {
    message: t("profile.pw.message"),
    path: ["confirmPassword"],
  }).refine((data) => data.newPassword !== data.currentPassword, {
    message: t("profile.pw.sameAsCurrent"),
    path: ["newPassword"],
  });

type PasswordFormData = z.infer<ReturnType<typeof getPasswordSchema>>;

interface PasswordInputProps {
  label: string;
  register: UseFormRegisterReturn;
  error?: string;
  disabled?: boolean;
}

const PasswordInput = ({ label, register, error, disabled }: PasswordInputProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const { language } = useI18n();
  const t = getProfileText(language);
  const fontClass = getFontClass(language);
return (
    <div className={fontClass}>
      <label className="mb-2 block text-[14px] font-bold text-primary">
        <span className="mr-1 text-red-500">*</span>
        {label}
      </label>
      <div className="relative w-full">
        <input
          {...register}
          type={showPassword ? "text" : "password"}
          disabled={disabled}
          placeholder={`${t("profile.placeholder.enter")} ${label.toLowerCase()}`}
          className={`h-12 w-full rounded-4xl border bg-white px-4 text-[14px] font-medium text-primary-heading outline-none transition-all pr-12
            placeholder:text-[#9AA3AD] focus:bg-primary/5
            disabled:cursor-not-allowed disabled:opacity-60
            ${
              error
                ? "border-red-400 focus:border-red-500"
                : "border-light-grey focus:border-primary hover:border-primary/40"
            }`}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          disabled={disabled}
          className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-[#9AA3AD] transition-colors duration-200 hover:bg-gray-100 hover:text-primary-heading active:scale-95 disabled:opacity-50"
          aria-label={showPassword ? t("profile.password.hide") : t("profile.password.show")}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={showPassword ? "hide-password" : "show-password"}
              initial={{ opacity: 0.75, scaleY: 0.12 }}
              animate={{ opacity: 1, scaleY: 1 }}
              exit={{ opacity: 0.75, scaleY: 0.12 }}
              transition={{ duration: 0.22, ease: "easeInOut" }}
              className="origin-center"
            >
              {showPassword ? (
                <EyeClosed className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </motion.span>
          </AnimatePresence>
        </button>
      </div>
      {error && (
        <p className="mt-1 text-[12px] font-medium text-red-500">{error}</p>
      )}
    </div>
  );
};

export function UpdatePassword({ onClose }: { onClose: () => void }) {
  const [isLoading, setIsLoading] = useState(false);
  const [pendingPasswordData, setPendingPasswordData] =
    useState<PasswordFormData | null>(null);
  const { language } = useI18n();
  const t = getProfileText(language);
  const fontClass = getFontClass(language);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(getPasswordSchema(t)), 
    mode: "onChange",
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: PasswordFormData) => {
    setPendingPasswordData(data);
  };

  const handleConfirmPasswordChange = async () => {
    if (!pendingPasswordData) return;

    setIsLoading(true);
    let shouldLogout = false;

    try {
      await changePassword({
        currentPassword: pendingPasswordData.currentPassword,
        newPassword: pendingPasswordData.newPassword,
        confirmPassword: pendingPasswordData.confirmPassword,
      });
      showApiSuccess(t("profile.pw.updateSuc"));
      setPendingPasswordData(null);
      onClose();
      shouldLogout = true;
    } catch (error) {
      const apiMessage = error instanceof Error ? error.message.trim() : "";
      const rawMessage = apiMessage.toLowerCase();
      // Backends phrase this a few ways ("current/old password is incorrect /
      // does not match / invalid"); collapse them into one clear message.
      const isWrongCurrentPassword =
        /(current|old)\s*password/.test(rawMessage) &&
        /(incorrect|invalid|wrong|not match|mismatch|does not match)/.test(rawMessage);

      const friendlyMessage = isWrongCurrentPassword
        ? t("profile.pw.currentIncorrect")
        : apiMessage || t("profile.pw.updateFail");

      showApiError(new Error(friendlyMessage));
    } finally {
      setIsLoading(false);
    }

    if (shouldLogout) {
      await logoutAction();
    }
  };

  const handleCancelConfirmation = () => {
    if (isLoading) return;
    setPendingPasswordData(null);
  };

  return (
    <ModalBackdrop>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className={`relative w-full max-w-[95vw] rounded-[24px] bg-white
          shadow-[0_20px_60px_rgba(0,0,0,0.18)]
          sm:max-w-130
          animate-in fade-in zoom-in-95 duration-200 ${fontClass}`}
      >
        <div className="flex items-start justify-between border-b border-light-grey px-5 py-4 sm:px-6">
          <div>
            <h2 className="text-[20px] font-bold text-primary-heading">
              {t("profile.updatePw")}
            </h2>
            <p className="mt-1 text-[14px] text-secondary-body">
              {t("profile.updatePw.description")}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="cursor-pointer rounded-full p-2 transition-colors hover:bg-gray-100 disabled:opacity-50"
          >
            <X className="h-5 w-5 text-primary-heading" />
          </button>
        </div>

        <div className="space-y-4 px-5 py-5 sm:px-6">
          <PasswordInput
            label={t("profile.currentPw")}
            register={register("currentPassword")}
            error={errors.currentPassword?.message}
            disabled={isLoading}
          />
          <PasswordInput
            label={t("profile.newPw")}
            register={register("newPassword")}
            error={errors.newPassword?.message}
            disabled={isLoading}
          />
          <PasswordInput
            label={t("profile.confirmPw")}
            register={register("confirmPassword")}
            error={errors.confirmPassword?.message}
            disabled={isLoading}
          />
        </div>

        <ModalFooter
          onClose={onClose}
          isLoading={isLoading}
          submitLabel={t("profile.update")}
          loadingLabel={t("profile.label.updating")}
        />

        {pendingPasswordData && (
          <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/45 px-4">
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="password-change-confirm-title"
              className={`w-full max-w-105 rounded-[20px] bg-white p-5 shadow-[0_20px_60px_rgba(0,0,0,0.22)] sm:p-6 ${fontClass}`}
            >
              <h3
                id="password-change-confirm-title"
                className="text-[18px] font-bold text-primary-heading"
              >
                {t("profile.pw.redirectTitle")}
              </h3>
              <p className="mt-2 text-[14px] leading-6 text-secondary-body">
                {t("profile.pw.redirectConfirm")}
              </p>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleCancelConfirmation}
                  disabled={isLoading}
                  className="h-11 rounded-3xl border border-[#C9CED6] bg-white text-[14px] font-bold text-muted transition-colors hover:border-muted hover:bg-muted/10 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {t("profile.btn-cancel")}
                </button>
                <button
                  type="button"
                  onClick={handleConfirmPasswordChange}
                  disabled={isLoading}
                  className="h-11 rounded-3xl bg-primary text-[14px] font-bold text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isLoading
                    ? t("profile.label.updating")
                    : t("profile.pw.redirectContinue")}
                </button>
              </div>
            </div>
          </div>
        )}
      </form>
    </ModalBackdrop>
  );
}

// ─── Add Login Identifier Modal (Add Email or Phone) ─────────────────────────

 // adjust path as needed

// type IdentifierType = "email" | "phone";

// type AddLoginIdentifierProps = {
//   /** Which identifier is MISSING for this user — determines what the form asks for */
//   missingType: IdentifierType;
//   onClose: () => void;
//   /** Called after successful OTP verification so parent can refresh profile */
//   onSuccess?: () => void;
// };

type IdentifierType = "email" | "phone";

type AddLoginIdentifierProps = {
  missingType: IdentifierType;
  onClose: () => void;
  onSuccess?: () => void;
};

type AddIdentifierStep = "input" | "otp";

export function AddLoginIdentifier({
  missingType,
  onClose,
  onSuccess,
}: AddLoginIdentifierProps) {
  const [step, setStep] = useState<AddIdentifierStep>("input");
  const [identifier, setIdentifier] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpValues, setOtpValues] = useState(["", "", "", "", "", ""]);
  const [timeLeft, setTimeLeft] = useState(59);
  const [inputValue, setInputValue] = useState("");
  const [inputError, setInputError] = useState("");
  const [otpError, setOtpError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const otpInputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const { language } = useI18n();
  const t = getProfileText(language);
  const fontClass = getFontClass(language);
  const label = missingType === "email" ? t("profile.identifier.emailAddress") : t("profile.identifier.phoneNumber");
  const placeholder =
    missingType === "email"
      ? t("profile.placeholder.email")
      : t("profile.placeholder.phone");

  const normalizePhoneForRequest = (value: string) => {
    const digits = value.replace(/\D/g, "");

    if (!digits) return "";
    return digits.startsWith("0") ? digits : `0${digits}`;
  };

  const validate = (val: string): string => {
    const value =
      missingType === "phone" ? normalizePhoneForRequest(val) : val.trim();

    if (!value) return `${label} ${t("profile.validation.required")}`;

    if (missingType === "email") {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return t("profile.validation.email") ;
      }
    } else {
      if (!/^0\d{8,9}$/.test(value)) {
        return t("profile.validation.cambodianPhone");
      }
    }

    return "";
  };

  useEffect(() => {
    if (step !== "otp") return;

    const timeoutId = window.setTimeout(() => {
      otpInputRefs.current[0]?.focus();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [step]);

  useEffect(() => {
    if (step !== "otp" || timeLeft === 0) return;

    const timerId = window.setInterval(() => {
      setTimeLeft((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [step, timeLeft]);

  const handleSendOtp = async () => {
    const cleanValue =
      missingType === "phone"
        ? normalizePhoneForRequest(inputValue)
        : inputValue.trim();
    const err = validate(cleanValue);

    if (err) {
      setInputError(err);
      return;
    }

    setInputError("");
    setIsLoading(true);

    const result = await addLoginIdentifierOtpAction(cleanValue);

    if (!result.success) {
      showApiError(
        isServiceUnavailableError(new Error(result.error))
          ? new Error(t("profile.serviceUnavailable"))
          : new Error(result.error),
      );
      setIsLoading(false);
      return;
    }

    try {
      setIdentifier(cleanValue);
      setOtpCode("");
      setOtpValues(["", "", "", "", "", ""]);
      setTimeLeft(59);
      setStep("otp");
      showApiSuccess(t("profile.otp.sentSuccess"));
    } catch (error) {
      showApiError(
        isServiceUnavailableError(error)
          ? new Error(t("profile.serviceUnavailable"))
          : error,
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitIdentifier = async (codeOverride?: string) => {
    const cleanOtpCode = (codeOverride ?? otpCode).trim();

    if (!cleanOtpCode) {
      setOtpError(t("profile.otp.required"));
      return;
    }
    if (!/^\d{6}$/.test(cleanOtpCode)) {
      setOtpError(t("profile.otp.mustBeSixDigits"));
      return;
    }

    setOtpError("");
    setIsLoading(true);

    try {
      await updateLoginIdentifierAction(identifier, cleanOtpCode);

      showApiSuccess(`${label} ${t("profile.identifier.addedSuccess")}`);
      onSuccess?.();
      onClose();
    } catch (error) {
      showApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (value: string, index: number) => {
    if (!/^\d?$/.test(value)) return;

    const nextValues = [...otpValues];
    nextValues[index] = value;
    const nextCode = nextValues.join("");

    setOtpValues(nextValues);
    setOtpCode(nextCode);
    if (otpError) setOtpError("");

    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }

    if (value && index === 5 && nextCode.length === 6) {
      window.setTimeout(() => {
        void handleSubmitIdentifier(nextCode);
      }, 100);
    }
  };

  const handleOtpKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    if (event.key === "Backspace" && !otpValues[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleResendOtp = async () => {
    if (timeLeft > 0 || isLoading) return;

    setIsLoading(true);

    try {
      const result = await addLoginIdentifierOtpAction(identifier);

      if (!result.success) {
        showApiError(
          isServiceUnavailableError(new Error(result.error))
            ? new Error(t("profile.serviceUnavailable"))
            : new Error(result.error),
        );
        return;
      }

      setOtpCode("");
      setOtpValues(["", "", "", "", "", ""]);
      setTimeLeft(59);
      setOtpError("");
      showApiSuccess(`${t("profile.otp.sentTo")} ${maskIdentifier(identifier)}.`);
      window.setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 0);
    } catch (error) {
      showApiError(
        isServiceUnavailableError(error)
          ? new Error(t("profile.serviceUnavailable"))
          : error,
      );
    } finally {
      setIsLoading(false);
    }
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${minutes}:${seconds.toString().padStart(2, "0")}`;

  return (
    <ModalBackdrop>
      <div
        className={`relative w-full max-w-[95vw] rounded-[24px] bg-white
          shadow-[0_20px_60px_rgba(0,0,0,0.18)]
          sm:max-w-120
          animate-in fade-in zoom-in-95 duration-200 ${fontClass}`}
      >
        <div className="flex items-start justify-between border-b border-light-grey px-5 py-4 sm:px-6">
          <div>
            <h2 className="text-[20px] font-bold text-primary-heading">
              {step === "input" ? `${t("profile.identifier.add")} ${label}` : t("profile.identifier.verifyOtp")}
            </h2>
            <p className="mt-1 text-[14px] text-secondary-body">
              {step === "input"
                ? missingType === "email"
                  ? t("profile.identifier.addEmailDescription")
                  : t("profile.identifier.addPhoneDescription")
                : `${t("profile.otp.enterCodeSentTo")} ${maskIdentifier(identifier)}.`}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="cursor-pointer rounded-full p-2 transition-colors hover:bg-gray-100 disabled:opacity-50"
          >
            <X className="h-5 w-5 text-primary-heading" />
          </button>
        </div>

        <div className="px-5 py-5 sm:px-6">
          {step === "input" ? (
            <div>
              <label className="mb-2 block text-[14px] font-bold text-primary">
                <span className="mr-1 text-red-500">*</span>
                {label}
              </label>

              {missingType === "phone" ? (
                <div
                  className={`flex h-13.5 w-full items-center rounded-3xl border bg-white transition-all focus-within:border-primary focus-within:bg-primary/5 ${
                    inputError ? "border-red-400" : "border-light-grey"
                  }`}
                >
                  <div className="flex h-full shrink-0 items-center gap-2 border-r border-light-grey px-4">
                    <Image
                      src="/assets/kh-flag.png"
                      alt="Cambodia flag"
                      width={26}
                      height={18}
                      className="h-4.5 w-6.5 rounded-sm object-cover"
                    />
                    <span className="text-[14px] font-medium text-primary-heading">
                      (+855)
                    </span>
                  </div>

                  <input
                    type="tel"
                    inputMode="numeric"
                    value={inputValue}
                    onChange={(e) => {
                      const nextValue = e.target.value.replace(/\D/g, "");
                      setInputValue(nextValue);
                      if (inputError) setInputError(validate(nextValue));
                    }}
                    placeholder={placeholder}
                    disabled={isLoading}
                    className="h-full min-w-0 flex-1 rounded-r-3xl bg-transparent px-4 text-[14px] font-medium text-primary-heading outline-none placeholder:text-[#9AA3AD] disabled:cursor-not-allowed disabled:opacity-60"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSendOtp();
                    }}
                  />
                </div>
              ) : (
                <input
                  type="email"
                  value={inputValue}
                  onChange={(e) => {
                    setInputValue(e.target.value);
                    if (inputError) setInputError(validate(e.target.value));
                  }}
                  placeholder={placeholder}
                  disabled={isLoading}
                  className={`h-12 w-full rounded-4xl border bg-white px-4 text-[14px] font-medium
                    text-primary-heading outline-none transition-all
                    placeholder:text-[#9AA3AD] focus:bg-primary/5
                    disabled:cursor-not-allowed disabled:opacity-60
                    ${
                      inputError
                        ? "border-red-400 focus:border-red-500"
                        : "border-light-grey focus:border-primary hover:border-primary/40"
                    }`}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSendOtp();
                  }}
                />
              )}

              {inputError && (
                <p className="mt-1 text-[12px] font-medium text-red-500">
                  {inputError}
                </p>
              )}
            </div>
          ) : (
            <div>
              <div className="flex justify-between gap-3">
                {otpValues.map((value, index) => (
                  <input
                    key={index}
                    ref={(element) => {
                      otpInputRefs.current[index] = element;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={value}
                    disabled={isLoading}
                    onChange={(event) =>
                      handleOtpChange(event.target.value, index)
                    }
                    onKeyDown={(event) => handleOtpKeyDown(event, index)}
                    className={`h-13 w-13 rounded-[10px] border text-center text-lg font-bold text-primary outline-none transition focus:border-primary disabled:opacity-60 ${
                      otpError ? "border-red-400" : "border-light-grey"
                    }`}
                  />
                ))}
              </div>

              {otpError && (
                <p className="mt-3 text-center text-sm text-red-500">
                  {otpError}
                </p>
              )}

              <p className="mt-8 text-center text-sm text-description-text">
                {t("profile.otp.resendIn")} {formattedTime}
              </p>

              <p className="mt-2 text-center text-sm text-description-text">
                {t("profile.otp.notReceived")}{" "}
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={timeLeft > 0 || isLoading}
                  className={`font-semibold transition ${
                    timeLeft > 0 || isLoading
                      ? "cursor-not-allowed text-gray-400"
                      : "text-primary hover:underline"
                  }`}
                >
                  {t("profile.otp.resendCode")}
                </button>
              </p>

            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 border-t border-light-grey px-5 py-4 sm:gap-5 sm:px-6">
          <button
            type="button"
            onClick={() => {
              if (step === "otp") {
                setStep("input");
                setOtpError("");
                setOtpCode("");
                setOtpValues(["", "", "", "", "", ""]);
                return;
              }

              onClose();
            }}
            disabled={isLoading}
            className="h-12 cursor-pointer rounded-3xl border border-[#C9CED6] bg-white
              text-[14px] font-bold text-muted transition-colors duration-200
              hover:border-muted hover:bg-muted/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {step === "otp" ? `${t("profile.label.change")} ${label.toLowerCase()}` : t("profile.btn-cancel").toUpperCase()}
          </button>

          <button
            type="button"
            onClick={() => {
              if (step === "input") {
                void handleSendOtp();
                return;
              }

              void handleSubmitIdentifier();
            }}
            disabled={isLoading}
            className="h-12 cursor-pointer rounded-3xl bg-primary text-[14px] font-bold text-white
              transition-colors duration-200 hover:bg-primary/90
              disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoading
              ? step === "input"
                ? t("profile.label.sending")
                : t("profile.label.saving").toUpperCase()
              : step === "input"
                ? t("profile.otp.sendCode")
                : t("profile.otp.verifyCode")}
          </button>
        </div>
      </div>
    </ModalBackdrop>
  );
}

// Update Bakong modal

type BakongFormData = {
  bakongId: string;
};

export function BakongAccount({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { language } = useI18n();
  const t = getProfileText(language);
  const fontClass = getFontClass(language);
  const bakongSchema = useMemo(
    () =>
      z.object({
        bakongId: z.string().min(1, t("profile.bakong.required")),
      }),
    [t],
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BakongFormData>({
    resolver: zodResolver(bakongSchema),
  });

  const onSubmit = async (data: BakongFormData) => {
    setIsSubmitting(true);
    try {
      await updateBakong({ bakongAccountId: data.bakongId });
      showApiSuccess(t("profile.bakong.updateSuccess"));
      router.refresh();
      onClose();
    } catch (error) {
      const apiMessage = error instanceof Error ? error.message.trim() : "";
      const isUnavailable = isServiceUnavailableError(error);
      const isBakongNotFound =
        /bakong|account/i.test(apiMessage) &&
        /(does not exist|not found|invalid)/i.test(apiMessage);

      showApiError(
        new Error(
          isUnavailable
            ? t("profile.serviceUnavailable")
            : isBakongNotFound
            ? t("profile.bakong.notFound")
            : apiMessage || t("profile.bakong.updateFail"),
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ModalBackdrop>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className={`relative w-full max-w-130 rounded-[24px] bg-white p-6
          shadow-[0_20px_60px_rgba(0,0,0,0.18)]
          animate-in fade-in zoom-in-95 duration-200 ${fontClass}`}
      >
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute right-5 top-5 cursor-pointer rounded-full p-2 transition-colors hover:bg-gray-100 disabled:opacity-50"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="text-[18px] font-bold text-primary-heading">
          {t("profile.bakong.account")}
        </h2>
        <p className="mt-2 text-[13px] text-secondary-body">
          {t("profile.bakong.description")}
        </p>

        <div className="mt-6">
          <label className="text-[13px] font-bold text-primary">
            <span className="text-red-500">*</span> {t("profile.bakong.id")}
          </label>
          <input
            {...register("bakongId")}
            placeholder={t("profile.placeholder.bakong")}
            disabled={isSubmitting}
            className="mt-2 h-11 w-full rounded-[10px] border border-light-grey px-4 text-[14px]
              outline-none transition-all focus:border-primary hover:border-primary/40
              disabled:cursor-not-allowed disabled:bg-gray-50"
          />
          {errors.bakongId?.message && (
            <p className="mt-1 text-[12px] text-red-500">
              {errors.bakongId.message}
            </p>
          )}
        </div>

        <div className="mt-7 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-3xl border border-light-grey bg-white px-5 py-3 text-[14px] font-bold text-muted
              transition-colors duration-200 hover:border-muted hover:bg-muted/10
              disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t("profile.btn-cancel")}
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-3xl bg-primary px-5 py-3 text-[14px] font-bold text-white
              transition-colors duration-200 hover:bg-primary/90
              disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? t("profile.label.updating") : t("profile.edit-bakong")}
          </button>
        </div>
      </form>
    </ModalBackdrop>
  );
}
