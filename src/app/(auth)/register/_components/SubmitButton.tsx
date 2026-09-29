export default function SubmitButton({
  children,
  disabled = false,
}: {
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className="mt-3 h-11 w-full rounded-[10px] bg-secondary text-sm text-primary-heading text-[clamp(14px,1.05vw,18px)] font-semibold text-heading-text transition-all hover:bg-amber-500 hover:text-white hover:after:scale-x-100 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-secondary disabled:hover:text-primary-heading"
    >
      {children}
    </button>
  );
}
