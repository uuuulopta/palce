import {  MongoClient, ServerApiVersion, WithId, Document} from "mongodb";
export const uri = "mongodb://127.0.0.1:27017";
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
export async function exportFieldRedis(){
   return await pixels.find({}).toArray();
}

