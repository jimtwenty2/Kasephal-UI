"use server";

import {
  getCommunes,
  getDistricts,
  getProvinces,
  getVillages,
  type LocationListResult,
} from "@/services/locationFilter.service";

export async function getProvincesAction(): Promise<LocationListResult> {
  return getProvinces();
}

export async function getDistrictsAction(
  provinceId: string,
): Promise<LocationListResult> {
  return getDistricts(provinceId);
}

export async function getCommunesAction(
  districtId: string,
): Promise<LocationListResult> {
  return getCommunes(districtId);
}

export async function getVillagesAction(
  communeId: string,
): Promise<LocationListResult> {
  return getVillages(communeId);
}
