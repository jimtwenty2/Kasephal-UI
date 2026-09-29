import { z } from "zod";
export const loginSchema = z.object({
  identifier: z
    .string()
    .min(1, "validation.emailRequired")
    .refine(
      (value) => {
        const trimmed = value.trim();
        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
        const isPhone = /^[0-9]+$/.test(trimmed);
        return isEmail || isPhone;
      },
      { message: "validation.emailInvalid" },
    ),
  password: z
    .string()
    .min(1, "validation.passwordRequired")
});

export type LoginFormData = z.infer<typeof loginSchema>;
