import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { schema } from "../../db/db";
import { ReleaseIdentitySchema } from "../../types/release-identity";
import { z } from "@hono/zod-openapi";
import { ArchitectureSchema } from "../../types/architectures";
import { ChannelSchema } from "../../types/channels";
import { PlatformSchema } from "../../types/platforms";

export const CreatePatchDto = createInsertSchema(schema.patchesTable)
  .pick({
    architecture: true,
    uploadId: true,
  })
  .extend(ReleaseIdentitySchema.shape)
  .openapi("CreatePatchDto");

export const PatchDto = createSelectSchema(schema.patchesTable).omit({
    uploadId:true
})
  .openapi("PatchDto");



export const GetPatchQuery=z.object({
  channel:ChannelSchema,
  platform:PlatformSchema,
  architecture:ArchitectureSchema
});