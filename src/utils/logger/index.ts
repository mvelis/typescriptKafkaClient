import { TransformableInfo } from 'logform'
import winston, { format, Logger } from 'winston'
import config from '../config'

interface WinstonLogger {
  setPrefix: (prefix: string) => void
  mute: () => void
  unmute: () => void
  error: (messages: string[]) => void
  warn: (messages: string | string[]) => void
  info: (...messages: string[]) => void
  verbose: (messages: string | string[]) => void
  debug: (messages: string | string[]) => void
  silly: (messages: string | string[]) => void
}

export const formatLog = (info: TransformableInfo): string => `${info.timestamp} ${info.level}: ${info.message}`

// Log levels precedence [error, warn, info, verbose, debug, silly]
const logger: Logger = winston.createLogger({
  format: winston.format.json(),
  transports: [
    new winston.transports.Console({
      format: format.combine(format.timestamp(), format.align(), format.colorize(), format.printf(formatLog)),
      level: config.get('LOG_LEVEL').toString(),
      handleExceptions: true,
    }),
  ],
})

// logger.error('log level error registered')
// logger.warn('log level warn registered')
// logger.info('log level info registered')
// logger.verbose('log level verbose registered')
// logger.debug('log level debug registered')
// logger.silly('log level silly registered')

function makeLogger(logger: Logger): WinstonLogger {
  let prefix = ''

  return {
    mute: (): void => {
      logger.level = 'none'
    },
    unmute: (): void => {
      logger.level = config.get('LOG_LEVEL').toString()
    },
    setPrefix: (_prefix: string): void => {
      prefix = _prefix
    },
    error: (...messages): void => {
      logger.error(`[${prefix}] ${messages.join(' ')}`)
    },
    warn: (...messages): void => {
      logger.warn(`[${prefix}] ${messages.join(' ')}`)
    },
    info: (...messages): void => {
      logger.info(`[${prefix}] ${messages.join(' ')}`)
    },
    verbose: (...messages): void => {
      logger.verbose(`[${prefix}] ${messages.join(' ')}`)
    },
    debug: (...messages): void => {
      logger.debug(`[${prefix}] ${messages.join(' ')}`)
    },
    silly: (...messages): void => {
      logger.silly(`[${prefix}] ${messages.join(' ')}`)
    },
  }
}

export default makeLogger(logger)
