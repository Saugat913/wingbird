import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { releaseTable } from "./schema";
import { ARCHITECTURES } from "./types/architecture";


export const patchTable= sqliteTable("patch", {
  id: text("id").primaryKey().$default(()=>crypto.randomUUID()),
  releaseId:text("release_id").notNull().references(() => releaseTable.id),
  
  patchNumber:integer("patch_number").notNull(),

  architecture:text("architecture",{enum:ARCHITECTURES}).notNull(),

  artifactKey:text("artifact_key").notNull(),
  fileName:text("file_name").notNull(),
  fileSize:integer("file_size").notNull(),
  fileType:text("file_type").notNull(),
  fileHash:text("file_hash").notNull(),

  createdAt:integer("created_at",{mode:"timestamp"}).notNull().$default(() => new Date()),
},(table)=>[
  index("patch_release_idx").on(table.releaseId),
  index("patch_lookup_idx").on(table.releaseId,table.architecture,table.patchNumber),
])


export type Patch = typeof patchTable.$inferSelect;
