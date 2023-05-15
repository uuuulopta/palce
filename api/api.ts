import {Express, Request, Response,} from "express"
import express = require("express");
import {  MongoClient, ServerApiVersion } from "mongodb";
import {logger} from "./loggingSetup"
import dotenv = require('dotenv')
dotenv.config()


interface Pixel{
color: String;
x: Number;
y: Number;
}
const app: Express = express()
const port = 300

const uri = "mongodb://127.0.0.1:27017";
const client = new MongoClient(uri,  {
        serverApi: {
            version: ServerApiVersion.v1,
            strict: true,
            deprecationErrors: true,
        }
    }
);

const hexToBase64 = function(hex: String) {return Buffer.from(hex, 'hex').toString('base64') }
const Base64ToHex = function(base64: String) {return Buffer.from(base64, 'base64').toString('hex') }
const run = async () => {
await client.connect().then(() => {logger.info(`Connected to ${uri} `)})
.catch((err) => {logger.error(`Failed to conenct to ${err.message}`)});
}

run();
const pixels = client.db("place").collection("pixels");
const hexRegex = new RegExp("[0-9A-F]{6}")
// pixels.insertOne({value: hexToBase64("FFFFFF"),x: 0, y: 0});
//const docs = pixels.find({},{projection: {_id: 0}});
//for await (const doc of docs){
//    console.dir(doc);
//}
console.log("Path = " + "/" + process.env.API_URL_PREFIX +  '/api')
  app.get(( "/" + process.env.API_URL_PREFIX +  '/api' ).replace("//","/"), async (req: Request, res: Response) => {
  try{
    console.log("GET")
    if(typeof req.query.color !== "string") throw new Error("Color is not a string!")
    if(typeof req.query.x !== "string") throw new Error("X is not a string!")
    if(typeof req.query.y !== "string") throw new Error("Y is not a string!")
    if(req.query.color && req.query.x && req.query.y){
        if(!hexRegex.test(req.query.color)) throw Error("Bad color value!");
        if(!RegExp( "[0-9]+" ).test(req.query.x)) throw Error("x is not a number!")
        if(!RegExp( "[0-9]+" ).test(req.query.y)) throw Error("y is not a number!")


        const obj: Pixel = {color: req.query.color, x: Number( req.query.x ),
         y: Number( Number( req.query.y ) )}
        res.send(obj)
    }
    
  }
  catch (error){
    logger.error(error.message)
    res.send(error.message) 
  }
  })
  
  app.listen(port, () => {
    logger.info("Listening on port 300")
  });

