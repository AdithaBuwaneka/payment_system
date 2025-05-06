// scripts/createAdmin.js
const mongoose = require('mongoose');
const User = require('../models/User');
const dotenv = require('dotenv');

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/payment-system');
    
    const adminUser = new User({
      email: 'admin@example.com',
      password: 'securePassword123',  // This will be hashed by the pre-save hook
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin'
    });
    
    await adminUser.save();
    console.log('Admin user created successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
};

createAdmin();