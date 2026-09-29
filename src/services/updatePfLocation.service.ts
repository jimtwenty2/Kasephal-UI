import { env } from "@/lib/env";
import type { ApiResponse, LocationItem } from "@/types/updateOwnProfileInfo";

type RawLocation = Record<string, unknown>;

function normalizeLocation(item: RawLocation): LocationItem {
  const id =
    item.provinceId ??
    item.districtId ??
    item.communeId ??
    item.villageId ??
    item.id ??
    "";

  const nameEn =
    item.nameEn ??
    item.name_en ??
    item.name ??
    item.provinceName ??
    item.districtName ??
    item.communeName ??
    item.villageName ??
    "";
    const nameKh =
    item.nameKh ??
    item.name_kh ??
    item.provinceNameKh ??
    item.districtNameKh ??
    item.communeNameKh ??
    item.villageNameKh ??
    "";

  return {
    id: String(id),
    nameEn: String(nameEn),
    nameKh: String(nameKh),
  };
}

async function fetchLocations(path: string): Promise<LocationItem[]> {
  const res = await fetch(`${env.NEXT_BASE_API_URL}${path}`, {
    method: "GET",
    cache: "no-store",
  });

  const data = (await res.json()) as ApiResponse<RawLocation[]>;

  if (!res.ok) {
    throw new Error(data.message || data.detail || "Failed to fetch locations");
  }

  const list = data.payload ?? data.data ?? [];
  return list.map(normalizeLocation).filter((item) => item.id && item.nameEn);
}

export async function getProvinces() {
  return fetchLocations("/locations/provinces");
}

export async function getDistricts(provinceId: string) {
  return fetchLocations(`/locations/provinces/${provinceId}/districts`);
}

export async function getCommunes(districtId: string) {
  return fetchLocations(`/locations/districts/${districtId}/communes`);
}

export async function getVillages(communeId: string) {
  return fetchLocations(`/locations/communes/${communeId}/villages`);
}