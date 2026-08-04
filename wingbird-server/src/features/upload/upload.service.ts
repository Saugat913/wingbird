
import { schema } from "../../db/db";
import {
    InternalServerError,
    NotFoundError,
    BadRequestError,
} from "../../error";
import { UploadMetadata } from "../../types/upload-metadata";
import {
    ObjectMetadata,
    StorageRepository,
} from "./storage.repository";
import { UploadRepository } from "./uploads.repository";


const ALLOWED_CONTENT_TYPES = new Set([
    "application/vnd.android.package-archive",
    "application/octet-stream",
]);

export class UploadService {
    constructor(
        private readonly uploadRepo: UploadRepository,
        private readonly storageRepo: StorageRepository,
    ) { }

    async createPending(
        appId: string,
        metadata: UploadMetadata,
    ): Promise<{
        id: string;
        uploadUrl: string;
    }> {
        const objectKey = `apps/${appId}/uploads/${crypto.randomUUID()}`;

        if (!ALLOWED_CONTENT_TYPES.has(metadata.fileType)) {
            throw new BadRequestError("Invalid file type: unsupported MIME type");
        }

        const pending = await this.uploadRepo.createPending({
            appId,
            ...metadata,
            objectKey,
        });

        if (!pending) {
            throw new InternalServerError("Failed to create upload.");
        }

        const uploadUrl = await this.storageRepo.createUploadUrl(
            objectKey,
            metadata.fileType,
            metadata.fileSize,
        );

        return {
            id: pending.id,
            uploadUrl,
        };
    }

    async validateAndPromote(
        id: string,
        appId: string,
    ): Promise<schema.Upload> {
        const pending = await this.uploadRepo.getPendingById(
            id,
            appId,
        );

        if (!pending) {
            throw new NotFoundError("Pending upload");
        }

        const object = await this.storageRepo.headObject(
            pending.objectKey,
        );

        this.validateObject(pending, object);

        const upload = await this.uploadRepo.createUpload({
            appId: pending.appId,
            objectKey: pending.objectKey,
            fileHash: pending.fileHash,
            fileName: pending.fileName,
            fileSize: pending.fileSize,
            fileType: pending.fileType,
        });

        if (!upload) {
            throw new InternalServerError(
                "Failed to finalize upload.",
            );
        }

        await this.uploadRepo.deletePending(
            pending.id,
            pending.appId,
        );

        return upload;
    }

    async getDownloadUrl(
        uploadId: string,
        appId: string,
    ): Promise<string> {
        const upload = await this.uploadRepo.getUploadById(
            uploadId,
            appId,
        );

        if (!upload) {
            throw new NotFoundError("Upload");
        }

        const downloadUrl = await this.storageRepo.createDownloadUrl(
            upload.objectKey,
        );
        if (!downloadUrl) {
            throw new InternalServerError("Cannot create download url")
        }
        return downloadUrl;
    }

    private validateObject(
        expected: UploadMetadata,
        actual: ObjectMetadata | null,
    ): void {
        if (!actual) {
            throw new BadRequestError(
                "Uploaded object not found.",
            );
        }

        if (actual.size !== expected.fileSize) {
            throw new BadRequestError(
                "Uploaded file size does not match."
            );
        }

        if (actual.contentType !== expected.fileType) {
            throw new BadRequestError(
                "Uploaded file type does not match."
            );
        }

        if (
            actual.sha256 &&
            actual.sha256 !== expected.fileHash
        ) {
            throw new BadRequestError(
                "Uploaded file checksum does not match."
            );
        }
    }
}