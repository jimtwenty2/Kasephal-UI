import { homeTranslations } from "@/app/(main)/home/translations";
import { validationTranslations } from "./validation";
import { cropTranslations } from "./crop";

export const baseTranslations: Record<string, string> = {
  ...homeTranslations,
  ...cropTranslations,
  ...validationTranslations,

};
