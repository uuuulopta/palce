import { createClient } from 'redis';
import { logger } from './loggingSetup';

function colorBufferToInt(color: Buffer): number{
const buf = Buffer.alloc(3)
const temp = color; 
temp.copy(buf, buf.length - temp.length)
return buf.readUIntBE(0,3)
}
const getOffset = (x: number,y: number): number => { return  500 * y + x };
const client = createClient();
const run = async() => {

client.on('error', err => logger.error('Redis Client Error', err));
client.on('connect',(stream) => {logger.info("Successfully connected to localhost")});
await client.connect();
//await client.set("x1y1","pixel2");
//const res =await client.get("x1y1");
//console.log(res);
//client.disconnect();
const field = await client.get("field") 
console.dir(Buffer.from(field).readInt8(2));
}
async function setColor(x: number, y: number, color: Buffer){
    const offset = getOffset(x,y);
    const colorInt: number = colorBufferToInt(color)
    await client.bitField("field",[{
        operation: "SET",
        encoding: "u24",
        offset: offset,
        value: colorInt

    }])

}

async function readField(){
   const field = await client.get("field");
    return Uint8ClampedArray.from(Buffer.from( field )) 
}
run();

