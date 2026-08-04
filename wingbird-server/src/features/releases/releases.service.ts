import { schema } from "../../db/db";
import { AppError, ConflictError, InternalServerError, NotFoundError } from "../../error";
import { ReleaseIdentity } from "../../types/release-identity";
import { ReleasesRepository } from "./releases.repository";
import { UploadService } from "../upload/upload.service";

export class ReleasesService {
  constructor(
    private readonly releasesRepo: ReleasesRepository,
    private readonly uploadService: UploadService,
  ) {}

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

    const upload = await this.uploadService.validateAndPromote(
      data.uploadId,
      data.appId,
    );

    const newRelease= await this.releasesRepo.create({
      ...data,
      uploadId: upload.id,
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
