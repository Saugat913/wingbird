import { and, eq } from "drizzle-orm";
import { DB, schema } from "../../db/db";
import { ReleaseIdentity } from "../../types/release-identity";

export class ReleasesRepository {
  constructor(private db: DB) {}

  async create(
    data: ReleaseIdentity & {
      uploadId: string;
    },
  ): Promise<schema.Release | null> {
    const [newRelease] = await this.db
      .insert(schema.releasesTable)
      .values(data)
      .returning();

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
