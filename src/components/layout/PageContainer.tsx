interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

export default function PageContainer({
  children,
  className = "",
}: PageContainerProps) {
  return (
    <div className={`mx-auto w-full max-w-[1300px] px-4 ${className}`}>
      {children}
    </div>
  );
}
