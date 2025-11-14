#!/usr/bin/env node
// Script to reset a user's password
require('dotenv').config();
const mongoose = require('mongoose');
const readline = require('readline');
const User = require('./models/User');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function resetPassword() {
  try {
    console.log('\n🔑 Climate Justice DB - Reset Password\n');
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected\n');

    const email = await question('User email: ');
    
    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      console.log('\n❌ User not found!');
      process.exit(1);
    }

    console.log(`\n👤 User found: ${user.name} (${user.role})`);
    
    const newPassword = await question('New password: ');
    const confirmPassword = await question('Confirm password: ');

    if (newPassword !== confirmPassword) {
      console.log('\n❌ Passwords do not match!');
      process.exit(1);
    }

    if (newPassword.length < 6) {
      console.log('\n❌ Password must be at least 6 characters!');
      process.exit(1);
    }

    // Update password (will be automatically hashed by pre-save hook)
    user.password = newPassword;
    await user.save();

    console.log('\n✅ Password reset successfully!');
    console.log(`\n👉 User ${user.email} can now login with the new password\n`);

  } catch (error) {
    console.error('\n❌ Error resetting password:', error.message);
  } finally {
    await mongoose.connection.close();
    rl.close();
    process.exit();
  }
}

resetPassword();
