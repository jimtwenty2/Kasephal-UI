import { LayoutGrid } from "lucide-react";
import HeroSection from "./HeroSection";

function ShimmerBlock({ className }: { className: string }) {
  return (
    <div className={`relative overflow-hidden bg-gray-100 ${className}`}>
      <div className="absolute inset-y-0 -left-1/2 w-1/2 animate-[shimmer_1.4s_ease-in-out_infinite] bg-linear-to-r from-transparent via-white/80 to-transparent" />
    </div>
  );
}

function FilterSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      <ShimmerBlock className="h-3 w-24 rounded-full bg-emerald-100" />
      <ShimmerBlock className="h-12 rounded-xl border border-gray-200 bg-white shadow-sm" />
    </div>
  );
}

export function CropDemandCardSkeleton() {
  return (
    <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="relative mx-3 mt-3 aspect-video overflow-hidden rounded-xl bg-linear-to-br from-emerald-50 via-gray-100 to-amber-50">
        <div className="absolute inset-y-0 -left-1/2 w-1/2 animate-[shimmer_1.4s_ease-in-out_infinite] bg-linear-to-r from-transparent via-white/80 to-transparent" />
        <ShimmerBlock className="absolute left-3 top-3 h-6 w-24 rounded-full bg-white/80" />
      </div>
      <div className="space-y-4 p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <ShimmerBlock className="h-4 w-32 rounded-full" />
            <ShimmerBlock className="h-3 w-24 rounded-full bg-emerald-50" />
          </div>
          <div className="space-y-2">
            <ShimmerBlock className="h-5 w-14 rounded-full bg-emerald-100" />
            <ShimmerBlock className="h-3 w-10 rounded-full" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 border-y border-gray-50 py-3">
          <ShimmerBlock className="h-10 rounded-xl" />
          <ShimmerBlock className="h-10 rounded-xl bg-amber-50" />
        </div>
        <ShimmerBlock className="h-11 rounded-xl bg-emerald-50" />
      </div>
    </div>
  );
}

export function CropDemandCardGridSkeleton() {
  return (
    <div className="grid grid-cols-1 justify-items-center gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 12 }, (_, index) => (
        <CropDemandCardSkeleton key={index} />
      ))}
    </div>
  );
}

export default function CropDemandMarketplaceSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <HeroSection />

      <main className="w-full px-4 py-10 sm:px-6 lg:px-12">
        <section className="mx-auto w-full max-w-325">
          <div className="mb-10 flex flex-col gap-4 border-b border-gray-100 pb-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <LayoutGrid size={22} className="text-emerald-600" />
                <ShimmerBlock className="h-8 w-72 max-w-full rounded-full" />
              </div>
              <ShimmerBlock className="mt-3 h-4 w-96 max-w-full rounded-full" />
            </div>
            <ShimmerBlock className="h-9 w-32 rounded-xl border border-gray-200 bg-white" />
          </div>

          <div className="mb-10 grid w-full grid-cols-1 gap-4 lg:grid-cols-[minmax(260px,1.4fr)_1fr_1fr_1fr]">
            <FilterSkeleton />
            <FilterSkeleton />
            <FilterSkeleton />
            <FilterSkeleton />
          </div>

          <CropDemandCardGridSkeleton />
        </section>
      </main>
    </div>
  );
}
