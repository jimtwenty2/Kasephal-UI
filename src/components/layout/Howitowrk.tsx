
import Link from "next/link";
export default function Howitowrk() {
  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row">
      <Link href="/overview-dashboard">
        <button className="group flex h-12 w-full items-center justify-center gap-3 rounded-[14px] px-8 text-[16px] font-semibold text-white border-amber-50 border-2 transition-all duration-300 hover:scale-[1.02] hover:opacity-90 sm:w-75">
          Go to Overview Dashboard
        </button>
      </Link>
    </div>
  );
}
