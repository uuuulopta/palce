
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
export async function insertColor(color: String,x: String,y: String): Promise<void> {
    var bdata = Buffer.from(color,"hex"); 
    const obj: Pixel = {color: bdata, x: Number( x ),y: Number( Number( y ) )}
    await pixels.updateOne({x: obj.x,y: obj.y},{ $set: obj },{upsert: true});
}
// temporary function for testing todo: remove

