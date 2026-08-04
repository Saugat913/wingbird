import { schema } from "../../db/db";
import { InternalServerError, NotFoundError } from "../../error";
import { ReleaseIdentity } from "../../types/release-identity";
import { ReleasesRepository } from "../releases/releases.repository";
import { Architecture } from "../../types/architectures";
import { PatchesRepository } from "./patches.repository";
import { UploadService } from "../upload/upload.service";

export class PatchesService {
  constructor(
    private readonly patchesRepo: PatchesRepository,
    private readonly releasesRepo: ReleasesRepository,
    private readonly uploadService: UploadService,
  ) { }

  async createBatch(
    data: ReleaseIdentity & {
      patches: { architecture: Architecture; uploadId: string }[];
    },
  ): Promise<schema.Patch[]> {
    const release = await this.releasesRepo.getByReleaseIdentity(data);

    if (!release) {
      throw new NotFoundError("Release");
    }

    const created: schema.Patch[] = [];
    for (const p of data.patches) {
      const upload = await this.uploadService.validateAndPromote(
        p.uploadId,
        data.appId,
      );

      const patchNumber = await this.nextPatchNumber(release.id, p.architecture);

      const newPatch = await this.patchesRepo.create({
        architecture: p.architecture,
        patchNumber,
        uploadId: upload.id,
        releaseId: release.id,
      });
      if(!newPatch){
        throw new InternalServerError("Cannot create new patch");
      }
      created.push(newPatch);
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
