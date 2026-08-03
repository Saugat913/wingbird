import { z } from "@hono/zod-openapi";

export const ARCHITECTURES = [
  "arm64-v8a",
  "armeabi-v7a",
  "x86_64",
  "arm64",
] as const;

export const ArchitectureSchema = z.enum(ARCHITECTURES);
export type Architecture = z.infer<typeof ArchitectureSchema>;
