import React from 'react';

interface AlertModalProps {
  stopName: string;
  onDismiss: () => void;
}

const AlertModal: React.FC<AlertModalProps> = ({ stopName, onDismiss }) => (
  <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center p-4 animate-fade-in" role="dialog" aria-modal="true" aria-labelledby="alert-modal-title">
    <div className="bg-white rounded-lg shadow-2xl w-full max-w-sm mx-auto text-center p-8 animate-modal-pop-in">
      <div className="mx-auto mb-4 w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      </div>
      <h2 id="alert-modal-title" className="text-2xl font-bold text-gray-800">Approaching Your Stop!</h2>
      <p className="text-gray-600 mt-2 text-lg">Time to get ready to alight at:</p>
      <p className="text-green-600 font-bold text-xl mt-2">{stopName}</p>
      <button 
        onClick={onDismiss} 
        className="mt-6 w-full py-3 px-4 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
      >
        Got it!
      </button>
    </div>
  </div>
);

export default AlertModal;
