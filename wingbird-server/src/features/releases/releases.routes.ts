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

releasesRouter.get("/:appId/releases", async (c) => {
    const appId = c.req.param("appId");
    const db = c.var.db;
    const version = c.req.query("version");
    const platform = c.req.query("platform");
    const channel = c.req.query("channel");

    let releases = await db.select().from(releaseTable).where(eq(releaseTable.appId, appId));
    
    if (version) {
        releases = releases.filter(r => r.releaseVersion === version);
    }
    if (platform) {
        releases = releases.filter(r => r.platform.toLowerCase() === platform.toLowerCase());
    }
    if (channel) {
        releases = releases.filter(r => r.channel.toLowerCase() === channel.toLowerCase());
    }

    return c.json({ releases });
});


releasesRouter.post("/:appId/releases", requireAuth, requireAppAccess, async (c) => {
    const app= c.var.app;
    const db= c.var.db;


    const body = await c.req.json();
    const { upload_key, release_version, platform, channel, fileHash, fileName, fileSize, fileType } = body;
    

    // Lets validate the artifacts 
    const uploadService= new UploadService(c.env);

    if(!await uploadService.validateArtifact(upload_key, { size: fileSize, type: fileType })){
        throw new HttpError("Artifact validation failed", 400);
    }


    const [release]= await db.insert(releaseTable).values({
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

releasesStandaloneRouter.get("/:releaseId", async (c) => {
    const releaseId = c.req.param("releaseId");
    const db = c.var.db;
    const [release] = await db.select().from(releaseTable).where(eq(releaseTable.id, releaseId));
    if (!release) {
        throw new HttpError("Release not found", 404);
    }
    return c.json({ release });
});

releasesStandaloneRouter.delete("/:releaseId", requireAuth, requireReleaseAccess, async (c) => {
    const release = c.var.release;
    const db = c.var.db;
    
    const [deletedRelease] = await db.delete(releaseTable).where(eq(releaseTable.id, release.id)).returning();
    
    if (!deletedRelease) {
        throw new HttpError("Release not found", 404);
    }
    
    return c.json({ release: deletedRelease });
});

export { releasesRouter, releasesStandaloneRouter };