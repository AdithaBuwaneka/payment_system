// controllers/downloadController.js
const path = require('path');
const fs = require('fs');
const PaymentSlip = require('../models/PaymentSlip');
const User = require('../models/User');

// Get upload directory from environment or use default
const uploadDir = process.env.UPLOAD_DIR || 'uploads';

exports.downloadPaymentSlip = async (req, res) => {
  try {
    const { slipId } = req.params;
    
    // Find the payment slip by ID
    const slip = await PaymentSlip.findById(slipId);
    
    if (!slip) {
      return res.status(404).json({ message: 'Payment slip not found' });
    }
    
    // Check permission (admin can download any slip, user can only download their own)
    const isAdmin = req.user.role === 'admin';
    const isOwner = slip.userId.toString() === req.user.id.toString();
    
    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: 'You do not have permission to download this file' });
    }
    
    // Extract file path from the URL
    let relativePath = slip.fileUrl.replace(/^\/uploads\/?/, '');
    // Handle both Windows and Unix-style paths
    relativePath = relativePath.replace(/\\/g, '/');
    
    const filePath = path.join(__dirname, '..', uploadDir, relativePath);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      return res.status(404).json({ message: 'File not found on server' });
    }
    
    // Read file stats for content length
    const stats = fs.statSync(filePath);
    
    // Set headers for download
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Length', stats.size);
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(slip.fileName || path.basename(filePath))}"`);
    
    // Stream the file to response
    const fileStream = fs.createReadStream(filePath);
    fileStream.on('error', (err) => {
      console.error('File stream error:', err);
      res.status(500).json({ message: 'Error while streaming file' });
    });
    
    fileStream.pipe(res);
    
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ message: 'Failed to download file' });
  }
};

// Generic file download function that could be used for other file types
exports.downloadFile = async (req, res) => {
  try {
    // Get the file path from the URL
    let filePath = req.params[0]; // This gets everything after /file/ in the URL
    
    // Sanitize and decode the filepath to prevent directory traversal attacks
    const decodedPath = decodeURIComponent(filePath);
    const fullPath = path.join(__dirname, '..', uploadDir, decodedPath);
    const normalizedFullPath = path.normalize(fullPath);
    
    // Ensure the path is still within the uploads directory (security check)
    const normalizedUploadsDir = path.normalize(path.join(__dirname, '..', uploadDir));
    if (!normalizedFullPath.startsWith(normalizedUploadsDir)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Check if file exists
    if (!fs.existsSync(normalizedFullPath)) {
      console.error(`File not found: ${normalizedFullPath}`);
      return res.status(404).json({ message: 'File not found' });
    }
    
    // Read file stats
    const stats = fs.statSync(normalizedFullPath);
    
    // Ensure it's a file, not a directory
    if (!stats.isFile()) {
      return res.status(400).json({ message: 'Not a valid file' });
    }
    
    // Get the filename from the path
    const filename = path.basename(normalizedFullPath);
    
    // Set headers for download
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Length', stats.size);
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
    
    // Stream the file to response
    const fileStream = fs.createReadStream(normalizedFullPath);
    fileStream.on('error', (err) => {
      console.error('File stream error:', err);
      res.status(500).json({ message: 'Error while streaming file' });
    });
    
    fileStream.pipe(res);
    
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ message: 'Failed to download file' });
  }
};