type Props = {
  isVerifiedIdentity: boolean;
  status?: string;
  rejectionReason?: string | null;
  children: React.ReactNode;
};

export default function RequireVerifiedIdentity({
  isVerifiedIdentity,
  status,
  rejectionReason,
  children,
}: Props) {
  if (!isVerifiedIdentity) {
    const normalizedStatus = String(status ?? "").toUpperCase();
    const message =
      normalizedStatus === "REJECTED"
        ? rejectionReason
          ? `Your identity document was rejected: ${rejectionReason}. Please upload again and wait for approval before using this feature.`
          : "Your identity document was rejected. Please upload again and wait for approval before using this feature."
        : normalizedStatus === "PENDING"
          ? "Your identity document is under review. Please wait for approval before using this feature."
          : "Please upload your identity document and wait for approval before using this feature.";

    return (
      <div className="rounded-xl border border-yellow-300 bg-yellow-50 p-5">
        <h2 className="font-semibold text-yellow-800">
          Identity verification required
        </h2>
        <p className="mt-2 text-sm text-yellow-700">
          {message}
        </p>
      </div>
    );
  }

  return children;
}
