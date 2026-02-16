#!/bin/bash

echo "========================================"
echo "SoulSync Quick Health Check"
echo "========================================"
echo ""

# Check if backend is running on port 5001
echo "1. Checking Backend (Port 5001)..."
if lsof -i :5001 > /dev/null 2>&1; then
    echo "   ✅ Backend is running on port 5001"
else
    echo "   ❌ Backend NOT running on port 5001"
    echo "   👉 Start it: cd backend && npm start"
fi

# Check if frontend is running on port 3000
echo ""
echo "2. Checking Frontend (Port 3000)..."
if lsof -i :3000 > /dev/null 2>&1; then
    echo "   ✅ Frontend is running on port 3000"
else
    echo "   ❌ Frontend NOT running on port 3000"
    echo "   👉 Start it: cd frontend && npm start"
fi

# Test backend health endpoint
echo ""
echo "3. Testing Backend Health..."
if curl -s http://localhost:5001/health > /dev/null 2>&1; then
    echo "   ✅ Backend health check passed"
    RESPONSE=$(curl -s http://localhost:5001/health)
    echo "   Response: $RESPONSE"
else
    echo "   ❌ Backend health check failed"
fi

# Check MongoDB connection
echo ""
echo "4. Checking Backend Logs for MongoDB..."
if grep -q "Connected to MongoDB" /Users/shreyash/projects/SoulSync/backend/logs/combined.log 2>/dev/null; then
    echo "   ✅ MongoDB connected"
else
    echo "   ⚠️  Cannot verify MongoDB connection (check logs manually)"
fi

# Check for common errors
echo ""
echo "5. Checking for Recent Errors..."
if [ -f /Users/shreyash/projects/SoulSync/backend/logs/error.log ]; then
    ERROR_COUNT=$(wc -l < /Users/shreyash/projects/SoulSync/backend/logs/error.log)
    if [ "$ERROR_COUNT" -gt 0 ]; then
        echo "   ⚠️  Found $ERROR_COUNT errors in log"
        echo "   Recent errors:"
        tail -3 /Users/shreyash/projects/SoulSync/backend/logs/error.log
    else
        echo "   ✅ No errors found"
    fi
else
    echo "   ℹ️  No error log file yet"
fi

echo ""
echo "========================================"
echo "Quick Test URLs:"
echo "========================================"
echo "Frontend: http://localhost:3000"
echo "Backend:  http://localhost:5001"
echo "Health:   http://localhost:5001/health"
echo ""
echo "========================================"
echo "Next Steps:"
echo "========================================"
echo "1. Open http://localhost:3000"
echo "2. Register a test user"
echo "3. Complete the onboarding"
echo "4. Create a second user in incognito mode"
echo "5. Test matching between users"
echo ""
