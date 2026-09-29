"use client";

import Image from "next/image";
import {
  ReactNode,
  useEffect,
  useMemo,
  useTransition,
  useState
} from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  CheckCircle2,
  Edit3,
  Loader2,
  Search,
  Sprout,
  Trash2,
  Wheat,
  X,
} from "lucide-react";

import PaginationComponent from "@/app/(main)/own-profile/_component/PaginationComponent";
import { CustomFilterSelect } from "../../(crop-demands)/_components/CustomFilterSelect";

import {
  createCropAction,
  createCropTypeAction,
  deleteCropAction,
  deleteCropTypeAction,
  updateCropAction,
  updateCropTypeAction,
} from "@/action/crop.action";
import { showApiSuccess, showApiToast } from "@/lib/apiToast";
import type { Crop, CropType } from "@/types/cropType";
import { useI18n } from "@/lib/i18n/I18nContext";

// ─── Types ─────────────────────────────────────────────────────────────────────

type Props = {
  cropTypes: CropType[];
};

type CropRow = Crop & {
  cropTypeId: string;
  cropTypeName: string;
};

type ModalMode =
  | "create-crop-type"
  | "edit-crop-type"
  | "create-crop"
  | "edit-crop"
  | "delete-crop-type"
  | "delete-crop"
  | null;

const ITEMS_PER_PAGE = 10;

// ─── i18n Text ─────────────────────────────────────────────────────────────────

const CATALOG_TEXT = {
  cropTypes: { en: "Crop Types", kh: "ប្រភេទដំណាំ" },
  cropNames: { en: "Crop Names", kh: "ឈ្មោះដំណាំ" },
  visibleRows: { en: "Visible Rows", kh: "ជួរដែលបានបង្ហាញ" },
  catalogTable: { en: "Catalog Table", kh: "តារាងបញ្ជី" },
  catalogTitle: { en: "Crop names and crop types", kh: "ឈ្មោះដំណាំ និងប្រភេទដំណាំ" },
  catalogDesc: { en: "Search, filter, update, and delete catalog records from one table.", kh: "ស្វែងរក, ច្រោះ, កែប្រែ និងលុបទិន្នន័យបញ្ជីពីក្នុងតារាងតែមួយ។" },
  addCropType: { en: "Add Crop Type", kh: "បញ្ចូលប្រភេទដំណាំ" },
  addCropName: { en: "Add Crop Name", kh: "បញ្ចូលឈ្មោះដំណាំ" },
  search: { en: "Search", kh: "ស្វែងរក" },
  searchPlaceholder: { en: "Search crop name or crop type...", kh: "ស្វែងរកឈ្មោះដំណាំ ឬប្រភេទដំណាំ..." },
  cropType: { en: "Crop Type", kh: "ប្រភេទដំណាំ" },
  no: { en: "No", kh: "ល.រ" },
  cropName: { en: "Crop Name", kh: "ឈ្មោះដំណាំ" },
  status: { en: "Status", kh: "ស្ថានភាព" },
  action: { en: "Action", kh: "សកម្មភាព" },
  active: { en: "Active", kh: "សកម្ម" },
  noMatch: { en: "No matching crop names found.", kh: "មិនមានឈ្មោះដំណាំដែលត្រូវគ្នា។" },
  update: { en: "Update", kh: "កែប្រែ" },
  delete: { en: "Delete", kh: "លុប" },
  cropTypeTable: { en: "Crop Type Table", kh: "តារាងប្រភេទដំណាំ" },
  manageCropTypeNames: { en: "Manage crop type names", kh: "គ្រប់គ្រងឈ្មោះប្រភេទដំណាំ" },
  cropsCount: { en: "crops", kh: "ដំណាំ" },
  selectCropType: { en: "Select crop type", kh: "ជ្រើសប្រភេទដំណាំ" },
  cropTypeNameLabel: { en: "Crop Type Name", kh: "ឈ្មោះប្រភេទដំណាំ" },
  cropTypeNamePlaceholder: { en: "e.g. Aromatic & Spice", kh: "ឧ. គ្រឿងទេសរុក្ខជាតិ" },
  cropNameLabel: { en: "Crop Name", kh: "ឈ្មោះដំណាំ" },
  cropNamePlaceholder: { en: "e.g. Lemongrass", kh: "ឧ. ស្លឹកគ្រៃ" },
  comboboxPlaceholder: { en: "Search or select crop type…", kh: "ស្វែងរក ឬជ្រើសរើសប្រភេទដំណាំ…" },
  cancel: { en: "Cancel", kh: "បោះបង់" },
  deleting: { en: "Deleting…", kh: "កំពុងលុប…" },
  yesDelete: { en: "Yes, delete", kh: "បាទ/ចាស លុប" },
  saving: { en: "Saving…", kh: "កំពុងរក្សាទុក…" },
  kasephalCatalog: { en: "Kasephal Catalog", kh: "បញ្ជីកសិផល" },
  deleteCropTypeLabel: { en: "crop type", kh: "ប្រភេទដំណាំ" },
  deleteCropNameLabel: { en: "crop name", kh: "ឈ្មោះដំណាំ" },
  deleteWarningStart: { en: "This will permanently remove", kh: "សកម្មភាពនេះនឹងលុបជាអចិន្ត្រៃយ៍" },
  deleteWarningEnd: { en: "from the catalog. This action cannot be undone.", kh: "ចេញពីបញ្ជី។ សកម្មភាពនេះមិនអាចត្រឡប់វិញបានទេ។" },
  titleAddCropType: { en: "Add Crop Type", kh: "បញ្ចូលប្រភេទដំណាំ" },
  titleAddCropName: { en: "Add Crop Name", kh: "បញ្ចូលឈ្មោះដំណាំ" },
  titleUpdateCropName: { en: "Update Crop Name", kh: "កែប្រែឈ្មោះដំណាំ" },
  titleDeleteCropType: { en: "Delete Crop Type", kh: "លុបប្រភេទដំណាំ" },
  titleDeleteCropName: { en: "Delete Crop Name", kh: "លុបឈ្មោះដំណាំ" },
  titleUpdateCropType: { en: "Update Crop Type", kh: "កែប្រែប្រភេទដំណាំ" },
  submitCreateCropType: { en: "Create Crop Type", kh: "បង្កើតប្រភេទដំណាំ" },
  submitUpdateCropType: { en: "Update Crop Type", kh: "កែប្រែប្រភេទដំណាំ" },
  submitUpdateCrop: { en: "Update Crop", kh: "កែប្រែដំណាំ" },
  submitCreateCrop: { en: "Create Crop", kh: "បង្កើតដំណាំ" },
  submitSave: { en: "Save", kh: "រក្សាទុក" },
  cropTypeSavedTitle: { en: "Crop Type Saved ✓", kh: "បានរក្សាទុកប្រភេទដំណាំ ✓" },
  cropTypeCreated: { en: "Crop Type Created ✓", kh: "បានបង្កើតប្រភេទដំណាំ ✓" },
  cropTypeUpdated: { en: "Crop Type Updated ✓", kh: "បានកែប្រែប្រភេទដំណាំ ✓" },
  cropTypeDeleted: { en: "Crop Type Deleted ✓", kh: "បានលុបប្រភេទដំណាំ ✓" },
  cropSavedTitle: { en: "Crop Saved ✓", kh: "បានរក្សាទុកដំណាំ ✓" },
  cropUpdated: { en: "Crop Updated ✓", kh: "បានកែប្រែដំណាំ ✓" },
  cropCreated: { en: "Crop Created ✓", kh: "បានបង្កើតដំណាំ ✓" },
  cropDeleted: { en: "Crop Deleted ✓", kh: "បានលុបដំណាំ ✓" },
  deletedTitle: { en: "Deleted ✓", kh: "បានលុប ✓" },
  saveFailedTitle: { en: "Save Failed", kh: "រក្សាទុកមិនបាន" },
  deleteFailedTitle: { en: "Delete Failed", kh: "លុបមិនបាន" },
  deleteItemErr: { en: "Could not delete this item. Please try again.", kh: "មិនអាចលុបធាតុនេះបានទេ។ សូមព្យាយាមម្តងទៀត។" },
  cropTypeSaveErr: { en: "Could not save crop type. Please try again.", kh: "មិនអាចរក្សាទុកប្រភេទដំណាំបានទេ។ សូមព្យាយាមម្តងទៀត។" },
  cropTypeUpdateErr: { en: "Could not update crop type. Please try again.", kh: "មិនអាចកែប្រែប្រភេទដំណាំបានទេ។ សូមព្យាយាមម្តងទៀត។" },
  cropSaveErr: { en: "Could not save crop. Please try again.", kh: "មិនអាចរក្សាទុកដំណាំបានទេ។ សូមព្យាយាមម្តងទៀត។" },
  selectItemErr: { en: "No item selected to delete.", kh: "សូមជ្រើសរើសធាតុដែលត្រូវលុប។" },
  all: { en: "All", kh: "ទាំងអស់" },
  idLabel: { en: "ID", kh: "កូដ" },
  validationRequired: { en: "This field is required.", kh: "ត្រូវការបំពេញទិន្នន័យ។" },
  validationCropTypeRequired: { en: "Please select a crop type.", kh: "សូមជ្រើសរើសប្រភេទដំណាំ។" },
  validationMinLength: { en: "Must be at least 2 characters.", kh: "ត្រូវតែមានយ៉ាងហោចណាស់ 2 តួអក្សរ។" },
  validationMaxLength: { en: "Must be 100 characters or fewer.", kh: "ត្រូវតែមាន 100 តួអក្សរ ឬតិចជាងនេះ។" },
  validationLettersOnly: { en: "Letters only — no numbers or special characters allowed.", kh: "អក្សរប៉ុណ្ណោះ — មិនអនុញ្ញាតឱ្យមានលេខ ឬសញ្ញាពិសេស។" },
} as const;

type CatalogTextKey = keyof typeof CATALOG_TEXT;

// ─── Zod Schemas ───────────────────────────────────────────────────────────────

const LETTERS_ONLY_REGEX = /^[\p{L}']+(?: [\p{L}']+)*$/u;

function buildSchemas(t: (key: CatalogTextKey) => string) {
  const nameField = z
    .string()
    .trim()
    .transform((val) => val.replace(/\s+/g, " "))
    .superRefine((val, ctx) => {
      if (val.length === 0) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: t("validationRequired") });
        return;
      }
      if (val.length < 2) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: t("validationMinLength") });
        return;
      }
      if (val.length > 100) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: t("validationMaxLength") });
        return;
      }
      if (!LETTERS_ONLY_REGEX.test(val)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: t("validationLettersOnly") });
      }
    });

  const cropTypeSchema = z.object({ typeName: nameField });

  const cropSchema = z.object({
    cropName: nameField,
    cropTypeName: z.string().min(1, t("validationCropTypeRequired")),
  });

  return { cropTypeSchema, cropSchema };
}

type CropTypeFormValues = z.infer<ReturnType<typeof buildSchemas>["cropTypeSchema"]>;
type CropFormValues = z.infer<ReturnType<typeof buildSchemas>["cropSchema"]>;

// ─── Helpers ───────────────────────────────────────────────────────────────────

function getShortId(id: string) {
  const trimmed = id.trim();
  return trimmed.length <= 4 ? trimmed : trimmed.slice(-4);
}

function getModalTitle(mode: Exclude<ModalMode, null>, t: (key: CatalogTextKey) => string) {
  const titles: Record<Exclude<ModalMode, null>, CatalogTextKey> = {
    "create-crop-type": "titleAddCropType",
    "edit-crop-type": "titleUpdateCropType",
    "create-crop": "titleAddCropName",
    "edit-crop": "titleUpdateCropName",
    "delete-crop-type": "titleDeleteCropType",
    "delete-crop": "titleDeleteCropName",
  };
  return t(titles[mode]);
}

function getSubmitLabel(mode: ModalMode, t: (key: CatalogTextKey) => string) {
  if (mode === "create-crop-type") return t("submitCreateCropType");
  if (mode === "edit-crop-type") return t("submitUpdateCropType");
  if (mode === "edit-crop") return t("submitUpdateCrop");
  if (mode === "create-crop") return t("submitCreateCrop");
  return t("submitSave");
}

/**
 * Locks page scroll while a modal is open, using the "fixed body" technique
 * instead of intercepting wheel/touch events.
 *
 * Why not intercept wheel/touchmove globally (as before)?
 * Because a global listener can't tell the difference between "the page
 * behind the modal" and "a scrollable element inside the modal" (e.g. the
 * crop-type dropdown's option list, which is rendered outside
 * `.modal-scroll-container` so it isn't clipped). That's what was breaking
 * scrolling inside the crop-type dropdown. `overflow: hidden` + `position:
 * fixed` on <body> blocks background scroll natively and never touches
 * events on children, so nested scrollable elements keep working normally.
 */
function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;

    const scrollY = window.scrollY;
    const { body } = document;
    const previous = {
      overflow: body.style.overflow,
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      width: body.style.width,
    };

    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";

    return () => {
      body.style.overflow = previous.overflow;
      body.style.position = previous.position;
      body.style.top = previous.top;
      body.style.left = previous.left;
      body.style.right = previous.right;
      body.style.width = previous.width;
      window.scrollTo(0, scrollY);
    };
  }, [active]);
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function GovernmentCropManagement({ cropTypes }: Props) {
  const router = useRouter();
  const { language } = useI18n();
  const lang: "en" | "kh" = language === "kh" ? "kh" : "en";
  const t = (key: CatalogTextKey) => CATALOG_TEXT[key][lang];

  const { cropTypeSchema, cropSchema } = useMemo(() => buildSchemas(t), [lang]);

  const [mode, setMode] = useState<ModalMode>(null);
  const [selectedCropType, setSelectedCropType] = useState<CropType | null>(null);
  const [selectedCrop, setSelectedCrop] = useState<CropRow | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [isPending, startTransition] = useTransition();

  const cropTypeForm = useForm<CropTypeFormValues>({
    resolver: zodResolver(cropTypeSchema),
    defaultValues: { typeName: "" },
    mode: "onTouched",
    reValidateMode: "onChange"
  });

  const cropForm = useForm<CropFormValues>({
    resolver: zodResolver(cropSchema),
    defaultValues: { cropName: "", cropTypeName: "" },
    mode: "onTouched",
    reValidateMode: "onChange"
  });

  const cropRows = useMemo<CropRow[]>(
    () =>
      cropTypes.flatMap((type) =>
        (type.crops ?? []).map((crop) => ({
          ...crop,
          cropTypeId: crop.cropTypeId || type.cropTypeId,
          cropTypeName: crop.cropTypeName || type.typeName,
        })),
      ),
    [cropTypes],
  );

  const cropTypeNameToId = useMemo(
    () => new Map(cropTypes.map((type) => [type.typeName, type.cropTypeId])),
    [cropTypes],
  );

  const cropTypeIdToName = useMemo(
    () => new Map(cropTypes.map((type) => [type.cropTypeId, type.typeName])),
    [cropTypes],
  );

  const cropTypeSelectOptions = [
    t("selectCropType"),
    ...cropTypes.map((type) => type.typeName),
  ];

  // CustomFilterSelect works with plain display strings (no separate id/label
  // pair like AdminDropdown did), so the "All" filter is represented by its
  // translated label. `typeFilter` state still stores a stable cropTypeId
  // ("All" sentinel or a real id) so filtering logic and pagination resets
  // don't depend on the current UI language.
  const typeFilterOptions = [t("all"), ...cropTypes.map((type) => type.typeName)];

  const typeFilterLabel =
    typeFilter === "All" ? t("all") : cropTypeIdToName.get(typeFilter) ?? t("all");

  const handleTypeFilterChange = (label: string) => {
    const nextId = label === t("all") ? "All" : cropTypeNameToId.get(label) ?? "All";
    setTypeFilter(nextId);
    setCurrentPage(1);
  };

  const filteredRows = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return cropRows.filter((crop) => {
      const matchesSearch =
        !q ||
        crop.cropName.toLowerCase().includes(q) ||
        crop.cropTypeName.toLowerCase().includes(q);
      const matchesType = typeFilter === "All" || crop.cropTypeId === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [cropRows, searchQuery, typeFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(Math.max(currentPage, 1), totalPages);

  const paginatedRows = useMemo(() => {
    const start = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
    return filteredRows.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredRows, safeCurrentPage]);

  const closeModal = () => {
    setMode(null);
    setSelectedCropType(null);
    setSelectedCrop(null);
    cropTypeForm.reset();
    cropForm.reset();
  };

  const openCreateCropType = () => {
    closeModal();
    cropTypeForm.reset({ typeName: "" });
    setMode("create-crop-type");
  };

  const openEditCropType = (ct: CropType) => {
    closeModal();
    setSelectedCropType(ct);
    cropTypeForm.reset({ typeName: ct.typeName });
    setMode("edit-crop-type");
  };

  const openCreateCrop = (defaultCropTypeId = "") => {
    closeModal();
    cropForm.reset({
      cropName: "",
      cropTypeName: cropTypeIdToName.get(defaultCropTypeId) ?? "",
    });
    setMode("create-crop");
  };

  const openEditCrop = (crop: CropRow) => {
    closeModal();
    setSelectedCrop(crop);
    cropForm.reset({
      cropName: crop.cropName,
      cropTypeName: crop.cropTypeName || cropTypeIdToName.get(crop.cropTypeId) || "",
    });
    setMode("edit-crop");
  };

  const openDeleteCropType = (ct: CropType) => {
    closeModal();
    setSelectedCropType(ct);
    setMode("delete-crop-type");
  };

  const openDeleteCrop = (crop: CropRow) => {
    closeModal();
    setSelectedCrop(crop);
    setMode("delete-crop");
  };

  const afterSuccess = (title: string, message?: string) => {
    showApiSuccess(title, message);
    closeModal();
    router.refresh();
  };

  const handleCropTypeSubmit = cropTypeForm.handleSubmit(async ({ typeName }) => {
    startTransition(async () => {
      if (mode === "edit-crop-type" && selectedCropType) {
        const result = await updateCropTypeAction({
          cropTypeId: selectedCropType.cropTypeId,
          typeName,
        });
        if (!result.success) {
          showApiToast(result, {
            successTitle: t("cropTypeUpdated"),
            errorTitle: t("saveFailedTitle"),
            errorMessage: result.error ?? t("cropTypeUpdateErr"),
          });
          return;
        }
        afterSuccess(result.message ?? t("cropTypeUpdated"));
      } else {
        const result = await createCropTypeAction({ typeName });
        if (!result.success) {
          showApiToast(result, {
            successTitle: t("cropTypeSavedTitle"),
            errorTitle: t("saveFailedTitle"),
            errorMessage: result.error ?? t("cropTypeSaveErr"),
          });
          return;
        }
        afterSuccess(result.message ?? t("cropTypeCreated"));
      }
    });
  });

  const handleCropSubmit = cropForm.handleSubmit(async ({ cropName, cropTypeName }) => {
    const resolvedCropTypeId = cropTypeNameToId.get(cropTypeName) ?? "";

    startTransition(async () => {
      const result =
        mode === "edit-crop" && selectedCrop
          ? await updateCropAction({ cropId: selectedCrop.cropId, cropName, cropTypeId: resolvedCropTypeId })
          : await createCropAction({ cropName, cropTypeId: resolvedCropTypeId });

      if (!result.success) {
        showApiToast(result, {
          successTitle: t("cropSavedTitle"),
          errorTitle: t("saveFailedTitle"),
          errorMessage: result.error ?? t("cropSaveErr"),
        });
        return;
      }
      afterSuccess(
        result.message ?? (mode === "edit-crop" ? t("cropUpdated") : t("cropCreated")),
      );
    });
  });

  const handleDelete = () => {
    startTransition(async () => {
      const result =
        mode === "delete-crop-type" && selectedCropType
          ? await deleteCropTypeAction(selectedCropType.cropTypeId)
          : mode === "delete-crop" && selectedCrop
            ? await deleteCropAction(selectedCrop.cropId)
            : { success: false, error: t("selectItemErr") };

      if (!result.success) {
        showApiToast(result, {
          successTitle: t("deletedTitle"),
          errorTitle: t("deleteFailedTitle"),
          errorMessage: result.error ?? t("deleteItemErr"),
        });
        return;
      }
      afterSuccess(
        mode === "delete-crop-type" ? t("cropTypeDeleted") : t("cropDeleted"),
        result.message,
      );
    });
  };

  const isCropTypeForm = mode === "create-crop-type" || mode === "edit-crop-type";
  const isCropForm = mode === "create-crop" || mode === "edit-crop";
  const isDeleteMode = mode === "delete-crop-type" || mode === "delete-crop";

  const cropTypeIsValid = cropTypeForm.formState.isValid;
  const cropIsValid = cropForm.formState.isValid;
  const submitDisabled =
    isPending ||
    (isCropTypeForm && !cropTypeIsValid) ||
    (isCropForm && !cropIsValid);

  return (
    <section className={`mx-auto w-full max-w-7xl space-y-5 px-4 sm:px-6 lg:px-8 ${lang === "kh" ? "font-khmer" : ""}`}>
      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryPanel icon={<Wheat className="h-5 w-5" />} label={t("cropTypes")} value={cropTypes.length} tone="green" />
        <SummaryPanel icon={<Sprout className="h-5 w-5" />} label={t("cropNames")} value={cropRows.length} tone="gold" />
        <SummaryPanel icon={<CheckCircle2 className="h-5 w-5" />} label={t("visibleRows")} value={filteredRows.length} tone="gray" />
      </div>

      {/* Catalog Table Card */}
      <section className="rounded-xl border border-light-grey bg-white p-4 shadow-sm md:p-5">
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wide text-primary">{t("catalogTable")}</p>
            <h2 className="mt-1 text-2xl font-bold leading-tight text-primary-heading md:text-3xl">{t("catalogTitle")}</h2>
            <p className="mt-1 text-sm leading-6 text-secondary-body">{t("catalogDesc")}</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row lg:shrink-0">
            <button type="button" onClick={openCreateCropType} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white shadow-xs transition hover:bg-primary/90 active:scale-[0.99]">
              <Wheat className="h-4 w-4" /> {t("addCropType")}
            </button>
            <button type="button" onClick={() => openCreateCrop()} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-secondary px-4 text-sm font-bold text-primary-heading shadow-xs transition hover:bg-secondary/50 active:scale-[0.99]">
              <Sprout className="h-4 w-4" /> {t("addCropName")}
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid gap-4 md:grid-cols-12">
          <label className="block md:col-span-7">
            <span className="text-xs font-medium tracking-wide text-muted">{t("search")}</span>
            <div className="relative mt-2">
              <input
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                placeholder={t("searchPlaceholder")}
                className="h-12 w-full rounded-xl border border-light-grey bg-white px-4 pr-12 text-sm font-medium text-primary-heading outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
              <Search className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
            </div>
          </label>
          <label className="block md:col-span-5">
            <span className="text-xs font-medium tracking-wide text-muted">{t("cropType")}</span>
            <div className="mt-2">
              <CustomFilterSelect
                label=""
                options={typeFilterOptions}
                selected={typeFilterLabel}
                onChange={handleTypeFilterChange}
                placeholder={t("cropType")}
              />
            </div>
          </label>
        </div>

        {/* Desktop Table */}
        <div className="mt-5 hidden overflow-x-auto rounded-xl border border-light-grey bg-white md:block">
          <table className="w-full min-w-190 table-fixed border-collapse text-left">
            <thead>
              <tr className="border-b border-light-grey bg-gray-50/80 text-sm font-medium tracking-wide text-muted">
                <th className="w-[8%] px-5 py-4 text-center">{t("no")}</th>
                <th className="w-[34%] px-5 py-4">{t("cropName")}</th>
                <th className="w-[30%] px-5 py-4">{t("cropType")}</th>
                <th className="w-[13%] px-5 py-4">{t("status")}</th>
                <th className="w-[15%] px-5 py-4 text-center">{t("action")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-light-grey text-sm font-medium text-dark-grey">
              {paginatedRows.length > 0 ? (
                paginatedRows.map((crop, index) => (
                  <tr key={crop.cropId} className="group transition-colors hover:bg-gray-50/70">
                    <td className="px-5 py-4 text-center text-sm text-muted">{(safeCurrentPage - 1) * ITEMS_PER_PAGE + index + 1}</td>
                    <td className="px-5 py-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-primary ring-1 ring-emerald-100">
                          <Sprout className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-base font-semibold leading-6 text-primary-heading transition-colors group-hover:text-primary">{crop.cropName}</p>
                          <p className="mt-0.5 truncate text-[11px] font-medium tracking-wide text-muted">{t("idLabel")} {getShortId(crop.cropId)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex max-w-full items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
                        <Wheat className="h-4 w-4 shrink-0" />
                        <span className="truncate">{crop.cropTypeName}</span>
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex h-8 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 px-3 text-[12px] font-semibold tracking-wide text-emerald-700">{t("active")}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-center gap-1.5">
                        <IconButton label={`${t("update")} ${crop.cropName}`} onClick={() => openEditCrop(crop)}><Edit3 className="h-4 w-4" /></IconButton>
                        <IconButton label={`${t("delete")} ${crop.cropName}`} onClick={() => openDeleteCrop(crop)} variant="danger"><Trash2 className="h-4 w-4" /></IconButton>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="bg-gray-50/30 py-12 text-center text-sm font-medium text-muted">{t("noMatch")}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="mt-5 grid gap-3 md:hidden">
          {paginatedRows.length > 0 ? (
            paginatedRows.map((crop, index) => (
              <div key={crop.cropId} className="relative rounded-xl border border-light-grey bg-white p-3 shadow-xs">
                <span className="absolute right-4 top-4 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-muted">#{(safeCurrentPage - 1) * ITEMS_PER_PAGE + index + 1}</span>
                <div className="flex min-w-0 gap-3 pr-12">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-primary ring-1 ring-emerald-100"><Sprout className="h-5 w-5" /></div>
                  <div className="min-w-0">
                    <h3 className="truncate text-base font-semibold leading-6 text-primary-heading">{crop.cropName}</h3>
                    <p className="mt-1 truncate text-sm font-medium tracking-wide text-muted">{crop.cropTypeName}</p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap justify-end gap-2 border-t border-gray-100 pt-3">
                  <button type="button" onClick={() => openEditCrop(crop)} className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700">{t("update")}</button>
                  <button type="button" onClick={() => openDeleteCrop(crop)} className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">{t("delete")}</button>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-xl border border-dashed border-light-grey bg-gray-50/40 p-8 text-center text-sm font-medium text-muted">{t("noMatch")}</div>
          )}
        </div>

        {filteredRows.length > 0 && (
          <div className="mt-5 border-t border-light-grey/70 pt-4">
            <PaginationComponent
              currentPage={safeCurrentPage}
              totalItems={filteredRows.length}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </section>

      {/* Crop Type Cards */}
      <section className="rounded-xl border border-light-grey bg-white p-4 shadow-xs md:p-5">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold tracking-wide text-primary">{t("cropTypeTable")}</p>
            <h2 className="mt-1 text-2xl font-bold leading-tight text-primary-heading">{t("manageCropTypeNames")}</h2>
          </div>
          <button type="button" onClick={openCreateCropType} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary/90">
            <Wheat className="h-4 w-4" /> {t("addCropType")}
          </button>
        </div>
        <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-4">
          {cropTypes.map((type) => (
            <div key={type.cropTypeId} className="flex items-center justify-between gap-3 rounded-xl border border-light-grey bg-gray-50/40 p-4">
              <div className="min-w-0">
                <h3 className="truncate text-base font-semibold leading-6 text-primary-heading">{type.typeName}</h3>
                <p className="mt-1 text-xs font-medium tracking-wide text-muted">{(type.crops ?? []).length} {t("cropsCount")}</p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <IconButton label={`${t("update")} ${type.typeName}`} onClick={() => openEditCropType(type)}><Edit3 className="h-4 w-4" /></IconButton>
                <IconButton label={`${t("delete")} ${type.typeName}`} onClick={() => openDeleteCropType(type)} variant="danger"><Trash2 className="h-4 w-4" /></IconButton>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Modal */}
      {mode && (
        <CatalogModal
          cropTypeSelectOptions={cropTypeSelectOptions}
          mode={mode}
          selectedCropType={selectedCropType}
          selectedCrop={selectedCrop}
          isPending={isPending}
          isCropTypeForm={isCropTypeForm}
          isCropForm={isCropForm}
          isDeleteMode={isDeleteMode}
          submitDisabled={submitDisabled}
          lang={lang}
          t={t}
          cropTypeForm={cropTypeForm}
          cropForm={cropForm}
          onClose={closeModal}
          onCropTypeSubmit={handleCropTypeSubmit}
          onCropSubmit={handleCropSubmit}
          onDelete={handleDelete}
        />
      )}
    </section>
  );
}

// ─── Catalog Modal ─────────────────────────────────────────────────────────────

function CatalogModal({
  mode,
  selectedCropType,
  selectedCrop,
  isPending,
  isCropTypeForm,
  isCropForm,
  isDeleteMode,
  submitDisabled,
  lang,
  t,
  cropTypeForm,
  cropForm,
  cropTypeSelectOptions,
  onClose,
  onCropTypeSubmit,
  onCropSubmit,
  onDelete,
}: {
  cropTypeSelectOptions: string[];
  mode: Exclude<ModalMode, null>;
  selectedCropType: CropType | null;
  selectedCrop: CropRow | null;
  isPending: boolean;
  isCropTypeForm: boolean;
  isCropForm: boolean;
  isDeleteMode: boolean;
  submitDisabled: boolean;
  lang: "en" | "kh";
  t: (key: CatalogTextKey) => string;
  cropTypeForm: ReturnType<typeof useForm<CropTypeFormValues>>;
  cropForm: ReturnType<typeof useForm<CropFormValues>>;
  onClose: () => void;
  onCropTypeSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onCropSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onDelete: () => void;
}) {
  // Locks background page scroll while the modal is mounted. See useScrollLock
  // above — this no longer intercepts wheel/touch events, so the crop-type
  // dropdown's own option list can scroll normally.
  useScrollLock(true);

  useEffect(() => {
    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape" && !isPending) onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isPending, onClose]);

  const { register: registerCropType, formState: { errors: cropTypeErrors } } = cropTypeForm;
  const { register: registerCrop, control: cropControl, formState: { errors: cropErrors } } = cropForm;

  return createPortal(
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/50 px-4 py-6 backdrop-blur-sm sm:py-8 ${lang === "kh" ? "font-khmer" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="catalog-modal-title"
      onClick={(e) => { if (e.target === e.currentTarget && !isPending) onClose(); }}
    >
      {/* overflow-visible on the dialog + its body lets the crop-type dropdown
          panel escape the modal's bounds instead of being clipped. */}
      <div className="relative flex max-h-[90vh] w-full max-w-160 flex-col rounded-2xl bg-white shadow-2xl shadow-slate-900/20 overflow-visible">
        <div className="h-1 w-full shrink-0" />

        {/* Header */}
        <div className="flex shrink-0 items-start gap-4 border-b border-gray-100 px-8 py-6">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 ring-1 ring-emerald-100">
            <Image src="/assets/logo-green.png" alt="Kasephal" width={32} height={32} className="h-auto w-auto" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">{t("kasephalCatalog")}</p>
            <h2 id="catalog-modal-title" className="mt-0.5 text-lg font-bold text-primary-heading">{getModalTitle(mode, t)}</h2>
          </div>
          <button type="button" onClick={onClose} disabled={isPending} aria-label="Close" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-400 transition hover:bg-gray-100 hover:text-gray-700">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body Container */}
        <div className="flex-1 overflow-y-visible px-8 py-7">

          {/* ── Crop Type Form ── */}
          {isCropTypeForm && (
            <form id="modal-form" onSubmit={onCropTypeSubmit} className="space-y-5" noValidate>
              <FormField label={t("cropTypeNameLabel")} htmlFor="type-name-input" required>
                <input
                  id="type-name-input"
                  autoFocus
                  placeholder={t("cropTypeNamePlaceholder")}
                  className={`field-input ${
                    cropTypeErrors.typeName
                      ? "border-rose-500 focus:border-rose-500 focus:ring-rose-200"
                      : "border-gray-200 focus:border-primary focus:ring-primary/10"
                  }`}
                  {...registerCropType("typeName")}
                />
                <FieldError message={cropTypeErrors.typeName?.message} />
              </FormField>
            </form>
          )}

          {/* ── Crop Form ── */}
          {isCropForm && (
            <form id="modal-form" onSubmit={onCropSubmit} className="space-y-5" noValidate>
              <FormField label={t("cropNameLabel")} htmlFor="crop-name-input" required>
                <input
                  id="crop-name-input"
                  autoFocus
                  placeholder={t("cropNamePlaceholder")}
                  className={`field-input ${
                    cropErrors.cropName
                      ? "border-rose-500 focus:border-rose-500 focus:ring-rose-200"
                      : "border-gray-200 focus:border-primary focus:ring-primary/10"
                  }`}
                  {...registerCrop("cropName")}
                />
                <FieldError message={cropErrors.cropName?.message} />
              </FormField>

              <FormField label={t("cropType")} required>
                <div className="relative z-50 overflow-visible">
                  <Controller
                    name="cropTypeName"
                    control={cropControl}
                    render={({ field }) => (
                      <CustomFilterSelect
                        label=""
                        options={cropTypeSelectOptions}
                        selected={field.value}
                        onChange={field.onChange}
                        placeholder={t("selectCropType")}
                      />
                    )}
                  />
                </div>
                <FieldError message={cropErrors.cropTypeName?.message} />
              </FormField>
            </form>
          )}

          {/* ── Delete Confirm ── */}
          {isDeleteMode && (
            <div className="flex gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-rose-100 text-rose-600">
                <Trash2 className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-rose-700">
                  {t("delete")} {mode === "delete-crop-type" ? t("deleteCropTypeLabel") : t("deleteCropNameLabel")}
                </p>
                <p className="mt-1 text-sm leading-6 text-rose-600/90">
                  {t("deleteWarningStart")}{" "}
                  <span className="font-bold text-rose-800">{selectedCropType?.typeName ?? selectedCrop?.cropName}</span>{" "}
                  {t("deleteWarningEnd")}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex shrink-0 items-center justify-end gap-3 border-t border-gray-100 bg-white px-8 py-5">
          <button type="button" onClick={onClose} disabled={isPending} className="h-10 rounded-lg border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-600 transition hover:bg-gray-50">
            {t("cancel")}
          </button>

          {isDeleteMode ? (
            <button type="button" onClick={onDelete} disabled={isPending} className="inline-flex h-10 items-center gap-2 rounded-lg bg-rose-600 px-4 text-sm font-semibold text-white transition hover:bg-rose-700">
              {isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> {t("deleting")}</> : <><Trash2 className="h-4 w-4" /> {t("yesDelete")}</>}
            </button>
          ) : (
            <button type="submit" form="modal-form" disabled={submitDisabled} className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary/90">
              {isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> {t("saving")}</> : getSubmitLabel(mode, t)}
            </button>
          )}
        </div>
      </div>

      <style>{`
        .field-input {
          display: block;
          width: 100%;
          height: 3rem;
          border-radius: 0.625rem;
          border: 1px solid #E5E7EB;
          background: #F9FAFB;
          padding: 0 1rem;
          font-size: 0.9375rem;
          font-weight: 500;
          color: #111827;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;
        }
        .field-input::placeholder { color: #D1D5DB; }
        .field-input:focus {
          border-color: var(--color-primary, #16A34A);
          background: #fff;
          box-shadow: 0 0 0 3px rgb(22 163 74 / 0.1);
        }
      `}</style>
    </div>,
    document.body,
  );
}

// ─── Field Error ───────────────────────────────────────────────────────────────

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="mt-1.5 text-xs font-medium text-rose-600">
      {message}
    </p>
  );
}

// ─── Form Field Wrapper ────────────────────────────────────────────────────────

function FormField({
  label,
  htmlFor,
  children,
  required = false,
}: {
  label: string;
  htmlFor?: string;
  children: ReactNode;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-400">
        {label}
        {required && <span className="ml-1 text-rose-500">*</span>}
      </label>
      {children}
    </div>
  );
}

// ─── Summary Panel ─────────────────────────────────────────────────────────────

function SummaryPanel({ icon, label, value, tone }: { icon: ReactNode; label: string; value: number; tone: "green" | "gold" | "gray" }) {
  const toneClass = {
    green: "bg-emerald-50 text-primary ring-emerald-100",
    gold: "bg-amber-50 text-amber-700 ring-amber-100",
    gray: "bg-gray-50 text-secondary-body ring-gray-100",
  }[tone];
  return (
    <div className="rounded-xl border border-light-grey bg-white p-4 shadow-xs">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium leading-5 text-muted">{label}</p>
          <p className="mt-2 text-3xl font-bold leading-none text-primary-heading">{value}</p>
        </div>
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ring-1 ${toneClass}`}>{icon}</div>
      </div>
    </div>
  );
}

// ─── Icon Button ───────────────────────────────────────────────────────────────

function IconButton({ label, onClick, children, variant = "default" }: { label: string; onClick: () => void; children: ReactNode; variant?: "default" | "danger" }) {
  return (
    <button type="button" onClick={onClick} aria-label={label} title={label}
      className={`flex h-9 w-9 items-center justify-center rounded-lg border transition ${variant === "danger" ? "border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100" : "border-amber-200 bg-amber-50 text-amber-600 hover:bg-amber-100"}`}>
      {children}
    </button>
  );
}