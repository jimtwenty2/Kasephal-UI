type DashboardSectionTitleProps = {
  label: string;
  title: string;
  description?: string;
};

export default function DashboardSectionTitleOverview({
  label,
  title,
  description,
}: DashboardSectionTitleProps) {
  return (
    <div>
      <p className="text-[14px] font-bold uppercase tracking-wide text-primary md:text-[16px]">
        {label}
      </p>

      <h1 className="mt-2 text-[12px] font-black leading-none text-primary-heading md:text-[32px]">
        {title}
      </h1>

      {description && (
        <p className="mt-4 max-w-175 text-[15px] leading-relaxed text-secondary-body">
          {description}
        </p>
      )}
    </div>
  );
}
