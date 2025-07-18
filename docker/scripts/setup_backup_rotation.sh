#!/bin/bash

# Setup Script for Backup and Log Rotation
# This script sets up automated backup and log rotation for the meta-world application

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DOCKER_DIR="$(dirname "$SCRIPT_DIR")"
PROJECT_ROOT="$(dirname "$DOCKER_DIR")"
LOG_FILE="/var/log/backup_rotation_setup.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

# Warning function
warn() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1" | tee -a "$LOG_FILE"
}

# Error function
error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1" | tee -a "$LOG_FILE"
    exit 1
}

# Function to check if running as root
check_root() {
    if [[ $EUID -ne 0 ]]; then
        error "This script must be run as root"
    fi
}

# Function to install dependencies
install_dependencies() {
    log "Installing dependencies..."
    
    # Check for package manager
    if command -v apt-get >/dev/null 2>&1; then
        apt-get update
        apt-get install -y \
            cron \
            logrotate \
            docker.io \
            docker-compose \
            postgresql-client \
            redis-tools \
            influxdb2-cli \
            awscli \
            curl \
            gzip \
            tar \
            findutils
    elif command -v yum >/dev/null 2>&1; then
        yum update -y
        yum install -y \
            cron \
            logrotate \
            docker \
            docker-compose \
            postgresql \
            redis \
            influxdb2-cli \
            awscli \
            curl \
            gzip \
            tar \
            findutils
    elif command -v brew >/dev/null 2>&1; then
        brew install \
            postgresql \
            redis \
            influxdb-cli \
            awscli \
            docker \
            docker-compose
    else
        error "Unsupported package manager. Please install dependencies manually."
    fi
    
    log "Dependencies installed successfully"
}

# Function to create necessary directories
create_directories() {
    log "Creating necessary directories..."
    
    local directories=(
        "$DOCKER_DIR/backups"
        "$DOCKER_DIR/logs/postgres"
        "$DOCKER_DIR/logs/redis"
        "$DOCKER_DIR/logs/influxdb"
        "$DOCKER_DIR/logs/nginx"
        "$DOCKER_DIR/logs/backend"
        "$DOCKER_DIR/logs/mosquitto"
        "$DOCKER_DIR/logs/grafana"
        "$DOCKER_DIR/logs/prometheus"
        "$DOCKER_DIR/logs/system"
        "$DOCKER_DIR/logs/app"
        "$DOCKER_DIR/logs/error"
        "$DOCKER_DIR/logs/access"
        "/var/lib/logrotate"
        "/var/log"
    )
    
    for dir in "${directories[@]}"; do
        mkdir -p "$dir"
        chmod 755 "$dir"
        log "Created directory: $dir"
    done
}

# Function to make scripts executable
make_scripts_executable() {
    log "Making scripts executable..."
    
    local scripts=(
        "$SCRIPT_DIR/enhanced_backup.sh"
        "$SCRIPT_DIR/log_rotation.sh"
        "$SCRIPT_DIR/backup_verification.sh"
        "$SCRIPT_DIR/emergency_log_cleanup.sh"
    )
    
    for script in "${scripts[@]}"; do
        if [[ -f "$script" ]]; then
            chmod +x "$script"
            log "Made executable: $script"
        else
            warn "Script not found: $script"
        fi
    done
}

# Function to install cron jobs
install_cron_jobs() {
    log "Installing cron jobs..."
    
    # Check if cron is running
    if ! systemctl is-active --quiet cron && ! systemctl is-active --quiet crond; then
        systemctl enable cron || systemctl enable crond
        systemctl start cron || systemctl start crond
    fi
    
    # Install cron jobs for root user
    crontab -l > /tmp/current_cron 2>/dev/null || true
    
    # Add backup and log rotation jobs
    cat >> /tmp/current_cron << EOF

# Meta-World Backup and Log Rotation Jobs
# Daily database backup at 2:00 AM
0 2 * * * $SCRIPT_DIR/enhanced_backup.sh >> $DOCKER_DIR/logs/backup.log 2>&1

# Daily log rotation at 1:00 AM
0 1 * * * $SCRIPT_DIR/log_rotation.sh >> $DOCKER_DIR/logs/log_rotation.log 2>&1

# Hourly emergency log cleanup
0 * * * * $SCRIPT_DIR/emergency_log_cleanup.sh >> $DOCKER_DIR/logs/emergency_cleanup.log 2>&1

EOF
    
    # Install the cron jobs
    crontab /tmp/current_cron
    rm /tmp/current_cron
    
    log "Cron jobs installed successfully"
}

# Function to configure logrotate
configure_logrotate() {
    log "Configuring logrotate..."
    
    # Copy logrotate configuration
    cp "$DOCKER_DIR/logrotate.conf" /etc/logrotate.d/meta-world
    
    # Test logrotate configuration
    if logrotate -d /etc/logrotate.d/meta-world; then
        log "Logrotate configuration is valid"
    else
        error "Logrotate configuration is invalid"
    fi
}

# Function to create systemd services
create_systemd_services() {
    log "Creating systemd services..."
    
    # Backup service
    cat > /etc/systemd/system/meta-world-backup.service << EOF
[Unit]
Description=Meta-World Database Backup Service
After=docker.service
Requires=docker.service

[Service]
Type=oneshot
ExecStart=$SCRIPT_DIR/enhanced_backup.sh
User=root
Group=root
WorkingDirectory=$DOCKER_DIR/backups

[Install]
WantedBy=multi-user.target
EOF

    # Backup timer
    cat > /etc/systemd/system/meta-world-backup.timer << EOF
[Unit]
Description=Meta-World Database Backup Timer
Requires=meta-world-backup.service

[Timer]
OnCalendar=daily
Persistent=true

[Install]
WantedBy=timers.target
EOF

    # Log rotation service
    cat > /etc/systemd/system/meta-world-logrotate.service << EOF
[Unit]
Description=Meta-World Log Rotation Service
After=docker.service
Requires=docker.service

[Service]
Type=oneshot
ExecStart=$SCRIPT_DIR/log_rotation.sh
User=root
Group=root
WorkingDirectory=$DOCKER_DIR/logs

[Install]
WantedBy=multi-user.target
EOF

    # Log rotation timer
    cat > /etc/systemd/system/meta-world-logrotate.timer << EOF
[Unit]
Description=Meta-World Log Rotation Timer
Requires=meta-world-logrotate.service

[Timer]
OnCalendar=daily
Persistent=true

[Install]
WantedBy=timers.target
EOF

    # Reload systemd and enable services
    systemctl daemon-reload
    systemctl enable meta-world-backup.timer
    systemctl enable meta-world-logrotate.timer
    systemctl start meta-world-backup.timer
    systemctl start meta-world-logrotate.timer
    
    log "Systemd services created and enabled"
}

# Function to test backup functionality
test_backup() {
    log "Testing backup functionality..."
    
    # Create a test backup
    if "$SCRIPT_DIR/enhanced_backup.sh" --test; then
        log "Backup test completed successfully"
    else
        error "Backup test failed"
    fi
}

# Function to test log rotation
test_log_rotation() {
    log "Testing log rotation..."
    
    # Create test log files
    for dir in postgres redis influxdb nginx backend; do
        echo "Test log entry $(date)" > "$DOCKER_DIR/logs/$dir/test.log"
    done
    
    # Run log rotation
    if "$SCRIPT_DIR/log_rotation.sh" --test; then
        log "Log rotation test completed successfully"
    else
        error "Log rotation test failed"
    fi
}

# Function to display configuration summary
display_summary() {
    log "=== Configuration Summary ==="
    log "Docker Directory: $DOCKER_DIR"
    log "Scripts Directory: $SCRIPT_DIR"
    log "Backups Directory: $DOCKER_DIR/backups"
    log "Logs Directory: $DOCKER_DIR/logs"
    log "Logrotate Config: /etc/logrotate.d/meta-world"
    log ""
    log "=== Scheduled Tasks ==="
    log "Daily backup: 2:00 AM"
    log "Daily log rotation: 1:00 AM"
    log "Hourly emergency cleanup: Every hour"
    log ""
    log "=== Next Steps ==="
    log "1. Configure AWS credentials for S3 backup (optional)"
    log "2. Update notification webhooks in scripts"
    log "3. Test backup and restore procedures"
    log "4. Monitor log files for any issues"
    log ""
    log "=== Commands ==="
    log "Check backup status: systemctl status meta-world-backup.timer"
    log "Check log rotation status: systemctl status meta-world-logrotate.timer"
    log "View logs: tail -f $DOCKER_DIR/logs/backup.log"
    log "Manual backup: $SCRIPT_DIR/enhanced_backup.sh"
    log "Manual log rotation: $SCRIPT_DIR/log_rotation.sh"
}

# Main function
main() {
    log "=== Starting Meta-World Backup and Log Rotation Setup ==="
    
    # Check if running as root
    check_root
    
    # Install dependencies
    install_dependencies
    
    # Create necessary directories
    create_directories
    
    # Make scripts executable
    make_scripts_executable
    
    # Configure logrotate
    configure_logrotate
    
    # Install cron jobs
    install_cron_jobs
    
    # Create systemd services
    create_systemd_services
    
    # Test functionality
    test_backup
    test_log_rotation
    
    # Display summary
    display_summary
    
    log "=== Setup completed successfully ==="
}

# Run main function
main "$@"
