import { Hono } from "hono";
import { AppEnv } from "../../env";
import UploadService from "./upload.service";
import { requireAuth } from "../../middleware/auth";
import { upload, app } from "../../db/schema";
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
        appId: string;
        fileHash: string;
    } = await c.req.json();

    const { fileName, fileType, fileSize, appId, fileHash } = body;

    if (!fileName || !fileType || fileSize === undefined || !appId || !fileHash) {
        throw new HttpError("Missing required fields (fileName, fileType, fileSize, appId, fileHash)", 400);
    }

    if (typeof fileSize !== "number" || !Number.isInteger(fileSize) || fileSize <= 0) {
        throw new HttpError("Invalid file size: must be a positive integer", 400);
    }

    if (fileSize > 100 * 1024 * 1024) {
        throw new HttpError("File size too large: maximum allowed is 100MB", 400);
    }

    if (!ALLOWED_CONTENT_TYPES.has(fileType)) {
        throw new HttpError("Invalid file type: unsupported MIME type", 400);
    }

    const sanitizedFileName = fileName
        .trim()
        .replace(/^.*[\\/]/, "")
        .replace(/[\x00-\x1F\x7F]/g, "");


    if (sanitizedFileName.length === 0) {
        throw new HttpError("Invalid file name", 400);
    }

    if (sanitizedFileName.length > 255) {
        throw new HttpError("File name too long: maximum 255 characters", 400);
    }

    const db = c.var.db;
    const user = c.var.user;

    const appRecord = await db
        .select()
        .from(app)
        .where(and(eq(app.id, appId), eq(app.userId, user.id)))
        .then((res) => res[0]);

    if (!appRecord) {
        throw new HttpError("App not found or you do not have permission to access it. Please ensure 'wingbird init' was run successfully.", 404);
    }

    const uploadId = crypto.randomUUID();

    await db.insert(upload).values({
        id: uploadId,
        appId,
        fileName: sanitizedFileName,
        fileType,
        fileSize,
        fileHash,
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

    const uploadRecord = await db
        .select({
            upload: upload,
        })
        .from(upload)
        .innerJoin(app, eq(upload.appId, app.id))
        .where(and(eq(upload.id, key), eq(app.userId, user.id)))
        .then((result) => result[0]?.upload);

    if (!uploadRecord) {
        throw new HttpError("Upload record not found or unauthorized", 404);
    }

    const url = await uploadService.getSignedUrl(key);
    return c.redirect(url);
});


uploadRouter.patch("/:key/complete", requireAuth, async (c) => {
    const key = decodeURIComponent(c.req.param("key"));
    const uploadService = new UploadService(c.env);
    const user = c.var.user;
    const db = c.var.db;

    const uploadRecord = await db
        .select({
            upload: upload,
        })
        .from(upload)
        .innerJoin(app, eq(upload.appId, app.id))
        .where(and(eq(upload.id, key), eq(app.userId, user.id)))
        .then((result) => result[0]?.upload);

    if (!uploadRecord) {
        throw new HttpError("Upload record not found or unauthorized", 404);
    }

    let s3Res: Response;
    try {
        s3Res = await uploadService.headObject(key);
    } catch (err) {
        throw new HttpError("Storage service currently unreachable. Please try again.", 503);
    }

    if (!s3Res.ok) {
        throw new HttpError("Uploaded file not found in storage bucket.", 400);
    }

    const contentLength = s3Res.headers.get("Content-Length");
    if (contentLength) {
        const actualSize = Number(contentLength);
        if (actualSize !== uploadRecord.fileSize) {
            throw new HttpError("Uploaded file size does not match registered file size.", 400);
        }
    }

    await db.update(upload).set({
        status: "completed",
    }).where(eq(upload.id, key));

    return c.json({ message: "Upload completed" });
});

export default uploadRouter;
