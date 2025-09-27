import React from 'react';

interface AlertBannerProps {
  stopName: string;
  onCancel: () => void;
}

const AlertBanner: React.FC<AlertBannerProps> = ({ stopName, onCancel }) => (
  <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-6 rounded-r-lg shadow" role="alert">
    <div className="flex justify-between items-center">
      <div>
        <p className="font-bold">Alert Set</p>
        <p>We will notify you when you approach <strong>{stopName}</strong>.</p>
      </div>
      <button 
        onClick={onCancel} 
        className="bg-blue-200 hover:bg-blue-300 text-blue-800 font-bold py-1 px-3 rounded-full text-sm" 
        aria-label="Cancel alert"
      >
        Cancel
      </button>
    </div>
  </div>
);

export default AlertBanner;
