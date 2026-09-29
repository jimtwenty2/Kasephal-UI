export default function RequestReasonCard({ reason }: { reason?: string | null }) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white px-6 py-5 shadow-sm">
      <h3 className="text-base font-bold text-stone-900">Request Reason</h3>
      <div className="mt-3 rounded-xl border border-stone-100 bg-stone-50 px-4 py-3 text-sm leading-relaxed text-stone-600">
        {reason || "No reason provided."}
      </div>
    </div>
  );
}
