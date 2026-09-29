// Loading skeleton for the Order Detail page. Mirrors the layout of
// OrderDetailComponent (breadcrumb, top bar, crop card + financial summary on
// the left, contact + actions on the right).

import Image from "next/image";

function Bar({ className }: { className: string }) {
  return <div className={`rounded bg-gray-200 ${className}`} />;
}

export default function OrderDetailSkeleton() {
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

      <main className="relative min-h-screen overflow-hidden">
        <div className="relative z-10 px-4 sm:px-6 md:px-12 lg:px-28">
          <div className="min-h-screen px-4 py-6 md:px-12 md:py-10">
            <div className="mx-auto max-w-[1280px] animate-pulse">
              {/* Breadcrumb */}
              <div className="mb-8 flex items-center gap-2">
                <Bar className="h-3 w-12" />
                <Bar className="h-3 w-24" />
                <Bar className="h-3 w-20" />
              </div>

              <div className="rounded-2xl bg-white p-4 shadow-sm md:p-6">
                {/* Top control bar */}
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gray-200" />
                    <Bar className="h-6 w-40" />
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Bar className="h-10 w-28 rounded-lg" />
                    <Bar className="h-10 w-32 rounded-lg" />
                  </div>
                </div>

                {/* Content grid */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                  {/* LEFT */}
                  <div className="flex flex-col gap-6 lg:col-span-8">
                    {/* Crop card */}
                    <div className="flex flex-col gap-5 rounded-2xl border border-gray-200 p-5 sm:flex-row">
                      <div className="h-44 w-full shrink-0 rounded-xl bg-gray-200 sm:w-52" />
                      <div className="flex flex-1 flex-col justify-between py-1">
                        <div className="space-y-3">
                          <Bar className="h-7 w-48" />
                          <Bar className="h-4 w-full max-w-[480px]" />
                          <Bar className="h-4 w-3/4" />
                        </div>
                        <div className="mt-4 grid grid-cols-2 gap-4 border-t border-gray-100 pt-4">
                          {Array.from({ length: 2 }).map((_, i) => (
                            <div key={i} className="space-y-2">
                              <Bar className="h-3 w-20" />
                              <Bar className="h-6 w-24" />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Financial summary */}
                    <div className="space-y-4 rounded-2xl border border-gray-200 p-6">
                      <Bar className="h-5 w-40" />
                      {Array.from({ length: 2 }).map((_, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <Bar className="h-4 w-24" />
                          <Bar className="h-4 w-20" />
                        </div>
                      ))}
                      <Bar className="h-16 w-full rounded-xl" />
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between border-b border-gray-100 py-2 last:border-0"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-gray-200" />
                            <Bar className="h-4 w-28" />
                          </div>
                          <Bar className="h-4 w-20" />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* RIGHT */}
                  <div className="flex flex-col gap-6 lg:col-span-4">
                    {/* Contact information */}
                    <div className="space-y-5 rounded-2xl border border-gray-200 p-5">
                      <Bar className="h-4 w-32" />
                      {Array.from({ length: 2 }).map((_, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-3 border-b border-gray-100 pb-5 last:border-0 last:pb-0"
                        >
                          <div className="h-11 w-11 shrink-0 rounded-full bg-gray-200" />
                          <div className="flex-1 space-y-2">
                            <Bar className="h-4 w-28" />
                            <Bar className="h-3 w-32" />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="space-y-4 rounded-2xl border border-gray-200 p-5">
                      <Bar className="h-4 w-20" />
                      <Bar className="h-3 w-40" />
                      <Bar className="h-12 w-full rounded-xl" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
