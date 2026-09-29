import { Fragment } from "react";
import { CheckIcon, LockClosedIcon } from "@heroicons/react/24/solid";
import type { AdminPaymentRequestStatus } from "@/types/admin/requestPayment";

type StepStatus = "done" | "current" | "pending" | "locked";

const STEPS = [
  { key: "submitted",  label: "Submitted" },
  { key: "pending",    label: "Pending" },
  { key: "approve",    label: "Approve" },
  { key: "close",      label: "Close" },
] as const;

function statusToStepIndex(status: AdminPaymentRequestStatus): number {
  switch (status) {
    case "PENDING":       return 1;
    case "WAITING_PROOF": return 1;
    // Approved (QR issued, not yet paid) still sits at the Pending step.
    case "APPROVED":      return 1;
    case "SUCCESS":       return 3;
    case "FAILED":        return 3;
    default:              return 0;
  }
}

function getStepStatuses(currentIndex: number): StepStatus[] {
  return STEPS.map((_, i) => {
    if (i < currentIndex)  return "done";
    if (i === currentIndex) return "current";
    if (i === STEPS.length - 1) return "locked";
    return "pending";
  });
}

function StepCircle({ status, index }: { status: StepStatus; index: number }) {
  if (status === "done")
    return (
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-700 text-white">
        <CheckIcon className="h-4 w-4" />
      </div>
    );

  if (status === "current")
    return (
      <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-emerald-700 bg-white">
        <div className="h-2 w-2 rounded-full bg-emerald-700" />
      </div>
    );

  if (status === "locked")
    return (
      <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-stone-200 bg-white text-stone-400">
        <LockClosedIcon className="h-3.5 w-3.5" />
      </div>
    );

  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-stone-200 bg-white text-[10px] font-semibold text-stone-400">
      {String(index + 1).padStart(2, "0")}
    </div>
  );
}

export default function RequestWorkflow({ status }: { status: AdminPaymentRequestStatus }) {
  const currentIndex = statusToStepIndex(status);
  const stepStatuses = getStepStatuses(currentIndex);

  return (
    <div className="rounded-2xl border border-stone-200 bg-white px-6 py-5 shadow-sm">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">
        Report Workflow
      </p>
      <div className="mt-4 flex items-start">
        {STEPS.map((step, i) => {
          const s = stepStatuses[i];
          const nextDone =
            i < STEPS.length - 1 &&
            (stepStatuses[i + 1] === "done" || stepStatuses[i + 1] === "current");

          return (
            <Fragment key={step.key}>
              <div className="flex flex-shrink-0 flex-col items-center">
                <StepCircle status={s} index={i} />
                <span
                  className={`mt-2 text-xs ${
                    s === "current"
                      ? "font-semibold text-stone-900"
                      : s === "done"
                        ? "text-stone-600"
                        : "text-stone-400"
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`mx-2 mt-4 h-0.5 flex-1 rounded-full transition-colors ${
                    nextDone ? "bg-emerald-700" : "bg-stone-200"
                  }`}
                />
              )}
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}
