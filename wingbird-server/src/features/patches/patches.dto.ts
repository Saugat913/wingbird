import { createSelectSchema } from "drizzle-zod";
import { schema } from "../../db/db";
import { z } from "@hono/zod-openapi";
import { Architecture, ArchitectureSchema } from "../../types/architectures";
import { ChannelSchema } from "../../types/channels";
import { PlatformSchema } from "../../types/platforms";
import { parentPort } from "node:worker_threads";

export const CreatePatchesDto = z.object({
  patches: z.array(z.object({
    architecture: ArchitectureSchema,
    uploadId: z.string().min(1),
    libappHash: z.string().min(1),
  })).min(1).superRefine((patches, context) => {
    const seen = new Set<Architecture>();
    for (const patch of patches) {
      if (seen.has(patch.architecture)) {
        context.addIssue({
          code: "custom",
          message: `Duplicate architecture found: ${patch.architecture}`
        });
      }
      seen.add(patch.architecture);
    }
  }),
}).openapi("CreatePatchesDto");

export const PatchDto = createSelectSchema(schema.patchesTable).omit({
  uploadId: true
})
  .openapi("PatchDto");


export const GetPatchMetaDataDto = z.object({
  id: z.string(),
  patchNumber: z.number(),
  libappHash: z.string(),
  patchHash: z.string(),
});

export const GetPatchQuery = z.object({
  channel: ChannelSchema,
  platform: PlatformSchema,
  architecture: ArchitectureSchema,
  currentPatchNumber: z.coerce.number().int().default(0),
});

export const GetPatchByIdQuery = z.object({
  channel: ChannelSchema,
  platform: PlatformSchema,
  architecture: ArchitectureSchema,
});  
