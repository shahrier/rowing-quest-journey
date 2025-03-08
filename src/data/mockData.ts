
import { Achievement, JourneyPoint, User } from "./types";

export const TOTAL_JOURNEY_DISTANCE = 5556; // km from Boston to Rotterdam

export const currentUser: User = {
  id: "u1",
  name: "Jane Doe",
  email: "jane@example.com",
  rowingDistanceKm: 120,
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
    rowingDistanceKm: 155,
    strengthSessions: 12,
    achievements: ["a1", "a2", "a3"],
    joinedAt: new Date("2023-01-10"),
  },
  {
    id: "u3",
    name: "Emma Wilson",
    email: "emma@example.com",
    rowingDistanceKm: 200,
    strengthSessions: 15,
    achievements: ["a1", "a2", "a3", "a4"],
    joinedAt: new Date("2023-01-05"),
  },
  {
    id: "u4",
    name: "Michael Brown",
    email: "michael@example.com",
    rowingDistanceKm: 180,
    strengthSessions: 10,
    achievements: ["a1", "a3"],
    joinedAt: new Date("2023-01-20"),
  },
  {
    id: "u5",
    name: "Olivia Davis",
    email: "olivia@example.com",
    rowingDistanceKm: 110,
    strengthSessions: 7,
    achievements: ["a1"],
    joinedAt: new Date("2023-01-25"),
  },
  {
    id: "u6",
    name: "William Johnson",
    email: "william@example.com",
    rowingDistanceKm: 90,
    strengthSessions: 5,
    achievements: ["a1"],
    joinedAt: new Date("2023-02-01"),
  },
  {
    id: "u7",
    name: "Sophia Miller",
    email: "sophia@example.com",
    rowingDistanceKm: 220,
    strengthSessions: 18,
    achievements: ["a1", "a2", "a3", "a4"],
    joinedAt: new Date("2023-01-03"),
  },
  {
    id: "u8",
    name: "James Taylor",
    email: "james@example.com",
    rowingDistanceKm: 135,
    strengthSessions: 9,
    achievements: ["a1", "a3"],
    joinedAt: new Date("2023-01-18"),
  },
  {
    id: "u9",
    name: "Charlotte Anderson",
    email: "charlotte@example.com",
    rowingDistanceKm: 105,
    strengthSessions: 6,
    achievements: ["a1"],
    joinedAt: new Date("2023-01-28"),
  },
  {
    id: "u10",
    name: "Benjamin Thomas",
    email: "benjamin@example.com",
    rowingDistanceKm: 175,
    strengthSessions: 11,
    achievements: ["a1", "a2", "a3"],
    joinedAt: new Date("2023-01-12"),
  },
  {
    id: "u11",
    name: "Amelia Jackson",
    email: "amelia@example.com",
    rowingDistanceKm: 160,
    strengthSessions: 13,
    achievements: ["a1", "a2", "a3"],
    joinedAt: new Date("2023-01-08"),
  },
  {
    id: "u12",
    name: "Daniel White",
    email: "daniel@example.com",
    rowingDistanceKm: 190,
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
    distanceFromStart: TOTAL_JOURNEY_DISTANCE,
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
  return mockUsers.reduce((total, user) => total + user.rowingDistanceKm, 0);
};

// Calculate team's completion percentage
export const getTeamCompletionPercentage = () => {
  const totalDistance = getTeamTotalDistance();
  return Math.min(Math.round((totalDistance / TOTAL_JOURNEY_DISTANCE) * 100), 100);
};

// Calculate current journey position
export const getCurrentJourneyPosition = () => {
  const totalDistance = getTeamTotalDistance();
  
  // Find the last reached point and the next point
  const lastReachedPointIndex = journeyPoints.findIndex(point => point.distanceFromStart > totalDistance) - 1;
  
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
  const distanceTraveled = totalDistance - lastReachedPoint.distanceFromStart;
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
    distanceToNextPoint: Math.round(nextPoint.distanceFromStart - totalDistance),
  };
};
