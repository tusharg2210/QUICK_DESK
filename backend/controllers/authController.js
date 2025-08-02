const User = require('../models/User');
const admin = require('firebase-admin');

const registerOrLogin = async (req, res) => {
  try {
    const { firebaseToken } = req.body;

    if (!firebaseToken) {
      return res.status(400).json({
        success: false,
        message: 'Firebase token is required'
      });
    }

    // Verify Firebase token
    const decodedToken = await admin.auth().verifyIdToken(firebaseToken);
    const { uid, email, name, picture } = decodedToken;

    // Check if user exists
    let user = await User.findOne({ firebaseUid: uid });

    if (!user) {
      // Create new user
      user = new User({
        firebaseUid: uid,
        email: email,
        name: name || email.split('@')[0],
        photoURL: picture || null,
        role: 'enduser' // Default role
      });
      await user.save();
    } else {
      // Update user info if needed
      let updated = false;
      if (user.email !== email) {
        user.email = email;
        updated = true;
      }
      if (name && user.name !== name) {
        user.name = name;
        updated = true;
      }
      if (picture && user.photoURL !== picture) {
        user.photoURL = picture;
        updated = true;
      }
      
      if (updated) {
        await user.save();
      }
    }

    res.json({
      success: true,
      message: 'Authentication successful',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        photoURL: user.photoURL,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication failed',
      error: error.message
    });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-firebaseUid');
    res.json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
      error: error.message
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, notificationPreferences } = req.body;
    
    const user = await User.findById(req.user._id);
    
    if (name) user.name = name;
    if (notificationPreferences) {
      user.notificationPreferences = {
        ...user.notificationPreferences,
        ...notificationPreferences
      };
    }

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
};

module.exports = {
  registerOrLogin,
  getProfile,
  updateProfile
};