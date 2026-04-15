import { db } from "@auth-practices/db";
import { organizations } from "@auth-practices/db/schema/index";
import { env } from "@auth-practices/env/server";
import { zValidator } from "@hono/zod-validator";
import { eq, sql } from "drizzle-orm";
import { Hono } from "hono";
import { getCookie, setCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";
import z from "zod";
import { signToken, verifyToken } from "~/utils/jwt";

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
  .get("/introspect", superAdminAuthMiddleware, (c) => c.json({ auth: !!c.var.user }))
  .post(
    "/create-org",
    superAdminAuthMiddleware,
    zValidator(
      "json",
      z.object({
        orgCode: z
          .string()
          .transform((val) => val.toUpperCase())
          .refine((val) => /^OG\d+$/.test(val), {
            message: "Must start with 'OG' followed by only numbers",
          }),
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
    superAdminAuthMiddleware,
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
