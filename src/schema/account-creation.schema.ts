import { z } from "zod";
export const accountSchema = z
  .object({
    phoneNumber: z.string().optional(),
    email: z.string().optional(),
    password: z
      .string()
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).+$/,
        "Password must include at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)",
      )
      .min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Confirm password is required"),
  })
  .superRefine((data, ctx) => {
    if (!data.phoneNumber && !data.email) {
      ctx.addIssue({
        code: "custom",
        message: "Phone number or email is required",
        path: ["phone"],
      });
    }

    if (data.email && !z.string().email().safeParse(data.email).success) {
      ctx.addIssue({
        code: "custom",
        message: "Invalid email address",
        path: ["email"],
      });
    }

    if (data.phoneNumber) {
      if (!/^[0-9]+$/.test(data.phoneNumber)) {
        ctx.addIssue({
          code: "custom",
          message: "Phone number must contain only numbers",
          path: ["phone"],
        });
      }

      if (data.phoneNumber.length < 8) {
        ctx.addIssue({
          code: "custom",
          message: "Phone number must be at least 8 digits",
          path: ["phone"],
        });
      }
    }

    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: "custom",
        message: "Password does not match",
        path: ["confirmPassword"],
      });
    }
  });

export type AccountSchema = z.infer<typeof accountSchema>;
