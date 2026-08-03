import { z } from "@hono/zod-openapi";

export const PLATFORMS = ["android", "ios"] as const;

export const PlatformSchema = z.enum(PLATFORMS);
export type Platform = z.infer<typeof PlatformSchema>;
