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

/**
 * @swagger
 * /api/payments/initiate:
 *   post:
 *     summary: Initialize payment
 *     description: Creates a new payment transaction and returns Paystack authorization URL
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *             properties:
 *               amount:
 *                 type: number
 *                 description: Payment amount in kobo (smallest currency unit). 5000 kobo = ₦50.00
 *                 example: 5000
 *                 minimum: 1
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Customer email (optional, defaults to authenticated user's email)
 *                 example: customer@example.com
 *     responses:
 *       200:
 *         description: Payment initialized successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Payment initialized successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     authorization_url:
 *                       type: string
 *                       format: uri
 *                       description: Paystack payment URL
 *                       example: https://checkout.paystack.com/xxxxx
 *                     reference:
 *                       type: string
 *                       description: Unique transaction reference
 *                       example: PAY-1704110400000-ABC123
 *                     amount:
 *                       type: number
 *                       example: 5000
 *                     access_code:
 *                       type: string
 *                       example: xxxxx
 *       400:
 *         description: Invalid amount or validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               message: Please provide a valid amount (minimum 1 kobo).
 *       401:
 *         description: Unauthorized - Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Paystack API error or server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               message: Failed to initialize payment with Paystack
 */
router.post('/initiate', roleMiddleware('user', 'admin'), initiatePayment);

/**
 * @swagger
 * /api/payments/verify/{reference}:
 *   get:
 *     summary: Verify payment
 *     description: Verifies a payment transaction with Paystack and updates transaction status
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reference
 *         required: true
 *         schema:
 *           type: string
 *         description: Paystack transaction reference
 *         example: PAY-1704110400000-ABC123
 *     responses:
 *       200:
 *         description: Transaction verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Transaction verified successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     transaction:
 *                       $ref: '#/components/schemas/Transaction'
 *                     status:
 *                       type: string
 *                       enum: [pending, success, failed]
 *                       example: success
 *                     paystackStatus:
 *                       type: string
 *                       example: success
 *       400:
 *         description: Missing reference or Paystack verification failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Cannot verify another user's transaction
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Transaction not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Paystack API error or server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/verify/:reference', roleMiddleware('user', 'admin'), verifyPayment);

/**
 * @swagger
 * /api/payments/my-transactions:
 *   get:
 *     summary: Get my transactions
 *     description: Retrieves all transactions for the authenticated user
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Transactions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: number
 *                   description: Number of transactions
 *                   example: 5
 *                 data:
 *                   type: object
 *                   properties:
 *                     transactions:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Transaction'
 *       401:
 *         description: Unauthorized - Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/my-transactions', roleMiddleware('user', 'admin'), getMyTransactions);

/**
 * @swagger
 * /api/payments/all:
 *   get:
 *     summary: Get all transactions (Admin only)
 *     description: Retrieves all transactions in the system. Requires admin role.
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All transactions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: number
 *                   description: Total number of transactions
 *                   example: 25
 *                 data:
 *                   type: object
 *                   properties:
 *                     transactions:
 *                       type: array
 *                       items:
 *                         allOf:
 *                           - $ref: '#/components/schemas/Transaction'
 *                           - type: object
 *                             properties:
 *                               user:
 *                                 $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized - Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Admin role required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/all', roleMiddleware('admin'), getAllTransactions);

module.exports = router;
