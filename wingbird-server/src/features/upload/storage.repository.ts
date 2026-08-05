import { AwsClient } from "aws4fetch";



export type StorageConfig = {
    endpoint: string;
    bucket: string;
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
    expiresSeconds: number;
};


export type ObjectMetadata = {
    size: number;
    contentType: string | null;
    etag: string | null;
    sha256: string | null;
};

export class StorageRepository {
    private readonly client: AwsClient;
    private readonly endpoint: string;
    private readonly bucket: string;
    private readonly expiresSeconds: number;

    constructor(config: StorageConfig) {
        this.endpoint = config.endpoint;
        this.bucket = config.bucket;
        this.expiresSeconds = config.expiresSeconds;

        this.client = new AwsClient({
            accessKeyId: config.accessKeyId!,
            secretAccessKey: config.secretAccessKey!,
            region: config.region,
            service: 's3',
        });
    }


    private getObjectUrl(key: string) {
        const endpointHost = this.endpoint.replace(/^https?:\/\//, '');
        return new URL(`https://${this.bucket}.${endpointHost}/${key}`);
    }

    async createUploadUrl(
        key: string,
        contentType: string,
        contentLength: number
    ): Promise<string> {
        const url = this.getObjectUrl(key);
        url.searchParams.set("X-Amz-Expires", this.expiresSeconds.toString());

        const request = await this.client.sign(url.toString(), {
            method: "PUT",
            headers: {
                "Content-Type": contentType,
                "Content-Length": contentLength.toString()
            },
            aws: {
                signQuery: true
            }
        });

        return request.url;
    }


    async createDownloadUrl(key: string): Promise<string | null> {
        const url = this.getObjectUrl(key);
        url.searchParams.set("X-Amz-Expires", this.expiresSeconds.toString());

        const request = await this.client.sign(url.toString(), {
            method: "GET",
            aws: {
                signQuery: true
            }
        });

        return request.url;
    }


    async headObject(key: string): Promise<ObjectMetadata | null> {
        const url = this.getObjectUrl(key);

        const request = await this.client.sign(url.toString(), {
            method: "HEAD",
            aws: {
                signQuery: true
            }
        })

        const response = await fetch(request);
        return response.ok ? {
            size: Number(response.headers.get("Content-Length") ?? 0),
            contentType: response.headers.get("Content-Type"),
            etag: response.headers.get("ETag"),
            sha256:response.headers.get("x-amz-checksum-sha256")
        } : null;
    }

    async deleteObject(key: string): Promise<boolean> {
        const url = this.getObjectUrl(key);

        const request = await this.client.sign(url.toString(), {
            method: "DELETE",
            aws: {
                signQuery: true
            }
        })
        const result = await fetch(request);
        return result.ok;

    }
}