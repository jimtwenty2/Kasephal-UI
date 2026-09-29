type CropTypeOptionSource = {
  typeName?: string | null;
};

export function getSortedCropTypeNames(cropTypes: CropTypeOptionSource[]) {
  return Array.from(
    new Set(
      cropTypes
        .map((cropType) => cropType.typeName?.trim())
        .filter((typeName): typeName is string => Boolean(typeName)),
    ),
  ).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
}

export function getCropTypeFilterOptions(cropTypes: CropTypeOptionSource[]) {
  return ["All", ...getSortedCropTypeNames(cropTypes)];
}
