import Image from "next/image";

function SkeletonBlock({ className }: { className: string }) {
  return <div className={`animate-pulse bg-white/70 ${className}`} />;
}

export default function CropDemandDetailLoading() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#fbf6e9] pb-20 pt-6 font-thicccboi">
      <div className="pointer-events-none absolute right-0 top-[10%] z-0 h-[clamp(240px,32vw,480px)] w-[clamp(240px,32vw,480px)] translate-x-1/2 rounded-full bg-amber-300 opacity-15 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[4%] left-0 z-0 h-[clamp(240px,32vw,480px)] w-[clamp(240px,32vw,480px)] -translate-x-1/2 rounded-full bg-yellow-300 opacity-15 blur-3xl" />
      <Image
        src="/assets/srov.png"
        width={260}
        height={260}
        alt="srov"
        className="pointer-events-none absolute right-0 top-[15%] z-0 h-auto max-h-[50%] w-[clamp(240px,9vw,200px)] object-contain opacity-50"
      />
      <Image
        src="/assets/srov2.png"
        width={260}
        height={260}
        alt="srov2"
        className="pointer-events-none absolute bottom-0 left-0 z-0 h-auto max-h-[50%] w-[clamp(240px,11vw,200px)] object-contain opacity-50"
      />

      <div className="relative z-10 mx-auto max-w-6xl px-4 py-6">
        <div className="mb-8 flex gap-2">
          <SkeletonBlock className="h-4 w-16 rounded" />
          <SkeletonBlock className="h-4 w-28 rounded" />
          <SkeletonBlock className="h-4 w-52 rounded" />
        </div>

        <div className="mb-4 flex gap-2">
          <SkeletonBlock className="h-7 w-16 rounded-full" />
          <SkeletonBlock className="h-7 w-28 rounded-full" />
        </div>

        <SkeletonBlock className="h-9 max-w-4xl rounded-lg" />
        <SkeletonBlock className="mt-3 h-5 w-80 rounded" />

        <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-5">
            <SkeletonBlock className="aspect-[16/8.2] min-h-60 rounded-lg" />
            <div className="grid h-22 grid-cols-4 gap-3 sm:h-28">
              {Array.from({ length: 4 }).map((_, index) => (
                <SkeletonBlock key={index} className="rounded-md" />
              ))}
            </div>
            <div className="rounded-lg bg-white p-5 shadow-sm">
              <SkeletonBlock className="h-5 w-56 rounded" />
              <SkeletonBlock className="mt-5 h-4 w-full rounded" />
              <SkeletonBlock className="mt-3 h-4 w-4/5 rounded" />
              <SkeletonBlock className="mt-3 h-4 w-2/3 rounded" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <SkeletonBlock className="h-12 rounded-xl" />
              <SkeletonBlock className="h-12 rounded-xl" />
            </div>
          </div>

          <aside className="rounded-2xl bg-white p-5 shadow-sm">
            <SkeletonBlock className="h-5 w-36 rounded" />
            <div className="mt-4 divide-y divide-light-grey">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="py-4">
                  <SkeletonBlock className="h-3 w-28 rounded" />
                  <SkeletonBlock className="mt-3 h-5 w-44 rounded" />
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
