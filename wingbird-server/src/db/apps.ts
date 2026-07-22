import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { user } from "./auth";

export const app= sqliteTable("app",{
    id:text("id").primaryKey(),
    name:text("name").notNull(),
    userId:text("user_id").references(()=>user.id),
    createdAt:integer("created_at",{mode:"timestamp"}).notNull().$default(() => new Date())
});

