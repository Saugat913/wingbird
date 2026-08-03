import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import AppEnv from "../../env";
import { CreateReleaseDto, ReleaseDto } from "./releases.dto";
import { PlatformSchema } from "../../types/platforms";
import { ChannelSchema } from "../../types/channels";


export const releasesRouter = new OpenAPIHono<AppEnv>();

releasesRouter.openapi(
  createRoute({
    method: "post",
    path: "/apps/{appId}/releases",
    summary: "Create release",
    request: {
      params: z.object({
        appId: z.string().min(1, "AppId is required"),
      }),
      body: {
        required: true,
        content: {
          "application/json": {
            schema: CreateReleaseDto,
          },
        },
      },
    },
    responses: {
      201: {
        description: "Release created",
        content: {
          "application/json": {
            schema: ReleaseDto,
          },
        },
      },
      409: {
        description: "Release already exists",
      },
    },
  }),
  async (c) => {
    const body = c.req.valid("json");
    const params = c.req.valid("param");
    const release = await c.var.releaseService.create({
      ...body,
      ...params,
    });
    return c.json(release, 201);
  },
);

releasesRouter.openapi(
  createRoute({
    method: "get",
    path: "/apps/{appId}/releases/{version}/download",
    summary: "Download release",
    request: {
      params: z.object({
        appId: z.string(),
        version: z.string(),
      }),
      query: z.object({
        platform: PlatformSchema,
        channel: ChannelSchema,
      }),
    },
    responses: {
      302: {
        description: "Redirect to download URL",
      },
      404: {
        description: "Release not found",
      },
    },
  }),
  async (c) => {
    const params = c.req.valid("param");
    const query = c.req.valid("query");

    const release = await c.var.releaseService.getByReleaseIdentity({
      ...query,
      ...params,
    });

    const url = await c.var.uploadService.getDownloadUrl(release.uploadId, params.appId);

    return c.redirect(url, 302);
  }
);