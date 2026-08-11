import { z } from "@hono/zod-openapi";
import { ChannelSchema } from "./channels";
import { PlatformSchema } from "./platforms";

export const ReleaseIdentitySchema = z.object({
  appId: z.string().uuid(),
  version: z.string().min(1),
  channel: ChannelSchema,
  platform: PlatformSchema,
});

export type ReleaseIdentity = z.infer<typeof ReleaseIdentitySchema>;
