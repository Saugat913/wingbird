import { DB, schema } from "./db/db";
import { AppService } from "./features/apps/apps.service";
import { PatchesService } from "./features/patches/patches.service";
import { ReleasesService } from "./features/releases/releases.service";
import { UploadService } from "./features/upload/upload.service";


type Bindings = {
  wingbird_db: D1Database;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
  S3_ACCESS_KEY_ID: string;
  S3_ACCESS_KEY: string;
  S3_BUCKET: string;
  S3_ENDPOINT: string;
  S3_REGION: string;
  S3_PRESIGNED_EXPIRE_SECONDS: number;
  MAX_RELEASES_PER_APP?: number | string;
  MAX_PATCHES_PER_RELEASE?: number | string;
};

type Variables = {
  db: DB;
  user: schema.User;
  app: schema.App;

  appService: AppService;
  releaseService:ReleasesService;
  uploadService: UploadService;
  patchService: PatchesService;
};

type AppEnv = {
  Bindings: Bindings;
  Variables: Variables;
};

export default AppEnv;