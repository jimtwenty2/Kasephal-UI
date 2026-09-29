import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import OwnProfileClient from "@/app/(main)/own-profile/_component/OwnProfileClient";
import { getViewProfileData } from "@/app/(main)/own-profile/_lib/own-profile.data";
import type { ProfileRole } from "@/app/(main)/own-profile/_lib/own-profile.types";
import { getUserProfileById } from "@/services/own-profile.service";
import type { CropDemandPost } from "@/types/crop-demand";

interface PageProps {
  params: Promise<{
    slug?: string[];
  }>;
}

const PROFILE_ROLES = new Set<ProfileRole>(["farmer", "buyer", "government"]);

function normalizeProfileRole(role?: string): ProfileRole | null {
  const normalized = role?.toLowerCase();
  return normalized && PROFILE_ROLES.has(normalized as ProfileRole)
    ? (normalized as ProfileRole)
    : null;
}

function getRoleFromProfile(role?: string): ProfileRole {
  const normalized = role?.toLowerCase();
  if (normalized === "buyer") return "buyer";
  if (normalized === "government") return "government";
  return "farmer";
}

export default async function OtherProfilePage({ params }: PageProps) {
  const session = await auth();

  const { slug = [] } = await params;
  const [firstSegment, secondSegment] = slug;

  const explicitRole = normalizeProfileRole(firstSegment);
  const targetedUserId = explicitRole ? secondSegment : firstSegment;

  if (!targetedUserId) notFound();

  const currentUserId = session?.user?.userId;

  if (currentUserId && targetedUserId === currentUserId) {
    redirect("/own-profile");
  }

  const profile = await getUserProfileById(targetedUserId);

  if (!profile || !profile.success || !profile.payload) notFound();

  const role = explicitRole ?? getRoleFromProfile(profile.payload.basicInfo.role);

  // Extract crop demands directly from the profile response — no extra API call needed
  const demandPostsFromProfile = (profile.payload as typeof profile.payload & {
    cropDemands?: CropDemandPost[];
  }).cropDemands ?? [];

  const profileData = await getViewProfileData(
    targetedUserId,
    role,
    profile.payload,
  );

  // Derive the viewer's role from the session so farmer-on-farmer visits
  // correctly hide the Message and Follow buttons.
  const viewerRole = getRoleFromProfile(session?.user?.role);

  return (
    <OwnProfileClient
      profile={profile.payload}
      profileData={{
        ...profileData,
        // Use demand posts from profile if getViewProfileData returned none
        demandPosts: profileData.demandPosts.length > 0
          ? profileData.demandPosts
          : demandPostsFromProfile,
      }}
      role={role}
      readOnly
      viewerRole={viewerRole}
    />
  );
}
