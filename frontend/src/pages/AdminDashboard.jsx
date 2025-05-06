// Updated AdminDashboard.jsx with link to Payment Slips History
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api';
import FilePreview from '../components/FilePreview';

const AdminDashboard = () => {
  const [pendingSlips, setPendingSlips] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPayments: 0,
    totalRevenue: 0,
    pendingSlips: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSlip, setSelectedSlip] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [verificationForm, setVerificationForm] = useState({
    status: '',
    remarks: '',
  });
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [slipsResponse, statsResponse] = await Promise.all([
        api.get('/admin/pending-slips'),
        api.get('/admin/stats'),
      ]);
      setPendingSlips(slipsResponse.data);
      setStats(statsResponse.data);
    } catch (err) {
      console.error('Failed to fetch data', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewSlip = (slip) => {
    setSelectedSlip(slip);
    setShowModal(true);
    setVerificationForm({ status: '', remarks: '' });
  };

  const handleVerify = async () => {
    if (!verificationForm.status) {
      return;
    }
    
    setVerifying(true);
    try {
      await api.put(`/admin/verify-slip/${selectedSlip._id}`, verificationForm);
      setShowModal(false);
      fetchData(); // Refresh data
    } catch (err) {
      console.error('Failed to verify slip', err);
      setError('Failed to verify payment slip. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <svg className="animate-spin h-12 w-12 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
              <button 
                onClick={fetchData} 
                className="mt-1 text-sm font-medium text-red-700 hover:text-red-600"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
          <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Payments</h3>
          <p className="text-3xl font-bold text-gray-900">{stats.totalPayments}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
          <p className="text-3xl font-bold text-gray-900">${stats.totalRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Pending Slips</h3>
          <p className="text-3xl font-bold text-gray-900">{stats.pendingSlips}</p>
        </div>
      </div>

      {/* Pending Payment Slips */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">Pending Payment Slips</h2>
          <div className="flex space-x-4">
            <Link 
              to="/payment-slips" 
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              View All Slips
            </Link>
            <button 
              onClick={fetchData} 
              className="text-sm text-primary hover:text-primary/80 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        </div>
        <div className="divide-y divide-gray-200">
          {pendingSlips.length > 0 ? (
            pendingSlips.map((slip) => (
              <div key={slip._id} className="p-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">
                    Slip ID: {slip.slipId}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Customer: {slip.userId?.firstName} {slip.userId?.lastName}
                  </p>
                  <p className="text-sm text-gray-500">
                    Amount: ${slip.amount.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-500">
                    Reference: {slip.referenceNumber}
                  </p>
                  <p className="text-sm text-gray-500">
                    Date: {new Date(slip.createdAt).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => handleViewSlip(slip)}
                  className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90"
                >
                  View & Verify
                </button>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-gray-500">
              No pending payment slips
            </div>
          )}
        </div>
      </div>

      {/* Verification Modal */}
      {showModal && selectedSlip && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-3xl w-full p-6 modal-content max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Verify Payment Slip
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-md">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Slip Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <p className="text-sm text-gray-500">ID: <span className="text-gray-900">{selectedSlip.slipId}</span></p>
                  <p className="text-sm text-gray-500">Date: <span className="text-gray-900">{new Date(selectedSlip.createdAt).toLocaleString()}</span></p>
                  <p className="text-sm text-gray-500">Customer: <span className="text-gray-900">{selectedSlip.userId?.firstName} {selectedSlip.userId?.lastName}</span></p>
                  <p className="text-sm text-gray-500">Email: <span className="text-gray-900">{selectedSlip.userId?.email}</span></p>
                  <p className="text-sm text-gray-500">Amount: <span className="text-gray-900">${selectedSlip.amount.toFixed(2)}</span></p>
                  <p className="text-sm text-gray-500">Reference: <span className="text-gray-900">{selectedSlip.referenceNumber}</span></p>
                </div>
              </div>

              {/* Display payment slip image/PDF */}
              <div className="border rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Payment Slip</h4>
                {selectedSlip.fileUrl ? (
                  <FilePreview file={selectedSlip} />
                ) : (
                  <p className="text-sm text-red-500">No file was uploaded for this payment</p>
                )}
              </div>

              {/* Verification form */}
              <div className="space-y-4 pt-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Verification Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                    value={verificationForm.status}
                    onChange={(e) => setVerificationForm({ ...verificationForm, status: e.target.value })}
                    required
                  >
                    <option value="">Select status</option>
                    <option value="verified">Verified</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Remarks
                  </label>
                  <textarea
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                    value={verificationForm.remarks}
                    onChange={(e) => setVerificationForm({ ...verificationForm, remarks: e.target.value })}
                    placeholder="Add any notes or comments about this verification"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleVerify}
                disabled={!verificationForm.status || verifying}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 disabled:opacity-50 flex items-center"
              >
                {verifying ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  'Submit Verification'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;