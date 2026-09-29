import Link from "next/link";

import { OverviewStat } from "./../../../types/adminType";

export default function StatsCard({
  title,
  value,
  topBorderColor,
  progressBar,
  linkAction,
  subMetrics,
}: OverviewStat) {
  return (
    <article
      className={`relative flex min-h-[190px] min-w-0 flex-col justify-between overflow-hidden rounded-xl border border-slate-100 bg-white p-5 shadow-sm ${
        topBorderColor ? `border-t-4 ${topBorderColor}` : ""
      }`}
    >
      <div className="min-w-0">
        <p className="text-base font-bold uppercase leading-snug tracking-wide text-description-text">
          {title}
        </p>

        <h3 className="mt-3 break-words text-4xl font-bold leading-none text-slate-800">
          {typeof value === "number" ? value.toLocaleString() : value}
        </h3>
      </div>

      <div className="mt-4">
        {progressBar && (
          <div className="w-full">
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{
                  width: `${(progressBar.current / progressBar.total) * 100}%`,
                }}
              />
            </div>
            <p className="mt-2 text-sm font-semibold leading-5 text-description-text">
              {progressBar.label}
            </p>
          </div>
        )}

        {linkAction && (
          <Link
            href={linkAction.href}
            role="button"
            className="inline-flex min-h-10 max-w-full items-center justify-center rounded-full bg-[#107446] px-5 py-2 text-center text-base font-bold leading-5 text-white transition-colors hover:bg-[#0d633c] focus:outline-none focus:ring-2 focus:ring-[#107446] focus:ring-offset-2"
          >
            {linkAction.text}
          </Link>
        )}

        {subMetrics && (
          <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-3">
            <div className="min-w-0">
              <p className="text-base font-bold text-description-text">Active</p>
              <p className="mt-0.5 text-xl font-bold text-primary">
                {typeof subMetrics.active === "number"
                  ? subMetrics.active.toLocaleString()
                  : subMetrics.active}
              </p>
            </div>
            <div className="min-w-0 border-l border-slate-200 pl-4">
              <p className="text-base font-bold text-description-text">
                Completed
              </p>
              <p className="mt-0.5 text-xl font-bold text-primary-heading">
                {typeof subMetrics.completed === "number"
                  ? subMetrics.completed.toLocaleString()
                  : subMetrics.completed}
              </p>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
