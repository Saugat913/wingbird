import { createMiddleware } from "hono/factory";
import { AppEnv } from "../env";
import { appTable } from "../db/apps";
import { eq ,and} from "drizzle-orm";
import { HttpError } from "./error";



const requireAppAccess= createMiddleware<AppEnv>(async (c,next)=>{
    const appId = c.req.param("appId");
    const user = c.var.user;
    const db = c.var.db;


    if(!appId){
        throw new HttpError("Missing appId",400);
    }

    const [app]= await db.select().from(appTable).where(and(eq(appTable.id,appId), eq(appTable.userId,user.id)));
    if(!app){
        throw new HttpError("App not found",404);
    }

    c.set("app", app);
    await next();
});


export default requireAppAccess;