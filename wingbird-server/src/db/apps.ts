import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { userTable } from "./auth";

export const appTable= sqliteTable("app",{
    id:text("id").primaryKey(),
    name:text("name").notNull(),
    userId:text("user_id").references(()=>userTable.id),
    createdAt:integer("created_at",{mode:"timestamp"}).notNull().$default(() => new Date())
});



export type App = typeof appTable.$inferSelect;