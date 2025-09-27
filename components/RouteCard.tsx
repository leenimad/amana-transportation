import React from 'react';
import type { BusRoute } from '../types';

const StatusIndicator: React.FC<{ status: string }> = ({ status }) => {
    let bgColor = 'bg-gray-500';
    if (status === 'Active') bgColor = 'bg-green-500';
    if (status === 'Maintenance') bgColor = 'bg-orange-500';

    return (
        <div className="flex items-center gap-2">
            <span className={`h-3 w-3 rounded-full ${bgColor}`} aria-hidden="true"></span>
            <span className="font-medium text-gray-700">{status}</span>
        </div>
    );
};

interface RouteCardProps {
    route: BusRoute;
    isFavorite: boolean;
    onToggleFavorite: (id: number) => void;
}

const RouteCard: React.FC<RouteCardProps> = ({ route, isFavorite, onToggleFavorite }) => (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl hover:transform hover:-translate-y-1 transition-all duration-300 flex flex-col">
        <div className="relative mb-4">
            <h3 className="text-xl font-bold text-gray-800 pr-10">{route.name}</h3>
            <button
                onClick={() => onToggleFavorite(route.id)}
                aria-pressed={isFavorite}
                aria-label={isFavorite ? `Remove route ${route.name} from favorites` : `Add route ${route.name} to favorites`}
                className="absolute top-[-8px] right-[-8px] p-2 rounded-full text-gray-400 hover:text-yellow-500 hover:bg-gray-100 transition-colors"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill={isFavorite ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976-2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
            </button>
        </div>
        <div className="space-y-3 flex-grow">
            <div className="flex justify-between items-center">
                <span className="text-gray-600">Status:</span>
                <StatusIndicator status={route.bus.status} />
            </div>
            <div className="flex justify-between items-center">
                <span className="text-gray-600">Passenger Load:</span>
                <span className="font-semibold text-gray-800">{route.bus.utilizationPercentage}%</span>
            </div>
            <div className="flex justify-between items-center">
                <span className="text-gray-600">Active Incidents:</span>
                <span className={`font-semibold ${route.incidents.length > 0 ? 'text-red-500' : 'text-green-500'}`}>
                    {route.incidents.length}
                </span>
            </div>
        </div>
    </div>
);

export default RouteCard;
