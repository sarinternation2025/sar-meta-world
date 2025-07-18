#!/bin/bash

# Enhanced Database Backup Script
# Backs up PostgreSQL, Redis, InfluxDB data and uploads to AWS S3
# Includes comprehensive logging and error handling

set -e

# Configuration
BACKUP_DIR="/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30
S3_RETENTION_DAYS=90
LOG_FILE="/var/log/backup.log"

# Database connection details from environment variables
POSTGRES_HOST="${POSTGRES_HOST:-postgres}"
POSTGRES_PORT="${POSTGRES_PORT:-5432}"
POSTGRES_USER="${POSTGRES_USER:-postgres}"
POSTGRES_DB="${POSTGRES_DB:-chatapp}"
POSTGRES_PASSWORD="${POSTGRES_PASSWORD:-postgres123}"

REDIS_HOST="${REDIS_HOST:-redis}"
REDIS_PORT="${REDIS_PORT:-6379}"
REDIS_PASSWORD="${REDIS_PASSWORD:-+fIQO/+ARzHgYBPgxk7Q+zgYPUi7biCuex/e3kNWMec=}"

INFLUXDB_HOST="${INFLUXDB_HOST:-influxdb}"
INFLUXDB_PORT="${INFLUXDB_PORT:-8086}"
INFLUXDB_TOKEN="${INFLUXDB_TOKEN:-my-super-secret-admin-token}"
INFLUXDB_ORG="${INFLUXDB_ORG:-chatapp}"
INFLUXDB_BUCKET="${INFLUXDB_BUCKET:-metrics}"

# AWS S3 configuration
AWS_S3_BUCKET="${AWS_S3_BUCKET:-your-backup-bucket}"
AWS_ACCESS_KEY_ID="${AWS_ACCESS_KEY_ID}"
AWS_SECRET_ACCESS_KEY="${AWS_SECRET_ACCESS_KEY}"
AWS_REGION="${AWS_REGION:-us-east-1}"

# Create backup directory
mkdir -p $BACKUP_DIR

# Logging function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Error handling function
handle_error() {
    log "ERROR: $1"
    exit 1
}

# Function to check if service is running
check_service() {
    local service=$1
    local host=$2
    local port=$3
    
    if ! nc -z "$host" "$port"; then
        handle_error "Service $service is not reachable at $host:$port"
    fi
    log "Service $service is running at $host:$port"
}

# Function to backup PostgreSQL
backup_postgres() {
    log "Starting PostgreSQL backup..."
    
    check_service "PostgreSQL" "$POSTGRES_HOST" "$POSTGRES_PORT"
    
    # Set password for pg_dump
    export PGPASSWORD="$POSTGRES_PASSWORD"
    
    # Full database backup
    pg_dump -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -U "$POSTGRES_USER" -d "$POSTGRES_DB" \
        --format=custom --compress=9 --verbose \
        --file="$BACKUP_DIR/postgres_${POSTGRES_DB}_${TIMESTAMP}.dump" \
        || handle_error "PostgreSQL backup failed"
    
    # Schema-only backup
    pg_dump -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -U "$POSTGRES_USER" -d "$POSTGRES_DB" \
        --schema-only --format=plain \
        --file="$BACKUP_DIR/postgres_${POSTGRES_DB}_schema_${TIMESTAMP}.sql" \
        || handle_error "PostgreSQL schema backup failed"
    
    # Data-only backup
    pg_dump -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -U "$POSTGRES_USER" -d "$POSTGRES_DB" \
        --data-only --format=plain \
        --file="$BACKUP_DIR/postgres_${POSTGRES_DB}_data_${TIMESTAMP}.sql" \
        || handle_error "PostgreSQL data backup failed"
    
    unset PGPASSWORD
    log "PostgreSQL backup completed successfully"
}

# Function to backup Redis
backup_redis() {
    log "Starting Redis backup..."
    
    check_service "Redis" "$REDIS_HOST" "$REDIS_PORT"
    
    # Create Redis backup using BGSAVE
    redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" -a "$REDIS_PASSWORD" BGSAVE \
        || handle_error "Redis BGSAVE failed"
    
    # Wait for backup to complete
    local last_save_time=$(redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" -a "$REDIS_PASSWORD" LASTSAVE)
    local counter=0
    while [ $counter -lt 60 ]; do
        local current_save_time=$(redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" -a "$REDIS_PASSWORD" LASTSAVE)
        if [ "$current_save_time" -gt "$last_save_time" ]; then
            break
        fi
        sleep 1
        counter=$((counter + 1))
    done
    
    if [ $counter -eq 60 ]; then
        handle_error "Redis backup timeout"
    fi
    
    # Copy the dump file
    docker cp redis-cache:/data/dump.rdb "$BACKUP_DIR/redis_dump_${TIMESTAMP}.rdb" \
        || handle_error "Failed to copy Redis dump file"
    
    # Create Redis configuration backup
    redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" -a "$REDIS_PASSWORD" CONFIG GET "*" \
        > "$BACKUP_DIR/redis_config_${TIMESTAMP}.txt" \
        || handle_error "Redis config backup failed"
    
    log "Redis backup completed successfully"
}

# Function to backup InfluxDB
backup_influxdb() {
    log "Starting InfluxDB backup..."
    
    check_service "InfluxDB" "$INFLUXDB_HOST" "$INFLUXDB_PORT"
    
    # Backup InfluxDB using influx CLI
    influx backup "$BACKUP_DIR/influxdb_${TIMESTAMP}" \
        --host "http://$INFLUXDB_HOST:$INFLUXDB_PORT" \
        --token "$INFLUXDB_TOKEN" \
        --org "$INFLUXDB_ORG" \
        || handle_error "InfluxDB backup failed"
    
    # Create metadata backup
    influx org list --host "http://$INFLUXDB_HOST:$INFLUXDB_PORT" --token "$INFLUXDB_TOKEN" \
        > "$BACKUP_DIR/influxdb_orgs_${TIMESTAMP}.txt" \
        || handle_error "InfluxDB orgs backup failed"
    
    influx bucket list --host "http://$INFLUXDB_HOST:$INFLUXDB_PORT" --token "$INFLUXDB_TOKEN" \
        > "$BACKUP_DIR/influxdb_buckets_${TIMESTAMP}.txt" \
        || handle_error "InfluxDB buckets backup failed"
    
    log "InfluxDB backup completed successfully"
}

# Function to backup Mosquitto
backup_mosquitto() {
    log "Starting Mosquitto backup..."
    
    # Copy Mosquitto data
    docker cp mosquitto-mqtt:/mosquitto/data "$BACKUP_DIR/mosquitto_data_${TIMESTAMP}" \
        || handle_error "Mosquitto data backup failed"
    
    # Copy Mosquitto configuration
    docker cp mosquitto-mqtt:/mosquitto/config "$BACKUP_DIR/mosquitto_config_${TIMESTAMP}" \
        || handle_error "Mosquitto config backup failed"
    
    log "Mosquitto backup completed successfully"
}

# Function to compress backups
compress_backups() {
    log "Compressing backups..."
    
    cd "$BACKUP_DIR"
    
    # Create a tarball of all backups for this timestamp
    tar -czf "full_backup_${TIMESTAMP}.tar.gz" \
        postgres_*_${TIMESTAMP}.* \
        redis_*_${TIMESTAMP}.* \
        influxdb_*_${TIMESTAMP}* \
        mosquitto_*_${TIMESTAMP}* \
        || handle_error "Backup compression failed"
    
    # Remove individual files after compression
    rm -f postgres_*_${TIMESTAMP}.*
    rm -f redis_*_${TIMESTAMP}.*
    rm -f influxdb_*_${TIMESTAMP}.*
    rm -rf mosquitto_*_${TIMESTAMP}*
    
    log "Backup compression completed successfully"
}

# Function to upload to S3
upload_to_s3() {
    if [ -z "$AWS_ACCESS_KEY_ID" ] || [ -z "$AWS_SECRET_ACCESS_KEY" ]; then
        log "WARNING: AWS credentials not configured. Skipping S3 upload."
        return 0
    fi
    
    log "Uploading backup to S3..."
    
    local backup_file="$BACKUP_DIR/full_backup_${TIMESTAMP}.tar.gz"
    local s3_key="backups/$(date +%Y)/$(date +%m)/full_backup_${TIMESTAMP}.tar.gz"
    
    aws s3 cp "$backup_file" "s3://$AWS_S3_BUCKET/$s3_key" \
        --region "$AWS_REGION" \
        || handle_error "S3 upload failed"
    
    log "S3 upload completed successfully"
}

# Function to cleanup old backups
cleanup_old_backups() {
    log "Cleaning up old local backups..."
    
    find "$BACKUP_DIR" -name "*.dump" -type f -mtime +$RETENTION_DAYS -delete
    find "$BACKUP_DIR" -name "*.sql" -type f -mtime +$RETENTION_DAYS -delete
    find "$BACKUP_DIR" -name "*.rdb" -type f -mtime +$RETENTION_DAYS -delete
    find "$BACKUP_DIR" -name "*.txt" -type f -mtime +$RETENTION_DAYS -delete
    find "$BACKUP_DIR" -name "*.tar.gz" -type f -mtime +$RETENTION_DAYS -delete
    find "$BACKUP_DIR" -name "influxdb_*" -type d -mtime +$RETENTION_DAYS -exec rm -rf {} + 2>/dev/null || true
    find "$BACKUP_DIR" -name "mosquitto_*" -type d -mtime +$RETENTION_DAYS -exec rm -rf {} + 2>/dev/null || true
    
    log "Local backup cleanup completed"
}

# Function to cleanup old S3 backups
cleanup_s3_backups() {
    if [ -z "$AWS_ACCESS_KEY_ID" ] || [ -z "$AWS_SECRET_ACCESS_KEY" ]; then
        log "WARNING: AWS credentials not configured. Skipping S3 cleanup."
        return 0
    fi
    
    log "Cleaning up old S3 backups..."
    
    local cutoff_date=$(date -d "-$S3_RETENTION_DAYS days" +%Y-%m-%d)
    
    aws s3 ls "s3://$AWS_S3_BUCKET/backups/" --recursive --region "$AWS_REGION" | \
    while read -r line; do
        local file_date=$(echo "$line" | awk '{print $1}')
        local file_path=$(echo "$line" | awk '{print $4}')
        
        if [[ "$file_date" < "$cutoff_date" ]]; then
            aws s3 rm "s3://$AWS_S3_BUCKET/$file_path" --region "$AWS_REGION" \
                || log "WARNING: Failed to delete s3://$AWS_S3_BUCKET/$file_path"
        fi
    done
    
    log "S3 backup cleanup completed"
}

# Function to verify backups
verify_backups() {
    log "Verifying backups..."
    
    local backup_file="$BACKUP_DIR/full_backup_${TIMESTAMP}.tar.gz"
    
    if [ -f "$backup_file" ] && [ -s "$backup_file" ]; then
        local backup_size=$(du -sh "$backup_file" | cut -f1)
        log "Backup verification successful: $backup_file"
        log "Backup size: $backup_size"
        
        # Test the integrity of the tar file
        tar -tzf "$backup_file" > /dev/null || handle_error "Backup file is corrupted"
        log "Backup integrity check passed"
    else
        handle_error "Backup verification failed: $backup_file"
    fi
}

# Function to send notification
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

# Main backup process
main() {
    log "=== Starting Enhanced Database Backup ==="
    
    local start_time=$(date +%s)
    
    # Check dependencies
    command -v pg_dump >/dev/null 2>&1 || handle_error "pg_dump not found"
    command -v redis-cli >/dev/null 2>&1 || handle_error "redis-cli not found"
    command -v influx >/dev/null 2>&1 || handle_error "influx CLI not found"
    command -v docker >/dev/null 2>&1 || handle_error "docker not found"
    
    if [ -n "$AWS_ACCESS_KEY_ID" ] && [ -n "$AWS_SECRET_ACCESS_KEY" ]; then
        command -v aws >/dev/null 2>&1 || handle_error "aws CLI not found"
    fi
    
    # Perform backups
    backup_postgres
    backup_redis
    backup_influxdb
    backup_mosquitto
    
    # Compress all backups
    compress_backups
    
    # Verify backups
    verify_backups
    
    # Upload to S3
    upload_to_s3
    
    # Cleanup old backups
    cleanup_old_backups
    cleanup_s3_backups
    
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    log "=== Backup Process Completed Successfully ==="
    log "Backup file: $BACKUP_DIR/full_backup_${TIMESTAMP}.tar.gz"
    log "Duration: ${duration} seconds"
    log "Completed at: $(date)"
    
    send_notification "SUCCESS" "Database backup completed in ${duration} seconds"
}

# Error trap
trap 'handle_error "Script failed at line $LINENO"' ERR

# Run main function
main "$@"
