export function maskIdentifier(identifier: string): string {
  const value = identifier.trim();
  if (!value) return "";

  if (value.includes("@")) {
    const [name, domain] = value.split("@");
    const visibleName =
      name.length <= 2 ? `${name.slice(0, 1)}••` : `${name.slice(0, 2)}••••`;
    return `${visibleName}@${domain}`;
  }

  const digits = value.replace(/\s+/g, "");
  if (digits.length <= 4) return `${digits.slice(0, 1)}••`;

  return `${digits.slice(0, 3)}••••${digits.slice(-2)}`;
}
