"use client";

import {
  useCallback,
  useState,
  useMemo,
  useSyncExternalStore,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, ArrowUp, ArrowDown, ArrowUpDown,ChevronsUpDown } from "lucide-react";
import { Order } from "@/services/order.service";
import PaginationComponent from "@/components/action-components/PaginationComponent";
import { formatCurrency } from "@/utils/formatCurrency";
import {
  getOrderCropName,
  getOrderCropType,
  getOrderCurrencyCode,
} from "@/utils/orderDisplay";
import { useI18n } from "@/lib/i18n/I18nContext";
import { CustomFilterSelect } from "../../../(crop-demands)/_components/CustomFilterSelect";

type UnitType = "KG" | "TON";
type Lang = "en" | "kh";

const ITEMS_PER_PAGE = 10;
const CROP_FALLBACK_IMAGE = "/assets/image/no-product.jpg";
const IMAGE_BASE_URL =
  process.env.NEXT_PUBLIC_IMAGE_BASE_URL ;

const TEXT = {
  home: { en: "Home", kh: "ទំព័រដើម" },
  orderHistory: { en: "Order History", kh: "ប្រវត្តិការបញ្ជាទិញ" },
  pageTitle: { en: "Order History", kh: "ប្រវត្តិការបញ្ជាទិញ" },
  pageSubtitle: {
    en: "Review and manage your past agricultural supply orders.",
    kh: "ពិនិត្យ និងគ្រប់គ្រងការបញ្ជាទិញផ្គត់ផ្គង់កសិកម្មកន្លងមករបស់អ្នក។",
  },
  searchLabel: { en: "Search", kh: "ស្វែងរក" },
  searchPlaceholder: {
    en: "Search by crop name...",
    kh: "ស្វែងរកតាមឈ្មោះដំណាំ...",
  },
  cropTypeLabel: { en: "Crop Type", kh: "ប្រភេទដំណាំ" },
  statusLabel: { en: "Status", kh: "ស្ថានភាព" },
  sortByLabel: { en: "Sort By", kh: "តម្រៀបតាម" },
  all: { en: "All", kh: "ទាំងអស់" },
  complete: { en: "Complete", kh: "បានបញ្ចប់" },
  incomplete: { en: "Incomplete", kh: "មិនទាន់បញ្ចប់" },
  latest: { en: "Latest", kh: "ថ្មីបំផុត" },
  priceLowHigh: { en: "Price: Low to High", kh: "តម្លៃ: តូចទៅធំ" },
  priceHighLow: { en: "Price: High to Low", kh: "តម្លៃ: ធំទៅតូច" },
  colNo: { en: "No", kh: "ល.រ" },
  colImage: { en: "Image", kh: "រូបភាព" },
  colCropName: { en: "Crop Name", kh: "ឈ្មោះដំណាំ" },
  colFarmer: { en: "Farmer", kh: "កសិករ" },
  colTotal: { en: "Total", kh: "តម្លៃសរុប" },
  colDeposit: { en: "Deposit", kh: "ប្រាក់កក់" },
  colQty: { en: "Qty", kh: "បរិមាណ" },
  colEscrow: { en: "Escrow", kh: "អេស្ក្រូ" },
  colPayment: { en: "Payment", kh: "ការបង់ប្រាក់" },
  colCreated: { en: "Created", kh: "កាលបរិច្ឆេទ" },
  colAction: { en: "Action", kh: "សកម្មភាព" },
  viewDetail: { en: "View Detail", kh: "មើលលម្អិត" },
  noOrders: {
    en: "No order record histories found.",
    kh: "រកមិនឃើញប្រវត្តិការបញ្ជាទិញទេ។",
  },
  farmerFallback: { en: "Farmer", kh: "កសិករ" },
  // Mobile card labels
  totalLabel: { en: "Total:", kh: "សរុប:" },
  qtyLabel: { en: "Qty:", kh: "បរិមាណ:" },
  farmerLabel: { en: "Farmer:", kh: "កសិករ:" },
  escrowLabel: { en: "Escrow:", kh: "អេស្ក្រូ:" },
  paymentLabel: { en: "Payment:", kh: "ការបង់ប្រាក់:" },
} as const;

const t = (key: keyof typeof TEXT, lang: Lang): string => TEXT[key][lang];

// ─── helpers ─────────────────────────────────────────────────────────────────

function resolveImageUrl(url: string | null | undefined, fallback: string) {
  if (!url) return fallback;
  if (url.startsWith("http")) return url;
  return `${IMAGE_BASE_URL}/${url}`;
}

function formatUnitType(qty: number, type: UnitType) {
  if (type === "TON") return `${qty} TON`;
  if (type === "KG") return `${qty} KG`;
}

function formatDate(isoString: string) {
  return new Date(isoString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function statusLabel(value?: string | null, fallback = "PENDING") {
  return (value || fallback).replace(/_/g, " ");
}

function resolvePaymentStatus(order: Order) {
  return order.paymentStatus || (order.isCompleted ? "PAID" : "PENDING");
}

function resolveEscrowStatus(order: Order) {
  return order.escrowStatus || "PENDING";
}

function paymentStatusClasses(status: string) {
  switch (status.toUpperCase()) {
    case "PAID":
    case "SUCCESS":
      return "bg-[#e3f4e9] text-[#1a7a4c]";
    case "PENDING":
      return "bg-amber-100 text-amber-700";
    case "FAILED":
      return "bg-[#fde2e2] text-[#c0392b]";
    default:
      return "bg-gray-100 text-gray-500";
  }
}

function escrowStatusClasses(status: string) {
  switch (status.toUpperCase()) {
    case "COMPLETED":
      return "bg-[#e3f4e9] text-[#1a7a4c]";
    case "FUNDED":
      return "bg-blue-50 text-blue-700";
    case "PARTIALLY_RELEASED":
      return "bg-indigo-50 text-indigo-700";
    case "REFUNDED":
      return "bg-rose-100 text-rose-700";
    case "PENDING":
      return "bg-amber-100 text-amber-700";
    default:
      return "bg-gray-100 text-gray-500";
  }
}

function StatusBadge({
  label,
  className,
  size = "md",
}: {
  label: string;
  className: string;
  size?: "sm" | "md";
}) {
  const sizing =
    size === "sm" ? "px-2 py-0.5 text-[9px]" : "px-3 py-1 text-[11px]";
  return (
    <span
      className={`inline-block rounded-full font-semibold uppercase tracking-wide ${sizing} ${className}`}
    >
      {label}
    </span>
  );
}

// ─── component ────────────────────────────────────────────────────────────────

interface OrderHistoryTableProps {
  orders: Order[];
}

export default function OrderHistoryTable({ orders }: OrderHistoryTableProps) {
  const { language } = useI18n();
  const lang: Lang = language === "kh" ? "kh" : "en";
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCropType, setSelectedCropType] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [sortBy, setSortBy] = useState("Latest");
  const [currentPage, setCurrentPage] = useState(1);
  const [colSort, setColSort] = useState<{
    key: "cropName" | "totalAmount" | "createdAt" | null;
    dir: "asc" | "desc";
  }>({ key: null, dir: "asc" });

  const toggleColSort = (key: "cropName" | "totalAmount" | "createdAt") => {
    setColSort((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { key, dir: "asc" },
    );
    setCurrentPage(1);
  };

  const isClient = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  // Derive crop type options from actual API data
  const cropTypeOptions = useMemo(() => {
    const types = [
      ...new Set(orders.map((o) => getOrderCropType(o)).filter(Boolean)),
    ];
    return ["All", ...types];
  }, [orders]);

  const statusOptions = useMemo(
    () => ["All", "COMPLETE", "INCOMPLETE"],
    [],
  );

  const sortOptions = useMemo(
    () => ["Latest", "PriceAsc", "PriceDesc"],
    [],
  );

  // Label maps for display in CustomFilterSelect
  const statusLabelMap: Record<string, string> = useMemo(
    () => ({
      All: t("all", lang),
      COMPLETE: t("complete", lang),
      INCOMPLETE: t("incomplete", lang),
    }),
    [lang],
  );

  const sortLabelMap: Record<string, string> = useMemo(
    () => ({
      Latest: t("latest", lang),
      PriceAsc: t("priceLowHigh", lang),
      PriceDesc: t("priceHighLow", lang),
    }),
    [lang],
  );

  const filteredOrders = useMemo(() => {
    const result = orders.filter((order) => {
      const cropName = getOrderCropName(order).toLowerCase();
      const matchSearch = cropName.includes(searchQuery.toLowerCase());
      const matchType =
        selectedCropType === "All" ||
        getOrderCropType(order) === selectedCropType;
      const status = order.isCompleted ? "COMPLETE" : "INCOMPLETE";
      const matchStatus = selectedStatus === "All" || status === selectedStatus;
      return matchSearch && matchType && matchStatus;
    });

    if (sortBy === "PriceAsc")
      result.sort((a, b) => a.totalAmount - b.totalAmount);
    if (sortBy === "PriceDesc")
      result.sort((a, b) => b.totalAmount - a.totalAmount);
    if (sortBy === "Latest")
      result.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

    // Column header sort overrides dropdown sort
    if (colSort.key) {
      const dir = colSort.dir === "asc" ? 1 : -1;
      result.sort((a, b) => {
        if (colSort.key === "cropName")
          return dir * getOrderCropName(a).localeCompare(getOrderCropName(b));
        if (colSort.key === "totalAmount")
          return dir * (a.totalAmount - b.totalAmount);
        if (colSort.key === "createdAt")
          return dir * (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        return 0;
      });
    }

    return result;
  }, [orders, searchQuery, selectedCropType, selectedStatus, sortBy, colSort]);

  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredOrders.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredOrders, currentPage]);

  if (!isClient) {
    return <div className="min-h-screen w-full bg-[#fbf6e9]" />;
  }

  return (
    <div className={`min-h-screen px-4 py-8 md:px-12 md:py-10 ${lang === "kh" ? "font-khmer" : ""}`}>
      <div className="mx-auto max-w-[1280px]">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-xs text-gray-400 md:text-sm">
          <Link href="/" className="transition-colors hover:text-gray-600">
            {t("home", lang)}
          </Link>
          <span>&rsaquo;</span>
          <span className="font-bold text-primary">{t("orderHistory", lang)}</span>
        </nav>

        {/* Header */}
        <header className="mb-8">
          <h1 className="text-[32px] font-bold tracking-tight text-gray-900 sm:text-4xl">
            {t("pageTitle", lang)}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {t("pageSubtitle", lang)}
          </p>
        </header>

        {/* Filters */}
        <section className="mb-6 flex w-full flex-col gap-4 lg:grid lg:grid-cols-12 lg:items-end lg:gap-5">
          {/* Search */}
          <div className="flex flex-col gap-2 lg:col-span-4">
            <label className="text-[14px] font-medium uppercase tracking-wider text-gray-500">
              {t("searchLabel", lang)}
            </label>
            <div className="group relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder={t("searchPlaceholder", lang)}
                className="w-full rounded-3xl border border-light-grey bg-white py-3 pl-4 pr-12 text-sm text-dark-grey transition-all duration-200 placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
                style={{ height: "46px" }}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted transition-colors duration-200 group-focus-within:text-primary">
                <Search className="h-5 w-5" />
              </span>
            </div>
          </div>

          {/* Dropdowns */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:col-span-8">
            {/* Crop Type */}
            <CustomFilterSelect
              label={t("cropTypeLabel", lang)}
              options={cropTypeOptions}
              selected={selectedCropType}
              onChange={(val) => {
                setSelectedCropType(val);
                setCurrentPage(1);
              }}
            />

            {/* Status — uses value keys; displayed labels via statusLabelMap */}
            <CustomFilterSelect
              label={t("statusLabel", lang)}
              options={statusOptions}
              selected={selectedStatus}
              onChange={(val) => {
                setSelectedStatus(val);
                setCurrentPage(1);
              }}
            />

            {/* Sort By — uses value keys; displayed labels via sortLabelMap */}
            <CustomFilterSelect
              label={t("sortByLabel", lang)}
              options={sortOptions}
              selected={sortBy}
              onChange={setSortBy}
            />
          </div>
        </section>

        {/* Desktop Table */}
        <div className="hidden w-full overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm lg:block">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-gray-100 bg-[#faf7ee] text-xs font-medium uppercase tracking-wide text-gray-400">
                <th className="w-16 px-6 py-4 text-center">{t("colNo", lang)}</th>
                <th className="w-24 px-4 py-4">{t("colImage", lang)}</th>
                <th className="px-6 py-4">
                  <button
                    type="button"
                    onClick={() => toggleColSort("cropName")}
                    className="inline-flex items-center gap-1 hover:text-gray-700 transition-colors"
                  >
                    {t("colCropName", lang)}
                    {colSort.key === "cropName" ? (
                      colSort.dir === "asc" ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />
                    ) : (
                      <ChevronsUpDown className="h-3.5 w-3.5 opacity-40" />
                    )}
                  </button>
                </th>
                <th className="px-6 py-4">{t("colFarmer", lang)}</th>
                <th className="px-6 py-4">
                  <button
                    type="button"
                    onClick={() => toggleColSort("totalAmount")}
                    className="inline-flex items-center gap-1 hover:text-gray-700 transition-colors"
                  >
                    {t("colTotal", lang)}
                    {colSort.key === "totalAmount" ? (
                      colSort.dir === "asc" ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />
                    ) : (
                      <ChevronsUpDown className="h-3.5 w-3.5 opacity-40" />
                    )}
                  </button>
                </th>
                <th className="px-6 py-4">{t("colDeposit", lang)}</th>
                <th className="px-6 py-4">
                  <span className="inline-flex items-center gap-1">
                    {t("colQty", lang)}
                  </span>
                </th>
                <th className="px-6 py-4">{t("colEscrow", lang)}</th>
                <th className="px-6 py-4">{t("colPayment", lang)}</th>
                <th className="px-6 py-4">
                  <button
                    type="button"
                    onClick={() => toggleColSort("createdAt")}
                    className="inline-flex items-center gap-1 hover:text-gray-700 transition-colors"
                  >
                    {t("colCreated", lang)}
                    {colSort.key === "createdAt" ? (
                      colSort.dir === "asc" ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />
                    ) : (
                      <ChevronsUpDown className="h-3.5 w-3.5 opacity-40" />
                    )}
                  </button>
                </th>
                <th className="w-36 px-6 py-4 text-center">{t("colAction", lang)}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
              {paginatedOrders.length > 0 ? (
                paginatedOrders.map((order, index) => (
                  <tr
                    key={order.orderId}
                    onClick={() => router.push(`/order-history/${order.orderId}`)}
                    className="cursor-pointer transition-colors duration-200 hover:bg-primary/5"
                  >
                    <td className="px-6 py-4 text-center font-medium text-gray-400">
                      {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                    </td>
                    <td className="px-4 py-4">
                      <div className="relative h-11 w-11 overflow-hidden rounded-lg bg-gray-100">
                        <CropThumb
                          src={order.imageUrls?.[0]}
                          alt={order.cropName ?? t("colCropName", lang)}
                          sizes="44px"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-800">
                        {getOrderCropName(order)}
                      </div>
                      <div className="mt-0.5 text-xs font-semibold uppercase tracking-wide text-[#8a9a5b]">
                        {getOrderCropType(order)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {order.farmerName ?? t("farmerFallback", lang)}
                    </td>
                    <td className="px-6 py-4 font-bold text-primary">
                      {formatCurrency(
                        order.totalAmount,
                        getOrderCurrencyCode(order),
                      )}
                    </td>
                    <td className="px-6 py-4 font-bold text-primary">
                      {formatCurrency(
                        order.depositAmount,
                        getOrderCurrencyCode(order),
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {formatUnitType(
                        order.quantity,
                        order.unitType as UnitType,
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge
                        label={statusLabel(resolveEscrowStatus(order))}
                        className={escrowStatusClasses(
                          resolveEscrowStatus(order),
                        )}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge
                        label={statusLabel(resolvePaymentStatus(order))}
                        className={paymentStatusClasses(
                          resolvePaymentStatus(order),
                        )}
                      />
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Link
                        href={`/order-history/${order.orderId}`}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-block rounded-md bg-primary px-4 py-2 text-xs font-medium text-white transition-all duration-200 hover:brightness-90 active:scale-95"
                      >
                        {t("viewDetail", lang)}
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={10}
                    className="py-16 text-center font-medium text-gray-400"
                  >
                    {t("noOrders", lang)}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:hidden">
          {paginatedOrders.length > 0 ? (
            paginatedOrders.map((order, index) => (
              <div
                key={order.orderId}
                className="relative flex w-full gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
              >
                <span className="absolute right-3 top-3 rounded-md bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-400">
                  #{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                </span>
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                  <CropThumb
                    src={order.imageUrls?.[0]}
                    alt={order.cropName ?? t("colCropName", lang)}
                    sizes="80px"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <StatusBadge
                    size="sm"
                    label={statusLabel(resolvePaymentStatus(order))}
                    className={`mb-1 ${paymentStatusClasses(
                      resolvePaymentStatus(order),
                    )}`}
                  />
                  <h3 className="truncate font-semibold text-gray-800">
                    {getOrderCropName(order)}
                  </h3>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#8a9a5b]">
                    {getOrderCropType(order)}
                  </p>
                  <div className="mt-3 grid grid-cols-2 gap-2 border-t border-gray-100 pt-2 text-xs">
                    <div>
                      <span className="block text-gray-400">{t("totalLabel", lang)}</span>
                      <span className="text-sm font-bold text-primary">
                        {formatCurrency(
                          order.totalAmount,
                          getOrderCurrencyCode(order),
                        )}
                      </span>
                    </div>
                    <div>
                      <span className="block text-gray-400">{t("qtyLabel", lang)}</span>
                      <span className="font-medium text-gray-700">
                        {formatUnitType(
                          order.quantity,
                          order.unitType as UnitType,
                        )}
                      </span>
                    </div>
                    <div>
                      <span className="block text-gray-400">{t("farmerLabel", lang)}</span>
                      <span className="font-medium text-gray-700">
                        {order.farmerName ?? t("farmerFallback", lang)}
                      </span>
                    </div>
                    <div>
                      <span className="mb-1 block text-gray-400">{t("escrowLabel", lang)}</span>
                      <StatusBadge
                        size="sm"
                        label={statusLabel(resolveEscrowStatus(order))}
                        className={escrowStatusClasses(
                          resolveEscrowStatus(order),
                        )}
                      />
                    </div>
                    <div>
                      <span className="mb-1 block text-gray-400">{t("paymentLabel", lang)}</span>
                      <StatusBadge
                        size="sm"
                        label={statusLabel(resolvePaymentStatus(order))}
                        className={paymentStatusClasses(
                          resolvePaymentStatus(order),
                        )}
                      />
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-2">
                    <span className="text-[11px] text-gray-400">
                      {formatDate(order.createdAt)}
                    </span>
                    <Link
                      href={`/order-history/${order.orderId}`}
                      className="inline-block rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-white transition-all hover:brightness-90 active:scale-95"
                    >
                      {t("viewDetail", lang)}
                    </Link>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-16 text-center font-medium text-gray-400">
              {t("noOrders", lang)}
            </div>
          )}
        </div>

        {/* Pagination */}
        {filteredOrders.length > 0 && (
          <PaginationComponent
            currentPage={currentPage}
            totalItems={filteredOrders.length}
            pageSize={ITEMS_PER_PAGE}
            onPageChange={setCurrentPage}
            pageBase={1}
            size="sm"
            className="mt-6"
          />
        )}
      </div>
    </div>
  );
}

/* ==========================================================================
   Crop Thumbnail
   ========================================================================== */
function CropThumb({
  src,
  alt,
  sizes,
}: {
  src?: string | null;
  alt: string;
  sizes: string;
}) {
  const [imgSrc, setImgSrc] = useState(
    resolveImageUrl(src, CROP_FALLBACK_IMAGE),
  );

  return (
    <Image
      src={imgSrc}
      alt={alt}
      fill
      sizes={sizes}
      className="object-cover"
      onError={() => {
        if (imgSrc !== CROP_FALLBACK_IMAGE) setImgSrc(CROP_FALLBACK_IMAGE);
      }}
    />
  );
}