#!/bin/bash
# startup.sh - EC2 startup script for Reelixx

set -e

echo "🚀 Starting Reelixx Backend..."

# Update system
sudo apt update
sudo apt upgrade -y

# Install Docker
sudo apt install docker.io -y
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Create app directory
mkdir -p /home/ubuntu/reelixx
cd /home/ubuntu/reelixx

# Clone repository (replace with your repo)
git clone https://github.com/your-username/reelixx.git .

# Set up environment
cd backend
cp .env.production.template .env.production
echo "⚠️  Please edit .env.production with your actual values"

# Build and run
docker build -t reelixx-backend .
docker run -d \
    --name reelixx-backend \
    --restart unless-stopped \
    -p 8000:8000 \
    --env-file .env.production \
    reelixx-backend

echo "✅ Reelixx Backend started!"
echo "🌐 API available at: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):8000"
echo "📊 Health check: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):8000/health"
