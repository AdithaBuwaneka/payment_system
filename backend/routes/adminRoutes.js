// routes/adminRoutes.js
const express = require('express');
const {
  getPendingSlips,
  getSlipById,
  getAllSlips,
  verifyPaymentSlip,
  getDashboardStats
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(protect);
router.use(adminOnly);

// Get all pending payment slips
router.get('/pending-slips', getPendingSlips);

// Get all payment slips (pending, verified, rejected)
router.get('/all-slips', getAllSlips);

// Get a specific payment slip by ID
router.get('/slip/:slipId', getSlipById);

// Verify/reject a payment slip
router.put('/verify-slip/:slipId', verifyPaymentSlip);

// Get dashboard statistics
router.get('/stats', getDashboardStats);

module.exports = router;