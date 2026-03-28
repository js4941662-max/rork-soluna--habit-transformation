// Advanced logging and error handling system

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4,
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: any;
  stack?: string;
}

class Logger {
  private static instance: Logger;
  private logs: LogEntry[] = [];
  private maxLogs = 1000;
  private currentLevel = LogLevel.INFO;

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  setLevel(level: LogLevel): void {
    this.currentLevel = level;
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.currentLevel;
  }

  private addLog(level: LogLevel, message: string, context?: any, error?: Error): void {
    if (!this.shouldLog(level)) return;

    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      stack: error?.stack,
    };

    this.logs.push(logEntry);

    // Keep only the most recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Console output for development
    if (__DEV__) {
      const levelNames = ['DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL'];
      const levelName = levelNames[level];
      const prefix = `[${levelName}] ${logEntry.timestamp}`;
      
      switch (level) {
        case LogLevel.DEBUG:
          console.log(prefix, message, context);
          break;
        case LogLevel.INFO:
          console.info(prefix, message, context);
          break;
        case LogLevel.WARN:
          console.warn(prefix, message, context);
          break;
        case LogLevel.ERROR:
        case LogLevel.FATAL:
          console.error(prefix, message, context, error);
          break;
      }
    }
  }

  debug(message: string, context?: any): void {
    this.addLog(LogLevel.DEBUG, message, context);
  }

  info(message: string, context?: any): void {
    this.addLog(LogLevel.INFO, message, context);
  }

  warn(message: string, context?: any): void {
    this.addLog(LogLevel.WARN, message, context);
  }

  error(message: string, context?: any, error?: Error): void {
    this.addLog(LogLevel.ERROR, message, context, error);
  }

  fatal(message: string, context?: any, error?: Error): void {
    this.addLog(LogLevel.FATAL, message, context, error);
  }

  getLogs(level?: LogLevel): LogEntry[] {
    if (level !== undefined) {
      return this.logs.filter(log => log.level >= level);
    }
    return [...this.logs];
  }

  clearLogs(): void {
    this.logs = [];
  }

  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

// Error boundary helper
export const withErrorHandling = <T extends any[]>(
  fn: (...args: T) => Promise<any>,
  context: string
) => {
  return async (...args: T) => {
    const logger = Logger.getInstance();
    try {
      logger.debug(`${context} started`, { args });
      const result = await fn(...args);
      logger.debug(`${context} completed successfully`);
      return result;
    } catch (error) {
      logger.error(`${context} failed`, { args, error: (error as Error).message }, error as Error);
      throw error;
    }
  };
};

// Performance monitoring helper
export const withPerformanceMonitoring = <T extends any[]>(
  fn: (...args: T) => any,
  operationName: string
) => {
  return (...args: T) => {
    const logger = Logger.getInstance();
    const startTime = performance.now();
    
    try {
      const result = fn(...args);
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      logger.debug(`${operationName} completed`, { duration });
      
      if (duration > 100) {
        logger.warn(`${operationName} took longer than expected`, { duration });
      }
      
      return result;
    } catch (error) {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      logger.error(`${operationName} failed`, { duration }, error as Error);
      throw error;
    }
  };
};

export default Logger;
