# Secrets Management

This directory contains sensitive credential files for production deployment.

## Security Guidelines

1. **File Permissions**: All secret files should have restricted permissions (600)
2. **Never Commit**: Never commit these files to version control
3. **Backup Securely**: Store backups in secure, encrypted storage
4. **Rotate Regularly**: Change passwords and tokens regularly

## Required Secret Files

Create the following files with secure content:

### Database Credentials
- `postgres_password.txt` - PostgreSQL admin password
- `postgres_replication_password.txt` - PostgreSQL replication password

### Service Credentials
- `redis_password.txt` - Redis authentication password
- `influxdb_admin_token.txt` - InfluxDB admin token
- `grafana_admin_password.txt` - Grafana admin password

### Application Secrets
- `jwt_secret.txt` - JWT signing secret
- `session_secret.txt` - Session encryption secret
- `smtp_password.txt` - SMTP authentication password

### SSL Certificates
- `ssl_cert.pem` - SSL certificate
- `ssl_key.pem` - SSL private key

## Example Commands

Generate secure passwords:
```bash
# Generate 32-character password
openssl rand -base64 32 > postgres_password.txt

# Generate JWT secret
openssl rand -hex 32 > jwt_secret.txt

# Generate session secret
openssl rand -base64 64 > session_secret.txt

# Set proper permissions
chmod 600 *.txt *.pem
```

## Usage in Docker Compose

These secrets are automatically mounted to containers using Docker secrets:

```yaml
services:
  postgres:
    secrets:
      - postgres_password
    environment:
      POSTGRES_PASSWORD_FILE: /run/secrets/postgres_password
```
