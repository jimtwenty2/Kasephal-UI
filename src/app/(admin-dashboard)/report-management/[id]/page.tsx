import { notFound } from "next/navigation";

import { getAdminReportDetail } from "@/services/admin/report.service";
import ReportDetailView from "../_components/ReportDetailViewComponent";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ReportDetailPage({ params }: PageProps) {
  const { id } = await params;
  let report;

  try {
    report = await getAdminReportDetail(id);
  } catch {
    notFound();
  }

  if (!report.reporter || !report.reported) notFound();

  return (
    <ReportDetailView
      reportId={report.report_issue_id}
      initialStatus={report.status}
      createdAt={report.created_at}
      issueType={report.issue_type}
      title={report.title}
      description={report.description}
      attachments={report.attachments}
      reporter={report.reporter}
      reported={report.reported}
    />
  );
}
