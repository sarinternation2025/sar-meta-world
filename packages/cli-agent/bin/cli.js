#!/usr/bin/env node

const { Command } = require('commander');
const chalk = require('chalk');
const figlet = require('figlet');
const packageJson = require('../package.json');

// Import command modules
const backupCommand = require('../src/commands/backup');
const configCommand = require('../src/commands/config');
const dbCommand = require('../src/commands/db');
const deployCommand = require('../src/commands/deploy');
const dockerCommand = require('../src/commands/docker');
const gitCommand = require('../src/commands/git');
const monitorCommand = require('../src/commands/monitor');
const optimizeCommand = require('../src/commands/optimize');
const pluginCommand = require('../src/commands/plugin');
const projectCommand = require('../src/commands/project');
const securityCommand = require('../src/commands/security');
const serverCommand = require('../src/commands/server');
const templateCommand = require('../src/commands/template');
const testCommand = require('../src/commands/test');

// Create main program
const program = new Command();

// Set up program metadata
program
  .name('sar-cli')
  .description('SAR Meta World CLI Agent - A comprehensive command-line interface for managing SAR projects')
  .version(packageJson.version, '-v, --version', 'display version number');

// Display banner for help command
program.on('--help', () => {
  console.log('');
  console.log(chalk.cyan(figlet.textSync('SAR CLI', { horizontalLayout: 'full' })));
  console.log('');
  console.log(chalk.yellow('Examples:'));
  console.log('  $ sar-cli project init my-project');
  console.log('  $ sar-cli deploy start');
  console.log('  $ sar-cli config set key value');
  console.log('  $ sar-cli server start');
  console.log('');
});

// Add command modules to the main program
function addCommandsToProgram() {
  try {
    // Add backup commands
    if (backupCommand && backupCommand.constructor && backupCommand.constructor.name === 'Command') {
      program.addCommand(backupCommand);
    }

    // Add config commands
    if (configCommand && configCommand.constructor && configCommand.constructor.name === 'Command') {
      program.addCommand(configCommand);
    }

    // Add database commands (with admin check)
    if (dbCommand && typeof dbCommand === 'object') {
      if (dbCommand.dbCommand && dbCommand.dbCommand.constructor && dbCommand.dbCommand.constructor.name === 'Command') {
        // Add admin check to db command
        const dbCmd = dbCommand.dbCommand;
        dbCmd.hook('preAction', (thisCommand, actionCommand) => {
          if (dbCommand.checkAdminAccess) {
            dbCommand.checkAdminAccess();
          }
        });
        program.addCommand(dbCmd);
      }
    }

    // Add deploy commands (new structure)
    if (deployCommand && deployCommand.constructor && deployCommand.constructor.name === 'Command') {
      program.addCommand(deployCommand);
    }

    // Add docker commands (with admin check)
    if (dockerCommand && typeof dockerCommand === 'object' && dockerCommand.checkAdminAccess) {
      const dockerCmd = new Command('docker')
        .description('Docker commands (admin only)')
        .action(() => {
          dockerCommand.checkAdminAccess();
          console.log(chalk.blue('Docker command executed - implementation needed'));
        });
      program.addCommand(dockerCmd);
    }

    // Add git commands
    if (gitCommand && gitCommand.constructor && gitCommand.constructor.name === 'Command') {
      program.addCommand(gitCommand);
    }

    // Add monitor commands (with admin check)
    if (monitorCommand && typeof monitorCommand === 'object' && monitorCommand.checkAdminAccess) {
      const monitorCmd = new Command('monitor')
        .description('Monitor commands (admin only)')
        .action(() => {
          monitorCommand.checkAdminAccess();
          console.log(chalk.yellow('Monitor command executed - implementation needed'));
        });
      program.addCommand(monitorCmd);
    }

    // Add optimize commands
    if (optimizeCommand && optimizeCommand.constructor && optimizeCommand.constructor.name === 'Command') {
      program.addCommand(optimizeCommand);
    }

    // Add plugin commands
    if (pluginCommand && pluginCommand.constructor && pluginCommand.constructor.name === 'Command') {
      program.addCommand(pluginCommand);
    }

    // Add project commands (new structure)
    if (projectCommand && projectCommand.constructor && projectCommand.constructor.name === 'Command') {
      program.addCommand(projectCommand);
    }

    // Add security commands
    if (securityCommand && securityCommand.constructor && securityCommand.constructor.name === 'Command') {
      program.addCommand(securityCommand);
    }

    // Add server commands
    if (serverCommand && serverCommand.constructor && serverCommand.constructor.name === 'Command') {
      program.addCommand(serverCommand);
    }

    // Add template commands
    if (templateCommand && templateCommand.constructor && templateCommand.constructor.name === 'Command') {
      program.addCommand(templateCommand);
    }

    // Add test commands
    if (testCommand && testCommand.constructor && testCommand.constructor.name === 'Command') {
      program.addCommand(testCommand);
    }

    // Add AI command placeholder (to be implemented)
    const aiCommand = new Command('ai')
      .description('AI-powered commands for development assistance')
      .action(() => {
        console.log(chalk.yellow('🤖 AI commands are coming soon!'));
        console.log(chalk.gray('This feature will provide AI-powered assistance for:'));
        console.log(chalk.gray('  • Code generation and analysis'));
        console.log(chalk.gray('  • Deployment optimization'));
        console.log(chalk.gray('  • Performance suggestions'));
        console.log(chalk.gray('  • Security recommendations'));
      });
    program.addCommand(aiCommand);

  } catch (error) {
    console.error(chalk.red('Error loading command modules:'), error.message);
    if (program.opts().verbose) {
      console.error(chalk.red('Stack trace:'), error.stack);
    }
    process.exit(1);
  }
}

// Global options
program
  .option('-v, --verbose', 'Enable verbose logging')
  .option('-q, --quiet', 'Suppress output')
  .option('--config <path>', 'Specify config file path')
  .option('--no-color', 'Disable colored output');

// Global error handler
process.on('uncaughtException', (error) => {
  console.error(chalk.red('Uncaught Exception:'), error.message);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error(chalk.red('Unhandled Rejection at:'), promise, chalk.red('reason:'), reason);
  process.exit(1);
});

// Main execution
async function main() {
  try {
    // Load environment variables
    require('dotenv').config();

    // Add all commands to the program
    addCommandsToProgram();

    // Handle case where no command is provided
    if (process.argv.length === 2) {
      console.log(chalk.cyan(figlet.textSync('SAR CLI', { horizontalLayout: 'full' })));
      console.log('');
      console.log(chalk.green(`SAR Meta World CLI Agent v${packageJson.version}`));
      console.log(chalk.gray('A comprehensive command-line interface for managing SAR projects'));
      console.log('');
      console.log(chalk.yellow('Use --help to see available commands'));
      console.log('');
      return;
    }

    // Parse command line arguments
    await program.parseAsync(process.argv);

  } catch (error) {
    console.error(chalk.red('CLI Error:'), error.message);
    process.exit(1);
  }
}

// Run the CLI if this file is executed directly
if (require.main === module) {
  main();
}

module.exports = {
  program,
  main
};
