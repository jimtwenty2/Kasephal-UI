/*
please follow name convention
of the service 
name.service.ts
*/

import { env } from "@/lib/env";
import headerToken from "@/lib/headerToken";

export async function getProfileService(){
  const headers = await headerToken();
  const res = await fetch(`${env.NEXT_BASE_API_URL}/profile/me`,{
    headers:headers,
  })
  const profile = await res.json();
  if(!res.ok){
    throw new Error("Get Profile failed. Please try again.");
  }

  return profile;
}