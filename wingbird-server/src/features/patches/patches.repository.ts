import { and, desc, eq } from "drizzle-orm";
import { DB, schema } from "../../db/db";
import { Architecture } from "../../types/architectures";

export class PatchesRepository {
  constructor(private db: DB) { }

  async create(data: {
    architecture: Architecture;
    patchNumber: number;
    releaseId: string;
    uploadId: string;
  }): Promise<schema.Patch | null> {
    const [newPatch] = await this.db
      .insert(schema.patchesTable)
      .values(data)
      .returning();

    return newPatch ?? null;
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
