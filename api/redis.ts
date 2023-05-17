import { createClient } from 'redis';
import { logger } from './loggingSetup';

function colorBufferToInt(color: Buffer): number{
return color.readUIntBE(0,1)
}
const client = createClient();
const run = async() => {

client.on('error', err => logger.error('Redis Client Error', err));
client.on('connect',(stream) => {logger.info("Successfully connected to localhost")});
await client.connect();
//await client.set("x1y1","pixel2");
//const res =await client.get("x1y1");
//console.log(res);
//client.disconnect();
}
async function setPixel(x: number, y: number, color: Buffer){
    const offset: number = 500 * y + x;
    const colorInt: Number = colorBufferToInt(color)
    await client.sendCommand([`BITFIELD field SET u24 ${offset} ${colorInt}`])

}
run();

