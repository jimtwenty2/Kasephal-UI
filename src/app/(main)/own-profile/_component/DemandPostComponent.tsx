"use client";

import { useMemo, useState } from "react";
import DemandFilterComponent from "./DemandFilterComponent";
import PaginationComponent from "./PaginationComponent";
import CropCardDemand from "../../(crop-demands)/_components/CropCardDemand";
import type { CropDemandPost } from "@/types/crop-demand";
import { useI18n } from "@/lib/i18n/I18nContext";

const PROFILE_TEXT = {
  "profile.body.status": { en: "STATUS", kh: "ស្ថានភាព" },
  "profile.description.demandPost": { en: "Demand posts will appear here once a demand listing is created.", kh: "ប្រកាសតម្រូវការនឹងបង្ហាញនៅទីនេះ នៅពេលមានការបង្កើតបញ្ជីតម្រូវការ។" },
  "profile.status.all": { en: "ALL", kh: "ទាំងអស់" },
  "profile.status.closed": { en: "Closed", kh: "បានបិទ" },
  "profile.status.matched": { en: "Matched", kh: "បានផ្គូផ្គង" },
  "profile.status.open": { en: "Open", kh: "បើក" },
} as const;

function getProfileText(language: string) {
  const lang: "en" | "kh" = language === "kh" ? "kh" : "en";

  return (key: string) =>
    PROFILE_TEXT[key as keyof typeof PROFILE_TEXT]?.[lang] ?? key;
}


const ITEMS_PER_PAGE = 8;

type DemandPostComponentProps = {
  demandPosts: CropDemandPost[];
};

export default function DemandPostComponent({
  demandPosts,
}: DemandPostComponentProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchValue, setSearchValue] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const { language } = useI18n();
  const t = getProfileText(language);
  const fontClass = language === "kh" ? "font-khmer" : "font-thicccboi";
  const statusOptions = useMemo(
    () => [
      { label: t("profile.status.all"), value: "ALL" },
      { label: t("profile.status.open"), value: "OPEN" },
      { label: t("profile.status.matched"), value: "MATCHED" },
      { label: t("profile.status.closed"), value: "CLOSED" },
    ],
    [t],
  );

  const filteredDemands = useMemo(() => {
    const search = searchValue.toLowerCase().trim();

    return demandPosts.filter((item) => {
      const searchableText = [
        item.cropName,
        item.locationPreferences,
        item.title,
        item.buyerName,
        item.description,
        item.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = search === "" || searchableText.includes(search);

      if (selectedStatus === "ALL") {
        return matchesSearch;
      }

      const demandStatus = String(item.status || "").toUpperCase();
      const matchesStatus = demandStatus === selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }, [demandPosts, searchValue, selectedStatus]);

  const paginatedDemands = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;

    return filteredDemands.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredDemands, currentPage]);

  return (
    <div className={`mt-2 w-full ${fontClass}`}>
      <DemandFilterComponent
        searchValue={searchValue}
        onSearchChange={(value) => {
          setSearchValue(value);
          setCurrentPage(1);
        }}
        filters={[
          {
            label: t("profile.body.status"),
            options: statusOptions,
            selected: selectedStatus,
            onChange: (value) => {
              setSelectedStatus(value);
              setCurrentPage(1);
            },
          },
        ]}
      />

      {paginatedDemands.length > 0 ? (
        <div className="mt-8 grid w-full grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {paginatedDemands.map((item, index) => (
            <div
              key={
                item.cropDemandPostId ||
                item.postId ||
                `demandpostcomponent-${currentPage}-${index}`
              }
              className="w-full min-w-0"
            >
              <CropCardDemand data={item} />
            </div>
          ))}
        </div>
      ) : (
        <div className="my-8 flex min-h-50 items-center justify-center rounded-2xl border border-dashed border-light-grey bg-white">
          <p className="text-sm font-medium text-muted">
            {t("profile.description.demandPost")}
          </p>
        </div>
      )}

      <PaginationComponent
        currentPage={currentPage}
        totalItems={filteredDemands.length}
        itemsPerPage={ITEMS_PER_PAGE}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}