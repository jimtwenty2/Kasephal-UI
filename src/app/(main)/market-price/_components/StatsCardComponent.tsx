"use client";

interface StatsCardProps {
  title: string;
  content: string | number;
  footer: string;
  icon: React.ReactNode;
  suffix?: string;
}

export default function StatsCard({
  title,
  content,
  footer,
  icon,
  suffix,
}: StatsCardProps) {
  return (
    <div className="relative flex flex-col justify-between rounded-2xl border-border shadow-sm bg-white px-5 py-4 min-w-0">
      {/* Title */}
      <p className="text-[14px] font-medium uppercase text-muted">{title}</p>

      {/* Content */}
      <h3 className="mt-5 text-[24px] font-extrabold leading-none text-primary-heading">
        {content} {suffix}
      </h3>

      {/* Footer */}
      <p className="mt-2 text-[14px] font-semibold text-secondary-body">
        {footer}
      </p>

      {/* Icon */}
      <div className="absolute bottom-5 right-5 flex h-13.5 w-13.5 items-center justify-center rounded-full bg-[#EEF8F1]">
        {icon}
      </div>
    </div>
  );
}
