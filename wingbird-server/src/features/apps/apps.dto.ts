import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { schema } from "../../db/db";

export const AppDto = createSelectSchema(schema.appsTable).openapi("App");

export const CreateAppDto = createInsertSchema(schema.appsTable)
  .pick({
    name: true,
  })
  .openapi("CreateAppDto");
