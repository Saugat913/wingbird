import { schema } from "../../db/db";
import { BadRequestError, InternalServerError, NotFoundError } from "../../error";
import { ReleaseIdentity } from "../../types/release-identity";
import { ReleasesRepository } from "../releases/releases.repository";
import { Architecture } from "../../types/architectures";
import { PatchesRepository } from "./patches.repository";
import { UploadService } from "../upload/upload.service";

export class PatchesService {
  private readonly maxPatchesPerRelease: number;

  constructor(
    private readonly patchesRepo: PatchesRepository,
    private readonly releasesRepo: ReleasesRepository,
    private readonly uploadService: UploadService,
    maxPatchesPerRelease?: number | string,
  ) {
    this.maxPatchesPerRelease = maxPatchesPerRelease ? Number(maxPatchesPerRelease) : 3;
  }

  async create(
    data: ReleaseIdentity & {
      patches: { architecture: Architecture; uploadId: string }[];
    },
  ): Promise<schema.Patch[]> {
    const release = await this.releasesRepo.getByReleaseIdentity(data);

    if (!release) {
      throw new NotFoundError("Release");
    }

    const rows = await Promise.all(data.patches.map(async (e)=>{
      const pendingUpload = await this.uploadService.validatePendingUpload(e.uploadId, data.appId);
      const patchNumber = await this.nextPatchNumber(
        release.id,
        e.architecture,
      );

      if (patchNumber > this.maxPatchesPerRelease) {
        throw new BadRequestError(`Beta limit reached: Maximum of ${this.maxPatchesPerRelease} patches per release allowed.`);
      }
      
      return {
        architecture: e.architecture,
        patchNumber:  patchNumber,
        pendingUpload: pendingUpload,
        releaseId: release.id,
      };
    }));

    const created = await this.patchesRepo.create(rows);

    if(!created){
      throw new InternalServerError("Cannot create patches");
    }

    return created;
  }

  private async nextPatchNumber(
    releaseId: string,
    architecture: Architecture,
  ): Promise<number> {
    const latestPatchNumber =
      await this.patchesRepo.getLatestPatchNumberByReleaseIdentity({
        releaseId,
        architecture,
      });

    return latestPatchNumber + 1;
  }

  async getLatestPatch(
    data: ReleaseIdentity & {
      architecture: Architecture
    }
  ): Promise<schema.Patch> {
    const release = await this.releasesRepo.getByReleaseIdentity(data);

    if (!release) {
      throw new NotFoundError("Release");
    }

    const latestPatch =
      await this.patchesRepo.getLatestPatchByReleaseIdentity({
        releaseId: release?.id,
        architecture: data.architecture,
      });

    if(!latestPatch){
      throw new NotFoundError("Latest Patch")
    }

    return latestPatch;
  }
}

