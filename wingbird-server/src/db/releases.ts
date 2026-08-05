import { index, integer, sqliteTable, text, unique } from "drizzle-orm/sqlite-core";
import { appsTable } from "./schema";
import { PLATFORMS } from "../types/platforms";
import { CHANNELS } from "../types/channels";


const releasesTable = sqliteTable(
  "releases",
  {
    id: text("id")
      .primaryKey()
      .$default(() => crypto.randomUUID()),
    appId: text("app_id")
      .notNull()
      .references(() => appsTable.id, {
        onDelete: "cascade",
      }),
    version: text("version").notNull(),

    platform: text("platform", {
      enum: PLATFORMS,
    }).notNull(),
    channel: text("channel", {
      enum: CHANNELS,
    }).notNull(),

    uploadId: text("upload_id").notNull(),

    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$default(() => new Date()),
  },
  (table) => [
    unique("unique_release").on(
      table.appId,
      table.channel,
      table.platform,
      table.version,
      ),
    index("version_idx").on(
      table.version,
    )
  ],
);

type Release = typeof releasesTable.$inferSelect;

export { type Release, releasesTable };
