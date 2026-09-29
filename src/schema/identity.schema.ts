import {z} from "zod";

export const identityDocumentSchema = z
  .object({
    documentType: z.enum(["ID_CARD", "PASSPORT"]),
    frontImageUrl: z.string().min(1, "Front image is required"),
    backImageUrl: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (
      data.documentType === "ID_CARD" &&
      (!data.backImageUrl || data.backImageUrl.trim() === "")
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["backImageUrl"],
        message: "Back image is required for ID Card",
      });
    }
  });

export type IdentityDocumentSchema = z.infer<
  typeof identityDocumentSchema
>;