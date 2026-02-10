const User = require('../models/User');
const { generateToken } = require('../middleware/auth');
const { validationResult } = require('express-validator');

/**
 * Register new user
 * POST /api/auth/register
 */
exports.register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }
    
    const { email, password, name } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        error: 'Email already registered'
      });
    }
    
    // Create new user
    const user = await User.create({
      email: email.toLowerCase(),
      password,
      name
    });
    
    // Generate token
    const token = generateToken(user.id);
    
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: User.toPublicJSON(user)
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: 'Registration failed',
      details: error.message
    });
  }
};

/**
 * Login user
 * POST /api/auth/login
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required'
      });
    }
    
    // Find user with password
    const user = await User.findByEmailWithPassword(email);
    
    if (!user) {
      return res.status(401).json({
        error: 'Invalid email or password'
      });
    }
    
    // Verify password
    const isMatch = await User.comparePassword(password, user.password);
    
    if (!isMatch) {
      return res.status(401).json({
        error: 'Invalid email or password'
      });
    }
    
    // Generate token
    const token = generateToken(user.id);
    
    res.json({
      message: 'Login successful',
      token,
      user: User.toPublicJSON(user)
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Login failed',
      details: error.message
    });
  }
};

/**
 * Get current user profile
 * GET /api/auth/me
 */
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }
    
    res.json({
      user: User.toPublicJSON(user)
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get user profile',
      details: error.message
    });
  }
};
