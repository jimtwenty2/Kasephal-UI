import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{
    targetedUserId: string;
  }>;
}

export default async function LegacyProfileLinkPage({ params }: PageProps) {
  const { targetedUserId } = await params;

  redirect(`/other-profile/${targetedUserId}`);
}
