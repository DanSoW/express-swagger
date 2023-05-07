import { createLogger, format, transports } from "winston";
const { combine, timestamp, json } = format;

const logger = createLogger({
    format: combine(
        timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        json(),
    ),
    transports: [
        new (transports.File)({
            name: 'info-file',
            filename: './logs/info.log',
            level: 'info'
        }),
        new (transports.File)({
            name: 'error-file',
            filename: './logs/error.log',
            level: 'error'
        }),
        new (transports.File)({
            name: 'debug-file',
            filename: './logs/debug.log',
            level: 'debug'
        }),
        new (transports.File)({
            name: 'warn-file',
            filename: './logs/warn.log',
            level: 'warn'
        })
    ]
});

export default logger;