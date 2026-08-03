import { z } from "@hono/zod-openapi";

export const UploadMetadataSchema = z.object({
    fileName: z.string(),
    fileSize: z.number(),
    fileType: z.string(),
    fileHash: z.string(),
});

export type UploadMetadata = z.infer<typeof UploadMetadataSchema>;