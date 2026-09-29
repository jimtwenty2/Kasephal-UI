"use client";

import { useMemo, useState } from "react";
import CropProductCardComponent from "../../(crop-products)/_components/CropProductCardComponent";
import PaginationComponent from "./PaginationComponent";
import CropFilterComponent from "./CropFilterComponent";
import { ROLES } from "@/constants/role";
import type { CropProductPost } from "@/types/crop-product";
import { useI18n } from "@/lib/i18n/I18nContext";
import type { ProfileRole } from "../_lib/own-profile.types";

const PROFILE_TEXT = {
  "profile.body.status": { en: "STATUS", kh: "ស្ថានភាព" },
  "profile.description.cropPost": { en: "Updates will appear here once a crop listing is created", kh: "ព័ត៌មាននឹងបង្ហាញនៅទីនេះ នៅពេលមានការបង្កើតបញ្ជីដំណាំ" },
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

type CropPostComponentProps = {
  cropProducts: CropProductPost[];
  viewerRole?: ProfileRole | null;
};

export default function CropPostComponent({
  cropProducts,
  viewerRole = null,
}: CropPostComponentProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchValue, setSearchValue] = useState("");
  const [filterValue, setFilterValue] = useState("ALL");
  const { language } = useI18n();
  const t = getProfileText(language);
  const fontClass = language === "kh" ? "font-khmer" : "font-thicccboi";
  const cardRole =
    viewerRole === "buyer"
      ? ROLES.BUYER
      : viewerRole === "government"
        ? ROLES.GOVERNMENT
        : ROLES.FARMER;
  const filterOptions = useMemo(
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
      const searchableText = [
        crop.title,
        crop.cropName,
        crop.cropType,
        crop.location,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = search === "" || searchableText.includes(search);

      if (filterValue === "ALL") {
        return matchesSearch;
      }

      const cropStatus = String(crop.status || "").toUpperCase();
      const matchesStatus = cropStatus === filterValue;

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
    <div className={`mt-4 w-full ${fontClass}`}>
      <CropFilterComponent
        searchValue={searchValue}
        onSearchChange={handleSearchChange}
        filters={[
          {
            label: t("profile.body.status"),
            options: filterOptions,
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
                crop.cropProductId ||
                crop.postId ||
                `crop-${currentPage}-${index}`
              }
              className="w-full min-w-0"
            >
              <CropProductCardComponent data={crop} role={cardRole} />
            </div>
          ))}
        </div>
      ) : (
        <div className="my-8 flex min-h-50 items-center justify-center rounded-2xl border border-dashed border-light-grey bg-white">
          <p className="text-sm font-medium text-muted">
            {t("profile.description.cropPost")}
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
