import { z } from "@hono/zod-openapi";

export const CHANNELS = ["prod", "dev", "stage"] as const;

export const ChannelSchema = z.enum(CHANNELS);
export type Channel = z.infer<typeof ChannelSchema>;
