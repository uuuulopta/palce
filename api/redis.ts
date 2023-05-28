import { createClient,commandOptions } from 'redis';
import { logger as loggerp} from './loggingSetup';
import  {WithId,BSON} from "mongodb"
import "dotenv/config"
class Redis{
    logger:any;
    constructor(logger_name:string){
        this.logger = loggerp.child({parent:logger_name,caller:"redis"}) 
    }
    colorBufferToInt(color: Buffer,bytes:number): number{
        const buf = Buffer.alloc(bytes)
        const temp = color;
        temp.copy(buf, buf.length - temp.length)
        return buf.readUIntBE(0,bytes)
    }
    getOffset = (x: number,y: number): number => { return  500 * y + x };
    client = createClient({url: process.env.REDIS_URL });
    run = async() => {

        this.client.on('error', err => this.logger.error('Redis Client Error', err));
        this.client.on('connect',() => {this.logger.info(`Connected to redis at ${process.env.REDIS_URL}`)});
        await this.client.connect();

    }
    async setColor(x: number, y: number, color: Buffer){
        const offset = this.getOffset(x,y);
        const colorInt: number = this.colorBufferToInt(color,4)
        this.client.bitField("field",[{
            operation: "SET",
            encoding: "u32",
            offset: "#" + offset.toString(),
            value: colorInt

        }])

    }

     async  setColorTransaction(x: number, y: number, color: Buffer,transaction: any){
        const offset = this.getOffset(x,y);
        const colorInt = color.readUint32BE()
        transaction.bitField("field",[{
            operation: "SET",
            encoding: "u32",
            offset: "#" + offset.toString(),
            value: colorInt

        }])

    }
     async  readField(){
        const field = await this.client.get(commandOptions({returnBuffers:true}),"field");
        if(field == null) return Buffer.from( Uint8ClampedArray.from([255,255,255,255]) )
            return Buffer.from( Uint8ClampedArray.from(field) ) 
    }

     async initializeEmptyField(){
        let empty = new Uint8Array(4*500*500).fill(255,0,4*500*500-1)
        this.client.setRange("field",0,Buffer.from(empty))
    }

     async  importField(data: WithId<BSON.Document>[]){
        const transaction = this.client.multi()
        this.initializeEmptyField()
        let pixel : WithId<BSON.Document> | undefined = data.shift();
        while(typeof pixel != "undefined"){
            const x: number = pixel.x 
            const y: number = pixel.y 
            const color: Buffer = pixel.color.buffer
            this.setColorTransaction(x,y,color,transaction)
            pixel = data.shift() 
        }
        await transaction.exec(true);
    }
     async  empty(){
        return await this.client.exists("field")
    }
     async  setExpire(){
        await this.client.expire("field",1800)
    }
}
export {Redis}
