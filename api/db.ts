import {  MongoClient, ServerApiVersion} from "mongodb";
import { logger as loggerp } from "./loggingSetup";
import "dotenv/config"
export interface Pixel{
        color: Buffer;
        x: Number;
        y: Number;
    }
export class Mongo{
    logger;
    constructor(logger_name:string){
        this.logger = loggerp.child({parent:logger_name,caller:"mongo"}) 
    }
    uri = process.env.MONGO_URI;
    client = new MongoClient(this.uri,  {
            serverApi: {
                version: ServerApiVersion.v1,
                strict: true,
                deprecationErrors: true,
            }
        }
    );
    pixels = this.client.db("place").collection("pixels");
    async insertColor(color: Buffer,x: number,y: number): Promise<void> {
        const obj: Pixel = {color: color, x:  x ,y:   y  }
        await this.pixels.updateOne({x: obj.x,y: obj.y},{ $set: obj },{upsert: true});
        this.logger.debug(`Set pixel ${obj}`)
    }
     async exportField(){
       this.logger.debug("Exported field")
       return await this.pixels.find({}).toArray();
    }
}
