  import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
  import AppEnv from "../../env";
  import { CreatePatchesDto, GetPatchMetaDataDto, GetPatchQuery, PatchDto } from "./patches.dto";
  import { PlatformSchema } from "../../types/platforms";
  import { ChannelSchema } from "../../types/channels";
  import { requireAuth } from "../../middleware/auth";
  import requireAppAccess from "../../middleware/app-access";


  export const patchesRouter = new OpenAPIHono<AppEnv>();

  patchesRouter.openapi(
    createRoute({
      method: "post",
      path: "/apps/{appId}/releases/{version}/patches",
      summary: "Create patches",
      middleware: [requireAuth, requireAppAccess()],
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
              schema: CreatePatchesDto,
            },
          },
        },
      },
      responses: {
        201: {
          description: "Patches created",
          content: {
            "application/json": {
              schema: z.array(PatchDto),
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

      const patches = await c.var.patchService.create({
        appId: c.var.app.id,
        version: params.version,
        ...query,
        patches: body.patches,
      });

      return c.json(patches, 201);
    },
  );

  patchesRouter.openapi(
    createRoute({
      method: "get",
      path: "/apps/{appId}/releases/{version}/patches/latest",
      summary: "Get latest patch metadata",
      middleware: [requireAppAccess({ requireOwnership: false })],
      request: {
        params: z.object({
          appId: z.string(),
          version: z.string(),
        }),
        query: GetPatchQuery,
      },
      responses: {
        200: {
          description: "Latest patch metadata",
          content: {
            "application/json": {
              schema: GetPatchMetaDataDto,
            },
          },
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
        appId: c.var.app.id,
        version: params.version,
        ...query,
      });

      const downloadUrl = await c.var.uploadService.getDownloadUrl(
        patch.uploadId,
        c.var.app.id,
      );

      return c.json({
        id: patch.id,
        patchNumber: patch.patchNumber,
        libappHash: patch.libappHash,
        downloadUrl,
      }, 200);
    },
  );


  patchesRouter.openapi(
    createRoute({
      method: "get",
      path: "/patches/{patchId}/download",
      summary: "Download the patch",
      middleware: [requireAppAccess({ requireOwnership: false })],
      request: {
        params: z.object({
          patchId: z.string(),
        }),
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

      const patch = await c.var.patchService.getPatchById({
        patchId: params.patchId,
      });

      const url = await c.var.uploadService.getDownloadUrl(
        patch.uploadId,
        patch.appId,
      );

      return c.redirect(url, 302);
    },
  );