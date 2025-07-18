#!/bin/bash

# Process monitoring and auto-restart script
# This script monitors processes and automatically restarts them if they fail

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_FILE="/var/log/process-monitor.log"
BACKEND_HEALTH_URL="http://localhost:3001/health"
RETRY_ATTEMPTS=3
RETRY_DELAY=5
MONITOR_INTERVAL=30

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    local level=$1
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "${timestamp} [${level}] ${message}" | tee -a "$LOG_FILE"
}

# Check if service is running via systemd
check_systemd_service() {
    local service_name=$1
    if systemctl is-active --quiet "$service_name"; then
        return 0
    else
        return 1
    fi
}

# Check if Docker container is running
check_docker_container() {
    local container_name=$1
    if docker inspect "$container_name" &>/dev/null && [ "$(docker inspect -f '{{.State.Status}}' "$container_name")" == "running" ]; then
        return 0
    else
        return 1
    fi
}

# Check HTTP endpoint health
check_http_health() {
    local url=$1
    local attempts=0
    
    while [ $attempts -lt $RETRY_ATTEMPTS ]; do
        if curl -f -s --max-time 10 "$url" >/dev/null 2>&1; then
            return 0
        fi
        attempts=$((attempts + 1))
        sleep $RETRY_DELAY
    done
    
    return 1
}

# Restart systemd service
restart_systemd_service() {
    local service_name=$1
    log "INFO" "Restarting systemd service: $service_name"
    
    if systemctl restart "$service_name"; then
        log "INFO" "Successfully restarted $service_name"
        return 0
    else
        log "ERROR" "Failed to restart $service_name"
        return 1
    fi
}

# Restart Docker container
restart_docker_container() {
    local container_name=$1
    log "INFO" "Restarting Docker container: $container_name"
    
    if docker restart "$container_name"; then
        log "INFO" "Successfully restarted container $container_name"
        return 0
    else
        log "ERROR" "Failed to restart container $container_name"
        return 1
    fi
}

# Restart Docker Compose service
restart_docker_compose_service() {
    local service_name=$1
    local compose_file=$2
    log "INFO" "Restarting Docker Compose service: $service_name"
    
    if docker-compose -f "$compose_file" restart "$service_name"; then
        log "INFO" "Successfully restarted Docker Compose service $service_name"
        return 0
    else
        log "ERROR" "Failed to restart Docker Compose service $service_name"
        return 1
    fi
}

# Monitor backend service (Node.js with PM2)
monitor_backend() {
    log "INFO" "Checking backend service health..."
    
    # Check if running via Docker
    if check_docker_container "backend-api"; then
        log "INFO" "Backend container is running, checking health endpoint..."
        if check_http_health "$BACKEND_HEALTH_URL"; then
            log "INFO" "Backend health check passed"
            return 0
        else
            log "WARNING" "Backend health check failed, restarting container..."
            restart_docker_container "backend-api"
            return $?
        fi
    
    # Check if running via systemd
    elif check_systemd_service "backend-api"; then
        log "INFO" "Backend systemd service is running, checking health endpoint..."
        if check_http_health "$BACKEND_HEALTH_URL"; then
            log "INFO" "Backend health check passed"
            return 0
        else
            log "WARNING" "Backend health check failed, restarting service..."
            restart_systemd_service "backend-api"
            return $?
        fi
    
    # Check if running via PM2
    elif pm2 describe backend-api &>/dev/null; then
        log "INFO" "Backend PM2 process found, checking health endpoint..."
        if check_http_health "$BACKEND_HEALTH_URL"; then
            log "INFO" "Backend health check passed"
            return 0
        else
            log "WARNING" "Backend health check failed, restarting PM2 process..."
            pm2 restart backend-api
            return $?
        fi
    
    else
        log "ERROR" "Backend service not found (not running via Docker, systemd, or PM2)"
        return 1
    fi
}

# Monitor Docker Compose services
monitor_docker_compose() {
    local compose_file="${1:-docker/docker-compose.yml}"
    
    if [ ! -f "$compose_file" ]; then
        log "ERROR" "Docker Compose file not found: $compose_file"
        return 1
    fi
    
    log "INFO" "Checking Docker Compose services..."
    
    # Get list of services that should be running
    local services=$(docker-compose -f "$compose_file" config --services)
    
    for service in $services; do
        local container_name=$(docker-compose -f "$compose_file" ps -q "$service")
        
        if [ -z "$container_name" ]; then
            log "WARNING" "Service $service is not running, starting..."
            docker-compose -f "$compose_file" up -d "$service"
        else
            local status=$(docker inspect -f '{{.State.Status}}' "$container_name" 2>/dev/null || echo "not found")
            
            if [ "$status" != "running" ]; then
                log "WARNING" "Service $service is not healthy (status: $status), restarting..."
                restart_docker_compose_service "$service" "$compose_file"
            else
                log "INFO" "Service $service is running normally"
            fi
        fi
    done
}

# Monitor system resources
monitor_system_resources() {
    log "INFO" "Checking system resources..."
    
    # Check CPU usage
    local cpu_usage=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)
    if [ "${cpu_usage%.*}" -gt 90 ]; then
        log "WARNING" "High CPU usage detected: ${cpu_usage}%"
    fi
    
    # Check memory usage
    local mem_usage=$(free | grep Mem | awk '{printf "%.1f", $3/$2 * 100.0}')
    if [ "${mem_usage%.*}" -gt 90 ]; then
        log "WARNING" "High memory usage detected: ${mem_usage}%"
    fi
    
    # Check disk usage
    local disk_usage=$(df -h / | awk 'NR==2 {print $5}' | cut -d'%' -f1)
    if [ "$disk_usage" -gt 90 ]; then
        log "WARNING" "High disk usage detected: ${disk_usage}%"
    fi
}

# Cleanup old log files
cleanup_logs() {
    log "INFO" "Cleaning up old log files..."
    
    # Keep only last 7 days of logs
    find /var/log -name "*.log" -type f -mtime +7 -delete 2>/dev/null || true
    
    # Rotate current log if it's too large (>100MB)
    if [ -f "$LOG_FILE" ] && [ $(stat -f%z "$LOG_FILE" 2>/dev/null || stat -c%s "$LOG_FILE" 2>/dev/null || echo 0) -gt 104857600 ]; then
        mv "$LOG_FILE" "${LOG_FILE}.$(date +%Y%m%d_%H%M%S)"
        touch "$LOG_FILE"
    fi
}

# Main monitoring function
main() {
    log "INFO" "Starting process monitoring..."
    
    # Check if running as root for systemd operations
    if [ "$EUID" -ne 0 ] && command -v systemctl &>/dev/null; then
        log "WARNING" "Not running as root, systemd service management may not work"
    fi
    
    while true; do
        log "INFO" "Running monitoring cycle..."
        
        # Monitor backend service
        monitor_backend
        
        # Monitor Docker Compose services if compose file exists
        if [ -f "docker/docker-compose.yml" ]; then
            monitor_docker_compose "docker/docker-compose.yml"
        fi
        
        # Monitor system resources
        monitor_system_resources
        
        # Cleanup logs periodically
        cleanup_logs
        
        log "INFO" "Monitoring cycle completed, sleeping for $MONITOR_INTERVAL seconds..."
        sleep $MONITOR_INTERVAL
    done
}

# Handle signals
trap 'log "INFO" "Received signal, shutting down monitoring..."; exit 0' SIGTERM SIGINT

# Usage information
usage() {
    echo "Usage: $0 [OPTIONS]"
    echo "Options:"
    echo "  -h, --help           Show this help message"
    echo "  -i, --interval SEC   Set monitoring interval (default: 30)"
    echo "  -l, --log-file FILE  Set log file path (default: /var/log/process-monitor.log)"
    echo "  --once               Run monitoring once and exit"
    echo ""
    echo "Examples:"
    echo "  $0                   # Start continuous monitoring"
    echo "  $0 --once            # Run monitoring once"
    echo "  $0 -i 60             # Monitor every 60 seconds"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            usage
            exit 0
            ;;
        -i|--interval)
            MONITOR_INTERVAL="$2"
            shift 2
            ;;
        -l|--log-file)
            LOG_FILE="$2"
            shift 2
            ;;
        --once)
            MONITOR_INTERVAL=0
            shift
            ;;
        *)
            echo "Unknown option: $1"
            usage
            exit 1
            ;;
    esac
done

# Create log directory if it doesn't exist
mkdir -p "$(dirname "$LOG_FILE")"

# Start monitoring
if [ "$MONITOR_INTERVAL" -eq 0 ]; then
    log "INFO" "Running one-time monitoring check..."
    monitor_backend
    [ -f "docker/docker-compose.yml" ] && monitor_docker_compose "docker/docker-compose.yml"
    monitor_system_resources
    cleanup_logs
    log "INFO" "One-time monitoring completed"
else
    main
fi
