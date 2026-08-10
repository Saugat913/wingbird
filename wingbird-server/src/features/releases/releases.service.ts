import { schema } from "../../db/db";
import { AppError, BadRequestError, ConflictError, InternalServerError, NotFoundError } from "../../error";
import { ReleaseIdentity } from "../../types/release-identity";
import { ReleasesRepository } from "./releases.repository";
import { UploadService } from "../upload/upload.service";

export class ReleasesService {
  private readonly maxReleasesPerApp: number;

  constructor(
    private readonly releasesRepo: ReleasesRepository,
    private readonly uploadService: UploadService,
    maxReleasesPerApp?: number | string,
  ) {
    this.maxReleasesPerApp = maxReleasesPerApp ? Number(maxReleasesPerApp) : 3;
  }

  async create(
    data: ReleaseIdentity & {
      uploadId: string;
    },
  ): Promise<schema.Release> {
    try {
    const existing = await this.releasesRepo.getByReleaseIdentity(data);

    if (existing) {
      throw new ConflictError("Release already exists");
    }

    const currentCount = await this.releasesRepo.countByAppId(data.appId);
    if (currentCount >= this.maxReleasesPerApp) {
      throw new BadRequestError(`Beta limit reached: Maximum of ${this.maxReleasesPerApp} releases per app allowed on beta cloud service.`);
    }

    const pendingUpload = await this.uploadService.validatePendingUpload(
      data.uploadId,
      data.appId,
    );

    const newRelease = await this.releasesRepo.create({
      ...data,
      pendingUpload,
    });
    if(!newRelease){
      throw new InternalServerError("Failed to create the new release");
    }
    return newRelease;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      console.error(error);
      throw new InternalServerError("Failed to create the new release");
    }
  }

  async getByReleaseIdentity(
    identity: ReleaseIdentity,
  ): Promise<schema.Release> {
    const release= await this.releasesRepo.getByReleaseIdentity(identity);
    if(!release){
      throw new NotFoundError("Release");
    }
    return release;
  }
}
