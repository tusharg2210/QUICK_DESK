const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Category = require('../models/Category');
const User = require('../models/User');

dotenv.config();

const categories = [
  {
    name: 'Technical Support',
    description: 'Issues related to software, hardware, and technical problems',
    color: '#3B82F6'
  },
  {
    name: 'Account & Billing',
    description: 'Account management, billing, and subscription issues',
    color: '#10B981'
  },
  {
    name: 'Feature Request',
    description: 'Suggestions for new features or improvements',
    color: '#8B5CF6'
  },
  {
    name: 'Bug Report',
    description: 'Report software bugs and errors',
    color: '#EF4444'
  },
  {
    name: 'General Inquiry',
    description: 'General questions and information requests',
    color: '#6B7280'
  }
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Create admin user (you'll need to update this with real Firebase UID)
    const adminUser = new User({
      firebaseUid: 'admin-firebase-uid', // Update with real UID
      email: 'admin@quickdesk.com',
      name: 'Admin User',
      role: 'admin'
    });

    const savedAdmin = await adminUser.save();
    console.log('Admin user created');

    // Create categories
    const categoryPromises = categories.map(cat => 
      new Category({
        ...cat,
        createdBy: savedAdmin._id
      }).save()
    );

    await Promise.all(categoryPromises);
    console.log('Categories seeded successfully');

    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();