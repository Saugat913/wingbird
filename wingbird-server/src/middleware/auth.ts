import { createMiddleware } from "hono/factory";
import { UnauthorizedError } from "../error";
import { initAuth } from "../lib/auth";
import AppEnv from "../env";

export const requireAuth = createMiddleware<AppEnv>(async (c, next) => {
  const auth = initAuth(c.env);

  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (!session) {
    throw new UnauthorizedError();
  }

  c.set("user", {
    ...session.user,
    image: session.user.image ?? null,
  });

  await next();
});
