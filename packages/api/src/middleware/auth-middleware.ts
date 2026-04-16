import { getCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";
import type { AuthMiddlewareState } from "../types";
import { verifyToken } from "../utils/jwt";

export const authMiddleware = createMiddleware<AuthMiddlewareState>(async (c, next) => {
  const token = getCookie(c, "a_tk");
  if (!token) return c.json({ message: "Invalid credentials" }, 401);
  try {
    const user = verifyToken(token);
    c.set("user", user as any);
    await next();
  } catch (e) {
    console.error(e);
    return c.json({ message: "Invalid credentials" }, 401);
  }
});
