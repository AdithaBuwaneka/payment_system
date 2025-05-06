const Payment = require('../models/Payment');
const PaymentSlip = require('../models/PaymentSlip');
const Order = require('../models/Order');
const { v4: uuidv4 } = require('uuid');

exports.createPayment = async (req, res) => {
  try {
    const { amount, method, customerName, customerPhone, shippingAddress } = req.body;
    
    const reference = `REF${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    const orderId = `ORD${Date.now()}`;

    const payment = await Payment.create({
      userId: req.user.id,
      orderId,
      amount,
      method,
      reference,
      customerName,
      customerPhone,
      shippingAddress,
      status: method === 'cod' ? 'completed' : 'pending'
    });

    // Create associated order
    const order = await Order.create({
      userId: req.user.id,
      orderId,
      totalAmount: amount,
      shippingAddress,
      paymentMethod: method,
      paymentId: payment._id,
      items: [] // Add items if provided
    });

    res.status(201).json({
      payment,
      order
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPaymentHistory = async (req, res) => {
  try {
    const payments = await Payment.find({ userId: req.user.id })
      .sort({ createdAt: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPaymentDetails = async (req, res) => {
    try {
      const payment = await Payment.findOne({
        _id: req.params.id,
        userId: req.user.id
      });
      
      if (!payment) {
        return res.status(404).json({ message: 'Payment not found' });
      }
      
      res.json(payment);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
// Updated uploadPaymentSlip function for paymentController.js

exports.uploadPaymentSlip = async (req, res) => {
  try {
    const { referenceNumber, amount, paymentId } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Find the payment
    const payment = await Payment.findOne({
      _id: paymentId,
      userId: req.user.id
    });

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Check if a slip for this payment already exists
    const existingSlip = await PaymentSlip.findOne({ paymentId: payment._id });
    if (existingSlip) {
      return res.status(400).json({ 
        message: 'A payment slip has already been uploaded for this payment',
        slipId: existingSlip._id
      });
    }

    // Generate a proper file URL relative to the uploads directory
    const fileUrl = `/uploads/${file.path.split('uploads')[1].replace(/\\/g, '/')}`;

    // Create a unique slip ID
    const slipId = `SLIP${Date.now()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    
    // Create payment slip
    const paymentSlip = await PaymentSlip.create({
      userId: req.user.id,
      paymentId: payment._id,
      slipId,
      referenceNumber,
      amount,
      fileName: file.originalname,
      fileUrl,
      status: 'pending'
    });

    // Update payment status to 'pending_verification'
    await Payment.findByIdAndUpdate(payment._id, { 
      status: 'pending',
      updatedAt: Date.now()
    });

    // Return response with absolute URL
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const slipWithAbsoluteUrl = paymentSlip.toObject();
    slipWithAbsoluteUrl.fileUrl = `${baseUrl}${fileUrl}`;

    res.status(201).json(slipWithAbsoluteUrl);
  } catch (error) {
    console.error('Error uploading payment slip:', error);
    res.status(500).json({ message: error.message });
  }
};