import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { user } from "./schema";


export const upload = sqliteTable("upload", {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().references(() => user.id),

    fileName: text("file_name").notNull(),
    fileSize: integer("file_size").notNull(),
    fileType: text("file_type").notNull(),

    status: text("status").notNull().default("pending"),

    createdAt: integer("created_at", { mode: "timestamp" }).notNull().$default(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$default(() => new Date()),

});