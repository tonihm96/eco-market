import { z } from "zod";

const optionalString = z
  .string()
  .optional()
  .transform((value) => (value === undefined || value.trim() === "" ? undefined : value));

const envSchema = z.object({
  // Server
  SERVER_PORT: z.coerce.number().min(1).max(65535).default(3333),
  CORS_ORIGINS: z
    .string()
    .default("http://localhost:5173,http://localhost:8081")
    .transform((value) => value.split(",").map((origin) => origin.trim())),

  // Better Auth
  BETTER_AUTH_SECRET: z.string().min(32, "BETTER_AUTH_SECRET must have at least 32 chars"),
  BETTER_AUTH_URL: z.url(),
  MOBILE_APP_SCHEME: z.string().default("ecomarket"),

  // Resend (optional)
  RESEND_API_KEY: optionalString,
  RESEND_FROM_EMAIL: z.email().default("onboarding@resend.dev"),

  // Google OAuth (optional)
  GOOGLE_CLIENT_ID: optionalString,
  GOOGLE_CLIENT_SECRET: optionalString,

  // Payment gateway
  PAYMENT_GATEWAY: z.enum(["fake"]).default("fake"),

  // Database
  DATABASE_URL: z.url().startsWith("postgresql://"),
});

export type Env = z.infer<typeof envSchema>;

const env = envSchema.parse(process.env);

export default env;
