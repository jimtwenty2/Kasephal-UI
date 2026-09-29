import type { AdministrativeLocation } from "@/services/locationFilter.service";

export function getLocationFilterOptions(locations: AdministrativeLocation[]) {
  const locationNames = Array.from(
    new Set(
      locations
        .map((location) => location.nameEn.trim())
        .filter((name): name is string => Boolean(name)),
    ),
  ).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));

  return ["All", ...locationNames];
}
