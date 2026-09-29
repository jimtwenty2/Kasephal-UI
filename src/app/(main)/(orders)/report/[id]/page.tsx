import Image from "next/image";
import { notFound } from "next/navigation";
import { getReportById } from "@/services/Report.service";
import ReporterReportDetail from "../_components/ReporterReportDetail";

interface ReportDetailPageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

export default async function ReportDetailPage({
  params,
}: ReportDetailPageProps) {
  const { id } = await params;

  let report;
  try {
    report = await getReportById(id);
  } catch {
    // getReportById throws on 404 / 403 (non-reporter, non-admin).
    notFound();
  }

  return (
    <div className="overflow-x-clip">
      <div className="mt-9 min-w-full px-6">
        <div className="relative z-0 -mt-30 h-20 w-full overflow-hidden rounded-[28px]">
          <Image
            src="/assets/nav-bar/navbar_bg_image.png"
            alt="Hero Background"
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
        </div>
      </div>

      <main className="relative min-h-screen overflow-hidden bg-[#fbf6e9] px-6">
        {/* Yellow blur glow circles — behind the decorative crops */}
        <div className="pointer-events-none absolute right-0 top-[10%] z-0 h-[clamp(240px,32vw,480px)] w-[clamp(240px,32vw,480px)] translate-x-1/2 rounded-full bg-amber-300 opacity-15 blur-3xl" />
        <div className="pointer-events-none absolute bottom-[4%] left-0 z-0 h-[clamp(240px,32vw,480px)] w-[clamp(240px,32vw,480px)] -translate-x-1/2 rounded-full bg-yellow-300 opacity-15 blur-3xl" />

        {/* Decorative background crops */}
        <Image
          src="/assets/srov.png"
          width={260}
          height={260}
          alt="srov"
          className="pointer-events-none absolute right-0 top-[15%] z-0 h-auto max-h-[50%] w-[clamp(240px,9vw,200px)] object-contain opacity-50"
        />
        <Image
          src="/assets/srov2.png"
          width={260}
          height={260}
          alt="srov2"
          className="pointer-events-none absolute bottom-0 left-0 z-0 h-auto max-h-[50%] w-[clamp(240px,11vw,200px)] object-contain opacity-50"
        />

        <div className="relative z-10 py-8">
          <ReporterReportDetail report={report} />
        </div>
      </main>
    </div>
  );
}
