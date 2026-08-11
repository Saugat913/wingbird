import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

function createDb(db: D1Database) {
  return drizzle(db, {
    schema: schema,
  });
}

type DB = ReturnType<typeof createDb>;

export { schema, createDb, type DB };
