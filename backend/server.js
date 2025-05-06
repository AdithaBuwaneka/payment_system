// server.js - Updated with proper download authentication
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const mime = require('mime-types'); // Add mime-types package to your dependencies
const jwt = require('jsonwebtoken');
const User = require('./models/User');

// Import routes
const authRoutes = require('./routes/authRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const adminRoutes = require('./routes/adminRoutes');
const reportRoutes = require('./routes/reportRoutes');
const downloadRoutes = require('./routes/downloadRoutes'); // Added download routes

// Load environment variables
dotenv.config();

const app = express();

// Ensure uploads directory exists
const uploadDir = process.env.UPLOAD_DIR || 'uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log(`Created upload directory: ${uploadDir}`);
}

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
  exposedHeaders: ['Content-Disposition', 'Content-Type'] // Important for file downloads
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Optional token authentication middleware for direct file access
const optionalAuth = async (req, res, next) => {
  try {
    // Check if token is provided in query string (for direct file downloads)
    const token = req.query.token;
    
    if (token) {
      // Verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      
      // Find user by ID
      const user = await User.findById(decoded.id).select('-password');
      if (user) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // Continue even if token is invalid
    next();
  }
};

// Enhanced file serving with proper authentication
app.use('/uploads', optionalAuth, (req, res, next) => {
  // Parse the requested file path
  const requestedPath = req.path;
  const filePath = path.join(__dirname, uploadDir, decodeURIComponent(requestedPath));
  
  // Check if file exists
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      return next(); // File doesn't exist, continue to next middleware
    }
    
    // Get file stats
    fs.stat(filePath, (err, stats) => {
      if (err || !stats.isFile()) {
        return next();
      }
      
      // Determine if this is a download request
      const isDownload = req.query.download === 'true';
      
      // Determine proper content type
      const contentType = mime.lookup(filePath) || 'application/octet-stream';
      
      // Get original filename from path
      const originalFilename = path.basename(filePath);
      
      // Set appropriate headers
      const headers = {
        'Content-Type': contentType,
        'Content-Length': stats.size,
        'Cache-Control': 'no-cache',
      };
      
      // If it's a download request, set Content-Disposition to attachment
      if (isDownload) {
        headers['Content-Disposition'] = `attachment; filename="${encodeURIComponent(originalFilename)}"`;
      } else {
        headers['Content-Disposition'] = `inline; filename="${encodeURIComponent(originalFilename)}"`;
      }
      
      res.set(headers);
      
      // Stream the file
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
    });
  });
});

// Fallback to regular static file serving (for directories, etc.)
app.use('/uploads', express.static(path.join(__dirname, uploadDir)));

// Database connection
require('./config/database');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/download', downloadRoutes); // Added download routes

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app; // Export for testing