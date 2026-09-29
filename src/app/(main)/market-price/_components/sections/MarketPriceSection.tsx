"use client";

import { useEffect } from "react";
import { useCallback, useMemo, useRef, useState } from "react";
import TabNav from "../TabNav";
import DateRangePicker from "../../../../../components/filters/DateRangePicker";
import MarketPriceTable from "../tables/MarketPriceTable";
import Pagination from "../Pagination";
import { FilterDropdown } from "@/components/filters/FilterDropDown";
import { ITEMS_PER_PAGE } from "../../../../../data/marketPriceData";
import DocumentsSection from "./OfficialDocumentSection";
import { MarketPriceRow } from "@/types/market-price-row";
import { MarketPrice } from "@/types/market-price";
import { mapMarketPricesToRows } from "@/utils/market-price.mapper";
import SearchInput from "@/components/filters/SearchInput";
import { OfficialDocument } from "@/types/official-document";
import ActionButtons, { type ExportType } from "../ActionButtons";
import ActionButton from "@/components/common/ActionButton";
import AddMarketPriceModal from "../modals/AddMarketPriceModal";
import { Crop, CropType } from "@/types/cropType";
import { AdministrativeLocation } from "@/services/locationFilter.service";
import EditMarketPriceModal from "../modals/EditMarketPriceModal";
import { deleteMarketPriceAction } from "../../actions/delete-market-price.action";
import { pushToast } from "@/lib/toastStore";
import Modal from "../shared/Modal";
import { useMarketPriceText } from "../marketPriceText";
import { useRouter } from "next/navigation";
import { CustomFilterSelect } from "@/app/(main)/(crop-demands)/_components/CustomFilterSelect";

type Tab = "market" | "documents";

interface MarketPriceSectionProps {
  marketPrices: MarketPrice[];
  officialDocuments: OfficialDocument[];
  cropTypes: CropType[];
  crops: Crop[];
  provinces: AdministrativeLocation[];
  isGovernment: boolean;
  usdKhrRate: number;
}

export default function MarketPriceSection({
  marketPrices = [],
  officialDocuments = [],
  cropTypes = [],
  crops = [],
  provinces = [],
  isGovernment = false,
  usdKhrRate,
}: MarketPriceSectionProps) {
  const { t, fontClass } = useMarketPriceText();
  const [activeTab, setActiveTab] = useState<Tab>("market");
  const [search, setSearch] = useState("");
  const [region, setRegion] = useState("");
  const [cropType, setCropType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [tableData, setTableData] = useState<MarketPriceRow[]>(
    mapMarketPricesToRows(marketPrices, usdKhrRate),
  );

  useEffect(() => {
    setTableData(mapMarketPricesToRows(marketPrices, usdKhrRate));
  }, [marketPrices, usdKhrRate]);

  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">(
    "idle",
  );

  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [isAddMarketPriceOpen, setIsAddMarketPriceOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteConfirmRow, setDeleteConfirmRow] =
    useState<MarketPriceRow | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();

    return tableData.filter((row) => {
      if (q && !row.cropName.toLowerCase().includes(q)) {
        return false;
      }

      const normalize = (value: string) =>
        value.toLowerCase().replace(/\s+/g, "");

      if (region && normalize(row.region) !== normalize(region)) {
        return false;
      }

      if (cropType && row.cropType !== cropType) {
        return false;
      }

      // Validity Date Filter
      if (startDate && endDate) {
        const rowDate = new Date(row.validityDate);
        const start = new Date(startDate);
        const end = new Date(endDate);

        end.setHours(23, 59, 59, 999);

        if (rowDate < start || rowDate > end) {
          return false;
        }
      }

      return true;
    });
  }, [tableData, search, region, cropType, startDate, endDate]);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;

    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, currentPage]);

  const handleDataChange = useCallback((updatedRows: MarketPriceRow[]) => {
    setSaveState("saving");

    setTableData((previousRows) =>
      previousRows.map((row) => {
        const updatedRow = updatedRows.find(
          (item) => item.marketPriceId === row.marketPriceId,
        );

        return updatedRow ?? row;
      }),
    );

    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    saveTimerRef.current = setTimeout(() => setSaveState("saved"), 400);
    setTimeout(() => setSaveState("idle"), 2800);
  }, []);

  const router = useRouter();
  const handleRefresh = () => {
    setSearch("");
    setRegion("");
    setCropType("");
    setStartDate("");
    setEndDate("");
    setCurrentPage(1);
    router.refresh();
  };

  const handleExport = (type: ExportType) => {
    const headers = [
      t("market.table.no"),
      t("market.table.cropName"),
      t("market.table.cropType"),
      t("market.table.region"),
      t("market.table.unit"),
      t("market.table.currentPrice"),
      t("market.table.minPrice"),
    ];

    const rowData = filtered.map((row, index) => [
      index + 1,
      row.cropName,
      row.cropType,
      row.region,
      row.unit,
      row.currentPrice,
      row.minPrice,
    ]);

    if (type === "csv") {
      const csvRows = rowData.map((row) =>
        row
          .map((cell) => (typeof cell === "string" ? `"${cell}"` : cell))
          .join(","),
      );
      const blob = new Blob([[headers.join(","), ...csvRows].join("\n")], {
        type: "text/csv;charset=utf-8;",
      });
      const url = URL.createObjectURL(blob);
      Object.assign(document.createElement("a"), {
        href: url,
        download: `crop-price-${startDate}.csv`,
      }).click();
      URL.revokeObjectURL(url);
      return;
    }

    if (type === "excel") {
      const tableRows = rowData
        .map(
          (row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`,
        )
        .join("");
      const htmlContent = `<table><thead><tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr></thead><tbody>${tableRows}</tbody></table>`;
      const blob = new Blob([htmlContent], {
        type: "application/vnd.ms-excel",
      });
      const url = URL.createObjectURL(blob);
      Object.assign(document.createElement("a"), {
        href: url,
        download: `crop-price-${startDate}.xls`,
      }).click();
      URL.revokeObjectURL(url);
      return;
    }

    if (type === "pdf") {
      const tableRows = rowData
        .map(
          (row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`,
        )
        .join("");
      const htmlContent =
        `<!DOCTYPE html><html><head><title>Crop Price Report — ${startDate}</title><style>@page{margin:0;}body{font-family:Arial,sans-serif;margin:0;padding:0;color:#2a2f33;-webkit-print-color-adjust:exact;print-color-adjust:exact;}.container{width:88%;margin:28px auto;}h2{color:#107446;margin-bottom:4px;font-size:22px;}p{color:#889299;font-size:13px;margin-bottom:16px;}table{width:100%;border-collapse:collapse;table-layout:auto;}th{background:#107446;color:#fff;padding:10px 14px;text-align:left;font-size:12px;white-space:nowrap;}td{padding:8px 14px;border:1px solid #e2e8f0;font-size:13px;white-space:nowrap;}tr:nth-child(even){background:#f9fafb;}</style></head><body><div class="container"><h2>${t("market.section.cropPriceListing")}</h2><p>${t("market.export.generated")}: ${startDate}</p><table><thead><tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr></thead><tbody>${tableRows}</tbody></table></div><script>window.onload=function(){window.print();}</` +
        `script></body></html>`;
      const printWindow = window.open("", "_blank");
      printWindow?.document.write(htmlContent);
      printWindow?.document.close();
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);

    document
      .getElementById("price-table-anchor")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const cropTypeOptions = useMemo(
    () => cropTypes.map((type) => type.typeName),
    [cropTypes],
  );

  const [editingRow, setEditingRow] = useState<MarketPriceRow | null>(null);
  const [isEditMarketPriceOpen, setIsEditMarketPriceOpen] = useState(false);
  const handleOpenEdit = (row: MarketPriceRow) => {
    setEditingRow(row);
    setIsEditMarketPriceOpen(true);
  };

  const handleDeleteMarketPrice = (row: MarketPriceRow) => {
    setDeleteConfirmRow(row);
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmRow) return;
    const row = deleteConfirmRow;
    setDeleteConfirmRow(null);

    const result = await deleteMarketPriceAction(row.marketPriceId);

    if (!result.success) {
      pushToast({
        title: t("market.toast.deleteFailed.title"),
        message: result.error,
        variant: "error",
      });
      return;
    }

    setTableData((previousRows) =>
      previousRows.filter((item) => item.marketPriceId !== row.marketPriceId),
    );

    pushToast({
      title: t("market.toast.marketDeleted.title"),
      message: `${row.cropName} ${t("market.toast.marketDeleted.message")}`,
      variant: "success",
    });
  };

  return (
    <div
      className={`mx-auto flex w-full max-w-[1300px] flex-col gap-6 pt-6 ${fontClass}`}
    >
      <div className="w-full pt-6">
        <div className="overflow-visible rounded-2xl bg-surface-card scroll-mt-4">
          <TabNav activeTab={activeTab} onTabChange={setActiveTab} />

          {activeTab === "market" ? (
            <div className="flex flex-col pt-6 overflow-visible">
              <div className="mt-2 flex select-none flex-col items-center gap-1 text-center">
                <p className="mb-1 text-[20px] font-semibold uppercase leading-none text-primary">
                  {t("market.section.priceData")}
                </p>

                <h2 className="text-[32px] font-black leading-none text-primary-heading">
                  {t("market.section.cropPriceListing")}
                </h2>
              </div>

              <div className="relative z-20 mt-6 flex w-full flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-end">
                <div className="w-full lg:min-w-[220px] lg:flex-1">
                  <SearchInput
                    value={search}
                    onChange={setSearch}
                    label={t("market.search")}
                    placeholder={t("market.search.crop.placeholder")}
                  />
                </div>

                <div className="w-full sm:w-[calc(50%-6px)] lg:w-[188px] lg:shrink-0">
                  <CustomFilterSelect
                    label={t("market.form.region")}
                    selected={region || "All"}
                    options={["All", ...provinces.map((p) => p.nameEn)]}
                    onChange={(value) => {
                      setRegion(value === "All" ? "" : value);
                      setCurrentPage(1);
                    }}
                  />
                </div>

                <div className="w-full sm:w-[calc(50%-6px)] lg:w-[188px] lg:shrink-0">
                  <CustomFilterSelect
                    label={t("market.form.cropType")}
                    selected={cropType || "All"}
                    options={["All", ...cropTypeOptions]}
                    onChange={(value) => {
                      setCropType(value === "All" ? "" : value);
                      setCurrentPage(1);
                    }}
                  />
                </div>

                <div className="w-full sm:w-[calc(50%-6px)] lg:w-[245px] lg:shrink-0">
                  <DateRangePicker
                    startDate={startDate}
                    endDate={endDate}
                    onChange={(start, end) => {
                      setStartDate(start);
                      setEndDate(end);
                      setCurrentPage(1);
                    }}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex w-full justify-end gap-2 lg:w-auto">
                  {isGovernment && (
                    <ActionButton onClick={() => setIsAddMarketPriceOpen(true)}>
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M9.9974 18.3327C14.5807 18.3327 18.3307 14.5827 18.3307 9.99935C18.3307 5.41602 14.5807 1.66602 9.9974 1.66602C5.41406 1.66602 1.66406 5.41602 1.66406 9.99935C1.66406 14.5827 5.41406 18.3327 9.9974 18.3327Z"
                          stroke="#2A2F33"
                          strokeWidth="2"
                        />
                        <path
                          d="M6.66406 10H13.3307"
                          stroke="#2A2F33"
                          strokeWidth="2"
                        />
                        <path
                          d="M10 13.3327V6.66602"
                          stroke="#292D32"
                          strokeWidth="1.5"
                        />
                      </svg>
                      {t("market.button.addMarketPrice")}
                    </ActionButton>
                  )}

                  <ActionButtons
                    onRefresh={handleRefresh}
                    onExport={(type) => handleExport(type)}
                  />
                </div>
              </div>

              <div
                aria-live="polite"
                className={`mt-2 flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-300 ${
                  saveState !== "idle"
                    ? "translate-y-0 opacity-100"
                    : "pointer-events-none -translate-y-2 opacity-0"
                } ${
                  saveState === "saving"
                    ? "border border-amber-200 bg-amber-50 text-amber-600"
                    : "border border-green-200 bg-green-50 text-brand"
                }`}
              >
                {saveState === "saving" ? (
                  <>
                    <svg
                      className="h-4 w-4 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8H4z"
                      />
                    </svg>
                    {t("market.status.savingChanges")}
                  </>
                ) : (
                  <>
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {t("market.status.changesSaved")}
                  </>
                )}
              </div>

              <div
                id="price-table-anchor"
                className="overflow-visible rounded-xl scroll-mt-2"
              >
                <MarketPriceTable
                  data={paginated}
                  onDataChange={handleDataChange}
                  onEditRow={handleOpenEdit}
                  onDeleteRow={handleDeleteMarketPrice}
                  isGovernment={isGovernment}
                  pageOffset={(currentPage - 1) * ITEMS_PER_PAGE}
                />
              </div>

              <div className="pt-6">
                <Pagination
                  currentPage={currentPage}
                  totalItems={filtered.length}
                  itemsPerPage={ITEMS_PER_PAGE}
                  onPageChange={handlePageChange}
                />
              </div>
            </div>
          ) : (
            <DocumentsSection
              officialDocuments={officialDocuments}
              isGovernment={isGovernment}
            />
          )}
        </div>
      </div>
      <AddMarketPriceModal
        open={isAddMarketPriceOpen}
        onClose={() => setIsAddMarketPriceOpen(false)}
        cropTypes={cropTypes}
        crops={crops}
        provinces={provinces}
      />
      <EditMarketPriceModal
        open={isEditMarketPriceOpen}
        onClose={() => {
          setIsEditMarketPriceOpen(false);
          setEditingRow(null);
        }}
        row={editingRow}
        cropTypes={cropTypes}
        crops={crops}
        provinces={provinces}
        usdKhrRate={usdKhrRate}
        onUpdated={(updatedRow) => {
          setTableData((previousRows) =>
            previousRows.map((item) =>
              item.marketPriceId === updatedRow.marketPriceId
                ? updatedRow
                : item,
            ),
          );
        }}
      />
      <Modal
        open={deleteConfirmRow !== null}
        title={t("market.modal.deleteMarketPrice")}
        onClose={() => setDeleteConfirmRow(null)}
      >
        <p className="mb-6 text-[15px] text-secondary-body">
          {t("market.confirm.deleteMarketPricePrefix")}{" "}
          <span className="font-semibold text-primary-heading">
            {deleteConfirmRow?.cropName}
          </span>{" "}
          {t("market.confirm.deleteMarketPriceSuffix")}
        </p>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => setDeleteConfirmRow(null)}
            className="rounded-lg border border-border px-5 py-2.5 text-[14px] font-semibold text-secondary-body hover:bg-light-grey/40 transition-colors"
          >
            {t("market.action.noCancel")}
          </button>
          <button
            type="button"
            onClick={handleConfirmDelete}
            className="rounded-lg bg-red-500 px-5 py-2.5 text-[14px] font-semibold text-white hover:bg-red-600 transition-colors"
          >
            {t("market.action.yesDelete")}
          </button>
        </div>
      </Modal>
    </div>
  );
}
