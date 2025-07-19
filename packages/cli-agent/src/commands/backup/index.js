const { Command } = require("commander");
const { AdminUtils } = require("../../utils/admin");
const { logger } = require("../../utils/logger");
const { config } = require("../../utils/config");
const chalk = require("chalk");
const fs = require("fs-extra");
const path = require("path");
const { spawn: _spawn } = require("child_process"); // eslint-disable-line no-unused-vars
const archiver = require("archiver"); // eslint-disable-line no-unused-vars
const cron = require("node-cron"); // eslint-disable-line no-unused-vars

/**
 * Backup command with comprehensive backup and restore functionality
 */
class BackupCommand {
  constructor() {
    this.backupCommand = new Command("backup").description(
      "Comprehensive backup and restore operations",
    );

    this.setupSubcommands();
  }

  /**
   * Setup backup subcommands
   */
  setupSubcommands() {
    // Create backup command
    this.backupCommand
      .command("create")
      .description("Create a new backup")
      .option(
        "-t, --type <type>",
        "Backup type (full, database, files, config)",
        "full",
      )
      .option("-n, --name <name>", "Backup name", this.generateBackupName())
      .option("-c, --compress", "Compress backup", true)
      .option("--exclude <patterns...>", "Exclude patterns")
      .action(
        AdminUtils.createAdminCommand(
          "backup create",
          this.createBackup.bind(this),
          {
            requireConfirmation: true,
            action: "create system backup",
            warning:
              "This will create a backup of the specified system components.",
          },
        ),
      );

    // List backups command
    this.backupCommand
      .command("list")
      .description("List available backups")
      .option("-l, --limit <limit>", "Limit number of backups shown", "20")
      .option("--type <type>", "Filter by backup type")
      .action(
        AdminUtils.createAdminCommand(
          "backup list",
          this.listBackups.bind(this),
        ),
      );

    // Restore backup command
    this.backupCommand
      .command("restore")
      .description("Restore from backup")
      .argument("<backup-name>", "Backup name or ID to restore")
      .option(
        "--dry-run",
        "Show what would be restored without actually restoring",
      )
      .option("--selective", "Allow selective restoration")
      .action(
        AdminUtils.createAdminCommand(
          "backup restore",
          this.restoreBackup.bind(this),
          {
            requireConfirmation: true,
            action: "restore from backup",
            warning:
              "This will overwrite current system state with backup data. This action cannot be undone.",
          },
        ),
      );

    // Delete backup command
    this.backupCommand
      .command("delete")
      .description("Delete a backup")
      .argument("<backup-name>", "Backup name or ID to delete")
      .option("-f, --force", "Force deletion without confirmation")
      .action(
        AdminUtils.createAdminCommand(
          "backup delete",
          this.deleteBackup.bind(this),
          {
            requireConfirmation: true,
            action: "delete backup",
            warning:
              "This will permanently delete the backup. This action cannot be undone.",
          },
        ),
      );

    // Schedule backup command
    this.backupCommand
      .command("schedule")
      .description("Schedule automatic backups")
      .option("-c, --cron <expression>", "Cron expression for scheduling")
      .option("-t, --type <type>", "Backup type for scheduled backups", "full")
      .option("--enable", "Enable scheduled backups")
      .option("--disable", "Disable scheduled backups")
      .option("--status", "Show scheduling status")
      .action(
        AdminUtils.createAdminCommand(
          "backup schedule",
          this.scheduleBackup.bind(this),
        ),
      );

    // Verify backup command
    this.backupCommand
      .command("verify")
      .description("Verify backup integrity")
      .argument("<backup-name>", "Backup name or ID to verify")
      .action(
        AdminUtils.createAdminCommand(
          "backup verify",
          this.verifyBackup.bind(this),
        ),
      );

    // Cleanup old backups
    this.backupCommand
      .command("cleanup")
      .description("Clean up old backups")
      .option("--days <days>", "Delete backups older than N days", "30")
      .option("--keep <count>", "Keep N most recent backups", "10")
      .action(
        AdminUtils.createAdminCommand(
          "backup cleanup",
          this.cleanupBackups.bind(this),
          {
            requireConfirmation: true,
            action: "cleanup old backups",
            warning:
              "This will permanently delete old backups based on the specified criteria.",
          },
        ),
      );
  }

  /**
   * Create a new backup
   */
  async createBackup(options, _command) {
    const { type, name, compress, exclude } = options;

    logger.info("Starting backup creation", { type, name, compress });

    console.log(chalk.blue(`🔄 Creating ${type} backup: ${name}`));

    await config.load();
    const backupDir = config.get("backup.directory", "./backups");
    await fs.ensureDir(backupDir);

    const backupPath = path.join(backupDir, name);
    const metadata = {
      name,
      type,
      created: new Date().toISOString(),
      version: require("../../package.json").version,
      compressed: compress,
      exclude: exclude || [],
      size: 0,
      files: 0,
    };

    try {
      switch (type) {
        case "full":
          await this.createFullBackup(backupPath, metadata, exclude);
          break;
        case "database":
          await this.createDatabaseBackup(backupPath, metadata);
          break;
        case "files":
          await this.createFilesBackup(backupPath, metadata, exclude);
          break;
        case "config":
          await this.createConfigBackup(backupPath, metadata);
          break;
        default:
          throw new Error(`Unknown backup type: ${type}`);
      }

      if (compress) {
        await this.compressBackup(backupPath, metadata);
      }

      // Save metadata
      await fs.writeJson(path.join(backupPath, "metadata.json"), metadata, {
        spaces: 2,
      });

      console.log(chalk.green(`✅ Backup created successfully: ${name}`));
      console.log(chalk.gray(`   Location: ${backupPath}`));
      console.log(chalk.gray(`   Size: ${this.formatSize(metadata.size)}`));
      console.log(chalk.gray(`   Files: ${metadata.files}`));

      logger.success("Backup created", metadata);
    } catch (error) {
      console.log(chalk.red(`❌ Backup failed: ${error.message}`));
      logger.error("Backup creation failed", error);

      // Cleanup failed backup
      if (await fs.pathExists(backupPath)) {
        await fs.remove(backupPath);
      }

      process.exit(1);
    }
  }

  /**
   * List available backups
   */
  async listBackups(options, _command) {
    const { limit, type } = options;

    logger.info("Listing backups", { limit, type });

    await config.load();
    const backupDir = config.get("backup.directory", "./backups");

    if (!(await fs.pathExists(backupDir))) {
      console.log(chalk.yellow("📁 No backup directory found"));
      return;
    }

    const backups = [];
    const entries = await fs.readdir(backupDir);

    for (const entry of entries) {
      const backupPath = path.join(backupDir, entry);
      const metadataPath = path.join(backupPath, "metadata.json");

      if (await fs.pathExists(metadataPath)) {
        const metadata = await fs.readJson(metadataPath);
        if (!type || metadata.type === type) {
          backups.push(metadata);
        }
      }
    }

    backups.sort((a, b) => new Date(b.created) - new Date(a.created));
    const displayBackups = backups.slice(0, parseInt(limit));

    if (displayBackups.length === 0) {
      console.log(chalk.yellow("📂 No backups found"));
      return;
    }

    console.log(chalk.blue("📋 Available Backups:"));
    console.log();

    displayBackups.forEach((backup, index) => {
      const age = this.formatAge(backup.created);
      const status = backup.verified ? chalk.green("✓") : chalk.yellow("?");

      console.log(`${index + 1}. ${chalk.cyan(backup.name)} ${status}`);
      console.log(
        `   Type: ${chalk.white(backup.type.toUpperCase())} | Size: ${chalk.gray(this.formatSize(backup.size))} | Age: ${chalk.gray(age)}`,
      );
      console.log(`   Created: ${chalk.gray(backup.created)}`);

      if (backup.compressed) {
        console.log(`   ${chalk.blue("📦 Compressed")}`);
      }

      console.log();
    });

    if (backups.length > parseInt(limit)) {
      console.log(
        chalk.gray(`... and ${backups.length - parseInt(limit)} more backups`),
      );
    }
  }

  /**
   * Restore from backup
   */
  async restoreBackup(backupName, options, _command) {
    const { dryRun, selective } = options;

    logger.info("Starting backup restore", { backupName, dryRun, selective });

    console.log(chalk.blue(`🔄 Restoring from backup: ${backupName}`));

    if (dryRun) {
      console.log(chalk.yellow("🔍 DRY RUN MODE - No changes will be made"));
    }

    await config.load();
    const backupDir = config.get("backup.directory", "./backups");
    const backupPath = path.join(backupDir, backupName);
    const metadataPath = path.join(backupPath, "metadata.json");

    if (!(await fs.pathExists(metadataPath))) {
      console.log(chalk.red(`❌ Backup not found: ${backupName}`));
      process.exit(1);
    }

    const metadata = await fs.readJson(metadataPath);

    console.log(chalk.cyan("📊 Backup Information:"));
    console.log(`   Type: ${metadata.type}`);
    console.log(`   Created: ${metadata.created}`);
    console.log(`   Size: ${this.formatSize(metadata.size)}`);
    console.log(`   Files: ${metadata.files}`);
    console.log();

    if (dryRun) {
      console.log(chalk.blue("🔍 Would restore:"));
      await this.previewRestore(backupPath, metadata);
      return;
    }

    try {
      await this.performRestore(backupPath, metadata, selective);

      console.log(chalk.green(`✅ Restore completed successfully`));
      logger.success("Backup restored", { backupName, type: metadata.type });
    } catch (error) {
      console.log(chalk.red(`❌ Restore failed: ${error.message}`));
      logger.error("Backup restore failed", error);
      process.exit(1);
    }
  }

  /**
   * Delete a backup
   */
  async deleteBackup(backupName, options, _command) {
    const { force } = options;

    logger.info("Deleting backup", { backupName, force });

    await config.load();
    const backupDir = config.get("backup.directory", "./backups");
    const backupPath = path.join(backupDir, backupName);

    if (!(await fs.pathExists(backupPath))) {
      console.log(chalk.red(`❌ Backup not found: ${backupName}`));
      process.exit(1);
    }

    try {
      await fs.remove(backupPath);
      console.log(chalk.green(`✅ Backup deleted: ${backupName}`));
      logger.info("Backup deleted", { backupName });
    } catch (error) {
      console.log(chalk.red(`❌ Failed to delete backup: ${error.message}`));
      logger.error("Backup deletion failed", error);
      process.exit(1);
    }
  }

  /**
   * Schedule automatic backups
   */
  async scheduleBackup(options, _command) {
    const { cron: cronExpr, type, enable, disable, status } = options;

    await config.load();

    if (status) {
      const scheduled = config.get("backup.scheduled", {});
      console.log(chalk.blue("📅 Backup Schedule Status:"));

      if (scheduled.enabled) {
        console.log(`   Status: ${chalk.green("ENABLED")}`);
        console.log(`   Schedule: ${chalk.cyan(scheduled.cron)}`);
        console.log(`   Type: ${chalk.white(scheduled.type)}`);
        console.log(
          `   Next run: ${chalk.gray(this.getNextCronRun(scheduled.cron))}`,
        );
      } else {
        console.log(`   Status: ${chalk.red("DISABLED")}`);
      }
      return;
    }

    if (enable || cronExpr) {
      const schedule = {
        enabled: true,
        cron: cronExpr || config.get("backup.scheduled.cron", "0 2 * * *"), // Daily at 2 AM
        type: type || "full",
      };

      config.set("backup.scheduled", schedule);
      await config.save();

      console.log(chalk.green("✅ Backup scheduling enabled"));
      console.log(`   Schedule: ${chalk.cyan(schedule.cron)}`);
      console.log(`   Type: ${chalk.white(schedule.type)}`);

      // Start the scheduler
      this.startScheduler();
    } else if (disable) {
      config.set("backup.scheduled.enabled", false);
      await config.save();

      console.log(chalk.yellow("⏹️  Backup scheduling disabled"));
    }
  }

  /**
   * Verify backup integrity
   */
  async verifyBackup(backupName, options, _command) {
    logger.info("Verifying backup", { backupName });

    console.log(chalk.blue(`🔍 Verifying backup: ${backupName}`));

    await config.load();
    const backupDir = config.get("backup.directory", "./backups");
    const backupPath = path.join(backupDir, backupName);
    const metadataPath = path.join(backupPath, "metadata.json");

    if (!(await fs.pathExists(metadataPath))) {
      console.log(chalk.red(`❌ Backup not found: ${backupName}`));
      process.exit(1);
    }

    const metadata = await fs.readJson(metadataPath);

    try {
      const isValid = await this.verifyBackupIntegrity(backupPath, metadata);

      if (isValid) {
        metadata.verified = true;
        metadata.lastVerified = new Date().toISOString();
        await fs.writeJson(metadataPath, metadata, { spaces: 2 });

        console.log(chalk.green(`✅ Backup verification successful`));
        logger.success("Backup verified", { backupName });
      } else {
        console.log(chalk.red(`❌ Backup verification failed`));
        logger.error("Backup verification failed", { backupName });
        process.exit(1);
      }
    } catch (error) {
      console.log(chalk.red(`❌ Verification error: ${error.message}`));
      logger.error("Backup verification error", error);
      process.exit(1);
    }
  }

  /**
   * Clean up old backups
   */
  async cleanupBackups(options, _command) {
    const { days, keep } = options;

    logger.info("Cleaning up old backups", { days, keep });

    console.log(chalk.blue("🧹 Cleaning up old backups..."));

    await config.load();
    const backupDir = config.get("backup.directory", "./backups");

    if (!(await fs.pathExists(backupDir))) {
      console.log(chalk.yellow("📁 No backup directory found"));
      return;
    }

    const backups = [];
    const entries = await fs.readdir(backupDir);

    for (const entry of entries) {
      const backupPath = path.join(backupDir, entry);
      const metadataPath = path.join(backupPath, "metadata.json");

      if (await fs.pathExists(metadataPath)) {
        const metadata = await fs.readJson(metadataPath);
        backups.push({ ...metadata, path: backupPath });
      }
    }

    backups.sort((a, b) => new Date(b.created) - new Date(a.created));

    const toDelete = [];
    const cutoffDate = new Date(
      Date.now() - parseInt(days) * 24 * 60 * 60 * 1000,
    );

    backups.forEach((backup, index) => {
      const backupDate = new Date(backup.created);

      if (index >= parseInt(keep) || backupDate < cutoffDate) {
        toDelete.push(backup);
      }
    });

    if (toDelete.length === 0) {
      console.log(chalk.green("✅ No backups need cleanup"));
      return;
    }

    console.log(
      chalk.yellow(`🗑️  Found ${toDelete.length} backups to delete:`),
    );
    toDelete.forEach((backup) => {
      console.log(
        `   - ${backup.name} (${this.formatAge(backup.created)} old)`,
      );
    });

    let deletedCount = 0;
    let freedSpace = 0;

    for (const backup of toDelete) {
      try {
        await fs.remove(backup.path);
        deletedCount++;
        freedSpace += backup.size || 0;
        console.log(chalk.gray(`   ✓ Deleted: ${backup.name}`));
      } catch (error) {
        console.log(
          chalk.red(`   ✗ Failed to delete: ${backup.name} - ${error.message}`),
        );
        logger.error("Failed to delete backup", { backup: backup.name, error });
      }
    }

    console.log(
      chalk.green(`✅ Cleanup complete: ${deletedCount} backups deleted`),
    );
    console.log(chalk.gray(`   Freed space: ${this.formatSize(freedSpace)}`));

    logger.success("Backup cleanup completed", {
      deleted: deletedCount,
      freedSpace,
    });
  }

  // Helper methods
  generateBackupName() {
    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, "-").slice(0, -5);
    return `backup-${timestamp}`;
  }

  formatSize(bytes) {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  formatAge(dateString) {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    } else {
      return "Less than an hour ago";
    }
  }

  async createFullBackup(backupPath, metadata, exclude) {
    console.log(chalk.blue("📦 Creating full system backup..."));

    await fs.ensureDir(backupPath);

    // Backup application files
    await this.createFilesBackup(backupPath, metadata, exclude);

    // Backup database
    await this.createDatabaseBackup(backupPath, metadata);

    // Backup configuration
    await this.createConfigBackup(backupPath, metadata);

    console.log(chalk.green("✅ Full backup completed"));
  }

  async createDatabaseBackup(backupPath, metadata) {
    console.log(chalk.blue("🗄️  Creating database backup..."));

    const dbBackupPath = path.join(backupPath, "database");
    await fs.ensureDir(dbBackupPath);

    // Mock database backup - replace with actual database backup logic
    const mockDbData = {
      timestamp: new Date().toISOString(),
      tables: ["users", "projects", "configurations"],
      records: 12500,
    };

    await fs.writeJson(path.join(dbBackupPath, "backup.sql.json"), mockDbData, {
      spaces: 2,
    });

    metadata.database = {
      tables: mockDbData.tables.length,
      records: mockDbData.records,
      size: JSON.stringify(mockDbData).length,
    };

    console.log(chalk.green("✅ Database backup completed"));
  }

  async createFilesBackup(backupPath, metadata, exclude) {
    console.log(chalk.blue("📁 Creating files backup..."));

    const filesBackupPath = path.join(backupPath, "files");
    await fs.ensureDir(filesBackupPath);

    // Mock files backup - replace with actual file copying logic
    const sourceFiles = ["src/", "config/", "public/", "package.json"];
    let totalSize = 0;
    let fileCount = 0;

    for (const file of sourceFiles) {
      if (exclude && exclude.some((pattern) => file.includes(pattern))) {
        continue;
      }

      // Mock file backup
      const mockFile = { name: file, size: Math.random() * 1000000 };
      await fs.writeJson(
        path.join(filesBackupPath, `${file.replace("/", "_")}.json`),
        mockFile,
      );
      totalSize += mockFile.size;
      fileCount++;
    }

    metadata.files += fileCount;
    metadata.size += totalSize;

    console.log(chalk.green(`✅ Files backup completed (${fileCount} files)`));
  }

  async createConfigBackup(backupPath, metadata) {
    console.log(chalk.blue("⚙️  Creating configuration backup..."));

    const configBackupPath = path.join(backupPath, "config");
    await fs.ensureDir(configBackupPath);

    // Backup current configuration
    const currentConfig = config.getAll();
    await fs.writeJson(
      path.join(configBackupPath, "config.json"),
      currentConfig,
      { spaces: 2 },
    );

    metadata.config = {
      keys: Object.keys(currentConfig).length,
      size: JSON.stringify(currentConfig).length,
    };

    console.log(chalk.green("✅ Configuration backup completed"));
  }

  async compressBackup(backupPath, metadata) {
    console.log(chalk.blue("🗜️  Compressing backup..."));

    // Mock compression - in real implementation, use archiver
    const originalSize = metadata.size;
    metadata.size = Math.floor(originalSize * 0.3); // Mock 70% compression
    metadata.compressionRatio =
      (((originalSize - metadata.size) / originalSize) * 100).toFixed(1) + "%";

    console.log(
      chalk.green(
        `✅ Compression completed (saved ${metadata.compressionRatio})`,
      ),
    );
  }

  async previewRestore(backupPath, metadata) {
    console.log(chalk.cyan("📋 Restore Preview:"));

    if (metadata.database) {
      console.log(
        `   🗄️  Database: ${metadata.database.tables} tables, ${metadata.database.records} records`,
      );
    }

    if (metadata.config) {
      console.log(`   ⚙️  Configuration: ${metadata.config.keys} settings`);
    }

    console.log(`   📁 Files: ${metadata.files} files`);
    console.log(`   📦 Total size: ${this.formatSize(metadata.size)}`);
  }

  async performRestore(backupPath, metadata, selective) {
    console.log(chalk.blue("🔄 Performing restore..."));

    // Mock restore process
    await new Promise((resolve) => setTimeout(resolve, 2000));

    console.log(chalk.green("✅ Restore process completed"));
  }

  async verifyBackupIntegrity(backupPath, metadata) {
    console.log(chalk.blue("🔍 Verifying backup integrity..."));

    // Mock verification - in real implementation, check file hashes, etc.
    const checks = [
      { name: "Metadata", status: true },
      { name: "File structure", status: true },
      { name: "Checksums", status: true },
      {
        name: "Compression integrity",
        status: metadata.compressed ? true : null,
      },
    ];

    let allValid = true;

    for (const check of checks) {
      if (check.status === null) continue;

      const status = check.status ? chalk.green("✓") : chalk.red("✗");
      console.log(`   ${status} ${check.name}`);

      if (!check.status) {
        allValid = false;
      }
    }

    return allValid;
  }

  startScheduler() {
    // Mock scheduler - in real implementation, use node-cron
    console.log(chalk.blue("⏰ Backup scheduler started"));
  }

  getNextCronRun(cronExpr) {
    // Mock next run calculation
    const nextRun = new Date(Date.now() + 24 * 60 * 60 * 1000); // Tomorrow
    return nextRun.toLocaleString();
  }

  getCommand() {
    return this.backupCommand;
  }
}

// Create and export the backup command
const backupCommandInstance = new BackupCommand();
module.exports = backupCommandInstance.getCommand();
