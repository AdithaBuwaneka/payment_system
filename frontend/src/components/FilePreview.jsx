// components/FilePreview.jsx
import React, { useState } from 'react';
import api from '../api/api'; // Import the API with auth headers

const FilePreview = ({ file }) => {
  const [showFullImage, setShowFullImage] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');

  // Determine file type
  const isPdf = file.fileName?.toLowerCase().endsWith('.pdf');
  const isImage = /\.(jpe?g|png|gif)$/i.test(file.fileName || '');

  if (!file.fileUrl) {
    return <div className="text-red-500 text-sm">No file available</div>;
  }

  // Handle file download with proper authentication
  const handleDownload = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      setDownloading(true);
      
      if (file._id) {
        // Use authenticated API endpoint
        try {
          const response = await api.get(`/download/payment-slip/${file._id}`, {
            responseType: 'blob', // Important for binary data
          });
          
          // Create blob URL from response
          const blob = new Blob([response.data]);
          const url = window.URL.createObjectURL(blob);
          
          // Get filename from header if available
          const contentDisposition = response.headers['content-disposition'];
          let filename = file.fileName || 'download';
          
          if (contentDisposition) {
            const filenameMatch = contentDisposition.match(/filename="(.+?)"/);
            if (filenameMatch && filenameMatch[1]) {
              filename = decodeURIComponent(filenameMatch[1]);
            }
          }
          
          // Trigger download
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', filename);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          // Clean up
          window.URL.revokeObjectURL(url);
        } catch (err) {
          console.error('Download API error:', err);
          setError('Failed to download. Please try again.');
          
          // Fallback to direct URL method if API fails
          downloadViaDirectUrl();
        }
      } else {
        // No ID available, use direct URL method
        downloadViaDirectUrl();
      }
    } catch (err) {
      console.error('Download error:', err);
      setError('Failed to download file');
    } finally {
      setDownloading(false);
    }
  };
  
  // Fallback method using direct URL
  const downloadViaDirectUrl = () => {
    // Add auth token if available
    const token = localStorage.getItem('token');
    let downloadUrl = file.fileUrl;
    
    if (token) {
      const separator = downloadUrl.includes('?') ? '&' : '?';
      downloadUrl = `${downloadUrl}${separator}download=true&token=${token}`;
    } else {
      downloadUrl = `${downloadUrl}${downloadUrl.includes('?') ? '&' : '?'}download=true`;
    }
    
    // Create link and trigger download
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', file.fileName || 'download');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Full screen image modal
  const ImageModal = () => (
    <div 
      className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
      onClick={() => setShowFullImage(false)}
    >
      <div className="relative max-w-5xl mx-auto">
        <button 
          className="absolute top-4 right-4 text-white hover:text-gray-300"
          onClick={() => setShowFullImage(false)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <img 
          src={file.fileUrl} 
          alt={file.fileName || 'Preview'} 
          className="max-h-screen max-w-full object-contain"
        />
        
        {/* Download button in fullscreen view */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="bg-white text-blue-600 px-4 py-2 rounded-md shadow-lg hover:bg-gray-100 flex items-center font-medium disabled:opacity-50"
          >
            {downloading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Downloading...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="mt-2">
      {isPdf ? (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <p className="text-sm font-medium text-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block mr-1 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              {file.fileName}
            </p>
            <div className="flex space-x-2">
              <a 
                href={file.fileUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                View PDF
              </a>
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center"
              >
                {downloading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-1 h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Downloading...
                  </>
                ) : "Download"}
              </button>
            </div>
          </div>
          <div className="border rounded overflow-hidden">
            <iframe 
              src={file.fileUrl} 
              className="w-full h-96"
              title="PDF Preview"
            />
          </div>
          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}
        </div>
      ) : isImage ? (
        <div className="space-y-2">
          <div className="file-preview">
            <img 
              src={file.fileUrl} 
              alt={file.fileName || 'Preview'} 
              onClick={() => setShowFullImage(true)}
              className="cursor-pointer max-h-64 rounded-md mx-auto"
            />
            <div className="file-preview-overlay">
              <div className="flex space-x-2">
                <button 
                  onClick={() => setShowFullImage(true)}
                  className="file-preview-button"
                  type="button"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                  </svg>
                  View Full Size
                </button>
                <button 
                  onClick={handleDownload}
                  disabled={downloading}
                  className="file-preview-button"
                  type="button"
                >
                  {downloading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Downloading...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">
              {file.fileName}
            </p>
            <button 
              onClick={handleDownload}
              disabled={downloading}
              type="button"
              className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center"
            >
              {downloading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-1 h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Downloading...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download
                </>
              )}
            </button>
          </div>
          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}
        </div>
      ) : (
        <div className="p-4 border rounded-md text-center">
          <p className="text-sm text-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {file.fileName}
          </p>
          <button 
            onClick={handleDownload}
            disabled={downloading}
            type="button"
            className={`mt-2 inline-flex items-center px-3 py-1.5 border border-blue-700 text-sm leading-5 font-medium rounded-md ${
              downloading 
                ? 'text-gray-500 bg-gray-100 border-gray-300' 
                : 'text-blue-700 bg-white hover:text-blue-500 hover:bg-blue-50'
            } focus:outline-none transition ease-in-out duration-150`}
          >
            {downloading ? (
              <>
                <svg className="animate-spin -ml-1 mr-1 h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Downloading...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download File
              </>
            )}
          </button>
          {error && (
            <div className="text-red-500 text-sm mt-2">{error}</div>
          )}
        </div>
      )}
      
      {showFullImage && <ImageModal />}
    </div>
  );
};

export default FilePreview;