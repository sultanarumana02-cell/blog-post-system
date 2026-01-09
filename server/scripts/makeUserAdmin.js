/**
 * Script to promote an existing user to admin
 * Usage: node scripts/makeUserAdmin.js user@example.com
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const makeUserAdmin = async () => {
  try {
    const email = process.argv[2];

    if (!email) {
      console.error('Usage: node scripts/makeUserAdmin.js <email>');
      process.exit(1);
    }

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✓ Connected to MongoDB');

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error(`User with email "${email}" not found`);
    }

    // Check if already admin
    if (user.role === 'admin') {
      console.log(`User "${user.username}" is already an admin`);
      process.exit(0);
    }

    // Update to admin
    user.role = 'admin';
    await user.save();

    console.log('\n✓ User promoted to admin successfully!');
    console.log('-----------------------------------');
    console.log('Username:', user.username);
    console.log('Email:', user.email);
    console.log('Role:', user.role);
    console.log('-----------------------------------');

    process.exit(0);
  } catch (error) {
    console.error('\n✗ Error:', error.message);
    process.exit(1);
  }
};

makeUserAdmin();

