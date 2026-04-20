import { Hono } from "hono";

import { env } from "@auth-practices/env/server";
if (!env.SUPER_ADMIN_CORS_ORGIN) {
  throw new Error("Missing SUPER_ADMIN_CORS_ORGIN");
}

const app = new Hono();

app.get("/", (c) => c.text("Hello world"));

export const includeFiles = "../../packages/**";

export default app;
