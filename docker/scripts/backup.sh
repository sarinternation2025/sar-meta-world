#!/bin/bash

# Database Backup Script
# Backs up PostgreSQL, Redis, and InfluxDB data

set -e

# Configuration
BACKUP_DIR="/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

# Database connection details
POSTGRES_HOST="postgres"
POSTGRES_PORT="5432"
POSTGRES_USER="postgres"
POSTGRES_DB="chatapp"

REDIS_HOST="redis"
REDIS_PORT="6379"

INFLUXDB_HOST="influxdb"
INFLUXDB_PORT="8086"
INFLUXDB_TOKEN="my-super-secret-admin-token-change-this-in-production"
INFLUXDB_ORG="chatapp"
INFLUXDB_BUCKET="metrics"

# Create backup directory
mkdir -p $BACKUP_DIR

echo "Starting backup process at $(date)"

# Function to backup PostgreSQL
backup_postgres() {
    echo "Backing up PostgreSQL..."
    
    # Full database backup
    pg_dump -h $POSTGRES_HOST -p $POSTGRES_PORT -U $POSTGRES_USER -d $POSTGRES_DB \
        --format=custom --compress=9 --verbose \
        --file="$BACKUP_DIR/postgres_${POSTGRES_DB}_${TIMESTAMP}.dump"
    
    # Schema-only backup
    pg_dump -h $POSTGRES_HOST -p $POSTGRES_PORT -U $POSTGRES_USER -d $POSTGRES_DB \
        --schema-only --format=plain \
        --file="$BACKUP_DIR/postgres_${POSTGRES_DB}_schema_${TIMESTAMP}.sql"
    
    # Data-only backup
    pg_dump -h $POSTGRES_HOST -p $POSTGRES_PORT -U $POSTGRES_USER -d $POSTGRES_DB \
        --data-only --format=plain \
        --file="$BACKUP_DIR/postgres_${POSTGRES_DB}_data_${TIMESTAMP}.sql"
    
    echo "PostgreSQL backup completed"
}

# Function to backup Redis
backup_redis() {
    echo "Backing up Redis..."
    
    # Create Redis backup using BGSAVE
    redis-cli -h $REDIS_HOST -p $REDIS_PORT BGSAVE
    
    # Wait for backup to complete
    while [ "$(redis-cli -h $REDIS_HOST -p $REDIS_PORT LASTSAVE)" -eq "$(redis-cli -h $REDIS_HOST -p $REDIS_PORT LASTSAVE)" ]; do
        sleep 1
    done
    
    # Copy the dump file
    docker cp redis-cache:/data/dump.rdb "$BACKUP_DIR/redis_dump_${TIMESTAMP}.rdb"
    
    # Create Redis configuration backup
    redis-cli -h $REDIS_HOST -p $REDIS_PORT CONFIG GET "*" > "$BACKUP_DIR/redis_config_${TIMESTAMP}.txt"
    
    echo "Redis backup completed"
}

# Function to backup InfluxDB
backup_influxdb() {
    echo "Backing up InfluxDB..."
    
    # Backup InfluxDB using influx CLI
    influx backup "$BACKUP_DIR/influxdb_${TIMESTAMP}" \
        --host "http://$INFLUXDB_HOST:$INFLUXDB_PORT" \
        --token "$INFLUXDB_TOKEN" \
        --org "$INFLUXDB_ORG"
    
    # Create metadata backup
    influx org list --host "http://$INFLUXDB_HOST:$INFLUXDB_PORT" --token "$INFLUXDB_TOKEN" \
        > "$BACKUP_DIR/influxdb_orgs_${TIMESTAMP}.txt"
    
    influx bucket list --host "http://$INFLUXDB_HOST:$INFLUXDB_PORT" --token "$INFLUXDB_TOKEN" \
        > "$BACKUP_DIR/influxdb_buckets_${TIMESTAMP}.txt"
    
    echo "InfluxDB backup completed"
}

# Function to backup Mosquitto
backup_mosquitto() {
    echo "Backing up Mosquitto..."
    
    # Copy Mosquitto data
    docker cp mosquitto-mqtt:/mosquitto/data "$BACKUP_DIR/mosquitto_data_${TIMESTAMP}"
    
    # Copy Mosquitto configuration
    docker cp mosquitto-mqtt:/mosquitto/config "$BACKUP_DIR/mosquitto_config_${TIMESTAMP}"
    
    echo "Mosquitto backup completed"
}

# Function to cleanup old backups
cleanup_old_backups() {
    echo "Cleaning up old backups..."
    find $BACKUP_DIR -name "*.dump" -type f -mtime +$RETENTION_DAYS -delete
    find $BACKUP_DIR -name "*.sql" -type f -mtime +$RETENTION_DAYS -delete
    find $BACKUP_DIR -name "*.rdb" -type f -mtime +$RETENTION_DAYS -delete
    find $BACKUP_DIR -name "*.txt" -type f -mtime +$RETENTION_DAYS -delete
    find $BACKUP_DIR -name "influxdb_*" -type d -mtime +$RETENTION_DAYS -exec rm -rf {} +
    find $BACKUP_DIR -name "mosquitto_*" -type d -mtime +$RETENTION_DAYS -exec rm -rf {} +
    echo "Cleanup completed"
}

# Function to compress backups
compress_backups() {
    echo "Compressing backups..."
    
    # Create a tarball of all backups for this timestamp
    cd $BACKUP_DIR
    tar -czf "full_backup_${TIMESTAMP}.tar.gz" \
        postgres_*_${TIMESTAMP}.* \
        redis_*_${TIMESTAMP}.* \
        influxdb_*_${TIMESTAMP}* \
        mosquitto_*_${TIMESTAMP}*
    
    # Remove individual files after compression
    rm -f postgres_*_${TIMESTAMP}.*
    rm -f redis_*_${TIMESTAMP}.*
    rm -f influxdb_*_${TIMESTAMP}.*
    rm -rf mosquitto_*_${TIMESTAMP}*
    
    echo "Compression completed"
}

# Function to verify backups
verify_backups() {
    echo "Verifying backups..."
    
    # Check if backup files exist and are not empty
    BACKUP_FILE="$BACKUP_DIR/full_backup_${TIMESTAMP}.tar.gz"
    
    if [ -f "$BACKUP_FILE" ] && [ -s "$BACKUP_FILE" ]; then
        echo "Backup verification successful: $BACKUP_FILE"
        echo "Backup size: $(du -sh $BACKUP_FILE | cut -f1)"
    else
        echo "Backup verification failed: $BACKUP_FILE"
        exit 1
    fi
}

# Main backup process
main() {
    echo "=== Starting Database Backup ==="
    
    # Perform backups
    backup_postgres
    backup_redis
    backup_influxdb
    backup_mosquitto
    
    # Compress all backups
    compress_backups
    
    # Verify backups
    verify_backups
    
    # Cleanup old backups
    cleanup_old_backups
    
    echo "=== Backup Process Completed Successfully ==="
    echo "Backup file: $BACKUP_DIR/full_backup_${TIMESTAMP}.tar.gz"
    echo "Completed at: $(date)"
}

# Run main function
main "$@"
