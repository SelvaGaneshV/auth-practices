import { getCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";
import type { AuthMiddlewareState } from "../types";
import { verifyToken } from "../utils/jwt";

export const authMiddleware = createMiddleware<AuthMiddlewareState>(async (c, next) => {
  const allowed = c.var.allowedReq;
  if (!allowed) return c.json({ message: "Invalid credentials" }, 401);
  const token = getCookie(c, allowed.token);

  if (!token) return c.json({ message: "Invalid credentials" }, 401);
  try {
    const user = verifyToken(token);
    if (user.role !== allowed.role) return c.json({ message: "You are not permited" }, 403);
    c.set("user", user as any);
    await next();
  } catch (e) {
    console.error(e);
    return c.json({ message: "Invalid credentials" }, 401);
  }
});
