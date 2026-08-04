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
   
    const newUploadUuid= crypto.randomUUID();

    const [newPatches] = await this.db.batch([
        this.db
        .insert(schema.patchesTable)
        .values(data.map((d) => ({
          architecture: d.architecture,
          patchNumber: d.patchNumber,
          releaseId: d.releaseId,
          uploadId: newUploadUuid,
        })))
        .returning(),
      this.db
        .insert(schema.uploadsTable)
        .values(data.map((d) => ({...d.pendingUpload, id: newUploadUuid})))
        .returning(),
      this.db
        .delete(schema.pendingUploadsTable)
        .where(inArray(
          schema.pendingUploadsTable.id,
          data.map((d) => d.pendingUpload.id)
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
