"use client";

import type {
  AdminReportAttachment,
  AdminReportIssueStatus,
  AdminReportIssueType,
} from "@/types/admin/report";
import ReportWorkflow from "./ReportWorkflowComponent";
import ReportContent from "./ReportContentComponent";
import EvidenceSection from "./EvidenceSectionComponent";
import ReportInfoCard from "./ReportInfoCardComponent";
import ReportActionPanel from "./ReportActionPanelComponent";
import UserSummaryCard, { type UserDetail } from "./UserSummaryCardComponent";

interface ReportDetailViewProps {
  reportId: string;
  initialStatus: AdminReportIssueStatus;
  createdAt: string;
  issueType: AdminReportIssueType;
  title: string;
  description: string;
  attachments: AdminReportAttachment[];
  reporter: UserDetail;
  reported: UserDetail;
}

export default function ReportDetailView({
  reportId,
  initialStatus,
  createdAt,
  issueType,
  title,
  description,
  attachments,
  reporter,
  reported,
}: ReportDetailViewProps) {
  const status = initialStatus;
  const isClosed = status === "APPROVED" || status === "REJECTED";

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
      <main>
        <ReportWorkflow status={status} />
        <ReportContent
          issueType={issueType}
          title={title}
          description={description}
        />
        <EvidenceSection files={attachments} />
      </main>

        <aside className="flex flex-col gap-4">
          <ReportInfoCard
            reportId={reportId}
            status={status}
            createdAt={createdAt}
          />

          <UserSummaryCard label="Reporter" user={reporter} />
          <UserSummaryCard label="Reported" user={reported} />

          {!isClosed && (
            <ReportActionPanel
              reportId={reportId}
              status={status}
              reportedUserId={reported.user_id}
              reportedUser={{
                full_name: reported.full_name,
                avatar_url: reported.avatar_url,
              }}
            />
          )}
        </aside>
    </div>
  );
}
