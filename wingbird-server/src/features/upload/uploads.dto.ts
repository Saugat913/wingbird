import { z } from "@hono/zod-openapi";
import { schema } from "../../db/db";
import { createSelectSchema, CreateSelectSchema } from "drizzle-zod";

export const CreateUploadDto = z.object({
  fileName: z.string().min(1).max(255),
  fileType: z.string(),
  fileSize: z.int().positive().max(100 * 1024 * 1024),
  fileHash: z.string().min(1),
}).openapi("CreateUploadDto");


export const CreateUploadResponseDto = z.object({
  uploadId: z.string(),
  uploadUrl: z.url(),
});

export const CompleteUploadResponseDto = createSelectSchema(schema.uploadsTable).omit({
  appId: true,
  objectKey: true,
});