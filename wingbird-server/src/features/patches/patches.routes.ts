import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import AppEnv from "../../env";
import { CreatePatchDto, GetPatchQuery, PatchDto } from "./patches.dto";
import { PlatformSchema } from "../../types/platforms";
import { ChannelSchema } from "../../types/channels";


export const patchesRouter = new OpenAPIHono<AppEnv>();

patchesRouter.openapi(
  createRoute({
    method: "post",
    path: "/apps/{appId}/releases/{version}/patches",
    summary: "Create patch",
    request: {
      params: z.object({
        appId: z.string(),
        version: z.string(),
      }),
      query: z.object({
        platform: PlatformSchema,
        channel: ChannelSchema,
      }),
      body: {
        required: true,
        content: {
          "application/json": {
            schema: CreatePatchDto,
          },
        },
      },
    },
    responses: {
      201: {
        description: "Patch created",
        content: {
          "application/json": {
            schema: PatchDto,
          },
        },
      },
      404: {
        description: "Release not found",
      },
      409: {
        description: "Patch already exists",
      },
    },
  }),
  async (c) => {
    const body = c.req.valid("json");
    const params = c.req.valid("param");
    const query = c.req.valid("query");

    const patch = await c.var.patchService.create({
      ...body,
      ...params,
      ...query,
    });

    return c.json(patch!, 201);
  },
);

patchesRouter.openapi(
  createRoute({
    method: "get",
    path: "/apps/{appId}/releases/{version}/patches/latest/download",
    summary: "Download latest patch",
    request: {
      params: z.object({
        appId: z.string(),
        version: z.string(),
      }),
      query: GetPatchQuery,
    },
    responses: {
      302: {
        description: "Redirect to patch download",
      },
      404: {
        description: "Patch not found",
      },
    },
  }),
  async (c) => {
    const params = c.req.valid("param");
    const query = c.req.valid("query");

    const patch = await c.var.patchService.getLatestPatch({
      ...params,
      ...query,
    });

    const url = await c.var.uploadService.getDownloadUrl(
      patch.uploadId,
      params.appId,
    );

    return c.redirect(url, 302);
  },
);