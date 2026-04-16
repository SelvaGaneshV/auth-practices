import { createApi } from "@auth-practices/api";
import { Hono } from "hono";
import { env } from "@auth-practices/env/server";

const api = createApi({
  SUPER_ADMIN_CORS_ORGIN: env.SUPER_ADMIN_CORS_ORGIN,
  ADMIN_CORS_ORGIN: env.ADMIN_CORS_ORGIN,
  USER_CORS_ORGIN: env.USER_CORS_ORGIN,
});

const app = new Hono().route("/*", api);

export default app;
