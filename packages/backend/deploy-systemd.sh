#!/bin/bash

# Deploy script for setting up backend API with systemd
# This script should be run with sudo privileges

set -e

echo "🚀 Deploying Backend API with systemd..."

# Configuration
SERVICE_NAME="backend-api"
SERVICE_USER="nodejs"
SERVICE_GROUP="nodejs"
APP_DIR="/opt/backend-api"
SERVICE_FILE="/etc/systemd/system/${SERVICE_NAME}.service"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   echo -e "${RED}❌ This script must be run as root${NC}"
   exit 1
fi

# Create service user if it doesn't exist
if ! id "$SERVICE_USER" &>/dev/null; then
    echo -e "${YELLOW}👤 Creating service user: $SERVICE_USER${NC}"
    useradd --system --shell /bin/false --home-dir "$APP_DIR" --create-home "$SERVICE_USER"
fi

# Create application directory
echo -e "${YELLOW}📁 Creating application directory: $APP_DIR${NC}"
mkdir -p "$APP_DIR"
mkdir -p "$APP_DIR/logs"

# Copy application files
echo -e "${YELLOW}📋 Copying application files...${NC}"
cp -r . "$APP_DIR/"
chown -R "$SERVICE_USER:$SERVICE_GROUP" "$APP_DIR"

# Install Node.js dependencies
echo -e "${YELLOW}📦 Installing dependencies...${NC}"
cd "$APP_DIR"
sudo -u "$SERVICE_USER" npm ci --only=production

# Install PM2 globally if not already installed
if ! command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}⚙️ Installing PM2 globally...${NC}"
    npm install -g pm2
fi

# Copy systemd service file
echo -e "${YELLOW}🔧 Installing systemd service...${NC}"
cp "$SERVICE_NAME.service" "$SERVICE_FILE"

# Reload systemd and enable the service
echo -e "${YELLOW}🔄 Reloading systemd daemon...${NC}"
systemctl daemon-reload

# Enable the service to start on boot
echo -e "${YELLOW}✅ Enabling service to start on boot...${NC}"
systemctl enable "$SERVICE_NAME"

# Start the service
echo -e "${YELLOW}▶️ Starting service...${NC}"
systemctl start "$SERVICE_NAME"

# Check service status
echo -e "${YELLOW}📊 Checking service status...${NC}"
if systemctl is-active --quiet "$SERVICE_NAME"; then
    echo -e "${GREEN}✅ Service is running successfully!${NC}"
    systemctl status "$SERVICE_NAME" --no-pager
else
    echo -e "${RED}❌ Service failed to start${NC}"
    systemctl status "$SERVICE_NAME" --no-pager
    exit 1
fi

echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo ""
echo "Service management commands:"
echo "  Start:   systemctl start $SERVICE_NAME"
echo "  Stop:    systemctl stop $SERVICE_NAME"
echo "  Restart: systemctl restart $SERVICE_NAME"
echo "  Status:  systemctl status $SERVICE_NAME"
echo "  Logs:    journalctl -u $SERVICE_NAME -f"
echo ""
echo "PM2 management commands:"
echo "  Status:  sudo -u $SERVICE_USER pm2 status"
echo "  Logs:    sudo -u $SERVICE_USER pm2 logs"
echo "  Restart: sudo -u $SERVICE_USER pm2 restart ecosystem.config.js"
echo ""
echo "Service is accessible at: http://localhost:3001"
