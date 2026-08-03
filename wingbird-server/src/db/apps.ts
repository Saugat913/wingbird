import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { userTable } from "./auth";

const appsTable= sqliteTable("app",{
    id:text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    name:text("name").notNull(),
    userId:text("user_id").notNull().references(()=>userTable.id,{onDelete:"cascade"}),
    createdAt:integer("created_at",{mode:"timestamp"}).notNull().$default(() => new Date())
});

type App = typeof appsTable.$inferSelect;

export { type App, appsTable };