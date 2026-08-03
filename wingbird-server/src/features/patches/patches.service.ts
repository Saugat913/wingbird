import { schema } from "../../db/db";
import { InternalServerError, NotFoundError } from "../../error";
import { ReleaseIdentity } from "../../types/release-identity";
import { ReleasesRepository } from "../releases/releases.repository";
import { Architecture } from "../../types/architectures";
import { PatchesRepository } from "./patches.repository";

export class PatchesService {
  constructor(
    private readonly patchesRepo: PatchesRepository,
    private readonly releasesRepo: ReleasesRepository,
  ) { }

  async create(
    data: ReleaseIdentity & {
      architecture: Architecture;
      uploadId: string;
    },
  ): Promise<schema.Patch> {
    const release = await this.releasesRepo.getByReleaseIdentity(data);

    if (!release) {
      throw new NotFoundError("Release");
    }

    const latestPatchNumber =
      await this.patchesRepo.getLatestPatchNumberByReleaseIdentity({
        releaseId: release?.id,
        architecture: data.architecture,
      });

    const patchNumber = latestPatchNumber + 1;


    const newPatch = await this.patchesRepo.create({
      architecture: data.architecture,
      patchNumber: patchNumber,
      uploadId: data.uploadId,
      releaseId: release.id,
    });
    if(!newPatch){
      throw new InternalServerError("Cannot create new patch");
    }

    return newPatch;
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
