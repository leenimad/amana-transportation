'use client';

import React, { useState, useEffect, useRef } from 'react';

interface ReportIncidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { type: string; description: string }) => void;
  routeName: string;
}

const INCIDENT_TYPES = [
    "Bus Crowded",
    "Bus Delayed",
    "Maintenance Issue",
    "Traffic Jam",
    "Lost Item",
    "Driver Feedback",
    "Other",
];

const ReportIncidentModal: React.FC<ReportIncidentModalProps> = ({ isOpen, onClose, onSubmit, routeName }) => {
  const [type, setType] = useState(INCIDENT_TYPES[0]);
  const [description, setDescription] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (type) {
      onSubmit({ type, description });
      // Reset form
      setType(INCIDENT_TYPES[0]);
      setDescription('');
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-2xl w-full max-w-md mx-auto transform transition-all"
        onClick={e => e.stopPropagation()} // Prevent closing when clicking inside modal
      >
        <div className="p-6">
            <div className="flex justify-between items-start">
                <div>
                    <h2 id="modal-title" className="text-2xl font-bold text-gray-800">Report an Incident</h2>
                    <p className="text-gray-600 mt-1">Route: {routeName}</p>
                </div>
                <button
                    onClick={onClose}
                    className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-400"
                    aria-label="Close modal"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                 <div>
                    <label htmlFor="incident-type" className="block text-sm font-medium text-gray-700 mb-1">
                        Type of Incident
                    </label>
                    <select
                        id="incident-type"
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 bg-white"
                        required
                    >
                        {INCIDENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>
                
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                        Optional Details
                    </label>
                    <textarea
                        id="description"
                        rows={4}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="e.g., 'Bus is full, might have to wait for the next one.'"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                    />
                </div>
                
                <div className="flex justify-end gap-4 pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2 bg-gray-200 text-gray-800 font-semibold rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-6 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                    >
                        Submit Report
                    </button>
                </div>
            </form>
        </div>
      </div>
    </div>
  );
};

export default ReportIncidentModal;
