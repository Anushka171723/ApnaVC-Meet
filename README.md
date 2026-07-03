# 🎥 Apna Video Call - Complete Video Conferencing App

A full-stack video conferencing application with real-time communication, user authentication, and mobile-responsive design.

## ✨ Features

- 🔐 **User Authentication** - Secure login & registration with bcrypt
- 📹 **Video Calls** - WebRTC-based peer-to-peer video conferencing
- 💬 **Real-time Chat** - Socket.io powered messaging
- 📱 **Mobile Responsive** - Works perfectly on all devices
- 📊 **Meeting History** - Track all your past meetings
- 🚀 **Guest Access** - Join meetings without registration

## 🛠️ Tech Stack

### Frontend
- React 19
- Material-UI (MUI)
- Socket.io Client
- WebRTC
- React Router
- Axios

### Backend
- Node.js & Express 5
- MongoDB (Mongoose)
- Socket.io
- Bcrypt (Password hashing)
- CORS enabled

## 📁 Project Structure

```
Video_Conferencing/
├── backend/
│   ├── src/
│   │   ├── app.js              # Main server file
│   │   ├── controllers/        # Business logic
│   │   │   ├── user.controller.js
│   │   │   └── socketManager.js
│   │   ├── models/             # Database schemas
│   │   │   ├── user.model.js
│   │   │   └── meeting.model.js
│   │   └── routes/             # API routes
│   │       └── users.routes.js
│   └── package.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── pages/              # React pages
│   │   │   ├── landing.jsx
│   │   │   ├── authentication.jsx
│   │   │   ├── home.jsx
│   │   │   ├── VideoMeet.jsx
│   │   │   └── history.jsx
│   │   ├── contexts/           # React contexts
│   │   │   └── AuthContext.jsx
│   │   ├── styles/             # CSS files
│   │   │   ├── videoComponent.module.css
│   │   │   └── mobile.css
│   │   ├── utils/              # Helper functions
│   │   │   └── withAuth.jsx
│   │   ├── App.js
│   │   ├── App.css
│   │   └── environment.js      # API configuration
│   └── package.json
│
├── START_APP.cmd               # One-click startup
├── QUICK_START.md              # Quick start guide
├── AUTHENTICATION_FIXED.md     # Auth documentation
└── MOBILE_RESPONSIVE_CHANGES.md # Mobile UI docs
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Internet connection (for MongoDB Atlas)

### Installation & Running

**Easiest Method:**
1. Double-click `START_APP.cmd`
2. Wait for both servers to start
3. Browser opens automatically!

**Manual Method:**

```cmd
# Terminal 1 - Backend
cd backend
npm install
npm start

# Terminal 2 - Frontend  
cd frontend
npm install
npm start
```

### Access the App
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000`

## 📱 Mobile Testing

1. Press `F12` in browser
2. Click device toggle icon (or `Ctrl+Shift+M`)
3. Select any mobile device
4. Test all features!

**Or test on real device:**
1. Find your PC's IP: `ipconfig` in CMD
2. Connect mobile to same WiFi
3. Open: `http://YOUR-IP:3000`

## 🎯 Usage Guide

### 1. Register
- Click "Get Started" or "Register"
- Enter: Name, Username, Password
- Click "Register"

### 2. Login
- Enter: Username, Password
- Click "Login"
- Redirects to home dashboard

### 3. Join/Start Meeting
- Enter meeting code (e.g., `meeting123`)
- Click "Join"
- Allow camera/mic permissions
- Enter your name
- Click "Connect"

### 4. During Meeting
- 🎥 Toggle video on/off
- 🎤 Toggle audio on/off
- 🖥️ Share screen
- 💬 Open chat
- ❌ End call

### 5. View History
- Click History icon
- See all past meetings with dates

## 🔐 Authentication Flow

### Registration
```
User → Frontend → POST /api/v1/users/register → Backend
                                               ↓
                                        Password hashed (bcrypt)
                                               ↓
                                        Saved to MongoDB
                                               ↓
                                        Success message
```

### Login
```
User → Frontend → POST /api/v1/users/login → Backend
                                            ↓
                                     Find user + verify password
                                            ↓
                                     Generate token (crypto)
                                            ↓
                                     Return token
                                            ↓
                            Store in localStorage
                                            ↓
                            Redirect to /home
```

## 📡 API Endpoints

### User Routes (`/api/v1/users`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/register` | Create new user | No |
| POST | `/login` | Login user | No |
| POST | `/add_to_activity` | Add meeting to history | Yes (token) |
| GET | `/get_all_activity` | Get user's meetings | Yes (token) |

### WebSocket Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `join-call` | Client → Server | Join meeting room |
| `signal` | Bidirectional | WebRTC signaling |
| `chat-message` | Bidirectional | Send/receive messages |
| `user-joined` | Server → Client | New user notification |
| `user-left` | Server → Client | User disconnect notification |

## 🗄️ Database Schema

### User Collection
```javascript
{
  name: String,           // Full name
  username: String,       // Unique identifier
  password: String,       // Bcrypt hashed
  token: String          // Session token
}
```

### Meeting Collection
```javascript
{
  user_id: String,        // Username reference
  meetingCode: String,    // Meeting room ID
  date: Date             // Timestamp
}
```

## 🎨 Mobile Responsive Design

### Breakpoints
- **Desktop:** > 768px - Full layout
- **Tablet:** ≤ 768px - Adjusted spacing, responsive grid
- **Mobile:** ≤ 480px - Single column, stacked layout

### Key Optimizations
- ✅ Touch-friendly buttons (44x44px minimum)
- ✅ No horizontal scrolling
- ✅ Readable text without zoom (min 14px)
- ✅ Stacked navigation on mobile
- ✅ Full-width form inputs
- ✅ Optimized video grid
- ✅ Centered chat overlay
- ✅ Responsive images

## 🔧 Configuration

### Environment Variables

**Frontend** (`frontend/src/environment.js`):
```javascript
let IS_PROD = true; // false for local development

const server = IS_PROD 
  ? "https://apnavc.onrender.com"    // Production
  : "http://localhost:8000";          // Development
```

**Backend** (`backend/.env`):
```javascript
PORT = process.env.PORT || 8000
MONGODB_URI = "mongodb+srv://..." // Set this locally from backend/.env.example
```

## 🐛 Troubleshooting

### PowerShell Execution Policy Error
```cmd
powershell -Command "Set-ExecutionPolicy RemoteSigned -Scope CurrentUser -Force"
```

### Port Already in Use
```cmd
# Windows - Kill process on port 8000
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

### MongoDB Connection Failed
- Check internet connection
- Verify MongoDB Atlas is accessible
- Check firewall settings

### Camera/Mic Not Working
- Allow permissions in browser
- Check browser supports WebRTC
- Try different browser (Chrome recommended)

### Can't Access /home After Login
- Open browser console (F12)
- Check for token in localStorage
- Verify backend is running
- Clear browser cache

## 🔒 Security Features

- ✅ Password hashing with bcrypt (10 rounds)
- ✅ Token-based authentication
- ✅ Protected routes with HOC
- ✅ Input validation on backend
- ✅ CORS configured
- ✅ Unique username constraint
- ✅ Secure WebRTC connections

## 📦 Dependencies

### Backend
- express (5.2.1)
- mongoose (9.3.1)
- socket.io (4.8.3)
- bcrypt (6.0.0)
- cors (2.8.5)

### Frontend
- react (19.2.4)
- @mui/material (7.3.9)
- socket.io-client (4.8.3)
- react-router-dom (7.13.2)
- axios (1.14.0)

## 🎉 What's Fixed & Improved

### Recent Fixes
1. ✅ Fixed routing typo (`/home's` → `/home`)
2. ✅ Added missing context functions
3. ✅ Fixed login redirect path
4. ✅ Added mobile responsive CSS
5. ✅ Improved chat UI for mobile
6. ✅ Added video lobby styling
7. ✅ Fixed history page layout

### Mobile Responsive Changes
- All pages now mobile-friendly
- Touch-optimized controls
- Responsive video grid
- Mobile-friendly chat
- Adaptive navigation
- Optimized forms

## 📝 License

Created by Anushka

## 🤝 Support

All features are working:
- ✅ Registration & Login
- ✅ Video Meetings
- ✅ Real-time Chat
- ✅ Meeting History
- ✅ Mobile Responsive
- ✅ Screen Sharing
- ✅ Guest Access

Need help? Check these files:
- `QUICK_START.md` - Getting started
- `AUTHENTICATION_FIXED.md` - Auth details
- `MOBILE_RESPONSIVE_CHANGES.md` - Mobile UI info

---

**Ready to use! Just run `START_APP.cmd` and enjoy! 🚀**
