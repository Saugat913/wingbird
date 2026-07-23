import { Hono } from "hono";
import { AppEnv } from "../../env";
import UploadService from "./upload.service";
import { requireAuth } from "../../middleware/auth";
import { upload } from "../../db/schema";
import { and, eq } from "drizzle-orm";
import { HttpError } from "../../middleware/error";


const uploadRouter = new Hono<AppEnv>();

const ALLOWED_CONTENT_TYPES = new Set([
    "application/vnd.android.package-archive",
    "application/octet-stream",
]);

uploadRouter.post("/", requireAuth, async (c) => {
    const body: {
        fileName: string;
        fileType: string;
        fileSize: number;
    } = await c.req.json();

    const { fileName, fileType, fileSize } = body;

    if (!fileName || !fileType || fileSize === undefined) {
        throw new HttpError("Missing required fields", 400);
    }

    if (typeof fileSize !== "number" || !Number.isInteger(fileSize) || fileSize <= 0) {
        throw new HttpError("Invalid file size", 400);
    }

    if (fileSize > 100 * 1024 * 1024) {
        throw new HttpError("File size too large", 400);
    }

    if (!ALLOWED_CONTENT_TYPES.has(fileType)) {
        throw new HttpError("Invalid file type", 400);
    }

    const sanitizedFileName = fileName
        .trim()
        .replace(/^.*[\\/]/, "")
        .replace(/[\x00-\x1F\x7F]/g, "");


    if (sanitizedFileName.length === 0) {
        throw new HttpError("Invalid file name", 400);
    }

    if (sanitizedFileName.length > 255) {
        throw new HttpError("File name too long", 400);
    }

    const uploadId = crypto.randomUUID();

    const db = c.var.db;

    await db.insert(upload).values({
        id: uploadId,
        fileName: sanitizedFileName,
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
    const db = c.var.db;

    const hasPermission = await db.select().from(upload).where(and(eq(upload.id, key), eq(upload.userId, user.id))).then((result) => result[0]?.userId === user.id);

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
    const db = c.var.db;

    const hasPermission = await db.select().from(upload).where(and(eq(upload.id, key), eq(upload.userId, user.id))).then((result) => result[0]?.userId === user.id);

    if (!hasPermission) {
        return c.json({ message: "Unauthorized" }, 401);
    }


    await db.update(upload).set({
        status: "completed",
    }).where(eq(upload.id, key));

    return c.json({ message: "Upload completed" });
});
export default uploadRouter;
