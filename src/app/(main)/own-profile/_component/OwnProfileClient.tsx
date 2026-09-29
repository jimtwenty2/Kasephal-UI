"use client";

import Image from "next/image";
import type { UserProfilePayload } from "@/types/user";

import ProfileHeader from "./ProfileHeader";
import ProfileTabs from "./ProfileTabs";
import CropPostComponent from "./CropPostComponent";
import DemandPostComponent from "./DemandPostComponent";
import OrderHistoryComponent from "./OrderHistoryComponent";
import RatingComponent from "./RatingComponent";
import SavedCropPostComponent from "./SavedCropComponent";
import SavedDemandPostComponent from "./SavedDemandPostComponent";
import type { OwnProfilePageData, ProfileRole } from "../_lib/own-profile.types";

type OwnProfileClientProps = {
  profile: UserProfilePayload | null;
  profileData: OwnProfilePageData;
  role: ProfileRole;
  readOnly?: boolean;
  initialIsFollowing?: boolean;
  viewerRole?: ProfileRole | null;
};

export default function OwnProfileClient({
  profile,
  profileData,
  role,
  readOnly = false,
  initialIsFollowing = false,
  viewerRole = null,
}: OwnProfileClientProps) {
  return (
    <main className="min-h-screen min-w-full bg-[#fbf6e9]">
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

      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute right-0 top-[10%] z-0 h-[clamp(240px,32vw,480px)] w-[clamp(240px,32vw,480px)] translate-x-1/2 rounded-full bg-amber-300 opacity-15 blur-3xl" />
        <div className="pointer-events-none absolute bottom-[4%] left-0 z-0 h-[clamp(240px,32vw,480px)] w-[clamp(240px,32vw,480px)] -translate-x-1/2 rounded-full bg-yellow-300 opacity-15 blur-3xl" />
        <Image
          src="/assets/srov.png"
          width={260}
          height={260}
          alt="srov"
          className="pointer-events-none absolute right-0 top-[15%] z-0 h-auto max-h-[50%] w-[clamp(240px,9vw,200px)] object-contain opacity-50"
        />
        <Image
          src="/assets/srov2.png"
          width={260}
          height={260}
          alt="srov2"
          className="pointer-events-none absolute bottom-0 left-0 z-0 h-auto max-h-[50%] w-[clamp(240px,11vw,200px)] object-contain opacity-50"
        />

        <div className="relative z-10 mx-auto flex w-full flex-col gap-6 px-6 py-6 lg:px-30">
          <ProfileHeader
            role={role}
            profile={profile}
            readOnly={readOnly}
            initialIsFollowing={initialIsFollowing}
            viewerRole={viewerRole}
          />

          <ProfileTabs
            role={role}
            readOnly={readOnly}
            demandPostComponent={
              <DemandPostComponent demandPosts={profileData.demandPosts} />
            }
            savedCropPostComponent={
              <SavedCropPostComponent cropProducts={profileData.savedCrops} />
            }
            cropPostComponent={
              <CropPostComponent
                cropProducts={profileData.cropPosts}
                viewerRole={viewerRole}
              />
            }
            savedDemandPostComponent={
              <SavedDemandPostComponent
                savedDemandPosts={profileData.savedDemandPosts}
              />
            }
            orderHistoryComponent={
              <OrderHistoryComponent orderItems={profileData.orderHistory} />
            }
            ratingComponent={
              <RatingComponent role={role} reviews={profileData.ratings} />
            }
          />
        </div>
      </div>
    </main>
  );
}
