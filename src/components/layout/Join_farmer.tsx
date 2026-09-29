"use client";

import { ArrowRightIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

export default function Join_farmer() {
  return (
    <div className="flex flex-col items-center gap-10 sm:flex-row">
      <Link href="/register">
        <button className="group flex h-12 w-full items-center justify-center gap-3 rounded-[14px] bg-secondary px-8 text-[15px] font-semibold text-black transition-all duration-300 hover:scale-[1.02] hover:opacity-90 sm:w-55">
          JOIN AS FARMER
          <ArrowRightIcon className="h-5 w-5 stroke-[2.5] transition-transform duration-300 group-hover:translate-x-1" />
        </button>
      </Link>
    </div>
  );
}
