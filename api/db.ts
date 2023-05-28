import {  MongoClient, ServerApiVersion, WithId, Document} from "mongodb";
import "dotenv/config"
export const uri = process.env.MONGO_URI;
export const client = new MongoClient(uri,  {
        serverApi: {
            version: ServerApiVersion.v1,
            strict: true,
            deprecationErrors: true,
        }
    }
);
export interface Pixel{
color: Buffer;
x: Number;
y: Number;
}

export const pixels = client.db("place").collection("pixels");
export async function insertColor(color: Buffer,x: number,y: number): Promise<void> {
    const obj: Pixel = {color: color, x:  x ,y:   y  }
    await pixels.updateOne({x: obj.x,y: obj.y},{ $set: obj },{upsert: true});
}
export async function exportField(){
   return await pixels.find({}).toArray();
}

