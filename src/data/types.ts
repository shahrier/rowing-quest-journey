
export interface User {
  id: string;
  name: string;
  avatar?: string;
  email: string;
  rowingDistanceM: number; // Changed from rowingDistanceKm to rowingDistanceM
  strengthSessions: number;
  achievements: string[];
  joinedAt: Date;
}

export interface JourneyPoint {
  id: string;
  name: string;
  description: string;
  distanceFromStart: number; // km
  isReached: boolean;
  reachedAt?: Date;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface RowingLog {
  id: string;
  userId: string;
  distanceM: number; // Changed from distanceKm to distanceM
  date: Date;
  notes?: string;
}

export interface TrainingSession {
  id: string;
  userId: string;
  type: 'strength' | 'rowing';
  date: Date;
  duration: number; // minutes
  notes?: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: string;
  unlockedBy: string[];
}
