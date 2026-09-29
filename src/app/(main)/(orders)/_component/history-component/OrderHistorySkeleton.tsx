// Loading skeleton for the Order History list page. Mirrors the layout of
// OrderHistoryTableComponent (breadcrumb, header, filters, desktop table) so the
// page doesn't jump when the real data resolves.

import Image from "next/image";

function Bar({ className }: { className: string }) {
  return <div className={`rounded bg-gray-200 ${className}`} />;
}

export default function OrderHistorySkeleton() {
  return (
    <div>
      {/* Hero banner — render the real navbar background (matches page.tsx) so
          it doesn't flash a loading skeleton while fresh data is fetched. */}
      <div className="mt-9 min-w-full px-6">
        <div className="relative z-0 -mt-30 h-20 w-full overflow-hidden rounded-[28px]">
          <Image
            src="/assets/nav-bar/navbar_bg_image.png"
            alt="Hero Background"
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
        </div>
      </div>

      <main className="relative min-h-screen overflow-hidden bg-[#fbf6e9]">
        <div className="relative z-10 px-4 sm:px-6 md:px-12 lg:px-28">
          <div className="min-h-screen px-4 py-8 md:px-12 md:py-10">
            <div className="mx-auto max-w-[1280px] animate-pulse">
              {/* Breadcrumb */}
              <div className="mb-6 flex items-center gap-2">
                <Bar className="h-3 w-12" />
                <Bar className="h-3 w-24" />
              </div>

              {/* Header */}
              <div className="mb-8 space-y-3">
                <Bar className="h-9 w-64" />
                <Bar className="h-4 w-80 max-w-full" />
              </div>

              {/* Filters */}
              <div className="mb-6 flex flex-col gap-4 lg:grid lg:grid-cols-12 lg:items-end lg:gap-5">
                <div className="space-y-2 lg:col-span-4">
                  <Bar className="h-3 w-16" />
                  <Bar className="h-12 w-full rounded-xl" />
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:col-span-8">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="space-y-2">
                      <Bar className="h-3 w-16" />
                      <Bar className="h-12 w-full rounded-xl" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Desktop table */}
              <div className="hidden w-full overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm lg:block">
                {/* Head row */}
                <div className="flex items-center gap-4 border-b border-gray-100 bg-[#faf7ee] px-6 py-4">
                  {["w-8", "w-12", "flex-1", "w-16", "w-12", "w-20", "w-16", "w-20"].map(
                    (w, i) => (
                      <Bar key={i} className={`h-3 ${w}`} />
                    ),
                  )}
                </div>

                {/* Body rows */}
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 border-b border-gray-100 px-6 py-4 last:border-0"
                  >
                    <Bar className="h-3 w-8" />
                    <div className="h-11 w-11 shrink-0 rounded-lg bg-gray-200" />
                    <div className="flex-1 space-y-2">
                      <Bar className="h-3.5 w-32" />
                      <Bar className="h-2.5 w-20" />
                    </div>
                    <Bar className="h-3.5 w-16" />
                    <Bar className="h-3.5 w-12" />
                    <Bar className="h-3.5 w-20" />
                    <Bar className="h-5 w-24 rounded-full" />
                    <Bar className="h-8 w-24 rounded-md" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
