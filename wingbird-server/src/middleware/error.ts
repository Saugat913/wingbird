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
 const method = c.req.method;
    const path = c.req.path;
    const userId = c.get("user")?.id ?? "anonymous";

    console.error(`[${method} ${path}] [user=${userId}] Error:`, err.message);

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
