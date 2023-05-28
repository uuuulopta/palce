import "dotenv/config"
let fs = require("fs")
const toWrite = `export const env = {
    API_URL_PREFIX: "${process.env.API_URL_PREFIX}",
    API_PORT: ${process.env.API_PORT},
    WEBSOCKET_PORT: "${process.env.WEBSOCKET_PORT}",
    WEBSOCKET_HOST: "${process.env.WEBSOCKET_HOST}",
}`

fs.writeFile("build/env.js",toWrite,(err) =>{
    if(err) throw err
    console.log("Extracted env to build/env.js")
})

fs.writeFile("src/env.js",toWrite,(err) =>{
    if(err) throw err
    console.log("Extracted env to src/env.js")
})



