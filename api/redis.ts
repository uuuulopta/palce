import { createClient,commandOptions } from 'redis';
import { logger } from './loggingSetup';
import  {WithId,BSON} from "mongodb"

function colorBufferToInt(color: Buffer,bytes:number): number{
const buf = Buffer.alloc(bytes)
const temp = color;
temp.copy(buf, buf.length - temp.length)
return buf.readUIntBE(0,bytes)
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
    console.log(x,y)
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
    console.log("reading field")
   const field = await client.get(commandOptions({returnBuffers:true}),"field");
   
   //TODO: if field ismpty transfer mongodb to redis and read field again
   console.log("returning")
    if(field == null) return Buffer.from( Uint8ClampedArray.from([255,255,255,255]) )
    return Buffer.from( Uint8ClampedArray.from(field) ) 
}

// TODO: find a better solution
// when it gets connected to mongodb it should just pull data from it
export async function initializeEmptyField(){
    //const transaction = client.multi()
    //for(var x = 0;x<500;x++){
    //    for(var y = 0;y<500;y++){
    //       setColorTransaction(x,y,Buffer.from("FFFFFFFF","hex"),transaction)
    //    }

    //}
    // await transaction.exec(true);
    setColor(499,499,Buffer.from("FFFFFFFF","hex"))

}

export async function importMongo(data: WithId<BSON.Document>[]){
    const transaction = client.multi()
    let pixel : WithId<BSON.Document> | undefined = data.shift();
    let y_max: number = 0;
    let x_max: number = 0;
    while(typeof pixel != "undefined"){
        const x: number = pixel.x 
        const y: number = pixel.y 
        const color: Buffer = pixel.color.buffer
        setColorTransaction(x,y,color,transaction)
        pixel = data.shift() 
        if(y > y_max){
            y_max = y;
            x_max = x;
        }
        else if(y == y_max && x > x_max) x_max = x; 
    }
    if(y_max != 499 && x_max != 499) setColorTransaction(499,499,Buffer.from("FFFFFFFF","hex"),transaction)
    await transaction.exec(true);
}

