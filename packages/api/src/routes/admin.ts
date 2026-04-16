import { db } from "@auth-practices/db";
import { featureFlags, users } from "@auth-practices/db/schema/index";
import { zValidator } from "@hono/zod-validator";
import { and, eq, sql } from "drizzle-orm";
import { Hono } from "hono";
import { setCookie } from "hono/cookie";
import { env } from "process";
import z from "zod";
import { adminAuthMiddleware } from "../middleware/admin-auth-middleware";
import { authMiddleware } from "../middleware/auth-middleware";
import { orgCodeSchema } from "../schema";
import { comparePassword, hashPassword } from "../utils/hash";
import { signToken } from "../utils/jwt";

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
  .get("/introspect", (c) => c.json({ auth: !!c.var.user }))
  .post(
    "/create-feature-flag",
    zValidator(
      "json",
      z.object({
        featureKey: z.string().min(1),
        isEnabled: z.boolean().default(false),
      }),
    ),
    async (c) => {
      const { id } = c.var.user;
      const { featureKey, isEnabled } = c.req.valid("json");
      const exist = await db.query.featureFlags
        .findFirst({
          where: (v) => eq(v.featureKey, featureKey),
        })
        .then((r) => !!r);
      if (exist) return c.json({ message: "featureKey already exist" }, 400);

      const user = await db.query.users.findFirst({
        where: (t) => eq(t.id, id),
        columns: { organizationId: true },
      });

      if (!user) return c.json({ message: "User not found" }, 404);

      const posted = await db
        .insert(featureFlags)
        .values({ featureKey, isEnabled, organizationId: user.organizationId })
        .then((r) => !!r);

      if (!posted)
        return c.json({ message: "something went wrong when creating organisation" }, 500);
      return c.json({ posted });
    },
  )
  .get(
    "/get-feature-flags",
    zValidator(
      "query",
      z.object({
        page: z.coerce.number().min(1).default(1),
        pagesize: z.coerce.number().min(5).default(5),
      }),
    ),

    async (c) => {
      const { page, pagesize } = c.req.valid("query");
      const [list, totalResult] = await Promise.all([
        db
          .select({
            id: featureFlags.id,
            featureKey: featureFlags.featureKey,
            isEnabled: featureFlags.isEnabled,
            createdAt: featureFlags.createdAt,
          })
          .from(featureFlags)
          .limit(pagesize)
          .offset((page - 1) * pagesize),

        db.select({ count: sql<number>`count(*)` }).from(featureFlags),
      ]);

      const total = Number(totalResult[0]?.count ?? 0);
      const totalPages = Math.ceil(total / pagesize);

      return c.json({
        data: list,
        meta: {
          page,
          pagesize,
          total,
          totalPages,
        },
      });
    },
  )
  .patch(
    "/update-feature-flag/:id",
    zValidator(
      "param",
      z.object({
        id: z.string().min(1),
      }),
    ),
    zValidator(
      "json",
      z.object({
        isEnabled: z.boolean().optional(),
        featureKey: z.string().optional(),
      }),
    ),
    async (c) => {
      const { id } = c.req.valid("param");
      const body = c.req.valid("json");

      const updateData: Partial<typeof featureFlags.$inferInsert> = {};

      if (typeof body.isEnabled !== "undefined") updateData.isEnabled = body.isEnabled;

      if (typeof body.featureKey !== "undefined") updateData.featureKey = body.featureKey;

      if (Object.keys(updateData).length === 0)
        return c.json({ message: "No fields to update" }, 400);

      const result = await db
        .update(featureFlags)
        .set(updateData)
        .where(eq(featureFlags.id, id))
        .returning();

      const updated = !!result[0];

      return c.json({ updated });
    },
  )
  .delete(
    "delete-feature-flag/:id",
    zValidator(
      "param",
      z.object({
        id: z.string().min(1),
      }),
    ),
    async (c) => {
      const { id } = c.req.valid("param");

      const deleted = await db
        .delete(featureFlags)
        .where(eq(featureFlags.id, id))
        .then((r) => r.rowsAffected > 0);

      return c.json({ deleted });
    },
  );
