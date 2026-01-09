const fs = require('fs');
const path = require('path');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const User = require('../models/User');
const {
  generateAccessToken,
  generateRefreshToken,
} = require('../utils/generateToken');

const logToFile = (message) => {
  const logPath = path.join(__dirname, '..', 'debug_oauth.log');
  const timestamp = new Date().toISOString();
  fs.appendFileSync(logPath, `[${timestamp}] ${message}\n`);
};

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user._id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// ============================================
// GOOGLE OAUTH STRATEGY CONFIGURATION
// ============================================
// This strategy handles authentication via Google OAuth 2.0
// Only configured if GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are present in .env
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        // Client ID from Google Cloud Console
        clientID: process.env.GOOGLE_CLIENT_ID,
        // Client Secret from Google Cloud Console
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        // URL where Google redirects after authentication
        // Must match the callback URL configured in Google Cloud Console
        callbackURL: process.env.GOOGLE_CALLBACK_URL || `http://localhost:${process.env.PORT || 5000}/api/auth/google/callback`,
      },
      // Callback function executed after Google authenticates the user
      // @param accessToken - Token to access Google APIs on behalf of user
      // @param refreshToken - Token to refresh the access token
      // @param profile - User's Google profile information
      // @param done - Passport callback to complete authentication
      async (accessToken, refreshToken, profile, done) => {
        try {
          console.log('Google OAuth: Authentication initiated for profile:', profile.id);
          logToFile(`Google OAuth: Authentication initiated for profile: ${profile.id}`);
          logToFile(`Google OAuth: Profile emails: ${JSON.stringify(profile.emails)}`);
          console.log('Google OAuth: Profile emails:', profile.emails);

          // Validate that Google provided an email address
          // Email is required for our user system
          if (!profile.emails || !profile.emails[0] || !profile.emails[0].value) {
            console.error('Google OAuth: No email provided in profile');
            return done(new Error('No email provided by Google'), null);
          }

          // STEP 1: Check if user already exists with this Google ID
          let user = await User.findOne({ googleId: profile.id });

          if (user) {
            console.log('Google OAuth: Existing user found with Google ID:', profile.id);
            // User already linked to this Google account, return user
            return done(null, user);
          }

          // STEP 2: Check if user exists with this email (registered via email/password)
          user = await User.findOne({ email: profile.emails[0].value });

          if (user) {
            console.log('Google OAuth: Linking Google account to existing email user:', user.email);
            // User exists with this email, link their Google account
            user.googleId = profile.id;
            // Set username if not already set
            if (!user.username) {
              user.username = profile.displayName || profile.emails[0].value.split('@')[0];
            }
            await user.save();
            return done(null, user);
          }

          // STEP 3: New user - create account with Google information
          const username = profile.displayName || profile.emails[0].value.split('@')[0];

          // Generate unique username if the desired username is already taken
          let uniqueUsername = username;
          let counter = 1;
          while (await User.findOne({ username: uniqueUsername })) {
            uniqueUsername = `${username}${counter}`;
            counter++;
          }

          console.log('Google OAuth: Creating new user with username:', uniqueUsername);
          user = await User.create({
            username: uniqueUsername,
            email: profile.emails[0].value,
            googleId: profile.id,
            role: 'user', // Default role for new users
          });

          console.log('Google OAuth: User created successfully:', user._id);
          return done(null, user);
        } catch (error) {
          console.error('Google OAuth Strategy Error:', error);
          return done(error, null);
        }
      }
    )
  );
}

// ============================================
// FACEBOOK OAUTH STRATEGY CONFIGURATION
// ============================================
// This strategy handles authentication via Facebook OAuth
// Only configured if FACEBOOK_APP_ID and FACEBOOK_APP_SECRET are present in .env
if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
  passport.use(
    new FacebookStrategy(
      {
        // App ID from Facebook Developers Console
        clientID: process.env.FACEBOOK_APP_ID,
        // App Secret from Facebook Developers Console
        clientSecret: process.env.FACEBOOK_APP_SECRET,
        // URL where Facebook redirects after authentication
        // Must match the callback URL configured in Facebook App settings
        callbackURL: process.env.FACEBOOK_CALLBACK_URL || `http://localhost:${process.env.PORT || 5000}/api/auth/facebook/callback`,
        // Specify which profile fields to retrieve from Facebook
        profileFields: ['id', 'displayName', 'email'],
      },
      // Callback function executed after Facebook authenticates the user
      // @param accessToken - Token to access Facebook APIs on behalf of user
      // @param refreshToken - Token to refresh the access token
      // @param profile - User's Facebook profile information
      // @param done - Passport callback to complete authentication
      async (accessToken, refreshToken, profile, done) => {
        try {
          console.log('Facebook OAuth: Authentication initiated for profile:', profile.id);

          // STEP 1: Check if user already exists with this Facebook ID
          let user = await User.findOne({ facebookId: profile.id });

          if (user) {
            console.log('Facebook OAuth: Existing user found with Facebook ID:', profile.id);
            // User already linked to this Facebook account, return user
            return done(null, user);
          }

          // STEP 2: Check if user exists with this email (if Facebook provided email)
          // Note: Facebook doesn't always provide email if user hasn't granted permission
          if (profile.emails && profile.emails[0]) {
            user = await User.findOne({ email: profile.emails[0].value });

            if (user) {
              console.log('Facebook OAuth: Linking Facebook account to existing email user');
              // User exists with this email, link their Facebook account
              user.facebookId = profile.id;
              // Set username if not already set
              if (!user.username) {
                user.username = profile.displayName || profile.emails[0].value.split('@')[0];
              }
              await user.save();
              return done(null, user);
            }
          }

          // STEP 3: New user - create account with Facebook information
          // If Facebook didn't provide email, create a placeholder email
          const email = profile.emails?.[0]?.value || `${profile.id}@facebook.placeholder`;
          const username = profile.displayName || email.split('@')[0];

          // Generate unique username if the desired username is already taken
          let uniqueUsername = username;
          let counter = 1;
          while (await User.findOne({ username: uniqueUsername })) {
            uniqueUsername = `${username}${counter}`;
            counter++;
          }

          console.log('Facebook OAuth: Creating new user with username:', uniqueUsername);
          user = await User.create({
            username: uniqueUsername,
            email: email,
            facebookId: profile.id,
            role: 'user', // Default role for new users
          });

          console.log('Facebook OAuth: User created successfully:', user._id);
          return done(null, user);
        } catch (error) {
          console.error('Facebook OAuth Strategy Error:', error);
          return done(error, null);
        }
      }
    )
  );
}

module.exports = passport;

