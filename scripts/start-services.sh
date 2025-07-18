#!/bin/bash

# Startup script for SAR-META-WORLD services
# This script provides easy startup options for different deployment methods

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Project root directory
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Logging function
log() {
    local level=$1
    local message=$2
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "${timestamp} [${level}] ${message}"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Start services with Docker Compose
start_docker_compose() {
    log "${BLUE}INFO${NC}" "Starting services with Docker Compose..."
    
    cd "$PROJECT_ROOT/docker"
    
    if [ ! -f "docker-compose.yml" ]; then
        log "${RED}ERROR${NC}" "docker-compose.yml not found in docker directory"
        exit 1
    fi
    
    # Pull latest images
    log "${YELLOW}INFO${NC}" "Pulling latest images..."
    docker-compose pull
    
    # Start services
    log "${YELLOW}INFO${NC}" "Starting all services..."
    docker-compose up -d
    
    # Wait for services to be ready
    log "${YELLOW}INFO${NC}" "Waiting for services to be ready..."
    sleep 30
    
    # Check service status
    log "${YELLOW}INFO${NC}" "Checking service status..."
    docker-compose ps
    
    # Test backend health
    if curl -f -s http://localhost:3001/health >/dev/null 2>&1; then
        log "${GREEN}SUCCESS${NC}" "Backend service is healthy"
    else
        log "${YELLOW}WARNING${NC}" "Backend service health check failed"
    fi
    
    # Display service URLs
    echo ""
    echo "🚀 Services started successfully!"
    echo "📊 Grafana Dashboard: http://localhost:3000 (admin/admin123)"
    echo "🔧 Backend API: http://localhost:3001"
    echo "🌐 Frontend: http://localhost:80"
    echo "🗄️ Database Admin: http://localhost:8080"
    echo "🔴 Redis Commander: http://localhost:8081"
    echo "📈 Prometheus: http://localhost:9090"
    echo ""
}

# Start services with systemd
start_systemd() {
    log "${BLUE}INFO${NC}" "Starting services with systemd..."
    
    # Check if running as root
    if [ "$EUID" -ne 0 ]; then
        log "${RED}ERROR${NC}" "Systemd management requires root privileges"
        exit 1
    fi
    
    # Start backend service
    if systemctl is-enabled backend-api >/dev/null 2>&1; then
        log "${YELLOW}INFO${NC}" "Starting backend-api service..."
        systemctl start backend-api
        
        # Check status
        if systemctl is-active --quiet backend-api; then
            log "${GREEN}SUCCESS${NC}" "Backend service started successfully"
        else
            log "${RED}ERROR${NC}" "Failed to start backend service"
            systemctl status backend-api
            exit 1
        fi
    else
        log "${YELLOW}WARNING${NC}" "Backend service not installed. Run deploy-systemd.sh first."
    fi
    
    # Start other services (if available)
    for service in postgresql redis-server nginx; do
        if systemctl is-enabled "$service" >/dev/null 2>&1; then
            log "${YELLOW}INFO${NC}" "Starting $service..."
            systemctl start "$service"
        fi
    done
    
    echo ""
    echo "🚀 System services started!"
    echo "🔧 Backend API: http://localhost:3001"
    echo ""
}

# Start services with PM2
start_pm2() {
    log "${BLUE}INFO${NC}" "Starting services with PM2..."
    
    if ! command_exists pm2; then
        log "${RED}ERROR${NC}" "PM2 is not installed. Install it with: npm install -g pm2"
        exit 1
    fi
    
    # Start backend
    cd "$PROJECT_ROOT/packages/backend"
    
    if [ ! -f "ecosystem.config.js" ]; then
        log "${RED}ERROR${NC}" "ecosystem.config.js not found in backend directory"
        exit 1
    fi
    
    log "${YELLOW}INFO${NC}" "Starting backend with PM2..."
    pm2 start ecosystem.config.js
    
    # Show PM2 status
    pm2 status
    
    echo ""
    echo "🚀 PM2 services started!"
    echo "🔧 Backend API: http://localhost:3001"
    echo "📊 PM2 Monitor: pm2 monit"
    echo ""
}

# Stop all services
stop_services() {
    log "${BLUE}INFO${NC}" "Stopping all services..."
    
    # Stop Docker Compose services
    if [ -f "$PROJECT_ROOT/docker/docker-compose.yml" ]; then
        log "${YELLOW}INFO${NC}" "Stopping Docker Compose services..."
        cd "$PROJECT_ROOT/docker"
        docker-compose down
    fi
    
    # Stop systemd services
    if command_exists systemctl && [ "$EUID" -eq 0 ]; then
        log "${YELLOW}INFO${NC}" "Stopping systemd services..."
        systemctl stop backend-api || true
    fi
    
    # Stop PM2 services
    if command_exists pm2; then
        log "${YELLOW}INFO${NC}" "Stopping PM2 services..."
        pm2 stop all || true
    fi
    
    log "${GREEN}SUCCESS${NC}" "All services stopped"
}

# Check service status
check_status() {
    log "${BLUE}INFO${NC}" "Checking service status..."
    
    echo ""
    echo "=== Docker Compose Services ==="
    if [ -f "$PROJECT_ROOT/docker/docker-compose.yml" ]; then
        cd "$PROJECT_ROOT/docker"
        docker-compose ps
    else
        echo "No docker-compose.yml found"
    fi
    
    echo ""
    echo "=== Systemd Services ==="
    if command_exists systemctl; then
        systemctl status backend-api --no-pager || echo "Backend service not found"
    else
        echo "Systemd not available"
    fi
    
    echo ""
    echo "=== PM2 Services ==="
    if command_exists pm2; then
        pm2 status
    else
        echo "PM2 not available"
    fi
    
    echo ""
    echo "=== Health Checks ==="
    
    # Check backend health
    if curl -f -s http://localhost:3001/health >/dev/null 2>&1; then
        echo "✅ Backend API: Healthy"
    else
        echo "❌ Backend API: Not responding"
    fi
    
    # Check other services
    for service in "Frontend:80" "Grafana:3000" "Prometheus:9090"; do
        name=$(echo "$service" | cut -d: -f1)
        port=$(echo "$service" | cut -d: -f2)
        
        if nc -z localhost "$port" 2>/dev/null; then
            echo "✅ $name: Running"
        else
            echo "❌ $name: Not responding"
        fi
    done
}

# Usage information
usage() {
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  docker     Start services with Docker Compose (default)"
    echo "  systemd    Start services with systemd (requires root)"
    echo "  pm2        Start services with PM2"
    echo "  stop       Stop all services"
    echo "  status     Check service status"
    echo "  help       Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                  # Start with Docker Compose"
    echo "  $0 docker           # Start with Docker Compose"
    echo "  $0 systemd          # Start with systemd"
    echo "  $0 pm2              # Start with PM2"
    echo "  $0 stop             # Stop all services"
    echo "  $0 status           # Check service status"
}

# Main function
main() {
    local command=${1:-docker}
    
    case $command in
        docker)
            start_docker_compose
            ;;
        systemd)
            start_systemd
            ;;
        pm2)
            start_pm2
            ;;
        stop)
            stop_services
            ;;
        status)
            check_status
            ;;
        help|--help|-h)
            usage
            ;;
        *)
            echo "Unknown command: $command"
            usage
            exit 1
            ;;
    esac
}

# Run main function
main "$@"
