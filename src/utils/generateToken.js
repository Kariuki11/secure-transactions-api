const jwt = require('jsonwebtoken');

/**
 * Generate JWT Token
 * 
 * Creates a JSON Web Token for user authentication.
 * 
 * @param {string} userId - User's MongoDB ObjectId
 * @param {string} role - User's role (user/admin)
 * @returns {string} JWT token
 */
const generateToken = (userId, role) => {
  return jwt.sign(
    {
      id: userId,
      role: role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '7d', // Token expires in 7 days
    }
  );
};

module.exports = generateToken;
