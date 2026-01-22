const mongoose = require('mongoose');

/**
 * Transaction Model Schema
 * 
 * Represents a payment transaction in the system.
 * Each transaction is linked to a user and contains payment details from Paystack.
 * 
 * Fields:
 * - user: Reference to the User who made the transaction
 * - amount: Transaction amount in the smallest currency unit (kobo for Naira)
 * - reference: Unique Paystack transaction reference
 * - status: Current status of the transaction (pending/success/failed)
 * - paystackData: Additional data from Paystack (optional, for debugging)
 * - createdAt: Timestamp of transaction creation
 */
const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Transaction must belong to a user'],
    },
    amount: {
      type: Number,
      required: [true, 'Transaction amount is required'],
      min: [1, 'Amount must be greater than 0'],
    },
    reference: {
      type: String,
      required: [true, 'Transaction reference is required'],
      unique: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'success', 'failed'],
      default: 'pending',
    },
    paystackData: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

/**
 * Indexes for Performance
 * 
 * - Compound index on user and createdAt for efficient user transaction queries
 * - Index on reference for fast lookups during verification
 */
transactionSchema.index({ user: 1, createdAt: -1 });
transactionSchema.index({ reference: 1 });

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
