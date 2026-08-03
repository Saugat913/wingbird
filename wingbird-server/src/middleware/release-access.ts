import { createMiddleware } from "hono/factory";
import { AppEnv } from "../env";
import { appTable } from "../db/apps";
import { userTable } from "../db/auth";
import { and, eq } from "drizzle-orm";
import { releaseTable } from "../db/releases";

export const requireReleaseAccess = createMiddleware<AppEnv>(async (c, next) => {

    const db = c.var.db;
    const user= c.var.user;

    const releaseId = c.req.param("releaseId");

    if(!releaseId){
        return c.json({ error: "Release ID is required" }, 400);
    }
    
    const [release]= await db.select().from(releaseTable).innerJoin(appTable,eq(releaseTable.appId, appTable.id)).where(and(eq(releaseTable.id, releaseId), eq(appTable.userId, user.id)));

    if(!release){
        return c.json({ error: "Release not found" }, 404);
    }
    

    c.set("release",release.release);
    await next();
});
