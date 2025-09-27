import React from 'react';
import type { BusRoute } from '../types';
import RouteCard from './RouteCard';

interface AllRoutesOverviewProps {
  routes: BusRoute[];
  favoriteRouteIds: number[];
  onToggleFavorite: (id: number) => void;
}

const AllRoutesOverview: React.FC<AllRoutesOverviewProps> = ({ routes, favoriteRouteIds, onToggleFavorite }) => {
  return (
    <div id="all-routes-overview" className="py-12 mt-12 bg-gray-200 rounded-lg">
        <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">All Routes Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {routes.map(route => (
                    <RouteCard 
                        key={route.id} 
                        route={route} 
                        isFavorite={favoriteRouteIds.includes(route.id)}
                        onToggleFavorite={onToggleFavorite}
                    />
                ))}
            </div>
        </div>
    </div>
  );
};

export default AllRoutesOverview;
