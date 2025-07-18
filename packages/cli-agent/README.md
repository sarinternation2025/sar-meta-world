# SAR CLI Agent

A comprehensive command-line interface for managing SAR Meta World projects, deployments, monitoring, and development workflows.

## Installation

### From workspace root:
```bash
# Install all dependencies
npm install

# Run the CLI
npm run cli

# Or run directly
npm run start:cli
```

### Development mode:
```bash
# Run in development mode with auto-reload
npm run dev:cli
```

## Usage

The SAR CLI provides various command modules for different aspects of project management:

### Available Commands

- **project** - Project management commands (Admin access required)
- **deploy** - Deployment management commands
- **monitor** - System monitoring commands
- **server** - Server management commands
- **db** - Database management commands
- **docker** - Docker container management commands
- **git** - Git version control commands
- **test** - Testing and quality assurance commands
- **backup** - Backup and restore commands
- **config** - Configuration management commands
- **security** - Security and audit commands
- **optimize** - Performance optimization commands
- **template** - Template and scaffolding commands
- **plugin** - Plugin management commands

### Basic Usage

```bash
# Show help
sar-cli --help

# Run a specific command
sar-cli deploy --help
sar-cli monitor status
sar-cli project create myproject

# Global options
sar-cli --verbose deploy
sar-cli --quiet test
sar-cli --config ./custom-config.json monitor
```

## Command Modules

Each command module is a separate package with its own dependencies:

### Project Commands (@sar-cli/project)
- Create new projects
- Configure project settings
- Manage project templates
- **Admin access required**

### Deploy Commands (@sar-cli/deploy)
- Deploy to various environments
- Manage deployment configurations
- Docker and cloud deployment support
- CI/CD integration

### Monitor Commands (@sar-cli/monitor)
- System health monitoring
- Performance metrics
- Real-time monitoring
- Alert management

### Docker Commands (@sar-cli/docker)
- Container management
- Image building
- Docker Compose orchestration
- Registry operations

### Database Commands (@sar-cli/db)
- Database management
- Migrations
- Backup and restore
- Multi-database support (MySQL, PostgreSQL, MongoDB, SQLite)

### Git Commands (@sar-cli/git)
- Version control operations
- Branch management
- Workflow automation
- Git hooks

### Test Commands (@sar-cli/test)
- Test execution
- Quality assurance
- Test reporting
- Multiple test framework support

### Security Commands (@sar-cli/security)
- Security scanning
- Vulnerability assessment
- Compliance checks
- Audit reports

### And more...

## Configuration

The CLI uses a configuration file structure for managing settings:

```json
{
  "environment": "development",
  "api": {
    "baseUrl": "https://api.sar-meta-world.com",
    "timeout": 30000
  },
  "deployment": {
    "defaultTarget": "staging",
    "autoBackup": true
  },
  "monitoring": {
    "enabled": true,
    "interval": 5000
  }
}
```

## Environment Variables

- `SARU_ADMIN` - Set to 'true' for admin access to project commands
- `SAR_CONFIG_PATH` - Custom configuration file path
- `SAR_LOG_LEVEL` - Log level (debug, info, warn, error)
- `SAR_DISABLE_COLORS` - Disable colored output

## Development

### Project Structure

```
packages/cli-agent/
├── bin/
│   └── cli.js          # Main CLI entry point
├── src/
│   ├── index.js        # Main application class
│   ├── utils/
│   │   └── init.js     # Initialization utilities
│   └── commands/       # Command modules
│       ├── project/
│       ├── deploy/
│       ├── monitor/
│       ├── docker/
│       ├── db/
│       ├── git/
│       ├── test/
│       ├── backup/
│       ├── config/
│       ├── security/
│       ├── optimize/
│       ├── template/
│       └── plugin/
└── package.json
```

### Adding New Commands

1. Create a new directory in `src/commands/`
2. Add `index.js` with command implementation
3. Add `package.json` with dependencies
4. Update the main CLI to include the new command

### Testing

```bash
# Run tests
npm test

# Run tests for specific command module
cd src/commands/deploy && npm test
```

## License

MIT License - see LICENSE file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## Support

For issues and questions, please use the GitHub issue tracker or contact the SAR International team.
