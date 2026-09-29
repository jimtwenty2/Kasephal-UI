import { notFound } from "next/navigation";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { auth } from "@/auth";
import { getContractByIdService } from "@/services/contract.service";
import FarmerReviewContract from "../_components/FarmerReviewContract";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: "Digital Contract — Kasephal",
  description: "Review the details of a digital contract.",
};

export default async function DigitalContractPage({ params }: PageProps) {
  const { id } = await params;

  const [session, contract] = await Promise.all([
    auth(),
    getContractByIdService(decodeURIComponent(id)),
  ]);

  if (!contract) {
    notFound();
  }

  // Farmer reviews (accept/reject/request change); buyer/government view-only.
  const viewerRole =
    session?.user?.role?.toUpperCase() === "FARMER" ? "FARMER" : "BUYER";

  return (
    <div className="overflow-x-clip">
      {/* Hero banner sits behind the navbar so its white text stays legible */}
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

      <main className="relative min-h-screen overflow-hidden bg-[#fbf6e9]">
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

        <div className="relative z-10 px-28 py-8">
          {/* Breadcrumb */}
          <nav className="mb-8 flex items-center text-xs text-muted md:text-sm">
            <div className="flex items-center gap-2 whitespace-nowrap">
              <Link href="/" className="hover:underline">
                Home
              </Link>
              <span>&rsaquo;</span>
              <Link
                href={`/chat?chatRoomId=${contract.chatRoomId}`}
                className="text-muted hover:underline"
              >
                Chat
              </Link>
              <span>&rsaquo;</span>
              <span className="font-bold text-primary">Contract Detail</span>
            </div>
          </nav>

          <FarmerReviewContract contract={contract} viewerRole={viewerRole} />
        </div>
      </main>
    </div>
  );
}
