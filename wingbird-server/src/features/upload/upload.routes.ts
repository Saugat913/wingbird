import { Hono } from "hono";
import { AppEnv } from "../../env";
import UploadService from "./upload.service";
import { requireAuth } from "../../middleware/auth";


const uploadRouter = new Hono<AppEnv>();

uploadRouter.post("/",requireAuth, async (c) => {
    const { fileName, fileType, fileSize }: { fileName: string, fileType: string, fileSize: number } = await c.req.json();

    if (!fileName || !fileType || !fileSize) {
        return c.json({ message: "Missing required fields" }, 400);
    }
    const uploadService = new UploadService(c.env);
    const result = await uploadService.uploadFile(fileName, fileType, fileSize);
    return c.json(result);
});

uploadRouter.get("/:key", requireAuth,async (c) => {
    const key = decodeURIComponent(c.req.param("key"));
    const uploadService = new UploadService(c.env);
    const url = await uploadService.getSignedUrl(key);
    return c.redirect(url);
});

export default uploadRouter;
