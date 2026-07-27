import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { appTable } from "./apps";

export const STATUS_VALUES=[
    'pending',
    'completed',
    'failed'
];

export type UploadStatus = (typeof STATUS_VALUES)[number];

export const uploadTable = sqliteTable("upload", {
    id: text("id").primaryKey(),
    appId: text("app_id").notNull().references(() => appTable.id),

    fileName: text("file_name").notNull(),
    fileSize: integer("file_size").notNull(),
    fileType: text("file_type").notNull(),
    fileHash: text("file_hash").notNull(),

    status: text("status").$type<UploadStatus>().notNull().default("pending"),

    createdAt: integer("created_at", { mode: "timestamp" }).notNull().$default(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$default(() => new Date()),

},(table)=>[
    index("upload_app_id_idx").on(table.appId, appTable.id),
    index("upload_status_idx").on(table.status),
]);
