#!/bin/bash

# System Hardening Script for SAR Meta World Infrastructure
# This script implements various security hardening measures for the Docker environment

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1"
}

# Check if running as root (not recommended for macOS)
check_privileges() {
    if [[ $EUID -eq 0 ]]; then
        warn "Running as root. This is not recommended for macOS systems."
        warn "Consider running as a regular user with sudo privileges."
    fi
}

# Update system packages (macOS)
update_system() {
    log "Checking for system updates..."
    
    if command -v brew &> /dev/null; then
        log "Updating Homebrew packages..."
        brew update
        brew upgrade
        brew cleanup
    else
        warn "Homebrew not found. Consider installing for package management."
    fi
    
    # Update macOS system (requires user interaction)
    log "Checking for macOS updates..."
    softwareupdate -l
}

# Configure Docker security settings
configure_docker_security() {
    log "Configuring Docker security settings..."
    
    # Check if Docker is running
    if ! docker info &> /dev/null; then
        error "Docker is not running. Please start Docker and try again."
        return 1
    fi
    
    # Create Docker daemon configuration
    local docker_config="/etc/docker/daemon.json"
    
    if [[ ! -f "$docker_config" ]]; then
        log "Creating Docker daemon configuration..."
        sudo mkdir -p /etc/docker
        sudo tee "$docker_config" > /dev/null <<EOF
{
    "live-restore": true,
    "userland-proxy": false,
    "no-new-privileges": true,
    "seccomp-profile": "/etc/docker/seccomp.json",
    "log-driver": "json-file",
    "log-opts": {
        "max-size": "10m",
        "max-file": "3"
    },
    "storage-driver": "overlay2",
    "storage-opts": [
        "overlay2.override_kernel_check=true"
    ],
    "default-ulimits": {
        "nofile": {
            "Name": "nofile",
            "Hard": 64000,
            "Soft": 64000
        }
    },
    "experimental": false,
    "features": {
        "buildkit": true
    }
}
EOF
    else
        log "Docker daemon configuration already exists at $docker_config"
    fi
}

# Generate strong DH parameters for SSL
generate_dhparam() {
    local dhparam_file="config/nginx/ssl/dhparam.pem"
    
    if [[ ! -f "$dhparam_file" ]]; then
        log "Generating Diffie-Hellman parameters (this may take several minutes)..."
        openssl dhparam -out "$dhparam_file" 2048
        chmod 600 "$dhparam_file"
        log "DH parameters generated successfully"
    else
        log "DH parameters already exist"
    fi
}

# Create SSL certificates with proper security
create_ssl_certificates() {
    log "Checking SSL certificates..."
    
    local ssl_dir="config/nginx/ssl"
    local cert_file="$ssl_dir/localhost.crt"
    local key_file="$ssl_dir/localhost.key"
    
    if [[ ! -f "$cert_file" || ! -f "$key_file" ]]; then
        log "Creating new SSL certificates..."
        
        # Create SSL directory
        mkdir -p "$ssl_dir"
        
        # Generate private key
        openssl genrsa -out "$key_file" 2048
        
        # Generate certificate signing request
        openssl req -new -key "$key_file" -out "$ssl_dir/localhost.csr" -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"
        
        # Generate self-signed certificate
        openssl x509 -req -in "$ssl_dir/localhost.csr" -signkey "$key_file" -out "$cert_file" -days 365 -extensions v3_req -extfile <(
            echo '[v3_req]'
            echo 'basicConstraints = CA:FALSE'
            echo 'keyUsage = nonRepudiation, digitalSignature, keyEncipherment'
            echo 'subjectAltName = @alt_names'
            echo '[alt_names]'
            echo 'DNS.1 = localhost'
            echo 'DNS.2 = *.localhost'
            echo 'IP.1 = 127.0.0.1'
            echo 'IP.2 = ::1'
        )
        
        # Set proper permissions
        chmod 600 "$key_file"
        chmod 644 "$cert_file"
        
        # Clean up CSR
        rm -f "$ssl_dir/localhost.csr"
        
        log "SSL certificates created successfully"
    else
        log "SSL certificates already exist"
        
        # Check certificate expiry
        local expiry_date=$(openssl x509 -in "$cert_file" -noout -enddate | cut -d= -f2)
        log "Certificate expires on: $expiry_date"
    fi
}

# Configure container security
configure_container_security() {
    log "Configuring container security settings..."
    
    # Create seccomp profile
    local seccomp_profile="/etc/docker/seccomp.json"
    
    if [[ ! -f "$seccomp_profile" ]]; then
        log "Creating Docker seccomp profile..."
        sudo tee "$seccomp_profile" > /dev/null <<'EOF'
{
    "defaultAction": "SCMP_ACT_ERRNO",
    "archMap": [
        {
            "architecture": "SCMP_ARCH_X86_64",
            "subArchitectures": [
                "SCMP_ARCH_X86",
                "SCMP_ARCH_X32"
            ]
        }
    ],
    "syscalls": [
        {
            "names": [
                "accept",
                "accept4",
                "access",
                "alarm",
                "bind",
                "brk",
                "chdir",
                "chmod",
                "chown",
                "close",
                "connect",
                "creat",
                "dup",
                "dup2",
                "execve",
                "exit",
                "exit_group",
                "fcntl",
                "fork",
                "fstat",
                "fsync",
                "getdents",
                "getgid",
                "getpid",
                "getppid",
                "gettimeofday",
                "getuid",
                "listen",
                "lseek",
                "lstat",
                "mkdir",
                "mmap",
                "munmap",
                "open",
                "poll",
                "read",
                "readlink",
                "rename",
                "rmdir",
                "select",
                "socket",
                "stat",
                "unlink",
                "wait4",
                "write"
            ],
            "action": "SCMP_ACT_ALLOW"
        }
    ]
}
EOF
    else
        log "Docker seccomp profile already exists"
    fi
}

# Configure network security
configure_network_security() {
    log "Configuring network security..."
    
    # Check if UFW is available (not on macOS by default)
    if command -v ufw &> /dev/null; then
        log "Configuring UFW firewall..."
        sudo ufw --force enable
        sudo ufw default deny incoming
        sudo ufw default allow outgoing
        sudo ufw allow 22/tcp
        sudo ufw allow 80/tcp
        sudo ufw allow 443/tcp
        sudo ufw allow 3443/tcp
        sudo ufw allow 8443/tcp
        sudo ufw allow 9443/tcp
    else
        warn "UFW not available. Using macOS Application Firewall instead."
        
        # Enable macOS Application Firewall
        sudo /usr/libexec/ApplicationFirewall/socketfilterfw --setglobalstate on
        sudo /usr/libexec/ApplicationFirewall/socketfilterfw --setloggingmode on
        sudo /usr/libexec/ApplicationFirewall/socketfilterfw --setstealthmode on
        
        log "macOS Application Firewall configured"
    fi
    
    # Configure Docker network isolation
    log "Configuring Docker network isolation..."
    
    # Create custom networks if they don't exist
    if ! docker network ls | grep -q "backend"; then
        docker network create --driver bridge --subnet=172.21.0.0/16 backend
        log "Created backend network"
    fi
    
    if ! docker network ls | grep -q "frontend"; then
        docker network create --driver bridge frontend
        log "Created frontend network"
    fi
}

# Configure logging and monitoring
configure_logging() {
    log "Configuring logging and monitoring..."
    
    # Create logs directory structure
    mkdir -p logs/{nginx,postgres,redis,influxdb,grafana,prometheus,backend,frontend}
    
    # Set proper permissions
    chmod 755 logs
    chmod 755 logs/*
    
    # Create log rotation configuration
    cat > logs/logrotate.conf <<EOF
logs/nginx/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 root root
    postrotate
        docker exec nginx-proxy nginx -s reload
    endscript
}

logs/postgres/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 postgres postgres
}

logs/redis/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 redis redis
}
EOF
    
    log "Logging configuration created"
}

# Set up backup procedures
setup_backup() {
    log "Setting up backup procedures..."
    
    # Create backup directory
    mkdir -p backups/{postgres,redis,influxdb,config}
    
    # Create backup script
    cat > scripts/backup.sh <<'EOF'
#!/bin/bash

# Backup script for SAR Meta World Infrastructure
BACKUP_DIR="backups"
DATE=$(date +%Y%m%d_%H%M%S)

# PostgreSQL backup
docker exec postgres-db pg_dumpall -U postgres > "$BACKUP_DIR/postgres/full_backup_$DATE.sql"

# Redis backup
docker exec redis-cache redis-cli --rdb "$BACKUP_DIR/redis/dump_$DATE.rdb"

# InfluxDB backup
docker exec influxdb-tsdb influx backup --all "$BACKUP_DIR/influxdb/backup_$DATE"

# Configuration backup
tar -czf "$BACKUP_DIR/config/config_backup_$DATE.tar.gz" config/

# Clean up old backups (keep last 7 days)
find "$BACKUP_DIR" -name "*.sql" -mtime +7 -delete
find "$BACKUP_DIR" -name "*.rdb" -mtime +7 -delete
find "$BACKUP_DIR" -name "*.tar.gz" -mtime +7 -delete
find "$BACKUP_DIR" -type d -name "backup_*" -mtime +7 -exec rm -rf {} +

echo "Backup completed successfully"
EOF
    
    chmod +x scripts/backup.sh
    
    log "Backup procedures configured"
}

# Configure resource limits
configure_resource_limits() {
    log "Configuring resource limits..."
    
    # Create systemd drop-in directory for Docker (if systemd is available)
    if command -v systemctl &> /dev/null; then
        sudo mkdir -p /etc/systemd/system/docker.service.d
        
        cat > /tmp/docker-limits.conf <<EOF
[Service]
LimitNOFILE=1048576
LimitNPROC=1048576
LimitCORE=infinity
EOF
        
        sudo mv /tmp/docker-limits.conf /etc/systemd/system/docker.service.d/
        sudo systemctl daemon-reload
        
        log "Docker resource limits configured"
    else
        warn "systemd not available. Resource limits may need manual configuration."
    fi
}

# Main hardening function
main() {
    log "Starting system hardening process..."
    
    # Check if in correct directory
    if [[ ! -f "docker-compose.yml" ]]; then
        error "Please run this script from the docker directory"
        exit 1
    fi
    
    check_privileges
    update_system
    configure_docker_security
    generate_dhparam
    create_ssl_certificates
    configure_container_security
    configure_network_security
    configure_logging
    setup_backup
    configure_resource_limits
    
    log "System hardening completed successfully!"
    log "Next steps:"
    log "1. Restart Docker daemon: sudo systemctl restart docker (Linux) or restart Docker Desktop (macOS)"
    log "2. Update docker-compose.yml to use the new nginx.prod.conf"
    log "3. Test SSL connections on ports 443, 3443, 8443, and 9443"
    log "4. Set up regular backup schedule using scripts/backup.sh"
    log "5. Monitor logs in the logs/ directory"
}

# Run main function
main "$@"
