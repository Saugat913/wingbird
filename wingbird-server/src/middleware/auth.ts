import { createMiddleware } from "hono/factory";
import { decodeProtectedHeader, importJWK, jwtVerify } from "jose";
import { AppEnv } from "../env";
import { HttpError } from "./error";

export const requireAuth = createMiddleware<AppEnv>(async (c, next) => {
  const token = c.req.header("authorization")?.replace("Bearer ", "");

  if (!token) {
    throw new HttpError("Unauthorized", 401);
  }

  try {
    const { kid } = decodeProtectedHeader(token);

    const jwk = await c.var.db.query.jwks.findFirst({
      where: (t, { eq }) => eq(t.id, kid!),
    });

    if (!jwk) throw new Error("Invalid key");

    const key = await importJWK(JSON.parse(jwk.publicKey), "EdDSA");

    const { payload } = await jwtVerify(token, key);

    c.set("user", {
      id: String(payload.id ?? payload.sub),
      name: String(payload.name),
      email: String(payload.email),
      image: payload.image as string | undefined,
    });

    await next();
  } catch (err) {
    console.error("Auth error:", err);
    throw new HttpError("Unauthorized", 401);
  }
});