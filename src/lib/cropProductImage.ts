const FALLBACK_IMAGE = "/assets/image/no-product.jpg";

function getApiBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_BASE_API_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    process.env.NEXT_PUBLIC_BASE_URL ??
    ""
  ).replace(/\/$/, "");
}

function getImageBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_IMAGE_BASE_URL ??
    process.env.NEXT_PUBLIC_BASE_URL ??
    ""
  ).replace(/\/$/, "");
}

export function normalizeCropProductImageUrl(value?: string) {
  const image = value?.trim();

  if (!image || image === "string") return FALLBACK_IMAGE;
  if (image.startsWith("/")) return image;
  if (image.startsWith("http://") || image.startsWith("https://")) return image;

  const imageBaseUrl = getImageBaseUrl();
  const normalizedImage = image.replace(/^\/?uploads\/+/i, "").replace(/^\/+/, "");

  if (imageBaseUrl) return `${imageBaseUrl}/${normalizedImage}`;

  const apiBaseUrl = getApiBaseUrl();

  return apiBaseUrl
    ? `${apiBaseUrl}/uploads/view/${encodeURIComponent(normalizedImage)}`
    : normalizedImage;
}

export function getCropProductImages(imageUrls?: string | string[]) {
  const images = Array.isArray(imageUrls) ? imageUrls : imageUrls ? [imageUrls] : [];
  const normalizedImages = images
    .map(normalizeCropProductImageUrl)
    .filter((image) => image !== FALLBACK_IMAGE);

  return normalizedImages.length > 0 ? normalizedImages : [FALLBACK_IMAGE];
}
