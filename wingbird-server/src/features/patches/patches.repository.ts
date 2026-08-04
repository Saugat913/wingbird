import { and, desc, eq, inArray } from "drizzle-orm";
import { DB, schema } from "../../db/db";
import { Architecture } from "../../types/architectures";

export class PatchesRepository {
  constructor(private db: DB) { }

  async create(data: {
    architecture: Architecture;
    patchNumber: number;
    releaseId: string;
    pendingUpload: schema.PendingUpload;
  }[]): Promise<schema.Patch[] | null> {

    const uploads = data.map((d) => {
      const uploadId = crypto.randomUUID();
      return {
        patch: {
          architecture: d.architecture,
          patchNumber: d.patchNumber,
          releaseId: d.releaseId,
          uploadId,
        },
        upload: {
          id: uploadId,
          appId: d.pendingUpload.appId,
          objectKey: d.pendingUpload.objectKey,
          fileName: d.pendingUpload.fileName,
          fileSize: d.pendingUpload.fileSize,
          fileHash: d.pendingUpload.fileHash,
          fileType: d.pendingUpload.fileType,
        },
        pendingId: d.pendingUpload.id,
      };
    });

    const [newPatches] = await this.db.batch([
      this.db
        .insert(schema.patchesTable)
        .values(uploads.map((d) => d.patch))
        .returning(),
      this.db
        .insert(schema.uploadsTable)
        .values(uploads.map((d) => d.upload))
        .returning(),
      this.db
        .delete(schema.pendingUploadsTable)
        .where(inArray(
          schema.pendingUploadsTable.id,
          uploads.map((d) => d.pendingId)
        ))
        .returning()]);

    return newPatches ?? null;
  }

  async getLatestPatchNumberByReleaseIdentity(
    data: {
      releaseId: string,
      architecture: Architecture;
    },
  ): Promise<number> {
    const [latestPatchNumber] = await this.db
      .select({
        patchNumber: schema.patchesTable.patchNumber,
      })
      .from(schema.patchesTable)
      .where(
        and(
          eq(schema.patchesTable.releaseId, data.releaseId),
          eq(schema.patchesTable.architecture, data.architecture),
        ),
      )
      .orderBy(desc(schema.patchesTable.patchNumber))
      .limit(1);

    return latestPatchNumber?.patchNumber ?? 0;
  }

  async getLatestPatchByReleaseIdentity(
    data: {
      releaseId: string,
      architecture: Architecture;
    },
  ): Promise<schema.Patch | null> {
    const [latestPatch] = await this.db
      .select()
      .from(schema.patchesTable)
      .where(
        and(
          eq(schema.patchesTable.releaseId, data.releaseId),
          eq(schema.patchesTable.architecture, data.architecture),
        ),
      )
      .orderBy(desc(schema.patchesTable.patchNumber))
      .limit(1);

    return latestPatch ?? null;
  }
}
