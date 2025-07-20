import chalk from 'chalk';

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

export class Logger {
  private static level: LogLevel = LogLevel.INFO;

  static setLevel(level: LogLevel): void {
    this.level = level;
  }

  static error(message: string, error?: Error): void {
    if (this.level >= LogLevel.ERROR) {
      console.error(chalk.red(`[ERROR] ${message}`));
      if (error) {
        console.error(chalk.red(error.stack || error.message));
      }
    }
  }

  static warn(message: string): void {
    if (this.level >= LogLevel.WARN) {
      console.warn(chalk.yellow(`[WARN] ${message}`));
    }
  }

  static info(message: string): void {
    if (this.level >= LogLevel.INFO) {
      console.info(chalk.blue(`[INFO] ${message}`));
    }
  }

  static debug(message: string): void {
    if (this.level >= LogLevel.DEBUG) {
      console.debug(chalk.gray(`[DEBUG] ${message}`));
    }
  }

  static success(message: string): void {
    console.log(chalk.green(`[SUCCESS] ${message}`));
  }
}