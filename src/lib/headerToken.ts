import { auth } from "@/auth";

export default async function headerToken(): Promise<HeadersInit> {
  const session = await auth();
  const accessToken = session?.user?.accessToken;

  return {
    "Content-Type": "application/json",
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  };
}