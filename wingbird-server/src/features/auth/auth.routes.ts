import { Hono } from "hono";
import { AppEnv } from "../../env";
import { initAuth } from "../../lib/auth";


const authRouter = new Hono<AppEnv>();

authRouter.on(["GET", "POST"], "/*", async (c) => {
  console.log(`Incoming request URL: ${c.req.raw.url}`);
  const auth = initAuth(c.env);
  return auth.handler(c.req.raw);
});


export { authRouter };