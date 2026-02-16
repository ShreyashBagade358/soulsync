# SoulSync Frontend - JSX Edition

All frontend files are now using **JSX** syntax with `.jsx` extensions.

## File Structure

```
frontend/src/
├── main.jsx              # Entry point
├── App.jsx               # Main app component
├── index.css             # Global styles
├── App.css               # App-specific styles
├── components/
│   └── Layout.jsx        # App layout with sidebar
├── pages/
│   ├── Login.jsx         # Login page
│   ├── Register.jsx      # Registration page
│   ├── Discover.jsx      # Swipe/discover page
│   ├── Matches.jsx       # Matches list page
│   ├── Messages.jsx      # Chat page
│   ├── Profile.jsx       # User profile page
│   └── Settings.jsx      # Settings page
└── stores/
    ├── authStore.jsx     # Authentication state
    ├── matchStore.jsx    # Matching state
    ├── messageStore.jsx  # Messaging state
    └── socketStore.jsx   # WebSocket state
```

## Features

- Modern JSX syntax
- React hooks (useState, useEffect)
- Zustand for state management
- Tailwind CSS for styling
- Framer Motion for animations
- React Router for navigation
- Socket.io for real-time features
- Axios for API calls

## Getting Started

```bash
cd frontend
npm install
npm start
```

The app will run on http://localhost:3000
