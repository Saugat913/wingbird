import { index, integer, sqliteTable, text, unique } from "drizzle-orm/sqlite-core";
import { releasesTable } from "./releases";
import { ARCHITECTURES } from "../types/architectures";

const patchesTable = sqliteTable(
  "patches",
  {
    id: text("id")
      .primaryKey()
      .$default(() => crypto.randomUUID()),
    releaseId: text("release_id")
      .notNull()
      .references(() => releasesTable.id,{
        onDelete:"cascade"
      }),
    patchNumber: integer("patch_number").notNull(),

    uploadId: text("upload_id").notNull(),
    architecture: text("architecture", { enum: ARCHITECTURES }).notNull(),

    createdAt: integer("created_at", { mode: "timestamp" }).$default(
      () => new Date(),
    ),
  },
  (table) => [
    unique("unique_patch").on(
      table.releaseId,
      table.architecture,
      table.patchNumber,
    ),

    index("architecture_idx").on(
      table.architecture,
      table.patchNumber,
      table.releaseId
    )
  ],
);

type Patch = typeof patchesTable.$inferSelect;

export { type Patch, patchesTable };
