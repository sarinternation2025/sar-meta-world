const { Command } = require("commander");
const { AdminUtils } = require("../../utils/admin");
const { logger } = require("../../utils/logger");
const { config } = require("../../utils/config");
const chalk = require("chalk");
const fs = require("fs-extra");
const path = require("path");
const os = require("os");
const { promisify } = require("util"); // eslint-disable-line no-unused-vars
const { exec } = require("child_process"); // eslint-disable-line no-unused-vars

/**
 * Config command with comprehensive configuration management functionality
 */
class ConfigCommand {
  constructor() {
    this.configCommand = new Command("config").description(
      "Comprehensive configuration management",
    );

    this.setupSubcommands();
  }

  /**
   * Setup config subcommands
   */
  setupSubcommands() {
    // Get configuration values
    this.configCommand
      .command("get")
      .description("Get configuration value(s)")
      .option("-a, --all", "Show all configuration values")
      .option("-g, --global", "Get global configuration")
      .option("-l, --local", "Get local configuration")
      .option("--json", "Output in JSON format")
      .argument("[key]", "Configuration key to get")
      .action(
        AdminUtils.createAdminCommand("config get", this.getConfig.bind(this)),
      );

    // Set configuration values
    this.configCommand
      .command("set")
      .description("Set configuration value")
      .option("-g, --global", "Set global configuration")
      .option("-l, --local", "Set local configuration")
      .option(
        "--type <type>",
        "Value type (string, number, boolean, json)",
        "string",
      )
      .argument("<key>", "Configuration key to set")
      .argument("<value>", "Configuration value to set")
      .action(
        AdminUtils.createAdminCommand("config set", this.setConfig.bind(this)),
      );

    // Remove configuration values
    this.configCommand
      .command("unset")
      .description("Remove configuration value")
      .option("-g, --global", "Remove from global configuration")
      .option("-l, --local", "Remove from local configuration")
      .argument("<key>", "Configuration key to remove")
      .action(
        AdminUtils.createAdminCommand(
          "config unset",
          this.unsetConfig.bind(this),
        ),
      );

    // List configuration values
    this.configCommand
      .command("list")
      .description("List all configuration values")
      .option("-g, --global", "List global configuration")
      .option("-l, --local", "List local configuration")
      .option("--show-origin", "Show configuration file origins")
      .option("--json", "Output in JSON format")
      .action(
        AdminUtils.createAdminCommand(
          "config list",
          this.listConfig.bind(this),
        ),
      );

    // Edit configuration files
    this.configCommand
      .command("edit")
      .description("Edit configuration file")
      .option("-g, --global", "Edit global configuration")
      .option("-l, --local", "Edit local configuration")
      .option("--editor <editor>", "Specify editor to use")
      .action(
        AdminUtils.createAdminCommand(
          "config edit",
          this.editConfig.bind(this),
        ),
      );

    // Initialize configuration
    this.configCommand
      .command("init")
      .description("Initialize configuration")
      .option("--template <template>", "Use configuration template")
      .option("--interactive", "Interactive configuration setup")
      .option("-f, --force", "Overwrite existing configuration")
      .action(
        AdminUtils.createAdminCommand(
          "config init",
          this.initConfig.bind(this),
        ),
      );

    // Validate configuration
    this.configCommand
      .command("validate")
      .description("Validate configuration")
      .option("--schema <schema>", "Schema file to validate against")
      .option("--strict", "Strict validation mode")
      .action(
        AdminUtils.createAdminCommand(
          "config validate",
          this.validateConfig.bind(this),
        ),
      );

    // Show configuration paths
    this.configCommand
      .command("paths")
      .description("Show configuration file paths")
      .action(
        AdminUtils.createAdminCommand(
          "config paths",
          this.showPaths.bind(this),
        ),
      );

    // Backup and restore configuration
    this.configCommand
      .command("backup")
      .description("Backup configuration")
      .option("-o, --output <file>", "Output backup file")
      .option("--include-global", "Include global configuration")
      .action(
        AdminUtils.createAdminCommand(
          "config backup",
          this.backupConfig.bind(this),
        ),
      );

    this.configCommand
      .command("restore")
      .description("Restore configuration from backup")
      .option("-f, --force", "Overwrite existing configuration")
      .argument("<backup-file>", "Backup file to restore")
      .action(
        AdminUtils.createAdminCommand(
          "config restore",
          this.restoreConfig.bind(this),
          {
            requireConfirmation: true,
            action: "restore configuration",
            warning: "This will overwrite current configuration settings.",
          },
        ),
      );

    // Import/Export configuration
    this.configCommand
      .command("export")
      .description("Export configuration")
      .option("-o, --output <file>", "Output file", "config-export.json")
      .option("--format <format>", "Export format (json, yaml, env)", "json")
      .option("--mask-secrets", "Mask sensitive values")
      .action(
        AdminUtils.createAdminCommand(
          "config export",
          this.exportConfig.bind(this),
        ),
      );

    this.configCommand
      .command("import")
      .description("Import configuration")
      .option("--merge", "Merge with existing configuration")
      .option("--format <format>", "Import format (json, yaml, env)", "json")
      .argument("<file>", "Configuration file to import")
      .action(
        AdminUtils.createAdminCommand(
          "config import",
          this.importConfig.bind(this),
          {
            requireConfirmation: true,
            action: "import configuration",
            warning: "This may overwrite existing configuration values.",
          },
        ),
      );

    // Reset configuration
    this.configCommand
      .command("reset")
      .description("Reset configuration to defaults")
      .option("-g, --global", "Reset global configuration")
      .option("-l, --local", "Reset local configuration")
      .option("--hard", "Complete reset (remove all custom settings)")
      .action(
        AdminUtils.createAdminCommand(
          "config reset",
          this.resetConfig.bind(this),
          {
            requireConfirmation: true,
            action: "reset configuration",
            warning: "This will reset configuration to default values.",
          },
        ),
      );

    // Configuration diff
    this.configCommand
      .command("diff")
      .description("Show configuration differences")
      .option("--global-local", "Compare global vs local configuration")
      .option("--with-defaults", "Compare with default configuration")
      .argument("[file]", "Configuration file to compare with")
      .action(
        AdminUtils.createAdminCommand(
          "config diff",
          this.diffConfig.bind(this),
        ),
      );

    // Configuration migration
    this.configCommand
      .command("migrate")
      .description("Migrate configuration to newer version")
      .option("--from-version <version>", "Source configuration version")
      .option("--to-version <version>", "Target configuration version")
      .option("--dry-run", "Show what would be migrated")
      .action(
        AdminUtils.createAdminCommand(
          "config migrate",
          this.migrateConfig.bind(this),
        ),
      );
  }

  /**
   * Get configuration value(s)
   */
  async getConfig(key, options, _command) {
    const { all, global, local, json } = options;

    logger.info("Getting configuration", { key, all, global, local, json });

    await config.load();

    console.log(chalk.blue("🔧 Configuration Values:"));

    if (all) {
      const allConfig = config.getAll();

      if (json) {
        console.log(JSON.stringify(allConfig, null, 2));
      } else {
        this.displayConfigTree(allConfig);
      }
    } else if (key) {
      const value = config.get(key);

      if (value !== undefined) {
        if (json) {
          console.log(JSON.stringify({ [key]: value }, null, 2));
        } else {
          console.log(
            `${chalk.cyan(key)}: ${chalk.white(this.formatValue(value))}`,
          );
        }
      } else {
        console.log(chalk.yellow(`⚠️  Configuration key '${key}' not found`));
      }
    } else {
      // Show commonly used configuration
      const commonKeys = [
        "app.name",
        "app.version",
        "app.environment",
        "server.port",
        "database.url",
        "logging.level",
      ];

      console.log();
      commonKeys.forEach((configKey) => {
        const value = config.get(configKey);
        if (value !== undefined) {
          console.log(
            `${chalk.cyan(configKey)}: ${chalk.white(this.formatValue(value))}`,
          );
        }
      });
    }

    logger.success("Configuration retrieved", { key, all });
  }

  /**
   * Set configuration value
   */
  async setConfig(key, value, options, _command) {
    const { global, local, type } = options;

    logger.info("Setting configuration", { key, value, global, local, type });

    await config.load();

    // Parse value based on type
    let parsedValue;
    try {
      switch (type) {
        case "number":
          parsedValue = Number(value);
          if (isNaN(parsedValue)) {
            throw new Error("Invalid number value");
          }
          break;
        case "boolean":
          parsedValue = value.toLowerCase() === "true" || value === "1";
          break;
        case "json":
          parsedValue = JSON.parse(value);
          break;
        default:
          parsedValue = value;
      }
    } catch (error) {
      console.log(chalk.red(`❌ Invalid ${type} value: ${error.message}`));
      return;
    }

    try {
      config.set(key, parsedValue);
      await config.save();

      console.log(
        chalk.green(
          `✅ Configuration set: ${chalk.cyan(key)} = ${chalk.white(this.formatValue(parsedValue))}`,
        ),
      );

      logger.success("Configuration updated", {
        key,
        value: parsedValue,
        type,
      });
    } catch (error) {
      console.log(
        chalk.red(`❌ Failed to set configuration: ${error.message}`),
      );
      logger.error("Configuration set failed", error);
    }
  }

  /**
   * Remove configuration value
   */
  async unsetConfig(key, options, _command) {
    const { global, local } = options;

    logger.info("Unsetting configuration", { key, global, local });

    await config.load();

    if (config.has(key)) {
      try {
        config.unset(key);
        await config.save();

        console.log(
          chalk.green(`✅ Configuration removed: ${chalk.cyan(key)}`),
        );
        logger.success("Configuration removed", { key });
      } catch (error) {
        console.log(
          chalk.red(`❌ Failed to remove configuration: ${error.message}`),
        );
        logger.error("Configuration unset failed", error);
      }
    } else {
      console.log(chalk.yellow(`⚠️  Configuration key '${key}' not found`));
    }
  }

  /**
   * List all configuration values
   */
  async listConfig(options, _command) {
    const { global, local, showOrigin, json } = options;

    logger.info("Listing configuration", { global, local, showOrigin, json });

    await config.load();

    console.log(chalk.blue("📋 Configuration List:"));

    const allConfig = config.getAll();

    if (json) {
      console.log(JSON.stringify(allConfig, null, 2));
    } else {
      console.log();
      this.displayConfigTree(allConfig, showOrigin);
    }

    const configCount = this.countConfigKeys(allConfig);
    console.log();
    console.log(chalk.gray(`Total configuration keys: ${configCount}`));

    logger.success("Configuration listed", { count: configCount });
  }

  /**
   * Edit configuration file
   */
  async editConfig(options, _command) {
    const { global, local, editor } = options;

    logger.info("Editing configuration", { global, local, editor });

    console.log(chalk.blue("✏️  Opening configuration for editing..."));

    const configPath = config.getConfigPath();
    console.log(chalk.cyan(`Configuration file: ${configPath}`));

    const editorCmd = editor || process.env.EDITOR || "nano";

    // Mock editor opening
    console.log(chalk.green(`✅ Would open ${configPath} with ${editorCmd}`));
    console.log(chalk.gray("(Editor integration not implemented in demo)"));

    logger.info("Configuration edit requested", {
      editor: editorCmd,
      path: configPath,
    });
  }

  /**
   * Initialize configuration
   */
  async initConfig(options, _command) {
    const { template, interactive, force } = options;

    logger.info("Initializing configuration", { template, interactive, force });

    console.log(chalk.blue("🚀 Initializing Configuration..."));

    const configPath = config.getConfigPath();

    if (!force && (await fs.pathExists(configPath))) {
      console.log(
        chalk.yellow(`⚠️  Configuration already exists at ${configPath}`),
      );
      console.log(chalk.gray("Use --force to overwrite"));
      return;
    }

    try {
      let initialConfig = {};

      if (template) {
        initialConfig = await this.loadTemplate(template);
      } else if (interactive) {
        initialConfig = await this.interactiveSetup();
      } else {
        initialConfig = this.getDefaultConfig();
      }

      config.setAll(initialConfig);
      await config.save();

      console.log(chalk.green(`✅ Configuration initialized at ${configPath}`));
      console.log();
      this.displayConfigTree(initialConfig);

      logger.success("Configuration initialized", { template, interactive });
    } catch (error) {
      console.log(
        chalk.red(`❌ Failed to initialize configuration: ${error.message}`),
      );
      logger.error("Configuration init failed", error);
    }
  }

  /**
   * Validate configuration
   */
  async validateConfig(options, _command) {
    const { schema, strict } = options;

    logger.info("Validating configuration", { schema, strict });

    console.log(chalk.blue("🔍 Validating Configuration..."));

    await config.load();

    const allConfig = config.getAll(); // eslint-disable-line no-unused-vars
    const issues = [];

    // Basic validation
    const requiredKeys = ["app.name", "app.version"];

    requiredKeys.forEach((key) => {
      if (!config.has(key)) {
        issues.push({ type: "error", key, message: "Required key missing" });
      }
    });

    // Type validation
    const typeChecks = {
      "server.port": "number",
      "logging.enabled": "boolean",
      "app.debug": "boolean",
    };

    Object.entries(typeChecks).forEach(([key, expectedType]) => {
      if (config.has(key)) {
        const value = config.get(key);
        const actualType = typeof value;

        if (actualType !== expectedType) {
          issues.push({
            type: "warning",
            key,
            message: `Expected ${expectedType}, got ${actualType}`,
          });
        }
      }
    });

    console.log();

    if (issues.length === 0) {
      console.log(chalk.green("✅ Configuration is valid"));
    } else {
      console.log(
        chalk.yellow(`⚠️  Found ${issues.length} validation issue(s):`),
      );
      console.log();

      issues.forEach((issue) => {
        const icon = issue.type === "error" ? "❌" : "⚠️";
        const color = issue.type === "error" ? chalk.red : chalk.yellow;

        console.log(`${icon} ${color(issue.key)}: ${issue.message}`);
      });
    }

    logger.success("Configuration validated", { issues: issues.length });
  }

  /**
   * Show configuration paths
   */
  async showPaths(options, _command) {
    logger.info("Showing configuration paths");

    console.log(chalk.blue("📍 Configuration Paths:"));
    console.log();

    const paths = {
      "Current Config": config.getConfigPath(),
      "Global Config": path.join(
        os.homedir(),
        ".sar-meta-world",
        "config.json",
      ),
      "Local Config": path.join(process.cwd(), ".sar-config.json"),
      "System Config": "/etc/sar-meta-world/config.json",
    };

    for (const [label, configPath] of Object.entries(paths)) {
      const exists = await fs.pathExists(configPath);
      const status = exists
        ? chalk.green("✅ exists")
        : chalk.gray("❌ not found");

      console.log(
        `${chalk.cyan(label.padEnd(15))}: ${chalk.white(configPath)} ${status}`,
      );
    }

    console.log();
    console.log(chalk.gray("Environment variables: SAR_CONFIG_PATH, NODE_ENV"));
  }

  // Helper methods
  displayConfigTree(config, showOrigin = false, prefix = "") {
    Object.entries(config).forEach(([key, value]) => {
      const fullKey = prefix ? `${prefix}.${key}` : key;

      if (
        typeof value === "object" &&
        value !== null &&
        !Array.isArray(value)
      ) {
        console.log(chalk.cyan(`${fullKey}:`));
        this.displayConfigTree(value, showOrigin, fullKey);
      } else {
        const formattedValue = this.formatValue(value);
        const originInfo = showOrigin ? chalk.gray(" (config.json)") : "";
        console.log(
          `  ${chalk.cyan(fullKey)}: ${chalk.white(formattedValue)}${originInfo}`,
        );
      }
    });
  }

  formatValue(value) {
    if (typeof value === "string") {
      return `"${value}"`;
    } else if (typeof value === "object") {
      return JSON.stringify(value);
    }
    return String(value);
  }

  countConfigKeys(config, count = 0) {
    Object.values(config).forEach((value) => {
      if (
        typeof value === "object" &&
        value !== null &&
        !Array.isArray(value)
      ) {
        count = this.countConfigKeys(value, count);
      } else {
        count++;
      }
    });
    return count;
  }

  getDefaultConfig() {
    return {
      app: {
        name: "SAR Meta World",
        version: "1.0.0",
        environment: "development",
        debug: false,
      },
      server: {
        port: 3000,
        host: "localhost",
      },
      database: {
        url: "postgresql://localhost:5432/sar_meta_world",
        pool: {
          min: 2,
          max: 10,
        },
      },
      logging: {
        level: "info",
        enabled: true,
        file: "logs/app.log",
      },
      features: {
        backup: true,
        monitoring: true,
        docker: true,
      },
    };
  }

  async loadTemplate(templateName) {
    // Mock template loading
    const templates = {
      minimal: {
        app: { name: "SAR Meta World", version: "1.0.0" },
      },
      development: this.getDefaultConfig(),
      production: {
        ...this.getDefaultConfig(),
        app: {
          ...this.getDefaultConfig().app,
          environment: "production",
          debug: false,
        },
        logging: { ...this.getDefaultConfig().logging, level: "warn" },
      },
    };

    return templates[templateName] || this.getDefaultConfig();
  }

  async interactiveSetup() {
    console.log(chalk.blue("🔧 Interactive Configuration Setup"));
    console.log(chalk.gray("(Interactive prompts not implemented in demo)"));
    return this.getDefaultConfig();
  }

  // Placeholder methods for remaining functionality
  async backupConfig(options, _command) {
    console.log(chalk.blue("💾 Configuration backup (placeholder)"));
    logger.info("Configuration backup requested", options);
  }

  async restoreConfig(backupFile, options, _command) {
    console.log(chalk.blue("📂 Configuration restore (placeholder)"));
    logger.info("Configuration restore requested", { backupFile, options });
  }

  async exportConfig(options, _command) {
    console.log(chalk.blue("📤 Configuration export (placeholder)"));
    logger.info("Configuration export requested", options);
  }

  async importConfig(file, options, _command) {
    console.log(chalk.blue("📥 Configuration import (placeholder)"));
    logger.info("Configuration import requested", { file, options });
  }

  async resetConfig(options, _command) {
    console.log(chalk.blue("🔄 Configuration reset (placeholder)"));
    logger.info("Configuration reset requested", options);
  }

  async diffConfig(file, options, _command) {
    console.log(chalk.blue("📊 Configuration diff (placeholder)"));
    logger.info("Configuration diff requested", { file, options });
  }

  async migrateConfig(options, _command) {
    console.log(chalk.blue("🔄 Configuration migration (placeholder)"));
    logger.info("Configuration migration requested", options);
  }

  getCommand() {
    return this.configCommand;
  }
}

// Create and export the config command
const configCommandInstance = new ConfigCommand();
module.exports = configCommandInstance.getCommand();
