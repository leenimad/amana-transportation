'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import dynamic from 'next/dynamic';
import Hero from './Hero';
import BusSchedule from './BusSchedule';
import RouteStatus from './RouteStatus';
import AllRoutesOverview from './AllRoutesOverview';
import FavoriteRoutesOverview from './FavoriteRoutesOverview';
import AlertBanner from './AlertBanner';
import AlertModal from './AlertModal';
import type { BusRoute, Location, BusStop } from '../types';

// Dynamically import BusMap to avoid SSR issues with Leaflet
const BusMap = dynamic(() => import('./BusMap'), {
  ssr: false,
  loading: () => <div className="h-96 md:h-[500px] w-full rounded-lg shadow-md bg-gray-200 animate-pulse" />,
});

interface HomePageProps {
  busRoutes: BusRoute[];
  isLoading: boolean;
  error: string | null;
  favoriteRouteIds: number[];
  onToggleFavorite: (id: number) => void;
  scrollToAnchor: string | null;
  onAnchorScrolled: () => void;
  onReportIncident: (routeId: number) => void;
  isAccessibilityMode: boolean;
}

// BusSelector component is defined within HomePage.tsx to keep file count low.
interface BusSelectorProps {
  routes: BusRoute[];
  selectedRouteId: number | null;
  onSelectRoute: (id: number) => void;
  favoriteRouteIds: number[];
}

const BusSelector: React.FC<BusSelectorProps> = ({ routes, selectedRouteId, onSelectRoute, favoriteRouteIds }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-500';
      case 'Maintenance':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="flex flex-wrap justify-center gap-2 mb-6" role="toolbar" aria-label="Bus route selector">
      {routes.map(route => {
        const isFavorite = favoriteRouteIds.includes(route.id);
        return (
            <button
            key={route.id}
            onClick={() => onSelectRoute(route.id)}
            aria-pressed={selectedRouteId === route.id}
            className={`flex items-center gap-3 px-4 py-2 text-sm md:px-6 md:text-base rounded-md font-semibold transition-all duration-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
                selectedRouteId === route.id
                ? 'bg-green-600 text-white shadow-lg transform scale-105'
                : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
            }`}
            >
            <span className={`h-3 w-3 rounded-full ${getStatusColor(route.bus.status)} border-2 border-white`}></span>
            {route.name}
            {isFavorite && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-300 ml-1" viewBox="0 0 20 20" fill="currentColor" aria-label="Favorite route">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
            )}
            </button>
        )
      })}
    </div>
  );
};

const HomePage: React.FC<HomePageProps> = ({ busRoutes, isLoading, error, favoriteRouteIds, onToggleFavorite, scrollToAnchor, onAnchorScrolled, onReportIncident, isAccessibilityMode }) => {
  const firstActiveRouteId = busRoutes.find(r => r.bus.status === 'Active')?.id;
  
  const [selectedRouteId, setSelectedRouteId] = useState<number | null>(null);
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [nearestStopId, setNearestStopId] = useState<number | null>(null);
  const [isFindingLocation, setIsFindingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // State for Smart Stop Alert feature
  const [alertStopId, setAlertStopId] = useState<number | null>(null);
  const [isApproaching, setIsApproaching] = useState(false);
  const watchIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (busRoutes.length > 0 && selectedRouteId === null) {
        const initialRouteId = firstActiveRouteId ?? busRoutes[0].id;
        setSelectedRouteId(initialRouteId);
    }
  }, [busRoutes, selectedRouteId, firstActiveRouteId]);

  useEffect(() => {
    if (scrollToAnchor) {
        const timer = setTimeout(() => {
            const element = document.getElementById(scrollToAnchor);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
            onAnchorScrolled();
        }, 100);
        return () => clearTimeout(timer);
    }
  }, [scrollToAnchor, onAnchorScrolled]);

  const selectedRoute = busRoutes.find(route => route.id === selectedRouteId) || null;

  const haversineDistance = (coords1: Location, coords2: Location) => {
    const toRad = (x: number) => (x * Math.PI) / 180;
    const R = 6371; // Earth radius in km
    const dLat = toRad(coords2.lat - coords1.lat);
    const dLon = toRad(coords2.lng - coords1.lng);
    const lat1 = toRad(coords1.lat);
    const lat2 = toRad(coords2.lat);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Effect for managing geolocation watch for stop alerts
  useEffect(() => {
    if (alertStopId && selectedRoute) {
        const targetStop = selectedRoute.stops.find(s => s.id === alertStopId);
        if (!targetStop) return;

        watchIdRef.current = navigator.geolocation.watchPosition(
            (position) => {
                const currentUserLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                };
                const distance = haversineDistance(currentUserLocation, targetStop.location);
                // Trigger alert if user is within 500 meters
                if (distance <= 0.5) {
                    setIsApproaching(true);
                    // Clear the alert once triggered
                    handleCancelAlert();
                }
            },
            (error) => {
                setLocationError(`Alert failed: ${error.message}`);
                handleCancelAlert();
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    }

    return () => {
        if (watchIdRef.current !== null) {
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
        }
    };
  }, [alertStopId, selectedRoute]);
  
  const routeWithDynamicEtas = useMemo(() => {
    if (!selectedRoute) return null;
    
    const speedKmPerSecond = 25 / 3600; // Assumed average speed
    const nextStopIndex = selectedRoute.stops.findIndex(s => s.id === selectedRoute.bus.nextStopId);
    
    const updatedStops = selectedRoute.stops.map((stop, index) => {
      let dynamicArrivalTime: Date | string;
      if (nextStopIndex !== -1 && index < nextStopIndex) {
          dynamicArrivalTime = "Passed";
      } else {
          let totalDistance = 0;
          let lastStopLocation = selectedRoute.bus.location;
          
          if (nextStopIndex !== -1) {
            for (let i = nextStopIndex; i <= index; i++) {
                const currentStopLocation = selectedRoute.stops[i].location;
                totalDistance += haversineDistance(lastStopLocation, currentStopLocation);
                lastStopLocation = currentStopLocation;
            }
          } else {
            totalDistance = haversineDistance(selectedRoute.bus.location, stop.location);
          }

          const timeSeconds = totalDistance / speedKmPerSecond;
          dynamicArrivalTime = new Date(Date.now() + timeSeconds * 1000);
      }
      
      return { 
        ...stop, 
        dynamicArrivalTime,
        isNearest: stop.id === nearestStopId 
      };
    });

    return {
        ...selectedRoute,
        stops: updatedStops
    };
  }, [selectedRoute, nearestStopId]);

  const handleFindNearestStop = () => {
    if (!selectedRoute) {
      setLocationError("Please select a route first.");
      setTimeout(() => setLocationError(null), 3000);
      return;
    }
    
    setIsFindingLocation(true);
    setLocationError(null);
    setNearestStopId(null);

    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      setIsFindingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const currentUserLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserLocation(currentUserLocation);

        let closestStop: BusStop | null = null;
        let minDistance = Infinity;

        selectedRoute.stops.forEach(stop => {
          const distance = haversineDistance(currentUserLocation, stop.location);
          if (distance < minDistance) {
            minDistance = distance;
            closestStop = stop;
          }
        });
        
         setNearestStopId((closestStop as unknown as BusStop).id);
        setIsFindingLocation(false);
      },
      (error) => {
        setLocationError(`Error getting location: ${error.message}`);
        setIsFindingLocation(false);
        setTimeout(() => setLocationError(null), 5000);
      }
    );
  };
  
  const handleSetAlert = (stopId: number) => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported for alerts.");
      setTimeout(() => setLocationError(null), 5000);
      return;
    }
    setAlertStopId(currentId => (currentId === stopId ? null : stopId));
  };
  
  const handleCancelAlert = () => {
    setAlertStopId(null);
  };

  if (isLoading) {
    return (
        <div className="text-center p-10 text-gray-600">
          <p className="text-xl">Loading Bus Data...</p>
        </div>
    );
  }

  if (error) {
      return (
          <div className="text-center p-10 text-red-600 bg-red-50 rounded-lg">
              <p className="text-xl font-semibold">Failed to load data</p>
              <p>{error}</p>
          </div>
      );
  }

  const favoriteRoutes = busRoutes.filter(r => favoriteRouteIds.includes(r.id));
  const sortedBusRoutes = [...busRoutes].sort((a, b) => {
      const aIsFavorite = favoriteRouteIds.includes(a.id);
      const bIsFavorite = favoriteRouteIds.includes(b.id);
      if (aIsFavorite && !bIsFavorite) return -1;
      if (!aIsFavorite && bIsFavorite) return 1;
      return a.id - b.id;
  });

  const alertStop = selectedRoute?.stops.find(s => s.id === alertStopId);

  return (
    <>
      <Hero />
      <div id="route-details" className="bg-white shadow-xl rounded-lg overflow-hidden mt-8">
        <div className="bg-amber-200 p-4">
          <h2 className="text-2xl font-bold text-center text-gray-800">Active Bus Map</h2>
        </div>
        <div className="p-4 md:p-6 relative">
          <BusSelector 
            routes={sortedBusRoutes} 
            selectedRouteId={selectedRouteId} 
            onSelectRoute={(id) => {
                setSelectedRouteId(id);
                setNearestStopId(null);
                setUserLocation(null);
                handleCancelAlert();
            }} 
            favoriteRouteIds={favoriteRouteIds}
          />
          <BusMap route={routeWithDynamicEtas} userLocation={userLocation} />
          <button 
            onClick={handleFindNearestStop}
            disabled={isFindingLocation}
            aria-label="Find my nearest bus stop"
            className="absolute bottom-10 right-8 z-[1000] bg-white text-gray-800 font-semibold py-2 px-4 rounded-lg shadow-xl hover:bg-gray-200 transition-colors flex items-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
            {isFindingLocation ? 'Locating...' : 'Find My Nearest Stop'}
          </button>
          {locationError && <div role="alert" aria-live="polite" className="absolute top-2 left-1/2 -translate-x-1/2 bg-red-500 text-white text-sm py-1 px-3 rounded-full z-[1000]">{locationError}</div>}
        </div>

        <RouteStatus route={selectedRoute} onReportIncident={onReportIncident} isAccessibilityMode={isAccessibilityMode} />

        <div className="bg-amber-200 p-4 mt-8">
          <h2 className="text-2xl font-bold text-center text-gray-800">Bus Schedule & Alerts</h2>
        </div>
        <div className="p-4 md:p-6">
          {alertStop && <AlertBanner stopName={alertStop.name} onCancel={handleCancelAlert} />}
          <BusSchedule 
            route={routeWithDynamicEtas}
            alertStopId={alertStopId}
            onSetAlert={handleSetAlert}
            isAccessibilityMode={isAccessibilityMode}
          />
        </div>
      </div>

      {favoriteRoutes.length > 0 && (
        <FavoriteRoutesOverview 
            routes={favoriteRoutes} 
            favoriteRouteIds={favoriteRouteIds}
            onToggleFavorite={onToggleFavorite}
        />
      )}

      <AllRoutesOverview 
        routes={busRoutes} 
        favoriteRouteIds={favoriteRouteIds}
        onToggleFavorite={onToggleFavorite}
      />

      {isApproaching && selectedRoute && (
         <AlertModal 
            stopName={selectedRoute.stops.find(s => s.id === alertStopId)?.name || 'your stop'} 
            onDismiss={() => setIsApproaching(false)}
        />
      )}
    </>
  );
};

export default HomePage;