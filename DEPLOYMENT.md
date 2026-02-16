# SoulSync Deployment Guide

## Overview

This guide covers deploying the SoulSync dating application to production environments using Docker and cloud platforms.

## Prerequisites

- Docker and Docker Compose
- Domain name (for production)
- SSL certificate (for HTTPS)
- MongoDB Atlas account (optional, for managed database)
- Redis Cloud account (optional, for managed cache)

## Quick Start with Docker

### 1. Clone and Setup

```bash
git clone <repository-url>
cd SoulSync
cp backend/.env.example backend/.env
```

### 2. Configure Environment Variables

Edit `backend/.env`:

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://mongo:27017/soulsync
REDIS_URL=redis://redis:6379
JWT_SECRET=your-256-bit-secret-key-here
CLIENT_URL=https://yourdomain.com
```

### 3. Deploy with Docker Compose

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down
```

## Production Deployment Options

### Option 1: AWS Deployment

#### Using EC2 + Docker

1. Launch EC2 instance (t3.medium recommended)
2. Install Docker and Docker Compose
3. Clone repository and run docker-compose
4. Configure Security Group (ports 80, 443, 5000)
5. Point domain to EC2 IP

#### Using ECS (Elastic Container Service)

1. Create ECS cluster
2. Define task definition for SoulSync
3. Create service with load balancer
4. Configure auto-scaling

### Option 2: Google Cloud Platform

#### Using Cloud Run

```bash
# Build and push to GCR
gcloud builds submit --tag gcr.io/PROJECT-ID/soulsync-backend

# Deploy to Cloud Run
gcloud run deploy soulsync-backend \
  --image gcr.io/PROJECT-ID/soulsync-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

### Option 3: DigitalOcean

#### Using App Platform

1. Connect GitHub repository
2. Select backend directory
3. Add environment variables
4. Configure MongoDB and Redis (managed databases)
5. Deploy

## Database Setup

### MongoDB Atlas (Recommended for Production)

1. Create cluster on MongoDB Atlas
2. Create database user
3. Whitelist IP addresses
4. Get connection string
5. Update `MONGODB_URI` in environment

### Redis Cloud (Recommended for Production)

1. Create Redis Cloud account
2. Create subscription
3. Get connection string
4. Update `REDIS_URL` in environment

## SSL/TLS Configuration

### Using Let's Encrypt

```bash
# Install certbot
docker run -it --rm \
  -v ./nginx/ssl:/etc/letsencrypt \
  -v ./nginx/www:/data/letsencrypt \
  certbot/certbot certonly \
  --webroot --webroot-path=/data/letsencrypt \
  -d yourdomain.com
```

### Using CloudFlare

1. Point nameservers to CloudFlare
2. Enable SSL/TLS encryption mode
3. Configure DNS records
4. Enable caching

## Monitoring & Logging

### Application Logs

```bash
# View all logs
docker-compose logs -f

# View specific service
docker-compose logs -f app

# View with timestamps
docker-compose logs -f --timestamps app
```

### Health Checks

The application exposes a health endpoint:

```bash
curl http://localhost:5000/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Recommended Monitoring Tools

- **New Relic**: Application performance monitoring
- **Datadog**: Infrastructure monitoring
- **Sentry**: Error tracking
- **LogRocket**: Session replay and analytics

## Scaling

### Horizontal Scaling

```yaml
# docker-compose.yml
services:
  app:
    deploy:
      replicas: 3
```

### Load Balancing

Update nginx.conf with multiple backend servers:

```nginx
upstream backend {
    server app1:5000;
    server app2:5000;
    server app3:5000;
}
```

### Database Scaling

- Use MongoDB replica sets for high availability
- Implement read replicas for read-heavy workloads
- Use Redis Cluster for distributed caching

## Security Checklist

- [ ] Use strong JWT_SECRET (256-bit minimum)
- [ ] Enable HTTPS
- [ ] Configure CORS properly
- [ ] Implement rate limiting
- [ ] Use secure headers (HSTS, CSP)
- [ ] Regular security updates
- [ ] Database encryption at rest
- [ ] SSL/TLS for all connections
- [ ] Input validation and sanitization
- [ ] Regular security audits

## Backup Strategy

### MongoDB Backups

```bash
# Daily backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker exec soulsync-mongo mongodump --out /backup/$DATE
```

### Redis Backups

```bash
# Enable RDB persistence in redis.conf
save 900 1
save 300 10
save 60 10000
```

## Troubleshooting

### Common Issues

1. **Connection refused to MongoDB**
   - Check MongoDB is running: `docker-compose ps`
   - Verify connection string

2. **Redis connection errors**
   - Check Redis is running
   - Verify REDIS_URL format

3. **JWT verification failed**
   - Ensure JWT_SECRET is set
   - Check token expiration

4. **CORS errors**
   - Update CLIENT_URL environment variable
   - Check CORS configuration

### Debug Mode

```bash
# Run with debug logging
DEBUG=* docker-compose up
```

## Support

For deployment issues:
- Check application logs
- Verify environment variables
- Test database connections
- Review security group rules

## Resources

- [Docker Documentation](https://docs.docker.com/)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [Redis Cloud](https://redis.com/cloud/)
- [NGINX Documentation](https://nginx.org/en/docs/)
