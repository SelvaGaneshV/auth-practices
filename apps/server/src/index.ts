import { env } from "@auth-practices/env/server";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { admin } from "./routes/admin";
import { superAdmin } from "./routes/super-admin";

const app = new Hono()
  .use(logger())
  .use(
    "/*",
    cors({
      origin: [env.SUPER_ADMIN_CORS_ORGIN, env.ADMIN_CORS_ORGIN, env.USER_CORS_ORGIN],
      credentials: true,
      allowMethods: ["GET", "POST", "OPTIONS", "PATCH", "DELETE"],
    }),
  )
  .use(
    "/super-admin/*",
    cors({
      origin: env.SUPER_ADMIN_CORS_ORGIN,
      credentials: true,
      allowMethods: ["GET", "POST", "OPTIONS"],
    }),
  )
  .route("/super-admin", superAdmin)
  .use(
    "/admin/*",
    cors({
      origin: env.ADMIN_CORS_ORGIN,
      credentials: true,
      allowMethods: ["GET", "POST", "OPTIONS", "PATCH", "DELETE"],
    }),
  )
  .route("/admin", admin);

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);

export type Api = typeof app;
