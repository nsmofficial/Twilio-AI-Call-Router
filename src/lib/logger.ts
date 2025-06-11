import fs from 'fs';
import path from 'path';

const logDirectory = path.join(process.cwd(), 'logs');
const logFilePath = path.join(logDirectory, 'app.log');

// Ensure log directory exists
if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory, { recursive: true });
}

type LogLevel = 'INFO' | 'WARN' | 'ERROR';

const log = (level: LogLevel, message: string, data?: object) => {
  const timestamp = new Date().toISOString();
  const logMessage = `${timestamp} [${level}] ${message}`;
  const logEntry = data ? `${logMessage}\n${JSON.stringify(data, null, 2)}\n` : `${logMessage}\n`;

  fs.appendFile(logFilePath, logEntry, (err) => {
    if (err) {
      console.error('Failed to write to log file:', err);
    }
  });
};

export const logger = {
  info: (message: string, data?: object) => log('INFO', message, data),
  warn: (message: string, data?: object) => log('WARN', message, data),
  error: (message: string, data?: object) => log('ERROR', message, data),
}; 