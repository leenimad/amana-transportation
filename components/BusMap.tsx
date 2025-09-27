import React, { useEffect, useRef } from 'react';
import type { BusRoute, Location } from '../types';
import * as L from 'leaflet';

const getBusIconHtml = (status: string) => {
  let colorClass = 'bg-green-600'; // Default to Active
  let opacityClass = '';
  if (status === 'Maintenance') {
    colorClass = 'bg-orange-500';
  } else if (status === 'Out of Service') {
    colorClass = 'bg-gray-500';
    opacityClass = 'opacity-70';
  }

  return `
    <div style="position: relative; width: 40px; height: 40px;" class="${opacityClass}">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-10 h-10 text-white ${colorClass} rounded-lg p-1 border-2 border-white shadow-lg">
        <path d="M4 2C2.89543 2 2 2.89543 2 4V18C2 19.1046 2.89543 20 4 20H6V22H8V20H16V22H18V20H20C21.1046 20 22 19.1046 22 18V4C22 2.89543 21.1046 2 20 2H4ZM6 6H18V11H6V6ZM6 13H11V16H6V13ZM13 13H18V16H13V13Z" />
        <circle cx="7.5" cy="18.5" r="1.5" />
        <circle cx="16.5" cy="18.5" r="1.5" />
      </svg>
    </div>
  `;
};

const stopIconHtml = (isNearest: boolean) => `
  <div style="position: relative; width: 32px; height: 32px;">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-8 h-8 ${isNearest ? 'text-green-500' : 'text-red-600'}" style="filter: drop-shadow(0 4px 3px rgba(0,0,0,0.2));">
      <path fill-rule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a2.25 2.25 0 001.243-2.121V8.652a2.25 2.25 0 00-2.25-2.25h-1.5a2.25 2.25 0 00-2.25 2.25v11.585c0 .858.461 1.63 1.243 2.121zM12 10.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" clip-rule="evenodd" />
    </svg>
    ${isNearest ? '<div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-green-500 opacity-75 pulse-ring"></div>' : ''}
  </div>
`;

const userLocationIconHtml = `
  <div style="position: relative; width: 24px; height: 24px;">
    <div class="h-6 w-6 rounded-full bg-blue-500 border-2 border-white shadow-md"></div>
    <div class="absolute top-0 left-0 h-6 w-6 rounded-full bg-blue-500 opacity-75 pulse-ring"></div>
  </div>
`;

// Helper function to format arrival times dynamically
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

interface BusMapProps {
  route: BusRoute | null;
  userLocation: Location | null;
}

const BusMap: React.FC<BusMapProps> = ({ route, userLocation }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const staticFeaturesRef = useRef<L.FeatureGroup | null>(null);
  const busMarkerRef = useRef<L.Marker | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (mapContainerRef.current && !mapRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [3.139, 101.6869],
        zoom: 12,
      });

      const streetLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      });
      const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
      });
      const darkLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      });
      
      streetLayer.addTo(map);

      const baseMaps = {
          "Street": streetLayer,
          "Satellite": satelliteLayer,
          "Dark": darkLayer
      };

      L.control.layers(baseMaps).addTo(map);

      mapRef.current = map;
      staticFeaturesRef.current = L.featureGroup().addTo(map);
    }
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const staticFeatures = staticFeaturesRef.current;

    if (!map || !staticFeatures) return;
    
    staticFeatures.clearLayers();

    if (route) {
      route.stops.forEach(stop => {
        const icon = L.divIcon({ html: stopIconHtml(!!stop.isNearest), className: '', iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor: [0, -32] });
        L.marker([stop.location.lat, stop.location.lng], { icon })
          .bindPopup(`<b>${stop.name}</b><br>Next Arrival: ${formatArrivalTime(stop.dynamicArrivalTime)}`)
          .addTo(staticFeatures);
      });

      const busLatLng: L.LatLngTuple = [route.bus.location.lat, route.bus.location.lng];
      const busIcon = L.divIcon({ 
          html: getBusIconHtml(route.bus.status), 
          className: '', 
          iconSize: [40, 40], 
          iconAnchor: [20, 20], 
          popupAnchor: [0, -20] 
      });

      if (busMarkerRef.current) {
        busMarkerRef.current.setLatLng(busLatLng);
        busMarkerRef.current.setIcon(busIcon);
      } else {
        busMarkerRef.current = L.marker(busLatLng, { icon: busIcon, zIndexOffset: 1000 }).addTo(map);
        const iconElement = busMarkerRef.current.getElement();
        if (iconElement) {
          iconElement.style.transition = 'transform 2s linear';
        }
      }

      const nextStop = route.stops.find(s => s.id === route.bus.nextStopId);
      busMarkerRef.current.bindPopup(`<b>${route.name}</b><br>Status: ${route.bus.status}<br>Load: ${route.bus.utilizationPercentage}%<br>Next Stop: ${nextStop?.name || 'N/A'}`);
      
      const latLngs = route.stops.map(stop => L.latLng(stop.location.lat, stop.location.lng));
      L.polyline(latLngs, { color: '#4b5563', weight: 4, opacity: 0.7 }).addTo(staticFeatures);

      // Fit bounds only when route is first selected
      if (!map.getBounds().contains(L.latLngBounds(latLngs).pad(0.1))) {
        map.fitBounds(staticFeatures.getBounds().pad(0.1));
      }

    } else {
       if (busMarkerRef.current) {
          busMarkerRef.current.remove();
          busMarkerRef.current = null;
       }
       map.setView([3.139, 101.6869], 12);
    }
  }, [route]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (userLocation) {
        const icon = L.divIcon({ html: userLocationIconHtml, className: '', iconSize: [24, 24], iconAnchor: [12, 12] });
        if (userMarkerRef.current) {
            userMarkerRef.current.setLatLng([userLocation.lat, userLocation.lng]);
        } else {
            userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], { icon, zIndexOffset: 1100 }).addTo(map);
        }

        // Fit map around user and nearest stop when location is found
        const nearestStop = route?.stops.find(s => s.isNearest);
        if (nearestStop) {
            const bounds = L.latLngBounds([
                [userLocation.lat, userLocation.lng],
                [nearestStop.location.lat, nearestStop.location.lng]
            ]);
            map.fitBounds(bounds.pad(0.5));
        }

    } else {
        if (userMarkerRef.current) {
            userMarkerRef.current.remove();
            userMarkerRef.current = null;
        }
    }
  }, [userLocation, route]);

  return <div ref={mapContainerRef} className="h-96 md:h-[500px] w-full rounded-lg shadow-md" />;
};

export default BusMap;
