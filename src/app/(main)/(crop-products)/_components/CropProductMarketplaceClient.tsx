"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
  type FormEvent,
} from "react";
import Image from "next/image";
import { RotateCcw, Search } from "lucide-react";

import type { CropProductPost } from "@/types/crop-product";
import type { UserRole } from "@/constants/role";
import HeroSection from "./HeroSection";
import CropProductCardComponent from "./CropProductCardComponent";
import { CustomFilterSelect } from "../../(crop-demands)/_components/CustomFilterSelect";
import { getCropProductsAction } from "@/action/crop-product.action";
import { showApiToast } from "@/lib/apiToast";
import PaginationComponent from "@/components/action-components/PaginationComponent";
import { CropType } from "@/types/cropType";
import type { AdministrativeLocation } from "@/services/locationFilter.service";
import { getCropTypeFilterOptions } from "@/lib/cropTypeOptions";
import { getLocationFilterOptions } from "@/lib/locationOptions";
import { useI18n } from "@/lib/i18n/I18nContext";

const MARKETPLACE_TEXT = {
  "marketplace.categories.rice.title": {
    en: "Rice Crops",
    kh: "ដំណាំស្រូវ",
  },
  "marketplace.categories.rice.desc": {
    en: "High-quality rice with high yield.",
    kh: "ស្រូវមានគុណភាពខ្ពស់ និងផ្តល់ទិន្នផលខ្ពស់។",
  },
  "marketplace.categories.fruits.title": {
    en: "Fruits",
    kh: "ផ្លែឈើ",
  },
  "marketplace.categories.fruits.desc": {
    en: "Fresh and healthy fruits.",
    kh: "ផ្លែឈើស្រស់ៗ និងល្អសម្រាប់សុខភាព។",
  },
  "marketplace.categories.vegetables.title": {
    en: "Vegetables",
    kh: "បន្លែ",
  },
  "marketplace.categories.vegetables.desc": {
    en: "Fresh, natural vegetables.",
    kh: "បន្លែស្រស់ៗធម្មជាតិ។",
  },
  "marketplace.categories.industrial.title": {
    en: "Industrial Crops",
    kh: "ដំណាំឧស្សាកម្ម",
  },
  "marketplace.categories.industrial.desc": {
    en: "Sustainable crops for industry.",
    kh: "ដំណាំប្រកបដោយនិរន្តរភាពសម្រាប់វិស័យឧស្សាហកម្ម។",
  },
} as const;

const categories = [
  {
    titleKey: "marketplace.categories.rice.title",
    descriptionKey: "marketplace.categories.rice.desc",
    image: "/assets/home_page/rice-crop.png",
    cropTypeKeyword: "rice",
  },
  {
    titleKey: "marketplace.categories.fruits.title",
    descriptionKey: "marketplace.categories.fruits.desc",
    image: "/assets/home_page/fruits.jpg",
    cropTypeKeyword: "fruit",
  },
  {
    titleKey: "marketplace.categories.vegetables.title",
    descriptionKey: "marketplace.categories.vegetables.desc",
    image: "/assets/home_page/vegetable1.jpg",
    cropTypeKeyword: "vegetable",
  },
  {
    titleKey: "marketplace.categories.industrial.title",
    descriptionKey: "marketplace.categories.industrial.desc",
    image: "/assets/home_page/image02.png",
    cropTypeKeyword: "industrial",
  },
];

type Props = {
  products: CropProductPost[];
  role: UserRole | null;
  pagination: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
  initialCropTypes: CropType[];
  initialProvinces: AdministrativeLocation[];
};

type ProductFilters = {
  search: string;
  cropType: string;
  region: string;
  status: string;
};

const DEFAULT_FILTERS: ProductFilters = {
  search: "",
  cropType: "All",
  region: "All",
  status: "All",
};

const STATUS_OPTIONS = ["All", "AVAILABLE", "UNAVAILABLE"];

export default function CropProductMarketplaceClient({
  products,
  role,
  pagination,
  initialCropTypes,
  initialProvinces,
}: Props) {
  const { t, language } = useI18n();
  const [localProducts, setLocalProducts] = useState(products);
  const [paginationState, setPaginationState] = useState(pagination);
  const [filters, setFilters] = useState<ProductFilters>(DEFAULT_FILTERS);
  const [searchValue, setSearchValue] = useState("");
  const [isPending, startTransition] = useTransition();

  // Dynamically assign the correct typography class based on language
  const fontClass = language === "kh" ? "font-khmer" : "font-thicccboi";

  const tLocal = useCallback(
    (key: string) => {
      const lang = language === "kh" ? "kh" : "en";
      return MARKETPLACE_TEXT[key as keyof typeof MARKETPLACE_TEXT]?.[lang] ?? key;
    },
    [language],
  );

  const cropTypeOptions = useMemo(
    () => getCropTypeFilterOptions(initialCropTypes),
    [initialCropTypes],
  );

  const regionOptions = useMemo(
    () => getLocationFilterOptions(initialProvinces),
    [initialProvinces],
  );

  const fetchProducts = useCallback(
    (page: number, nextFilters: ProductFilters) => {
      startTransition(async () => {
        const result = await getCropProductsAction(page, paginationState.size, {
          search: nextFilters.search,
          cropType: nextFilters.cropType,
          region: nextFilters.region,
          status: nextFilters.status,
        });

        if (result.error) {
          showApiToast(
            { success: false, error: result.error },
            {
              successTitle: "Crop products loaded",
              errorTitle: "Load failed",
              errorMessage: "Failed to load crop products.",
            },
          );
          return;
        }

        setLocalProducts(result.data);

        setPaginationState({
          page:
            result.pagination?.page && result.pagination.page > 0
              ? result.pagination.page
              : page,
          size: result.pagination?.size ?? paginationState.size,
          totalElements: result.pagination?.totalElements ?? result.data.length,
          totalPages: result.pagination?.totalPages ?? 1,
        });
      });
    },
    [paginationState.size],
  );

  const goToPage = (page: number) => {
    const nextPage = Math.min(Math.max(page, 1), paginationState.totalPages);

    if (nextPage !== paginationState.page) {
      fetchProducts(nextPage, filters);
    }
  };

  const updateFilter = (key: keyof ProductFilters, value: string) => {
    const nextFilters = { ...filters, [key]: value };

    setFilters(nextFilters);
    fetchProducts(1, nextFilters);
  };

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    updateFilter("search", searchValue.trim());
  };

  const listingsRef = useRef<HTMLElement>(null);

  // Match a category card to one of the real crop-type filter options coming
  // from the backend (e.g. "rice" -> "RICE CROPS"), filter by it, then scroll
  // down to the product list.
  const handleCategorySelect = (cropTypeKeyword: string) => {
    const matchedCropType = cropTypeOptions.find(
      (option) =>
        option !== "All" && option.toLowerCase().includes(cropTypeKeyword),
    );

    if (matchedCropType && matchedCropType !== filters.cropType) {
      updateFilter("cropType", matchedCropType);
    }

    listingsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  useEffect(() => {
    const search = searchValue.trim();

    if (search === filters.search) return;

    const timer = window.setTimeout(() => {
      const nextFilters = { ...filters, search };

      setFilters(nextFilters);
      fetchProducts(1, nextFilters);
    }, 450);

    return () => window.clearTimeout(timer);
  }, [fetchProducts, filters, searchValue]);

  const resetFilters = () => {
    setSearchValue("");
    setFilters(DEFAULT_FILTERS);
    fetchProducts(1, DEFAULT_FILTERS);
  };

  return (
    <div className="min-h-screen bg-[#fbf6e9]">
      <HeroSection role={role} />

      <div className={`relative overflow-hidden ${fontClass}`}>
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

        <div className="relative z-10 mx-auto mt-[2%] grid w-full max-w-325 grid-cols-1 gap-4 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
          {categories.map((cat) => {
            const isActiveCategory =
              filters.cropType !== "All" &&
              filters.cropType.toLowerCase().includes(cat.cropTypeKeyword);

            return (
            <div
              key={cat.titleKey}
              role="button"
              tabIndex={0}
              aria-pressed={isActiveCategory}
              onClick={() => handleCategorySelect(cat.cropTypeKeyword)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  handleCategorySelect(cat.cropTypeKeyword);
                }
              }}
              className={`group relative h-48 w-full cursor-pointer overflow-hidden rounded-2xl aspect-4/3 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:h-55 sm:aspect-6/5 lg:aspect-3/4 ${
                isActiveCategory ? "ring-2 ring-primary ring-offset-2" : ""
              }`}
            >
              {/* Background Image */}

              <Image
                src={cat.image}
                alt={tLocal(cat.titleKey)}
                fill
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />

              {/* Dark Gradient Overlay for text readability */}
              <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/40 to-transparent" />

              {/* Text Content */}
              <div className="absolute bottom-0 left-0 right-0 flex flex-col justify-end p-4 sm:p-5 md:p-6">
                <p className="text-base font-bold tracking-wide text-white sm:text-lg md:text-xl">
                  {tLocal(cat.titleKey)}
                </p>
                <p className="mt-1 line-clamp-2 text-xs font-light text-gray-300 md:text-sm">
                  {tLocal(cat.descriptionKey)}
                </p>
              </div>
            </div>
            );
          })}
        </div>
        <main className="relative z-10 w-full px-4 py-10 sm:px-6 lg:px-8">
          <section ref={listingsRef} className="mx-auto w-full max-w-325">
            <div className="mb-8 flex flex-col gap-2">
              <h2 className="text-2xl font-extrabold text-primary-heading sm:text-3xl">
                {t("cropProducts.listings")}
              </h2>

              <p className="text-sm font-medium text-secondary-body">
                {t("cropProducts.browseDescription")}
              </p>
            </div>

            <div className="mb-8 flex flex-col items-stretch justify-between gap-4 lg:flex-row lg:items-end">
              <form
                onSubmit={handleSearch}
                className="grid w-full grid-cols-1 items-end gap-4 sm:grid-cols-2 lg:grid-cols-[minmax(260px,1.25fr)_1fr_1fr_1fr]"
              >
                <div className="flex w-full flex-col gap-2">
                  <label className="text-[14px] font-medium uppercase tracking-wider text-muted">
                    {t("cropProducts.searchProducts")}
                  </label>

                  <div className="flex h-12 items-center gap-2 rounded-xl border border-light-grey bg-white px-4 shadow-xs transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10">
                    <input
                      value={searchValue}
                      onChange={(event) => setSearchValue(event.target.value)}
                      placeholder={t("cropProducts.searchPlaceholder")}
                      className="min-w-0 flex-1 bg-transparent text-sm font-medium text-primary-heading outline-none placeholder:text-muted"
                    />

                    <button
                      type="submit"
                      disabled={isPending}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted transition-colors hover:bg-gray-50 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
                      aria-label={t("cropProducts.searchAria")}
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

              <div className="flex h-12 items-center justify-end">
                <button
                  type="button"
                  onClick={resetFilters}
                  disabled={isPending}
                  className="flex h-12 w-12 items-center justify-center rounded-xl border border-light-grey bg-white text-secondary-body shadow-xs transition-all hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 active:scale-95"
                  title={t("crop.common.resetFilters")}
                  aria-label={t("crop.common.resetFilters")}
                >
                  <RotateCcw className="h-5 w-5 shrink-0" />
                </button>
              </div>
            </div>

            {isPending ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: paginationState.size }).map((_, index) => (
                  <div
                    key={index}
                    className="h-90 rounded-xl border border-light-grey bg-white p-4 shadow-xs"
                  >
                    <div className="aspect-4/3 animate-pulse rounded-lg bg-gray-100" />
                    <div className="mt-4 h-4 w-2/3 animate-pulse rounded bg-gray-100" />
                    <div className="mt-3 h-3 w-1/2 animate-pulse rounded bg-gray-100" />
                    <div className="mt-8 h-10 animate-pulse rounded-lg bg-gray-100" />
                  </div>
                ))}
              </div>
            ) : localProducts.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {localProducts.map((item) => (
                  <CropProductCardComponent
                    key={item.cropProductPostId}
                    data={item}
                    role={role}
                  />
                ))}
              </div>
            ) : (
              <div className="flex min-h-65 items-center justify-center rounded-2xl border border-dashed border-light-grey bg-white text-center">
                <div>
                  <p className="text-lg font-bold text-primary-heading">
                    {t("cropProducts.notFound")}
                  </p>

                  <p className="mt-1 text-sm text-secondary-body">
                    {t("cropProducts.notFoundHint")}
                  </p>
                </div>
              </div>
            )}

            <div className="mt-10 border-t border-light-grey/60 pt-4">
              <PaginationComponent
                currentPage={paginationState.page}
                totalItems={paginationState.totalElements}
                pageSize={paginationState.size}
                onPageChange={goToPage}
                pageBase={1}
                size="sm"
                className="border-0 shadow-none"
                disabled={isPending}
              />
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
