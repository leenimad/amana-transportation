
export interface Location {
  lat: number;
  lng: number;
}

export interface BusStop {
  id: number;
  name: string;
  location: Location;
  arrivalTime: string;
  isNearest?: boolean; // Added to flag the nearest stop
  dynamicArrivalTime?: Date | string;
}

export interface Incident {
  id: number;
  type: string;
  description: string;
  reported_by: string;
  reported_time: string;
  status: string;
  priority: 'High' | 'Low';
  isUserReported?: boolean;
}

export interface VehicleInfo {
  license_plate: string;
  model: string;
  year: number;
  fuel_level: number;
  last_maintenance: string;
}

export interface Driver {
  name: string;
  id: string;
}

export interface RouteInfo {
    total_distance: number;
    average_speed: number;
    estimated_completion: string;
    frequency_minutes: number;
}

export interface Bus {
  id: number;
  location: Location;
  status: string;
  utilizationPercentage: number;
  nextStopId: number;
  vehicleInfo: VehicleInfo;
  driver: Driver;
}

export interface BusRoute {
  id: number;
  name: string;
  bus: Bus;
  stops: BusStop[];
  incidents: Incident[];
  routeInfo: RouteInfo;
}

export type Page = 'home' | 'about' | 'contact';
