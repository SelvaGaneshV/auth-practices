import { createApi } from "@auth-practices/api";
import { Hono } from "hono";

import { env } from "@auth-practices/env/server";
if (!env.SUPER_ADMIN_CORS_ORGIN) {
  throw new Error("Missing SUPER_ADMIN_CORS_ORGIN");
}
const api = createApi();

const app = new Hono();

app.get("/", (c) => c.text("Hello world"));

app.route("/", api);

export const includeFiles = "../../packages/**";

export default app;
