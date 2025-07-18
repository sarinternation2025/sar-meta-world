#!/bin/bash

# PostgreSQL Backup Script
# Usage: ./backup.sh [full|incremental] [database_name]

set -e

# Configuration
BACKUP_DIR="/var/backups/postgresql"
POSTGRES_USER="postgres"
POSTGRES_HOST="localhost"
POSTGRES_PORT="5432"
RETENTION_DAYS=7
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Function to perform full backup
full_backup() {
    local db_name=$1
    echo "Starting full backup for database: $db_name"
    
    # Create database dump
    pg_dump -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -U "$POSTGRES_USER" \
        --verbose --no-acl --no-owner --format=custom \
        "$db_name" > "$BACKUP_DIR/full_${db_name}_${TIMESTAMP}.dump"
    
    # Create globals dump (users, roles, etc.)
    pg_dumpall -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -U "$POSTGRES_USER" \
        --globals-only > "$BACKUP_DIR/globals_${TIMESTAMP}.sql"
    
    echo "Full backup completed: $BACKUP_DIR/full_${db_name}_${TIMESTAMP}.dump"
}

# Function to perform incremental backup using WAL archiving
incremental_backup() {
    echo "Starting incremental backup (WAL archiving)"
    
    # Force a checkpoint to ensure all data is written
    psql -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -U "$POSTGRES_USER" \
        -c "CHECKPOINT;" postgres
    
    # Create base backup
    pg_basebackup -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -U "$POSTGRES_USER" \
        -D "$BACKUP_DIR/base_backup_${TIMESTAMP}" -Ft -z -P
    
    echo "Incremental backup completed: $BACKUP_DIR/base_backup_${TIMESTAMP}"
}

# Function to cleanup old backups
cleanup_old_backups() {
    echo "Cleaning up backups older than $RETENTION_DAYS days"
    find "$BACKUP_DIR" -name "*.dump" -mtime +$RETENTION_DAYS -delete
    find "$BACKUP_DIR" -name "*.sql" -mtime +$RETENTION_DAYS -delete
    find "$BACKUP_DIR" -name "base_backup_*" -mtime +$RETENTION_DAYS -exec rm -rf {} \;
}

# Function to restore from backup
restore_backup() {
    local backup_file=$1
    local db_name=$2
    
    echo "Restoring database $db_name from $backup_file"
    
    # Drop existing database (be careful!)
    # dropdb -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -U "$POSTGRES_USER" "$db_name" || true
    
    # Create new database
    createdb -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -U "$POSTGRES_USER" "$db_name"
    
    # Restore from backup
    pg_restore -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -U "$POSTGRES_USER" \
        -d "$db_name" --verbose --no-acl --no-owner "$backup_file"
    
    echo "Database restored successfully"
}

# Function to list available backups
list_backups() {
    echo "Available backups:"
    ls -la "$BACKUP_DIR"
}

# Main script logic
case "$1" in
    "full")
        DB_NAME=${2:-"chatapp_dev"}
        full_backup "$DB_NAME"
        cleanup_old_backups
        ;;
    "incremental")
        incremental_backup
        cleanup_old_backups
        ;;
    "restore")
        BACKUP_FILE=$2
        DB_NAME=${3:-"chatapp_dev"}
        restore_backup "$BACKUP_FILE" "$DB_NAME"
        ;;
    "list")
        list_backups
        ;;
    "cleanup")
        cleanup_old_backups
        ;;
    *)
        echo "Usage: $0 {full|incremental|restore|list|cleanup} [database_name] [backup_file]"
        echo "Examples:"
        echo "  $0 full chatapp_dev                    # Full backup of chatapp_dev"
        echo "  $0 incremental                         # Incremental backup"
        echo "  $0 restore backup.dump chatapp_dev     # Restore from backup"
        echo "  $0 list                                # List available backups"
        echo "  $0 cleanup                             # Clean old backups"
        exit 1
        ;;
esac
