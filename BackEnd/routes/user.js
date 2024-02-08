// routes/user.js
const express = require('express');
const router = express.Router();
const User = require('../models/users');

// Route to get user data with additional information for creating an order
router.get('/getUser/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Extract all user data for response
    const userData = {
      name: user.name,
      email: user.email,
      phone: user.phone,
      street: user.street,
      apartment: user.apartment,
      zip: user.zip,
      city: user.city,
      country: user.country,
      role: user.role,
      isVerified: user.isVerified,
      shippingAddress1: user.shippingAddress1,
      // Add other user properties as needed
    };

    // Send the user data in the response
    res.status(200).json(userData);
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
