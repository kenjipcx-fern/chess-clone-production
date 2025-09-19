# 🚀 Chess.com Clone - Complete Deployment Guide

This guide provides everything you need to deploy and manage your chess platform in any environment.

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Production Deployment](#production-deployment)
3. [Database Setup](#database-setup)
4. [Environment Configuration](#environment-configuration)
5. [Testing & Validation](#testing--validation)
6. [Monitoring & Maintenance](#monitoring--maintenance)
7. [Scaling Considerations](#scaling-considerations)

## 🚀 Quick Start

### Local Development (5 minutes)

```bash
# Clone the repository
git clone https://github.com/kenjipcx-fern/chess-clone-production.git
cd chess-clone-production

# Install dependencies
npm install

# Setup environment
cp .env.example .env.local
# Edit .env.local with your configuration

# Initialize database
node init-db.js

# Start development server
npm run dev

# Open browser to http://localhost:3000
```

### Test Accounts (Ready to Use)
```
testuser@example.com / password123
player2@example.com / password123
```

## 🏗️ Production Deployment

### Option 1: Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to Vercel
vercel --prod

# Configure environment variables in Vercel dashboard:
# NEXTAUTH_SECRET=your-production-secret
# NEXTAUTH_URL=https://your-domain.vercel.app
```

### Option 2: Docker Deployment

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

```bash
# Build and run
docker build -t chess-platform .
docker run -p 3000:3000 -e NEXTAUTH_SECRET=your-secret chess-platform
```

### Option 3: Traditional VPS

```bash
# On your server
git clone https://github.com/kenjipcx-fern/chess-clone-production.git
cd chess-clone-production

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install dependencies and build
npm ci
npm run build

# Install PM2 for process management
npm install -g pm2

# Start the application
pm2 start npm --name "chess-platform" -- start
pm2 startup
pm2 save
```

## 🗄️ Database Setup

### Development (SQLite)
```bash
# Initialize database with sample data
node init-db.js

# Create test users
node create-users.js
```

### Production (PostgreSQL)

1. **Update database configuration**:
```typescript
// drizzle.config.ts
export default {
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL,
  },
};
```

2. **Update database connection**:
```typescript
// src/db/index.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);
export const db = drizzle(client);
```

3. **Run migrations**:
```bash
npx drizzle-kit push:pg
```

## ⚙️ Environment Configuration

### Required Environment Variables

```bash
# .env.local (Development)
NEXTAUTH_SECRET=your-development-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# .env.production (Production)
NEXTAUTH_SECRET=your-super-secure-production-secret
NEXTAUTH_URL=https://your-domain.com
DATABASE_URL=postgresql://user:pass@host:port/dbname
```

### Security Best Practices

1. **Generate secure secrets**:
```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32
```

2. **Environment-specific configs**:
- Development: Use SQLite, relaxed CORS
- Production: Use PostgreSQL, strict CORS, HTTPS only

## 🧪 Testing & Validation

### Automated Testing Suite

```bash
# Unit tests
npm run test

# Integration tests  
npm run test:integration

# E2E tests
npm run test:e2e
```

### Manual Testing Checklist

#### Authentication Testing
- [ ] User registration with valid email
- [ ] User login with correct credentials
- [ ] Session persistence across page refresh
- [ ] Session isolation in different browsers
- [ ] Proper logout functionality

#### Chess Gameplay Testing
- [ ] Game creation (Blitz, Rapid, Classical)
- [ ] Game joining by second player
- [ ] Legal move validation
- [ ] Piece selection and movement
- [ ] Turn management
- [ ] Move history tracking
- [ ] Game status detection (check, checkmate)

#### Multi-Player Testing
- [ ] Cross-browser synchronization
- [ ] Real-time move updates
- [ ] Database persistence
- [ ] Connection handling

### Load Testing

```bash
# Install artillery
npm install -g artillery

# Create load test config
cat > load-test.yml << EOF
config:
  target: 'http://localhost:3000'
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - name: "Chess Platform Load Test"
    requests:
      - get:
          url: "/"
      - post:
          url: "/api/auth/signin"
          json:
            email: "test@example.com"
            password: "password123"
EOF

# Run load test
artillery run load-test.yml
```

## 📊 Monitoring & Maintenance

### Application Monitoring

```javascript
// Add to your app
import { Analytics } from '@vercel/analytics/react';

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <Analytics />
    </>
  )
}
```

### Database Monitoring

```bash
# SQLite monitoring
sqlite3 chess.db "SELECT COUNT(*) as total_games FROM games;"
sqlite3 chess.db "SELECT COUNT(*) as total_moves FROM moves;"

# PostgreSQL monitoring
psql $DATABASE_URL -c "SELECT COUNT(*) as total_games FROM games;"
```

### Performance Monitoring

```javascript
// pages/api/health.js
export default function handler(req, res) {
  const healthcheck = {
    uptime: process.uptime(),
    message: 'OK',
    timestamp: Date.now(),
    database: 'Connected', // Add actual DB health check
    memory: process.memoryUsage()
  };
  
  res.status(200).json(healthcheck);
}
```

## ⚡ Scaling Considerations

### Horizontal Scaling

1. **Database Scaling**:
   - Read replicas for game queries
   - Connection pooling
   - Database sharding by user region

2. **Application Scaling**:
   - Load balancer (Nginx/HAProxy)
   - Multiple app instances
   - Session store (Redis)

3. **Real-time Features**:
   - WebSocket clustering
   - Message queue (Redis/RabbitMQ)
   - CDN for static assets

### Performance Optimizations

```javascript
// Next.js optimizations
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable gzip compression
  compress: true,
  
  // Enable image optimization
  images: {
    domains: ['example.com'],
  },
  
  // Bundle analyzer
  experimental: {
    bundleAnalyzer: {
      enabled: process.env.ANALYZE === 'true',
    },
  },
};
```

## 🔧 Troubleshooting

### Common Issues

**Issue**: "NEXTAUTH_SECRET not found"
```bash
# Solution: Set environment variable
export NEXTAUTH_SECRET=$(openssl rand -base64 32)
```

**Issue**: Database connection errors
```bash
# Check database file permissions
ls -la chess.db
chmod 666 chess.db

# Reinitialize if corrupted
rm chess.db && node init-db.js
```

**Issue**: Port already in use
```bash
# Find process using port 3000
lsof -ti:3000

# Kill process
kill -9 $(lsof -ti:3000)
```

### Debug Mode

```bash
# Enable debug logging
DEBUG=* npm run dev

# Next.js specific debugging  
DEBUG=next* npm run dev
```

## 📈 Analytics & Metrics

### Key Metrics to Track

1. **User Engagement**:
   - Daily/Monthly Active Users
   - Average session duration
   - Games completed vs abandoned

2. **Performance Metrics**:
   - Page load times
   - API response times
   - Database query performance

3. **Business Metrics**:
   - User retention rates
   - Game completion rates
   - Popular time controls

### Implementation

```javascript
// Google Analytics 4
import { Analytics } from '@vercel/analytics/react';

// Custom event tracking
function trackGameStart(timeControl) {
  gtag('event', 'game_start', {
    event_category: 'engagement',
    event_label: timeControl,
  });
}
```

## 🔒 Security Checklist

- [ ] HTTPS enabled in production
- [ ] Secure headers configured
- [ ] Input validation on all endpoints
- [ ] Rate limiting implemented
- [ ] SQL injection protection
- [ ] XSS protection enabled
- [ ] CSRF tokens implemented
- [ ] Environment variables secured
- [ ] Database access restricted
- [ ] Regular security updates

## 📞 Support & Maintenance

### Backup Strategy

```bash
# Database backup
cp chess.db "backup-$(date +%Y%m%d-%H%M%S).db"

# Automated backups
echo "0 2 * * * cp /path/to/chess.db /backups/chess-$(date +\%Y\%m\%d).db" | crontab -
```

### Update Strategy

```bash
# Staging deployment
git checkout staging
git pull origin main
npm ci
npm run build
npm run test

# Production deployment
git checkout main
git pull origin main
npm ci --production
npm run build
pm2 restart chess-platform
```

---

**Need help?** 
- 📖 [Documentation](https://github.com/kenjipcx-fern/chess-clone-production/wiki)
- 🐛 [Issues](https://github.com/kenjipcx-fern/chess-clone-production/issues)
- 📧 Support: bot@chess-platform.dev
