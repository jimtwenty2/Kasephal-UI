import { redirect } from "next/navigation";

import OwnProfileClient from "./_component/OwnProfileClient";
import { getUserProfile } from "@/services/own-profile.service";
import {
  getAuthorizedProfileRole,
  getOwnProfileData,
} from "./_lib/own-profile.data";
import { getOwnProfileDemandPosts } from "./_lib/own-profile-demand-posts.data";

export default async function Page() {
  const role = await getAuthorizedProfileRole();

  if (!role) {
    redirect("/unauthorized");
  }

  const [profile, profileData, demandPosts] = await Promise.all([
    getUserProfile(),
    getOwnProfileData(),
    getOwnProfileDemandPosts(), 
  ]);

  return (
    <OwnProfileClient
      profile={profile.payload}
      profileData={{ ...profileData, demandPosts }}
      role={role}
    />
  );
}