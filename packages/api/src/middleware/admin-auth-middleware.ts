import { createMiddleware } from "hono/factory";
import type { AuthMiddlewareState } from "../types";

export const adminAuthMiddleware = createMiddleware<AuthMiddlewareState>(async (c, next) => {
  c.set("allowedReq", { role: "ORG_ADMIN", token: "a_a_tk" });
  await next();
});
