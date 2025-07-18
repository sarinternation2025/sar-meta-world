# SAR CLI Structure

This document explains the structure and architecture of the SAR CLI Agent.

## Main Entry Point

The main CLI executable is located at `bin/cli.js` and serves as the orchestrator for all CLI commands.

### Key Features

- **Modular Command Loading**: Dynamically imports command modules from `src/commands/`
- **Admin Access Control**: Enforces admin-only access for sensitive commands
- **Error Handling**: Comprehensive error handling with verbose logging option
- **Interactive Banner**: Displays ASCII art banner and usage information

## Command Structure

### Command Types

1. **Commander-based Commands**: Export `Command` objects directly
   - `backup`, `config`, `git`, `optimize`, `plugin`, `security`, `server`, `template`, `test`

2. **Admin-controlled Commands**: Export utility functions with admin checks
   - `deploy`, `docker`, `monitor`, `project`

3. **Mixed Commands**: Export both Command objects and utility functions
   - `db` (exports `dbCommand` and `checkAdminAccess`)

### Command Modules

All command modules are located in `src/commands/[command]/index.js`:

```
src/commands/
├── backup/index.js     # Backup and restore commands
├── config/index.js     # Configuration management
├── db/index.js         # Database operations (admin only)
├── deploy/index.js     # Deployment commands (admin only)
├── docker/index.js     # Docker management (admin only)
├── git/index.js        # Git operations
├── monitor/index.js    # System monitoring (admin only)
├── optimize/index.js   # Performance optimization
├── plugin/index.js     # Plugin management
├── project/index.js    # Project management (admin only)
├── security/index.js   # Security and audit
├── server/index.js     # Server management
├── template/index.js   # Template and scaffolding
└── test/index.js       # Testing commands
```

## Usage

### Basic Usage

```bash
# Display banner and version
sar-cli

# Show help
sar-cli --help

# Run a command
sar-cli config --help
```

### Admin Commands

Admin commands require the `SARU_ADMIN` environment variable to be set to `true`:

```bash
# This will fail
sar-cli deploy

# This will work
SARU_ADMIN=true sar-cli deploy
```

### Global Options

- `--verbose`: Enable verbose logging
- `--quiet`: Suppress output
- `--config <path>`: Specify config file path
- `--no-color`: Disable colored output

## Development

### Adding New Commands

1. Create a new directory in `src/commands/`
2. Create an `index.js` file that exports either:
   - A Commander `Command` object
   - An object with utility functions (for admin commands)
3. Update `bin/cli.js` to import and register the new command

### Admin Commands

For admin-only commands, export an object with:
- `checkAdminAccess()`: Function that checks admin status
- `isAdmin()`: Function that returns admin status

```javascript
function isAdmin() {
  return process.env.SARU_ADMIN === 'true';
}

function checkAdminAccess() {
  if (!isAdmin()) {
    console.error('Error: [Command] commands are restricted to admin users only.');
    process.exit(1);
  }
}

module.exports = {
  isAdmin,
  checkAdminAccess
};
```

## Dependencies

The CLI uses the following key dependencies:

- `commander`: Command-line interface framework
- `chalk`: Terminal string styling
- `figlet`: ASCII art text
- `dotenv`: Environment variable loading
- `inquirer`: Interactive command line prompts
- `ora`: Terminal spinners

## Error Handling

The CLI includes comprehensive error handling:

- Global uncaught exception handlers
- Module loading error handling
- Admin access verification
- Verbose error reporting with stack traces
