import { createLogger, format, transports } from "winston";

export const logger = createLogger({
  level: process.env.LOG_LEVEL,
  silent: process.env.NODE_ENV === 'test', // hide logging during tests so output is clean
  format: format.combine(
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    format.errors({ stack: true }),
    format.splat(),
    format.json(),
    format.colorize(),
    format.align(),
    format.printf((info) => `[${info.timestamp}] ${info.level} ${info.message}\n${info.stack}`)
  ),
  defaultMeta: { service: 'location-service' },
  transports: [
    new transports.Console()
  ]
});