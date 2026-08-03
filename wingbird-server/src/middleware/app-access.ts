import { createMiddleware } from "hono/factory";
import { eq, and } from "drizzle-orm";
import AppEnv from "../env";
import { appsTable } from "../db/apps";
import { BadRequestError, NotFoundError, UnauthorizedError } from "../error";

interface AppAccessOptions {
  requireOwnership?: boolean;
}

export const requireAppAccess = (options: AppAccessOptions = { requireOwnership: true }) =>
  createMiddleware<AppEnv>(async (c, next) => {
    const appId =
      c.req.param("appId") ||
      c.req.query("appId");

    if (!appId) {
      throw new BadRequestError("Missing appId");
    }

    const user = c.var.user;

    // what if app is already in context.
    // we just compare each ids and access user data and validate ownership
    // Why ? to avoid redundant database queries
    if (c.var.app && c.var.app.id === appId) {
      if (options.requireOwnership) {
        if (!user) {
          throw new UnauthorizedError();
        }
        if (c.var.app.userId !== user.id) {
          throw new NotFoundError("App");
        }
      }
      return next();
    }

    // Normal check the ownership with db queries
    const db = c.var.db;
    let app;

    if (options.requireOwnership) {
      if (!user) {
        throw new UnauthorizedError();
      }
      [app] = await db
        .select()
        .from(appsTable)
        .where(and(eq(appsTable.id, appId), eq(appsTable.userId, user.id)));
    } else {
      [app] = await db.select().from(appsTable).where(eq(appsTable.id, appId));
    }

    if (!app) {
      throw new NotFoundError("App");
    }

    c.set("app", app);
    await next();
  });

export default requireAppAccess;
