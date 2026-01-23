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
  // Get and trim the secret key to remove any whitespace
  const secretKey = process.env.PAYSTACK_SECRET_KEY?.trim();
  
  // Validate that the key exists
  if (!secretKey) {
    throw new Error('PAYSTACK_SECRET_KEY is not set in environment variables');
  }
  
  // Validate key format (should start with sk_test_ or sk_live_)
  if (!secretKey.startsWith('sk_test_') && !secretKey.startsWith('sk_live_')) {
    throw new Error('PAYSTACK_SECRET_KEY format is invalid. It should start with sk_test_ or sk_live_');
  }
  
  return {
    Authorization: `Bearer ${secretKey}`,
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
    // Validate required fields
    if (!paymentData.amount || !paymentData.email || !paymentData.reference) {
      throw new Error('Missing required payment data: amount, email, or reference');
    }

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
      const errorData = error.response.data;
      const errorMessage = errorData?.message || 'Failed to initialize payment with Paystack';
      
      // Log detailed error for debugging (only in development)
      if (process.env.NODE_ENV !== 'production') {
        console.error('Paystack API Error:', {
          status: error.response.status,
          statusText: error.response.statusText,
          message: errorMessage,
          data: errorData,
        });
      }
      
      throw new Error(errorMessage);
    } else if (error.request) {
      // Request was made but no response received
      throw new Error('Network error: Could not reach Paystack API. Please check your internet connection.');
    } else {
      // Something else happened (like validation error from getAuthHeader)
      throw error;
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
    if (!reference) {
      throw new Error('Transaction reference is required');
    }

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
      const errorData = error.response.data;
      const errorMessage = errorData?.message || 'Failed to verify transaction with Paystack';
      
      if (statusCode === 404) {
        throw new Error('Transaction not found. Invalid reference.');
      }
      
      // Log detailed error for debugging (only in development)
      if (process.env.NODE_ENV !== 'production') {
        console.error('Paystack API Error:', {
          status: statusCode,
          statusText: error.response.statusText,
          message: errorMessage,
          data: errorData,
        });
      }
      
      throw new Error(errorMessage);
    } else if (error.request) {
      throw new Error('Network error: Could not reach Paystack API. Please check your internet connection.');
    } else {
      // Something else happened (like validation error from getAuthHeader)
      throw error;
    }
  }
};

module.exports = {
  initializeTransaction,
  verifyTransaction,
};
