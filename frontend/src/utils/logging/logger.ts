import { FEATURES } from '../config/environment';

/**
 * Log levels
 */
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info', 
  WARN = 'warn',
  ERROR = 'error',
}

/**
 * Logger options
 */
interface LoggerOptions {
  level: LogLevel;
  prefix?: string;
  enableConsole?: boolean;
  enableReporting?: boolean;
}

/**
 * Log entry structure
 */
interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: any;
  prefix?: string;
}

/**
 * Enhanced logger utility for consistent logging and error tracking
 */
class Logger {
  private options: LoggerOptions;
  private readonly MAX_LOG_SIZE = 100;
  private logHistory: LogEntry[] = [];

  constructor(options: Partial<LoggerOptions> = {}) {
    this.options = {
      level: options.level || (FEATURES.DEBUG_MODE ? LogLevel.DEBUG : LogLevel.INFO),
      prefix: options.prefix || '',
      enableConsole: options.enableConsole !== undefined ? options.enableConsole : true,
      enableReporting: options.enableReporting !== undefined ? options.enableReporting : FEATURES.ENABLE_ERROR_TRACKING,
    };
  }

  /**
   * Log a debug message
   */
  public debug(message: string, context?: any): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  /**
   * Log an info message
   */
  public info(message: string, context?: any): void {
    this.log(LogLevel.INFO, message, context);
  }

  /**
   * Log a warning message
   */
  public warn(message: string, context?: any): void {
    this.log(LogLevel.WARN, message, context);
  }

  /**
   * Log an error message
   */
  public error(message: string, context?: any): void {
    this.log(LogLevel.ERROR, message, context);
  }

  /**
   * Log an exception with stack trace
   */
  public exception(error: Error, context?: any): void {
    this.error(
      `${error.name}: ${error.message}`,
      {
        ...context,
        stack: error.stack,
      }
    );
  }

  /**
   * Internal logging method
   */
  private log(level: LogLevel, message: string, context?: any): void {
    // Skip if level is lower than configured
    if (!this.shouldLog(level)) {
      return;
    }

    const timestamp = new Date().toISOString();
    const entry: LogEntry = {
      timestamp,
      level,
      message,
      context,
      prefix: this.options.prefix,
    };

    // Store in history (limited size)
    this.addToHistory(entry);

    // Log to console if enabled
    if (this.options.enableConsole) {
      this.logToConsole(entry);
    }

    // Send to reporting service if enabled and level is ERROR
    if (this.options.enableReporting && level === LogLevel.ERROR) {
      this.reportError(entry);
    }
  }

  /**
   * Determine if a log level should be recorded
   */
  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];
    const configuredLevelIndex = levels.indexOf(this.options.level);
    const currentLevelIndex = levels.indexOf(level);
    
    return currentLevelIndex >= configuredLevelIndex;
  }

  /**
   * Add entry to history, maintaining max size
   */
  private addToHistory(entry: LogEntry): void {
    this.logHistory.push(entry);
    
    if (this.logHistory.length > this.MAX_LOG_SIZE) {
      this.logHistory.shift();
    }
  }

  /**
   * Log to browser console with appropriate styling
   */
  private logToConsole(entry: LogEntry): void {
    const prefix = entry.prefix ? `[${entry.prefix}]` : '';
    const timestamp = entry.timestamp.split('T')[1].split('.')[0];
    const formattedMessage = `${timestamp} ${prefix} ${entry.message}`;
    
    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(formattedMessage, entry.context || '');
        break;
      case LogLevel.INFO:
        console.info(formattedMessage, entry.context || '');
        break;
      case LogLevel.WARN:
        console.warn(formattedMessage, entry.context || '');
        break;
      case LogLevel.ERROR:
        console.error(formattedMessage, entry.context || '');
        break;
    }
  }

  /**
   * Report error to tracking service
   * This would integrate with an error tracking service like Sentry
   */
  private reportError(entry: LogEntry): void {
    // In a real implementation, this would send to an error tracking service
    // For now, we'll just log that we would report it
    if (FEATURES.DEBUG_MODE) {
      console.info('[Error Reporter] Would report error:', entry);
    }
  }

  /**
   * Get log history
   */
  public getHistory(): LogEntry[] {
    return [...this.logHistory];
  }

  /**
   * Clear log history
   */
  public clearHistory(): void {
    this.logHistory = [];
  }

  /**
   * Create a child logger with a specific prefix
   */
  public createLogger(prefix: string): Logger {
    return new Logger({
      ...this.options,
      prefix: this.options.prefix 
        ? `${this.options.prefix}:${prefix}`
        : prefix,
    });
  }
}

// Create default app logger
const logger = new Logger({ prefix: 'App' });

export default logger; 