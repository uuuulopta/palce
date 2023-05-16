import {Express, Request, Response,} from "express"
import express = require("express");
import {uri,client,Pixel,pixels,insertColor}  from "./db";
import {logger} from "./loggingSetup"
import dotenv = require('dotenv')
import { buffer } from "stream/consumers";
dotenv.config()

async function parseInput(color: any, x: any, y: any, callback: Function){
    const hexRegex = new RegExp("[0-9A-F]{6}")
    if(typeof color !== "string") throw new Error("Color is not a string!")
        if(typeof x !== "string") throw new Error("X is not a string!")
        if(typeof y !== "string") throw new Error("Y is not a string!")
        if(color && x && y){
            if(!hexRegex.test(color)) throw Error("Bad color value!");
            if(!RegExp( "[0-9]+" ).test(x)) throw Error("x is not a number!")
            if(!RegExp( "[0-9]+" ).test(y)) throw Error("y is not a number!")
            await callback(color,x,y)
    }
}
const app: Express = express()
const port = 300


const hexToBase64 = function(hex: String) {return Buffer.from(hex, 'hex').toString('base64') }
const Base64ToHex = function(base64: String) {return Buffer.from(base64, 'base64').toString('hex') }
const run = async () => {
await client.connect().then(() => {logger.info(`Connected to ${uri} `)})
// pixels.insertOne({value: hexToBase64("FFFFFF"),x: 0, y: 0});
//const docs = pixels.find({},{projection: {_id: 0}});
//for await (const doc of docs){
//    console.dir(doc);
//}
console.log("Path = " + "/" + process.env.API_URL_PREFIX +  '/api')
  app.get(( "/" + process.env.API_URL_PREFIX +  '/api' ).replace("//","/"), async (req: Request, res: Response) => {
  try{
    console.log("GET")
    parseInput(req.query.color,req.query.x,req.query.y,async (color: String,x: String,y: String) => {
        await insertColor(color,x,y);
        const pixelsArray = await pixels.find({}).toArray()
        res.send(pixelsArray);
    })
  }
  catch (error){
    logger.error(error.message)
    res.send(error.message) 
  }
  })
  
  app.listen(port, () => {
    logger.info("Listening on port 300")
  });
}
 run();
