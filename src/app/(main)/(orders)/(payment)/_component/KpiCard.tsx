export default function KpiCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[22px] bg-white p-6 shadow-sm">
      <p className="title font-semibold text-description-text">{label}</p>
      <h3 className="mt-4 heading font-bold text-[#252525]">{value}</h3>
    </div>
  );
}