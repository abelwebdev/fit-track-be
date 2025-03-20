const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const cookieParser = require('cookie-parser');

const router = express.Router();
router.use(cookieParser());
// Register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    // Check if the email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    // Create a new user
    const user = new User({ username, email, password });
    await user.save();
    // Respond with success
    res.status(200).json({ message: 'User registered successfully.' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});
// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    // Check if the user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }
    // Verify the password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }
    // Create a JWT payload
    const payload = { id: user.id, name: user.name };
    // Generate the token
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '30d' });
    // Send a response to confirm login
    res.status(200).json({ msg: 'Login successful', token: token });
  
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

router.post('/verify-token', (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: 'No token provided' });
  }
  const token = authHeader.split(' ')[1]; // Extract the token after "Bearer"

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Failed to authenticate token' });
    }
    res.json({ message: 'Token is valid', user: decoded });
  });
});


module.exports = router;