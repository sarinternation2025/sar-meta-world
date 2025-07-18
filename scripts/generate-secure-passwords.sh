#!/bin/bash
# Generate Secure Passwords Script
# This script generates secure passwords for production deployment

set -euo pipefail

# Configuration
SECRETS_DIR="docker/secrets"
ENV_FILE="docker/.env.prod"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Function to generate secure password
generate_password() {
    local length=${1:-32}
    # Generate password with alphanumeric characters only (no special chars that could break env vars)
    openssl rand -base64 $((length * 3 / 4)) | tr -d "=+/" | cut -c1-${length}
}

# Function to generate hex token
generate_hex_token() {
    local length=${1:-32}
    openssl rand -hex $length
}

# Create secrets directory if it doesn't exist
mkdir -p "$SECRETS_DIR"

log "Generating secure passwords and tokens..."

# Generate individual passwords
POSTGRES_PASSWORD=$(generate_password 24)
POSTGRES_REPLICATION_PASSWORD=$(generate_password 24)
REDIS_PASSWORD=$(generate_password 24)
INFLUXDB_PASSWORD=$(generate_password 24)
GRAFANA_PASSWORD=$(generate_password 24)
REDIS_COMMANDER_PASSWORD=$(generate_password 24)
MQTT_PASSWORD=$(generate_password 24)
SMTP_PASSWORD=$(generate_password 24)

# Generate tokens
JWT_SECRET=$(generate_hex_token 32)
SESSION_SECRET=$(generate_hex_token 32)
INFLUXDB_ADMIN_TOKEN=$(generate_hex_token 32)

# Save to secret files
echo "$POSTGRES_PASSWORD" > "$SECRETS_DIR/postgres_password.txt"
echo "$POSTGRES_REPLICATION_PASSWORD" > "$SECRETS_DIR/postgres_replication_password.txt"
echo "$REDIS_PASSWORD" > "$SECRETS_DIR/redis_password.txt"
echo "$INFLUXDB_PASSWORD" > "$SECRETS_DIR/influxdb_password.txt"
echo "$GRAFANA_PASSWORD" > "$SECRETS_DIR/grafana_admin_password.txt"
echo "$REDIS_COMMANDER_PASSWORD" > "$SECRETS_DIR/redis_commander_password.txt"
echo "$MQTT_PASSWORD" > "$SECRETS_DIR/mqtt_password.txt"
echo "$SMTP_PASSWORD" > "$SECRETS_DIR/smtp_password.txt"
echo "$JWT_SECRET" > "$SECRETS_DIR/jwt_secret.txt"
echo "$SESSION_SECRET" > "$SECRETS_DIR/session_secret.txt"
echo "$INFLUXDB_ADMIN_TOKEN" > "$SECRETS_DIR/influxdb_admin_token.txt"

# Set proper permissions
chmod 600 "$SECRETS_DIR"/*.txt

log "Updating environment file with secure passwords..."

# Update .env.prod with generated passwords
cat > "$ENV_FILE" << EOF
# Production Docker Environment Configuration
# SECURITY WARNING: This file contains sensitive production credentials
# Ensure proper file permissions (600) and never commit to version control

# Database Configuration
POSTGRES_DB=sar_meta_world_prod
POSTGRES_USER=sar_admin
POSTGRES_PASSWORD=$POSTGRES_PASSWORD
POSTGRES_PORT=5432
POSTGRES_REPLICATION_USER=replicator
POSTGRES_REPLICATION_PASSWORD=$POSTGRES_REPLICATION_PASSWORD

# Redis Configuration
REDIS_PORT=6379
REDIS_PASSWORD=$REDIS_PASSWORD

# InfluxDB Configuration
INFLUXDB_USERNAME=influx_admin
INFLUXDB_PASSWORD=$INFLUXDB_PASSWORD
INFLUXDB_ORG=sar_meta_world_prod
INFLUXDB_BUCKET=production_metrics
INFLUXDB_RETENTION=90d
INFLUXDB_ADMIN_TOKEN=$INFLUXDB_ADMIN_TOKEN
INFLUXDB_PORT=8086

# Grafana Configuration
GRAFANA_USER=grafana_admin
GRAFANA_PASSWORD=$GRAFANA_PASSWORD
GRAFANA_PORT=3000

# Prometheus Configuration
PROMETHEUS_PORT=9090

# MQTT Configuration
MQTT_PORT=1883
MQTT_WS_PORT=9001
MQTT_USERNAME=mqtt_production_user
MQTT_PASSWORD=$MQTT_PASSWORD

# Nginx Configuration
NGINX_HTTP_PORT=8088
NGINX_HTTPS_PORT=443

# Adminer Configuration
ADMINER_PORT=8080

# Redis Commander Configuration
REDIS_COMMANDER_USER=redis_admin
REDIS_COMMANDER_PASSWORD=$REDIS_COMMANDER_PASSWORD
REDIS_COMMANDER_PORT=8081

# Exporters Configuration
NODE_EXPORTER_PORT=9100
REDIS_EXPORTER_PORT=9121
POSTGRES_EXPORTER_PORT=9187

# SSL Configuration (for production)
SSL_CERT_PATH=/certs/fullchain.pem
SSL_KEY_PATH=/certs/privkey.pem
SSL_ENABLED=true

# Backup Configuration
BACKUP_ENABLED=true
BACKUP_SCHEDULE=0 2 * * *
BACKUP_RETENTION_DAYS=30
BACKUP_S3_BUCKET=sar-meta-world-prod-backups
BACKUP_S3_REGION=us-east-1
# AWS Credentials for backup service
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_DEFAULT_REGION=us-east-1
AWS_S3_BUCKET=sar-meta-world-prod-backups

# Monitoring Configuration
MONITORING_ENABLED=true
ALERT_MANAGER_PORT=9093
ALERT_MANAGER_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL

# Network Configuration
NETWORK_NAME=sar-meta-world-prod
SUBNET=172.30.0.0/16

# Additional Security Settings
ENVIRONMENT=production
DEBUG=false
LOG_LEVEL=info
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Database Connection Pool Settings
POSTGRES_MAX_CONNECTIONS=200
POSTGRES_SHARED_BUFFERS=256MB
POSTGRES_WORK_MEM=4MB

# Redis Memory Settings
REDIS_MAXMEMORY=2gb
REDIS_MAXMEMORY_POLICY=allkeys-lru

# Session and JWT Configuration
SESSION_SECRET=$SESSION_SECRET
JWT_SECRET=$JWT_SECRET
JWT_EXPIRES_IN=24h

# Email Configuration (for alerts and notifications)
SMTP_HOST=smtp.yourdomain.com
SMTP_PORT=587
SMTP_SECURE=true
SMTP_USER=noreply@yourdomain.com
SMTP_PASSWORD=$SMTP_PASSWORD
EOF

# Set proper permissions
chmod 600 "$ENV_FILE"

log "Secure passwords generated and saved to:"
log "- Secret files: $SECRETS_DIR/*.txt"
log "- Environment file: $ENV_FILE"
warning "Please update placeholder values (AWS credentials, domains, etc.) with your actual values"
log "Run 'docker-compose -f docker-compose.prod.yml config --quiet' to validate configuration"
