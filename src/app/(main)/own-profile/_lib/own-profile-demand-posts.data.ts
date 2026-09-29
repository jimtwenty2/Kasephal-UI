import { getCropDemandsOwn } from "@/services/cropDemand.service";
import type { CropDemandPost } from "@/types/crop-demand";

const PROFILE_DEMAND_POST_SIZE = 10;

export async function getOwnProfileDemandPosts(): Promise<CropDemandPost[]> {
  const result = await getCropDemandsOwn({
    page: 1,
    size: PROFILE_DEMAND_POST_SIZE,
  });

  return result.error ? [] : (result.data ?? []);
}
