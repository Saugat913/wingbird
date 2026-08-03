import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import AppEnv from "../../env";
import { AppDto, CreateAppDto } from "./apps.dto";
import { requireAuth } from "../../middleware/auth";
import requireAppAccess from "../../middleware/app-access";

export const appsRouter = new OpenAPIHono<AppEnv>();

appsRouter.use(requireAuth);

appsRouter.openapi(
  createRoute({
    method: "post",
    path: "/",
    summary: "Create app",
    request: {
      body: {
        required: true,
        content: {
          "application/json": {
            schema: CreateAppDto,
          },
        },
      },
    },
    responses: {
      201: {
        description: "App created",
        content: {
          "application/json": {
            schema: AppDto,
          },
        },
      },
    },
  }),
  async (c) => {
    const body = c.req.valid("json");
    const user= c.var.user;
    const appService = c.var.appService;

    const newApp = await appService.create({
      ...body,
      userId: user.id,
    });
    
    return c.json(newApp, 201);
  },
);

appsRouter.openapi(
  createRoute({
    method: "get",
    path: "/",
    summary: "List apps",
    responses: {
      200: {
        description: "Apps",
        content: {
          "application/json": {
            schema: z.array(AppDto),
          },
        },
      },
    },
  }),
  async (c) => {
    const user = c.var.user;
    const appService = c.var.appService;
    const apps = await appService.getAll(user.id);
    return c.json(apps, 200);
  },
);

appsRouter.openapi(
  createRoute({
    method: "delete",
    path: "/{appId}",
    summary: "Delete app",
    middleware: [
      requireAppAccess,
    ],
    request: {
      params: z.object({
        appId: z.string(),
      }),
    },
    responses: {
      204: {
        description: "Deleted",
      },
      404: {
        description: "App not found",
      },
    },
  }),
  async (c) => {
    const { appId } = c.req.valid("param");
    const appService = c.var.appService;
    const app = c.var.app;
    await appService.delete(appId, app.userId);

    return c.body(null, 204);
  },
);
