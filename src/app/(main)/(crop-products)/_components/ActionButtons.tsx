import { Pencil } from "lucide-react";
import Link from "next/link";

import { auth } from "@/auth";
import { normalizeUserRole, ROLES } from "@/constants/role";
import { getIdentityVerificationState } from "@/lib/identityVerification";

import ContactFarmerButton from "../listing-product/[id]/_components/ContactFarmerButton";
import DeleteButton from "./DeleteButton";

type ActionButtonsProps = {
  cropProductId?: string;
  postId?: string;
  farmerId?: string;
  farmerName?: string;
  farmerLocation?: string;
  productOwnerId?: string;
};

const btnClass =
  "flex w-full items-center justify-center gap-2 rounded-xl bg-[#F6B941] px-5 py-3 text-xs font-bold text-[#1D2939] shadow-xs transition-transform hover:bg-[#e0a634] active:scale-[0.99] sm:w-auto";

export default async function ActionButtons({
  cropProductId,
  postId,
  farmerId,
  farmerName,
  farmerLocation,
  productOwnerId,
}: ActionButtonsProps) {
  const session = await auth();
  const role = normalizeUserRole(session?.user?.role);
  const currentUserId = session?.user?.userId || session?.user?.id;
  const verification =
    role === ROLES.BUYER || role === ROLES.GOVERNMENT
      ? await getIdentityVerificationState()
      : null;

  const lockedMessage = (() => {
    const status = String(verification?.status ?? "").toUpperCase();

    if (status === "REJECTED") {
      return verification?.rejectionReason
        ? `Your identity document was rejected: ${verification.rejectionReason}. Please upload again and wait for approval.`
        : "Your identity document was rejected. Please upload again and wait for approval.";
    }

    if (status === "PENDING") {
      return "Your identity document is under review. Please wait for approval.";
    }

    return "Please verify your identity document before buying.";
  })();

  if (role === ROLES.FARMER) {
    const isOwner = currentUserId && productOwnerId && currentUserId === productOwnerId;

    return (
      <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
        {isOwner && (
          <Link
            href={
              cropProductId
                ? `/crop-product-edit/${cropProductId}`
                : "/crop-product-management"
            }
            className={btnClass}
          >
            <Pencil size={16} />
            Edit Product
          </Link>
        )}

        <DeleteButton
          cropProductId={cropProductId}
          currentUserId={currentUserId}
          productOwnerId={productOwnerId}
          userId={session?.user?.userId}
        />
      </div>
    );
  }

  if (!postId || !farmerId) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2 pt-6 sm:flex-row sm:justify-end lg:pt-0">
      <ContactFarmerButton
        postId={postId}
        farmerId={farmerId}
        farmerName={farmerName}
        farmerLocation={farmerLocation}
        isVerifiedIdentity={verification?.isVerified ?? false}
        lockedMessage={lockedMessage}
      />
    </div>
  );
}
