"use server";

import { revalidatePath } from "next/cache";
import {
  requestReportProof,
  updateAdminReportStatus,
} from "@/services/admin/report.service";
import { updateUserStatus } from "@/services/admin/user_management.service";

type WorkflowResult = { success: boolean; error?: string };

function revalidateReport(reportId: string) {
  revalidatePath("/report-management");
  revalidatePath(`/report-management/${reportId}`);
}

function toError(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

// Approve the report (closes the dispute in the reporter's favor).
export async function approveReportAction(
  reportId: string,
): Promise<WorkflowResult> {
  try {
    await updateAdminReportStatus(reportId, "APPROVED");
    revalidateReport(reportId);
    return { success: true };
  } catch (error) {
    return { success: false, error: toError(error, "Failed to approve report") };
  }
}

// Reject the report (dismisses the dispute).
export async function rejectReportAction(
  reportId: string,
): Promise<WorkflowResult> {
  try {
    await updateAdminReportStatus(reportId, "REJECTED");
    revalidateReport(reportId);
    return { success: true };
  } catch (error) {
    return { success: false, error: toError(error, "Failed to reject report") };
  }
}

// Move the report to WAITING_PROOF and notify the reporter.
export async function requestReportProofAction(
  reportId: string,
  message?: string,
): Promise<WorkflowResult> {
  try {
    await requestReportProof(reportId, message);
    revalidateReport(reportId);
    return { success: true };
  } catch (error) {
    return { success: false, error: toError(error, "Failed to request proof") };
  }
}

// Warning = suspend the reported account, then approve the report.
export async function warnUserAndApproveAction(
  reportId: string,
  reportedUserId: string,
  reason?: string,
): Promise<WorkflowResult> {
  try {
    await updateUserStatus(reportedUserId, "SUSPENDED", reason);
    await updateAdminReportStatus(reportId, "APPROVED");
    revalidateReport(reportId);
    revalidatePath("/user-management");
    return { success: true };
  } catch (error) {
    return { success: false, error: toError(error, "Failed to warn account") };
  }
}

// Ban = ban the reported account, then approve the report.
export async function banUserAndApproveAction(
  reportId: string,
  reportedUserId: string,
  reason?: string,
): Promise<WorkflowResult> {
  try {
    await updateUserStatus(reportedUserId, "BANNED", reason);
    await updateAdminReportStatus(reportId, "APPROVED");
    revalidateReport(reportId);
    revalidatePath("/user-management");
    return { success: true };
  } catch (error) {
    return { success: false, error: toError(error, "Failed to ban account") };
  }
}
