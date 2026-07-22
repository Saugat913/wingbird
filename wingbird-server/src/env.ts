import type { DrizzleD1Database } from "drizzle-orm/d1";
import * as schema from "./db/schema";


export type Bindings = {
  wingbird_db: D1Database;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
  WINGBIRD_FRONTEND_URL: string;
  S3_ACCESS_KEY_ID: string;
  S3_ACCESS_KEY: string;
  S3_BUCKET: string;
  S3_ENDPOINT: string;
  S3_REGION: string;
};

export type Variables = {
  db: DB;
  user: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  };
};

export type AppEnv = {
  Bindings: Bindings;
  Variables: Variables;
};

export type DB = DrizzleD1Database<typeof schema>;