# 🧑‍💻 DevConnect

**DevConnect** is a modern, full-stack social media platform built exclusively for developers to connect, share projects, and grow their professional network.

---

## ✨ Features

### 🔐 Authentication
- User registration & login
- JWT-based authentication
- Protected routes
- Persistent sessions

### 👤 Developer Profiles
- Profile avatar & bio
- Tech stack tags
- Social links (GitHub, LinkedIn, Twitter)
- Followers / Following system
- Profile statistics

### 📝 Posts System
- Create, edit, delete posts
- Like / unlike posts
- Comment system
- Time-ago timestamps
- Engagement tracking

### ⭐ Social Features
- Follow / unfollow developers
- Explore developers by name or tech stack
- Follower analytics

### 📁 Project Showcase
- Add projects with title & description
- Tech stack per project
- GitHub & live demo links
- Project cards on profiles

### 📊 Dashboard
- Total posts
- Likes received
- Followers / Following stats
- Engagement insights

### 🎨 Premium UI/UX
- Glassmorphism design
- Dark / Light mode (persistent)
- Framer Motion animations
- Fully responsive (mobile + desktop)
- Toast notifications
- Skeleton loaders
- Smooth transitions

---

## 🛠️ Tech Stack

### Frontend
- React 18
- Vite
- Tailwind CSS
- Framer Motion
- React Router
- Axios
- React Hot Toast
- Lucide Icons

### Backend
- Node.js
- Express.js
- JWT Authentication
- bcryptjs
- dotenv
- CORS

### Data Storage
- In-memory mock database  
- MongoDB-ready architecture

---

## 📁 Project Structure

DevConnect/
├── backend/
│ ├── controllers/
│ ├── routes/
│ ├── middleware/
│ ├── data/
│ ├── server.js
│ └── package.json
│
└── frontend/
├── public/
├── src/
│ ├── components/
│ ├── pages/
│ ├── context/
│ ├── services/
│ └── App.jsx
└── package.json


---

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/Ashwinashu-12/DEVCONNECT.git

# Backend setup
cd DEVCONNECT/backend
npm install

# Frontend setup
cd ../frontend
npm install
Run the Project
# Start backend
cd backend
npm run dev
Backend runs on: http://localhost:5000

# Start frontend
cd frontend
npm run dev
Frontend runs on: http://localhost:3000

🔑 Demo Accounts
Name	Email	Password
Sarah Chen	sarah@devconnect.com	password123
Alex Kumar	alex@devconnect.com	password123
Maya Rodriguez	maya@devconnect.com	password123
🌐 API Endpoints
Auth
POST /api/auth/register

POST /api/auth/login

Users
GET /api/users

GET /api/users/:id

PUT /api/users/:id

POST /api/users/follow/:id

Posts
GET /api/posts

POST /api/posts

PUT /api/posts/:id

DELETE /api/posts/:id

POST /api/posts/like/:id

POST /api/posts/comment/:id

🔄 MongoDB Migration
The app currently uses mock data.
MongoDB migration guide is available in backend/MONGODB_MIGRATION.md.

🚀 Deployment
Frontend: Vercel / Netlify

Backend: Render / Railway

Database: MongoDB Atlas

📝 License
MIT License — free to use and modify.

🤝 Contributing
Pull requests are welcome.
Fork → Create branch → Commit → Push → PR 🚀

❤️ Built with love for the developer community

✅ **Save the file (Ctrl + S)**

---

# ✅ PART 2: SAVE THIS README TO GITHUB (FINAL STEPS)

Now run **exactly these commands** in VS Code terminal:

```bash
git add README.md
git commit -m "Update project README"
git push