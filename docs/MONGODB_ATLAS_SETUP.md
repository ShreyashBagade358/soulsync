# MongoDB Atlas Setup Guide for SoulSync

MongoDB Atlas is the easiest way to run MongoDB in production - it's a fully managed cloud database service.

## Step 1: Create MongoDB Atlas Account

1. Go to [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Click "Try Free" or "Start Free"
3. Sign up with:
   - Google account (recommended)
   - Email/password
   - GitHub account

## Step 2: Create a New Cluster

1. **Choose Deployment Option**
   - Select "Shared" (FREE tier) for development
   - Or "Dedicated" for production (paid)

2. **Select Cloud Provider & Region**
   - Choose AWS, Google Cloud, or Azure
   - Pick a region close to your users (e.g., Mumbai for India)
   - This affects latency

3. **Cluster Tier**
   - M0 Sandbox (FREE) - 512MB storage, shared RAM
   - Perfect for development and testing
   - Can upgrade later

4. **Name Your Cluster**
   - Default: `Cluster0`
   - Click "Create Deployment"

5. **Wait for Cluster Creation**
   - Takes 1-3 minutes
   - You'll see a green checkmark when ready

## Step 3: Create Database User

1. In the left sidebar, click "Database Access"
2. Click "Add New Database User"
3. Choose Authentication Method:
   - **Password** (recommended for apps)
4. Set:
   - **Username**: `soulsync_user`
   - **Password**: Generate a strong password (save it!)
5. Set Privileges:
   - **Role**: `Read and Write to any database`
6. Click "Add User"

## Step 4: Configure Network Access

1. In the left sidebar, click "Network Access"
2. Click "Add IP Address"
3. Choose:
   - **Add Current IP Address** (for local development)
   - **Allow Access from Anywhere** (0.0.0.0/0) - for production
     - ⚠️ Less secure, use only for testing
4. Click "Confirm"

## Step 5: Get Connection String

1. Go back to "Database" → "Clusters"
2. Click "Connect" on your cluster
3. Choose "Drivers"
4. Select "Node.js" and version "4.1 or later"
5. Copy the connection string:

```
mongodb+srv://soulsync_user:<password>@cluster0.xxxxx.mongodb.net/soulsync?retryWrites=true&w=majority
```

6. Replace `<password>` with your actual password

## Step 6: Configure SoulSync

### Backend Environment Variables

Edit `/backend/.env`:

```env
NODE_ENV=development
PORT=5000

# MongoDB Atlas Connection
MONGODB_URI=mongodb+srv://soulsync_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/soulsync?retryWrites=true&w=majority

# Redis (local or Redis Cloud)
REDIS_URL=redis://localhost:6379

# JWT Secret
JWT_SECRET=your-super-secret-key-change-this
```

### Important: URL Encode Special Characters

If your password contains special characters (`@`, `:`, `/`, etc.), URL encode them:

| Character | URL Encoded |
|-----------|-------------|
| @         | %40         |
| :         | %3A         |
| /         | %2F         |
| #         | %23         |
| ?         | %3F         |

**Example:**
```
Password: my@pass#123
Encoded: my%40pass%23123
```

## Step 7: Test Connection

### Option 1: Using MongoDB Compass (GUI)

1. Download [MongoDB Compass](https://www.mongodb.com/products/compass)
2. Click "New Connection"
3. Paste your connection string
4. Click "Connect"
5. You should see your databases

### Option 2: Test with Node.js

Create `test-connection.js`:

```javascript
const mongoose = require('mongoose');

const uri = 'mongodb+srv://soulsync_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/soulsync?retryWrites=true&w=majority';

mongoose.connect(uri)
  .then(() => {
    console.log('✅ Connected to MongoDB Atlas!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Connection failed:', err);
    process.exit(1);
  });
```

Run:
```bash
cd backend
node test-connection.js
```

## Step 8: Verify in SoulSync

Start the backend:
```bash
cd backend
npm install
npm run dev
```

You should see:
```
✅ Connected to MongoDB
Server running on port 5000
```

## MongoDB Atlas Free Tier Limits

- **Storage**: 512 MB
- **RAM**: Shared
- **Connections**: 500 concurrent
- **Databases**: Unlimited
- **Collections**: Unlimited
- **Backup**: Daily snapshots (7 days retention)

Perfect for:
- Development
- Testing
- Small production apps (up to ~1000 users)

## Upgrading

When you need more:
1. Go to Atlas dashboard
2. Click "Modify" on your cluster
3. Choose higher tier (M2, M5, M10+)
4. Prices start at ~$9/month

## Troubleshooting

### Connection Timeout
```
Error: connection timed out
```
**Fix**: Check IP whitelist in Network Access

### Authentication Failed
```
Error: Authentication failed
```
**Fix**: 
- Check username/password
- URL encode special characters in password
- Verify user has correct permissions

### DNS Resolution Failed
```
Error: querySrv ECONNREFUSED
```
**Fix**: Check internet connection, try different region

### SSL/TLS Issues
```
Error: SSL connection failed
```
**Fix**: Add to connection string:
```
&tls=true&tlsAllowInvalidCertificates=false
```

## Security Best Practices

✅ **DO:**
- Use strong passwords (20+ characters)
- Whitelist specific IPs only
- Enable Database Auditing (paid tier)
- Use VPC Peering for production
- Enable Two-Factor Authentication (2FA)

❌ **DON'T:**
- Commit credentials to Git
- Use "Allow from Anywhere" in production
- Share connection strings publicly
- Use the same password everywhere

## Alternative: MongoDB Atlas CLI

Install Atlas CLI for command-line management:

```bash
# macOS
brew install mongodb-atlas-cli

# Login
atlas auth login

# Create cluster
atlas cluster create myCluster --provider AWS --region US_EAST_1 --tier M0
```

## Next Steps

1. ✅ MongoDB Atlas is ready
2. ➡️ Set up Redis (local or Redis Cloud)
3. ➡️ Configure environment variables
4. ➡️ Start the SoulSync backend

Need help? Check MongoDB Atlas documentation: https://docs.atlas.mongodb.com/
