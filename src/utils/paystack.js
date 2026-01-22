const axios = require('axios');

/**
 * Paystack API Client
 * 
 * Handles all interactions with Paystack API.
 * Uses test mode keys from environment variables.
 */

// Base URL for Paystack API
const PAYSTACK_BASE_URL = 'https://api.paystack.co';

/**
 * Get Authorization Header
 * 
 * Returns the Authorization header with Bearer token for Paystack API requests.
 */
const getAuthHeader = () => {
  return {
    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
    'Content-Type': 'application/json',
  };
};

/**
 * Initialize Payment Transaction
 * 
 * Creates a new payment transaction on Paystack.
 * 
 * @param {Object} paymentData - Payment initialization data
 * @param {number} paymentData.amount - Amount in kobo (smallest currency unit)
 * @param {string} paymentData.email - Customer email
 * @param {string} paymentData.reference - Unique transaction reference
 * @param {string} [paymentData.callback_url] - Optional callback URL
 * 
 * @returns {Promise<Object>} Paystack API response
 * @throws {Error} If API request fails
 */
const initializeTransaction = async (paymentData) => {
  try {
    const response = await axios.post(
      `${PAYSTACK_BASE_URL}/transaction/initialize`,
      {
        amount: paymentData.amount,
        email: paymentData.email,
        reference: paymentData.reference,
        callback_url: paymentData.callback_url,
      },
      {
        headers: getAuthHeader(),
      }
    );

    return response.data;
  } catch (error) {
    // Handle Paystack API errors
    if (error.response) {
      // Paystack returned an error response
      throw new Error(
        error.response.data?.message || 'Failed to initialize payment with Paystack'
      );
    } else if (error.request) {
      // Request was made but no response received
      throw new Error('Network error: Could not reach Paystack API');
    } else {
      // Something else happened
      throw new Error('Error initializing payment: ' + error.message);
    }
  }
};

/**
 * Verify Payment Transaction
 * 
 * Verifies a payment transaction with Paystack using the transaction reference.
 * 
 * @param {string} reference - Paystack transaction reference
 * 
 * @returns {Promise<Object>} Paystack API response with transaction details
 * @throws {Error} If API request fails or transaction not found
 */
const verifyTransaction = async (reference) => {
  try {
    const response = await axios.get(
      `${PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
      {
        headers: getAuthHeader(),
      }
    );

    return response.data;
  } catch (error) {
    // Handle Paystack API errors
    if (error.response) {
      const statusCode = error.response.status;
      if (statusCode === 404) {
        throw new Error('Transaction not found. Invalid reference.');
      }
      throw new Error(
        error.response.data?.message || 'Failed to verify transaction with Paystack'
      );
    } else if (error.request) {
      throw new Error('Network error: Could not reach Paystack API');
    } else {
      throw new Error('Error verifying payment: ' + error.message);
    }
  }
};

module.exports = {
  initializeTransaction,
  verifyTransaction,
};
