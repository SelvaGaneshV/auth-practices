import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { admin } from "./routes/admin";
import { superAdmin } from "./routes/super-admin";
import { user } from "./routes/user";
import { env } from "@auth-practices/env/server";

export const createApi = () => {
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
    .route("/admin", admin)
    .use(
      "/user/*",
      cors({
        origin: env.USER_CORS_ORGIN,
        credentials: true,
        allowMethods: ["GET", "POST", "OPTIONS", "PATCH", "DELETE"],
      }),
    )
    .route("/user", user);

  return app;
};

export type ApiType = ReturnType<typeof createApi>;
