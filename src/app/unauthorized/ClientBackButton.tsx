"use client";

import React from "react";
import { ArrowLeft } from "lucide-react";

export function ClientBackButton() {
  return (
    <button 
      onClick={() => window.history.back()}
      className="inline-flex items-center gap-2 text-[11px] font-bold text-secondary-body hover:text-primary transition-colors cursor-pointer group py-1"
    >
      <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
      Return to previous page
    </button>
  );
}