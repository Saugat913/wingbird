import { OpenAPIHono } from "@hono/zod-openapi";
import ui from "./ui";

import { requireAuth } from "./middleware/auth";
import authRouter from "./features/auth/auth.routes";
import AppEnv from "./env";
import { errorHandler } from "./error";
import { createDb } from "./db/db";
import { swaggerUI } from "@hono/swagger-ui";
import { logger } from "hono/logger";
import { appsRouter } from "./features/apps/apps.routes";

const app = new OpenAPIHono<AppEnv>();

app.onError(errorHandler);
app.use(logger());
app.use("*", (c, next) => {
  const db = createDb(c.env.wingbird_db);
  c.set("db", db);
  return next();
});




app.route("/", ui);
app.route("/api/auth", authRouter);
// app.route("/api/uploads", uploadRouter);
app.route("/api/apps", appsRouter);

// app.route("/api/apps", releasesRouter);
// app.route("/api/releases", releasesStandaloneRouter);
// app.route("/api/releases", patchesRouter);
// app.route("/api/patches", standalonePatchesRouter);

app.get("/api/health", (c) => {
  return c.json({ status: "ok" });
});

app.get("/api/whoami", requireAuth, (c) => {
  return c.json({ user: c.get("user") });
});


app.doc("/openapi.json", {
  openapi: "3.1.0",
  info: {
    title: "Wingbird API",
    version: "1.0.0",
    description: "Wingbird Patch Distribution API",
  },
});

app.get(
  "/docs",
  swaggerUI({
    url: "/openapi.json",
    title:"Wingbird Api"
  }),
);
export default app;
