import { z } from "zod";

const envSchema = z.object({
  BETTER_AUTH_SECRET: z
    .string()
    .min(32)
    .default("dev-secret-key-at-least-32-characters-long-for-development-only"),
  NEXT_BASE_API_URL: z.string().url().default("http://localhost:8085/api/v1"),
  NEXT_PUBLIC_BASE_API_URL: z
    .string()
    .url()
    .default("http://localhost:8080/api/v1"),
});


export const env = envSchema.parse({
  BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
  NEXT_BASE_API_URL: process.env.NEXT_BASE_API_URL,
  NEXT_PUBLIC_BASE_API_URL: process.env.NEXT_PUBLIC_BASE_API_URL,
});
