import { createMiddleware } from "hono/factory";
import type { AuthMiddlewareState } from "../types";

export const superAdminAuthMiddleware = createMiddleware<AuthMiddlewareState>(async (c, next) => {
  c.set("allowedReq", { role: "SPR_ADMIN", token: "sa_a_tk" });
  await next();
});
