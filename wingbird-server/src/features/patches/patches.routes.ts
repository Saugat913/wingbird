

import { Hono } from "hono";
import { AppEnv } from "../../env";
import { requireReleaseAccess } from "../../middleware/release-access";
import { patchTable, releaseTable } from "../../db/schema";
import { desc, eq, and } from "drizzle-orm";
import UploadService from "../upload/upload.service";
import { HttpError } from "../../middleware/error";
import { requireAuth } from "../../middleware/auth";
import { Platforms } from "../../db/types/platforms";
import { Architectures } from "../../db/types/architecture";
import { Channels } from "../../db/types/channel";

const patchesRouter = new Hono<AppEnv>();
patchesRouter.use("*", requireAuth);

patchesRouter.post("/:releaseId/patches",requireReleaseAccess, async (c) => {
    const release = c.var.release;
    const db = c.var.db;

    const body = await c.req.json();

    const { artifacts } = body;
    const [latest] = await db.select({ patchNumber: patchTable.patchNumber }).from(patchTable).where(eq(patchTable.releaseId, release.id)).orderBy(desc(patchTable.patchNumber)).limit(1);

    const newPatchNumber = (latest?.patchNumber ?? 0) + 1;
    const uploadService = new UploadService(c.env);

    const patches = await db.transaction(async (tx) => {
        const values = [];

        for (const artifact of artifacts) {
            const { upload_key, architecture, fileHash, fileName, fileSize, fileType } = artifact;

            if (!await uploadService.validateArtifact(upload_key, {
                size: fileSize,
                type: fileType,
            })) {
                throw new HttpError("Artifact validation failed", 400);
            }

            values.push({
                architecture: architecture,
                artifactKey: upload_key,
                fileHash: fileHash,
                fileName: fileName,
                fileSize: fileSize,
                fileType: fileType,
                releaseId: release.id,
                patchNumber: newPatchNumber,
            });
        }

        const patches = await tx.insert(patchTable).values(values).returning();
        return patches;
    });

    return c.json({ patches }, 201);
});

patchesRouter.get("/:releaseId/patches", requireReleaseAccess, async (c) => {
    const release = c.var.release;
    const db = c.var.db;

    const patches = await db.select().from(patchTable).where(eq(patchTable.releaseId, release.id));

    return c.json({ patches });
});



const patchesStandaloneRouter = new Hono<AppEnv>();
patchesStandaloneRouter.use("*", requireAuth);

patchesStandaloneRouter.get("/", async (c) => {
    const db = c.var.db;

    const channel = c.req.query("channel") as Channels;
    const platform = c.req.query("platform") as Platforms;
    const architecture = c.req.query("architecture") as Architectures;

    if (!channel || !platform || !architecture) {
        throw new HttpError("Missing required query parameters", 400);
    }


    const patches = await db.select().from(patchTable).innerJoin(releaseTable, eq(patchTable.releaseId, releaseTable.id)).where(
        and(
            eq(releaseTable.channel, channel),
            eq(releaseTable.platform, platform),
            eq(patchTable.architecture, architecture),
        )
    );

    return c.json({ patches });
});

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