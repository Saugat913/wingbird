import { createSelectSchema } from "drizzle-zod";
import { schema } from "../../db/db";
import { z } from "@hono/zod-openapi";
import { ArchitectureSchema } from "../../types/architectures";
import { ChannelSchema } from "../../types/channels";
import { PlatformSchema } from "../../types/platforms";

export const CreatePatchesDto = z.object({
  patches: z.array(z.object({
    architecture: ArchitectureSchema,
    uploadId: z.string().min(1),
  })).min(1),
}).openapi("CreatePatchesDto");

export const PatchDto = createSelectSchema(schema.patchesTable).omit({
    uploadId:true
})
  .openapi("PatchDto");


export const GetPatchQuery=z.object({
  channel:ChannelSchema,
  platform:PlatformSchema,
  architecture:ArchitectureSchema
});  