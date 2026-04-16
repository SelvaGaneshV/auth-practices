import "dotenv/config";
import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  clientPrefix: "",
  client: {},
  server: {
    DATABASE_URL: z.string().min(1),
    SUPER_ADMIN_CORS_ORGIN: z.url(),
    ADMIN_CORS_ORGIN: z.url(),
    USER_CORS_ORGIN: z.url(),
    SUPER_ADMIN: z.string(),
    SUPER_ADMIN_PASS: z.string(),
    DATABASE_AUTH_TOKEN: z.string(),
    SECRET: z.string(),
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  },

  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
