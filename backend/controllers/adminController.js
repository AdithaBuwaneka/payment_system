// adminController.js
const PaymentSlip = require('../models/PaymentSlip');
const Payment = require('../models/Payment');
const User = require('../models/User');

// Helper function to create absolute URLs
const createAbsoluteFileUrl = (req, relativePath) => {
  if (!relativePath) return null;
  
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  // Ensure path starts with a forward slash
  const normalizedPath = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;
  return `${baseUrl}${normalizedPath}`;
};

exports.getPendingSlips = async (req, res) => {
  try {
    const pendingSlips = await PaymentSlip.find({ status: 'pending' })
      .populate('userId', 'firstName lastName email')
      .populate('paymentId')
      .sort({ createdAt: -1 });
    
    // Create absolute URLs for the file paths
    const slipsWithFullUrl = pendingSlips.map(slip => {
      const slipObj = slip.toObject();
      if (slipObj.fileUrl) {
        slipObj.fileUrl = createAbsoluteFileUrl(req, slipObj.fileUrl);
      }
      return slipObj;
    });
    
    res.json(slipsWithFullUrl);
  } catch (error) {
    console.error('Error fetching pending slips:', error);
    res.status(500).json({ message: error.message });
  }
};

// New function to get all payment slips (pending, verified, rejected)
exports.getAllSlips = async (req, res) => {
  try {
    const allSlips = await PaymentSlip.find({})
      .populate('userId', 'firstName lastName email')
      .populate('paymentId')
      .sort({ createdAt: -1 });
    
    // Create absolute URLs for the file paths
    const slipsWithFullUrl = allSlips.map(slip => {
      const slipObj = slip.toObject();
      if (slipObj.fileUrl) {
        slipObj.fileUrl = createAbsoluteFileUrl(req, slipObj.fileUrl);
      }
      return slipObj;
    });
    
    res.json(slipsWithFullUrl);
  } catch (error) {
    console.error('Error fetching all slips:', error);
    res.status(500).json({ message: 'Failed to fetch payment slips' });
  }
};

exports.getSlipById = async (req, res) => {
  try {
    const { slipId } = req.params;
    
    const slip = await PaymentSlip.findById(slipId)
      .populate('userId', 'firstName lastName email')
      .populate('paymentId');
      
    if (!slip) {
      return res.status(404).json({ message: 'Payment slip not found' });
    }
    
    // Add absolute URL for the file
    const slipObj = slip.toObject();
    if (slipObj.fileUrl) {
      slipObj.fileUrl = createAbsoluteFileUrl(req, slipObj.fileUrl);
    }
    
    res.json(slipObj);
  } catch (error) {
    console.error('Error fetching slip details:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.verifyPaymentSlip = async (req, res) => {
  try {
    const { slipId } = req.params;
    const { status, remarks } = req.body;

    if (!status || !['verified', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid verification status' });
    }

    const slip = await PaymentSlip.findById(slipId);
    if (!slip) {
      return res.status(404).json({ message: 'Payment slip not found' });
    }

    slip.status = status;
    slip.adminRemarks = remarks;
    slip.verifiedBy = req.user.id;
    slip.verifiedAt = Date.now();
    await slip.save();

    // Update payment status based on verification result
    if (status === 'verified') {
      await Payment.findByIdAndUpdate(slip.paymentId, { status: 'completed' });
    } else if (status === 'rejected') {
      await Payment.findByIdAndUpdate(slip.paymentId, { status: 'failed' });
    }

    // Return the updated slip with absolute URL for the file
    const updatedSlip = slip.toObject();
    if (updatedSlip.fileUrl) {
      updatedSlip.fileUrl = createAbsoluteFileUrl(req, updatedSlip.fileUrl);
    }

    res.json(updatedSlip);
  } catch (error) {
    console.error('Error verifying payment slip:', error);
    res.status(500).json({ message: 'Failed to verify payment slip' });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalPayments = await Payment.countDocuments();
    const totalRevenue = await Payment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const pendingSlips = await PaymentSlip.countDocuments({ status: 'pending' });

    res.json({
      totalUsers,
      totalPayments,
      totalRevenue: totalRevenue[0]?.total || 0,
      pendingSlips
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard statistics' });
  }
};