"use server";

import {
  followFarmer as followFarmerService,
  unfollowFarmer as unfollowFarmerService,
  getFollowStatus as getFollowStatusService,
} from "@/services/follow.service";

export async function getFollowStatus(farmerId: string) {
  return getFollowStatusService(farmerId);
}

export async function followFarmer(farmerId: string) {
  return followFarmerService(farmerId);
}

export async function unfollowFarmer(farmerId: string) {
  return unfollowFarmerService(farmerId);
}