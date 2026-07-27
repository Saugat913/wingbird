import { Hono } from "hono";
import { AppEnv } from "../../env";
import { requireAuth } from "../../middleware/auth";
import { appTable, releaseTable, userTable as UserTable } from "../../db/schema";
import { and, eq } from "drizzle-orm";
import requireAppAccess from "../../middleware/app-access";
import UploadService from "../upload/upload.service";
import { HttpError } from "../../middleware/error";
import { requireReleaseAccess } from "../../middleware/release-access";

const releasesRouter= new Hono<AppEnv>();

releasesRouter.use("*",requireAuth,requireAppAccess);

releasesRouter.get("/:appId/releases",async (c) => {

    const app= c.var.app;
    const db=c.var.db;

    const releases= await db.select().from(releaseTable).where(eq(releaseTable.appId,app.id));

    return c.json({ releases });
});


releasesRouter.post("/:appId/releases",async (c) => {
    const app= c.var.app;
    const db= c.var.db;


    const body = await c.req.json();
    const { upload_key, release_version, platform, channel, fileHash, fileName, fileSize, fileType } = body;
    

    // Lets validate the artifacts 
    const uploadService= new UploadService(c.env);

    if(!await uploadService.validateArtifact(upload_key, { size: fileSize, type: fileType })){
        throw new HttpError("Artifact validation failed", 400);
    }


    const release= await db.insert(releaseTable).values({
        id: crypto.randomUUID(),
        appId:app.id,
        artifactKey: upload_key,
        releaseVersion: release_version,
        platform: platform,
        channel: channel,
        fileHash:fileHash,
        fileName:fileName,
        fileSize:fileSize,
        fileType:fileType,
    }).returning();

    return c.json({ release },201);
});



const releasesStandaloneRouter= new Hono<AppEnv>();
releasesStandaloneRouter.use("*",requireAuth,requireReleaseAccess);

releasesStandaloneRouter.get("/:releaseId", async (c) => {
    const release = c.var.release;
    return c.json({ release });
});

releasesStandaloneRouter.delete("/:releaseId", async (c) => {
    const release = c.var.release;
    const db = c.var.db;
    
    const [deletedRelease] = await db.delete(releaseTable).where(eq(releaseTable.id, release.id)).returning();
    
    if (!deletedRelease) {
        throw new HttpError("Release not found", 404);
    }
    
    return c.json({ release: deletedRelease });
});

export { releasesRouter, releasesStandaloneRouter };