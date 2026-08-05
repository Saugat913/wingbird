import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { appsTable } from "./apps";

const uploadsTable = sqliteTable("uploads", {
    id: text("id").primaryKey().$default(() => crypto.randomUUID()),
    appId: text("app_id").notNull().references(() => appsTable.id, {
        onDelete: "cascade"
    }),
    objectKey: text("object_key").notNull(),

    fileName: text("file_name").notNull(),
    fileSize: integer("file_size").notNull(),
    fileHash: text("file_hash").notNull(),
    fileType: text("file_type").notNull(),


    createdAt: integer("created_at", { mode: "timestamp" }).notNull().$default(() => new Date())

});

const pendingUploadsTable = sqliteTable("pending_uploads", {
    id: text("id").primaryKey().$default(() => crypto.randomUUID()),
    appId: text("app_id").notNull().references(() => appsTable.id, {
        onDelete: "cascade"
    }),
    objectKey: text("object_key").notNull(),

    fileName: text("file_name").notNull(),
    fileSize: integer("file_size").notNull(),
    fileHash: text("file_hash").notNull(),
    fileType: text("file_type").notNull(),

    createdAt: integer("created_at", { mode: "timestamp" }).notNull().$default(() => new Date())
});

type PendingUpload = typeof pendingUploadsTable.$inferSelect;
type Upload = typeof uploadsTable.$inferSelect;

export { pendingUploadsTable, uploadsTable, type PendingUpload, type Upload };