export function formatAdminId(prefix: string, id?: string | null) {
  const normalizedId = id?.trim();

  if (!normalizedId) return `#${prefix}-N/A`;

  return `#${prefix}-${normalizedId.slice(-4).toUpperCase()}`;
}
