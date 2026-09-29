"use client";

import { useSyncExternalStore } from "react";
import {
  reportIssues,
  type ReportIssue,
  type ReportIssueStatus,
  type ReportResolutionAction,
} from "@/data/mockAllData";

let reports: ReportIssue[] = reportIssues.map((r) => ({ ...r }));
const listeners = new Set<() => void>();

function emit(): void {
  listeners.forEach((fn) => fn());
}

function subscribe(fn: () => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

function getSnapshot(): ReportIssue[] {
  return reports;
}

export function useReports(): ReportIssue[] {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function getReportById(reportId: string): ReportIssue | undefined {
  return reports.find((r) => r.report_issue_id === reportId);
}

export function updateReportStatus(
  reportId: string,
  status: ReportIssueStatus,
  resolutionAction?: ReportResolutionAction,
): void {
  let changed = false;
  reports = reports.map((r) => {
    if (r.report_issue_id !== reportId) return r;
    if (r.status === status && r.resolution_action === resolutionAction) return r;
    changed = true;
    return { ...r, status, resolution_action: resolutionAction };
  });
  if (changed) emit();
}
