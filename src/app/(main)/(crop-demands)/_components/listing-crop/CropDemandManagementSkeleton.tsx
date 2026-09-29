import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, PlusCircle, RotateCcw } from "lucide-react";

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

export function CropDemandManagementTableSkeleton() {
  return (
    <div className="hidden w-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm lg:block">
      <div className="grid min-w-275 grid-cols-[56px_88px_1.3fr_1fr_1fr_80px_1fr_1fr_1fr_1fr_160px] border-b border-gray-100 bg-gray-50/80 px-4 py-4">
        {Array.from({ length: 11 }, (_, index) => (
          <ShimmerBlock key={index} className="mx-2 h-3 rounded-full" />
        ))}
      </div>

      <div className="divide-y divide-gray-100">
        {Array.from({ length: 8 }, (_, rowIndex) => (
          <div
            key={rowIndex}
            className="grid min-w-275 grid-cols-[56px_88px_1.3fr_1fr_1fr_80px_1fr_1fr_1fr_1fr_160px] items-center px-4 py-4"
          >
            <ShimmerBlock className="mx-auto h-3 w-5 rounded-full" />
            <ShimmerBlock className="mx-2 h-12 w-12 rounded-xl bg-linear-to-br from-emerald-50 to-amber-50" />
            <ShimmerBlock className="mx-2 h-4 w-32 rounded-full" />
            <ShimmerBlock className="mx-2 h-4 w-20 rounded-full bg-emerald-50" />
            <ShimmerBlock className="mx-2 h-4 w-24 rounded-full" />
            <ShimmerBlock className="mx-2 h-4 w-12 rounded-full" />
            <ShimmerBlock className="mx-2 h-4 w-20 rounded-full bg-emerald-50" />
            <ShimmerBlock className="mx-2 h-4 w-20 rounded-full" />
            <ShimmerBlock className="mx-2 h-7 w-20 rounded-full bg-amber-50" />
            <ShimmerBlock className="mx-2 h-7 w-20 rounded-full bg-emerald-50" />
            <div className="mx-2 flex justify-center gap-2">
              <ShimmerBlock className="h-9 w-9 rounded-xl" />
              <ShimmerBlock className="h-9 w-9 rounded-xl bg-amber-50" />
              <ShimmerBlock className="h-9 w-9 rounded-xl bg-rose-50" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CropDemandManagementMobileSkeleton() {
  return (
    <div className="grid w-full min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 lg:hidden">
      {Array.from({ length: 6 }, (_, index) => (
        <div
          key={index}
          className="flex gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
        >
          <ShimmerBlock className="h-20 w-20 shrink-0 rounded-xl bg-linear-to-br from-emerald-50 to-amber-50" />
          <div className="min-w-0 flex-1 space-y-3">
            <ShimmerBlock className="h-5 w-24 rounded-full bg-emerald-50" />
            <ShimmerBlock className="h-4 w-32 rounded-full" />
            <ShimmerBlock className="h-3 w-24 rounded-full" />
            <div className="grid grid-cols-2 gap-3 border-t border-gray-50 pt-3">
              <ShimmerBlock className="h-8 rounded-xl" />
              <ShimmerBlock className="h-8 rounded-xl bg-amber-50" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function CropDemandManagementSkeleton() {
  return (
    <div className="min-h-screen bg-[#FBFBFB] pb-16 font-sans">
      <div className="mt-6 min-w-full px-4">
        <div className="relative z-0 h-70 w-full overflow-hidden rounded-[24px] bg-emerald-950 shadow-md">
          <Image
            src="/assets/nav-bar/navbar_bg_image.png"
            alt="Hero Background"
            fill
            className="object-cover brightness-[0.45] contrast-105"
            priority
          />
          <div className="absolute inset-y-0 left-6 right-6 flex flex-col justify-center text-white md:left-12">
            <Link
              href="/"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur-md transition-all hover:bg-white/20"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="mt-4 space-y-3">
              <ShimmerBlock className="h-5 w-64 rounded-full bg-white/15" />
              <ShimmerBlock className="h-10 w-80 max-w-full rounded-full bg-white/15" />
              <ShimmerBlock className="hidden h-4 w-155 max-w-full rounded-full bg-white/10 sm:block" />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-y-5 px-4 pt-6">
        <nav className="flex gap-2">
          <ShimmerBlock className="h-3 w-12 rounded-full" />
          <ShimmerBlock className="h-3 w-24 rounded-full" />
          <ShimmerBlock className="h-3 w-36 rounded-full bg-emerald-50" />
        </nav>

        <header className="flex flex-col gap-4 border-b border-gray-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <ShimmerBlock className="h-6 w-56 rounded-full" />
            <ShimmerBlock className="h-3 w-44 rounded-full" />
          </div>
          <div className="flex h-12 items-center justify-center gap-2 rounded-xl bg-[#F6B941] px-5 text-xs font-extrabold text-gray-900 shadow-sm">
            <PlusCircle className="h-4 w-4" />
            <span>POST NEW DEMAND</span>
          </div>
        </header>

        <section className="grid w-full min-w-0 grid-cols-1 items-end gap-4 lg:grid-cols-[minmax(260px,1.4fr)_1fr_1fr_1fr_auto]">
          <FilterSkeleton />
          <FilterSkeleton />
          <FilterSkeleton />
          <FilterSkeleton />
          <button
            type="button"
            disabled
            className="flex h-12 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-xs font-extrabold text-gray-400 shadow-sm"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </button>
        </section>

        <CropDemandManagementTableSkeleton />
        <CropDemandManagementMobileSkeleton />
      </div>
    </div>
  );
}
