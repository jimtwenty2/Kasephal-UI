import { ReactNode } from "react";

interface ActionButtonProps {
  children: ReactNode;
  onClick?: () => void;
}

export default function ActionButton({ children, onClick }: ActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-[46px] shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-[#F6B941] px-4 text-[16px] font-semibold text-[#1D2939] transition-transform hover:bg-[#e0a634] active:scale-95"
    >
      {children}
    </button>
  );
}
