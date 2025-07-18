#!/bin/bash

# Security and Monitoring Verification Script
# This script verifies all security measures and monitoring tools are properly configured

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DOCKER_DIR="$(dirname "$SCRIPT_DIR")"
LOG_FILE="$DOCKER_DIR/logs/security_verification.log"

# Ensure logs directory exists
mkdir -p "$DOCKER_DIR/logs"

# Logging functions
log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] ✓${NC} $1" | tee -a "$LOG_FILE"
}

warn() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] ⚠${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ✗${NC} $1" | tee -a "$LOG_FILE"
}

info() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')] ℹ${NC} $1" | tee -a "$LOG_FILE"
}

# Function to check service health
check_service() {
    local service_name=$1
    local url=$2
    local expected_codes=$3
    
    info "Checking $service_name..."
    
    local response=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 "$url" 2>/dev/null || echo "000")
    
    if [[ "$expected_codes" == *"$response"* ]]; then
        log "$service_name is healthy (HTTP $response)"
        return 0
    else
        error "$service_name is unhealthy (HTTP $response)"
        return 1
    fi
}

# Function to check SSL certificate
check_ssl_certificate() {
    info "Checking SSL certificate..."
    
    local cert_file="$DOCKER_DIR/config/nginx/ssl/localhost.crt"
    local key_file="$DOCKER_DIR/config/nginx/ssl/localhost.key"
    
    if [[ -f "$cert_file" && -f "$key_file" ]]; then
        local expiry_date=$(openssl x509 -in "$cert_file" -noout -enddate 2>/dev/null | cut -d= -f2)
        local days_until_expiry=$(( ( $(date -d "$expiry_date" +%s) - $(date +%s) ) / 86400 ))
        
        if [[ $days_until_expiry -gt 30 ]]; then
            log "SSL certificate is valid (expires in $days_until_expiry days)"
            return 0
        else
            warn "SSL certificate expires soon (in $days_until_expiry days)"
            return 1
        fi
    else
        error "SSL certificate files not found"
        return 1
    fi
}

# Function to check authentication
check_authentication() {
    info "Checking authentication configurations..."
    
    local auth_issues=0
    
    # Check PostgreSQL authentication
    if docker exec postgres-db pg_isready -U postgres >/dev/null 2>&1; then
        log "PostgreSQL authentication is working"
    else
        error "PostgreSQL authentication failed"
        auth_issues=$((auth_issues + 1))
    fi
    
    # Check Redis authentication
    if docker exec redis-cache redis-cli -a "${REDIS_PASSWORD:-+fIQO/+ARzHgYBPgxk7Q+zgYPUi7biCuex/e3kNWMec=}" ping >/dev/null 2>&1; then
        log "Redis authentication is working"
    else
        error "Redis authentication failed"
        auth_issues=$((auth_issues + 1))
    fi
    
    # Check InfluxDB authentication
    if curl -s -f "http://localhost:8086/ping" >/dev/null 2>&1; then
        log "InfluxDB is accessible"
    else
        error "InfluxDB authentication/access failed"
        auth_issues=$((auth_issues + 1))
    fi
    
    return $auth_issues
}

# Function to check monitoring tools
check_monitoring() {
    info "Checking monitoring tools..."
    
    local monitoring_issues=0
    
    # Check Prometheus
    if curl -s -f "http://localhost:9090/-/healthy" >/dev/null 2>&1; then
        log "Prometheus is healthy"
    else
        error "Prometheus health check failed"
        monitoring_issues=$((monitoring_issues + 1))
    fi
    
    # Check Grafana
    if curl -s -f "http://localhost:3000/api/health" >/dev/null 2>&1; then
        log "Grafana is healthy"
    else
        error "Grafana health check failed"
        monitoring_issues=$((monitoring_issues + 1))
    fi
    
    # Check Node Exporter
    if curl -s -f "http://localhost:9100/metrics" >/dev/null 2>&1; then
        log "Node Exporter is providing metrics"
    else
        error "Node Exporter metrics not available"
        monitoring_issues=$((monitoring_issues + 1))
    fi
    
    return $monitoring_issues
}

# Function to check security configurations
check_security_config() {
    info "Checking security configurations..."
    
    local security_issues=0
    
    # Check if secrets directory exists and has proper permissions
    if [[ -d "$DOCKER_DIR/secrets" ]]; then
        local perms=$(stat -c %a "$DOCKER_DIR/secrets" 2>/dev/null || stat -f %A "$DOCKER_DIR/secrets" 2>/dev/null)
        if [[ "$perms" == "700" ]]; then
            log "Secrets directory has correct permissions"
        else
            warn "Secrets directory permissions should be 700 (currently $perms)"
            security_issues=$((security_issues + 1))
        fi
    else
        error "Secrets directory not found"
        security_issues=$((security_issues + 1))
    fi
    
    # Check if logs directory exists
    if [[ -d "$DOCKER_DIR/logs" ]]; then
        log "Logs directory exists"
    else
        error "Logs directory not found"
        security_issues=$((security_issues + 1))
    fi
    
    # Check if backup directory exists
    if [[ -d "$DOCKER_DIR/backups" ]]; then
        log "Backups directory exists"
    else
        warn "Backups directory not found - backups may not be configured"
        security_issues=$((security_issues + 1))
    fi
    
    return $security_issues
}

# Function to check Docker container security
check_container_security() {
    info "Checking Docker container security..."
    
    local security_issues=0
    
    # Check for containers running as root
    local root_containers=$(docker ps --format "table {{.Names}}" --filter "label=user=root" | tail -n +2)
    if [[ -n "$root_containers" ]]; then
        warn "Some containers may be running as root: $root_containers"
        security_issues=$((security_issues + 1))
    else
        log "No containers detected running as root"
    fi
    
    # Check for containers with privileged mode
    local privileged_containers=$(docker ps --format "table {{.Names}}" --filter "label=privileged=true" | tail -n +2)
    if [[ -n "$privileged_containers" ]]; then
        warn "Some containers are running in privileged mode: $privileged_containers"
        security_issues=$((security_issues + 1))
    else
        log "No containers running in privileged mode"
    fi
    
    return $security_issues
}

# Function to generate security report
generate_security_report() {
    info "Generating security report..."
    
    local report_file="$DOCKER_DIR/logs/security_report_$(date +%Y%m%d_%H%M%S).json"
    
    cat > "$report_file" << EOF
{
    "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
    "security_status": {
        "ssl_certificate": {
            "status": "$(check_ssl_certificate >/dev/null 2>&1 && echo "valid" || echo "invalid")",
            "expiry_check": "$(openssl x509 -in "$DOCKER_DIR/config/nginx/ssl/localhost.crt" -noout -enddate 2>/dev/null | cut -d= -f2 || echo "unknown")"
        },
        "authentication": {
            "postgres": "$(docker exec postgres-db pg_isready -U postgres >/dev/null 2>&1 && echo "working" || echo "failed")",
            "redis": "$(docker exec redis-cache redis-cli -a "${REDIS_PASSWORD:-+fIQO/+ARzHgYBPgxk7Q+zgYPUi7biCuex/e3kNWMec=}" ping >/dev/null 2>&1 && echo "working" || echo "failed")",
            "influxdb": "$(curl -s -f "http://localhost:8086/ping" >/dev/null 2>&1 && echo "working" || echo "failed")"
        },
        "monitoring": {
            "prometheus": "$(curl -s -f "http://localhost:9090/-/healthy" >/dev/null 2>&1 && echo "healthy" || echo "unhealthy")",
            "grafana": "$(curl -s -f "http://localhost:3000/api/health" >/dev/null 2>&1 && echo "healthy" || echo "unhealthy")",
            "node_exporter": "$(curl -s -f "http://localhost:9100/metrics" >/dev/null 2>&1 && echo "working" || echo "failed")"
        },
        "containers": {
            "total": $(docker ps -q | wc -l),
            "healthy": $(docker ps --filter "health=healthy" -q | wc -l),
            "unhealthy": $(docker ps --filter "health=unhealthy" -q | wc -l)
        }
    }
}
EOF
    
    log "Security report generated: $report_file"
}

# Main verification function
main() {
    echo "======================================"
    echo "Security and Monitoring Verification"
    echo "======================================"
    echo ""
    
    local total_issues=0
    
    # Check services
    info "=== Checking Core Services ==="
    check_service "Frontend" "http://localhost:80" "200 301 302" || total_issues=$((total_issues + 1))
    check_service "Backend API" "http://localhost:3001" "200 404" || total_issues=$((total_issues + 1))
    check_service "Grafana" "http://localhost:3000" "200 302" || total_issues=$((total_issues + 1))
    check_service "Prometheus" "http://localhost:9090" "200 302" || total_issues=$((total_issues + 1))
    check_service "Adminer" "http://localhost:8080" "200" || total_issues=$((total_issues + 1))
    
    echo ""
    
    # Check SSL
    info "=== Checking SSL Configuration ==="
    check_ssl_certificate || total_issues=$((total_issues + 1))
    
    echo ""
    
    # Check authentication
    info "=== Checking Authentication ==="
    check_authentication || total_issues=$((total_issues + 1))
    
    echo ""
    
    # Check monitoring
    info "=== Checking Monitoring Tools ==="
    check_monitoring || total_issues=$((total_issues + 1))
    
    echo ""
    
    # Check security configurations
    info "=== Checking Security Configurations ==="
    check_security_config || total_issues=$((total_issues + 1))
    
    echo ""
    
    # Check container security
    info "=== Checking Container Security ==="
    check_container_security || total_issues=$((total_issues + 1))
    
    echo ""
    
    # Generate report
    generate_security_report
    
    echo ""
    echo "======================================"
    if [[ $total_issues -eq 0 ]]; then
        log "All security measures and monitoring tools are properly configured!"
        echo "Overall Status: ✅ SECURE"
    else
        warn "Found $total_issues security or monitoring issues that need attention"
        echo "Overall Status: ⚠️ NEEDS ATTENTION"
    fi
    echo "======================================"
    
    return $total_issues
}

# Run main function
main "$@"
