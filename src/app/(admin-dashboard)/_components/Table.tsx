import React from "react";

export type TableRowData = Record<string, unknown>;

export interface TableColumn<T extends object = TableRowData> {
  header: string;
  dataKey?: keyof T;
  render?: (row: T, index: number) => React.ReactNode;
  headerClassName?: string;
  cellClassName?: string;
}

interface TableProps<T extends object = TableRowData> {
  data?: T[];
  columns: TableColumn<T>[];
  rowKeyField?: keyof T;
  wrapperClassName?: string;
  tableClassName?: string;
}

function joinClasses(...classes: Array<string | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const Table = <T extends object = TableRowData>({
  data = [],
  columns,
  rowKeyField,
  wrapperClassName = "overflow-x-auto",
  tableClassName = "w-full text-left border-collapse",
}: TableProps<T>) => {
  return (
    <div className={wrapperClassName}>
      <table className={tableClassName}>
        <thead>
          <tr className="border-b border-slate-200 sub-title font-bold text-description-text tracking-wider uppercase bg-slate-50/40">
            {columns.map((col, idx) => (
              <th key={idx} className={joinClasses("px-6 py-3", col.headerClassName)}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => {
            const keyField = rowKeyField ?? ("id" as keyof T);
            const fallbackKey = row[keyField] ?? idx;
            const uniqueKey = `${String(fallbackKey)}-${idx}`;

            return (
              <tr 
                key={uniqueKey}
                className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors"
              >
                {columns.map((col, colIdx) => (
                  <td
                    key={colIdx}
                    className={joinClasses("px-6 py-4 sub-title", col.cellClassName)}
                  >
                    {col.render 
                      ? col.render(row, idx) 
                      : col.dataKey 
                        ? String(row[col.dataKey] ?? "") 
                        : null}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
