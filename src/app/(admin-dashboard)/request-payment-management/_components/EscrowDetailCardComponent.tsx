import { formatKHR } from "./ShareComponent";

interface EscrowDetailsCardProps {
  escrowBalance: number;
  withdrawable: number;
}

export default function EscrowDetailsCard({
  escrowBalance,
  withdrawable,
}: EscrowDetailsCardProps) {
  const pct = Math.min(
    100,
    Math.round((withdrawable / escrowBalance) * 100),
  );

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-bold text-stone-900">Escrow Details</h3>

      <div className="mt-3 space-y-2.5">
        <div className="flex items-center justify-between">
          <p className="text-xs text-stone-500">Escrow Balance</p>
          <p className="text-sm font-semibold text-stone-800">
            {formatKHR(escrowBalance)}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-xs text-stone-500">Withdrawable</p>
          <p className="text-sm font-bold text-emerald-700">
            {formatKHR(withdrawable)}
          </p>
        </div>

        {/* Progress bar */}
        <div className="h-2 w-full overflow-hidden rounded-full bg-stone-100">
          <div
            className="h-full rounded-full bg-emerald-600 transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}