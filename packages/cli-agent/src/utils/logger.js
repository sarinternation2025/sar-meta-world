const fs = require("fs-extra");
const path = require("path");
const os = require("os");
const chalk = require("chalk");
const moment = require("moment");

/**
 * Logger levels
 */
const LogLevel = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
  TRACE: 4,
};

/**
 * Logger utility for CLI agent
 */
class Logger {
  constructor() {
    this.logDir = path.join(os.homedir(), ".sar-cli", "logs");
    this.logFile = path.join(this.logDir, "sar-cli.log");
    this.errorLogFile = path.join(this.logDir, "error.log");
    this.level = LogLevel.INFO;
    this.silent = false;
    this.enableFileLogging = true;

    // Ensure log directory exists
    this.ensureLogDir();
  }

  /**
   * Ensure log directory exists
   */
  async ensureLogDir() {
    try {
      await fs.ensureDir(this.logDir);
    } catch (error) {
      // Fallback to console-only logging
      this.enableFileLogging = false;
    }
  }

  /**
   * Set logging level
   * @param {string|number} level - Log level (error, warn, info, debug, trace)
   */
  setLevel(level) {
    if (typeof level === "string") {
      const levelMap = {
        error: LogLevel.ERROR,
        warn: LogLevel.WARN,
        info: LogLevel.INFO,
        debug: LogLevel.DEBUG,
        trace: LogLevel.TRACE,
      };
      this.level = levelMap[level.toLowerCase()] || LogLevel.INFO;
    } else {
      this.level = level;
    }
  }

  /**
   * Set silent mode
   * @param {boolean} silent - Whether to suppress console output
   */
  setSilent(silent) {
    this.silent = silent;
  }

  /**
   * Enable or disable file logging
   * @param {boolean} enabled - Whether to enable file logging
   */
  setFileLogging(enabled) {
    this.enableFileLogging = enabled;
  }

  /**
   * Format log message
   * @param {string} level - Log level
   * @param {string} message - Log message
   * @param {any[]} args - Additional arguments
   * @returns {string} Formatted message
   */
  formatMessage(level, message, args) {
    const timestamp = moment().format("YYYY-MM-DD HH:mm:ss");
    const argsStr =
      args.length > 0
        ? " " +
          args
            .map((arg) =>
              typeof arg === "object"
                ? JSON.stringify(arg, null, 2)
                : String(arg),
            )
            .join(" ")
        : "";

    return `[${timestamp}] [${level.toUpperCase()}] ${message}${argsStr}`;
  }

  /**
   * Get console color for log level
   * @param {string} level - Log level
   * @returns {function} Chalk color function
   */
  getConsoleColor(level) {
    const colors = {
      error: chalk.red,
      warn: chalk.yellow,
      info: chalk.blue,
      debug: chalk.gray,
      trace: chalk.gray,
    };
    return colors[level] || chalk.white;
  }

  /**
   * Write to log file
   * @param {string} message - Message to write
   * @param {boolean} isError - Whether this is an error message
   */
  async writeToFile(message, isError = false) {
    if (!this.enableFileLogging) return;

    try {
      await this.ensureLogDir();

      const logFile = isError ? this.errorLogFile : this.logFile;
      await fs.appendFile(logFile, message + "\n");

      // Rotate logs if they get too large (10MB)
      const stats = await fs.stat(logFile);
      if (stats.size > 10 * 1024 * 1024) {
        await this.rotateLogFile(logFile);
      }
    } catch (error) {
      // Silently fail for file logging errors
      this.enableFileLogging = false;
    }
  }

  /**
   * Rotate log file
   * @param {string} logFile - Log file path
   */
  async rotateLogFile(logFile) {
    try {
      const ext = path.extname(logFile);
      const name = path.basename(logFile, ext);
      const dir = path.dirname(logFile);
      const timestamp = moment().format("YYYY-MM-DD_HH-mm-ss");
      const archivedFile = path.join(dir, `${name}_${timestamp}${ext}`);

      await fs.move(logFile, archivedFile);

      // Clean up old log files (keep last 10)
      const files = await fs.readdir(dir);
      const logFiles = files
        .filter((file) => file.startsWith(name + "_"))
        .sort()
        .reverse();

      if (logFiles.length > 10) {
        const filesToDelete = logFiles.slice(10);
        for (const file of filesToDelete) {
          await fs.remove(path.join(dir, file));
        }
      }
    } catch (error) {
      // Silently fail for rotation errors
    }
  }

  /**
   * Log message at specified level
   * @param {string} level - Log level
   * @param {number} levelValue - Numeric log level value
   * @param {string} message - Log message
   * @param {any[]} args - Additional arguments
   */
  log(level, levelValue, message, ...args) {
    if (levelValue > this.level) return;

    const formattedMessage = this.formatMessage(level, message, args);

    // Console output
    if (!this.silent) {
      const color = this.getConsoleColor(level);
      console.log(color(formattedMessage));
    }

    // File output
    this.writeToFile(formattedMessage, level === "error");
  }

  /**
   * Log error message
   * @param {string} message - Error message
   * @param {any[]} args - Additional arguments
   */
  error(message, ...args) {
    this.log("error", LogLevel.ERROR, message, ...args);
  }

  /**
   * Log warning message
   * @param {string} message - Warning message
   * @param {any[]} args - Additional arguments
   */
  warn(message, ...args) {
    this.log("warn", LogLevel.WARN, message, ...args);
  }

  /**
   * Log info message
   * @param {string} message - Info message
   * @param {any[]} args - Additional arguments
   */
  info(message, ...args) {
    this.log("info", LogLevel.INFO, message, ...args);
  }

  /**
   * Log debug message
   * @param {string} message - Debug message
   * @param {any[]} args - Additional arguments
   */
  debug(message, ...args) {
    this.log("debug", LogLevel.DEBUG, message, ...args);
  }

  /**
   * Log trace message
   * @param {string} message - Trace message
   * @param {any[]} args - Additional arguments
   */
  trace(message, ...args) {
    this.log("trace", LogLevel.TRACE, message, ...args);
  }

  /**
   * Log success message (info level with green color)
   * @param {string} message - Success message
   * @param {any[]} args - Additional arguments
   */
  success(message, ...args) {
    const formattedMessage = this.formatMessage("info", message, args);

    if (!this.silent) {
      console.log(chalk.green(formattedMessage));
    }

    this.writeToFile(formattedMessage);
  }

  /**
   * Get log file path
   * @returns {string} Log file path
   */
  getLogFile() {
    return this.logFile;
  }

  /**
   * Get error log file path
   * @returns {string} Error log file path
   */
  getErrorLogFile() {
    return this.errorLogFile;
  }

  /**
   * Get log directory path
   * @returns {string} Log directory path
   */
  getLogDir() {
    return this.logDir;
  }

  /**
   * Clear log files
   */
  async clearLogs() {
    try {
      await fs.remove(this.logFile);
      await fs.remove(this.errorLogFile);
      this.info("Log files cleared");
    } catch (error) {
      this.error("Failed to clear log files:", error.message);
    }
  }
}

// Create singleton instance
const logger = new Logger();

module.exports = {
  Logger,
  logger,
  LogLevel,
};
