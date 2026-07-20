import { Hono } from "hono";import ui from "./ui";
import type { AppEnv } from "./env";
import { errorHandler } from "./middleware/error";
import { dbMiddleware } from "./middleware/db";
import { authRouter } from "./features/auth/auth.routes";
import { requireAuth } from "./middleware/auth";

const app = new Hono<AppEnv>();


app.onError(errorHandler);
app.use("*", dbMiddleware);

app.route("/", ui);
app.route("/api/auth", authRouter);

app.get("/api/health", (c) => {
  return c.json({ status: "ok" });
});

app.get("/api/whoami", requireAuth,(c) => {
  return c.json({ user: c.get("user") });
});

export default app;
