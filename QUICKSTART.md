# Quick Start Guide

Get the MERN Blog System up and running in 5 minutes!

## Prerequisites Check

Make sure you have these installed:
- ✅ Node.js (v14+): `node --version`
- ✅ MongoDB: `mongod --version` or MongoDB Atlas account
- ✅ npm: `npm --version`

## Installation Steps

### 1. Install All Dependencies

From the root directory, run:
```bash
npm run install-all
```

This will install dependencies for both backend and frontend.

Or install manually:
```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### 2. Set Up Environment Variables

Create a `.env` file in the `server` directory:

```bash
cd server
cp .env.example .env
```

Edit `.env` with your settings:
```env
MONGO_URI=mongodb://localhost:27017/blog-system
JWT_ACCESS_SECRET=your_very_secure_access_secret_change_this
JWT_REFRESH_SECRET=your_very_secure_refresh_secret_change_this
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:3000
```

**Important**: Change the JWT secrets to random strings in production!

### 3. Start MongoDB

**Option A - Local MongoDB:**
```bash
mongod
```

**Option B - MongoDB Atlas:**
- Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)
- Get your connection string
- Update `MONGO_URI` in `.env`

### 4. Run the Application

**Option A - Run Both Together (Recommended):**
```bash
# From root directory
npm run dev
```

**Option B - Run Separately:**

Terminal 1 (Backend):
```bash
cd server
npm run dev
```

Terminal 2 (Frontend):
```bash
cd client
npm start
```

### 5. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/api/health

## First Steps

### 1. Register Your First User
1. Go to http://localhost:3000
2. Click "Register"
3. Fill in the form
4. You'll be automatically logged in

### 2. Create Your First Post
1. Click "New Post" in the navigation
2. Enter a title and content
3. Click "Create Post"

### 3. Make Yourself an Admin

**Method 1 - MongoDB Shell:**
```bash
mongosh

use blog-system

db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "admin" } }
)
```

**Method 2 - MongoDB Compass:**
1. Connect to `mongodb://localhost:27017`
2. Open `blog-system` database
3. Open `users` collection
4. Find your user and edit
5. Change `role` from "user" to "admin"

### 4. Access Admin Dashboard
1. Refresh the page
2. You'll now see "Admin" in the navigation
3. Click it to manage users and posts

## Troubleshooting

### Port Already in Use
```bash
# Change PORT in server/.env to 5001 or another port
PORT=5001
```

### MongoDB Connection Failed
- Check if MongoDB is running: `mongod`
- Verify `MONGO_URI` in `.env`
- For Atlas, ensure your IP is whitelisted

### CORS Errors
- Ensure `CLIENT_URL` in `.env` matches your frontend URL
- Default should be `http://localhost:3000`

### "Module not found" Errors
```bash
# Reinstall dependencies
cd server && npm install
cd ../client && npm install
```

### Cookies Not Being Set
- Clear browser cookies for localhost
- Ensure you're using `http://localhost:3000` not `127.0.0.1:3000`
- Check browser console for errors

## Testing the Setup

Try these to confirm everything works:

1. ✅ Register a new account
2. ✅ Login
3. ✅ Create a post
4. ✅ Add a comment
5. ✅ Edit your post
6. ✅ Delete your comment
7. ✅ Logout and login again
8. ✅ Make yourself admin
9. ✅ Access admin dashboard
10. ✅ Manage users and posts

## Default Test Data (Optional)

Want to populate with test data? Use MongoDB shell:

```javascript
use blog-system

// You'll need to register a user first to get the password hash
// or use this sample (password: "test123")
db.users.insertOne({
  username: "testuser",
  email: "test@example.com",
  password: "$2a$10$xGx5kM5YqJqYQZnHt1qGl.UjF5FjLFBVPqUZ8KVQxPTmVpJJqPxXK",
  role: "user",
  createdAt: new Date(),
  updatedAt: new Date()
})
```

## Next Steps

- Read the full [README.md](README.md) for complete documentation
- Explore the API endpoints
- Customize the styling in CSS files
- Add your own features!

## Need Help?

- Check the full README.md
- Review the code comments
- Open an issue on GitHub

---

**You're all set! Happy coding! 🚀**

