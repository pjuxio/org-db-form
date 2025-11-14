#!/usr/bin/env node
// Script to create a new user (invite-only system)
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

async function createUser() {
  try {
    console.log('\n🌍 Climate Justice DB - Create User\n');
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected\n');

    const email = await question('Email: ');
    const name = await question('Name: ');
    const password = await question('Password: ');
    const roleInput = await question('Role (admin/editor) [editor]: ');
    const role = roleInput.toLowerCase() === 'admin' ? 'admin' : 'editor';

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      console.log('\n❌ User with this email already exists!');
      process.exit(1);
    }

    // Create user
    const user = new User({
      email: email.toLowerCase(),
      name,
      password,
      role,
      createdBy: 'admin-script'
    });

    await user.save();

    console.log('\n✅ User created successfully!');
    console.log('\n📋 User Details:');
    console.log(`   Email: ${user.email}`);
    console.log(`   Name: ${user.name}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Created: ${user.createdAt}`);
    console.log('\n👉 User can now login at: /login.html\n');

  } catch (error) {
    console.error('\n❌ Error creating user:', error.message);
  } finally {
    await mongoose.connection.close();
    rl.close();
    process.exit();
  }
}

createUser();
