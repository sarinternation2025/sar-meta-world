#!/bin/bash
# Production Deployment Script for SAR Meta World
# This script ensures secure deployment with proper configurations

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
DOCKER_DIR="$PROJECT_ROOT/docker"
BACKUP_DIR="$PROJECT_ROOT/backups"
LOG_FILE="$PROJECT_ROOT/logs/deploy-$(date +%Y%m%d-%H%M%S).log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
    exit 1
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

# Pre-deployment checks
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check if Docker is running
    if ! docker info &>/dev/null; then
        error "Docker is not running. Please start Docker and try again."
    fi
    
    # Check if Docker Compose is available
    if ! command -v docker-compose &>/dev/null; then
        error "Docker Compose is not installed."
    fi
    
    # Check if required directories exist
    if [ ! -d "$DOCKER_DIR" ]; then
        error "Docker directory not found: $DOCKER_DIR"
    fi
    
    # Create required directories
    mkdir -p "$BACKUP_DIR" "$PROJECT_ROOT/logs"
    
    log "Prerequisites check passed"
}

# Security checks
check_security() {
    log "Performing security checks..."
    
    # Check if production environment files exist
    local env_files=(
        "$PROJECT_ROOT/packages/backend/.env.production"
        "$PROJECT_ROOT/packages/frontend/.env.production"
        "$PROJECT_ROOT/packages/cli-agent/.env.production"
        "$DOCKER_DIR/.env.prod"
    )
    
    for file in "${env_files[@]}"; do
        if [ ! -f "$file" ]; then
            error "Production environment file not found: $file"
        fi
        
        # Check file permissions
        if [ "$(stat -c '%a' "$file")" != "600" ]; then
            warning "Environment file has insecure permissions: $file"
            chmod 600 "$file"
            log "Fixed permissions for $file"
        fi
    done
    
    # Check if secrets directory exists and has proper permissions
    if [ ! -d "$DOCKER_DIR/secrets" ]; then
        error "Secrets directory not found: $DOCKER_DIR/secrets"
    fi
    
    # Check secret files
    local secret_files=(
        "$DOCKER_DIR/secrets/postgres_password.txt"
        "$DOCKER_DIR/secrets/redis_password.txt"
        "$DOCKER_DIR/secrets/influxdb_admin_token.txt"
        "$DOCKER_DIR/secrets/grafana_admin_password.txt"
        "$DOCKER_DIR/secrets/jwt_secret.txt"
        "$DOCKER_DIR/secrets/session_secret.txt"
        "$DOCKER_DIR/secrets/smtp_password.txt"
    )
    
    for file in "${secret_files[@]}"; do
        if [ ! -f "$file" ]; then
            error "Secret file not found: $file"
        fi
        
        # Check if file contains default/mock content
        if grep -q "mock_secret_content" "$file"; then
            error "Secret file contains mock content: $file. Please generate secure secrets."
        fi
        
        # Check file permissions
        if [ "$(stat -c '%a' "$file")" != "600" ]; then
            warning "Secret file has insecure permissions: $file"
            chmod 600 "$file"
            log "Fixed permissions for $file"
        fi
    done
    
    log "Security checks passed"
}

# Backup current deployment
backup_current() {
    log "Creating backup of current deployment..."
    
    local backup_timestamp=$(date +%Y%m%d-%H%M%S)
    local backup_path="$BACKUP_DIR/deployment-backup-$backup_timestamp"
    
    mkdir -p "$backup_path"
    
    # Backup environment files
    cp -r "$PROJECT_ROOT/packages/backend/.env*" "$backup_path/" 2>/dev/null || true
    cp -r "$PROJECT_ROOT/packages/frontend/.env*" "$backup_path/" 2>/dev/null || true
    cp -r "$PROJECT_ROOT/packages/cli-agent/.env*" "$backup_path/" 2>/dev/null || true
    cp -r "$DOCKER_DIR/.env*" "$backup_path/" 2>/dev/null || true
    
    # Backup Docker volumes (if running)
    if docker ps -q --filter "name=postgres" | grep -q .; then
        log "Backing up database..."
        docker exec postgres pg_dumpall -U postgres > "$backup_path/database-backup.sql" || true
    fi
    
    log "Backup created at: $backup_path"
}

# Deploy production environment
deploy_production() {
    log "Deploying production environment..."
    
    cd "$DOCKER_DIR"
    
    # Stop existing containers gracefully
    if docker-compose -f docker-compose.prod.yml ps -q | grep -q .; then
        log "Stopping existing containers..."
        docker-compose -f docker-compose.prod.yml down --timeout 30
    fi
    
    # Pull latest images
    log "Pulling latest images..."
    docker-compose -f docker-compose.prod.yml pull
    
    # Start production services
    log "Starting production services..."
    docker-compose -f docker-compose.prod.yml up -d
    
    # Wait for services to be healthy
    log "Waiting for services to be healthy..."
    local max_attempts=30
    local attempt=0
    
    while [ $attempt -lt $max_attempts ]; do
        if docker-compose -f docker-compose.prod.yml ps | grep -q "healthy"; then
            log "Services are healthy"
            break
        fi
        
        if [ $attempt -eq $((max_attempts - 1)) ]; then
            error "Services failed to become healthy within timeout"
        fi
        
        sleep 10
        ((attempt++))
        log "Waiting for services... ($attempt/$max_attempts)"
    done
    
    log "Production deployment completed successfully"
}

# Post-deployment verification
verify_deployment() {
    log "Verifying deployment..."
    
    # Check if all containers are running
    local failed_services=()
    
    while IFS= read -r service; do
        if ! docker-compose -f docker-compose.prod.yml ps "$service" | grep -q "Up"; then
            failed_services+=("$service")
        fi
    done < <(docker-compose -f docker-compose.prod.yml config --services)
    
    if [ ${#failed_services[@]} -gt 0 ]; then
        error "The following services failed to start: ${failed_services[*]}"
    fi
    
    # Test database connection
    if docker exec postgres pg_isready -U postgres &>/dev/null; then
        log "Database connection: OK"
    else
        warning "Database connection test failed"
    fi
    
    # Test Redis connection
    if docker exec redis redis-cli ping | grep -q "PONG"; then
        log "Redis connection: OK"
    else
        warning "Redis connection test failed"
    fi
    
    log "Deployment verification completed"
}

# Main deployment function
main() {
    log "Starting production deployment for SAR Meta World..."
    
    check_prerequisites
    check_security
    backup_current
    deploy_production
    verify_deployment
    
    log "Production deployment completed successfully!"
    log "Services are running and healthy."
    log "View logs: docker-compose -f docker-compose.prod.yml logs -f"
    log "Monitor services: docker-compose -f docker-compose.prod.yml ps"
}

# Handle script interruption
trap 'error "Deployment interrupted"' INT TERM

# Run main function
main "$@"
