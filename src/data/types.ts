
export interface User {
  id: string;
  name: string;
  avatar?: string;
  email: string;
  rowingDistanceM: number;
  strengthSessions: number;
  achievements: string[];
  joinedAt: Date;
  teamId?: string; // New: Reference to team
  isTeamManager?: boolean; // New: Flag for team managers
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
  distanceM: number;
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

// New: Team interface
export interface Team {
  id: string;
  name: string;
  createdAt: Date;
  managerId: string;
  members: string[]; // Array of user IDs
  journeyId: string; // Reference to journey
}

// New: Journey interface
export interface Journey {
  id: string;
  name: string;
  description: string;
  startLocation: {
    name: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  endLocation: {
    name: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  totalDistanceKm: number;
  checkpoints: JourneyPoint[];
}
