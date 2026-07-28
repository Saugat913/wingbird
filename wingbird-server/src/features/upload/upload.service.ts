import { AwsClient } from "aws4fetch";
import { AppEnv } from "../../env";
import { HttpError } from "../../middleware/error";

class UploadService {
    private client: AwsClient;
    private endpoint: string;
    private bucket: string;
    private expireSeconds: number;

    constructor(env: AppEnv["Bindings"]) {
        this.client = this.getS3Client(env);
        this.endpoint = env.S3_ENDPOINT;
        this.bucket = env.S3_BUCKET;
        this.expireSeconds = env.S3_PRESIGNED_EXPIRE_SECONDS ? Number(env.S3_PRESIGNED_EXPIRE_SECONDS) : 900;
    }


    private getS3Client(env: AppEnv["Bindings"]) {
        return new AwsClient({
            accessKeyId: env.S3_ACCESS_KEY_ID!,
            secretAccessKey: env.S3_ACCESS_KEY!,
            region: env.S3_REGION,
            service: 's3',
        });
    }


    getS3ObjectUrl(key: string) {
        const endpointHost = this.endpoint.replace(/^https?:\/\//, '');
        return new URL(`https://${this.bucket}.${endpointHost}/${key}`);
    }

    async uploadFile(key: string, fileType: string, fileSize: number) {

        const targetUrl = this.getS3ObjectUrl(key);
        targetUrl.searchParams.set('X-Amz-Expires', this.expireSeconds.toString());

        const signedRequest = await this.client.sign(
            new Request(targetUrl.toString(), {
                method: 'PUT',
                headers: { 'Content-Type': fileType, 'Content-Length': fileSize.toString() },
            }),
            {
                method: 'PUT',
                aws: { signQuery: true },
            }
        );

        return { key, url: signedRequest.url };
    }

    async getSignedUrl(key: string) {
        const targetUrl = this.getS3ObjectUrl(key);
        targetUrl.searchParams.set('X-Amz-Expires', this.expireSeconds.toString());
        const signedRequest = await this.client.sign(
            new Request(targetUrl.toString(), { method: 'GET' }),
            {
                method: 'GET',
                aws: { signQuery: true },
            }
        );


        return signedRequest.url;
    }

    async deleteObject(key: string) {

    }
    async headObject(key: string) {
        const targetUrl = this.getS3ObjectUrl(key);
        const signedRequest = await this.client.sign(
            new Request(targetUrl.toString(), { method: 'HEAD' }),
            {
                method: 'HEAD',
                aws: { signQuery: true },
            }
        );
        return await fetch(signedRequest);
    }

    async validateArtifact(key: string, file: { size: number, type: string }): Promise<boolean> {
        const response = await this.headObject(key);
        if (!response.ok) {
            throw new HttpError(`Uploaded file not found in storage bucket (key: ${key}, S3 status: ${response.status})`, 404);
        }
        const contentLength = Number(response.headers.get("Content-Length"));
        const contentType = response.headers.get("Content-Type");
        if (contentLength !== file.size) {
            throw new HttpError(`File size mismatch: expected ${file.size} bytes, got ${contentLength} bytes`, 400);
        }
        if (contentType !== file.type) {
            throw new HttpError(`File type mismatch: expected ${file.type}, got ${contentType}`, 400);
        }
        return true;
    }
}

export default UploadService;
