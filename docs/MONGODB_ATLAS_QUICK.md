# MongoDB Atlas Quick Setup (5 Minutes)

## 1. Sign Up
- Go to: https://www.mongodb.com/cloud/atlas
- Click "Try Free"
- Sign up with Google (fastest)

## 2. Create Cluster
- Choose "Shared" (FREE)
- Select region (e.g., Mumbai ap-south-1)
- Click "Create Deployment"
- Wait 1-3 minutes

## 3. Create User
- Click "Database Access" → "Add New Database User"
- Username: `soulsync_user`
- Password: Click "Autogenerate Secure Password" (COPY IT!)
- Role: `Read and Write to Any Database`
- Click "Add User"

## 4. Allow Network Access
- Click "Network Access" → "Add IP Address"
- Click "Allow Access from Anywhere" (0.0.0.0/0)
- Click "Confirm"

## 5. Get Connection String
- Click "Database" → "Connect" → "Drivers"
- Select "Node.js" → "4.1 or later"
- Copy the string:

```
mongodb+srv://soulsync_user:<password>@cluster0.xxxxx.mongodb.net/soulsync?retryWrites=true&w=majority
```

- Replace `<password>` with your actual password

## 6. Update SoulSync

Edit `backend/.env`:

```env
MONGODB_URI=mongodb+srv://soulsync_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/soulsync?retryWrites=true&w=majority
```

## 7. Test It

```bash
cd backend
npm install
npm run dev
```

✅ You should see "Connected to MongoDB"

## Free Tier Includes:
- 512 MB storage
- 500 concurrent connections
- Daily backups
- Perfect for development!

---

**Troubleshooting:**
- Connection timeout? Check IP whitelist
- Auth failed? Check password (special chars need URL encoding)
- Still stuck? See detailed guide: MONGODB_ATLAS_SETUP.md
