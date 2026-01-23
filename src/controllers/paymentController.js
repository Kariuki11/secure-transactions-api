const Transaction = require('../models/Transaction');
const { initializeTransaction, verifyTransaction } = require('../utils/paystack');
const crypto = require('crypto');

/**
 * Payment Controller
 * 
 * Handles payment operations: initialization, verification, and transaction retrieval.
 */

/**
 * Generate Unique Transaction Reference
 * 
 * Creates a unique reference string for Paystack transactions.
 * Format: PAY-{timestamp}-{random}
 * 
 * @returns {string} Unique transaction reference
 */
const generateReference = () => {
  const timestamp = Date.now();
  const random = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `PAY-${timestamp}-${random}`;
};

/**
 * Initialize Payment
 * 
 * Creates a new payment transaction and initializes it with Paystack.
 * 
 * POST /api/payments/initiate
 * 
 * Requires: Authentication (user role)
 * 
 * Request Body:
 *   - amount: number (required, in kobo for Naira)
 *   - email: string (optional, defaults to user's email)
 * 
 * Response:
 *   - authorization_url: Paystack payment URL
 *   - reference: Transaction reference
 *   - amount: Transaction amount
 */
const initiatePayment = async (req, res) => {
  try {
    const { amount, email } = req.body;
    const user = req.user; // From authMiddleware

    // Validate amount
    if (!amount || isNaN(amount) || amount < 1) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid amount (minimum 1 kobo).',
      });
    }

    // Convert amount to integer (kobo)
    const amountInKobo = Math.floor(parseFloat(amount));

    // Use provided email or default to user's email
    const customerEmail = email || user.email;

    // Generate unique reference
    const reference = generateReference();

    // Create transaction record in database (pending status)
    const transaction = await Transaction.create({
      user: user._id,
      amount: amountInKobo,
      reference: reference,
      status: 'pending',
    });

    try {
      // Initialize payment with Paystack
      const paystackResponse = await initializeTransaction({
        amount: amountInKobo,
        email: customerEmail,
        reference: reference,
      });

      // Check if Paystack returned success
      if (paystackResponse.status === true && paystackResponse.data) {
        // Update transaction with Paystack data
        transaction.paystackData = paystackResponse.data;
        await transaction.save();

        // Return authorization URL to frontend
        res.status(200).json({
          success: true,
          message: 'Payment initialized successfully',
          data: {
            authorization_url: paystackResponse.data.authorization_url,
            reference: reference,
            amount: amountInKobo,
            access_code: paystackResponse.data.access_code,
          },
        });
      } else {
        // Paystack returned an error
        transaction.status = 'failed';
        await transaction.save();

        return res.status(400).json({
          success: false,
          message: paystackResponse.message || 'Failed to initialize payment',
        });
      }
    } catch (paystackError) {
      // Handle Paystack API errors
      transaction.status = 'failed';
      transaction.paystackData = { error: paystackError.message };
      await transaction.save();

      // Log error for debugging
      console.error('Paystack initialization error:', paystackError.message);

      // Return appropriate status code based on error type
      const statusCode = paystackError.message.includes('PAYSTACK_SECRET_KEY') ? 500 : 500;
      
      return res.status(statusCode).json({
        success: false,
        message: paystackError.message || 'Failed to initialize payment with Paystack',
      });
    }
  } catch (error) {
    console.error('Initiate payment error:', error);

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

    res.status(500).json({
      success: false,
      message: 'Failed to initialize payment. Please try again.',
    });
  }
};

/**
 * Verify Payment
 * 
 * Verifies a payment transaction with Paystack and updates the transaction status.
 * 
 * GET /api/payments/verify/:reference
 * 
 * Requires: Authentication (user role)
 * 
 * URL Parameters:
 *   - reference: Transaction reference
 * 
 * Response:
 *   - transaction: Updated transaction object
 *   - status: Payment status
 */
const verifyPayment = async (req, res) => {
  try {
    const { reference } = req.params;
    const user = req.user; // From authMiddleware

    if (!reference) {
      return res.status(400).json({
        success: false,
        message: 'Transaction reference is required.',
      });
    }

    // Find transaction in database
    const transaction = await Transaction.findOne({ reference });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found.',
      });
    }

    // Check if transaction belongs to the authenticated user
    if (transaction.user.toString() !== user._id.toString() && user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to verify this transaction.',
      });
    }

    // Check if transaction is already verified
    if (transaction.status === 'success') {
      return res.status(200).json({
        success: true,
        message: 'Transaction already verified',
        data: {
          transaction: transaction,
          status: transaction.status,
        },
      });
    }

    try {
      // Verify transaction with Paystack
      const paystackResponse = await verifyTransaction(reference);

      // Check if Paystack verification was successful
      if (paystackResponse.status === true && paystackResponse.data) {
        const paystackData = paystackResponse.data;

        // Update transaction status based on Paystack response
        if (paystackData.status === 'success') {
          transaction.status = 'success';
        } else if (paystackData.status === 'failed') {
          transaction.status = 'failed';
        } else {
          transaction.status = 'pending';
        }

        // Update Paystack data
        transaction.paystackData = paystackData;
        await transaction.save();

        res.status(200).json({
          success: true,
          message: 'Transaction verified successfully',
          data: {
            transaction: transaction,
            status: transaction.status,
            paystackStatus: paystackData.status,
          },
        });
      } else {
        // Paystack returned an error
        transaction.status = 'failed';
        transaction.paystackData = { error: paystackResponse.message };
        await transaction.save();

        return res.status(400).json({
          success: false,
          message: paystackResponse.message || 'Failed to verify transaction',
        });
      }
    } catch (paystackError) {
      // Handle Paystack API errors
      transaction.status = 'failed';
      transaction.paystackData = { error: paystackError.message };
      await transaction.save();

      return res.status(500).json({
        success: false,
        message: paystackError.message || 'Failed to verify transaction with Paystack',
      });
    }
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify payment. Please try again.',
    });
  }
};

/**
 * Get User Transactions
 * 
 * Retrieves all transactions for the authenticated user.
 * 
 * GET /api/payments/my-transactions
 * 
 * Requires: Authentication (user role)
 * 
 * Response:
 *   - transactions: Array of user's transactions
 */
const getMyTransactions = async (req, res) => {
  try {
    const user = req.user; // From authMiddleware

    // Find all transactions for the user, sorted by most recent
    const transactions = await Transaction.find({ user: user._id })
      .sort({ createdAt: -1 })
      .select('-paystackData'); // Exclude large paystackData field

    res.status(200).json({
      success: true,
      count: transactions.length,
      data: {
        transactions,
      },
    });
  } catch (error) {
    console.error('Get my transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transactions.',
    });
  }
};

/**
 * Get All Transactions (Admin Only)
 * 
 * Retrieves all transactions in the system.
 * 
 * GET /api/payments/all
 * 
 * Requires: Authentication + Admin role
 * 
 * Response:
 *   - transactions: Array of all transactions
 */
const getAllTransactions = async (req, res) => {
  try {
    // Find all transactions, sorted by most recent, with user details
    const transactions = await Transaction.find()
      .sort({ createdAt: -1 })
      .populate('user', 'name email role')
      .select('-paystackData'); // Exclude large paystackData field

    res.status(200).json({
      success: true,
      count: transactions.length,
      data: {
        transactions,
      },
    });
  } catch (error) {
    console.error('Get all transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transactions.',
    });
  }
};

module.exports = {
  initiatePayment,
  verifyPayment,
  getMyTransactions,
  getAllTransactions,
};
