import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { appTable } from "./apps";
import { PLATFORMS } from "./types/platforms";
import { CHANNELS } from "./types/channel";




export const releaseTable = sqliteTable("release", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    appId: text("app_id").notNull().references(() => appTable.id, { onDelete: "cascade" }),
    artifactKey: text("artifact_key").notNull(),
    releaseVersion: text("release_version").notNull(),
    platform: text("platform",{enum: PLATFORMS}).notNull(),
    channel: text("channel",{enum: CHANNELS}).notNull(),

    fileName: text("file_name").notNull(),
    fileSize: integer("file_size").notNull(),
    fileType: text("file_type").notNull(),
    fileHash: text("file_hash").notNull(),

    createdAt: integer("created_at", { mode: "timestamp" }).notNull().$default(() => new Date()),
}, (table) => [
    index("release_app_id_idx").on(table.appId),
    index("release_lookup_idx").on(table.appId, table.platform, table.channel),
]);


export type Release= typeof releaseTable.$inferSelect;
