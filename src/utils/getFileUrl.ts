export function getFileUrl(fileName?: string | null): string {
  const value = fileName?.trim();

  if (!value || value.toLowerCase() === "string") return "";

  if (/^(blob:|data:)/i.test(value)) return value;

  if (/^https?:/i.test(value) && !/\/uploads\//i.test(value)) {
    return value;
  }

  if (value.startsWith("/") && !value.startsWith("/uploads/")) {
    return value;
  }

  const storedFileName = getStoredFileName(value);

  if (!storedFileName) return "";

  return `${getUploadViewBaseUrl()}/${encodeURIComponent(storedFileName)}`;
}

export function getStoredFileName(fileName?: string | null): string {
  const value = fileName?.trim();

  if (!value || value.toLowerCase() === "string" || /^(blob:|data:)/i.test(value)) {
    return "";
  }

  try {
    const url = new URL(value);
    const viewMatch = url.pathname.match(/\/uploads\/(?:view|download)\/(.+)$/i);

    if (viewMatch?.[1]) return decodeURIComponent(viewMatch[1]);

    return decodeURIComponent(url.pathname.split("/").filter(Boolean).at(-1) ?? "");
  } catch {
    const normalized = value.replace(/^\/?uploads\/(?:view\/|download\/)?/i, "");

    return decodeURIComponent(normalized.split("/").filter(Boolean).at(-1) ?? "");
  }
}

function getUploadViewBaseUrl() {
  const apiBase = (
    process.env.NEXT_PUBLIC_BASE_API_URL ??
    "https://kasephal-api-dev.detronic11.win/api/v1"
  ).replace(/\/+$/, "");

  if (/\/uploads\/view$/i.test(apiBase)) return apiBase;
  if (/\/uploads$/i.test(apiBase)) return `${apiBase}/view`;

  return `${apiBase}/uploads/view`;
}
