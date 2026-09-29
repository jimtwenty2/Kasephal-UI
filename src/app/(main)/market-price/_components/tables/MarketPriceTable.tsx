"use client";

import {
  ColumnDef,
  SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { MarketPriceRow } from "@/types/market-price-row";
import { useMarketPriceText } from "../marketPriceText";

interface MarketPriceTableProps {
  data?: MarketPriceRow[];
  onDataChange: (newData: MarketPriceRow[]) => void;
  onEditRow?: (row: MarketPriceRow) => void;
  onDeleteRow?: (row: MarketPriceRow) => void;
  isGovernment?: boolean;
  pageOffset?: number;
}

type EditableKey =
  | "cropName"
  | "cropType"
  | "region"
  | "unit"
  | "currentPrice"
  | "minPrice";

function formatNumber(value: number | string) {
  const numberValue = Number(value || 0);

  if (Number.isNaN(numberValue)) return value;

  return numberValue.toLocaleString("en-US");
}

const SORT_ICON_WIDTH = 18;
const SORT_ICON_HEIGHT = 20;

function SortIcon({ isSorted }: { isSorted: false | "asc" | "desc" }) {
  return (
    <span className=" inline-flex shrink-0 translate-y-[1px] text-[#9AA3AA] mb-1">
      {isSorted === "asc" ? (
        <svg
          width={SORT_ICON_WIDTH}
          height={SORT_ICON_HEIGHT}
          viewBox="0 0 8 14"
          fill="none"
        >
          <path
            d="M1.5 8L4 5.5L6.5 8"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : isSorted === "desc" ? (
        <svg
          width={SORT_ICON_WIDTH}
          height={SORT_ICON_HEIGHT}
          viewBox="0 0 8 14"
          fill="none"
        >
          <path
            d="M1.5 6L4 8.5L6.5 6"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        <svg
          width={SORT_ICON_WIDTH}
          height={SORT_ICON_HEIGHT}
          viewBox="0 0 8 14"
          fill="none"
        >
          <path
            d="M1.7 5.8L4 3.5L6.3 5.8"
            stroke="currentColor"
            strokeWidth="1.35"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M1.7 8.2L4 10.5L6.3 8.2"
            stroke="currentColor"
            strokeWidth="1.35"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </span>
  );
}

export default function MarketPriceTable({
  data = [],
  onDataChange,
  onEditRow,
  onDeleteRow,
  isGovernment = false,
  pageOffset = 0,
}: MarketPriceTableProps) {
  const { t, fontClass } = useMarketPriceText();
  const safeData = Array.isArray(data) ? data : [];
  const [sorting, setSorting] = useState<SortingState>([]);
  const columns = useMemo<ColumnDef<MarketPriceRow>[]>(
    () => [
      {
        id: "rowNumber",
        header: t("market.table.no"),
        size: 60,
        enableSorting: false,
        cell: ({ row }) => (
          <span className="block w-full text-left text-[16px] font-medium text-description-text">
            {row.index + 1}
          </span>
        ),
      },
      {
        accessorKey: "cropName",
        header: t("market.table.cropName"),
        size: 155,
        sortingFn: (rowA, rowB) => {
          const a = rowA.original.cropName.toLowerCase();
          const b = rowB.original.cropName.toLowerCase();

          return a.localeCompare(b);
        },
        sortDescFirst: false,
        cell: ({ row }) => (
          <span className="block w-full truncate text-left font-medium text-dark-grey">
            {row.original.cropName}
          </span>
        ),
      },
      {
        accessorKey: "cropType",
        header: t("market.table.cropType"),
        enableSorting: false,
        size: 145,
        cell: ({ row }) => (
          <EditableCell
            row={row.original}
            field="cropType"
            value={row.original.cropType}
            data={safeData}
            onDataChange={onDataChange}
            isGovernment={isGovernment}
          />
        ),
      },
      {
        accessorKey: "region",
        header: t("market.table.region"),
        enableSorting: false,
        size: 150,
        cell: ({ row }) => (
          <EditableCell
            row={row.original}
            field="region"
            value={row.original.region}
            data={safeData}
            onDataChange={onDataChange}
            isGovernment={isGovernment}
          />
        ),
      },
      {
        accessorKey: "unit",
        header: t("market.table.unit"),
        size: 80,
        cell: ({ row }) => (
          <div className="px-2">
            <EditableCell
              row={row.original}
              field="unit"
              value={row.original.unit}
              data={safeData}
              onDataChange={onDataChange}
              isGovernment={isGovernment}
            />
          </div>
        ),
      },
      {
        accessorKey: "currentPrice",
        header: t("market.table.currentPrice"),
        size: 180,
        sortingFn: (rowA, rowB) => {
          const a = Number(rowA.original.currentPrice) || 0;
          const b = Number(rowB.original.currentPrice) || 0;

          return a - b;
        },
        sortDescFirst: true,
        cell: ({ row }) => (
          <span className="block w-full truncate font-bold pr-5 px-1">
            {formatNumber(row.original.currentPrice)}
          </span>
        ),
      },
      {
        accessorKey: "minPrice",
        header: t("market.table.minPrice"),
        size: 150,
        sortingFn: (rowA, rowB) => {
          const a = Number(rowA.original.minPrice) || 0;
          const b = Number(rowB.original.minPrice) || 0;

          return a - b;
        },
        sortDescFirst: true,
        cell: ({ row }) => (
          <span className="block w-full truncate px-1">
            {formatNumber(row.original.minPrice)}
          </span>
        ),
      },
      {
        accessorKey: "validityDate",
        header: t("market.table.validityDate"),
        size: 150,
        sortingFn: (rowA, rowB) => {
          return (
            new Date(rowA.original.validityDate).getTime() -
            new Date(rowB.original.validityDate).getTime()
          );
        },
        sortDescFirst: false,
        cell: ({ row }) => (
          <span className="block w-full text-left px-2">
            {new Date(row.original.validityDate).toLocaleDateString("en-GB")}
          </span>
        ),
      },
      ...(isGovernment
        ? [
            {
              id: "actions",
              header: t("market.table.actions"),
              size: 80,
              enableSorting: false,
              cell: ({ row }) => (
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => onEditRow?.(row.original)}
                    className="transition opacity-90 hover:opacity-100"
                    title={t("market.action.edit")}
                  >
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M11 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22H15C20 22 22 20 22 15V13"
                        stroke="#292D32"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M16.0399 3.01976L8.15988 10.8998C7.85988 11.1998 7.55988 11.7898 7.49988 12.2198L7.06988 15.2298C6.90988 16.3198 7.67988 17.0798 8.76988 16.9298L11.7799 16.4998C12.1999 16.4398 12.7899 16.1398 13.0999 15.8398L20.9799 7.95976C22.3399 6.59976 22.9799 5.01976 20.9799 3.01976C18.9799 1.01976 17.3999 1.65976 16.0399 3.01976Z"
                        stroke="#292D32"
                        strokeWidth="1.5"
                        strokeMiterlimit="10"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M14.9102 4.1499C15.5802 6.5399 17.4502 8.4099 19.8502 9.0899"
                        stroke="#292D32"
                        strokeWidth="1.5"
                        strokeMiterlimit="10"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>

                  <button
                    type="button"
                    onClick={() => onDeleteRow?.(row.original)}
                    className="transition opacity-90 hover:opacity-100"
                    title={t("market.action.delete")}
                  >
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M21 5.97998C17.67 5.64998 14.32 5.47998 10.98 5.47998C9 5.47998 7.02 5.57998 5.04 5.77998L3 5.97998"
                        stroke="#E24B4A"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M8.5 4.97L8.72 3.66C8.88 2.71 9 2 10.69 2H13.31C15 2 15.13 2.75 15.28 3.67L15.5 4.97"
                        stroke="#E24B4A"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M18.8504 9.14014L18.2004 19.2101C18.0904 20.7801 18.0004 22.0001 15.2104 22.0001H8.79039C6.00039 22.0001 5.91039 20.7801 5.80039 19.2101L5.15039 9.14014"
                        stroke="#E24B4A"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M10.3301 16.5H13.6601"
                        stroke="#E24B4A"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M9.5 12.5H14.5"
                        stroke="#E24B4A"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>
              ),
            } satisfies ColumnDef<MarketPriceRow>,
          ]
        : []),
    ],
    [isGovernment, onEditRow, onDeleteRow, t],
  );

  const table = useReactTable({
    data: safeData,
    columns,
    state: {
      sorting,
    },
    columnResizeMode: "onChange",
    enableSortingRemoval: false,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div
      className={`w-full overflow-hidden rounded-xl bg-[#FCFCFA] ${fontClass}`}
    >
      <div className="w-full overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                className="h-[54px] border-b border-[#DDE3E8] bg-[#FCFCFA]"
              >
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const isSorted = header.column.getIsSorted();

                  return (
                    <th
                      key={header.id}
                      style={{
                        width: header.getSize(),
                        minWidth: header.getSize(),
                        maxWidth: header.getSize(),
                      }}
                      className={`px-3 text-left align-middle
    ${header.index === 0 ? "rounded-tl-xl" : ""}
    ${header.index === headerGroup.headers.length - 1 ? "rounded-tr-xl" : ""}
  `}
                    >
                      <button
                        type="button"
                        disabled={!canSort}
                        onClick={header.column.getToggleSortingHandler()}
                        className="flex w-full items-center justify-start text-left text-[14px] font-bold uppercase tracking-[0.03em] text-[#889299]"
                      >
                        <span className="truncate">
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                        </span>

                        {canSort && <SortIcon isSorted={isSorted} />}
                      </button>
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>

          <tbody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row, rowIndex) => (
                <tr
                  key={row.id}
                  className="h-[70px] border-b border-[#DDE3E8] bg-[#FCFCFA] transition hover:bg-[#F3F6F8]"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      style={{
                        width: cell.column.getSize(),
                        minWidth: cell.column.getSize(),
                        maxWidth: cell.column.getSize(),
                      }}
                      className="px-3 text-left align-middle text-[16px] font-medium text-dark-grey pl-2"
                    >
                      {cell.column.id === "rowNumber"
                        ? pageOffset + rowIndex + 1
                        : flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="h-[220px] text-center text-[15px] font-medium text-[#889299]"
                >
                  {t("market.empty.marketPrices")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface EditableCellProps {
  row: MarketPriceRow;
  field: EditableKey;
  value: string | number;
  data: MarketPriceRow[];
  onDataChange: (newData: MarketPriceRow[]) => void;
  isGovernment: boolean;
  className?: string;
}

function EditableCell({
  row,
  field,
  value,
  data,
  onDataChange,
  isGovernment,
  className = "",
}: EditableCellProps) {
  const updateCell = (newValue: string) => {
    const nextData = data.map((item) => {
      if (item.marketPriceId !== row.marketPriceId) return item;

      return {
        ...item,
        [field]:
          field === "currentPrice" || field === "minPrice"
            ? Number(newValue.replaceAll(",", "")) || 0
            : newValue,
      };
    });

    onDataChange(nextData);
  };

  if (!isGovernment) {
    return (
      <span
        className={`block w-full truncate text-left ${className}`}
        title={String(value)}
      >
        {value}
      </span>
    );
  }

  return (
    <input
      defaultValue={value}
      onBlur={(event) => updateCell(event.target.value)}
      className={`block h-10 w-full rounded-lg border border-transparent bg-transparent px-2 text-left outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/10 ${className}`}
    />
  );
}
