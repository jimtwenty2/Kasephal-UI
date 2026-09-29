import { LocationOption } from "@/types/location-options";
import { ApiResponse } from "@/types/api-response";

const baseUrl = process.env.NEXT_PUBLIC_BASE_API_URL

async function fetchLocationService(url: string): Promise<LocationOption[]> {
  const res = await fetch(url);

  const data: ApiResponse<LocationOption[]> = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to fetch locations");
  }

  return data.payload ?? [];
}

export function getProvincesService() {
  return fetchLocationService(`${baseUrl}/locations/provinces`);
}

export function getDistrictsService(provinceId: string) {
  return fetchLocationService(
    `${baseUrl}/locations/provinces/${provinceId}/districts`
  );
}

export function getCommunesService(districtId: string) {
  return fetchLocationService(
    `${baseUrl}/locations/districts/${districtId}/communes`
  );
}

export function getVillagesService(communeId: string) {
  return fetchLocationService(
    `${baseUrl}/locations/communes/${communeId}/villages`
  );
}