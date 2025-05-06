// routes/downloadRoutes.js
const express = require('express');
const { downloadPaymentSlip, downloadFile } = require('../controllers/downloadController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

// All download routes are protected
router.use(protect);

// Download payment slip by ID
router.get('/payment-slip/:slipId', downloadPaymentSlip);

// Generic file download route 
router.get('/file/*', downloadFile);

module.exports = router;