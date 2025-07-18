# Environment Configuration Guide

This document provides guidance on setting up environment variables for the SAR Meta World application.

## Overview

The SAR Meta World application consists of multiple packages, each with their own environment configuration:

1. **Backend** (`packages/backend/`) - Node.js/Express API server
2. **Frontend** (`packages/frontend/`) - React/Vite application
3. **CLI Agent** (`packages/cli-agent/`) - Command-line interface tool
4. **React App** (`packages/react-app/`) - Additional React application
5. **Docker** (`docker/`) - Container orchestration

## Quick Setup

1. Copy the `.env.example` files to `.env` in each package directory:
   ```bash
   cp packages/backend/.env.example packages/backend/.env
   cp packages/frontend/.env.example packages/frontend/.env
   cp packages/cli-agent/.env.example packages/cli-agent/.env
   cp packages/react-app/.env.example packages/react-app/.env
   cp docker/.env.example docker/.env
   ```

2. Update the environment variables in each `.env` file according to your setup.

## Package-Specific Configuration

### Backend (`packages/backend/.env`)

**Critical Variables to Update:**
- `POSTGRES_PASSWORD` - Use a secure password (minimum 12 characters)
- `JWT_SECRET` - Use a strong secret key for JWT token signing
- `INFLUXDB_TOKEN` - Generate a secure token for InfluxDB access
- `CORS_ORIGIN` - Set to your frontend URL

**Production Changes:**
```env
NODE_ENV=production
LOG_LEVEL=error
POSTGRES_PASSWORD=your_secure_production_password
JWT_SECRET=your_production_jwt_secret_32_chars_min
```

### Frontend (`packages/frontend/.env`)

**Critical Variables to Update:**
- `VITE_API_URL` - Backend API URL (production: https://api.yourdomain.com)
- `VITE_SOCKET_URL` - WebSocket URL (production: wss://api.yourdomain.com)

**Production Changes:**
```env
VITE_API_URL=https://api.yourdomain.com
VITE_SOCKET_URL=wss://api.yourdomain.com
VITE_LOG_LEVEL=error
VITE_ENABLE_DEVTOOLS=false
VITE_SHOW_DEBUG_INFO=false
```

### CLI Agent (`packages/cli-agent/.env`)

**Critical Variables to Update:**
- `POSTGRES_PASSWORD` - Must match backend password
- `DOCKER_REGISTRY` - Your Docker registry URL
- `SSH_*` - SSH configuration for remote deployments

### Docker (`docker/.env`)

**Critical Variables to Update:**
- `POSTGRES_PASSWORD` - Use a secure password
- `GRAFANA_PASSWORD` - Use a secure password
- `INFLUXDB_PASSWORD` - Use a secure password
- `INFLUXDB_ADMIN_TOKEN` - Must match backend token
- `REDIS_COMMANDER_PASSWORD` - Use a secure password

**Production Changes:**
```env
SSL_ENABLED=true
SSL_CERT_PATH=/certs/fullchain.pem
SSL_KEY_PATH=/certs/privkey.pem
BACKUP_ENABLED=true
```

## Security Considerations

### Password Requirements
- Minimum 12 characters
- Include uppercase, lowercase, numbers, and special characters
- Avoid dictionary words
- Use different passwords for each service

### Token Generation
Generate secure tokens using:
```bash
# JWT Secret (32+ characters)
openssl rand -hex 32

# InfluxDB Token
openssl rand -hex 16
```

### Environment-Specific Settings

#### Development
- Use `localhost` for all service URLs
- Enable debug logging
- Use default ports
- Disable SSL

#### Production
- Use proper domain names
- Enable SSL/TLS
- Use secure passwords
- Enable backups
- Set up monitoring alerts

## Service URLs and Ports

| Service | Development | Production |
|---------|-------------|------------|
| Backend API | http://localhost:3001 | https://api.yourdomain.com |
| Frontend | http://localhost:5173 | https://yourdomain.com |
| Grafana | http://localhost:3000 | https://grafana.yourdomain.com |
| PostgreSQL | localhost:5432 | Internal network |
| Redis | localhost:6379 | Internal network |
| InfluxDB | localhost:8086 | Internal network |

## Validation

After setting up your environment files, validate the configuration:

```bash
# Check if all required variables are set
./packages/cli-agent/bin/cli.js validate-env

# Test database connections
./packages/cli-agent/bin/cli.js test-connections

# Verify service health
./packages/cli-agent/bin/cli.js health-check
```

## Common Issues

1. **Database Connection Failed**
   - Check `POSTGRES_*` variables match across all files
   - Ensure PostgreSQL is running
   - Verify network connectivity

2. **CORS Errors**
   - Update `CORS_ORIGIN` in backend `.env`
   - Ensure frontend URL matches exactly

3. **WebSocket Connection Failed**
   - Check `VITE_SOCKET_URL` in frontend `.env`
   - Verify WebSocket endpoint is accessible

## Backup and Security

- Never commit `.env` files to version control
- Keep backups of production `.env` files securely
- Rotate passwords and tokens regularly
- Use environment variable management tools in production

## Additional Resources

- [Node.js Environment Variables Best Practices](https://nodejs.org/en/knowledge/getting-started/working-with-environment-variables/)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Docker Environment Variables](https://docs.docker.com/compose/environment-variables/)
