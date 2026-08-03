import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().min(1),
  AUTH_SECRET: z.string().min(32),
  DEFAULT_TIME_ZONE: z.string().default("America/El_Salvador"),
  DEFAULT_CURRENCY: z.string().length(3).default("USD"),
});

export const env = envSchema.parse(process.env);
