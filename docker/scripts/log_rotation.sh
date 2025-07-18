#!/bin/bash

# Log Rotation Script for Meta-World Application
# This script handles log rotation for all services and containers

set -e

# Configuration
LOG_DIR="/Users/sar-international/Desktop/meta-world/sar-meta-world/docker/logs"
LOGROTATE_CONFIG="/Users/sar-international/Desktop/meta-world/sar-meta-world/docker/logrotate.conf"
LOGROTATE_STATE="/var/lib/logrotate/logrotate.state"
SCRIPT_LOG="/var/log/log_rotation.log"

# Create state directory if it doesn't exist
sudo mkdir -p "$(dirname "$LOGROTATE_STATE")"

# Logging function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$SCRIPT_LOG"
}

# Error handling function
handle_error() {
    log "ERROR: $1"
    exit 1
}

# Function to create missing log directories
create_log_directories() {
    log "Creating missing log directories..."
    
    local directories=(
        "$LOG_DIR/postgres"
        "$LOG_DIR/redis"
        "$LOG_DIR/influxdb"
        "$LOG_DIR/nginx"
        "$LOG_DIR/backend"
        "$LOG_DIR/mosquitto"
        "$LOG_DIR/grafana"
        "$LOG_DIR/prometheus"
        "$LOG_DIR/system"
        "$LOG_DIR/app"
        "$LOG_DIR/error"
        "$LOG_DIR/access"
    )
    
    for dir in "${directories[@]}"; do
        mkdir -p "$dir"
        log "Created directory: $dir"
    done
}

# Function to rotate logs using logrotate
rotate_logs() {
    log "Starting log rotation..."
    
    # Check if logrotate is installed
    if ! command -v logrotate >/dev/null 2>&1; then
        handle_error "logrotate is not installed. Please install it first."
    fi
    
    # Run logrotate
    if sudo logrotate -s "$LOGROTATE_STATE" -v "$LOGROTATE_CONFIG"; then
        log "Log rotation completed successfully"
    else
        handle_error "Log rotation failed"
    fi
}

# Function to clean up old compressed logs
cleanup_old_logs() {
    log "Cleaning up old compressed logs..."
    
    # Find and remove logs older than 30 days
    find "$LOG_DIR" -name "*.gz" -type f -mtime +30 -exec rm -f {} \; 2>/dev/null || true
    
    # Find and remove empty directories
    find "$LOG_DIR" -type d -empty -delete 2>/dev/null || true
    
    log "Old log cleanup completed"
}

# Function to check disk space
check_disk_space() {
    local log_partition=$(df "$LOG_DIR" | tail -1 | awk '{print $5}' | sed 's/%//')
    
    if [ "$log_partition" -gt 85 ]; then
        log "WARNING: Log partition is $log_partition% full"
        
        # Emergency cleanup if disk is too full
        if [ "$log_partition" -gt 95 ]; then
            log "EMERGENCY: Disk is $log_partition% full, performing emergency cleanup"
            find "$LOG_DIR" -name "*.gz" -type f -mtime +7 -exec rm -f {} \; 2>/dev/null || true
            find "$LOG_DIR" -name "*.log" -type f -size +100M -exec truncate -s 50M {} \; 2>/dev/null || true
        fi
    else
        log "Disk space is OK: $log_partition% used"
    fi
}

# Function to restart services if needed
restart_services() {
    log "Checking if services need to be restarted..."
    
    # Check if any services are having logging issues
    local services=("postgres-db" "redis-cache" "influxdb-tsdb" "nginx-proxy" "backend-api" "mosquitto-mqtt" "grafana-dashboard" "prometheus-metrics")
    
    for service in "${services[@]}"; do
        if docker ps --format "table {{.Names}}" | grep -q "^$service$"; then
            log "Service $service is running"
        else
            log "WARNING: Service $service is not running"
        fi
    done
}

# Function to send notifications
send_notification() {
    local status=$1
    local message=$2
    
    # Log the notification
    log "NOTIFICATION: $status - $message"
    
    # You can add email, Slack, or other notification methods here
    # Example: curl -X POST -H 'Content-type: application/json' \
    #          --data '{"text":"'$status': '$message'"}' \
    #          YOUR_SLACK_WEBHOOK_URL
}

# Function to generate log rotation report
generate_report() {
    log "Generating log rotation report..."
    
    local report_file="$LOG_DIR/rotation_report_$(date +%Y%m%d_%H%M%S).txt"
    
    {
        echo "Log Rotation Report - $(date)"
        echo "================================"
        echo ""
        echo "Log Directory: $LOG_DIR"
        echo "Disk Usage:"
        du -sh "$LOG_DIR"
        echo ""
        echo "File Counts:"
        find "$LOG_DIR" -name "*.log" -type f | wc -l | xargs echo "Active log files:"
        find "$LOG_DIR" -name "*.gz" -type f | wc -l | xargs echo "Compressed log files:"
        echo ""
        echo "Largest Log Files:"
        find "$LOG_DIR" -name "*.log" -type f -exec ls -lh {} \; | sort -rh -k5 | head -10
        echo ""
        echo "Oldest Compressed Files:"
        find "$LOG_DIR" -name "*.gz" -type f -exec ls -lh {} \; | sort -k6,7 | head -5
    } > "$report_file"
    
    log "Report generated: $report_file"
}

# Main function
main() {
    log "=== Starting Log Rotation Process ==="
    
    local start_time=$(date +%s)
    
    # Create necessary directories
    create_log_directories
    
    # Check disk space
    check_disk_space
    
    # Rotate logs
    rotate_logs
    
    # Clean up old logs
    cleanup_old_logs
    
    # Check services
    restart_services
    
    # Generate report
    generate_report
    
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    log "=== Log Rotation Process Completed ==="
    log "Duration: ${duration} seconds"
    log "Completed at: $(date)"
    
    send_notification "SUCCESS" "Log rotation completed in ${duration} seconds"
}

# Error trap
trap 'handle_error "Log rotation script failed at line $LINENO"' ERR

# Run main function
main "$@"
