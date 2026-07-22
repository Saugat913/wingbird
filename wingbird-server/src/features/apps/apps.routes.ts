import { Hono } from "hono";
import { AppEnv } from "../../env";
import { HttpError } from "../../middleware/error";
import AppService from "./app.service";
import { requireAuth } from "../../middleware/auth";

const appsRouter= new Hono<AppEnv>();


appsRouter.post("/",requireAuth,async (c)=>{
    const { name } = await c.req.json();
    const db = c.var.db;
    const user= c.var.user;

    const appService= new AppService(db);

    if(await appService.isAppPresent(name, user.id)){
        throw new HttpError("App already exist", 400);
    }

    const { id, name: appName } = await appService.createApp(name, user.id);

    return c.json({ id, name: appName },201);
});

export default appsRouter;
