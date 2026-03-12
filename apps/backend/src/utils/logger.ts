import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import winston from 'winston';
import winstonDaily from 'winston-daily-rotate-file';
import { LOG_DIR } from '../config';

// Allow explicit disabling of logging via env, or by default on Vercel
const DISABLE_LOGGING = true;

// Simple no-op logger used when logging is disabled
const createNoopLogger = () => ({
  info: (_: any) => undefined,
  warn: (_: any) => undefined,
  error: (_: any) => undefined,
  debug: (_: any) => undefined,
  silly: (_: any) => undefined,
  child: () => createNoopLogger(),
});

// Top-level exports (assigned below)
let logger: any;
let stream: { write: (message: string) => void };

if (DISABLE_LOGGING) {
  // No-op logger and stream
  logger = createNoopLogger();
  stream = { write: (_message: string) => undefined };
} else {
  // logs dir (resolve relative to compiled dist folder)
  const logDir: string = join(__dirname, LOG_DIR);

  // Try to create the directory; if it fails, fall back to console-only logging.
  let canWriteLogs = true;
  try {
    if (!existsSync(logDir)) {
      mkdirSync(logDir, { recursive: true });
    }
  } catch (err) {
    canWriteLogs = false;
    // eslint-disable-next-line no-console
    console.warn(`Logger: cannot create log directory ${logDir}, file logging disabled. Reason: ${err}`);
  }

  // Define log format
  const logFormat = winston.format.printf(({ timestamp, level, message }) => `${timestamp} ${level}: ${message}`);

  logger = winston.createLogger({
    format: winston.format.combine(winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), logFormat),
    transports: [],
  });

  if (canWriteLogs && !process.env.VERCEL) {
    logger.add(
      new winstonDaily({
        level: 'debug',
        datePattern: 'YYYY-MM-DD',
        dirname: logDir + '/debug',
        filename: `%DATE%.log`,
        maxFiles: 30,
        json: false,
        zippedArchive: true,
      }),
    );

    logger.add(
      new winstonDaily({
        level: 'error',
        datePattern: 'YYYY-MM-DD',
        dirname: logDir + '/error',
        filename: `%DATE%.log`,
        maxFiles: 30,
        handleExceptions: true,
        json: false,
        zippedArchive: true,
      }),
    );
  }

  // Always add console transport so logs appear in stdout
  logger.add(new winston.transports.Console({ format: winston.format.combine(winston.format.splat(), winston.format.colorize()) }));

  stream = {
    write: (message: string) => {
      logger.info(message.substring(0, message.lastIndexOf('\n')));
    },
  };
}

export { logger, stream };
