import { and, eq } from "drizzle-orm";
import { DB, schema } from "../../db/db";

export class AppsRepository {
    constructor(private db: DB) { }

    async create(data: {
        name: string;
        userId: string;
    }): Promise<schema.App | null> {
        const [newApp] = await this.db
            .insert(schema.appsTable)
            .values({
                userId: data.userId,
                name: data.name,
            })
            .returning();
        return newApp ?? null;
    }

    async getAll(userId: string): Promise<schema.App[]> {
        return await this.db
            .select()
            .from(schema.appsTable)
            .where(eq(schema.appsTable.userId, userId));
    }

    async delete(id: string, userId: string): Promise<boolean> {
        const [deletedApp] = await this.db
            .delete(schema.appsTable)
            .where(and(
                eq(schema.appsTable.id, id),
                eq(schema.appsTable.userId, userId)
            ))
            .returning();

        return !!deletedApp;
    }
}
