import { createMiddleware } from "hono/factory";
import type { AuthMiddlewareState } from "../types";

export const userAuthMiddleware = createMiddleware<AuthMiddlewareState>(async (c, next) => {
  c.set("allowedReq", { role: "ORG_USER", token: "u_a_tk" });
  await next();
});
