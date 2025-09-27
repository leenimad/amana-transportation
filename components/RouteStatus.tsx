import React from 'react';
import type { BusRoute, Incident } from '../types';

interface RouteStatusProps {
  route: BusRoute | null;
  onReportIncident: (routeId: number) => void;
  isAccessibilityMode: boolean;
}

const InfoPill: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
  <div className="bg-gray-200 rounded-full px-4 py-2 text-sm">
    <span className="font-semibold text-gray-700">{label}:</span>{' '}
    <span className="text-gray-900">{value}</span>
  </div>
);

const CapacityBar: React.FC<{ percentage: number; isAccessibilityMode: boolean }> = ({ percentage, isAccessibilityMode }) => {
  const bgColor = percentage > 85 ? 'bg-red-500' : percentage > 60 ? 'bg-yellow-500' : 'bg-green-500';
  
  let accessibilityClass = '';
  let accessibilityText = '';
  if (isAccessibilityMode) {
      if (percentage > 85) { accessibilityClass = 'capacity-bar-high'; accessibilityText = 'High Capacity'; }
      else if (percentage > 60) { accessibilityClass = 'capacity-bar-medium'; accessibilityText = 'Medium Capacity'; }
      else { accessibilityText = 'Low Capacity'; }
  }
  
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-base font-medium text-gray-700">Passenger Load</span>
        <span className="text-sm font-medium text-gray-700">{percentage}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-4">
        <div 
            className={`${bgColor} ${accessibilityClass} h-4 rounded-full transition-all duration-500`} 
            style={{ width: `${percentage}%` }}
            role="progressbar"
            aria-valuenow={percentage}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Passenger load is ${percentage} percent`}
        >
          {isAccessibilityMode && <span className="sr-only">{accessibilityText}</span>}
        </div>
      </div>
    </div>
  );
};

const IncidentAlert: React.FC<{ incident: Incident; isAccessibilityMode: boolean }> = ({ incident, isAccessibilityMode }) => {
    const isHighPriority = incident.priority === 'High';
    
    let bgColor, borderColor, iconColor, textColor;

    if (incident.isUserReported) {
        bgColor = 'bg-blue-100';
        borderColor = 'border-blue-500';
        iconColor = 'text-blue-500';
        textColor = 'text-blue-800';
    } else {
        bgColor = isHighPriority ? 'bg-red-100' : 'bg-yellow-100';
        borderColor = isHighPriority ? 'border-red-500' : 'border-yellow-500';
        iconColor = isHighPriority ? 'text-red-500' : 'text-yellow-500';
        textColor = isHighPriority ? 'text-red-800' : 'text-yellow-800';
    }

    return (
        <div className={`p-4 rounded-lg border-l-4 ${bgColor} ${borderColor} flex items-start space-x-4`}>
            <div className={`flex-shrink-0 ${iconColor}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            </div>
            <div>
                 {incident.isUserReported && (
                    <span className="text-xs font-bold uppercase text-blue-600 bg-blue-200 px-2 py-1 rounded-full mb-2 inline-block">
                        User Report
                    </span>
                )}
                <p className={`font-bold ${textColor}`}>
                    {isAccessibilityMode && isHighPriority && <span className="font-extrabold">[High Priority] </span>}
                    {incident.type}: <span className="font-medium">{incident.description}</span>
                </p>
                <p className={`text-sm ${textColor} opacity-80`}>
                    Reported by {incident.reported_by} at {incident.reported_time} - Status: {incident.status}
                </p>
            </div>
        </div>
    );
};

const AnalyticsCard: React.FC<{ icon: React.ReactNode; label: string; value: string | number; unit: string }> = ({ icon, label, value, unit }) => (
    <div className="bg-gray-100 p-4 rounded-lg flex items-center space-x-4">
        <div className="flex-shrink-0 h-10 w-10 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center" aria-hidden="true">{icon}</div>
        <div>
            <p className="text-sm text-gray-600 font-medium">{label}</p>
            <p className="text-lg font-bold text-gray-900">{value} <span className="text-sm font-normal text-gray-500">{unit}</span></p>
        </div>
    </div>
);

const RouteAnalytics: React.FC<{ route: BusRoute }> = ({ route }) => (
    <div>
        <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">Route Analytics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <AnalyticsCard 
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                label="Total Distance"
                value={route.routeInfo.total_distance}
                unit="km"
            />
            <AnalyticsCard 
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
                label="Average Speed"
                value={route.routeInfo.average_speed}
                unit="km/h"
            />
             <AnalyticsCard 
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
                label="Frequency"
                value={route.routeInfo.frequency_minutes}
                unit="mins"
            />
            <AnalyticsCard 
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                label="Est. Completion"
                value={route.routeInfo.estimated_completion}
                unit=""
            />
        </div>
    </div>
);


const RouteStatus: React.FC<RouteStatusProps> = ({ route, onReportIncident, isAccessibilityMode }) => {
  if (!route) {
    return null; // Don't render anything if no route is selected
  }

  return (
    <div className="px-4 md:px-6 py-6 mt-8">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Route Status: {route.name}</h2>
        
        <div className="bg-white p-6 rounded-xl shadow-lg space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
                <div className="space-y-4">
                     <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Bus Information</h3>
                     <InfoPill label="Driver" value={route.bus.driver.name} />
                     <InfoPill label="Vehicle" value={`${route.bus.vehicleInfo.model} (${route.bus.vehicleInfo.year})`} />
                </div>
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Live Status</h3>
                    <CapacityBar percentage={route.bus.utilizationPercentage} isAccessibilityMode={isAccessibilityMode} />
                </div>
            </div>

            <RouteAnalytics route={route} />
          
            <div>
                <div className="flex justify-between items-center border-b pb-2 mb-4">
                    <h3 className="text-lg font-semibold text-gray-700">Incidents & Alerts</h3>
                     <button 
                        onClick={() => onReportIncident(route.id)}
                        className="flex items-center gap-2 bg-blue-500 text-white text-sm font-semibold py-2 px-4 rounded-lg shadow hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        Report an Incident
                    </button>
                </div>
                {route.incidents.length > 0 ? (
                    <div className="space-y-4">
                        {route.incidents.map(incident => <IncidentAlert key={incident.id} incident={incident} isAccessibilityMode={isAccessibilityMode} />)}
                    </div>
                ) : (
                    <div className="text-center py-4 px-6 bg-green-100 text-green-800 rounded-lg">
                        <p>No incidents to report. Running smoothly.</p>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default RouteStatus;