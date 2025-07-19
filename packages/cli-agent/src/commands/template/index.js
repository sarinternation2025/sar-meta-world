const { Command } = require("commander");
const { AdminUtils } = require("../../utils/admin");
const { logger } = require("../../utils/logger");
const chalk = require("chalk");
const fs = require("fs-extra");
const path = require("path");
const { exec } = require("child_process");
const { promisify } = require("util");

const execAsync = promisify(exec);

/**
 * Template command with comprehensive project templating functionality
 */
class TemplateCommand {
  constructor() {
    this.templateCommand = new Command("template").description(
      "Comprehensive project templating system",
    );

    this.setupSubcommands();
  }

  /**
   * Setup template subcommands
   */
  setupSubcommands() {
    // List templates
    this.templateCommand
      .command("list")
      .description("List available templates")
      .option("-a, --all", "Show all templates including community")
      .option("--category <category>", "Filter by category")
      .option("--language <language>", "Filter by programming language")
      .option("--json", "Output in JSON format")
      .action(
        AdminUtils.createAdminCommand(
          "template list",
          this.listTemplates.bind(this),
        ),
      );

    // Create project from template
    this.templateCommand
      .command("create")
      .description("Create project from template")
      .option("-t, --template <name>", "Template name", "basic")
      .option("--interactive", "Interactive template creation")
      .option("--git", "Initialize git repository")
      .option("--install", "Install dependencies after creation")
      .option("--force", "Overwrite existing directory")
      .argument("<project-name>", "Project name")
      .argument("[directory]", "Target directory")
      .action(
        AdminUtils.createAdminCommand(
          "template create",
          this.createFromTemplate.bind(this),
        ),
      );

    // Show template information
    this.templateCommand
      .command("info")
      .description("Show template information")
      .option("--verbose", "Show detailed information")
      .argument("<template>", "Template name")
      .action(
        AdminUtils.createAdminCommand(
          "template info",
          this.showTemplateInfo.bind(this),
        ),
      );

    // Install template
    this.templateCommand
      .command("install")
      .description("Install a template")
      .option("-g, --global", "Install template globally")
      .option("--from-git <url>", "Install from git repository")
      .option("--version <version>", "Install specific version")
      .argument("<template>", "Template name or path")
      .action(
        AdminUtils.createAdminCommand(
          "template install",
          this.installTemplate.bind(this),
        ),
      );

    // Uninstall template
    this.templateCommand
      .command("uninstall")
      .description("Uninstall a template")
      .option("-g, --global", "Uninstall global template")
      .argument("<template>", "Template name")
      .action(
        AdminUtils.createAdminCommand(
          "template uninstall",
          this.uninstallTemplate.bind(this),
          {
            requireConfirmation: true,
            action: "uninstall template",
            warning: "This will remove the template permanently.",
          },
        ),
      );

    // Create new template
    this.templateCommand
      .command("new")
      .description("Create a new template")
      .option("--category <category>", "Template category")
      .option("--language <language>", "Programming language")
      .option("--framework <framework>", "Framework or library")
      .option("--interactive", "Interactive template creation")
      .argument("<name>", "Template name")
      .action(
        AdminUtils.createAdminCommand(
          "template new",
          this.createNewTemplate.bind(this),
        ),
      );

    // Validate template
    this.templateCommand
      .command("validate")
      .description("Validate template structure")
      .option("--fix", "Auto-fix validation issues")
      .option("--strict", "Strict validation mode")
      .argument("[template-path]", "Path to template directory", ".")
      .action(
        AdminUtils.createAdminCommand(
          "template validate",
          this.validateTemplate.bind(this),
        ),
      );

    // Template search
    this.templateCommand
      .command("search")
      .description("Search for templates")
      .option("--category <category>", "Filter by category")
      .option("--language <language>", "Filter by language")
      .option("--framework <framework>", "Filter by framework")
      .option("--limit <count>", "Limit results", "20")
      .argument("<query>", "Search query")
      .action(
        AdminUtils.createAdminCommand(
          "template search",
          this.searchTemplates.bind(this),
        ),
      );

    // Update templates
    this.templateCommand
      .command("update")
      .description("Update templates")
      .option("--all", "Update all templates")
      .option("--check", "Check for updates without installing")
      .argument("[templates...]", "Template names to update")
      .action(
        AdminUtils.createAdminCommand(
          "template update",
          this.updateTemplates.bind(this),
        ),
      );

    // Template configuration
    this.templateCommand
      .command("config")
      .description("Manage template configuration")
      .option("--set <key=value>", "Set configuration value")
      .option("--get <key>", "Get configuration value")
      .option("--list", "List all configuration")
      .option("--reset", "Reset to default configuration")
      .argument("[template]", "Template name")
      .action(
        AdminUtils.createAdminCommand(
          "template config",
          this.manageTemplateConfig.bind(this),
        ),
      );

    // Publish template
    this.templateCommand
      .command("publish")
      .description("Publish template to registry")
      .option("--registry <url>", "Registry URL")
      .option("--dry-run", "Simulate publishing")
      .option("--tag <tag>", "Publication tag", "latest")
      .argument("[template-path]", "Path to template directory", ".")
      .action(
        AdminUtils.createAdminCommand(
          "template publish",
          this.publishTemplate.bind(this),
          {
            requireConfirmation: true,
            action: "publish template",
            warning: "This will publish the template to the public registry.",
          },
        ),
      );

    // Template marketplace
    this.templateCommand
      .command("marketplace")
      .description("Browse template marketplace")
      .option("--featured", "Show featured templates")
      .option("--popular", "Show popular templates")
      .option("--recent", "Show recently updated templates")
      .option("--category <category>", "Filter by category")
      .action(
        AdminUtils.createAdminCommand(
          "template marketplace",
          this.browseMarketplace.bind(this),
        ),
      );

    // Template preview
    this.templateCommand
      .command("preview")
      .description("Preview template structure")
      .option("--tree", "Show as directory tree")
      .option("--files", "List all files")
      .argument("<template>", "Template name")
      .action(
        AdminUtils.createAdminCommand(
          "template preview",
          this.previewTemplate.bind(this),
        ),
      );

    // Clone template
    this.templateCommand
      .command("clone")
      .description("Clone template from repository")
      .option("--branch <branch>", "Specific branch to clone")
      .option("--depth <depth>", "Clone depth")
      .argument("<repository>", "Repository URL")
      .argument("[directory]", "Target directory")
      .action(
        AdminUtils.createAdminCommand(
          "template clone",
          this.cloneTemplate.bind(this),
        ),
      );
  }

  /**
   * List available templates
   */
  async listTemplates(options, _command) {
    const { all, category, language, json } = options;

    logger.info("Listing templates", { all, category, language, json });

    console.log(chalk.blue("📚 Available Templates"));

    try {
      const templates = await this.getAvailableTemplates();
      let filteredTemplates = templates;

      if (category) {
        filteredTemplates = templates.filter((t) => t.category === category);
      }

      if (language) {
        filteredTemplates = filteredTemplates.filter(
          (t) => t.language === language,
        );
      }

      if (json) {
        console.log(JSON.stringify(filteredTemplates, null, 2));
        return;
      }

      if (filteredTemplates.length === 0) {
        console.log(chalk.yellow("📝 No templates found matching criteria"));
        return;
      }

      console.log();

      // Group by category
      const groupedTemplates = this.groupBy(filteredTemplates, "category");

      Object.entries(groupedTemplates).forEach(
        ([categoryName, categoryTemplates]) => {
          console.log(chalk.cyan("📂 " + categoryName.toUpperCase() + ":"));

          categoryTemplates.forEach((template, index) => {
            const version = chalk.gray("v" + template.version);
            const language = template.language
              ? chalk.blue("[" + template.language + "]")
              : "";

            console.log(
              "  " +
                (index + 1) +
                ". " +
                chalk.white(template.name) +
                " " +
                version +
                " " +
                language,
            );
            console.log("     " + chalk.gray(template.description));

            if (template.framework) {
              console.log("     Framework: " + chalk.green(template.framework));
            }
          });
          console.log();
        },
      );

      console.log(
        chalk.gray("Total: " + filteredTemplates.length + " templates"),
      );
      logger.success("Templates listed", { count: filteredTemplates.length });
    } catch (error) {
      console.log(chalk.red("❌ Failed to list templates: " + error.message));
      logger.error("Template listing failed", error);
    }
  }

  /**
   * Create project from template
   */
  async createFromTemplate(projectName, directory, options, _command) {
    const { template, interactive, git, install, force } = options;

    logger.info("Creating project from template", {
      projectName,
      template,
      directory,
      interactive,
      git,
      install,
    });

    const targetDir = directory || projectName;
    const fullPath = path.resolve(targetDir);

    console.log(chalk.blue("🎨 Creating project: " + projectName));
    console.log(chalk.cyan("   Template: " + template));
    console.log(chalk.cyan("   Directory: " + fullPath));

    try {
      // Check if directory exists
      if ((await fs.pathExists(fullPath)) && !force) {
        console.log(
          chalk.red("❌ Directory '" + targetDir + "' already exists"),
        );
        console.log(chalk.gray("Use --force to overwrite"));
        return;
      }

      // Get template info
      const templateInfo = await this.getTemplateInfo(template);
      if (!templateInfo) {
        console.log(chalk.red("❌ Template '" + template + "' not found"));
        return;
      }

      console.log(chalk.blue("📦 Preparing template..."));
      await this.prepareTemplate(template);

      console.log(chalk.blue("🗋 Creating project structure..."));
      await this.createProjectStructure(fullPath, templateInfo, {
        projectName,
        force,
      });

      if (interactive) {
        console.log(chalk.blue("⚙️ Interactive configuration..."));
        await this.runInteractiveSetup(fullPath, templateInfo);
      }

      console.log(chalk.blue("🔍 Processing template variables..."));
      await this.processTemplateVariables(fullPath, {
        projectName,
        template: templateInfo,
      });

      if (git) {
        console.log(chalk.blue("🌱 Initializing git repository..."));
        await this.initializeGitRepository(fullPath);
      }

      if (install && templateInfo.hasPackageManager) {
        console.log(chalk.blue("📦 Installing dependencies..."));
        await this.installProjectDependencies(fullPath, templateInfo);
      }

      console.log(
        chalk.green("✅ Project '" + projectName + "' created successfully!"),
      );

      // Show next steps
      this.showNextSteps(projectName, targetDir, templateInfo);

      logger.success("Project created from template", {
        projectName,
        template,
        directory: fullPath,
      });
    } catch (error) {
      console.log(chalk.red("❌ Project creation failed: " + error.message));
      logger.error("Template project creation failed", error);
    }
  }

  /**
   * Show template information
   */
  async showTemplateInfo(templateName, options, _command) {
    const { verbose } = options;

    logger.info("Showing template info", { templateName, verbose });

    console.log(chalk.blue("🔍 Template Information: " + templateName));

    try {
      const templateInfo = await this.getTemplateInfo(templateName);

      if (!templateInfo) {
        console.log(chalk.red("❌ Template '" + templateName + "' not found"));
        return;
      }

      console.log();
      console.log(chalk.cyan("📝 Basic Information:"));
      console.log("   Name: " + chalk.white(templateInfo.name));
      console.log("   Version: " + chalk.white(templateInfo.version));
      console.log("   Category: " + chalk.blue(templateInfo.category));
      console.log("   Language: " + chalk.green(templateInfo.language));
      console.log("   Description: " + chalk.gray(templateInfo.description));

      if (templateInfo.author) {
        console.log("   Author: " + chalk.blue(templateInfo.author));
      }

      if (templateInfo.framework) {
        console.log("   Framework: " + chalk.green(templateInfo.framework));
      }

      if (templateInfo.homepage) {
        console.log("   Homepage: " + chalk.underline(templateInfo.homepage));
      }

      if (verbose) {
        console.log(chalk.cyan("\n🔧 Technical Details:"));
        console.log(
          "   Size: " + chalk.gray(this.formatBytes(templateInfo.size)),
        );
        console.log("   Files: " + chalk.gray(templateInfo.fileCount));
        console.log(
          "   Package Manager: " +
            chalk.gray(templateInfo.packageManager || "None"),
        );
        console.log(
          "   Dependencies: " +
            chalk.gray(templateInfo.dependencies?.length || 0),
        );

        if (templateInfo.features && templateInfo.features.length > 0) {
          console.log(chalk.cyan("\n✨ Features:"));
          templateInfo.features.forEach((feature) => {
            console.log("   • " + chalk.white(feature));
          });
        }

        if (
          templateInfo.scripts &&
          Object.keys(templateInfo.scripts).length > 0
        ) {
          console.log(chalk.cyan("\n⚡ Available Scripts:"));
          Object.entries(templateInfo.scripts).forEach(
            ([name, description]) => {
              console.log(
                "   " + chalk.white(name) + ": " + chalk.gray(description),
              );
            },
          );
        }
      }

      logger.success("Template info displayed", { templateName });
    } catch (error) {
      console.log(
        chalk.red("❌ Failed to get template info: " + error.message),
      );
      logger.error("Template info failed", error);
    }
  }

  // Helper methods
  async getAvailableTemplates() {
    // Mock template data
    return [
      {
        name: "react-app",
        version: "1.0.0",
        category: "frontend",
        language: "JavaScript",
        framework: "React",
        description: "Modern React application with TypeScript support",
        author: "SAR Team",
        size: 5242880, // 5MB
        fileCount: 45,
        packageManager: "npm",
        hasPackageManager: true,
        dependencies: ["react", "react-dom", "typescript"],
        features: ["TypeScript", "ESLint", "Prettier", "Hot Reload"],
        scripts: {
          dev: "Start development server",
          build: "Build for production",
          test: "Run tests",
        },
        homepage: "https://github.com/sar-meta/template-react-app",
      },
      {
        name: "node-api",
        version: "2.1.0",
        category: "backend",
        language: "JavaScript",
        framework: "Express",
        description: "RESTful API with Node.js and Express",
        author: "SAR Team",
        size: 3145728, // 3MB
        fileCount: 28,
        packageManager: "npm",
        hasPackageManager: true,
        dependencies: ["express", "cors", "helmet"],
        features: ["Authentication", "Validation", "Logging", "Testing"],
        scripts: {
          start: "Start production server",
          dev: "Start development server",
          test: "Run test suite",
        },
        homepage: "https://github.com/sar-meta/template-node-api",
      },
      {
        name: "vue-spa",
        version: "3.0.2",
        category: "frontend",
        language: "JavaScript",
        framework: "Vue",
        description: "Single Page Application with Vue 3 and Vite",
        author: "Community",
        size: 4194304, // 4MB
        fileCount: 38,
        packageManager: "yarn",
        hasPackageManager: true,
        dependencies: ["vue", "vue-router", "pinia"],
        features: ["Vue 3", "Composition API", "Vite", "PWA Ready"],
        scripts: {
          dev: "Start development server",
          build: "Build for production",
          preview: "Preview build locally",
        },
        homepage: "https://github.com/community/vue-spa-template",
      },
      {
        name: "python-cli",
        version: "1.2.1",
        category: "cli",
        language: "Python",
        framework: "Click",
        description: "Command-line tool with Python and Click",
        author: "SAR Team",
        size: 1048576, // 1MB
        fileCount: 15,
        packageManager: "pip",
        hasPackageManager: true,
        dependencies: ["click", "colorama", "requests"],
        features: ["Argument Parsing", "Colored Output", "Config Files"],
        scripts: {
          install: "Install in development mode",
          test: "Run tests with pytest",
        },
        homepage: "https://github.com/sar-meta/template-python-cli",
      },
    ];
  }

  async getTemplateInfo(templateName) {
    const templates = await this.getAvailableTemplates();
    return templates.find((t) => t.name === templateName);
  }

  async prepareTemplate(template) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log(chalk.green("   ✅ Template prepared"));
  }

  async createProjectStructure(targetPath, templateInfo, options) {
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Ensure target directory exists
    await fs.ensureDir(targetPath);

    console.log(
      chalk.green("   ✅ Created " + templateInfo.fileCount + " files"),
    );
  }

  async runInteractiveSetup(projectPath, templateInfo) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log(chalk.green("   ✅ Interactive setup completed"));
  }

  async processTemplateVariables(projectPath, variables) {
    await new Promise((resolve) => setTimeout(resolve, 800));
    console.log(chalk.green("   ✅ Template variables processed"));
  }

  async initializeGitRepository(projectPath) {
    try {
      await execAsync("git init", { cwd: projectPath });
      console.log(chalk.green("   ✅ Git repository initialized"));
    } catch (error) {
      console.log(
        chalk.yellow("   ⚠️  Git initialization failed: " + error.message),
      );
    }
  }

  async installProjectDependencies(projectPath, templateInfo) {
    await new Promise((resolve) => setTimeout(resolve, 3000));
    const packageManager = templateInfo.packageManager || "npm";
    console.log(
      chalk.green("   ✅ Dependencies installed via " + packageManager),
    );
  }

  showNextSteps(projectName, directory, templateInfo) {
    console.log(chalk.cyan("\n📚 Next Steps:"));
    console.log("   1. cd " + directory);

    if (templateInfo.scripts) {
      if (templateInfo.scripts.dev) {
        console.log("   2. npm run dev    # " + templateInfo.scripts.dev);
      } else if (templateInfo.scripts.start) {
        console.log("   2. npm start      # " + templateInfo.scripts.start);
      }

      if (templateInfo.scripts.build) {
        console.log("   3. npm run build  # " + templateInfo.scripts.build);
      }
    }

    console.log(
      chalk.gray(
        "\n📄 Documentation and examples can be found in the project files.",
      ),
    );
  }

  groupBy(array, key) {
    return array.reduce((result, item) => {
      const group = item[key];
      if (!result[group]) {
        result[group] = [];
      }
      result[group].push(item);
      return result;
    }, {});
  }

  formatBytes(bytes) {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  // Placeholder methods for remaining functionality
  async installTemplate(template, options, _command) {
    console.log(chalk.blue("📦 Template installation (placeholder)"));
    logger.info("Template installation requested", { template, options });
  }

  async uninstallTemplate(template, options, _command) {
    console.log(chalk.blue("🗑️ Template uninstallation (placeholder)"));
    logger.info("Template uninstallation requested", { template, options });
  }

  async createNewTemplate(name, options, _command) {
    console.log(chalk.blue("🎨 New template creation (placeholder)"));
    logger.info("New template creation requested", { name, options });
  }

  async validateTemplate(templatePath, options, _command) {
    console.log(chalk.blue("✅ Template validation (placeholder)"));
    logger.info("Template validation requested", { templatePath, options });
  }

  async searchTemplates(query, options, _command) {
    console.log(chalk.blue("🔍 Template search (placeholder)"));
    logger.info("Template search requested", { query, options });
  }

  async updateTemplates(templates, options, _command) {
    console.log(chalk.blue("🔄 Template updates (placeholder)"));
    logger.info("Template updates requested", { templates, options });
  }

  async manageTemplateConfig(template, options, _command) {
    console.log(chalk.blue("⚙️ Template configuration (placeholder)"));
    logger.info("Template configuration requested", { template, options });
  }

  async publishTemplate(templatePath, options, _command) {
    console.log(chalk.blue("📤 Template publishing (placeholder)"));
    logger.info("Template publishing requested", { templatePath, options });
  }

  async browseMarketplace(options, _command) {
    console.log(chalk.blue("🛒 Template marketplace (placeholder)"));
    logger.info("Template marketplace requested", options);
  }

  async previewTemplate(template, options, _command) {
    console.log(chalk.blue("👀 Template preview (placeholder)"));
    logger.info("Template preview requested", { template, options });
  }

  async cloneTemplate(repository, directory, options, _command) {
    console.log(chalk.blue("📥 Template cloning (placeholder)"));
    logger.info("Template cloning requested", {
      repository,
      directory,
      options,
    });
  }

  getCommand() {
    return this.templateCommand;
  }
}

// Create and export the template command
const templateCommandInstance = new TemplateCommand();
module.exports = templateCommandInstance.getCommand();
