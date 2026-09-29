export const DATE_OF_BIRTH_AGE_MESSAGE =
  "Date of birth must be between 18 and 90 years old.";

export function isDateOfBirthAgeValid(value: string) {
  const [year, month, day] = value.split("-").map(Number);

  if (!year || !month || !day) return false;

  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return false;
  }

  const today = new Date();
  let age = today.getFullYear() - date.getFullYear();
  const monthDiff = today.getMonth() - date.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < date.getDate())
  ) {
    age -= 1;
  }

  return age >= 18 && age <= 90;
}
