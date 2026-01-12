import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    AUTH_SECRET:
      process.env.NODE_ENV === "production"
        ? z.string()
        : z.string().optional(),
    AUTH_URL: z.preprocess(
      // This makes Vercel deployments not fail if you don't set NEXTAUTH_URL
      // Since NextAuth.js automatically uses the VERCEL_URL if present.
      (str) => process.env.VERCEL_URL ?? str,
      // VERCEL_URL doesn't include `https` so it cant be validated as a URL
      process.env.VERCEL ? z.string() : z.string().url(),
    ),
    DISCORD_CLIENT_ID: z.string(),
    DISCORD_CLIENT_SECRET: z.string(),
    DISCORD_WEBHOOK_URL: z.string().url(), // TO BE REMOVEDV
    BOT_SECRET: z.string(),
    BOT_URL: z.string().url(),
    DATABASE_URL: z.string().url(),
    DIRECT_URL: z.string().url(),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
  },

  client: {
    // NEXT_PUBLIC_CLIENTVAR: z.string(),
  },

  runtimeEnv: {
    AUTH_SECRET: process.env.AUTH_SECRET,
    AUTH_URL: process.env.AUTH_URL,
    DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID,
    DISCORD_CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET,
    DISCORD_WEBHOOK_URL: process.env.DISCORD_WEBHOOK_URL, // TO BE REMOVED
    BOT_SECRET: process.env.BOT_SECRET,
    BOT_URL: process.env.BOT_URL,
    DATABASE_URL: process.env.DATABASE_URL,
    DIRECT_URL: process.env.DIRECT_URL,
    NODE_ENV: process.env.NODE_ENV,
  },

  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});
