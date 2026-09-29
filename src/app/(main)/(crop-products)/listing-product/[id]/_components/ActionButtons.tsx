import { Pencil } from "lucide-react";
import Link from "next/link";

import { auth } from "@/auth";
import { normalizeUserRole, ROLES } from "@/constants/role";
import { getIdentityVerificationState } from "@/lib/identityVerification";

import ContactFarmerButton from "./ContactFarmerButton";
import DeleteButton from "@/app/(main)/(crop-products)/_components/DeleteButton";

type ActionButtonsProps = {
  productId?: string;
  farmerId?: string;
  productOwnerId?: string;
};

const buttonClass =
  "flex w-full items-center justify-center gap-2 rounded-xl bg-[#F6B941] px-5 py-3 text-xs font-bold text-[#1D2939] shadow-xs transition-transform hover:bg-[#e0a634] active:scale-[0.99] sm:w-auto";

export default async function ActionButtons({
  productId,
  farmerId,
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
        ? `Your identity document was rejected: ${verification.rejectionReason}. Please upload again and wait for approval before contacting a farmer.`
        : "Your identity document was rejected. Please upload again and wait for approval before contacting a farmer.";
    }

    if (status === "PENDING") {
      return "Your identity document is under review. Please wait for approval before contacting a farmer.";
    }

    return "Please verify your identity document before contacting a farmer.";
  })();

  if (role === ROLES.FARMER) {
    const isOwner = currentUserId && productOwnerId && currentUserId === productOwnerId;

    return (
      <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
        {isOwner && (
          <Link
            href={
              productId
                ? `/crop-product-edit/${productId}`
                : "/crop-product-management"
            }
            className={buttonClass}
          >
            <Pencil size={16} />
            Edit Product
          </Link>
        )}

        <DeleteButton
          cropProductId={productId}
          currentUserId={currentUserId}
          productOwnerId={productOwnerId}
          userId={session?.user?.userId}
        />
      </div>
    );
  }

  if (!productId || !farmerId) {
    return null;
  }

  return (
    <div className="flex flex-col justify-end gap-2 pt-6 sm:flex-row lg:pt-0">
      <ContactFarmerButton
        postId={productId}
        farmerId={farmerId}
        isVerifiedIdentity={verification?.isVerified ?? false}
        lockedMessage={lockedMessage}
      />
    </div>
  );
}
