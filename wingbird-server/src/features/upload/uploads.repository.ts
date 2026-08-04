import { and, eq } from "drizzle-orm";
import { DB, schema } from "../../db/db";
import { UploadMetadata } from "../../types/upload-metadata";


export class UploadRepository {
    constructor(private readonly db: DB) { }

    async createPending(data: UploadMetadata & {
        appId: string,
        objectKey: string
    }): Promise<schema.PendingUpload | null> {
        const [upload] = await this.db
            .insert(schema.pendingUploadsTable)
            .values(data)
            .returning();

        return upload ?? null;
    }

    async getPendingById(
        id: string,
        appId: string
    ): Promise<schema.PendingUpload | null> {
        const [upload] = await this.db
            .select()
            .from(schema.pendingUploadsTable)
            .where(and(
                eq(schema.pendingUploadsTable.id, id),
                eq(schema.pendingUploadsTable.appId, appId)
            ))
            .limit(1);

        return upload ?? null;
    }

    async createUpload(
        data: UploadMetadata & {
            appId: string,
            objectKey: string
        },
    ): Promise<schema.Upload | null> {
        const [upload] = await this.db
            .insert(schema.uploadsTable)
            .values(data)
            .returning();

        return upload ?? null;
    }

    async deletePending(id: string, appId: string): Promise<boolean> {
        const [deleted] = await this.db
            .delete(schema.pendingUploadsTable)
            .where(and(
                eq(schema.pendingUploadsTable.id, id),
                eq(schema.pendingUploadsTable.appId, appId)
            ))
            .returning();

        return !!deleted;
    }

    async getUploadById(
        id: string,
        appId: string,
    ): Promise<schema.Upload | null> {
        const [upload] = await this.db
            .select()
            .from(schema.uploadsTable)
            .where(and(
                eq(schema.uploadsTable.id, id),
                eq(schema.uploadsTable.appId, appId)
            ))
            .limit(1);

        return upload ?? null;
    }
}