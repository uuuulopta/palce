import { createClient,commandOptions } from 'redis';
import { logger } from './loggingSetup';

function colorBufferToInt(color: Buffer): number{
const buf = Buffer.alloc(4)
const temp = color;
console.log(color)
console.log(buf)
temp.copy(buf, buf.length - temp.length)
return buf.readUIntBE(0,4)
}
const getOffset = (x: number,y: number): number => { return  500 * y + x };
const client = createClient();
export const run = async() => {

client.on('error', err => logger.error('Redis Client Error', err));
client.on('connect',() => {logger.info("Successfully connected to redis")});
await client.connect();

}
export async function setColor(x: number, y: number, color: Buffer){
    const offset = getOffset(x,y);
    const colorInt: number = colorBufferToInt(color)
    console.log(`ColorInt: ${colorInt},Offset: ${offset}`)
    await client.bitField("field",[{
        operation: "SET",
        encoding: "u32",
        offset: "#" + offset.toString(),
        value: colorInt

    }])

}

export async function readField(){
   const field = await client.get(commandOptions({returnBuffers:true}),"field");
   //TODO: if field is empty transfer mongodb to redis and read field again
    if(field == null) return Buffer.from( Uint8ClampedArray.from([255,255,255,255]) )
    return Buffer.from( Uint8ClampedArray.from(field) ) 
}


