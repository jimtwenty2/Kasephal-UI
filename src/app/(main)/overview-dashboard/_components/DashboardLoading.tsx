export default function DashboardLoading() {
  return (
    <div className="animate-pulse">
      {/* Hero skeleton */}
      <div className="mt-6 px-6">
        <div className="relative -mt-[111px] h-75 w-full rounded-[28px] bg-slate-200" />
      </div>

      <div className="px-4 py-6 lg:px-[200px] space-y-6">
        {/* Section title */}
        <div className="space-y-2">
          <div className="h-3 w-20 rounded-full bg-slate-200" />
          <div className="h-6 w-48 rounded-full bg-slate-200" />
        </div>

        {/* Stats cards — match CompleteOrderComponent: 6 cards, sm:2 xl:3 */}
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-slate-200" />
          ))}
        </div>

        {/* Two column layout */}
        <div className="grid gap-4 lg:grid-cols-[1.9fr_0.9fr]">
          <div className="space-y-4">
            <div className="h-48 rounded-2xl bg-slate-200" />
            <div className="h-32 rounded-2xl bg-slate-200" />
          </div>
          <div className="h-80 rounded-2xl bg-slate-200" />
        </div>

        {/* Table + orders */}
        <div className="grid gap-4 lg:grid-cols-[1.9fr_2fr]">
          <div className="h-64 rounded-2xl bg-slate-200" />
          <div className="h-64 rounded-2xl bg-slate-200" />
        </div>
      </div>
    </div>
  );
}
