import { Context } from "hono";
import { HTTPResponseError } from "hono/types";
import AppEnv from "./env";
import { ContentfulStatusCode } from "hono/utils/http-status";

export class AppError extends Error {
  constructor(
    public message: string,
    public status: number,
  ) {
    super(message);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409);
  }
}

export class ForbiddenError extends AppError {
  constructor() {
    super("You don't have permission", 403);
  }
}

export class UnauthorizedError extends AppError {
  constructor() {
    super("Unauthorized", 401);
  }
}

export class InternalServerError extends AppError {
  constructor(messgae: string) {
    super(messgae, 500);
  }
}

export class BadRequestError extends AppError {
  constructor(message: string) {
    super(message, 400);
  }
}

export async function errorHandler(
  err: Error | HTTPResponseError,
  context: Context<AppEnv, any, {}>,
) {
  console.error(`${err}`);
  if (err instanceof AppError) {
    return context.json(
      {
        error: err.message,
      },
      err.status as ContentfulStatusCode,
    );
  }

  return context.json(
    {
      error: "Internal Server Error",
    },
    500,
  );
}
