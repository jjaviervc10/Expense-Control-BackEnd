// logger.js
// Logger estructurado para producción (puedes cambiar a winston si prefieres)
import pino from 'pino';
const logger = pino({ level: process.env.LOG_LEVEL || 'info' });
export default logger;
