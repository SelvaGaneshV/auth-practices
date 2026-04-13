import { Hono } from "hono";
import { env } from "@auth-practices/env/server";
import { signToken, verifyToken } from "~/utils/jwt";
import { getCookie, setCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";
import { zValidator } from "@hono/zod-validator";
import z from "zod";

const superAdminAuthMiddleware = createMiddleware<{
  Variables: {
    user: { name: string; role: string };
  };
}>(async (c, next) => {
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

export const superAdmin = new Hono()
  .post(
    "/login",
    zValidator(
      "json",
      z.object({
        name: z.string(),
        password: z.string(),
      }),
    ),
    async (c) => {
      const { name, password } = c.req.valid("json");
      if (env.SUPER_ADMIN === name && env.SUPER_ADMIN_PASS === password) {
        const token = signToken({
          name: env.SUPER_ADMIN,
          role: "SPR_ADMIN",
        });
        setCookie(c, "a_tk", token, {
          httpOnly: true,
          sameSite: "Lax",
          secure: env.NODE_ENV === "production" ? true : false,
        });
        return c.json({ auth: true });
      }
      return c.json({ message: "Invalid credentials" }, 401);
    },
  )
  .get("/introspect", superAdminAuthMiddleware, (c) => c.json({ auth: !!c.var.user }));
