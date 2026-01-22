const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { formatError } = require('../utils/errorHandler');

/**
 * Auth Controller
 * 
 * Handles user authentication operations: registration and login.
 */

/**
 * Register New User
 * 
 * Creates a new user account and returns a JWT token.
 * 
 * POST /api/auth/register
 * 
 * Request Body:
 *   - name: string (required)
 *   - email: string (required, unique)
 *   - password: string (required, min 6 characters)
 * 
 * Response:
 *   - token: JWT token for authentication
 *   - user: User object (without password)
 */
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password.',
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered. Please use a different email or login.',
      });
    }

    // Create new user
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password, // Will be hashed by pre-save hook
      role: 'user', // Default role
    });

    // Generate JWT token
    const token = generateToken(user._id, user.role);

    // Return success response with token
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = {};
      Object.keys(error.errors).forEach((key) => {
        errors[key] = error.errors[key].message;
      });
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors,
      });
    }

    // Generic error
    res.status(500).json({
      success: false,
      message: 'Registration failed. Please try again.',
    });
  }
};

/**
 * Login User
 * 
 * Authenticates a user and returns a JWT token.
 * 
 * POST /api/auth/login
 * 
 * Request Body:
 *   - email: string (required)
 *   - password: string (required)
 * 
 * Response:
 *   - token: JWT token for authentication
 *   - user: User object (without password)
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password.',
      });
    }

    // Find user by email (include password for comparison)
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Compare passwords
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Generate JWT token
    const token = generateToken(user._id, user.role);

    // Return success response with token
    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed. Please try again.',
    });
  }
};

/**
 * Get Current User
 * 
 * Returns the currently authenticated user's information.
 * 
 * GET /api/auth/me
 * 
 * Requires: Authentication middleware
 * 
 * Response:
 *   - user: Current user object (without password)
 */
const getMe = async (req, res) => {
  try {
    // User is attached to req by authMiddleware
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user information.',
    });
  }
};

module.exports = {
  register,
  login,
  getMe,
};
