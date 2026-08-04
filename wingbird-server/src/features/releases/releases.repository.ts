import { and, eq } from "drizzle-orm";
import { DB, schema } from "../../db/db";
import { ReleaseIdentity } from "../../types/release-identity";

export class ReleasesRepository {
  constructor(private db: DB) {}

  async create(
    data: ReleaseIdentity & {
      pendingUpload: schema.PendingUpload;
    },
  ): Promise<schema.Release | null> {
    const newUploadUuid= crypto.randomUUID();
    
    const [[newRelease]] = await this.db.batch([
      this.db
        .insert(schema.releasesTable)
        .values({
          appId: data.appId,
          version: data.version,
          platform: data.platform,
          channel: data.channel,
          uploadId: newUploadUuid,
        })
        .returning(),
      this.db
        .insert(schema.uploadsTable)
        .values({ ...data.pendingUpload, id: newUploadUuid })
        .returning(),
      this.db
        .delete(schema.pendingUploadsTable)
        .where(eq(schema.pendingUploadsTable.id, data.pendingUpload.id))
        .returning()
    ]);

    return newRelease ?? null;
  }

  async getByReleaseIdentity(
    data: ReleaseIdentity,
  ): Promise<schema.Release | null> {
    const [release] = await this.db
      .select()
      .from(schema.releasesTable)
      .where(
        and(
          eq(schema.releasesTable.appId, data.appId),
          eq(schema.releasesTable.version, data.version),
          eq(schema.releasesTable.channel, data.channel),
          eq(schema.releasesTable.platform, data.platform),
        ),
      )
      .limit(1);

    return release ?? null;
  }
}
