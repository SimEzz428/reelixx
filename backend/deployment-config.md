# deployment-config.md
# Production Environment Variables for AWS Deployment

## Required Environment Variables

### Database
```
DATABASE_URL=postgresql://username:password@your-rds-endpoint:5432/reelixx
```

### AWS Configuration
```
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
S3_BUCKET_NAME=reelixx-storage
```

### OpenAI (Optional - enables AI features)
```
OPENAI_API_KEY=your-openai-key
```

### Application Settings
```
REELIXX_FREE_MODE=0
PYTHONPATH=/app
PYTHONUNBUFFERED=1
```

### Security
```
SECRET_KEY=your-secret-key-for-sessions
CORS_ORIGINS=https://your-vercel-app.vercel.app,https://your-domain.com
```

## AWS Free Tier Setup

1. **EC2 Instance**: t2.micro (750 hours/month)
2. **RDS PostgreSQL**: db.t3.micro (750 hours/month, 20GB storage)
3. **S3 Bucket**: 5GB storage + 20,000 requests
4. **Route 53**: Hosted zone (not free, use EC2 public IP)

## Deployment Steps

1. Create EC2 instance (Ubuntu 22.04 LTS)
2. Create RDS PostgreSQL instance
3. Create S3 bucket
4. Deploy Docker container to EC2
5. Configure environment variables
6. Set up domain/SSL (optional)
