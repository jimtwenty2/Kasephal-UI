export function getAttachmentUrl(fileName?: string | null): string {
  const value = fileName?.trim();

  if (!value || value.toLowerCase() === "string") return "";

  if (/^(https?:|blob:|data:)/i.test(value) || value.startsWith("/")) {
    return value;
  }

  const base = getPublicApiBaseUrl();

  if (!base) return "";

  if (value.includes("/")) {
    return `${base}/${value.replace(/^\/+/, "")}`;
  }

  return `${base}/uploads/view/${encodeURIComponent(value)}`;
}

export function getAttachmentDownloadUrl(fileName?: string | null): string {
  const value = fileName?.trim();

  if (!value || value.toLowerCase() === "string") return "";

  if (/^(blob:|data:)/i.test(value)) {
    return value;
  }

  if (/^https?:/i.test(value)) {
    return value.replace("/uploads/view/", "/uploads/download/");
  }

  const base = getPublicApiBaseUrl();

  if (!base) return "";

  if (value.startsWith("/")) {
    return `${base}/${value
      .replace(/^\/+/, "")
      .replace("/uploads/view/", "/uploads/download/")}`;
  }

  if (value.includes("/uploads/view/")) {
    return `${base}/${value.replace(/^\/+/, "").replace("/uploads/view/", "/uploads/download/")}`;
  }

  if (value.includes("/uploads/download/")) {
    return `${base}/${value.replace(/^\/+/, "")}`;
  }

  if (value.includes("/")) {
    return `${base}/${value.replace(/^\/+/, "")}`;
  }

  return `${base}/uploads/download/${encodeURIComponent(value)}`;
}

export function getAttachmentImageUrl(fileName?: string | null): string {
  const value = fileName?.trim();

  if (!value || value.toLowerCase() === "string") return "";

  if (/^(blob:|data:)/i.test(value)) {
    return value;
  }

  return `/api/chat-attachments?file=${encodeURIComponent(value)}`;
}

function getPublicApiBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_BASE_API_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    ""
  ).replace(/\/+$/, "");
}
