# SAR-META-WORLD Backup System

## Overview

The backup system provides secure, on-demand local and cloud backup capabilities for your platform's databases and configuration files.

## Features

- **Local Backup**: Secure database dumps stored locally
- **Cloud Backup**: Automatic upload to AWS S3 (configurable)
- **On-Demand Triggers**: UI buttons and API endpoints
- **Multiple Database Support**: PostgreSQL, Redis, InfluxDB, Mosquitto
- **Compression & Verification**: Automatic compression and integrity checks
- **Cleanup**: Automatic removal of old backups

## Setup

### 1. Environment Variables

Create a `.env` file in the backend directory:

```bash
# AWS S3 Configuration (for cloud backup)
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_BUCKET_NAME=your-s3-bucket-name
AWS_REGION=us-east-1

# Database Configuration
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=your_database
POSTGRES_USER=your_username
POSTGRES_PASSWORD=your_password

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password
```

### 2. AWS S3 Setup (for cloud backup)

1. Create an S3 bucket for backups
2. Configure bucket permissions
3. Create IAM user with S3 access
4. Add credentials to environment variables

### 3. Install Dependencies

```bash
cd react-app/react-app/backend
npm install
```

## Usage

### Manual Backup (Command Line)

**Local Backup:**
```bash
cd react-app/react-app/docker-compose/scripts
bash backup.sh
```

**Cloud Backup:**
```bash
cd react-app/react-app/docker-compose/scripts
bash backup.sh cloud
```

### API Backup (Programmatic)

**Local Backup:**
```bash
curl -X POST http://localhost:3000/api/backup \
  -H "Content-Type: application/json" \
  -d '{"mode": "local"}'
```

**Cloud Backup:**
```bash
curl -X POST http://localhost:3000/api/backup \
  -H "Content-Type: application/json" \
  -d '{"mode": "cloud"}'
```

### UI Backup (Dashboard)

1. Navigate to the Admin Controls section
2. Click "💾 Local Backup" or "☁️ Cloud Backup"
3. Monitor the status in the System Monitor

## Backup Contents

The backup system creates a compressed archive containing:

- **PostgreSQL**: Complete database dump
- **Redis**: Database dump and configuration
- **InfluxDB**: Time-series data and configuration
- **Mosquitto**: MQTT broker configuration and data
- **System Files**: Configuration files and logs

## Backup Locations

### Local Backups
- **Location**: `/backups/` directory
- **Format**: `full_backup_YYYY-MM-DD_HH-MM-SS.tar.gz`
- **Retention**: 7 days (configurable)

### Cloud Backups
- **Location**: AWS S3 bucket
- **Path**: `s3://your-bucket/backups/full_backup_YYYY-MM-DD_HH-MM-SS.tar.gz`
- **Retention**: 30 days (configurable)

## Restore Process

### Local Restore

1. Stop all services:
```bash
docker-compose down
```

2. Extract backup:
```bash
cd react-app/react-app/docker-compose/scripts
tar -xzf /backups/full_backup_YYYY-MM-DD_HH-MM-SS.tar.gz
```

3. Restore databases:
```bash
# PostgreSQL
psql -h localhost -U your_username -d your_database < postgres_backup.sql

# Redis
redis-cli -h localhost -p 6379 < redis_backup.txt

# InfluxDB
influx restore -database your_database influx_backup
```

4. Restart services:
```bash
docker-compose up -d
```

### Cloud Restore

1. Download from S3:
```bash
aws s3 cp s3://your-bucket/backups/full_backup_YYYY-MM-DD_HH-MM-SS.tar.gz ./
```

2. Follow local restore steps 2-4 above.

## Monitoring

### Backup Status

Check backup status in the System Monitor:
- Last backup time
- Backup status (success/failed)
- Next scheduled backup

### Logs

Backup logs are available in:
- **Script logs**: `/var/log/backup.log`
- **Application logs**: Backend console output
- **Docker logs**: `docker-compose logs backup-service`

## Troubleshooting

### Common Issues

**1. Permission Denied**
```bash
chmod +x react-app/react-app/docker-compose/scripts/backup.sh
```

**2. AWS Credentials Error**
- Verify environment variables
- Check IAM permissions
- Test with AWS CLI

**3. Database Connection Error**
- Verify database is running
- Check connection parameters
- Ensure proper permissions

**4. Insufficient Disk Space**
- Clean old backups: `find /backups -name "*.tar.gz" -mtime +7 -delete`
- Check available space: `df -h`

### Error Codes

- **0**: Success
- **1**: General error
- **2**: Database connection failed
- **3**: AWS S3 upload failed
- **4**: Insufficient disk space
- **5**: Compression failed

## Security

### Best Practices

1. **Encryption**: All backups are encrypted at rest
2. **Access Control**: Limit backup access to authorized users
3. **Network Security**: Use VPN for cloud backups
4. **Audit Logs**: All backup operations are logged
5. **Regular Testing**: Test restore process monthly

### Backup Verification

```bash
# Verify backup integrity
cd react-app/react-app/docker-compose/scripts
bash backup.sh verify /backups/full_backup_YYYY-MM-DD_HH-MM-SS.tar.gz
```

## Configuration

### Backup Schedule

Edit `react-app/react-app/docker-compose/scripts/backup.sh`:

```bash
# Retention settings
LOCAL_RETENTION_DAYS=7
CLOUD_RETENTION_DAYS=30

# Compression settings
COMPRESSION_LEVEL=9
```

### API Configuration

Edit `react-app/react-app/backend/src/routes/backup.js`:

```javascript
// Add authentication middleware
router.post('/', requireAuth, backupHandler);
```

## Support

For issues or questions:
1. Check logs for error details
2. Verify configuration settings
3. Test with manual backup first
4. Contact system administrator

## Changelog

- **v1.0.0**: Initial backup system
- **v1.1.0**: Added cloud backup support
- **v1.2.0**: Added UI integration
- **v1.3.0**: Added monitoring and status tracking 