import { ElementType } from "react";

type DashboardStatCardOverviewProps = {
  title: string;
  value: string;
  subtitle: string;
  icon: ElementType;
};

export default function DashboardStatCardOverview({
  title,
  value,
  subtitle,
  icon: Icon,
}: DashboardStatCardOverviewProps) {
  return (
    <div className="rounded-[20px] border border-light-grey bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[12px] font-bold uppercase tracking-wide text-muted">
            {title}
          </p>

          <h2 className="mt-3 text-[32px] font-bold leading-none text-primary-heading">
            {value}
          </h2>

          <p className="mt-2 text-[14px] font-semibold text-secondary-body">
            {subtitle}
          </p>
        </div>

        <div className="flex h-[60px] w-[60px] items-center justify-center rounded-full bg-primary/10">
          <Icon className="h-7 w-7 text-primary" />
        </div>
      </div>
    </div>
  );
}
