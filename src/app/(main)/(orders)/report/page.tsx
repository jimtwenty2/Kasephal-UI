import Image from "next/image";
import ReportIssue from "./_components/ReportIssue";
import ReportBlockedNotice from "./_components/ReportBlockedNotice";
import { auth } from "@/auth";
import { getOrderReportGuard } from "@/services/Report.service";
import { getUserProfileById } from "@/services/own-profile.service";

type UserRole = "farmer" | "buyer" | "government";

type ReportPageProps = {
  searchParams: Promise<{
    orderId?: string;
    reportedUserId?: string;
    role?: UserRole;
    from?: string;
  }>;
};

export default async function ReportPage({ searchParams }: ReportPageProps) {
  const { orderId, reportedUserId, role, from } = await searchParams;

  // FIX: show a clear error if required params are missing instead of
  //      passing empty strings that the backend will reject
  if (!orderId || !reportedUserId) {
    return (
      <main className="bg-background flex min-w-full items-center justify-center p-10">
        <p className="text-sm font-medium text-red-500">
          Invalid report link. Please go back and try again.
        </p>
      </main>
    );
  }

  const userRole: UserRole = role ?? "farmer";

  // Block a new report when the reporter already has an active (PENDING /
  // WAITING_PROOF) or resolved (APPROVED) report on this order. REJECTED
  // reports do not block. Fails open: if the lookup throws, fall through to the
  // form — the backend still rejects true duplicates.
  const session = await auth();
  const reporterId = session?.user?.userId;

  let blockingReport = null;
  if (reporterId) {
    try {
      const guard = await getOrderReportGuard(orderId, reporterId);
      if (guard.blocked) {
        blockingReport = guard.report;
      }
    } catch {
      blockingReport = null;
    }
  }

  // Resolve the reported user's display name to show in the form header.
  // Null-safe: a failed lookup leaves it undefined and the header falls back.
  const reportedProfile = await getUserProfileById(reportedUserId);
  const reportedUserName =
    reportedProfile?.payload?.personalInfo?.fullName ||
    reportedProfile?.payload?.personalInfo?.ministryName ||
    undefined;

  return (
    <div>
      <div className="mt-9 min-w-full px-4 sm:px-6">
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

      <main className="relative min-h-screen overflow-hidden bg-[#fbf6e9] px-4 sm:px-6 lg:px-8">
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

        <div className="relative z-10 mx-auto w-full max-w-7xl px-0 sm:px-4 lg:px-12 xl:px-28">
          {blockingReport ? (
            <ReportBlockedNotice
              status={blockingReport.status}
              orderId={orderId}
            />
          ) : (
            <ReportIssue
              role={userRole}
              orderId={orderId}
              reportedUserId={reportedUserId}
              reportedUserName={reportedUserName}
              from={from}
            />
          )}
        </div>
      </main>
    </div>
  );
}
