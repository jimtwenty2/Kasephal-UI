import { ReactNode } from "react";

type StatCardProps = {
  title: string;
  value: string;
  subtitle: string;
  icon: ReactNode;
};

export default function StatCard({
  title,
  value,
  subtitle,
  icon,
}: StatCardProps) {
  return (
    <div className="rounded-[24px] bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <div className="flex items-start justify-between">
        {/* Left Content */}
        <div>
          <p className="text-[13px] font-semibold uppercase tracking-wide text-muted">
            {title}
          </p>

          <h2 className="mt-4 text-[36px] font-bold leading-none text-primary-heading">
            {value}
          </h2>

          <p className="mt-2 text-[14px] font-medium text-secondary-body">
            {subtitle}
          </p>
        </div>

        {/* Icon */}
        <div className="flex h-[56px] w-[56px] items-center justify-center rounded-full bg-primary/10 text-primary">
          {icon}
        </div>
      </div>
    </div>
  );
}
