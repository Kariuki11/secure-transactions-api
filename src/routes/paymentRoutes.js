const express = require('express');
const router = express.Router();
const {
  initiatePayment,
  verifyPayment,
  getMyTransactions,
  getAllTransactions,
} = require('../controllers/paymentController');
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/role');

/**
 * Payment Routes
 * 
 * Handles payment transaction endpoints.
 * 
 * Base path: /api/payments
 */

// All payment routes require authentication
router.use(authMiddleware);

// User routes (any authenticated user)
router.post('/initiate', roleMiddleware('user', 'admin'), initiatePayment);
router.get('/verify/:reference', roleMiddleware('user', 'admin'), verifyPayment);
router.get('/my-transactions', roleMiddleware('user', 'admin'), getMyTransactions);

// Admin-only routes
router.get('/all', roleMiddleware('admin'), getAllTransactions);

module.exports = router;
