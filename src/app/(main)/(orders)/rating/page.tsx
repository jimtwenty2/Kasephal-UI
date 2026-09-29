import Image from "next/image";
import RatingReviewForm from "./_components/RatingReviewForm";
import { getRatingUserRoleService } from "@/services/profile.service";
import { hasCurrentUserReviewedOrderService } from "@/services/review.service";

type RatingPageProps = {
  searchParams?: Promise<{ orderId?: string }>;
};

export default async function RatingPage({ searchParams }: RatingPageProps) {
  const { orderId } = (await searchParams) ?? {};

  const [userRole, alreadyReviewed] = await Promise.all([
    getRatingUserRoleService(),
    orderId
      ? hasCurrentUserReviewedOrderService(orderId)
      : Promise.resolve(false),
  ]);

  return (
    <main className="bg-background min-w-full">
      <div className="mt-9 w-full px-6">
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

      <div className="relative z-10 ">
        <RatingReviewForm role={userRole} alreadyReviewed={alreadyReviewed} />
      </div>
    </main>
  );
}
