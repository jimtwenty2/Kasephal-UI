import type { ReactNode } from "react";
import Sidebar from "./_components/SibeBarComponent";
import PageHeader from "./_components/PageHeaderComponent";

export default function AdminDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    
    <div className="flex h-screen overflow-hidden bg-white font-thicccboi text-stone-900">
      <Sidebar />

      <div
        data-scroll-lock
        className="flex min-w-0 flex-1 flex-col overflow-y-auto px-8"
      >
        <PageHeader />

        <main className="flex-1  pb-8">{children}</main>
      </div>
    </div>
  );
}