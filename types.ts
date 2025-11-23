export enum AmenityType {
  RESTROOM = 'Restroom',
  WATER = 'Water Fountain',
  ATM = 'ATM',
  BIKE_RACK = 'Bike Rack',
  BENCH = 'Bench',
  TRASH = 'Trash Can',
  WIFI = 'Public Wi-Fi',
  OTHER = 'Other'
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Amenity {
  id: string;
  type: AmenityType;
  name: string;
  description: string;
  location: Coordinates;
  addedAt: number;
  verified?: boolean; // For AI verified spots in future
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface AIChatMessage {
  role: 'user' | 'model';
  text: string;
  sources?: GroundingSource[];
}
