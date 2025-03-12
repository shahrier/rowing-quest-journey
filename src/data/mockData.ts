import { Achievement, JourneyPoint, User } from "./types";

export const TOTAL_JOURNEY_DISTANCE_KM = 5556; // km from Boston to Rotterdam
export const TOTAL_JOURNEY_DISTANCE_M = TOTAL_JOURNEY_DISTANCE_KM * 1000; // m from Boston to Rotterdam

// Added mock data for testing purposes
export const mockTeamName = "Atlantic Rowers";
export const mockJourneyName = "Boston to Rotterdam";

export const currentUser: User = {
  id: "u1",
  name: "Jane Doe",
  email: "jane@example.com",
  rowingDistanceM: 120000, // Changed from 120 km to 120000 m
  strengthSessions: 8,
  achievements: ["a1", "a3"],
  joinedAt: new Date("2023-01-15"),
};

export const mockUsers: User[] = [
  currentUser,
  {
    id: "u2",
    name: "John Smith",
    email: "john@example.com",
    rowingDistanceM: 155000, // Changed from 155 km to 155000 m
    strengthSessions: 12,
    achievements: ["a1", "a2", "a3"],
    joinedAt: new Date("2023-01-10"),
  },
  {
    id: "u3",
    name: "Emma Wilson",
    email: "emma@example.com",
    rowingDistanceM: 200000, // Changed from 200 km to 200000 m
    strengthSessions: 15,
    achievements: ["a1", "a2", "a3", "a4"],
    joinedAt: new Date("2023-01-05"),
  },
  {
    id: "u4",
    name: "Michael Brown",
    email: "michael@example.com",
    rowingDistanceM: 180000, // Changed from 180 km to 180000 m
    strengthSessions: 10,
    achievements: ["a1", "a3"],
    joinedAt: new Date("2023-01-20"),
  },
  {
    id: "u5",
    name: "Olivia Davis",
    email: "olivia@example.com",
    rowingDistanceM: 110000, // Changed from 110 km to 110000 m
    strengthSessions: 7,
    achievements: ["a1"],
    joinedAt: new Date("2023-01-25"),
  },
  {
    id: "u6",
    name: "William Johnson",
    email: "william@example.com",
    rowingDistanceM: 90000, // Changed from 90 km to 90000 m
    strengthSessions: 5,
    achievements: ["a1"],
    joinedAt: new Date("2023-02-01"),
  },
  {
    id: "u7",
    name: "Sophia Miller",
    email: "sophia@example.com",
    rowingDistanceM: 220000, // Changed from 220 km to 220000 m
    strengthSessions: 18,
    achievements: ["a1", "a2", "a3", "a4"],
    joinedAt: new Date("2023-01-03"),
  },
  {
    id: "u8",
    name: "James Taylor",
    email: "james@example.com",
    rowingDistanceM: 135000, // Changed from 135 km to 135000 m
    strengthSessions: 9,
    achievements: ["a1", "a3"],
    joinedAt: new Date("2023-01-18"),
  },
  {
    id: "u9",
    name: "Charlotte Anderson",
    email: "charlotte@example.com",
    rowingDistanceM: 105000, // Changed from 105 km to 105000 m
    strengthSessions: 6,
    achievements: ["a1"],
    joinedAt: new Date("2023-01-28"),
  },
  {
    id: "u10",
    name: "Benjamin Thomas",
    email: "benjamin@example.com",
    rowingDistanceM: 175000, // Changed from 175 km to 175000 m
    strengthSessions: 11,
    achievements: ["a1", "a2", "a3"],
    joinedAt: new Date("2023-01-12"),
  },
  {
    id: "u11",
    name: "Amelia Jackson",
    email: "amelia@example.com",
    rowingDistanceM: 160000, // Changed from 160 km to 160000 m
    strengthSessions: 13,
    achievements: ["a1", "a2", "a3"],
    joinedAt: new Date("2023-01-08"),
  },
  {
    id: "u12",
    name: "Daniel White",
    email: "daniel@example.com",
    rowingDistanceM: 190000, // Changed from 190 km to 190000 m
    strengthSessions: 14,
    achievements: ["a1", "a2", "a3", "a4"],
    joinedAt: new Date("2023-01-06"),
  },
];

export const journeyPoints: JourneyPoint[] = [
  {
    id: "p1",
    name: "Boston",
    description: "Starting point of our journey",
    distanceFromStart: 0,
    isReached: true,
    reachedAt: new Date("2023-01-15"),
    coordinates: { lat: 42.3601, lng: -71.0589 },
  },
  {
    id: "p2",
    name: "Halifax",
    description: "First major stop along the Atlantic",
    distanceFromStart: 800,
    isReached: true,
    reachedAt: new Date("2023-02-10"),
    coordinates: { lat: 44.6488, lng: -63.5752 },
  },
  {
    id: "p3",
    name: "Reykjavik",
    description: "Icelandic capital",
    distanceFromStart: 2400,
    isReached: false,
    coordinates: { lat: 64.1466, lng: -21.9426 },
  },
  {
    id: "p4",
    name: "Edinburgh",
    description: "Scottish historic city",
    distanceFromStart: 3600,
    isReached: false,
    coordinates: { lat: 55.9533, lng: -3.1883 },
  },
  {
    id: "p5",
    name: "London",
    description: "Capital of England",
    distanceFromStart: 4200,
    isReached: false,
    coordinates: { lat: 51.5074, lng: -0.1278 },
  },
  {
    id: "p6",
    name: "Rotterdam",
    description: "Final destination",
    distanceFromStart: TOTAL_JOURNEY_DISTANCE_KM,
    isReached: false,
    coordinates: { lat: 51.9244, lng: 4.4777 },
  },
];

export const achievements: Achievement[] = [
  {
    id: "a1",
    name: "First Splash",
    description: "Log your first rowing distance",
    icon: "droplet",
    condition: "Log at least 1 rowing session",
    unlockedBy: ["u1", "u2", "u3", "u4", "u5", "u6", "u7", "u8", "u9", "u10", "u11", "u12"],
  },
  {
    id: "a2",
    name: "Strength Builder",
    description: "Complete 10 strength training sessions",
    icon: "dumbbell",
    condition: "Log 10 strength training sessions",
    unlockedBy: ["u2", "u3", "u7", "u10", "u11", "u12"],
  },
  {
    id: "a3",
    name: "Century Club",
    description: "Row a total of 100km",
    icon: "award",
    condition: "Accumulate 100km of rowing distance",
    unlockedBy: ["u1", "u2", "u3", "u4", "u7", "u8", "u10", "u11", "u12"],
  },
  {
    id: "a4",
    name: "Marathon Rower",
    description: "Row at least 42.2km in a single week",
    icon: "medal",
    condition: "Row at least 42.2km in a 7-day period",
    unlockedBy: ["u3", "u7", "u12"],
  },
];

// Calculate team's total distance
export const getTeamTotalDistance = () => {
  return mockUsers.reduce((total, user) => total + user.rowingDistanceM, 0) / 1000; // Convert to km for display
};

// Calculate team's completion percentage
export const getTeamCompletionPercentage = () => {
  const totalDistanceKm = getTeamTotalDistance();
  return Math.min(Math.round((totalDistanceKm / TOTAL_JOURNEY_DISTANCE_KM) * 100), 100);
};

// Calculate current journey position
export const getCurrentJourneyPosition = () => {
  const totalDistanceKm = getTeamTotalDistance();
  
  // Find the last reached point and the next point
  const lastReachedPointIndex = journeyPoints.findIndex(point => point.distanceFromStart > totalDistanceKm) - 1;
  
  if (lastReachedPointIndex < 0) {
    return journeyPoints[0];
  }
  
  if (lastReachedPointIndex >= journeyPoints.length - 1) {
    return journeyPoints[journeyPoints.length - 1];
  }
  
  const lastReachedPoint = journeyPoints[lastReachedPointIndex];
  const nextPoint = journeyPoints[lastReachedPointIndex + 1];
  
  // Calculate how far between these two points we are
  const distanceBetweenPoints = nextPoint.distanceFromStart - lastReachedPoint.distanceFromStart;
  const distanceTraveled = totalDistanceKm - lastReachedPoint.distanceFromStart;
  const progressPercentage = distanceTraveled / distanceBetweenPoints;
  
  // Interpolate coordinates
  const lat = lastReachedPoint.coordinates.lat + 
    (nextPoint.coordinates.lat - lastReachedPoint.coordinates.lat) * progressPercentage;
  const lng = lastReachedPoint.coordinates.lng + 
    (nextPoint.coordinates.lng - lastReachedPoint.coordinates.lng) * progressPercentage;
  
  return {
    ...lastReachedPoint,
    coordinates: { lat, lng },
    nextPointName: nextPoint.name,
    distanceToNextPoint: Math.round(nextPoint.distanceFromStart - totalDistanceKm),
  };
};