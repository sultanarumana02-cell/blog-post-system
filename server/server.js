require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const passport = require('passport');
const connectDB = require('./config/db');

// Validate required environment variables
if (!process.env.CLIENT_URL) {
  console.warn('Warning: CLIENT_URL not set in environment variables. CORS may not work correctly.');
}

// Connect to MongoDB
connectDB();

// Initialize Passport
require('./config/passport');

const app = express();

// Trust proxy - needed for accurate IP detection with express-rate-limit behind a proxy
app.set('trust proxy', 1);

const errorHandler = require('./middleware/errorHandler');
const activityLogger = require('./middleware/activityLogger');
const { authMiddleware } = require('./middleware/authMiddleware');
const AppError = require('./utils/AppError');



// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Session configuration for OAuth
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'your-session-secret-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: 'lax',
      // domain: 'localhost', // Removed to fix dev environment issues
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
}));

// Activity Logger
// We can apply it globally, but let's filter inside the logger or apply to specific path prefixes if needed.
// For now, global application but it filters internally for authenticated users.
app.use(activityLogger);

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/posts', require('./routes/postRoutes'));
app.use('/api/comments', require('./routes/commentRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Handle 404
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

