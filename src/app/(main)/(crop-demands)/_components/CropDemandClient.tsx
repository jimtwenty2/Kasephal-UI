"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
  type FormEvent,
} from "react";
import Image from "next/image";
import { RotateCcw, Search } from "lucide-react";
import PaginationComponent from "@/components/action-components/PaginationComponent";
import {
  getCropDemandsAction,
  getOwnCropDemandsAction,
} from "@/action/crop-demand.action";
import { getCropTypeFilterOptions } from "@/lib/cropTypeOptions";
import { showApiToast } from "@/lib/apiToast";
import type { CropDemandPost } from "@/types/crop-demand";
import { CropType } from "@/types/cropType";
import type { AdministrativeLocation } from "@/services/locationFilter.service";
import CropCardDemand from "./CropCardDemand";
import { CustomFilterSelect } from "./CustomFilterSelect";
import { CropDemandCardGridSkeleton } from "./CropDemandMarketplaceSkeleton";
import { useI18n } from "@/lib/i18n/I18nContext";
import { UserRole } from "@/types/user";

type Pagination = {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

type Filters = {
  search: string;
  cropType: string;
  region: string;
  status: string;
};

type Props = {
  initialDemands: CropDemandPost[];
  initialPagination: Pagination;
  initialCropTypes: CropType[];
  initialProvinces: AdministrativeLocation[];
  role: UserRole | null;
};

const DEFAULT_FILTERS: Filters = {
  search: "",
  cropType: "All",
  region: "All",
  status: "All",
};

const STATUS_OPTIONS = ["All", "OPEN", "MATCHED", "CLOSED"];

const CROP_DEMAND_TEXT = {
  "crop.common.all": {
    en: "All",
    kh: "ទាំងអស់",
  },

  "cropDemands.listings": {
    en: "Crop Demand Listings",
    kh: "បញ្ជីតម្រូវការកសិផល",
  },
  "cropDemands.findDescription": {
    en: "Find active crop demand requests from buyers across Cambodia.",
    kh: "ស្វែងរកតម្រូវការកសិផលសកម្មពីអ្នកទិញទូទាំងប្រទេសកម្ពុជា។",
  },
  "cropDemands.searchCropName": {
    en: "Search Crop Name",
    kh: "ស្វែងរកឈ្មោះដំណាំ",
  },
  "cropDemands.searchAria": {
    en: "Search crop demands",
    kh: "ស្វែងរកតម្រូវការកសិផល",
  },

  "crop.common.searchByCropName": {
    en: "Search by crop name...",
    kh: "ស្វែងរកតាមឈ្មោះដំណាំ...",
  },
  "crop.common.cropType": {
    en: "Crop Type",
    kh: "ប្រភេទដំណាំ",
  },
  "crop.common.region": {
    en: "Region",
    kh: "តំបន់",
  },
  "crop.common.status": {
    en: "Status",
    kh: "ស្ថានភាព",
  },

  "cropDemands.noResults": {
    en: "No crop demands found",
    kh: "មិនមានតម្រូវការកសិផល",
  },
  "cropDemands.noResultsDescription": {
    en: "Try another crop name, crop type, region, or status.",
    kh: "សូមសាកល្បងឈ្មោះដំណាំ ប្រភេទដំណាំ តំបន់ ឬស្ថានភាពផ្សេងទៀត។",
  },

  "cropDemands.resetFilters": {
    en: "Reset Filters",
    kh: "កំណត់តម្រងឡើងវិញ",
  },
  "cropDemands.resetFiltersAria": {
    en: "Reset all active table search filters",
    kh: "កំណត់តម្រងស្វែងរកទាំងអស់ឡើងវិញ",
  },

  "cropDemands.loaded": {
    en: "Crop demands loaded",
    kh: "បានផ្ទុកតម្រូវការកសិផល",
  },
  "cropDemands.loadFailed": {
    en: "Load failed",
    kh: "ការផ្ទុកបរាជ័យ",
  },
  "cropDemands.loadFailedMessage": {
    en: "Failed to load crop demands.",
    kh: "មិនអាចផ្ទុកតម្រូវការកសិផលបានទេ។",
  },
} as const;

function getCropDemandText(language: string) {
  const lang: "en" | "kh" = language === "kh" ? "kh" : "en";

  return (key: string) =>
    CROP_DEMAND_TEXT[key as keyof typeof CROP_DEMAND_TEXT]?.[lang] ?? key;
}

export default function CropDemandClient({
  initialDemands,
  initialPagination,
  initialCropTypes,
  initialProvinces,
  role,
}: Props) {
  const { language } = useI18n();
  const t = getCropDemandText(language);
  const fontClass = language === "kh" ? "font-khmer" : "font-thicccboi";

  const [demands, setDemands] = useState(initialDemands);
  const [pagination, setPagination] = useState(initialPagination);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [searchValue, setSearchValue] = useState("");
  const [isPending, startTransition] = useTransition();

  const cropTypeOptions = useMemo(
    () => getCropTypeFilterOptions(initialCropTypes),
    [initialCropTypes],
  );

  const regionOptions = useMemo(
    () => [
      { value: "All", label: language === "kh" ? "ទាំងអស់" : "All" },
      ...initialProvinces.map((province) => ({
        value: province.nameEn,
        label:
          language === "kh"
            ? province.nameKh ?? province.nameEn
            : province.nameEn,
      })),
    ],
    [initialProvinces, language],
  );

  const fetchDemands = useCallback(
    (nextFilters: Filters, page: number) => {
      startTransition(async () => {
        const result =
          role === "FARMER" || role === null
            ? await getCropDemandsAction({
                search: nextFilters.search,
                cropType: nextFilters.cropType,
                region: nextFilters.region,
                status: nextFilters.status,
                page,
                size: pagination.size,
              })
            : await getOwnCropDemandsAction({
                search: nextFilters.search,
                cropType: nextFilters.cropType,
                region: nextFilters.region,
                status: nextFilters.status,
                page,
                size: pagination.size,
              });

        if (result.error) {
          showApiToast(result, {
            successTitle: t("cropDemands.loaded"),
            errorTitle: t("cropDemands.loadFailed"),
            errorMessage: t("cropDemands.loadFailedMessage"),
          });
          return;
        }

        setDemands(result.data);
        setPagination(result.pagination);
      });
    },
    [pagination.size, role, t],
  );

  const updateFilter = (key: keyof Filters, value: string) => {
    const nextFilters = { ...filters, [key]: value };

    setFilters(nextFilters);
    fetchDemands(nextFilters, 1);
  };

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    updateFilter("search", searchValue.trim());
  };

  useEffect(() => {
    const search = searchValue.trim();

    if (search === filters.search) return;

    const timer = window.setTimeout(() => {
      const nextFilters = { ...filters, search };

      setFilters(nextFilters);
      fetchDemands(nextFilters, 1);
    }, 450);

    return () => window.clearTimeout(timer);
  }, [fetchDemands, filters, searchValue]);

  const resetFilters = () => {
    setSearchValue("");
    setFilters(DEFAULT_FILTERS);
    fetchDemands(DEFAULT_FILTERS, 1);
  };

  const goToPage = (page: number) => {
    const nextPage = Math.min(Math.max(page, 1), pagination.totalPages);

    if (nextPage !== pagination.page) {
      fetchDemands(filters, nextPage);
    }
  };

  return (
    <main
      className={`relative isolate min-h-screen w-full overflow-hidden bg-[#fbf6e9] px-4 py-10 sm:px-6 lg:px-12 ${fontClass}`}
    >
      <div className="pointer-events-none absolute right-0 top-[10%] z-0 h-[clamp(240px,32vw,480px)] w-[clamp(240px,32vw,480px)] translate-x-1/2 rounded-full bg-amber-300 opacity-15 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[4%] left-0 z-0 h-[clamp(240px,32vw,480px)] w-[clamp(240px,32vw,480px)] -translate-x-1/2 rounded-full bg-yellow-300 opacity-15 blur-3xl" />
      <Image
        src="/assets/srov.png"
        width={260}
        height={260}
        alt="srov"
        className="pointer-events-none absolute right-0 top-[15%] z-0 h-auto max-h-[50%] w-[clamp(240px,9vw,200px)] object-contain opacity-50"
      />
      <Image
        src="/assets/srov2.png"
        width={260}
        height={260}
        alt="srov2"
        className="pointer-events-none absolute bottom-0 left-0 z-0 h-auto max-h-[50%] w-[clamp(240px,11vw,200px)] object-contain opacity-50"
      />

      <section className="relative z-10 mx-auto w-full max-w-325">
        <div className="mb-10 flex flex-col gap-4 border-b border-gray-100 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-gray-900 sm:text-3xl">
                {t("cropDemands.listings")}
              </h1>
            </div>
            <p className="mt-1 text-sm font-medium text-gray-500">
              {t("cropDemands.findDescription")}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-stretch justify-between gap-4 lg:flex-row lg:items-end mb-4">
          <form
            onSubmit={handleSearch}
            className="grid w-full grid-cols-1 items-end gap-4 sm:grid-cols-2 lg:grid-cols-[minmax(260px,1.4fr)_1fr_1fr_1fr]"
          >
            <div className="flex w-full flex-col gap-2">
              <label className="text-[14px] font-medium uppercase tracking-wider text-gray-500">
                {t("cropDemands.searchCropName")}
              </label>
              <div className="flex h-12 items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 transition-all focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/15">
                <input
                  value={searchValue}
                  onChange={(event) => setSearchValue(event.target.value)}
                  placeholder={t("crop.common.searchByCropName")}
                  className="min-w-0 flex-1 bg-transparent text-sm font-medium text-gray-900 outline-none placeholder:text-gray-400"
                />
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-50 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label={t("cropDemands.searchAria")}
                >
                  <Search className="h-5 w-5" />
                </button>
              </div>
            </div>

            <CustomFilterSelect
              label={t("crop.common.cropType")}
              labelClassName="text-muted"
              options={cropTypeOptions}
              selected={filters.cropType}
              onChange={(value) => updateFilter("cropType", value)}
            />

            <CustomFilterSelect
              label={t("crop.common.region")}
              labelClassName="text-muted"
              options={regionOptions}
              selected={filters.region}
              onChange={(value) => updateFilter("region", value)}
            />

            <CustomFilterSelect
              label={t("crop.common.status")}
              options={STATUS_OPTIONS}
              selected={filters.status}
              onChange={(value) => updateFilter("status", value)}
            />
          </form>

          <div className="flex h-12 items-center justify-end lg:mb-0">
            <button
              type="button"
              onClick={resetFilters}
              disabled={isPending}
              className="flex h-12 w-12 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 shadow-sm transition-all hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 active:scale-95"
              title={t("cropDemands.resetFilters")}
              aria-label={t("cropDemands.resetFiltersAria")}
            >
              <RotateCcw className="h-5 w-5 shrink-0" />
            </button>
          </div>
        </div>

        {isPending ? (
          <CropDemandCardGridSkeleton />
        ) : demands.length > 0 ? (
          <div className="grid grid-cols-1 justify-items-center gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {demands.map((item) => (
              <CropCardDemand
                key={item.postId || item.cropDemandPostId}
                data={item}
              />
            ))}
          </div>
        ) : (
          <div className="flex min-h-75 flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white p-8 text-center shadow-sm">
            <p className="text-lg font-bold text-gray-800">
              {t("cropDemands.noResults")}
            </p>
            <p className="mt-1 max-w-md text-sm text-gray-500">
              {t("cropDemands.noResultsDescription")}
            </p>
          </div>
        )}

        <div className="mt-10 border-t border-light-grey/60 pt-4">
          <PaginationComponent
            currentPage={pagination.page}
            totalItems={pagination.totalElements}
            pageSize={pagination.size}
            onPageChange={goToPage}
            pageBase={1}
            size="sm"
            className="border-0 shadow-none"
            disabled={isPending}
          />
        </div>
      </section>
    </main>
  );
}