export enum AmenityType {
  RESTROOM = 'Restroom',
  WATER = 'Water Fountain',
  ATM = 'ATM',
  BIKE_RACK = 'Bike Rack',
  BENCH = 'Bench',
  TRASH = 'Trash Can',
  WIFI = 'Public Wi-Fi',
  EVENT = 'Group Event', // New Type
  MEETUP = 'Meetup Point', // New Type
  OTHER = 'Other'
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface UserProfile {
  id: string;
  email: string;
}

export interface Group {
  id: string;
  name: string;
  description: string;
  creator_id: string;
  is_private: boolean;
  join_code?: string; // Optional password
}

export interface Amenity {
  id: string;
  type: AmenityType;
  name: string;
  description: string;
  location: Coordinates;
  addedAt: number;
  groupId?: string; // If null, it is public. If set, only visible to group.
  eventDate?: string; // If set, this is a scheduled event
  creatorId?: string;
}

export interface AIChatMessage {
  role: 'user' | 'model';
  text: string;
}