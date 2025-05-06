const express = require('express');
const {
  createPayment,
  getPaymentHistory,
  getPaymentDetails,
  uploadPaymentSlip
} = require('../controllers/paymentController');
const { protect } = require('../middlewares/authMiddleware');
const { uploadSingle } = require('../middlewares/uploadMiddleware');

const router = express.Router();

router.use(protect);

router.post('/', createPayment);
router.get('/history', getPaymentHistory);
router.get('/:id', getPaymentDetails);
router.post('/upload-slip', uploadSingle, uploadPaymentSlip);

module.exports = router;