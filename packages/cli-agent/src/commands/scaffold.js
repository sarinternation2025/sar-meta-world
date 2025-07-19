const fs = require("fs-extra");
const path = require("path");
const inquirer = require("inquirer");
const chalk = require("chalk");
const ora = require("ora");
const { execSync } = require("child_process");

class ScaffoldCommand {
  constructor() {
    this.templates = {
      "react-app": {
        name: "React Application",
        description: "Modern React app with Vite, TypeScript, and Tailwind CSS",
        dependencies: [
          "react",
          "react-dom",
          "vite",
          "typescript",
          "tailwindcss",
        ],
        devDependencies: ["@vitejs/plugin-react", "eslint", "prettier"],
      },
      "node-api": {
        name: "Node.js API",
        description:
          "Express.js API with TypeScript, validation, and monitoring",
        dependencies: ["express", "cors", "helmet", "morgan", "joi", "winston"],
        devDependencies: [
          "nodemon",
          "typescript",
          "@types/node",
          "@types/express",
        ],
      },
      "docker-service": {
        name: "Docker Service",
        description: "Containerized service with Docker Compose integration",
        dependencies: [],
        devDependencies: [],
      },
      "monitoring-dashboard": {
        name: "Monitoring Dashboard",
        description:
          "Real-time monitoring dashboard with Grafana and Prometheus",
        dependencies: ["express", "socket.io", "systeminformation"],
        devDependencies: ["nodemon"],
      },
    };
  }

  async execute(options = {}) {
    console.log(chalk.blue.bold("🚀 SAR Meta World Project Scaffold"));
    console.log(
      chalk.gray("Create new projects with best practices and standards\n"),
    );

    const answers = await this.promptUser(options);
    const spinner = ora("Creating project structure...").start();

    try {
      await this.createProject(answers);
      spinner.succeed("Project created successfully!");
      this.showNextSteps(answers);
    } catch (error) {
      spinner.fail("Failed to create project");
      console.error(chalk.red("Error:"), error.message);
      process.exit(1);
    }
  }

  async promptUser(options) {
    const questions = [
      {
        type: "input",
        name: "projectName",
        message: "Project name:",
        when: !options.name,
        validate: (input) => {
          if (!input.trim()) return "Project name is required";
          if (!/^[a-zA-Z0-9-_]+$/.test(input)) return "Invalid project name";
          return true;
        },
      },
      {
        type: "list",
        name: "template",
        message: "Choose a template:",
        choices: Object.entries(this.templates).map(([key, template]) => ({
          name: `${template.name} - ${template.description}`,
          value: key,
        })),
        when: !options.template,
      },
      {
        type: "input",
        name: "description",
        message: "Project description:",
        when: !options.description,
      },
      {
        type: "input",
        name: "author",
        message: "Author name:",
        default: "SAR International",
        when: !options.author,
      },
      {
        type: "confirm",
        name: "useTypeScript",
        message: "Use TypeScript?",
        default: true,
        when: (answers) =>
          ["react-app", "node-api"].includes(
            answers.template || options.template,
          ),
      },
      {
        type: "confirm",
        name: "includeDocker",
        message: "Include Docker configuration?",
        default: true,
        when: !options.docker,
      },
      {
        type: "confirm",
        name: "includeGitHub",
        message: "Include GitHub Actions CI/CD?",
        default: true,
        when: !options.github,
      },
      {
        type: "confirm",
        name: "includeMonitoring",
        message: "Include monitoring setup?",
        default: true,
        when: !options.monitoring,
      },
    ];

    return { ...options, ...(await inquirer.prompt(questions)) };
  }

  async createProject(answers) {
    const {
      projectName,
      template,
      description, // eslint-disable-line no-unused-vars
      author, // eslint-disable-line no-unused-vars
      useTypeScript,
      includeDocker,
      includeGitHub,
      includeMonitoring,
    } = answers;

    const projectPath = path.join(process.cwd(), projectName);

    // Create project directory
    await fs.ensureDir(projectPath);

    // Create basic structure
    await this.createBasicStructure(projectPath, answers);

    // Create template-specific files
    await this.createTemplateFiles(projectPath, template, answers);

    // Add optional features
    if (includeDocker) await this.addDockerFiles(projectPath, template);
    if (includeGitHub) await this.addGitHubActions(projectPath, template);
    if (includeMonitoring) await this.addMonitoringSetup(projectPath);

    // Initialize git repository
    await this.initializeGit(projectPath);

    // Install dependencies
    await this.installDependencies(projectPath, template, useTypeScript);
  }

  async createBasicStructure(projectPath, answers) {
    const { projectName, description, author } = answers;

    // Create package.json
    const packageJson = {
      name: projectName,
      version: "1.0.0",
      description: description || "SAR Meta World Project",
      main: "index.js",
      scripts: {
        start: "node index.js",
        dev: "nodemon index.js",
        build: "npm run build:prod",
        test: "jest",
        lint: "eslint .",
        format: "prettier --write .",
      },
      keywords: ["sar", "meta-world", "monitoring"],
      author: author || "SAR International",
      license: "MIT",
      dependencies: {},
      devDependencies: {},
    };

    await fs.writeJSON(path.join(projectPath, "package.json"), packageJson, {
      spaces: 2,
    });

    // Create README.md
    const readmeContent = `# ${projectName}

${description || "SAR Meta World Project"}

## Features

- Modern development stack
- Docker containerization
- Monitoring and logging
- CI/CD pipeline ready

## Getting Started

\`\`\`bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test
\`\`\`

## Project Structure

\`\`\`
${projectName}/
├── src/                # Source code
├── tests/              # Test files
├── docs/               # Documentation
├── docker/             # Docker configuration
├── .github/            # GitHub Actions
└── monitoring/         # Monitoring setup
\`\`\`

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License - see LICENSE file for details
`;

    await fs.writeFile(path.join(projectPath, "README.md"), readmeContent);

    // Create basic directories
    await fs.ensureDir(path.join(projectPath, "src"));
    await fs.ensureDir(path.join(projectPath, "tests"));
    await fs.ensureDir(path.join(projectPath, "docs"));
    await fs.ensureDir(path.join(projectPath, "config"));

    // Create .gitignore
    const gitignoreContent = `
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# nyc test coverage
.nyc_output

# Dependency directories
jspm_packages/

# Distribution directories
dist/
build/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
logs/
*.log

# Docker
docker-compose.override.yml
`;

    await fs.writeFile(
      path.join(projectPath, ".gitignore"),
      gitignoreContent.trim(),
    );
  }

  async createTemplateFiles(projectPath, template, answers) {
    const templateConfig = this.templates[template]; // eslint-disable-line no-unused-vars

    switch (template) {
      case "react-app":
        await this.createReactApp(projectPath, answers);
        break;
      case "node-api":
        await this.createNodeAPI(projectPath, answers);
        break;
      case "docker-service":
        await this.createDockerService(projectPath, answers);
        break;
      case "monitoring-dashboard":
        await this.createMonitoringDashboard(projectPath, answers);
        break;
    }
  }

  async createReactApp(projectPath, answers) {
    const { useTypeScript } = answers;
    const extension = useTypeScript ? "tsx" : "jsx";

    // Create App component
    const appComponent = `import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>SAR Meta World</h1>
        <p>Welcome to your new React application!</p>
      </header>
    </div>
  );
}

export default App;`;

    await fs.writeFile(
      path.join(projectPath, `src/App.${extension}`),
      appComponent,
    );

    // Create index file
    const indexContent = `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);`;

    await fs.writeFile(
      path.join(projectPath, `src/index.${extension}`),
      indexContent,
    );

    // Create Vite config
    const viteConfig = `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
});`;

    await fs.writeFile(path.join(projectPath, "vite.config.js"), viteConfig);
  }

  async createNodeAPI(projectPath, answers) {
    const { useTypeScript } = answers;
    const extension = useTypeScript ? "ts" : "js";

    // Create main server file
    const serverContent = `const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const winston = require('winston');

const app = express();
const port = process.env.PORT || 3001;

// Logger setup
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console()
  ]
});

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'SAR Meta World API', version: '1.0.0' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Error handling
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(port, () => {
  logger.info(\`Server running on port \${port}\`);
});`;

    await fs.writeFile(
      path.join(projectPath, `src/index.${extension}`),
      serverContent,
    );
  }

  async addDockerFiles(projectPath, template) {
    // Create Dockerfile
    const dockerfileContent = `FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

USER node

CMD ["npm", "start"]`;

    await fs.writeFile(path.join(projectPath, "Dockerfile"), dockerfileContent);

    // Create docker-compose.yml
    const dockerComposeContent = `version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
    
  # Add additional services as needed
  # redis:
  #   image: redis:alpine
  #   ports:
  #     - "6379:6379"`;

    await fs.writeFile(
      path.join(projectPath, "docker-compose.yml"),
      dockerComposeContent,
    );
  }

  async addGitHubActions(projectPath, template) {
    const workflowsPath = path.join(projectPath, ".github/workflows");
    await fs.ensureDir(workflowsPath);

    const ciContent = `name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [16.x, 18.x]
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Use Node.js \${{ matrix.node-version }}
      uses: actions/setup-node@v3
      with:
        node-version: \${{ matrix.node-version }}
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm test
    
    - name: Run linter
      run: npm run lint
    
    - name: Build project
      run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Build and deploy
      run: |
        echo "Deployment step would go here"
        # Add your deployment commands
`;

    await fs.writeFile(path.join(workflowsPath, "ci.yml"), ciContent);
  }

  async initializeGit(projectPath) {
    try {
      execSync("git init", { cwd: projectPath, stdio: "pipe" });
      execSync("git add .", { cwd: projectPath, stdio: "pipe" });
      execSync('git commit -m "Initial commit"', {
        cwd: projectPath,
        stdio: "pipe",
      });
    } catch (error) {
      console.warn(
        chalk.yellow("Warning: Failed to initialize git repository"),
      );
    }
  }

  async installDependencies(projectPath, template, useTypeScript) {
    const templateConfig = this.templates[template];
    const packageJsonPath = path.join(projectPath, "package.json");
    const packageJson = await fs.readJSON(packageJsonPath);

    // Add template-specific dependencies
    templateConfig.dependencies.forEach((dep) => {
      packageJson.dependencies[dep] = "latest";
    });

    templateConfig.devDependencies.forEach((dep) => {
      packageJson.devDependencies[dep] = "latest";
    });

    // Add TypeScript dependencies if needed
    if (useTypeScript) {
      packageJson.devDependencies.typescript = "latest";
      packageJson.devDependencies["@types/node"] = "latest";
    }

    await fs.writeJSON(packageJsonPath, packageJson, { spaces: 2 });
  }

  showNextSteps(answers) {
    const { projectName } = answers;

    console.log(chalk.green.bold("\n✅ Project created successfully!"));
    console.log(chalk.gray("Next steps:"));
    console.log(chalk.blue(`  cd ${projectName}`));
    console.log(chalk.blue("  npm install"));
    console.log(chalk.blue("  npm run dev"));
    console.log(
      chalk.gray("\nFor more information, check the README.md file."),
    );
  }
}

module.exports = ScaffoldCommand;
