# Testing Checklist for SoulSync

## Quick Verification Steps

### Step 1: Check Backend Status
Open terminal and run:
```bash
curl http://localhost:5001/health
```

**Expected Response:**
```json
{"status":"ok","timestamp":"2026-02-16T..."}
```

If you get connection refused, start backend:
```bash
cd /Users/shreyash/projects/SoulSync/backend
npm start
```

### Step 2: Check Frontend Status
Open http://localhost:3000

**You should see:**
- Beautiful gradient login page
- SoulSync logo
- "Welcome Back" heading

### Step 3: Test Registration

1. Click "Create one" to go to Register
2. Fill Step 1:
   - Email: test1@gmail.com
   - Password: password123
3. Fill Step 2:
   - Name: Alex
   - Date of Birth: 1995-06-15
   - Gender: Male
4. Click "Create Account"

**Expected:** Redirects to /onboarding

### Step 4: Test Onboarding

**Step 1:** Upload 1-2 photos
**Step 2:** Select 5-10 interests
**Step 3:** Pick 3-5 favorite movies
**Step 4:** Pick 3-5 favorite shows
**Step 5:** Select 3-4 date ideas
**Step 6:** Choose relationship type + write bio
**Step 7:** Click "Complete"

**Expected:** Redirects to /discover

### Step 5: Create Second User

Open incognito/private window:
1. Go to http://localhost:3000/register
2. Register as:
   - Email: test2@gmail.com
   - Password: password123
   - Name: Sarah
   - Gender: Female
3. Complete onboarding with different interests

### Step 6: Test Matching

**As User 1 (Alex):**
1. Go to Discover page
2. Should see Sarah's profile
3. Click ❤️ (like button)
4. Check console - should show no errors

**As User 2 (Sarah):**
1. Refresh page
2. Go to Discover
3. Should see Alex's profile
4. Click ❤️

**Expected:** "It's a Match!" popup appears for both users

### Step 7: Check Matches Page

1. Click "Matches" in sidebar
2. Should see the match with compatibility score
3. Click on match to open chat

---

## Common Issues & Fixes

### Issue 1: Port 5001 already in use
```bash
# Kill process on port 5001
lsof -ti:5001 | xargs kill -9

# Restart backend
npm start
```

### Issue 2: CORS errors
**Symptom:** "No 'Access-Control-Allow-Origin' header"
**Fix:** Backend already configured - just restart it

### Issue 3: MongoDB connection failed
**Symptom:** "MongoDB connection error"
**Fix:** Check your MongoDB Atlas connection string in `.env`

### Issue 4: Photos not saving
**Symptom:** Photos upload but don't appear
**Fix:** This is expected - photo upload is frontend-only demo. For real upload, integrate AWS S3.

### Issue 5: "Cannot read property of undefined"
**Symptom:** White screen or error
**Fix:** Check browser console for exact error location

---

## Console Check

Open browser console (F12) and verify:

### ✅ Should See:
```
[HMR] Waiting for update signal from WDS...
[webpack-dev-server] Hot Module Replacement enabled.
Connected to MongoDB
Socket connected
```

### ❌ Should NOT See:
```
POST http://localhost:5001/api/auth/register net::ERR_CONNECTION_REFUSED
CORS policy: No 'Access-Control-Allow-Origin' header
Cannot read property 'interests' of undefined
```

---

## Network Tab Check

Open Network tab (F12 → Network) and test:

### 1. Registration API
- Method: POST
- URL: http://localhost:5001/api/auth/register
- Status: 201 Created
- Response: `{token: "...", user: {...}}`

### 2. Onboarding API
- Method: PUT
- URL: http://localhost:5001/api/profile
- Status: 200 OK

### 3. Discover API
- Method: GET
- URL: http://localhost:5001/api/recommendation?limit=20
- Status: 200 OK
- Response: Array of profiles

### 4. Swipe API
- Method: POST
- URL: http://localhost:5001/api/swipe
- Status: 200 OK

---

## Feature Verification

### ✅ Login Page
- [ ] Gradient background on left side
- [ ] SoulSync logo with animation
- [ ] Email input field
- [ ] Password field with show/hide toggle
- [ ] "Remember me" checkbox
- [ ] "Forgot password" link
- [ ] Social login buttons (Google, Apple)
- [ ] "Create one" link works

### ✅ Register Page
- [ ] Progress bar shows 3 steps
- [ ] Step 1: Email & password
- [ ] Step 2: Name, DOB, Gender with emojis
- [ ] Step 3: Confirmation with benefits
- [ ] Back/Next buttons work
- [ ] Smooth animations between steps

### ✅ Onboarding Page
- [ ] Progress bar shows 7 steps
- [ ] Step 1: Photo upload works (preview shows)
- [ ] Step 2: Interest categories with emojis
- [ ] Step 3: Movie suggestions displayed
- [ ] Step 4: TV show suggestions displayed
- [ ] Step 5: Date ideas with icons
- [ ] Step 6: Relationship types with emojis
- [ ] Step 7: Bio text area
- [ ] Completes and redirects to Discover

### ✅ Discover Page
- [ ] Profile cards load
- [ ] Photos display correctly
- [ ] Match % badge visible
- [ ] Name and age shown
- [ ] Location shown
- [ ] Info button expands details
- [ ] Interests displayed as tags
- [ ] Movies/Shows/Music/Date ideas visible
- [ ] Compatibility breakdown with progress bars
- [ ] Swipe buttons work (X, Star, Heart)
- [ ] Match modal appears when mutual like

### ✅ Matches Page
- [ ] Matches list loads
- [ ] Profile photos shown
- [ ] Compatibility score visible
- [ ] Unread message badge
- [ ] Click opens chat

### ✅ Chat/Messages
- [ ] Messages load
- [ ] Can send message
- [ ] "Typing..." indicator
- [ ] Read receipts

### ✅ Settings Page
- [ ] Age range slider
- [ ] Distance slider
- [ ] Looking for dropdown
- [ ] Gender preference buttons
- [ ] Privacy toggles

---

## Database Verification

Check MongoDB Atlas to verify data:

```javascript
// In MongoDB Atlas console or Compass:

// Check users created
db.users.find().pretty()

// Check profiles with new fields
db.profiles.find().pretty()

// Check preferences
db.preferences.find().pretty()

// Check swipes
db.swipes.find().pretty()

// Check matches
db.matches.find().pretty()
```

---

## Quick Test Script

Run this in browser console to test APIs:

```javascript
// Test 1: Check if backend is running
fetch('http://localhost:5001/health')
  .then(r => r.json())
  .then(data => console.log('✅ Backend:', data))
  .catch(err => console.error('❌ Backend error:', err));

// Test 2: Check recommendations (if logged in)
fetch('http://localhost:5001/api/recommendation', {
  headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
})
  .then(r => r.json())
  .then(data => console.log('✅ Recommendations:', data))
  .catch(err => console.error('❌ Recommendations error:', err));
```

---

## Success Criteria

Your app is working correctly if:

1. ✅ Can register 2 different users
2. ✅ Both complete 7-step onboarding
3. ✅ Users appear in each other's Discover
4. ✅ Can swipe right on both accounts
5. ✅ "It's a Match!" appears for both
6. ✅ Match appears in Matches page
7. ✅ Can send messages
8. ✅ No console errors
9. ✅ All data saves to MongoDB

---

## Troubleshooting Commands

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
cd frontend && rm -rf node_modules package-lock.json && npm install
cd backend && rm -rf node_modules package-lock.json && npm install

# Check ports
lsof -i :5001  # Backend
lsof -i :3000  # Frontend

# Kill processes
kill $(lsof -t -i :5001)
kill $(lsof -t -i :3000)
```

---

## Report Issues

If something doesn't work:

1. Check browser console for errors
2. Check backend terminal for errors
3. Check MongoDB connection
4. Verify ports 3000 and 5001 are free
5. Check CORS errors in Network tab

Send me:
- Screenshot of error
- Browser console output
- Backend terminal output
