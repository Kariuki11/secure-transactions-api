/**
 * Role-Based Access Control (RBAC) Middleware
 * 
 * Restricts access to routes based on user roles.
 * Must be used AFTER authMiddleware to ensure req.user exists.
 * 
 * Usage:
 *   router.get('/admin-only', authMiddleware, roleMiddleware('admin'), controller.handler);
 * 
 * @param {...string} allowedRoles - One or more roles that are allowed to access the route
 * @returns {Function} Express middleware function
 */
const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    // Ensure user is authenticated (should be set by authMiddleware)
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
    }

    // Check if user's role is in the allowed roles list
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. This route requires one of the following roles: ${allowedRoles.join(', ')}.`,
      });
    }

    // User has required role, proceed to next middleware/controller
    next();
  };
};

module.exports = roleMiddleware;
