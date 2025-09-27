import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import Menu from './components/Menu';
import HomePage from './components/HomePage';
import AboutPage from './components/AboutPage';
import ContactPage from './components/ContactPage';
// FIX: Import ReportIncidentModal component to be used.
import ReportIncidentModal from './components/ReportIncidentModal';
// FIX: Import Incident type for handling new incidents.
import type { BusRoute, Incident, Location } from './types';

const API_URL = 'https://api.allorigins.win/raw?url=https://www.amanabootcamp.org/api/fs-classwork-data/amana-transportation';

export type Page = 'home' | 'about' | 'contact';

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

const App: React.FC = () => {
  const [busRoutes, setBusRoutes] = useState<BusRoute[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [pageKey, setPageKey] = useState(0); // Used to trigger fade-in animation
  const [scrollToAnchor, setScrollToAnchor] = useState<string | null>(null);
  const [favoriteRouteIds, setFavoriteRouteIds] = useState<number[]>(() => {
    try {
      const storedFavorites = window.localStorage.getItem('favoriteBusRoutes');
      return storedFavorites ? JSON.parse(storedFavorites) : [];
    } catch (error) {
      console.error("Could not parse favorites from localStorage", error);
      return [];
    }
  });
  // FIX: Add state for managing the incident report modal.
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportingRouteId, setReportingRouteId] = useState<number | null>(null);
  // FIX: Add state for accessibility mode.
  const [isAccessibilityMode, setIsAccessibilityMode] = useState(false);

  // FIX: Load accessibility mode from localStorage on mount.
  useEffect(() => {
    try {
        const savedAccessMode = window.localStorage.getItem('accessibilityMode') === 'true';
        setIsAccessibilityMode(savedAccessMode);
    } catch (error) {
        console.error("Could not load accessibility mode from localStorage", error);
    }
  }, []);

  // FIX: Persist accessibility mode changes to localStorage and update document class.
  useEffect(() => {
    if (isAccessibilityMode) {
        document.documentElement.classList.add('accessibility-mode');
    } else {
        document.documentElement.classList.remove('accessibility-mode');
    }
    try {
        window.localStorage.setItem('accessibilityMode', String(isAccessibilityMode));
    } catch (error) {
        console.error("Could not save accessibility mode to localStorage", error);
    }
  }, [isAccessibilityMode]);

  useEffect(() => {
    try {
      window.localStorage.setItem('favoriteBusRoutes', JSON.stringify(favoriteRouteIds));
    } catch (error) {
      console.error("Could not save favorites to localStorage", error);
    }
  }, [favoriteRouteIds]);

  useEffect(() => {
    const fetchBusData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch(API_URL);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const responseData = await response.json();
        const rawRoutes = responseData.bus_lines;

        if (!Array.isArray(rawRoutes)) {
            throw new Error("Invalid data format from API: 'bus_lines' is not an array or is missing.");
        }

        const transformedRoutes: BusRoute[] = rawRoutes.map((route: any) => {
          const nextStop = route.bus_stops.find((stop: any) => stop.is_next_stop);

          return {
            id: route.id,
            name: route.route_number,
            bus: {
              id: route.id,
              location: {
                lat: route.current_location.latitude,
                lng: route.current_location.longitude,
              },
              status: route.status,
              utilizationPercentage: route.passengers.utilization_percentage,
              nextStopId: nextStop ? nextStop.id : -1,
              vehicleInfo: route.vehicle_info,
              driver: route.driver,
            },
            stops: route.bus_stops.map((stop: any) => ({
              id: stop.id,
              name: stop.name,
              location: {
                lat: stop.latitude,
                lng: stop.longitude,
              },
              arrivalTime: stop.estimated_arrival,
            })),
            incidents: route.incidents,
            routeInfo: route.route_info,
          };
        });

        setBusRoutes(transformedRoutes);
      } catch (e: unknown) {
        if (e instanceof Error) {
            setError(e.message);
        } else {
            setError("An unknown error occurred");
        }
        console.error("Failed to fetch bus data:", e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBusData();
  }, []);

  useEffect(() => {
    const simulationInterval = setInterval(() => {
        setBusRoutes(currentRoutes => 
            currentRoutes.map(route => {
                if (route.bus.status !== 'Active' || route.stops.length < 2) return route;

                const nextStopIndex = route.stops.findIndex(s => s.id === route.bus.nextStopId);
                if (nextStopIndex === -1) return route;

                const nextStop = route.stops[nextStopIndex];
                
                const distanceToNextStop = haversineDistance(route.bus.location, nextStop.location);
                
                // Average city bus speed is around 25 km/h. Interval is 2s.
                const speedKmPerSecond = 25 / 3600; 
                const intervalSeconds = 2;
                const distanceThisInterval = speedKmPerSecond * intervalSeconds;

                if (distanceToNextStop <= distanceThisInterval) {
                    // Arrived at the stop
                    const newNextStopIndex = (nextStopIndex + 1) % route.stops.length;
                    return {
                        ...route,
                        bus: {
                            ...route.bus,
                            location: nextStop.location,
                            nextStopId: route.stops[newNextStopIndex].id,
                        },
                    };
                } else {
                    // Move bus towards the next stop
                    const progress = distanceThisInterval / distanceToNextStop;
                    const newLat = route.bus.location.lat + (nextStop.location.lat - route.bus.location.lat) * progress;
                    const newLng = route.bus.location.lng + (nextStop.location.lng - route.bus.location.lng) * progress;
                    
                    return {
                        ...route,
                        bus: {
                            ...route.bus,
                            location: { lat: newLat, lng: newLng },
                        },
                    };
                }
            })
        );
    }, 2000);

    return () => clearInterval(simulationInterval);
  }, []);
  
  const handleNavigate = (page: Page, anchor?: string) => {
    setIsMenuOpen(false);

    if (currentPage === page && anchor) {
        const element = document.getElementById(anchor);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        return;
    }

    if (currentPage !== page) {
        setCurrentPage(page);
        setPageKey(prevKey => prevKey + 1);
    }

    if (anchor && page === 'home') {
        setScrollToAnchor(anchor);
    } else {
        setScrollToAnchor(null);
        window.scrollTo(0, 0);
    }
  };

  const toggleFavoriteRoute = (routeId: number) => {
    setFavoriteRouteIds(prevIds => 
      prevIds.includes(routeId)
        ? prevIds.filter(id => id !== routeId)
        : [...prevIds, routeId]
    );
  };

  // FIX: Handlers for opening the report modal and submitting an incident.
  const handleOpenReportModal = (routeId: number) => {
    setReportingRouteId(routeId);
    setIsReportModalOpen(true);
  };

  const handleIncidentSubmit = (data: { type: string; description: string }) => {
    if (reportingRouteId === null) return;
    
    const newIncident: Incident = {
        id: Date.now(),
        type: data.type,
        description: data.description,
        reported_by: "A Fellow Rider",
        reported_time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute:'2-digit' }),
        status: "Pending Review",
        priority: 'Low',
        isUserReported: true,
    };
    
    setBusRoutes(prevRoutes => 
        prevRoutes.map(route => 
            route.id === reportingRouteId 
                ? { ...route, incidents: [newIncident, ...route.incidents] } 
                : route
        )
    );
    
    setIsReportModalOpen(false);
    setReportingRouteId(null);
  };

  // FIX: Add handler to toggle accessibility mode.
  const toggleAccessibilityMode = () => {
    setIsAccessibilityMode(prev => !prev);
  };

  const renderPage = () => {
    const homePageProps = {
      busRoutes,
      isLoading,
      error,
      favoriteRouteIds,
      onToggleFavorite: toggleFavoriteRoute,
      scrollToAnchor,
      onAnchorScrolled: () => setScrollToAnchor(null),
      // FIX: Pass the onReportIncident handler to HomePage to fix the missing prop error.
      onReportIncident: handleOpenReportModal,
      // FIX: Pass isAccessibilityMode to HomePage to fix missing prop error.
      isAccessibilityMode,
    };
    switch (currentPage) {
      case 'home':
        return <HomePage {...homePageProps} />;
      case 'about':
        return <AboutPage />;
      case 'contact':
        return <ContactPage />;
      default:
        return <HomePage {...homePageProps} />;
    }
  };

  const reportingRoute = busRoutes.find(r => r.id === reportingRouteId);

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col font-sans">
      {/* FIX: Pass accessibility props to Header to fix missing props error. */}
      <Header 
        onMenuClick={() => setIsMenuOpen(true)} 
        onNavigate={handleNavigate}
        isAccessibilityMode={isAccessibilityMode}
        onToggleAccessibility={toggleAccessibilityMode}
      />
      <Menu 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)} 
        onNavigate={handleNavigate} 
        currentPage={currentPage}
        hasFavorites={favoriteRouteIds.length > 0}
      />
      
      <main className="container mx-auto px-2 sm:px-4 py-8 flex-grow">
         <div key={pageKey} className="animate-fade-in">
            {renderPage()}
         </div>
      </main>
      
      <Footer onNavigate={handleNavigate} />

      {/* FIX: Render the ReportIncidentModal component. */}
      <ReportIncidentModal 
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSubmit={handleIncidentSubmit}
        routeName={reportingRoute?.name || ''}
      />
    </div>
  );
};

export default App;
