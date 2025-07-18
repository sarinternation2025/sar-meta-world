# Process Management and Auto-Restart Setup

This document describes the process management and automatic restart mechanisms set up for the SAR-META-WORLD backend services.

## Overview

The system provides multiple layers of process management and automatic restart capabilities:

1. **Docker-based deployment** with PM2 inside containers
2. **Systemd service management** for non-Docker deployments
3. **Process monitoring script** for automated health checks and restarts
4. **Docker Compose restart policies** for container-level resilience

## ✅ Current Setup Status

### Docker Configuration
- ✅ All services in `docker-compose.yml` have `restart: unless-stopped` policy
- ✅ Backend service added with proper health checks
- ✅ Health check endpoint `/health` added to backend
- ✅ PM2 process manager integrated into Docker container

### Backend Service Configuration
- ✅ PM2 ecosystem configuration with clustering
- ✅ Dockerfile updated to use PM2 with non-root user
- ✅ Systemd service file for non-Docker deployments
- ✅ Health check endpoint implemented

### Monitoring and Automation
- ✅ Process monitoring script with automatic restart capabilities
- ✅ Deployment script for systemd setup
- ✅ Comprehensive logging and error handling

## 🚀 Deployment Options

### Option 1: Docker Compose (Recommended)

```bash
# Start all services with automatic restart policies
cd docker
docker-compose up -d

# Check service status
docker-compose ps

# View logs
docker-compose logs -f backend

# Restart specific service
docker-compose restart backend
```

### Option 2: Systemd (Production Server)

```bash
# Deploy backend service with systemd
cd packages/backend
sudo ./deploy-systemd.sh

# Service management commands
sudo systemctl start backend-api
sudo systemctl stop backend-api
sudo systemctl restart backend-api
sudo systemctl status backend-api

# View logs
sudo journalctl -u backend-api -f
```

### Option 3: Direct PM2 (Development)

```bash
# Install PM2 globally
npm install -g pm2

# Start backend with PM2
cd packages/backend
pm2 start ecosystem.config.js

# PM2 management commands
pm2 status
pm2 restart backend-api
pm2 logs backend-api
pm2 monit
```

## 🔧 Configuration Files

### Docker Compose Configuration
- **File**: `docker/docker-compose.yml`
- **Features**: 
  - Restart policies: `unless-stopped`
  - Health checks for all services
  - Dependency management
  - Resource limits

### PM2 Configuration
- **File**: `packages/backend/ecosystem.config.js`
- **Features**:
  - Cluster mode with auto-scaling
  - Memory-based restarts
  - Log rotation
  - Graceful shutdowns
  - Error handling

### Systemd Service
- **File**: `packages/backend/backend-api.service`
- **Features**:
  - Automatic restarts
  - Security hardening
  - Resource limits
  - Dependency management

## 📊 Monitoring and Health Checks

### Health Check Endpoints
- `GET /health` - Simple health check for Docker/systemd
- `GET /api/monitoring/health` - Detailed health information
- `GET /api/monitoring/metrics` - System metrics
- `GET /api/monitoring/services` - Service status

### Process Monitoring Script
- **File**: `scripts/process-monitor.sh`
- **Features**:
  - Automatic service restart on failure
  - HTTP health check validation
  - Resource monitoring
  - Log management
  - Support for Docker, systemd, and PM2

```bash
# Run monitoring script
./scripts/process-monitor.sh

# Run once for testing
./scripts/process-monitor.sh --once

# Custom monitoring interval
./scripts/process-monitor.sh --interval 60
```

## 🛠 Restart Policies and Strategies

### Docker Restart Policies
- `unless-stopped`: Restart container unless explicitly stopped
- `on-failure`: Restart only if container exits with non-zero status
- `always`: Always restart container
- `no`: Never restart container

### PM2 Restart Strategies
- **max_restarts**: Maximum number of restarts (10)
- **min_uptime**: Minimum uptime before considering stable (10s)
- **max_memory_restart**: Restart if memory usage exceeds limit (1G)
- **exponential_backoff_restart_delay**: Exponential backoff for restarts

### Systemd Restart Configuration
- **Restart**: `always` - Always restart service
- **RestartSec**: `10s` - Wait 10 seconds before restart
- **TimeoutStartSec**: `60s` - Maximum time to wait for startup
- **TimeoutStopSec**: `30s` - Maximum time to wait for graceful shutdown

## 🔒 Security and Best Practices

### Docker Security
- Non-root user (`nodejs:nodejs`)
- Resource limits (memory, CPU)
- Health checks with proper timeouts
- Volume mounting for logs

### Systemd Security
- Restricted privileges
- Private temporary directories
- Protected file systems
- System call filtering
- Address family restrictions

### PM2 Security
- Cluster mode for load distribution
- Graceful shutdowns
- Memory leak protection
- Log rotation

## 📋 Maintenance Tasks

### Daily Operations
- Check service status
- Monitor resource usage
- Review logs for errors
- Verify health checks

### Weekly Maintenance
- Rotate logs
- Update dependencies
- Review system metrics
- Test restart procedures

### Monthly Tasks
- Update base images
- Review security settings
- Optimize resource limits
- Backup configurations

## 🚨 Troubleshooting

### Common Issues

#### Service Won't Start
```bash
# Check logs
docker-compose logs backend
sudo journalctl -u backend-api -f
pm2 logs backend-api

# Check port conflicts
sudo netstat -tulpn | grep :3001
```

#### High Memory Usage
```bash
# Check PM2 memory usage
pm2 monit

# Restart service
pm2 restart backend-api
```

#### Database Connection Issues
```bash
# Check database container
docker-compose logs postgres

# Test connectivity
curl -f http://localhost:3001/health
```

### Service Recovery
1. **Automatic**: Services will restart automatically based on policies
2. **Manual**: Use appropriate restart commands for your deployment method
3. **Monitoring**: Process monitoring script will detect and restart failed services

## 📚 Additional Resources

### Commands Reference
```bash
# Docker Compose
docker-compose up -d
docker-compose restart [service]
docker-compose logs -f [service]

# Systemd
sudo systemctl start/stop/restart backend-api
sudo systemctl status backend-api
sudo journalctl -u backend-api -f

# PM2
pm2 start/stop/restart backend-api
pm2 status
pm2 logs backend-api
pm2 monit
```

### Configuration Files
- `docker/docker-compose.yml` - Docker services configuration
- `packages/backend/ecosystem.config.js` - PM2 process configuration
- `packages/backend/backend-api.service` - Systemd service definition
- `scripts/process-monitor.sh` - Process monitoring script

### Monitoring URLs
- Health Check: http://localhost:3001/health
- System Metrics: http://localhost:3001/api/monitoring/metrics
- Service Status: http://localhost:3001/api/monitoring/services
- Grafana Dashboard: http://localhost:3000 (admin/admin123)

## 📝 Next Steps

1. **Test the setup**:
   ```bash
   cd docker
   docker-compose up -d
   curl http://localhost:3001/health
   ```

2. **Enable monitoring**:
   ```bash
   ./scripts/process-monitor.sh --once
   ```

3. **Configure alerts** (optional):
   - Set up email notifications
   - Integrate with monitoring tools
   - Configure Slack/Discord webhooks

4. **Regular maintenance**:
   - Schedule log rotation
   - Set up backup procedures
   - Document recovery processes
