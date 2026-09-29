"use server";

import {
  updateBakong,
  updateBuyerProfile,
  updateFarmerProfile,
  updateGovernmentProfile,
  changePassword,
} from "@/services/profile.service";
import { getProvinces, getDistricts, getCommunes, getVillages } from "@/services/updatePfLocation.service";
export type { UpdateBakongPayload, ChangePasswordPayload } from "@/types/user";

export { updateBakong, updateBuyerProfile, updateFarmerProfile, updateGovernmentProfile, changePassword };

export { getProvinces, getDistricts, getCommunes, getVillages };
