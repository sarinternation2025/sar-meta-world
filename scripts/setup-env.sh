#!/bin/bash

# SAR Meta World Environment Setup Script
# This script helps set up environment variables for all packages

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_color() {
    printf "${1}${2}${NC}\n"
}

# Function to generate secure password
generate_password() {
    openssl rand -base64 32 | tr -d "=+/" | cut -c1-25
}

# Function to generate JWT secret
generate_jwt_secret() {
    openssl rand -hex 32
}

# Function to generate InfluxDB token
generate_influxdb_token() {
    openssl rand -hex 16
}

print_color $BLUE "=== SAR Meta World Environment Setup ==="
echo

# Check if .env.example files exist
print_color $BLUE "Checking for .env.example files..."

packages=("backend" "frontend" "cli-agent" "react-app")
docker_dir="docker"

for package in "${packages[@]}"; do
    example_file="packages/${package}/.env.example"
    env_file="packages/${package}/.env"
    
    if [[ -f "$example_file" ]]; then
        print_color $GREEN "✓ Found $example_file"
        
        if [[ -f "$env_file" ]]; then
            print_color $YELLOW "⚠ $env_file already exists"
            read -p "Overwrite $env_file? (y/N): " -n 1 -r
            echo
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                print_color $YELLOW "Skipping $env_file"
                continue
            fi
        fi
        
        print_color $BLUE "Creating $env_file from template..."
        cp "$example_file" "$env_file"
        print_color $GREEN "✓ Created $env_file"
    else
        print_color $RED "✗ Missing $example_file"
    fi
done

# Handle docker directory
docker_example="docker/.env.example"
docker_env="docker/.env"

if [[ -f "$docker_example" ]]; then
    print_color $GREEN "✓ Found $docker_example"
    
    if [[ -f "$docker_env" ]]; then
        print_color $YELLOW "⚠ $docker_env already exists"
        read -p "Overwrite $docker_env? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            cp "$docker_example" "$docker_env"
            print_color $GREEN "✓ Created $docker_env"
        else
            print_color $YELLOW "Skipping $docker_env"
        fi
    else
        cp "$docker_example" "$docker_env"
        print_color $GREEN "✓ Created $docker_env"
    fi
else
    print_color $RED "✗ Missing $docker_example"
fi

echo

# Generate secure passwords and tokens
print_color $BLUE "Generating secure passwords and tokens..."

postgres_password=$(generate_password)
jwt_secret=$(generate_jwt_secret)
influxdb_token=$(generate_influxdb_token)
grafana_password=$(generate_password)
redis_commander_password=$(generate_password)

print_color $GREEN "✓ Generated secure credentials"

# Ask if user wants to automatically update passwords
print_color $BLUE "Do you want to automatically update the .env files with secure passwords?"
read -p "This will replace default passwords with generated ones (y/N): " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_color $BLUE "Updating .env files with secure credentials..."
    
    # Update backend .env
    if [[ -f "packages/backend/.env" ]]; then
        sed -i.bak "s/POSTGRES_PASSWORD=.*/POSTGRES_PASSWORD=$postgres_password/" packages/backend/.env
        sed -i.bak "s/JWT_SECRET=.*/JWT_SECRET=$jwt_secret/" packages/backend/.env
        sed -i.bak "s/INFLUXDB_TOKEN=.*/INFLUXDB_TOKEN=$influxdb_token/" packages/backend/.env
        print_color $GREEN "✓ Updated packages/backend/.env"
    fi
    
    # Update cli-agent .env
    if [[ -f "packages/cli-agent/.env" ]]; then
        sed -i.bak "s/POSTGRES_PASSWORD=.*/POSTGRES_PASSWORD=$postgres_password/" packages/cli-agent/.env
        print_color $GREEN "✓ Updated packages/cli-agent/.env"
    fi
    
    # Update docker .env
    if [[ -f "docker/.env" ]]; then
        sed -i.bak "s/POSTGRES_PASSWORD=.*/POSTGRES_PASSWORD=$postgres_password/" docker/.env
        sed -i.bak "s/GRAFANA_PASSWORD=.*/GRAFANA_PASSWORD=$grafana_password/" docker/.env
        sed -i.bak "s/INFLUXDB_ADMIN_TOKEN=.*/INFLUXDB_ADMIN_TOKEN=$influxdb_token/" docker/.env
        sed -i.bak "s/REDIS_COMMANDER_PASSWORD=.*/REDIS_COMMANDER_PASSWORD=$redis_commander_password/" docker/.env
        print_color $GREEN "✓ Updated docker/.env"
    fi
    
    # Clean up backup files
    find . -name "*.env.bak" -delete
    
    print_color $GREEN "✓ All .env files updated with secure credentials"
else
    print_color $YELLOW "Skipping automatic password updates"
    print_color $BLUE "Generated credentials for manual update:"
    echo "  PostgreSQL Password: $postgres_password"
    echo "  JWT Secret: $jwt_secret"
    echo "  InfluxDB Token: $influxdb_token"
    echo "  Grafana Password: $grafana_password"
    echo "  Redis Commander Password: $redis_commander_password"
fi

echo

# Summary
print_color $GREEN "=== Setup Complete ==="
print_color $BLUE "Environment files have been created. Next steps:"
echo "1. Review and customize the .env files in each package directory"
echo "2. Update any service URLs, ports, or other configuration as needed"
echo "3. For production deployment, update the production-specific variables"
echo "4. Read ENVIRONMENT_SETUP.md for detailed configuration guidance"
echo
print_color $YELLOW "Important: Never commit .env files to version control!"
print_color $YELLOW "Keep your production .env files secure and backed up safely."

echo
print_color $GREEN "Environment setup completed successfully!"
