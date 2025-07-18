const { Command } = require("commander");
const { AdminUtils } = require("../../utils/admin");
const { logger } = require("../../utils/logger");
const { config } = require("../../utils/config");
const chalk = require("chalk");
const fs = require("fs-extra");
const path = require("path");

/**
 * Project command with comprehensive project management functionality
 */
class ProjectCommand {
  constructor() {
    this.projectCommand = new Command("project").description(
      "Manage project lifecycle (admin only)",
    );

    this.setupSubcommands();
  }

  /**
   * Setup project subcommands
   */
  setupSubcommands() {
    // Project init command
    this.projectCommand
      .command("init")
      .description("Initialize a new project")
      .option("-t, --template  3ctemplate 3e", "Project template", "basic")
      .option("--no-git", "Skip git initialization")
      .action(
        AdminUtils.createAdminCommand(
          "project init",
          this.initProject.bind(this),
        ),
      );

    // Project config command
    this.projectCommand
      .command("config")
      .description("Manage project configuration")
      .option("-s, --set  3ckey=value 3e", "Set configuration value")
      .option("-g, --get  3ckey 3e", "Get configuration value")
      .option("-l, --list", "List all configuration")
      .action(
        AdminUtils.createAdminCommand(
          "project config",
          this.projectConfig.bind(this),
        ),
      );
  }

  /**
   * Initialize a new project
   */
  async initProject(options, command) {
    const { template, noGit } = options;
    logger.info("Initializing new project", {
      template,
      noGit,
    });

    const projectDir = path.join(process.cwd(), "new-project");
    const templateDir = path.join(process.cwd(), "templates", template);

    try {
      await fs.ensureDir(projectDir);
      await fs.copy(templateDir, projectDir);

      if (!noGit) {
        await this.initGitRepo(projectDir);
      }

      logger.success("Project initialization completed!", {
        projectDir,
        template,
      });
      console.log(
        chalk.green("✅ Project initialization completed successfully!"),
      );
    } catch (error) {
      logger.error("Project initialization failed:", error.message);
      console.log(
        chalk.red("❌ Project initialization failed:"),
        error.message,
      );
    }
  }

  /**
   * Initialize git repository
   */
  async initGitRepo(projectDir) {
    logger.info("Initializing git repository", { projectDir });
    const { execa } = await import("execa");
    try {
      await execa("git", ["init"], { cwd: projectDir });
      await execa("git", ["add", "."], { cwd: projectDir });
      await execa("git", ["commit", "-m", "Initial commit"], {
        cwd: projectDir,
      });
      console.log(chalk.blue("📘 Git repository initialized."));
    } catch (error) {
      logger.error("Git initialization failed:", error.message);
      console.log(chalk.red("❌ Git initialization failed:"), error.message);
    }
  }

  /**
   * Manage project configuration
   */
  async projectConfig(options, command) {
    const { set, get, list } = options;

    await config.load();

    if (set) {
      const [key, value] = set.split("=");
      if (!key || !value) {
        console.log(chalk.red("❌ Invalid format. Use: --set key=value"));
        process.exit(1);
      }

      config.set(`project.${key}`, value);
      await config.save();
      console.log(chalk.green(`✅ Set project.${key} = ${value}`));
      logger.info("Project configuration updated", { key, value });
    } else if (get) {
      const value = config.get(`project.${get}`);
      if (value !== null) {
        console.log(chalk.cyan(`project.${get} = ${value}`));
      } else {
        console.log(chalk.yellow(`project.${get} is not set`));
      }
    } else if (list) {
      const projectConfig = config.get("project", {});
      console.log(chalk.blue("📋 Project Configuration:"));
      Object.entries(projectConfig).forEach(([key, value]) => {
        console.log(`  ${key}: ${chalk.cyan(value)}`);
      });
    } else {
      console.log(
        chalk.yellow("Use --set, --get, or --list to manage configuration"),
      );
    }
  }

  getCommand() {
    return this.projectCommand;
  }
}

// Create and export the project command
const projectCommandInstance = new ProjectCommand();
module.exports = projectCommandInstance.getCommand();
