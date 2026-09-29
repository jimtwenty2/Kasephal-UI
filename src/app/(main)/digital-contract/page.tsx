import { UserRole } from "@/types/user-role";
import CreateContract from "./_components/CreateContract";
import FarmerReviewContract from "./_components/FarmerReviewContract";
import Image from "next/image";

type Props = {
  role?: UserRole | null;
};

export default function Page({ role = UserRole.FARMER }: Props) {
  const canCreateContract =
    role === UserRole.BUYER || role === UserRole.GOVERNMENT;

  const canReviewContract = role === UserRole.FARMER;

  return (
    <main className="min-h-screen min-w-screen bg-background">
      <div className="mt-9 min-w-full px-6">
        <div className="relative z-0 -mt-30 h-20 w-full overflow-hidden rounded-[28px]">
          <Image
            src="/assets/nav-bar/navbar_bg_image.png"
            alt="Hero Background"
            fill
            className="object-cover"
            priority
          />
        </div>
      </div>
      <div className="mx-auto w-full px-28 py-8">
        {canCreateContract ? (
          <CreateContract />
        ) : canReviewContract ? (
          <FarmerReviewContract />
        ) : (
          <AccessDenied />
        )}
      </div>
    </main>
  );
}

function AccessDenied() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="w-full max-w-[420px] rounded-[24px] border border-light-grey bg-white p-8 text-center shadow-sm">
        <h1 className="text-[24px] font-medium text-primary-heading">
          Access Denied
        </h1>

        <p className="mt-2 text-[15px] font-medium text-description-text">
          You do not have permission to access this contract page.
        </p>
      </div>
    </div>
  );
}
