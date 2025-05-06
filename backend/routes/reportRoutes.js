const express = require('express');
const {
  getFinancialReport
} = require('../controllers/reportController');
const { protect, adminOnly } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(protect);
router.use(adminOnly);

router.get('/financial', getFinancialReport);

module.exports = router;