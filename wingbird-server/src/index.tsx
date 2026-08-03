import { Hono } from "hono";
import ui from "./ui";

import { requireAuth } from "./middleware/auth";
import authRouter from "./features/auth/auth.routes";
import uploadRouter from "./features/upload/upload.routes";
import appsRouter from "./features/apps/apps.routes";
import { releasesRouter, releasesStandaloneRouter } from "./features/releases/releases.routes";
import { patchesRouter, standalonePatchesRouter } from "./features/patches/patches.routes";
import AppEnv from "./env";
import { errorHandler } from "./error";
import { createDb } from "./db/db";

const app = new Hono<AppEnv>();

app.onError(errorHandler);
app.use("*", (c, next) => {
  const db = createDb(c.env.wingbird_db);
  c.set("db", db);
  return next();
});

app.route("/", ui);
app.route("/api/auth", authRouter);
app.route("/api/uploads", uploadRouter);
app.route("/api/apps", appsRouter);

app.route("/api/apps", releasesRouter);
app.route("/api/releases", releasesStandaloneRouter);
app.route("/api/releases", patchesRouter);
app.route("/api/patches", standalonePatchesRouter);

app.get("/api/health", (c) => {
  return c.json({ status: "ok" });
});

app.get("/api/whoami", requireAuth, (c) => {
  return c.json({ user: c.get("user") });
});

export default app;
