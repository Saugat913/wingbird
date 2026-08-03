import { createMiddleware } from "hono/factory";
import { eq ,and} from "drizzle-orm";
import AppEnv from "../env";
import { appsTable } from "../db/apps";
import { BadRequestError, NotFoundError } from "../error";

const requireAppAccess= createMiddleware<AppEnv>(async (c,next)=>{
    const appId = c.req.param("appId");
    const user = c.var.user;
    const db = c.var.db;

    if(!appId){
        throw new BadRequestError("Missing appId");
    }

    const [app]= await db.select().from(appsTable).where(and(eq(appsTable.id,appId), eq(appsTable.userId,user.id)));
    if(!app){
        throw new NotFoundError("App");
    }

    c.set("app", app);
    await next();
});


export default requireAppAccess;