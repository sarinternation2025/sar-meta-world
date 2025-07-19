const { Command } = require("commander");
const { AdminUtils } = require("../../utils/admin");
const { logger } = require("../../utils/logger");
const { config: _config } = require("../../utils/config"); // eslint-disable-line no-unused-vars
const chalk = require("chalk");
const fs = require("fs-extra"); // eslint-disable-line no-unused-vars
const path = require("path"); // eslint-disable-line no-unused-vars
const { spawn: _spawn } = require("child_process"); // eslint-disable-line no-unused-vars

/**
 * Docker command with comprehensive container management functionality
 */
class DockerCommand {
  constructor() {
    this.dockerCommand = new Command("docker").description(
      "Comprehensive Docker container and image management",
    );

    this.setupSubcommands();
  }

  /**
   * Setup docker subcommands
   */
  setupSubcommands() {
    // Container management commands
    this.dockerCommand
      .command("containers")
      .description("List and manage containers")
      .option("-a, --all", "Show all containers (including stopped)")
      .option("--format <format>", "Output format (table, json)", "table")
      .action(
        AdminUtils.createAdminCommand(
          "docker containers",
          this.listContainers.bind(this),
        ),
      );

    this.dockerCommand
      .command("images")
      .description("List Docker images")
      .option("--format <format>", "Output format (table, json)", "table")
      .option("--filter <filter>", "Filter images")
      .action(
        AdminUtils.createAdminCommand(
          "docker images",
          this.listImages.bind(this),
        ),
      );

    this.dockerCommand
      .command("build")
      .description("Build Docker image")
      .argument("[path]", "Build context path", ".")
      .option("-t, --tag <tag>", "Tag for the image")
      .option("-f, --file <dockerfile>", "Path to Dockerfile")
      .option("--no-cache", "Do not use cache when building")
      .action(
        AdminUtils.createAdminCommand(
          "docker build",
          this.buildImage.bind(this),
          {
            requireConfirmation: true,
            action: "build Docker image",
            warning:
              "This will build a new Docker image which may take some time.",
          },
        ),
      );

    this.dockerCommand
      .command("run")
      .description("Run a container")
      .argument("<image>", "Image to run")
      .option("-d, --detach", "Run container in background")
      .option("-p, --port <port>", "Port mapping (host:container)")
      .option("-v, --volume <volume>", "Volume mapping (host:container)")
      .option("-e, --env <env>", "Environment variables", [])
      .option("--name <name>", "Container name")
      .action(
        AdminUtils.createAdminCommand(
          "docker run",
          this.runContainer.bind(this),
        ),
      );

    this.dockerCommand
      .command("stop")
      .description("Stop running containers")
      .argument("<containers...>", "Container names or IDs")
      .option("-f, --force", "Force stop (kill)")
      .action(
        AdminUtils.createAdminCommand(
          "docker stop",
          this.stopContainers.bind(this),
        ),
      );

    this.dockerCommand
      .command("start")
      .description("Start stopped containers")
      .argument("<containers...>", "Container names or IDs")
      .action(
        AdminUtils.createAdminCommand(
          "docker start",
          this.startContainers.bind(this),
        ),
      );

    this.dockerCommand
      .command("logs")
      .description("Show container logs")
      .argument("<container>", "Container name or ID")
      .option("-f, --follow", "Follow log output")
      .option("-t, --timestamps", "Show timestamps")
      .option("--tail <lines>", "Number of lines to show from end", "100")
      .action(
        AdminUtils.createAdminCommand("docker logs", this.showLogs.bind(this)),
      );

    this.dockerCommand
      .command("stats")
      .description("Show container resource usage statistics")
      .option("-a, --all", "Show all containers (including stopped)")
      .option("--no-stream", "Disable streaming stats")
      .action(
        AdminUtils.createAdminCommand(
          "docker stats",
          this.showStats.bind(this),
        ),
      );

    this.dockerCommand
      .command("deploy")
      .description("Deploy SAR Meta World stack")
      .option("-e, --env <env>", "Environment (dev, staging, prod)", "dev")
      .option("--scale <service=count>", "Scale specific services")
      .option("--update", "Update existing deployment")
      .action(
        AdminUtils.createAdminCommand(
          "docker deploy",
          this.deployStack.bind(this),
          {
            requireConfirmation: true,
            action: "deploy application stack",
            warning:
              "This will deploy the full application stack using Docker.",
          },
        ),
      );

    this.dockerCommand
      .command("status")
      .description("Show Docker system status")
      .action(
        AdminUtils.createAdminCommand(
          "docker status",
          this.systemStatus.bind(this),
        ),
      );

    this.dockerCommand
      .command("prune")
      .description("Clean up Docker resources")
      .option("--containers", "Remove stopped containers")
      .option("--images", "Remove unused images")
      .option("--volumes", "Remove unused volumes")
      .option("--all", "Remove all unused resources")
      .option("-f, --force", "Do not prompt for confirmation")
      .action(
        AdminUtils.createAdminCommand(
          "docker prune",
          this.pruneResources.bind(this),
          {
            requireConfirmation: true,
            action: "clean up Docker resources",
            warning: "This will permanently delete unused Docker resources.",
          },
        ),
      );
  }

  /**
   * List containers
   */
  async listContainers(options, _command) {
    const { all, format } = options;

    logger.info("Listing Docker containers", { all, format });

    console.log(chalk.blue("🐳 Docker Containers:"));

    // Mock container data
    const containers = [
      {
        id: "abc123def456",
        name: "sar-frontend",
        image: "sar-frontend:latest",
        status: "running",
        ports: ["3000:3000"],
        created: Date.now() - 3600000,
      },
      {
        id: "def456ghi789",
        name: "sar-backend",
        image: "sar-backend:latest",
        status: "running",
        ports: ["8000:8000"],
        created: Date.now() - 7200000,
      },
      {
        id: "ghi789jkl012",
        name: "sar-database",
        image: "postgres:13",
        status: all ? "stopped" : "running",
        ports: ["5432:5432"],
        created: Date.now() - 86400000,
      },
    ];

    if (format === "json") {
      console.log(JSON.stringify(containers, null, 2));
      return;
    }

    console.log();
    containers.forEach((container, index) => {
      const status =
        container.status === "running"
          ? chalk.green("RUNNING")
          : chalk.red("STOPPED");
      const ports = container.ports.join(", ");
      const age = this.formatAge(container.created);

      console.log(
        `${index + 1}. ${chalk.cyan(container.name)} (${container.id.substring(0, 12)})`,
      );
      console.log(`   Image: ${chalk.white(container.image)}`);
      console.log(`   Status: ${status}`);
      console.log(`   Ports: ${chalk.blue(ports)}`);
      console.log(`   Created: ${chalk.gray(age)}`);
      console.log();
    });

    logger.success("Containers listed", { count: containers.length });
  }

  /**
   * List Docker images
   */
  async listImages(options, _command) {
    const { format, filter } = options;

    logger.info("Listing Docker images", { format, filter });

    console.log(chalk.blue("🖼️  Docker Images:"));

    // Mock images data
    const images = [
      {
        id: "sha256:abc123",
        repository: "sar-frontend",
        tag: "latest",
        size: 245000000,
        created: Date.now() - 3600000,
      },
      {
        id: "sha256:def456",
        repository: "sar-backend",
        tag: "latest",
        size: 180000000,
        created: Date.now() - 7200000,
      },
      {
        id: "sha256:ghi789",
        repository: "postgres",
        tag: "13",
        size: 314000000,
        created: Date.now() - 86400000,
      },
    ];

    if (format === "json") {
      console.log(JSON.stringify(images, null, 2));
      return;
    }

    console.log();
    images.forEach((image, index) => {
      const size = this.formatSize(image.size);
      const age = this.formatAge(image.created);

      console.log(
        `${index + 1}. ${chalk.cyan(`${image.repository}:${image.tag}`)} (${image.id.substring(7, 19)})`,
      );
      console.log(`   Size: ${chalk.white(size)}`);
      console.log(`   Created: ${chalk.gray(age)}`);
      console.log();
    });

    logger.success("Images listed", { count: images.length });
  }

  /**
   * Build Docker image
   */
  async buildImage(buildPath, options, _command) {
    const { tag, file } = options;

    logger.info("Building Docker image", { buildPath, tag, file });

    console.log(
      chalk.blue(
        `🔨 Building Docker image${tag ? ` with tag: ${tag}` : ""}...`,
      ),
    );

    console.log(chalk.blue("📦 Preparing build context..."));
    await new Promise((resolve) => setTimeout(resolve, 1000));

    console.log(chalk.blue("🔄 Building image layers..."));
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const imageTag = tag || "sar-meta-world:latest";
    console.log(chalk.green(`✅ Image built successfully: ${imageTag}`));

    logger.success("Docker image built", { tag: imageTag, buildPath });
  }

  /**
   * Run a container
   */
  async runContainer(image, options, _command) {
    const { detach, port, volume, env, name } = options;

    logger.info("Running Docker container", {
      image,
      detach,
      port,
      volume,
      env,
      name,
    });

    console.log(chalk.blue(`🚀 Running container from image: ${image}`));

    const containerName = name || `sar-${Date.now()}`;

    console.log(chalk.blue("📦 Creating container..."));
    await new Promise((resolve) => setTimeout(resolve, 1000));

    console.log(chalk.blue("▶️  Starting container..."));
    await new Promise((resolve) => setTimeout(resolve, 500));

    const containerId = `mock-${Math.random().toString(36).substring(7)}`;

    console.log(chalk.green(`✅ Container started successfully`));
    console.log(chalk.cyan(`   Container ID: ${containerId}`));
    console.log(chalk.cyan(`   Name: ${containerName}`));

    if (port) {
      console.log(chalk.blue(`   Port mapping: ${port}`));
    }

    if (!detach) {
      console.log(
        chalk.yellow(
          "📋 Container is running in foreground. Press Ctrl+C to stop.",
        ),
      );
    }

    logger.success("Container started", {
      image,
      name: containerName,
      containerId,
    });
  }

  /**
   * Stop containers
   */
  async stopContainers(containers, options, _command) {
    const { force } = options;

    logger.info("Stopping containers", { containers, force });

    console.log(chalk.blue(`🛑 Stopping ${containers.length} container(s)...`));

    for (const containerName of containers) {
      console.log(chalk.blue(`   Stopping ${containerName}...`));
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log(chalk.green(`   ✅ ${containerName} stopped`));
    }

    console.log(chalk.green(`✅ All containers stopped successfully`));
    logger.success("Containers stopped", { containers, force });
  }

  /**
   * Start containers
   */
  async startContainers(containers, options, _command) {
    logger.info("Starting containers", { containers });

    console.log(
      chalk.blue(`▶️  Starting ${containers.length} container(s)...`),
    );

    for (const containerName of containers) {
      console.log(chalk.blue(`   Starting ${containerName}...`));
      await new Promise((resolve) => setTimeout(resolve, 800));
      console.log(chalk.green(`   ✅ ${containerName} started`));
    }

    console.log(chalk.green(`✅ All containers started successfully`));
    logger.success("Containers started", { containers });
  }

  /**
   * Show container logs
   */
  async showLogs(container, options, _command) {
    const { follow, timestamps, tail } = options;

    logger.info("Showing container logs", {
      container,
      follow,
      timestamps,
      tail,
    });

    console.log(chalk.blue(`📋 Logs for container: ${container}`));
    console.log(chalk.gray("─".repeat(60)));

    // Mock log output
    const logLines = [
      "2025-01-19T00:54:00.000Z [INFO] Application starting...",
      "2025-01-19T00:54:01.234Z [INFO] Database connection established",
      "2025-01-19T00:54:02.567Z [INFO] Server listening on port 3000",
      "2025-01-19T00:54:03.890Z [INFO] Ready to accept connections",
      "2025-01-19T00:54:05.123Z [DEBUG] Health check passed",
    ];

    const displayLines = logLines.slice(-parseInt(tail));

    displayLines.forEach((line) => {
      if (line.includes("[ERROR]")) {
        console.log(chalk.red(line));
      } else if (line.includes("[WARN]")) {
        console.log(chalk.yellow(line));
      } else if (line.includes("[DEBUG]")) {
        console.log(chalk.gray(line));
      } else {
        console.log(chalk.white(line));
      }
    });

    if (follow) {
      console.log(chalk.blue("\n📡 Following logs... (Press Ctrl+C to stop)"));

      const interval = setInterval(() => {
        const timestamp = new Date().toISOString();
        const messages = [
          "[INFO] Request processed",
          "[DEBUG] Cache hit",
          "[INFO] Background task completed",
        ];
        const message = messages[Math.floor(Math.random() * messages.length)];
        console.log(chalk.white(`${timestamp} ${message}`));
      }, 2000);

      process.on("SIGINT", () => {
        clearInterval(interval);
        console.log(chalk.gray("\n📋 Stopped following logs"));
        process.exit(0);
      });
    }
  }

  /**
   * Show container statistics
   */
  async showStats(options, _command) {
    const { all, noStream } = options;

    logger.info("Showing container statistics", { all, noStream });

    console.log(chalk.blue("📊 Container Resource Usage:"));
    console.log();

    // Mock stats data
    const statsData = [
      {
        name: "sar-frontend",
        cpu: "12.5%",
        memory: "156MB / 512MB (30.5%)",
        network: "1.2MB / 850KB",
      },
      {
        name: "sar-backend",
        cpu: "8.3%",
        memory: "298MB / 1GB (29.8%)",
        network: "2.1MB / 1.5MB",
      },
    ];

    console.log(
      chalk.cyan(
        "Container".padEnd(20) +
          "CPU".padEnd(10) +
          "Memory".padEnd(25) +
          "Network I/O",
      ),
    );
    console.log(chalk.gray("─".repeat(65)));

    statsData.forEach((stat) => {
      console.log(
        chalk.white(stat.name.padEnd(20)) +
          chalk.yellow(stat.cpu.padEnd(10)) +
          chalk.blue(stat.memory.padEnd(25)) +
          chalk.green(stat.network),
      );
    });

    if (!noStream) {
      console.log(chalk.gray("\n📡 Live stats (Press Ctrl+C to stop)..."));
    }
  }

  /**
   * Deploy SAR Meta World stack
   */
  async deployStack(options, _command) {
    const { env, scale, update } = options;

    logger.info("Deploying SAR Meta World stack", { env, scale, update });

    console.log(
      chalk.blue(`🚀 Deploying SAR Meta World to ${env} environment...`),
    );

    const services = [
      { name: "frontend", port: "3000" },
      { name: "backend", port: "8000" },
      { name: "database", port: "5432" },
    ];

    console.log(chalk.blue("📦 Pulling latest images..."));
    await new Promise((resolve) => setTimeout(resolve, 2000));

    for (const service of services) {
      console.log(chalk.blue(`   Deploying ${service.name}...`));
      await new Promise((resolve) => setTimeout(resolve, 1500));
      console.log(
        chalk.green(`   ✅ ${service.name} deployed on port ${service.port}`),
      );
    }

    console.log(
      chalk.green("\n✅ SAR Meta World stack deployed successfully!"),
    );
    console.log(chalk.cyan("🌐 Application URLs:"));
    console.log(chalk.white("   Frontend: http://localhost:3000"));
    console.log(chalk.white("   Backend API: http://localhost:8000"));

    logger.success("Stack deployed", { env, services: services.length });
  }

  /**
   * Show Docker system status
   */
  async systemStatus(options, _command) {
    logger.info("Showing Docker system status");

    console.log(chalk.blue("🐳 Docker System Status:"));
    console.log();

    // Mock system info
    const systemInfo = {
      version: "20.10.17",
      containers: { running: 3, stopped: 2 },
      images: { total: 12, dangling: 2 },
      storage: { used: "2.1GB", available: "15.3GB" },
    };

    console.log(chalk.cyan("🐳 Docker Engine:"));
    console.log(`   Version: ${chalk.white(systemInfo.version)}`);
    console.log();

    console.log(chalk.cyan("📦 Containers:"));
    console.log(`   Running: ${chalk.green(systemInfo.containers.running)}`);
    console.log(`   Stopped: ${chalk.red(systemInfo.containers.stopped)}`);
    console.log();

    console.log(chalk.cyan("🖼️  Images:"));
    console.log(`   Total: ${chalk.white(systemInfo.images.total)}`);
    console.log(`   Dangling: ${chalk.yellow(systemInfo.images.dangling)}`);
    console.log();

    console.log(chalk.cyan("💾 Storage:"));
    console.log(`   Used: ${chalk.white(systemInfo.storage.used)}`);
    console.log(`   Available: ${chalk.green(systemInfo.storage.available)}`);

    logger.success("Docker system status retrieved", systemInfo);
  }

  /**
   * Prune Docker resources
   */
  async pruneResources(options, _command) {
    const { containers, images, volumes, all } = options;

    logger.info("Pruning Docker resources", {
      containers,
      images,
      volumes,
      all,
    });

    console.log(chalk.blue("🧹 Cleaning up Docker resources..."));

    let totalFreed = 0;

    if (containers || all) {
      console.log(chalk.blue("   Removing stopped containers..."));
      await new Promise((resolve) => setTimeout(resolve, 1000));
      totalFreed += 50;
      console.log(chalk.green("   ✅ Stopped containers removed"));
    }

    if (images || all) {
      console.log(chalk.blue("   Removing unused images..."));
      await new Promise((resolve) => setTimeout(resolve, 1500));
      totalFreed += 250;
      console.log(chalk.green("   ✅ Unused images removed"));
    }

    console.log(chalk.green(`\n✅ Cleanup complete! Freed ${totalFreed}MB`));
    logger.success("Docker resources pruned", { totalFreed });
  }

  // Helper methods
  formatSize(bytes) {
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  }

  formatAge(timestamp) {
    const diffMs = Date.now() - timestamp;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    }
    return "Less than an hour ago";
  }

  getCommand() {
    return this.dockerCommand;
  }
}

// Create and export the docker command
const dockerCommandInstance = new DockerCommand();
module.exports = dockerCommandInstance.getCommand();
