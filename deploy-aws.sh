#!/bin/bash
# deploy-aws.sh - Deployment script for AWS EC2

set -e

echo "🚀 Deploying Reelixx to AWS..."

# Check if required environment variables are set
if [ -z "$AWS_ACCESS_KEY_ID" ]; then
    echo "❌ AWS_ACCESS_KEY_ID not set"
    exit 1
fi

if [ -z "$AWS_SECRET_ACCESS_KEY" ]; then
    echo "❌ AWS_SECRET_ACCESS_KEY not set"
    exit 1
fi

if [ -z "$EC2_HOST" ]; then
    echo "❌ EC2_HOST not set (e.g., ec2-user@your-instance.amazonaws.com)"
    exit 1
fi

if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL not set"
    exit 1
fi

# Build Docker image
echo "📦 Building Docker image..."
cd backend
docker build -t reelixx-backend .

# Save image to tar file
echo "💾 Saving Docker image..."
docker save reelixx-backend -o reelixx-backend.tar

# Upload to EC2
echo "⬆️ Uploading to EC2..."
scp -i ~/.ssh/your-key.pem reelixx-backend.tar $EC2_HOST:~/
scp -i ~/.ssh/your-key.pem .env.production $EC2_HOST:~/

# Deploy on EC2
echo "🔧 Deploying on EC2..."
ssh -i ~/.ssh/your-key.pem $EC2_HOST << 'EOF'
    # Load Docker image
    docker load -i reelixx-backend.tar
    
    # Stop existing container
    docker stop reelixx-backend || true
    docker rm reelixx-backend || true
    
    # Run new container
    docker run -d \
        --name reelixx-backend \
        --restart unless-stopped \
        -p 8000:8000 \
        --env-file .env.production \
        reelixx-backend
    
    # Clean up
    rm reelixx-backend.tar
    
    echo "✅ Deployment complete!"
    echo "🌐 API available at: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):8000"
EOF

echo "🎉 Deployment successful!"
