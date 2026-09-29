export function formatCambodiaPhone(value?: string | null) {
  const raw = value?.trim();

  if (!raw || raw === "N/A" || raw === "—") return raw ?? "N/A";

  const digits = raw.replace(/\D/g, "");
  const localDigits = digits.startsWith("855") ? digits.slice(3) : digits;
  const withoutLeadingZero = localDigits.startsWith("0")
    ? localDigits.slice(1)
    : localDigits;

  if (digits.startsWith("0") && (digits.length === 9 || digits.length === 10)) {
    return formatCambodiaGroups(withoutLeadingZero);
  }

  if (digits.startsWith("855") && (localDigits.length === 8 || localDigits.length === 9)) {
    return formatCambodiaGroups(withoutLeadingZero);
  }

  return raw;
}

function formatCambodiaGroups(localDigits: string) {
  if (localDigits.length === 8) {
    return `+855 ${localDigits.slice(0, 2)} ${localDigits.slice(2, 5)} ${localDigits.slice(5)}`;
  }

  if (localDigits.length === 9) {
    return `+855 ${localDigits.slice(0, 3)} ${localDigits.slice(3, 6)} ${localDigits.slice(6)}`;
  }

  return `+855 ${localDigits}`;
}
