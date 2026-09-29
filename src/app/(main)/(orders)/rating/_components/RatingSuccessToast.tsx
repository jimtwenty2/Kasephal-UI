"use client";

import { CheckCircle } from "lucide-react";

export default function RatingSuccessToast() {
  return (
    <div className="fixed right-4 top-4 z-50 flex items-center gap-3 rounded-xl bg-white px-5 py-4 shadow-lg">
      <CheckCircle size={22} className="text-[#08743f]" />
      <div>
        <p className="text-sm font-bold text-[#1f2933]">Review submitted</p>
        <p className="text-xs text-[#6b7280]">
          Your rating has been submitted successfully.
        </p>
      </div>
    </div>
  );
}