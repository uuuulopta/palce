import {Express, Request, Response,} from "express"
import express = require("express");
import {mongo,redis,logger,dotenv,BSON} from "./imports"

dotenv.config()
async function parseInput(color: string, x: string, y: string, callback: Function){
    const hexRegex = new RegExp("[0-9A-Fa-f]{6}")
    if(typeof color !== "string") throw Error("Color is not a string!")
        if(typeof x !== "number") throw Error("X is not a number!")
        if(typeof y !== "number") throw Error("Y is not a number!")
        if(color && x && y){
            if(!hexRegex.test(color)) throw Error("Bad color value!");
            if(!RegExp( "[0-9]+" ).test(x)) throw Error("Bad X")
            if(!RegExp( "[0-9]+" ).test(y)) throw Error("Bad Y")
            await callback(Buffer.from( color + "FF","hex" ),Number(x),Number(y))
    }
}


const app: Express = express()
app.use(express.json())
app.use(express.urlencoded({extended: true}))
const port = 3000



const run = async () => {

await mongo.client.connect().then(() => {logger.info(`Connected to ${mongo.uri} `)})
await redis.run();
app.get(( "/" + process.env.API_URL_PREFIX +  '/api/getField' ).replace("//","/"), async (req: Request, res: Response) => {
  try{
    if(!await redis.empty()){
        var field = await mongo.exportField()
        await redis.importField(field)
    }
    res.send( await redis.readField() );
  }
  catch (error){
    logger.error(error.message)
    res.send(error.message) 
  }
  })
app.post(( "/" + process.env.API_URL_PREFIX +  '/api/setColor' ).replace("//","/"), async (req: Request, res: Response) => {
  try{
      await parseInput(<string>req.body.color,req.body.x,req.body.y,async (color:Buffer,x:number,y:number)=>{
          await mongo.insertColor(color,x,y)
          await redis.setColor(x,y,color);
      }).catch((error) => {throw error})
      res.sendStatus(200)

  }
  catch (error){
    logger.error(error.message)
    res.statusCode = 400
    res.send(error.message) 
  }
  })
   
  app.listen(port, () => {
    logger.info(`Listening on port ${port}`)
  });
}

run();
