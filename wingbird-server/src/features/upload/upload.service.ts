import { AwsClient } from "aws4fetch";
import { AppEnv } from "../../env";

class UploadService {
    private client: AwsClient;
    private endpoint: string;
    private bucket: string;

    constructor(env: AppEnv["Bindings"]) {
        this.client = this.getS3Client(env);
        this.endpoint = env.S3_ENDPOINT;
        this.bucket = env.S3_BUCKET;
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
        targetUrl.searchParams.set('X-Amz-Expires', '900');

        const signedRequest = await this.client.sign(
            new Request(targetUrl.toString(), {
                method: 'PUT',
                headers: { 'Content-Type': fileType },
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
        targetUrl.searchParams.set('X-Amz-Expires', '900');
        const signedRequest = await this.client.sign(
            new Request(targetUrl.toString(), { method: 'GET' }),
            {
                method: 'GET',
                aws: { signQuery: true },
            }
        );


        return signedRequest.url;
    }
}

export default UploadService;