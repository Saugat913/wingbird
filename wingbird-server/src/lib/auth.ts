import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { bearer, jwt } from "better-auth/plugins";
import { AppEnv } from "../env";
import { createDb } from "./db";
import * as schema from "../db/schema";

export const initAuth = (env: AppEnv["Bindings"]) => {
  const db = createDb(env.wingbird_db);
  return betterAuth({
    database: drizzleAdapter(db, {
      provider: "sqlite",
      schema: schema,
    }),
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,
    socialProviders: {
      google: {
        clientId: env.GOOGLE_CLIENT_ID!,
        clientSecret: env.GOOGLE_CLIENT_SECRET!,
      },
    },
    plugins: [
      bearer(),
      jwt(),
    ],
  });
};