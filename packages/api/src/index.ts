import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { admin } from "./routes/admin";
import { superAdmin } from "./routes/super-admin";

export const createApi = (config: {
  SUPER_ADMIN_CORS_ORGIN: string;
  ADMIN_CORS_ORGIN: string;
  USER_CORS_ORGIN: string;
}) => {
  const app = new Hono()
    .use(logger())
    .use(
      "/*",
      cors({
        origin: [config.SUPER_ADMIN_CORS_ORGIN, config.ADMIN_CORS_ORGIN, config.USER_CORS_ORGIN],
        credentials: true,
        allowMethods: ["GET", "POST", "OPTIONS", "PATCH", "DELETE"],
      }),
    )
    .use(
      "/super-admin/*",
      cors({
        origin: config.SUPER_ADMIN_CORS_ORGIN,
        credentials: true,
        allowMethods: ["GET", "POST", "OPTIONS"],
      }),
    )
    .route("/super-admin", superAdmin)
    .use(
      "/admin/*",
      cors({
        origin: config.ADMIN_CORS_ORGIN,
        credentials: true,
        allowMethods: ["GET", "POST", "OPTIONS", "PATCH", "DELETE"],
      }),
    )
    .route("/admin", admin);

  return app;
};
