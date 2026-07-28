import { createMiddleware } from "hono/factory";
import { AppEnv } from "../env";
import { patchTable } from "../db/patch";
import { releaseTable } from "../db/release";
import { and, eq } from "drizzle-orm";
import { appTable } from "../db/apps";
import { HttpError } from "./error";



const requirePatchAccess = createMiddleware<AppEnv>(async (c, next) => {
    const patchId = c.req.param("patchId");

    if (!patchId) {
        throw new HttpError("Patch ID is required", 400);
    }
    const db = c.var.db;
    const user = c.var.user;

    const [patch] = await db.select().from(patchTable)
        .innerJoin(releaseTable, eq(releaseTable.id, patchTable.releaseId))
        .innerJoin(appTable, eq(appTable.id, releaseTable.appId))
        .where(and(eq(patchTable.id, patchId), eq(appTable.userId, user.id)))
        .limit(1);

    if (!patch) {
        throw new HttpError("Patch not found or you don't have access to it", 404);
    }

    c.set("patch",patch.patch);

    await next();
})

export default requirePatchAccess;