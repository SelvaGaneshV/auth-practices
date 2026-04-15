import { createMiddleware } from "hono/factory";
import type { AuthMiddlewareState } from "~/types";

export const adminAuthMiddleware = createMiddleware<AuthMiddlewareState>(async (c, next) => {
  const user = c.var.user;
  if (user.role !== "ORG_ADMIN") return c.json({ message: "You are not permited" }, 403);
  await next();
});
