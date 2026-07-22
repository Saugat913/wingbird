import { and, eq } from "drizzle-orm";
import { app } from "../../db/schema";
import { DB } from "../../env";


class AppService{
    db:DB;
    constructor(db: DB){
        this.db = db;
    }
    
    async createApp(name: string, userId: string):Promise<Record<string, string>>{
           const id= crypto.randomUUID();
           await this.db.insert(app).values({
               id,
               name,
               userId: userId,
           });

           return { id, name };
    }

    async isAppPresent(appName:string,userId:string):Promise<boolean>{
        return await this.db.select().from(app).where(and( eq(app.name, appName),eq(app.userId, userId))).then((app)=>app.length > 0);
        
    }
}


export default AppService;