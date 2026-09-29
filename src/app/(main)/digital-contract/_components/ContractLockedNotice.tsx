type ContractLockedNoticeProps = {
  finalizedBy?: string;
  finalizedDate?: string;
};

export default function ContractLockedNotice({
  finalizedBy = "—",
  finalizedDate = "—",
}: ContractLockedNoticeProps) {
  return (
    <div className="rounded-[32px] border border-primary/10 bg-primary/5 p-8 shadow-sm md:p-10">
      <div className="flex flex-col gap-6">
        {/* Left */}
        <div className="max-w-[850px]">
          <div className="mb-4 inline-flex rounded-full bg-primary px-5 py-2 text-[14px] font-medium tracking-wide text-white">
            FINALIZED
          </div>

          <h2 className="text-[40px] font-medium leading-tight text-primary-heading md:text-[52px]">
            Contract Locked
          </h2>

          <p className="mt-5 text-[18px] font-medium leading-[2] text-description-text">
            This contract has been accepted and finalized by both parties. The
            agreement is now protected and read-only. Editing, quantity updates,
            pricing changes, and contract modifications are permanently locked.
          </p>
        </div>

        {/* Actions — ordering is buyer-only */}
      </div>

      {/* Info */}
      <div className="mt-8 rounded-[28px] bg-white p-6 shadow-sm">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-light-grey bg-[#FAFAF7] p-5">
            <p className="text-[13px] font-medium uppercase tracking-wide text-description-text">
              Finalized By
            </p>

            <p className="mt-3 text-[24px] font-medium text-primary-heading">
              {finalizedBy}
            </p>
          </div>

          <div className="rounded-2xl border border-light-grey bg-[#FAFAF7] p-5">
            <p className="text-[13px] font-medium uppercase tracking-wide text-description-text">
              Finalized Date
            </p>

            <p className="mt-3 text-[24px] font-medium text-primary-heading">
              {finalizedDate}
            </p>
          </div>

          <div className="rounded-2xl border border-light-grey bg-[#FAFAF7] p-5">
            <p className="text-[13px] font-medium uppercase tracking-wide text-description-text">
              Contract Status
            </p>

            <p className="mt-3 text-[24px] font-medium text-primary">
              Locked & Protected
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Notice */}
      <div className="mt-8 rounded-[28px] border border-primary/10 bg-white p-6">
        <h3 className="text-[24px] font-medium text-primary-heading">
          Secure Agreement Protection
        </h3>

        <p className="mt-4 text-[17px] font-medium leading-[2] text-description-text">
          All contract information including crop quantity, payment details,
          delivery schedule, pricing, and agreement conditions are securely
          protected after finalization.
        </p>
      </div>
    </div>
  );
}
