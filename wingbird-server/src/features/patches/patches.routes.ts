

import { Hono } from "hono";
import { AppEnv } from "../../env";
import { requireReleaseAccess } from "../../middleware/release-access";
import { patchTable } from "../../db/schema";
import { desc, eq } from "drizzle-orm";
import UploadService from "../upload/upload.service";
import { HttpError } from "../../middleware/error";
import { requireAuth } from "../../middleware/auth";

const patchesRouter = new Hono<AppEnv>();
patchesRouter.use("*", requireAuth);

patchesRouter.post("/:releaseId/patches", async (c) => {
    const release = c.var.release;
    const db = c.var.db;

    const body = await c.req.json();

    const { upload_key, architecture, fileHash, fileName, fileSize, fileType } = body;

    const [latest] = await db.select({ patchNumber: patchTable.patchNumber }).from(patchTable).where(eq(patchTable.releaseId, release.id)).orderBy(desc(patchTable.patchNumber)).limit(1);

    const newPatchNumber = (latest?.patchNumber ?? 0) + 1;

    const uploadService = new UploadService(c.env);

    if(!await uploadService.validateArtifact(upload_key,{
        size: fileSize,
        type: fileType,
    })) {
      throw new HttpError("Artifact validation failed", 400);  
    }

   const [patch] = await db.insert(patchTable).values({
       architecture:architecture,
       artifactKey:upload_key,
       fileHash:fileHash,
       fileName:fileName,
       fileSize:fileSize,
       fileType:fileType,
       releaseId:release.id,
       patchNumber:newPatchNumber,
    }).returning();

    return c.json({ patch }, 201);
});

patchesRouter.get("/:releaseId/patches", requireReleaseAccess, async (c) => {
    const release = c.var.release;
    const db = c.var.db;

    const patches = await db.select().from(patchTable).where(eq(patchTable.releaseId, release.id));

    return c.json({ patches });
});



const patchesStandaloneRouter = new Hono<AppEnv>();
patchesStandaloneRouter.use("*", requireAuth);

patchesStandaloneRouter.get("/:patchId", async (c) => {
    const patchId = c.req.param("patchId");
    const db = c.var.db;

    const patch = await db.select().from(patchTable).where(eq(patchTable.id, patchId));

    return c.json({ patch });
});

patchesStandaloneRouter.delete("/:patchId", async (c) => {
    const patchId = c.req.param("patchId");
    const db = c.var.db;

    await db.delete(patchTable).where(eq(patchTable.id, patchId));

    return c.json({ message: "Patch deleted successfully" });
});



export { patchesRouter, patchesStandaloneRouter as standalonePatchesRouter };