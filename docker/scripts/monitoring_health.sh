#!/bin/bash

# Monitoring and Health Check Script for Meta-World
# This script monitors system health, backup status, and log rotation

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DOCKER_DIR="$(dirname "$SCRIPT_DIR")"
PROJECT_ROOT="$(dirname "$DOCKER_DIR")"
LOG_FILE="$DOCKER_DIR/logs/monitoring.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Health check thresholds
DISK_THRESHOLD=85
MEMORY_THRESHOLD=80
CPU_THRESHOLD=80
LOG_SIZE_THRESHOLD=1000000 # 1MB

# Notification settings
WEBHOOK_URL="${WEBHOOK_URL:-}"
SLACK_WEBHOOK="${SLACK_WEBHOOK:-}"
EMAIL_RECIPIENT="${EMAIL_RECIPIENT:-}"

# Functions
log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

warn() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1" | tee -a "$LOG_FILE"
}

info() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')] INFO:${NC} $1" | tee -a "$LOG_FILE"
}

# Function to send notifications
send_notification() {
    local message="$1"
    local severity="$2"
    
    # Send to webhook if configured
    if [[ -n "$WEBHOOK_URL" ]]; then
        curl -s -X POST -H "Content-Type: application/json" \
            -d "{\"text\":\"[$severity] Meta-World: $message\",\"timestamp\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"}" \
            "$WEBHOOK_URL" >/dev/null 2>&1 || true
    fi
    
    # Send to Slack if configured
    if [[ -n "$SLACK_WEBHOOK" ]]; then
        curl -s -X POST -H "Content-Type: application/json" \
            -d "{\"text\":\"[$severity] Meta-World: $message\"}" \
            "$SLACK_WEBHOOK" >/dev/null 2>&1 || true
    fi
    
    # Send email if configured
    if [[ -n "$EMAIL_RECIPIENT" ]] && command -v mail >/dev/null 2>&1; then
        echo "$message" | mail -s "[$severity] Meta-World Alert" "$EMAIL_RECIPIENT" >/dev/null 2>&1 || true
    fi
}

# Function to check disk usage
check_disk_usage() {
    info "Checking disk usage..."
    
    local disk_usage=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
    
    if [[ $disk_usage -gt $DISK_THRESHOLD ]]; then
        local message="Disk usage is at ${disk_usage}% (threshold: ${DISK_THRESHOLD}%)"
        error "$message"
        send_notification "$message" "CRITICAL"
        return 1
    else
        log "Disk usage is healthy: ${disk_usage}%"
        return 0
    fi
}

# Function to check memory usage
check_memory_usage() {
    info "Checking memory usage..."
    
    local memory_usage=$(free | awk 'NR==2{printf "%.0f", $3*100/($3+$7) }')
    
    if [[ $memory_usage -gt $MEMORY_THRESHOLD ]]; then
        local message="Memory usage is at ${memory_usage}% (threshold: ${MEMORY_THRESHOLD}%)"
        warn "$message"
        send_notification "$message" "WARNING"
        return 1
    else
        log "Memory usage is healthy: ${memory_usage}%"
        return 0
    fi
}

# Function to check CPU usage
check_cpu_usage() {
    info "Checking CPU usage..."
    
    local cpu_usage=$(top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk '{print 100 - $1}')
    
    if (( $(echo "$cpu_usage > $CPU_THRESHOLD" | bc -l) )); then
        local message="CPU usage is at ${cpu_usage}% (threshold: ${CPU_THRESHOLD}%)"
        warn "$message"
        send_notification "$message" "WARNING"
        return 1
    else
        log "CPU usage is healthy: ${cpu_usage}%"
        return 0
    fi
}

# Function to check Docker containers
check_docker_containers() {
    info "Checking Docker containers..."
    
    if ! command -v docker >/dev/null 2>&1; then
        error "Docker is not installed"
        return 1
    fi
    
    local containers_down=0
    local expected_containers=(
        "postgres"
        "redis"
        "influxdb"
        "grafana"
        "prometheus"
        "mosquitto"
        "nginx"
        "backend"
        "frontend"
    )
    
    for container in "${expected_containers[@]}"; do
        if ! docker ps --format "table {{.Names}}" | grep -q "$container"; then
            warn "Container $container is not running"
            containers_down=$((containers_down + 1))
        else
            log "Container $container is running"
        fi
    done
    
    if [[ $containers_down -gt 0 ]]; then
        local message="$containers_down containers are down"
        error "$message"
        send_notification "$message" "CRITICAL"
        return 1
    else
        log "All expected containers are running"
        return 0
    fi
}

# Function to check backup status
check_backup_status() {
    info "Checking backup status..."
    
    local backup_dir="$DOCKER_DIR/backups"
    local latest_backup=$(find "$backup_dir" -name "backup_*" -type f -printf '%T@ %p\n' 2>/dev/null | sort -n | tail -1 | cut -d' ' -f2-)
    
    if [[ -z "$latest_backup" ]]; then
        local message="No backups found in $backup_dir"
        error "$message"
        send_notification "$message" "CRITICAL"
        return 1
    fi
    
    local backup_age=$(( $(date +%s) - $(stat -c %Y "$latest_backup") ))
    local hours_old=$(( backup_age / 3600 ))
    
    if [[ $hours_old -gt 25 ]]; then
        local message="Latest backup is $hours_old hours old (last backup: $(basename "$latest_backup"))"
        warn "$message"
        send_notification "$message" "WARNING"
        return 1
    else
        log "Latest backup is $hours_old hours old: $(basename "$latest_backup")"
        return 0
    fi
}

# Function to check log rotation status
check_log_rotation() {
    info "Checking log rotation status..."
    
    local log_dir="$DOCKER_DIR/logs"
    local large_logs=0
    
    for log_file in $(find "$log_dir" -name "*.log" -type f 2>/dev/null); do
        local size=$(stat -c%s "$log_file" 2>/dev/null || echo 0)
        
        if [[ $size -gt $LOG_SIZE_THRESHOLD ]]; then
            warn "Large log file found: $(basename "$log_file") ($(numfmt --to=iec --suffix=B "$size"))"
            large_logs=$((large_logs + 1))
        fi
    done
    
    if [[ $large_logs -gt 0 ]]; then
        local message="$large_logs log files are larger than threshold"
        warn "$message"
        send_notification "$message" "WARNING"
        return 1
    else
        log "All log files are within size limits"
        return 0
    fi
}

# Function to check service health endpoints
check_service_health() {
    info "Checking service health endpoints..."
    
    local services=(
        "backend:3000/health"
        "frontend:3001"
        "grafana:3000/api/health"
        "prometheus:9090/-/healthy"
    )
    
    local unhealthy_services=0
    
    for service in "${services[@]}"; do
        local service_name=$(echo "$service" | cut -d':' -f1)
        local endpoint="http://localhost:$(echo "$service" | cut -d':' -f2)"
        
        if curl -s -f "$endpoint" >/dev/null 2>&1; then
            log "Service $service_name is healthy"
        else
            warn "Service $service_name is not responding at $endpoint"
            unhealthy_services=$((unhealthy_services + 1))
        fi
    done
    
    if [[ $unhealthy_services -gt 0 ]]; then
        local message="$unhealthy_services services are unhealthy"
        error "$message"
        send_notification "$message" "CRITICAL"
        return 1
    else
        log "All services are healthy"
        return 0
    fi
}

# Function to check database connections
check_database_connections() {
    info "Checking database connections..."
    
    local db_issues=0
    
    # Check PostgreSQL
    if docker exec -it postgres pg_isready >/dev/null 2>&1; then
        log "PostgreSQL is accepting connections"
    else
        error "PostgreSQL is not accepting connections"
        db_issues=$((db_issues + 1))
    fi
    
    # Check Redis
    if docker exec -it redis redis-cli ping | grep -q "PONG"; then
        log "Redis is responding"
    else
        error "Redis is not responding"
        db_issues=$((db_issues + 1))
    fi
    
    # Check InfluxDB
    if docker exec -it influxdb influx ping >/dev/null 2>&1; then
        log "InfluxDB is responding"
    else
        error "InfluxDB is not responding"
        db_issues=$((db_issues + 1))
    fi
    
    if [[ $db_issues -gt 0 ]]; then
        local message="$db_issues databases are not responding"
        error "$message"
        send_notification "$message" "CRITICAL"
        return 1
    else
        log "All databases are responding"
        return 0
    fi
}

# Function to generate health report
generate_health_report() {
    info "Generating health report..."
    
    local report_file="$DOCKER_DIR/logs/health_report_$(date +%Y%m%d_%H%M%S).json"
    
    cat > "$report_file" << EOF
{
    "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
    "system": {
        "disk_usage": "$(df -h / | awk 'NR==2 {print $5}')",
        "memory_usage": "$(free | awk 'NR==2{printf "%.0f%%", $3*100/($3+$7) }')",
        "cpu_usage": "$(top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk '{print 100 - $1}')%",
        "load_average": "$(uptime | awk -F'load average:' '{print $2}')",
        "uptime": "$(uptime -p)"
    },
    "containers": {
        "running": $(docker ps -q | wc -l),
        "total": $(docker ps -a -q | wc -l)
    },
    "backups": {
        "latest": "$(find "$DOCKER_DIR/backups" -name "backup_*" -type f -printf '%T@ %p\n' 2>/dev/null | sort -n | tail -1 | cut -d' ' -f2- | xargs basename 2>/dev/null || echo 'none')",
        "count": $(find "$DOCKER_DIR/backups" -name "backup_*" -type f | wc -l)
    },
    "logs": {
        "total_size": "$(du -sh "$DOCKER_DIR/logs" 2>/dev/null | cut -f1 || echo 'unknown')",
        "file_count": $(find "$DOCKER_DIR/logs" -name "*.log" -type f | wc -l)
    }
}
EOF
    
    log "Health report generated: $report_file"
}

# Function to perform cleanup
perform_cleanup() {
    info "Performing cleanup..."
    
    # Clean up old health reports (keep last 30 days)
    find "$DOCKER_DIR/logs" -name "health_report_*.json" -type f -mtime +30 -delete 2>/dev/null || true
    
    # Clean up old monitoring logs (keep last 7 days)
    find "$DOCKER_DIR/logs" -name "monitoring.log.*" -type f -mtime +7 -delete 2>/dev/null || true
    
    # Clean up Docker system if needed
    if [[ $(df / | awk 'NR==2 {print $5}' | sed 's/%//') -gt 80 ]]; then
        info "Performing Docker cleanup due to high disk usage"
        docker system prune -f >/dev/null 2>&1 || true
    fi
    
    log "Cleanup completed"
}

# Main health check function
run_health_check() {
    local exit_code=0
    
    log "=== Starting Health Check ==="
    
    # System checks
    check_disk_usage || exit_code=1
    check_memory_usage || exit_code=1
    check_cpu_usage || exit_code=1
    
    # Docker and service checks
    check_docker_containers || exit_code=1
    check_service_health || exit_code=1
    check_database_connections || exit_code=1
    
    # Backup and log checks
    check_backup_status || exit_code=1
    check_log_rotation || exit_code=1
    
    # Generate report
    generate_health_report
    
    # Perform cleanup
    perform_cleanup
    
    if [[ $exit_code -eq 0 ]]; then
        log "=== Health Check Completed Successfully ==="
    else
        error "=== Health Check Completed with Issues ==="
    fi
    
    return $exit_code
}

# Command line options
case "${1:-}" in
    --disk)
        check_disk_usage
        ;;
    --memory)
        check_memory_usage
        ;;
    --cpu)
        check_cpu_usage
        ;;
    --containers)
        check_docker_containers
        ;;
    --services)
        check_service_health
        ;;
    --databases)
        check_database_connections
        ;;
    --backups)
        check_backup_status
        ;;
    --logs)
        check_log_rotation
        ;;
    --report)
        generate_health_report
        ;;
    --cleanup)
        perform_cleanup
        ;;
    --help)
        echo "Usage: $0 [option]"
        echo "Options:"
        echo "  --disk       Check disk usage"
        echo "  --memory     Check memory usage"
        echo "  --cpu        Check CPU usage"
        echo "  --containers Check Docker containers"
        echo "  --services   Check service health"
        echo "  --databases  Check database connections"
        echo "  --backups    Check backup status"
        echo "  --logs       Check log rotation"
        echo "  --report     Generate health report"
        echo "  --cleanup    Perform cleanup"
        echo "  --help       Show this help"
        echo ""
        echo "If no option is provided, all checks will be performed."
        ;;
    *)
        run_health_check
        ;;
esac
