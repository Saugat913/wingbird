import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { schema } from "../../db/db";


export const CreateReleaseDto = createInsertSchema(schema.releasesTable)
  .pick({
    version: true,
    platform: true,
    channel: true,
    uploadId: true,
  })
  .openapi("CreateReleaseDto");

export const ReleaseDto = createSelectSchema(schema.releasesTable)
  .openapi("ReleaseDto")
  .omit({
    uploadId: true,
    appId:true,
  });
