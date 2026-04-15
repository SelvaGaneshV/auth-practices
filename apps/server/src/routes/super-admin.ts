import { db } from "@auth-practices/db";
import { organizations } from "@auth-practices/db/schema/index";
import { env } from "@auth-practices/env/server";
import { zValidator } from "@hono/zod-validator";
import { eq, sql } from "drizzle-orm";
import { Hono } from "hono";
import { setCookie } from "hono/cookie";
import z from "zod";
import { authMiddleware } from "~/middleware/auth-middleware";
import { superAdminAuthMiddleware } from "~/middleware/super-admin-auth-middleware";
import { orgCodeSchema } from "~/schema";
import { signToken } from "~/utils/jwt";

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
          id: "super_admin",
          name,
          role: "SPR_ADMIN",
        });
        setCookie(c, "a_tk", token, {
          httpOnly: true,
          sameSite: "Strict",
          secure: env.NODE_ENV === "production" ? true : false,
        });
        return c.json({ auth: true });
      }
      return c.json({ message: "Invalid credentials" }, 401);
    },
  )
  .use(authMiddleware)
  .use(superAdminAuthMiddleware)
  .get("/introspect", (c) => c.json({ auth: !!c.var.user }))
  .post(
    "/create-org",
    zValidator(
      "json",
      z.object({
        orgCode: orgCodeSchema,
        orgName: z.string().min(1, "Organisation name is required"),
      }),
    ),
    async (c) => {
      const { orgCode, orgName } = c.req.valid("json");
      const exist = await db.query.organizations
        .findFirst({
          where: (v) => eq(v.code, orgCode),
        })
        .then((r) => !!r);
      if (exist) return c.json({ message: "organisation code taken" }, 400);
      const posted = await db
        .insert(organizations)
        .values({ code: orgCode, name: orgName })
        .then((r) => !!r);
      if (!posted)
        return c.json({ message: "something went wrong when creating organisation" }, 500);
      return c.json({ posted });
    },
  )
  .get(
    "/get-orgs-list",
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
            name: organizations.name,
            code: organizations.code,
            createdAt: organizations.createdAt,
          })
          .from(organizations)
          .limit(pagesize)
          .offset((page - 1) * pagesize),

        db.select({ count: sql<number>`count(*)` }).from(organizations),
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
  );
