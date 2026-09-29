"use client";

import { useMemo, useState } from "react";
import CropProductCardComponent from "../../(crop-products)/_components/CropProductCardComponent";
import PaginationComponent from "./PaginationComponent";
import CropFilterComponent from "./CropFilterComponent";
import { ROLES } from "@/constants/role";
import type { CropProductPost } from "@/types/crop-product";
import { useI18n } from "@/lib/i18n/I18nContext";

const PROFILE_TEXT = {
  "profile.body.status": { en: "STATUS", kh: "ស្ថានភាព" },
  "profile.description.savedCropPost": { en: "Explore the marketplace and bookmark your favorite crop listings to keep track of them here.", kh: "ស្វែងរកទីផ្សារ និងរក្សាទុកបញ្ជីដំណាំដែលអ្នកចូលចិត្ត ដើម្បីតាមដាននៅទីនេះ។" },
  "profile.status.all": { en: "ALL", kh: "ទាំងអស់" },
  "profile.status.available": { en: "Available", kh: "មាន" },
  "profile.status.unavailable": { en: "Unavailable", kh: "មិនមាន" },
} as const;

function getProfileText(language: string) {
  const lang: "en" | "kh" = language === "kh" ? "kh" : "en";

  return (key: string) =>
    PROFILE_TEXT[key as keyof typeof PROFILE_TEXT]?.[lang] ?? key;
}


const ITEMS_PER_PAGE = 8;

type SavedCropPostComponentProps = {
  cropProducts: CropProductPost[];
};

export default function SavedCropPostComponent({
  cropProducts,
}: SavedCropPostComponentProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchValue, setSearchValue] = useState("");
  const [filterValue, setFilterValue] = useState("ALL");
  const { language } = useI18n();
  const t = getProfileText(language);
  const fontClass = language === "kh" ? "font-khmer" : "font-thicccboi";
  const statusOptions = useMemo(
    () => [
      { label: t("profile.status.all"), value: "ALL" },
      { label: t("profile.status.available"), value: "AVAILABLE" },
      { label: t("profile.status.unavailable"), value: "UNAVAILABLE" },
    ],
    [t],
  );

  const filteredCropProducts = useMemo(() => {
    const search = searchValue.toLowerCase().trim();

    return cropProducts.filter((crop) => {
      const matchesSearch =
        crop.title?.toLowerCase().includes(search) ||
        crop.cropName?.toLowerCase().includes(search) ||
        crop.cropType?.toLowerCase().includes(search) ||
        crop.cropTypeName?.toLowerCase().includes(search) ||
        crop.description?.toLowerCase().includes(search) ||
        crop.location?.toLowerCase().includes(search);

      const matchesStatus = filterValue === "ALL" || crop.status === filterValue;

      return matchesSearch && matchesStatus;
    });
  }, [cropProducts, searchValue, filterValue]);

  const paginatedCropProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredCropProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [currentPage, filteredCropProducts]);

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    setCurrentPage(1);
  };

  const handleFilterChange = (value: string) => {
    setFilterValue(value);
    setCurrentPage(1);
  };

  return (
    <div className={`mt-2 w-full ${fontClass}`}>
      <CropFilterComponent
        searchValue={searchValue}
        onSearchChange={handleSearchChange}
        filters={[
          {
            label: t("profile.body.status"),
            options: statusOptions,
            selected: filterValue,
            onChange: handleFilterChange,
          },
        ]}
      />

      {paginatedCropProducts.length > 0 ? (
        <div className="mt-8 grid w-full grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {paginatedCropProducts.map((crop, index) => (
            <div
              key={
                crop.cropProductPostId ||
                crop.postId ||
                crop.favoritePostId ||
                crop.cropId ||
                `saved-crop-${currentPage}-${index}`
              }
              className="w-full min-w-0"
            >
              <CropProductCardComponent data={crop} role={ROLES.BUYER} />
            </div>
          ))}
        </div>
      ) : (
        <div className="my-8 flex min-h-50 items-center justify-center rounded-2xl border border-dashed border-light-grey bg-white">
          <p className="text-sm font-medium text-muted">
            {t("profile.description.savedCropPost")}
          </p>
        </div>
      )}

      <PaginationComponent
        currentPage={currentPage}
        totalItems={filteredCropProducts.length}
        itemsPerPage={ITEMS_PER_PAGE}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
