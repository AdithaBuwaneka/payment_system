const mongoose = require('mongoose');

const paymentSlipSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  paymentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment',
    required: true
  },
  slipId: {
    type: String,
    required: true,
    unique: true
  },
  referenceNumber: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  fileName: String,
  fileUrl: String,
  status: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  adminRemarks: String,
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verifiedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('PaymentSlip', paymentSlipSchema);