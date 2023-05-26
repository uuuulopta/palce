import { WebSocketServer,WebSocket } from 'ws';
import {mongo,redis,logger,dotenv,BSON} from "./imports"

function parseInput(color: string, x: string, y: string, callback: Function){
    const hexRegex = new RegExp("[0-9A-Fa-f]{6}")
    if(!hexRegex.test(color)) throw Error("Bad color value!");
    if(!RegExp( "[0-9]+" ).test(x)) throw Error("Bad X")
    if(!RegExp( "[0-9]+" ).test(y)) throw Error("Bad Y")
    callback()
}
const ws = new WebSocketServer({ port: 8080 });
console.log("Lisetning on 8080")

ws.on("connection",function connection(wsclient){
    wsclient.on("error", logger.info)
    wsclient.on('message', function message(data) {
        try {
            console.log('received: %s', data);
            let message:string = data.toString()
            const params = message.split(" ")
            if(params.length != 3) throw Error("Received bad message")
                parseInput(params[2],params[0],params[1],() => {
                    ws.clients.forEach(function each(client){
                        if(wsclient != client && client.readyState == WebSocket.OPEN){
                            client.send(message)
                        }
                    })    
                })
        }
        catch (error){
            logger.error(error.message)
        }
    });
})
