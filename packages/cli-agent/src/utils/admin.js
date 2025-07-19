const chalk = require("chalk");
const { logger } = require("./logger");

/**
 * Admin utility for permission checking
 */
class AdminUtils {
  /**
   * Check if the current user has admin privileges
   * @returns {boolean} True if user is admin
   */
  static isAdmin() {
    return (
      process.env.SARU_ADMIN === "true" || process.env.SAR_ADMIN === "true"
    );
  }

  /**
   * Check admin access and exit if not admin
   * @param {string} commandName - Name of the command being executed
   * @param {boolean} silent - Whether to suppress output
   */
  static checkAdminAccess(commandName = "This command", silent = false) {
    if (!AdminUtils.isAdmin()) {
      const message = `${commandName} requires admin privileges. Set SARU_ADMIN=true to enable admin mode.`;

      if (!silent) {
        console.error(chalk.red(`❌ Access Denied: ${message}`));
        console.error(chalk.yellow("💡 Hint: Run with admin privileges:"));
        console.error(chalk.gray("   export SARU_ADMIN=true"));
        console.error(
          chalk.gray("   sar-cli " + process.argv.slice(2).join(" ")),
        );
      }

      logger.error("Admin access denied for command:", commandName);
      process.exit(1);
    }
  }

  /**
   * Check admin access and return boolean instead of exiting
   * @param {string} commandName - Name of the command being executed
   * @returns {boolean} True if user has admin access
   */
  static hasAdminAccess(commandName = "command") {
    const hasAccess = AdminUtils.isAdmin();

    if (!hasAccess) {
      logger.warn("Admin access denied for command:", commandName);
    }

    return hasAccess;
  }

  /**
   * Prompt for admin confirmation
   * @param {string} action - Action being performed
   * @param {string} warning - Warning message
   * @returns {Promise<boolean>} True if user confirms
   */
  static async promptAdminConfirmation(action, warning) {
    const { default: inquirer } = await import("inquirer");

    console.log(chalk.yellow(`⚠️  ${warning}`));
    console.log(chalk.gray(`You are about to: ${action}`));
    console.log("");

    const answer = await inquirer.prompt([
      {
        type: "confirm",
        name: "confirmed",
        message: "Are you sure you want to continue?",
        default: false,
      },
    ]);

    if (answer.confirmed) {
      logger.info("Admin action confirmed:", action);
    } else {
      logger.info("Admin action cancelled:", action);
    }

    return answer.confirmed;
  }

  /**
   * Ensure admin access with optional confirmation
   * @param {string} commandName - Name of the command
   * @param {Object} options - Options for admin check
   * @param {boolean} options.requireConfirmation - Whether to require confirmation
   * @param {string} options.action - Action description for confirmation
   * @param {string} options.warning - Warning message for confirmation
   * @returns {Promise<boolean>} True if access is granted
   */
  static async ensureAdminAccess(commandName, options = {}) {
    const {
      requireConfirmation = false,
      action = commandName,
      warning = "This action requires admin privileges and may affect system configuration.",
    } = options;

    // Check admin privileges
    AdminUtils.checkAdminAccess(commandName);

    // Prompt for confirmation if required
    if (requireConfirmation) {
      const confirmed = await AdminUtils.promptAdminConfirmation(
        action,
        warning,
      );
      if (!confirmed) {
        console.log(chalk.yellow("Operation cancelled."));
        process.exit(0);
      }
    }

    return true;
  }

  /**
   * Get admin environment variables
   * @returns {Object} Admin environment variables
   */
  static getAdminEnv() {
    return {
      SARU_ADMIN: process.env.SARU_ADMIN || "false",
      SAR_ADMIN: process.env.SAR_ADMIN || "false",
      isAdmin: AdminUtils.isAdmin(),
    };
  }

  /**
   * Log admin action
   * @param {string} action - Action performed
   * @param {Object} details - Additional details
   */
  static logAdminAction(action, details = {}) {
    logger.info("Admin action performed:", {
      action,
      user: process.env.USER || process.env.USERNAME || "unknown",
      timestamp: new Date().toISOString(),
      ...details,
    });
  }

  /**
   * Create admin command wrapper
   * @param {string} commandName - Name of the command
   * @param {Function} handler - Command handler function
   * @param {Object} options - Options for admin command
   * @returns {Function} Wrapped command handler
   */
  static createAdminCommand(commandName, handler, options = {}) {
    return async (...args) => {
      try {
        await AdminUtils.ensureAdminAccess(commandName, options);
        AdminUtils.logAdminAction(commandName, { args: args.slice(0, -1) }); // Exclude command object
        return await handler(...args);
      } catch (error) {
        logger.error("Admin command error:", error.message);
        console.error(
          chalk.red(`❌ Error executing ${commandName}:`),
          error.message,
        );
        process.exit(1);
      }
    };
  }

  /**
   * Validate admin environment
   * @returns {Object} Validation result
   */
  static validateAdminEnv() {
    const env = AdminUtils.getAdminEnv();
    const issues = [];

    if (!env.isAdmin) {
      issues.push("Admin privileges not enabled");
    }

    // Check for common admin-related environment variables
    const requiredEnvVars = ["NODE_ENV"];
    for (const envVar of requiredEnvVars) {
      if (!process.env[envVar]) {
        issues.push(`Missing environment variable: ${envVar}`);
      }
    }

    return {
      isValid: issues.length === 0,
      issues,
      env,
    };
  }
}

module.exports = {
  AdminUtils,
  // Legacy exports for backward compatibility
  isAdmin: AdminUtils.isAdmin,
  checkAdminAccess: AdminUtils.checkAdminAccess,
  hasAdminAccess: AdminUtils.hasAdminAccess,
};
