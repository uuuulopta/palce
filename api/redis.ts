import { createClient,commandOptions } from 'redis';
import { logger } from './loggingSetup';
import  {WithId,BSON} from "mongodb"
import "dotenv/config"
function colorBufferToInt(color: Buffer,bytes:number): number{
const buf = Buffer.alloc(bytes)
const temp = color;
temp.copy(buf, buf.length - temp.length)
return buf.readUIntBE(0,bytes)
}
const getOffset = (x: number,y: number): number => { return  500 * y + x };
const client = createClient({url: process.env.REDIS_URL });
export const run = async() => {

client.on('error', err => logger.error('Redis Client Error', err));
client.on('connect',() => {logger.info(`Connected to redis at ${process.env.REDIS_URL}`)});
await client.connect();

}
export async function setColor(x: number, y: number, color: Buffer){
    const offset = getOffset(x,y);
    const colorInt: number = colorBufferToInt(color,4)
     client.bitField("field",[{
        operation: "SET",
        encoding: "u32",
        offset: "#" + offset.toString(),
        value: colorInt

    }])

}

export async function setColorTransaction(x: number, y: number, color: Buffer,transaction: any){
    const offset = getOffset(x,y);
    const colorInt = color.readUint32BE()
     transaction.bitField("field",[{
        operation: "SET",
        encoding: "u32",
        offset: "#" + offset.toString(),
        value: colorInt

    }])

}
export async function readField(){
    const field = await client.get(commandOptions({returnBuffers:true}),"field");
    if(field == null) return Buffer.from( Uint8ClampedArray.from([255,255,255,255]) )
    return Buffer.from( Uint8ClampedArray.from(field) ) 
}

export async function initializeEmptyField(){
    let empty = new Uint8Array(4*500*500).fill(255,0,4*500*500-1)
    client.setRange("field",0,Buffer.from(empty))
    }

export async function importField(data: WithId<BSON.Document>[]){
    const transaction = client.multi()
    initializeEmptyField()
    let pixel : WithId<BSON.Document> | undefined = data.shift();
    while(typeof pixel != "undefined"){
        const x: number = pixel.x 
        const y: number = pixel.y 
        const color: Buffer = pixel.color.buffer
        setColorTransaction(x,y,color,transaction)
        pixel = data.shift() 
    }
    await transaction.exec(true);
}
export async function empty(){
   return await client.exists("field")
}
export async function setExpire(){
    await client.expire("field",1800)
}
