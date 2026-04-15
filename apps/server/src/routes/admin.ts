import { db } from "@auth-practices/db";
import { users } from "@auth-practices/db/schema/index";
import { zValidator } from "@hono/zod-validator";
import { and, eq } from "drizzle-orm";
import { Hono } from "hono";
import { setCookie } from "hono/cookie";
import { env } from "process";
import z from "zod";
import { adminAuthMiddleware } from "~/middleware/admin-auth-middleware";
import { authMiddleware } from "~/middleware/auth-middleware";
import { orgCodeSchema } from "~/schema";
import { comparePassword, hashPassword } from "~/utils/hash";
import { signToken } from "~/utils/jwt";

export const admin = new Hono()
  .post(
    "/sign-up",
    zValidator(
      "json",
      z.object({
        orgCode: orgCodeSchema,
        email: z.email(),
        name: z.string().min(1),
        password: z.string().min(6),
      }),
    ),
    async (c) => {
      const { email, name, orgCode, password } = c.req.valid("json");
      const exist = await db.query.users
        .findFirst({
          where: (t) => eq(t.email, email),
        })
        .then((r) => !!r);
      console.log(exist);
      if (exist) return c.json({ message: "User already exist" }, 409);
      const orgId = await db.query.organizations
        .findFirst({
          where: (t) => eq(t.code, orgCode),
          columns: {
            id: true,
          },
        })
        .then((r) => r?.id);
      if (!orgId) return c.json({ message: "Organisation not found" }, 404);

      const roleId = await db.query.roles
        .findFirst({
          where: (t) => eq(t.role, "ORG_ADMIN"),
          columns: {
            id: true,
          },
        })
        .then((r) => r?.id);
      if (!roleId) return c.json({ message: "Role not found" }, 404);
      const user = await db
        .insert(users)
        .values({
          email,
          name,
          password: await hashPassword(password),
          roleId,
          organizationId: orgId,
        })
        .returning({ id: users.id });

      if (user && user.length === 1 && user[0]) {
        const token = signToken({ name, id: user[0].id, role: "ORG_ADMIN" });

        setCookie(c, "a_tk", token, {
          httpOnly: true,
          sameSite: "Strict",
          secure: env.NODE_ENV === "production" ? true : false,
        });
        return c.json({ created: true });
      }
      return c.json({ created: false });
    },
  )
  .post(
    "/sigin-in",
    zValidator(
      "json",
      z.object({
        orgCode: orgCodeSchema,
        email: z.email(),
        password: z.string(),
      }),
    ),
    async (c) => {
      const { email, orgCode, password } = c.req.valid("json");
      const orgId = await db.query.organizations
        .findFirst({
          where: (t) => eq(t.code, orgCode),
          columns: {
            id: true,
          },
        })
        .then((r) => r?.id);
      if (!orgId) return c.json({ message: "Organisation not found" }, 404);
      const user = await db.query.users.findFirst({
        where: (t) => and(eq(t.email, email), eq(t.organizationId, orgId)),
        columns: {
          id: true,
          name: true,
          password: true,
        },
      });
      if (!user) return c.json({ message: "User not found" }, 404);

      const isSameUser = await comparePassword(password, user.password);
      if (!isSameUser) return c.json({ message: "Invalid Crential" }, 401);

      const token = signToken({ name: user.name, id: user.id, role: "ORG_ADMIN" });

      setCookie(c, "a_tk", token, {
        httpOnly: true,
        sameSite: "Strict",
        secure: env.NODE_ENV === "production" ? true : false,
      });

      return c.json({ auth: true });
    },
  )
  .use(authMiddleware)
  .use(adminAuthMiddleware)
  .get("/introspect", (c) => c.json({ auth: !!c.var.user }));
