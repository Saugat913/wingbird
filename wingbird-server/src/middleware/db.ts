import { createMiddleware } from "hono/factory";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "../db/schema";
import type { AppEnv } from "../env";

export const dbMiddleware = createMiddleware<AppEnv>(async (c, next) => {
  c.set("db", drizzle(c.env.wingbird_db, { schema }));
  await next();
});