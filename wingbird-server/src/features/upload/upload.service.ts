import { AwsClient } from "aws4fetch";
import { AppEnv } from "../../env";

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
}

export default UploadService;
