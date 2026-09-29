import headerToken from "@/lib/headerToken";

export type AdministrativeLocation = {
  id: string;
  nameEn: string;
  nameKh?: string;
};

type ApiResponse<T> = {
  success?: boolean;
  message?: string;
  payload?: T;
  data?: T;
};

export type LocationListResult = {
  data: AdministrativeLocation[];
  error?: string;
};

function getBaseUrl() {
  return process.env.API_BASE_URL ?? process.env.NEXT_BASE_API_URL ?? null;
}

async function readResponse<T>(res: Response): Promise<ApiResponse<T>> {
  const text = await res.text();

  if (!text) return {};

  return JSON.parse(text) as ApiResponse<T>;
}

function normalizeLocations(
  locations: AdministrativeLocation[] | undefined,
): AdministrativeLocation[] {
  return (locations ?? [])
    .filter((location) => location.id && location.nameEn)
    .sort((a, b) =>
      a.nameEn.localeCompare(b.nameEn, undefined, { sensitivity: "base" }),
    );
}

async function getLocationList(path: string): Promise<LocationListResult> {
  const baseUrl = getBaseUrl();

  if (!baseUrl) {
    return { data: [], error: "API base URL is not configured." };
  }

  try {
    const res = await fetch(`${baseUrl}${path}`, {
      method: "GET",
      headers: await headerToken(),
      next: { tags: ["locations"] },
    });
    const response = await readResponse<AdministrativeLocation[]>(res);

    if (!res.ok || response.success === false) {
      return {
        data: [],
        error: response.message ?? "Failed to fetch locations.",
      };
    }

    return { data: normalizeLocations(response.payload ?? response.data) };
  } catch (error) {
    return {
      data: [],
      error: error instanceof Error ? error.message : "Failed to fetch locations.",
    };
  }
}

export function getProvinces() {
  return getLocationList("/locations/provinces");
}

export function getDistricts(provinceId: string) {
  return getLocationList(`/locations/provinces/${provinceId}/districts`);
}

export function getCommunes(districtId: string) {
  return getLocationList(`/locations/districts/${districtId}/communes`);
}

export function getVillages(communeId: string) {
  return getLocationList(`/locations/communes/${communeId}/villages`);
}
