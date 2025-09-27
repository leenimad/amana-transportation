import React from 'react';
import type { BusRoute } from '../types';

interface BusScheduleProps {
  route: BusRoute | null;
  alertStopId: number | null;
  onSetAlert: (stopId: number) => void;
  isAccessibilityMode: boolean;
}

const formatArrivalTime = (arrival: Date | string | undefined): string => {
  if (!arrival) return '-';
  if (typeof arrival === 'string') return arrival; // e.g., "Passed"

  const now = Date.now();
  const diffMinutes = (arrival.getTime() - now) / 60000;

  if (diffMinutes <= 0.5) {
    return "Arriving now";
  }
  if (diffMinutes < 1) {
    return "< 1 min";
  }
  return `${Math.round(diffMinutes)} min`;
};

const BusSchedule: React.FC<BusScheduleProps> = ({ route, alertStopId, onSetAlert, isAccessibilityMode }) => {
  if (!route) {
    return (
      <div className="text-center text-gray-500 py-8 bg-gray-50 rounded-lg">
        <p>Please select a bus route to view its schedule.</p>
      </div>
    );
  }

  const { stops, bus } = route;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-x-auto">
      <table className="w-full text-left">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-4 font-semibold text-gray-600">Bus Stop</th>
            <th className="p-4 font-semibold text-gray-600">Estimated Arrival</th>
            <th className="p-4 font-semibold text-gray-600 text-center">Alert</th>
          </tr>
        </thead>
        <tbody>
          {stops.map((stop) => {
            const isNextStop = stop.id === bus.nextStopId;
            const isNearestStop = stop.isNearest;
            const isAlertSet = stop.id === alertStopId;
            
            let rowClass = 'border-t border-gray-200 transition-colors duration-300';
            if (isNextStop) rowClass += ' bg-amber-100';
            if (isNearestStop) rowClass += ' bg-green-200';
            if (isAlertSet) rowClass += ' bg-blue-100';

            return (
              <tr 
                key={stop.id} 
                className={rowClass}
              >
                <td className={`p-4 font-medium ${(isNextStop || isNearestStop || isAlertSet) ? 'text-black' : 'text-gray-800'}`}>
                  {isAccessibilityMode && isNextStop && <span aria-hidden="true" className="font-bold mr-2 text-yellow-300">➔</span>}
                  {isAccessibilityMode && isNearestStop && <span aria-hidden="true" className="font-bold mr-2 text-yellow-300">★</span>}
                  {stop.name}
                  {!isAccessibilityMode && isNextStop && <span className="ml-2 text-xs font-semibold text-amber-800 bg-amber-200 px-2 py-1 rounded-full">Next Stop</span>}
                  {!isAccessibilityMode && isNearestStop && <span className="ml-2 text-xs font-semibold text-green-800 bg-green-300 px-2 py-1 rounded-full">Nearest</span>}
                  
                  {isAccessibilityMode && isNextStop && <span className="sr-only">(Next Stop)</span>}
                  {isAccessibilityMode && isNearestStop && <span className="sr-only">(Nearest Stop to you)</span>}
                </td>
                <td className={`p-4 font-mono ${(isNextStop || isNearestStop || isAlertSet) ? 'text-black font-bold' : 'text-gray-600'}`}>
                  {formatArrivalTime(stop.dynamicArrivalTime)}
                </td>
                <td className="p-4 text-center">
                  <button 
                    onClick={() => onSetAlert(stop.id)}
                    className={`p-2 rounded-full transition-colors ${
                      isAlertSet 
                        ? 'bg-blue-200 text-blue-600' 
                        : 'text-gray-400 hover:bg-gray-200 hover:text-gray-600'
                    }`}
                    aria-label={isAlertSet ? `Cancel alert for ${stop.name}` : `Set alert for ${stop.name}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill={isAlertSet ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default BusSchedule;