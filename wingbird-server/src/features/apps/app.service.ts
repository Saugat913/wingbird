import { and, eq } from "drizzle-orm";
import { appTable } from "../../db/schema";
import { DB } from "../../env";


class AppService{
    db:DB;
    constructor(db: DB){
        this.db = db;
    }
    
    async createApp(name: string, userId: string):Promise<Record<string, string>>{
           const id= crypto.randomUUID();
           await this.db.insert(appTable).values({
               id,
               name,
               userId: userId,
           });

           return { id, name };
    }

    async isAppPresent(appName:string,userId:string):Promise<boolean>{
        return await this.db.select().from(appTable).where(and( eq(appTable.name, appName),eq(appTable.userId, userId))).then((app)=>app.length > 0);
        
    }
}


export default AppService;