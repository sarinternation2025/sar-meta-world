const { Command } = require("commander");
const chalk = require("chalk");
const { initializeAgent } = require("./utils/init");

/**
 * SAR CLI Agent - Main entry point
 * Provides a comprehensive command-line interface for managing SAR projects
 */
class SARCLIAgent {
  constructor() {
    this.program = new Command();
    this.initialized = false;
  }

  /**
   * Initialize the CLI agent
   * @param {boolean} force - Force initialization even if already initialized
   */
  async initialize(force = false) {
    if (this.initialized && !force) {
      return;
    }

    try {
      await initializeAgent(force);
      this.initialized = true;
      console.log(chalk.green("✓ SAR CLI Agent initialized successfully"));
    } catch (error) {
      console.error(
        chalk.red("✗ Failed to initialize SAR CLI Agent:"),
        error.message,
      );
      process.exit(1);
    }
  }

  /**
   * Run the CLI agent
   * @param {string[]} args - Command line arguments
   */
  async run(args = process.argv) {
    if (!this.initialized) {
      await this.initialize();
    }

    this.program.parse(args);
  }

  /**
   * Get the current version
   */
  getVersion() {
    return require("../package.json").version;
  }

  /**
   * Check if the agent is initialized
   */
  isInitialized() {
    return this.initialized;
  }
}

module.exports = {
  SARCLIAgent,
  initializeAgent,
};
