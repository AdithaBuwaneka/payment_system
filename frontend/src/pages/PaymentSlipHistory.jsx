// pages/PaymentSlipHistory.jsx
import React, { useState, useEffect } from 'react';
import api from '../api/api';
import FilePreview from '../components/FilePreview';

const PaymentSlipHistory = () => {
  const [slips, setSlips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'verified', 'rejected', 'pending'
  const [selectedSlip, setSelectedSlip] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchSlips();
  }, []);

  const fetchSlips = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/admin/all-slips');
      setSlips(response.data);
    } catch (err) {
      console.error('Failed to fetch payment slips', err);
      setError('Failed to load payment slips. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewSlip = (slip) => {
    setSelectedSlip(slip);
    setShowModal(true);
  };

  // Filter slips based on status
  const filteredSlips = slips.filter(slip => {
    if (filter === 'all') return true;
    return slip.status === filter;
  });

  // Get status badge color
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'verified':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Payment Slip History</h1>
      
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
                onClick={fetchSlips} 
                className="mt-1 text-sm font-medium text-red-700 hover:text-red-600"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Filter Controls */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="mb-4 sm:mb-0">
            <h2 className="text-lg font-medium text-gray-900">Filter Payment Slips</h2>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                filter === 'all' 
                  ? 'bg-primary text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                filter === 'pending' 
                  ? 'bg-yellow-500 text-white' 
                  : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setFilter('verified')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                filter === 'verified' 
                  ? 'bg-green-500 text-white' 
                  : 'bg-green-100 text-green-800 hover:bg-green-200'
              }`}
            >
              Verified
            </button>
            <button
              onClick={() => setFilter('rejected')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                filter === 'rejected' 
                  ? 'bg-red-500 text-white' 
                  : 'bg-red-100 text-red-800 hover:bg-red-200'
              }`}
            >
              Rejected
            </button>
          </div>
        </div>
      </div>

      {/* Payment Slips List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">Payment Slips</h2>
          <button 
            onClick={fetchSlips} 
            className="text-sm text-primary hover:text-primary/80 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
        
        {filteredSlips.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {filteredSlips.map((slip) => (
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
                  <div className="mt-2">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(slip.status)}`}>
                      {slip.status.charAt(0).toUpperCase() + slip.status.slice(1)}
                    </span>
                    {slip.status !== 'pending' && (
                      <span className="text-xs text-gray-500 ml-2">
                        {slip.verifiedAt ? `on ${new Date(slip.verifiedAt).toLocaleString()}` : ''}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleViewSlip(slip)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  View Details
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center text-gray-500">
            No payment slips found matching the selected filter
          </div>
        )}
      </div>

      {/* Payment Slip Modal */}
      {showModal && selectedSlip && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-3xl w-full p-6 modal-content max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Payment Slip Details
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
              {/* Status Badge */}
              <div className="flex items-center mb-4">
                <span className={`px-2 py-1 text-sm font-semibold rounded-full ${getStatusBadgeColor(selectedSlip.status)}`}>
                  {selectedSlip.status.charAt(0).toUpperCase() + selectedSlip.status.slice(1)}
                </span>
                {selectedSlip.status !== 'pending' && (
                  <span className="text-sm text-gray-500 ml-2">
                    {selectedSlip.verifiedAt ? `on ${new Date(selectedSlip.verifiedAt).toLocaleString()}` : ''}
                  </span>
                )}
              </div>
              
              {/* Slip Details */}
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

              {/* Admin Remarks (if any) */}
              {selectedSlip.adminRemarks && (
                <div className={`border-l-4 ${
                  selectedSlip.status === 'verified' ? 'border-green-400 bg-green-50' : 'border-red-400 bg-red-50'
                } p-4 rounded-r-md`}>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Admin Remarks</h4>
                  <p className="text-sm text-gray-700">{selectedSlip.adminRemarks}</p>
                </div>
              )}

              {/* Display payment slip image/PDF */}
              <div className="border rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Payment Slip</h4>
                {selectedSlip.fileUrl ? (
                  <FilePreview file={selectedSlip} />
                ) : (
                  <p className="text-sm text-red-500">No file was uploaded for this payment</p>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentSlipHistory;