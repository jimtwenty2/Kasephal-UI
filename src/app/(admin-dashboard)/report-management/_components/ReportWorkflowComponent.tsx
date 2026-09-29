import { Fragment } from "react";
import { CheckIcon, LockClosedIcon, MinusIcon } from "@heroicons/react/24/solid";
import type {
  AdminReportIssueStatus,
  AdminReportResolutionAction,
} from "@/types/admin/report";

type StepStatus = "done" | "current" | "pending" | "locked" | "skipped";

const STEPS = [
  { key: "submitted", label: "Submitted" },
  { key: "review", label: "Review" },
  { key: "proof", label: "Proof" },
  { key: "warning_ban", label: "Warning / Ban" },
  { key: "close", label: "Close" },
] as const;

const WARNING_BAN_INDEX = STEPS.findIndex((s) => s.key === "warning_ban");

function statusToStepIndex(status: AdminReportIssueStatus): number {
  switch (status) {
    case "PENDING":
      return 1; // Review
    case "WAITING_PROOF":
      return 2; // Proof
    case "APPROVED":
    case "REJECTED":
      return 4; // Close (warn/ban already applied for APPROVED, dismissed for REJECTED)
  }
}

function getStepStatuses(
  currentIndex: number,
  isComplete: boolean,
  warnOrBan: boolean,
): StepStatus[] {
  const lastIndex = STEPS.length - 1;
  return STEPS.map((_, i) => {
    if (isComplete) {
      // Report resolved without warning/banning the user: the Warning/Ban
      // step was bypassed, so don't mark it as completed.
      if (i === WARNING_BAN_INDEX && !warnOrBan) return "skipped";
      return "done";
    }
    if (i < currentIndex) return "done";
    if (i === currentIndex) return "current";
    if (i === lastIndex) return "locked";
    return "pending";
  });
}

function StepCircle({ status, index }: { status: StepStatus; index: number }) {
  if (status === "done") {
    return (
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-700 text-white">
        <CheckIcon className="h-4 w-4" />
      </div>
    );
  }
  if (status === "current") {
    return (
      <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-emerald-700 bg-white">
        <div className="h-2 w-2 rounded-full bg-emerald-700" />
      </div>
    );
  }
  if (status === "locked") {
    return (
      <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-stone-200 bg-white text-stone-400">
        <LockClosedIcon className="h-3.5 w-3.5" />
      </div>
    );
  }
  if (status === "skipped") {
    return (
      <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-stone-200 bg-stone-100 text-stone-400">
        <MinusIcon className="h-4 w-4" />
      </div>
    );
  }
  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-stone-200 bg-white text-[10px] font-semibold text-stone-400">
      {String(index + 1).padStart(2, "0")}
    </div>
  );
}

function stepLabelClass(status: StepStatus): string {
  switch (status) {
    case "done":
      return "text-stone-700";
    case "current":
      return "font-semibold text-stone-900";
    case "skipped":
      return "text-stone-400 line-through";
    default:
      return "text-stone-400";
  }
}

export default function ReportWorkflow({
  status,
  resolutionAction,
}: {
  status: AdminReportIssueStatus;
  resolutionAction?: AdminReportResolutionAction;
}) {
  const isComplete = status === "APPROVED" || status === "REJECTED";
  const warnOrBan =
    resolutionAction === "WARNING" || resolutionAction === "BANNED";
  const currentIndex = statusToStepIndex(status);
  const stepStatuses = getStepStatuses(currentIndex, isComplete, warnOrBan);

  return (
    <div className="rounded-2xl border border-stone-200 bg-white px-6 py-5 shadow-sm">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">
        Report Workflow
      </p>
      <div className="mt-3 flex items-start">
        {STEPS.map((step, i) => {
          const s = stepStatuses[i];
          const nextReached =
            i < STEPS.length - 1 &&
            (isComplete ||
              stepStatuses[i + 1] === "done" ||
              stepStatuses[i + 1] === "current");
          return (
            <Fragment key={step.key}>
              <div className="flex flex-shrink-0 flex-col items-center">
                <StepCircle status={s} index={i} />
                <span className={`mt-2 text-xs ${stepLabelClass(s)}`}>{step.label}</span>
                {s === "current" && (
                  <div className="mt-1 h-0.5 w-14 rounded-full bg-emerald-700" />
                )}
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`mx-2 mt-4 h-0.5 flex-1 ${
                    nextReached ? "bg-emerald-700" : "bg-stone-200"
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
