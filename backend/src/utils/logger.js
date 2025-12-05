import winston from 'winston';
import { format } from 'date-fns';

const { combine, timestamp, printf, colorize, errors } = winston.format;

// Formato customizado de log
const customFormat = printf(({ level, message, timestamp, stack, ...metadata }) => {
  let msg = `${timestamp} [${level}]: ${message}`;
  
  // Adicionar metadados se existirem
  if (Object.keys(metadata).length > 0) {
    msg += ` ${JSON.stringify(metadata)}`;
  }
  
  // Adicionar stack trace se for erro
  if (stack) {
    msg += `\n${stack}`;
  }
  
  return msg;
});

// Criar logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    errors({ stack: true }),
    timestamp({
      format: () => format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
    }),
    customFormat
  ),
  transports: [
    // Console
    new winston.transports.Console({
      format: combine(
        colorize(),
        customFormat
      ),
    }),
    // Arquivo de erros
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Arquivo combinado
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

// Em desenvolvimento, logar tudo no console
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: combine(
      colorize(),
      customFormat
    ),
  }));
}

export default logger;
