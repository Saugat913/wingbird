import { Hono } from "hono";
import { AppEnv } from "../../env";
import { requireAuth } from "../../middleware/auth";
import { appTable, releaseTable, userTable as UserTable } from "../../db/schema";
import { and, eq } from "drizzle-orm";
import requireAppAccess from "../../middleware/app-access";
import UploadService from "../upload/upload.service";
import { HttpError } from "../../middleware/error";
import { requireReleaseAccess } from "../../middleware/release-access";
import { Platforms } from "../../types/platforms";
import { Channels } from "../../types/channels";

const releasesRouter= new Hono<AppEnv>();

releasesRouter.use("*", requireAuth);

releasesRouter.get("/:appId/releases", requireAppAccess, async (c) => {
    const appId = c.var.app.id;
    const db = c.var.db;
    const version = c.req.query("version");
    const platform = c.req.query("platform") as Platforms;
    const channel = c.req.query("channel") as Channels;

    const filter= [eq(releaseTable.appId, appId)]
    
    if (version) {
       filter.push(eq(releaseTable.releaseVersion, version))
    }
    if (platform) {
        filter.push(eq(releaseTable.platform, platform))
    }
    if (channel) {
        filter.push(eq(releaseTable.channel, channel))
    }

    let releases = await db.select().from(releaseTable).where(and(...filter));

    return c.json({ releases });
});


releasesRouter.post("/:appId/releases", requireAppAccess, async (c) => {
    const app= c.var.app;
    const db= c.var.db;


    const body = await c.req.json();
    const { upload_key, release_version, platform, channel, fileHash, fileName, fileSize, fileType } = body;
    

    const uploadService= new UploadService(c.env);

    await uploadService.validateArtifact(upload_key, { size: fileSize, type: fileType });


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

releasesStandaloneRouter.use("*", requireAuth);

releasesStandaloneRouter.get("/:releaseId", requireReleaseAccess, async (c) => {
    const release = c.var.release;
    return c.json({ release });
});

releasesStandaloneRouter.delete("/:releaseId", requireReleaseAccess, async (c) => {
    const release = c.var.release;
    const db = c.var.db;
    
    const [deletedRelease] = await db.delete(releaseTable).where(eq(releaseTable.id, release.id)).returning();
    
    if (!deletedRelease) {
        throw new HttpError("Release not found", 404);
    }
    
    return c.json({ release: deletedRelease });
});

export { releasesRouter, releasesStandaloneRouter };