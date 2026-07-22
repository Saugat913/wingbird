import { Hono } from "hono";
import { AppEnv } from "../../env";
import UploadService from "./upload.service";
import { requireAuth } from "../../middleware/auth";
import { upload } from "../../db/schema";
import { and, eq } from "drizzle-orm";


const uploadRouter = new Hono<AppEnv>();

const ALLOWED_CONTENT_TYPES = new Set([
    "application/vnd.android.package-archive",
    "application/octet-stream",
]);

uploadRouter.post("/", requireAuth, async (c) => {
    const { fileName, fileType, fileSize }: { fileName: string, fileType: string, fileSize: number } = await c.req.json();

    const db = c.var.db;

    if (!fileName || !fileType || !fileSize) {
        return c.json({ message: "Missing required fields" }, 400);
    }

    if (fileSize > 1024 * 1024 * 10) {
        return c.json({ message: "File size too large" }, 400);
    }

    if (!ALLOWED_CONTENT_TYPES.has(fileType)) {
        return c.json({ message: "Invalid file type" }, 400);
    }

    const uploadId = crypto.randomUUID();

    await db.insert(upload).values({
        id: uploadId,
        fileName,
        fileType,
        fileSize,
        userId: c.var.user.id,
    });

    const uploadService = new UploadService(c.env);
    const result = await uploadService.uploadFile(uploadId, fileType, fileSize);
    return c.json(result);
});

uploadRouter.get("/:key", requireAuth, async (c) => {
    const key = decodeURIComponent(c.req.param("key"));
    const uploadService = new UploadService(c.env);
    const user = c.var.user;
    const db= c.var.db;

    const hasPermission = await db.select().from(upload).where(and(eq(upload.id, key),eq(upload.userId,user.id))).then((result) => result[0]?.userId === user.id);

    if (!hasPermission) {
        return c.json({ message: "Unauthorized" }, 401);
    }
    
    const url = await uploadService.getSignedUrl(key);
    return c.redirect(url);
});


uploadRouter.patch("/:key/complete", requireAuth, async (c) => {
    const key = decodeURIComponent(c.req.param("key"));
    const uploadService = new UploadService(c.env);
    const user = c.var.user;
    const db= c.var.db;

    const hasPermission = await db.select().from(upload).where(and(eq(upload.id, key),eq(upload.userId,user.id))).then((result) => result[0]?.userId === user.id);

    if (!hasPermission) {
        return c.json({ message: "Unauthorized" }, 401);
    }


    await db.update(upload).set({
        status: "completed",
    }).where(eq(upload.id, key));
    
    return c.json({ message: "Upload completed" });
});
export default uploadRouter;
