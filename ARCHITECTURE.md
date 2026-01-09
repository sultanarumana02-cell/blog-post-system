# MERN Blog System - Architecture Documentation

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT BROWSER                          │
│                      http://localhost:3000                      │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            │ HTTP Requests
                            │ (with httpOnly cookies)
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│                      REACT FRONTEND                             │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Components: Navbar, PostCard, CommentList, etc.       │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Pages: Home, Login, PostDetail, AdminDashboard, etc.  │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Context: AuthContext (Global State)                   │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Services: API (Axios with interceptors)               │   │
│  └─────────────────────────────────────────────────────────┘   │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            │ API Calls
                            │ /api/*
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│                    EXPRESS.JS BACKEND                           │
│                   http://localhost:5000                         │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Routes: /auth, /users, /posts, /comments              │   │
│  └───────────────────────┬─────────────────────────────────┘   │
│  ┌───────────────────────▼─────────────────────────────────┐   │
│  │  Middleware: authMiddleware, adminMiddleware           │   │
│  └───────────────────────┬─────────────────────────────────┘   │
│  ┌───────────────────────▼─────────────────────────────────┐   │
│  │  Controllers: Business Logic                           │   │
│  └───────────────────────┬─────────────────────────────────┘   │
│  ┌───────────────────────▼─────────────────────────────────┐   │
│  │  Models: Mongoose Schemas (User, Post, Comment)        │   │
│  └───────────────────────┬─────────────────────────────────┘   │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            │ Mongoose ODM
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│                      MONGODB DATABASE                           │
│                  mongodb://localhost:27017                      │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Collections: users, posts, comments                    │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## Authentication Flow

```
┌──────────┐                                    ┌──────────┐
│  Client  │                                    │  Server  │
└────┬─────┘                                    └────┬─────┘
     │                                                │
     │  1. POST /api/auth/login                      │
     │  { email, password }                          │
     ├──────────────────────────────────────────────►│
     │                                                │
     │                              2. Verify password│
     │                              3. Generate JWT   │
     │                                                │
     │  4. Set httpOnly cookies:                     │
     │     - accessToken (15 min)                    │
     │     - refreshToken (7 days)                   │
     │◄──────────────────────────────────────────────┤
     │  { user: { id, username, email, role } }      │
     │                                                │
     │  5. Subsequent requests include cookies       │
     │  automatically                                 │
     ├──────────────────────────────────────────────►│
     │                                                │
     │                          6. Verify accessToken │
     │                          7. Attach user to req │
     │                                                │
     │  8. If token expired (401):                   │
     │◄──────────────────────────────────────────────┤
     │                                                │
     │  9. Axios interceptor auto-calls:             │
     │  POST /api/auth/refresh                       │
     ├──────────────────────────────────────────────►│
     │                                                │
     │                     10. Verify refreshToken    │
     │                     11. Issue new accessToken  │
     │                                                │
     │  12. New accessToken cookie                   │
     │◄──────────────────────────────────────────────┤
     │                                                │
     │  13. Retry original request                   │
     ├──────────────────────────────────────────────►│
     │                                                │
     │  14. Success response                         │
     │◄──────────────────────────────────────────────┤
     │                                                │
```

## Request Flow - Creating a Post

```
User Action: Click "Create Post" button
     │
     ▼
┌─────────────────────────────────────┐
│  1. Navigate to /posts/new          │
│     (React Router)                  │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  2. ProtectedRoute checks auth      │
│     - If not logged in: → /login   │
│     - If logged in: → Continue      │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  3. Render CreatePost component     │
│     - Display form                  │
└──────────────┬──────────────────────┘
               │
User fills form and submits
               │
               ▼
┌─────────────────────────────────────┐
│  4. handleSubmit()                  │
│     - Validate form data            │
│     - Call postAPI.createPost()     │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  5. Axios POST /api/posts           │
│     - Includes cookies              │
│     - Body: { title, content }      │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  6. Express receives request        │
│     - CORS check                    │
│     - Parse cookies                 │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  7. authMiddleware                  │
│     - Verify accessToken            │
│     - Attach user to req.user       │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  8. postController.createPost()     │
│     - Extract title, content        │
│     - Get userId from req.user      │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  9. Post.create()                   │
│     - Save to MongoDB               │
│     - Populate author               │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ 10. Send response                   │
│     - Status: 201                   │
│     - Body: { post: {...} }         │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ 11. Axios receives response         │
│     - Return data to component      │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ 12. Component handles success       │
│     - Navigate to post detail page  │
│     - URL: /posts/:id               │
└─────────────────────────────────────┘
```

## Permission System

```
┌─────────────────────────────────────────────────────────────┐
│                        USER REQUESTS ACTION                 │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
              ┌──────────────────────────┐
              │   Is user logged in?     │
              └────┬──────────────┬──────┘
                   │ NO           │ YES
                   │              │
                   ▼              ▼
            ┌──────────┐    ┌──────────────────┐
            │  REJECT  │    │  Check role      │
            │  401     │    │  and ownership   │
            └──────────┘    └────┬─────────────┘
                                 │
                    ┌────────────┼────────────┐
                    │            │            │
                    ▼            ▼            ▼
              ┌──────────┐ ┌─────────┐ ┌──────────┐
              │  ADMIN   │ │  OWNER  │ │  USER    │
              └────┬─────┘ └────┬────┘ └────┬─────┘
                   │            │            │
                   │            │            │
    ┌──────────────┼────────────┼────────────┼──────────────┐
    │              │            │            │              │
    ▼              ▼            ▼            ▼              ▼
Manage         Delete        Edit        Create        View
Users          Any          Own         Content       Public
Posts        Content      Content                   Content
Users
```

### Permission Matrix Detail

```
Action                  │ Anonymous │ User (Own) │ User (Other) │ Admin
────────────────────────┼───────────┼────────────┼──────────────┼───────
View Posts              │     ✓     │     ✓      │      ✓       │   ✓
View Post Detail        │     ✓     │     ✓      │      ✓       │   ✓
Create Post             │     ✗     │     ✓      │      -       │   ✓
Edit Own Post           │     ✗     │     ✓      │      ✗       │   ✓
Edit Other's Post       │     ✗     │     ✗      │      ✗       │   ✓
Delete Own Post         │     ✗     │     ✓      │      ✗       │   ✓
Delete Other's Post     │     ✗     │     ✗      │      ✗       │   ✓
────────────────────────┼───────────┼────────────┼──────────────┼───────
Create Comment          │     ✗     │     ✓      │      ✓       │   ✓
Delete Own Comment      │     ✗     │     ✓      │      -       │   ✓
Delete Comment on Post  │     ✗     │  ✓ (own)   │      ✗       │   ✓
Delete Any Comment      │     ✗     │     ✗      │      ✗       │   ✓
────────────────────────┼───────────┼────────────┼──────────────┼───────
View Users              │     ✗     │     ✗      │      ✗       │   ✓
Delete User             │     ✗     │     ✗      │      ✗       │   ✓
Change User Role        │     ✗     │     ✗      │      ✗       │   ✓
────────────────────────┼───────────┼────────────┼──────────────┼───────
Access Admin Dashboard  │     ✗     │     ✗      │      ✗       │   ✓
```

## Data Flow - Comment Deletion

```
┌─────────────────────────────────────────────────────────────────┐
│  User clicks "Delete" button on a comment                       │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│  1. CommentList.handleDelete(commentId)                         │
│     - Show confirmation dialog                                  │
│     - If confirmed, proceed                                     │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│  2. commentAPI.deleteComment(commentId)                         │
│     - DELETE /api/comments/:id                                  │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│  3. Backend: authMiddleware                                     │
│     - Verify user is logged in                                  │
│     - Attach user info to req.user                              │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│  4. Backend: commentController.deleteComment()                  │
│     - Find comment by ID with .populate('post')                 │
│     - Check permissions:                                        │
│       ✓ Is user the comment author?                            │
│       ✓ Is user the post author?                               │
│       ✓ Is user an admin?                                      │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                ┌──────────┴──────────┐
                │                     │
                ▼                     ▼
        ┌──────────────┐      ┌──────────────┐
        │  AUTHORIZED  │      │ UNAUTHORIZED │
        └──────┬───────┘      └──────┬───────┘
               │                     │
               ▼                     ▼
     ┌──────────────────┐   ┌────────────────┐
     │  Delete comment  │   │  Return 403    │
     │  from MongoDB    │   │  Access Denied │
     └────────┬─────────┘   └────────────────┘
              │
              ▼
     ┌──────────────────┐
     │  Return 200      │
     │  Success message │
     └────────┬─────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────────┐
│  5. Frontend: Update UI                                         │
│     - Remove comment from local state                           │
│     - UI updates without page reload                            │
└─────────────────────────────────────────────────────────────────┘
```

## Database Relationships

```
┌─────────────────────────────────────────────────────────────────┐
│                            USERS                                │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  _id: ObjectId                                            │ │
│  │  username: String                                         │ │
│  │  email: String                                            │ │
│  │  password: String (hashed)                                │ │
│  │  role: String (user/admin)                                │ │
│  │  createdAt: Date                                          │ │
│  │  updatedAt: Date                                          │ │
│  └───────────────────────────────────────────────────────────┘ │
└────────────┬────────────────────────────────┬───────────────────┘
             │                                │
             │ author                         │ author
             │ (one-to-many)                  │ (one-to-many)
             │                                │
┌────────────▼──────────────┐    ┌───────────▼──────────────────┐
│         POSTS             │    │        COMMENTS              │
│  ┌──────────────────────┐ │    │  ┌─────────────────────────┐ │
│  │  _id: ObjectId       │ │    │  │  _id: ObjectId          │ │
│  │  title: String       │ │    │  │  content: String        │ │
│  │  content: String     │ │    │  │  author: ObjectId ──────┼─┘
│  │  author: ObjectId ───┼─┘    │  │  post: ObjectId         │
│  │  createdAt: Date     │      │  │  createdAt: Date        │
│  │  updatedAt: Date     │      │  └──────────┬──────────────┘
│  └──────────────────────┘      └─────────────┼────────────────┘
└─────────────────────────────────────────────►│
                                      post      │
                                  (many-to-one) │
```

## Component Hierarchy

```
App
├── AuthProvider (Context)
│   └── Router
│       ├── Navbar
│       │   ├── Links (conditional on auth state)
│       │   └── User Menu (conditional on auth state)
│       │
│       └── Routes
│           ├── Home
│           │   └── PostCard (multiple)
│           │
│           ├── Login
│           │   └── Form
│           │
│           ├── Register
│           │   └── Form
│           │
│           ├── ProtectedRoute
│           │   ├── CreatePost
│           │   │   └── Form
│           │   │
│           │   ├── EditPost
│           │   │   └── Form
│           │   │
│           │   └── Profile
│           │       └── User Info Display
│           │
│           ├── PostDetail
│           │   ├── Post Content
│           │   ├── Edit/Delete Buttons (conditional)
│           │   ├── CommentForm (if authenticated)
│           │   └── CommentList
│           │       └── Comment Items (multiple)
│           │           └── Delete Button (conditional)
│           │
│           └── AdminRoute
│               └── AdminDashboard
│                   ├── Tabs (Users/Posts)
│                   ├── Users Table (if Users tab)
│                   │   └── User Actions
│                   └── Posts Table (if Posts tab)
│                       └── Post Actions
```

## State Management Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        AuthContext                              │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  State:                                                    │ │
│  │    - user: null | { id, username, email, role }           │ │
│  │    - loading: boolean                                     │ │
│  │                                                            │ │
│  │  Functions:                                               │ │
│  │    - login(credentials)                                   │ │
│  │    - register(userData)                                   │ │
│  │    - logout()                                             │ │
│  │    - isAuthenticated()                                    │ │
│  │    - isAdmin()                                            │ │
│  │    - checkAuth()                                          │ │
│  └───────────────────────────────────────────────────────────┘ │
└────────────┬────────────────────────────────────────────────────┘
             │
             │ Provided to all components via Context
             │
┌────────────▼────────────────────────────────────────────────────┐
│  Any Component using useAuth()                                  │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  const { user, login, logout, isAdmin } = useAuth();      │ │
│  │                                                            │ │
│  │  // Can access user state and auth functions             │ │
│  │  // React re-renders on state changes                    │ │
│  └───────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## File Organization Philosophy

```
Separation of Concerns:

├── Backend (server/)
│   ├── Routes      → Define API endpoints
│   ├── Controllers → Business logic
│   ├── Models      → Data structure
│   ├── Middleware  → Request processing
│   └── Utils       → Helper functions
│
└── Frontend (client/src/)
    ├── Pages       → Full page views
    ├── Components  → Reusable UI pieces
    ├── Context     → Global state
    ├── Services    → API communication
    └── Styles      → Component styling

Each layer has a single responsibility
Changes are isolated and maintainable
```

---

This architecture provides a scalable, maintainable, and secure foundation for a modern web application.

