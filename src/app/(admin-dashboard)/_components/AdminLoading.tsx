export function AdminChartSkeleton({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div
      className={`animate-pulse rounded-2xl border border-slate-100 bg-white p-6 shadow-sm ${className}`}
    >
      <div className="mb-6 h-5 w-40 rounded bg-slate-100" />
      <div className="mb-4 h-8 w-56 rounded bg-slate-100" />
      <div className="h-[220px] rounded-xl bg-slate-100" />
    </div>
  );
}

export default function AdminLoading() {
  return (
    <main className="min-h-screen bg-white px-6 py-6">
      <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-32 animate-pulse rounded-2xl border border-slate-100 bg-slate-50"
          />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[340px_1fr]">
        <div className="space-y-5">
          <div className="h-44 animate-pulse rounded-2xl bg-slate-100" />
          <div className="h-28 animate-pulse rounded-2xl bg-slate-100" />
        </div>
        <AdminChartSkeleton className="h-[405px]" />
      </div>
    </main>
  );
}
