import AppEnv from "../../env";
import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { CompleteUploadResponseDto, CreateUploadDto, CreateUploadResponseDto } from "./uploads.dto";
import { requireAuth } from "../../middleware/auth";
import requireAppAccess from "../../middleware/app-access";

const uploadRouter = new OpenAPIHono<AppEnv>();

uploadRouter.use(requireAuth);

uploadRouter.openapi(createRoute({
    method: "post",
    path: "/apps/{appId}/uploads",
    middleware: [requireAppAccess()],
    request: {
        params: z.object({
            appId: z.string()
        }),
        body: {
            content: {
                "application/json":
                {
                    schema: CreateUploadDto
                }
            },
        },
    },
    responses: {
        201 :{
            description: "Upload URL created",
            content:{
                "application/json":{
                    schema: CreateUploadResponseDto
                }
            }
        }
    }
}), async (c) => {
    const body = c.req.valid("json");
    const uploadService = c.var.uploadService;

    const { id, uploadUrl } = await uploadService.createPending(
        c.var.app.id,
        body
    )

    return c.json(
        {
            uploadId: id,
            uploadUrl: uploadUrl
        },
        201 
    );
})


uploadRouter.openapi(createRoute({
    method: "patch",
    path: "/apps/{appId}/uploads/{uploadId}/complete",
    middleware: [requireAppAccess()],
    request: {
        params: z.object({
            appId: z.string(),
            uploadId:z.string(),
        }),
    },
    responses: {
        200 :{
            description: "Upload success fully completed",
            content:{
                "application/json":
                {
                    schema: CompleteUploadResponseDto
                }
            }
        }
    }
}), async (c) => {
    
    const params = c.req.valid("param");

    const uploadService = c.var.uploadService;

    const uploads = await uploadService.complete(
        params.uploadId, c.var.app.id
    )

    return c.json(
        CompleteUploadResponseDto.parse(uploads),
        200 
    );
})




export default uploadRouter;