import type { DrizzleD1Database } from "drizzle-orm/d1";
import * as schema from "./db/schema";


export type Bindings = {
  wingbird_db: D1Database;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
  WINGBIRD_FRONTEND_URL: string;
  B2_KEY_ID: string;
  B2_APP_KEY: string;
  B2_BUCKET: string;
  B2_ENDPOINT: string;
  B2_REGION: string;
};

export type Variables = {
  db: DrizzleD1Database<typeof schema>;
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