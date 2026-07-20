import { Context } from "hono";

export class HttpError extends Error {
  status: number;
  
  constructor(message: string, status: number = 500) {
    super(message);
    this.status = status;
    this.name = "HttpError";
  }
}

export const errorHandler = async (err: Error, c: Context) => {
  console.error("Server error occurred:", err);

  if (err instanceof HttpError) {
    return c.json({ error: err.message }, err.status as any);
  }

  return c.json(
    { 
      error: err.message || "Internal Server Error" 
    }, 
    500
  );
};
