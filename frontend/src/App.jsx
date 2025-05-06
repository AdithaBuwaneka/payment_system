// Updated App.jsx with PaymentSlipHistory route
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import PaymentMethod from './pages/PaymentMethod';
import PaymentSlipUpload from './pages/PaymentSlipUpload';
import PaymentHistory from './pages/PaymentHistory';
import AdminDashboard from './pages/AdminDashboard';
import PaymentSlipHistory from './pages/PaymentSlipHistory';
import FinancialReport from './pages/FinancialReport';
import Register from './pages/Register';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen bg-gray-50">
          <Navbar />
          <div className="container mx-auto px-4 py-8 flex-grow">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/admin-login" element={<AdminLogin />} />
              
              <Route element={<PrivateRoute />}>
                <Route path="/" element={<PaymentMethod />} />
                <Route path="/payment-slip" element={<PaymentSlipUpload />} />
                <Route path="/payment-history" element={<PaymentHistory />} />
              </Route>
              
              <Route element={<AdminRoute />}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/payment-slips" element={<PaymentSlipHistory />} />
                <Route path="/financial-report" element={<FinancialReport />} />
              </Route>
              
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;