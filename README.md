# MERN Blog System

A full-stack blog application built with the MERN stack (MongoDB, Express.js, React.js, Node.js) featuring JWT authentication with httpOnly cookies, role-based authorization, post management, and comment functionality.

## Features

### Authentication & Authorization
- **JWT Authentication** with access and refresh tokens stored in httpOnly cookies
- **Role-Based Access Control (RBAC)** with User and Admin roles
- Secure password hashing with bcrypt (10 salt rounds)
- **Rate Limiting** on authentication endpoints to prevent brute-force attacks
  - Registration: 5 attempts per 15 minutes
  - Login: 10 attempts per 15 minutes
  - Refresh token: 20 attempts per 15 minutes
- **Social Login (OAuth 2.0)**:
  - Google OAuth integration
  - Facebook OAuth integration
  - Automatic account creation for new social users
  - Account linking for existing email/password users
- Protected routes on both frontend and backend
- Automatic token refresh on expiration

### User Features
- User registration and login
- Create, edit, and delete own posts
- Comment on any post
- Delete own comments
- View user profile

### Admin Features
- Full admin dashboard
- Manage all users (view, delete, change roles)
- Delete any post or comment
- View system statistics

### Post Management
- Create and publish blog posts
- Edit own posts (or any post as admin)
- Delete own posts (or any post as admin)
- Rich text content support
- Pagination for post listings
- Author information display

### Comment System
- Add comments to posts
- Delete own comments
- Post authors can delete comments on their posts
- Admins can delete any comment
- Real-time comment display

## Tech Stack

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing
- **cookie-parser** - Parse cookies
- **cors** - Cross-origin resource sharing

### Frontend
- **React.js** - UI library
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Context API** - State management

## Project Structure

```
blog-system/
├── server/                     # Backend
│   ├── config/
│   │   └── db.js              # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js  # Auth logic
│   │   ├── userController.js  # User management
│   │   ├── postController.js  # Post CRUD
│   │   └── commentController.js # Comment CRUD
│   ├── middleware/
│   │   └── authMiddleware.js  # Auth & admin middleware
│   ├── models/
│   │   ├── User.js            # User schema
│   │   ├── Post.js            # Post schema
│   │   └── Comment.js         # Comment schema
│   ├── routes/
│   │   ├── authRoutes.js      # Auth endpoints
│   │   ├── userRoutes.js      # User endpoints
│   │   ├── postRoutes.js      # Post endpoints
│   │   └── commentRoutes.js   # Comment endpoints
│   ├── utils/
│   │   └── generateToken.js   # JWT utilities
│   ├── .env                   # Environment variables
│   ├── package.json
│   └── server.js              # Entry point
│
├── client/                     # Frontend
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.js      # Navigation bar
│   │   │   ├── PostCard.js    # Post preview card
│   │   │   ├── CommentList.js # Comments display
│   │   │   ├── CommentForm.js # Comment input
│   │   │   ├── ProtectedRoute.js # Auth route wrapper
│   │   │   └── AdminRoute.js  # Admin route wrapper
│   │   ├── context/
│   │   │   └── AuthContext.js # Auth state management
│   │   ├── pages/
│   │   │   ├── Home.js        # Post listing
│   │   │   ├── Login.js       # Login page
│   │   │   ├── Register.js    # Registration page
│   │   │   ├── PostDetail.js  # Single post view
│   │   │   ├── CreatePost.js  # Create post form
│   │   │   ├── EditPost.js    # Edit post form
│   │   │   ├── Profile.js     # User profile
│   │   │   └── AdminDashboard.js # Admin panel
│   │   ├── services/
│   │   │   └── api.js         # API service layer
│   │   ├── App.js             # Main app component
│   │   ├── App.css
│   │   ├── index.js           # Entry point
│   │   └── index.css
│   └── package.json
│
└── README.md
```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- npm or yarn

### Backend Setup

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the server directory:
```env
MONGO_URI=mongodb://localhost:27017/blog-system
JWT_ACCESS_SECRET=your_access_secret_key_change_in_production
JWT_REFRESH_SECRET=your_refresh_secret_key_change_in_production
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:3000
SESSION_SECRET=your_session_secret_change_in_production

# Google OAuth 2.0 (Optional - leave empty if not using Google login)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# Facebook OAuth 2.0 (Optional - leave empty if not using Facebook login)
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
FACEBOOK_CALLBACK_URL=http://localhost:5000/api/auth/facebook/callback
```

4. Start the server:
```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

The server will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The application will open at `http://localhost:3000`

## API Endpoints

### Authentication Routes (`/api/auth`)
- `POST /register` - Register a new user (rate limited: 5 attempts/15min)
- `POST /login` - Login user (rate limited: 10 attempts/15min)
- `POST /logout` - Logout user
- `POST /refresh` - Refresh access token (rate limited: 20 attempts/15min)
- `GET /me` - Get current user (protected)
- `GET /google` - Initiate Google OAuth login
- `GET /google/callback` - Google OAuth callback
- `GET /facebook` - Initiate Facebook OAuth login
- `GET /facebook/callback` - Facebook OAuth callback

### User Routes (`/api/users`) - Admin Only
- `GET /` - Get all users
- `DELETE /:id` - Delete user
- `PATCH /:id/role` - Update user role

### Post Routes (`/api/posts`)
- `GET /` - Get all posts (public)
- `GET /:id` - Get single post with comments (public)
- `POST /` - Create post (authenticated)
- `PUT /:id` - Update post (author or admin)
- `DELETE /:id` - Delete post (author or admin)
- `GET /my/posts` - Get authenticated user's posts (authenticated)
- `GET /admin/all` - Admin view of all posts with metadata (admin only)
- `GET /admin/:id` - Admin view of single post with full details (admin only)
- `POST /admin/bulk-delete` - Bulk delete posts (admin only)

### Comment Routes (`/api/comments`)
- `POST /` - Create comment (authenticated)
- `DELETE /:id` - Delete comment (author, post author, or admin)

## OAuth 2.0 Setup (Google & Facebook)

### Google OAuth Setup

1. **Create Google OAuth Credentials:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Enable Google+ API
   - Go to "Credentials" → "Create Credentials" → "OAuth client ID"
   - Choose "Web application"
   - Add authorized redirect URI: `http://localhost:5000/api/auth/google/callback` (or your production URL)
   - Copy Client ID and Client Secret

2. **Update `.env` file:**
   ```env
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
   ```

### Facebook OAuth Setup

1. **Create Facebook App:**
   - Go to [Facebook Developers](https://developers.facebook.com/)
   - Create a new app or select existing one
   - Add "Facebook Login" product
   - Go to Settings → Basic
   - Copy App ID and App Secret
   - Add authorized redirect URI: `http://localhost:5000/api/auth/facebook/callback` (or your production URL)

2. **Update `.env` file:**
   ```env
   FACEBOOK_APP_ID=your_facebook_app_id
   FACEBOOK_APP_SECRET=your_facebook_app_secret
   FACEBOOK_CALLBACK_URL=http://localhost:5000/api/auth/facebook/callback
   ```

**Note:** OAuth is optional. If you don't configure Google/Facebook credentials, the social login buttons will still appear but will result in errors when clicked. You can still use email/password authentication.

## Usage Guide

### Getting Started

1. **Register an Account**
   - Click "Register" in the navigation
   - Option 1: Use social login (Google/Facebook) - no password needed
   - Option 2: Fill in username, email, and password
   - You'll be automatically logged in

2. **Login**
   - Click "Login" in the navigation
   - Option 1: Use "Login with Google" or "Login with Facebook"
   - Option 2: Enter email and password

3. **Create a Post**
   - After logging in, click "New Post"
   - Enter a title and content
   - Click "Create Post"

4. **Comment on Posts**
   - Click on any post to view details
   - Scroll to the comments section
   - Add your comment

### Admin Features

To promote a user to admin, you'll need to either:
- Use the admin dashboard (if you already have an admin account)
- Manually update the user's role in MongoDB:

```javascript
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "admin" } }
)
```

Once you're an admin, you can:
- Access the Admin Dashboard from the navigation
- Manage all users and posts
- Change user roles
- Delete any content

## Role-Based Access Control (RBAC)

The application implements comprehensive Role-Based Access Control (RBAC) at the API level, ensuring all authorization checks are enforced server-side, never relying on frontend-only validation.

### User Roles

The system supports two user roles:

1. **Regular User (`user`)** - Default role for all new registrations
   - Can create, edit, and delete only their own posts
   - Can comment on any post
   - Can delete their own comments or comments on their own posts
   - Cannot manage other users
   - Cannot access admin endpoints

2. **Admin (`admin`)** - Elevated privileges
   - Can manage all users (view, delete, change roles)
   - Can edit and delete any post
   - Can delete any comment
   - Can access admin-specific endpoints
   - Can perform bulk operations

### RBAC Implementation

**Middleware:**
- `authMiddleware` - Verifies JWT token and attaches user info to request
- `adminMiddleware` - Ensures user has admin role
- `checkOwnershipOrAdmin()` - Reusable middleware for ownership checks

**Helper Functions:**
- `isAdmin()` - Check if user is admin
- `isOwnerOrAdmin()` - Check if user owns resource or is admin
- `canManagePost()` - Check post management permissions
- `canDeleteComment()` - Check comment deletion permissions

**Authorization Enforcement:**
- All permission checks occur at the API/backend level
- Controllers use RBAC helpers to verify permissions
- Consistent error messages with error codes
- Clear distinction between 401 (unauthorized) and 403 (forbidden)

### Permissions Matrix

| Resource | Action | Regular User | Admin |
|----------|--------|--------------|-------|
| **Posts** | | | |
| | Create | ✅ Own | ✅ Any |
| | Read | ✅ All (public) | ✅ All |
| | Update | ✅ Own only | ✅ Any |
| | Delete | ✅ Own only | ✅ Any |
| | List Own | ✅ Yes (`/api/posts/my/posts`) | ✅ Yes |
| | Admin View | ❌ No | ✅ Yes (`/api/posts/admin/all`) |
| **Users** | | | |
| | View All | ❌ No | ✅ Yes (`/api/users`) |
| | Delete | ❌ No | ✅ Yes (`/api/users/:id`) |
| | Change Role | ❌ No | ✅ Yes (`/api/users/:id/role`) |
| **Comments** | | | |
| | Create | ✅ Any post | ✅ Any post |
| | Delete Own | ✅ Yes | ✅ Yes |
| | Delete (on own post) | ✅ Yes | ✅ Yes |
| | Delete Any | ❌ No | ✅ Yes |

### RBAC Error Codes

The API returns consistent error codes for authorization failures:

- `AUTH_REQUIRED` (401) - User not authenticated
- `INVALID_TOKEN` (401) - Invalid or expired token
- `FORBIDDEN` (403) - User authenticated but lacks permission
- `ADMIN_REQUIRED` (403) - Admin role required
- `POST_NOT_FOUND` (404) - Post does not exist
- `USER_NOT_FOUND` (404) - User does not exist
- `COMMENT_NOT_FOUND` (404) - Comment does not exist

### API Routes by Access Level

**Public Routes:**
- `GET /api/posts` - List all posts
- `GET /api/posts/:id` - Get single post

**Authenticated User Routes:**
- `POST /api/posts` - Create post
- `PUT /api/posts/:id` - Update own post (or any post if admin)
- `DELETE /api/posts/:id` - Delete own post (or any post if admin)
- `GET /api/posts/my/posts` - Get authenticated user's posts
- `POST /api/comments` - Create comment
- `DELETE /api/comments/:id` - Delete comment (own, on own post, or admin)

**Admin-Only Routes:**
- `GET /api/users` - List all users
- `DELETE /api/users/:id` - Delete user
- `PATCH /api/users/:id/role` - Update user role
- `GET /api/posts/admin/all` - Admin view of all posts (with metadata)
- `GET /api/posts/admin/:id` - Admin view of single post (with full details)
- `POST /api/posts/admin/bulk-delete` - Bulk delete posts

### Example: Using RBAC Middleware

```javascript
// In a route file
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

// Require authentication
router.get('/protected', authMiddleware, controller);

// Require admin role
router.get('/admin-only', authMiddleware, adminMiddleware, controller);

// Check ownership or admin
const checkOwnershipOrAdmin = require('../middleware/rbacMiddleware').checkOwnershipOrAdmin;
router.put('/:id', authMiddleware, checkOwnershipOrAdmin(async (req) => {
  const post = await Post.findById(req.params.id);
  return post.author;
}), controller);
```

## Security Features

- **Password Security**: Passwords are hashed using bcrypt with 10 salt rounds
- **httpOnly Cookies**: Tokens stored in httpOnly cookies prevent XSS attacks
- **CORS Protection**: Configured to accept requests only from the frontend URL
- **Token Expiration**: Access tokens expire after 15 minutes, refresh tokens after 7 days
- **Rate Limiting**: Authentication endpoints protected against brute-force attacks:
  - Registration: 5 attempts per 15 minutes per IP
  - Login: 10 attempts per 15 minutes per IP
  - Refresh token: 20 attempts per 15 minutes per IP
- **OAuth 2.0 Security**: 
  - Server-side token validation
  - Secure OAuth callback handling
  - Email verification from OAuth providers
- **Role-Based Access**: Middleware enforces permissions on all protected routes
- **Input Validation**: Mongoose schemas validate all user inputs

## Development Tips

### Adding Test Data

You can use MongoDB Compass or the MongoDB shell to add test data:

```javascript
// Create test users
db.users.insertMany([
  {
    username: "testuser",
    email: "test@example.com",
    password: "$2a$10$YourHashedPasswordHere",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date()
  }
])
```

### Debugging

- Backend logs are printed to the console
- Check browser DevTools Network tab for API calls
- MongoDB errors will show in the server console

### Common Issues

1. **CORS Errors**: Ensure `CLIENT_URL` in `.env` matches your frontend URL
2. **MongoDB Connection Failed**: Check if MongoDB is running and URI is correct
3. **Token Errors**: Clear cookies and log in again
4. **Port Already in Use**: Change the PORT in `.env`

## Testing the Application

### Manual Testing Checklist

1. **Authentication**
   - [ ] Register new user
   - [ ] Login with valid credentials
   - [ ] Login with invalid credentials (should fail)
   - [ ] Access protected routes (should redirect if not logged in)
   - [ ] Logout

2. **Posts**
   - [ ] Create new post
   - [ ] Edit own post
   - [ ] Delete own post
   - [ ] View all posts with pagination
   - [ ] View single post

3. **Comments**
   - [ ] Add comment to post
   - [ ] Delete own comment
   - [ ] Delete comment on own post (as post author)

4. **Admin**
   - [ ] Access admin dashboard
   - [ ] View all users
   - [ ] Change user role
   - [ ] Delete user
   - [ ] Delete any post

## Deployment

### Backend Deployment (Heroku Example)

1. Create a Heroku app
2. Set environment variables in Heroku dashboard
3. Deploy:
```bash
git push heroku main
```

### Frontend Deployment (Netlify/Vercel Example)

1. Build the production version:
```bash
npm run build
```

2. Deploy the `build` folder
3. Update API URL in the frontend to point to deployed backend

### Environment Variables for Production

Backend:
```env
MONGO_URI=your_mongodb_atlas_uri
JWT_ACCESS_SECRET=secure_random_string_256_bits
JWT_REFRESH_SECRET=another_secure_random_string_256_bits
NODE_ENV=production
PORT=5000
CLIENT_URL=https://your-frontend-domain.com
```

## Future Enhancements

- [ ] Add post categories/tags
- [ ] Implement search functionality
- [ ] Add user avatars with image upload
- [ ] Email verification for registration
- [ ] Password reset functionality
- [ ] Rich text editor for posts
- [ ] Like/upvote system for posts
- [ ] User profile pages with post history
- [ ] Social media integration
- [ ] Real-time notifications

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE).

## Author

Built as a demonstration of MERN stack capabilities with modern authentication patterns.

## Support

For issues, questions, or contributions, please open an issue in the GitHub repository.

---

**Happy Blogging! 📝**

