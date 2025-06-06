const express = require('express');
const {
  registerUser,
  loginUser,
  adminLogin,
  getCurrentUser
} = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/admin/login', adminLogin);
router.get('/me', protect, getCurrentUser);

module.exports = router;