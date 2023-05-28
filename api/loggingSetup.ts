
const winston = require('winston');
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf((info:any,)=> `${info.timestamp} [${info.parent}] ${info.level}: ${info.message} | ${info.caller} `)

    ),
    transports: [
        //
        // - Write all logs with importance level of `error` or less to `error.log`
        // - Write all logs with importance level of `info` or less to `combined.log`
        //
        new winston.transports.File({ filename: 'error.log', level: 'error',format:winston.format.json()}),
        new winston.transports.File({ filename: 'combined.log',format:winston.format.json()}),
    ],
});
 if (process.env.NODE_ENV !== 'production') {
   logger.add(new winston.transports.Console({
     level: "debug",
   }));
 }
export {logger}
