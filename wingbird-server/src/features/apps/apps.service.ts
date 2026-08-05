import { schema } from "../../db/db";
import { InternalServerError, NotFoundError } from "../../error";
import { AppsRepository } from "./apps.repository";

export class AppService {
  constructor(private appRepo: AppsRepository) { }

  async create(data: {
    name: string;
    userId: string;
  }): Promise<schema.App> {
    const app = await this.appRepo.create(data);
    if (!app) {
      throw new InternalServerError("Failed to create the app");
    }
    return app;
  }

  async getAll(userId: string): Promise<schema.App[]> {
    return this.appRepo.getAll(userId);
  }

  async delete(id: string, userId: string) {
    const deleted = await this.appRepo.delete(id, userId);
    if (!deleted) {
      throw new NotFoundError("App");
    }
  }
}
