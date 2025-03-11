
import { User, JourneyPoint, Achievement } from "./types";
import { mockUsers, achievements as mockAchievements, journeyPoints as mockJourneyPoints, TOTAL_JOURNEY_DISTANCE_KM, TOTAL_JOURNEY_DISTANCE_M } from "./mockData";

// LocalStorage key for mode
const DATA_MODE_KEY = 'rowquest-data-mode';
const MOCK_DATA_KEY = 'rowquest-mock-data';

// Data mode: 'mock' or 'real'
type DataMode = 'mock' | 'real';

// Get the current data mode from localStorage
export const getDataMode = (): DataMode => {
  return (localStorage.getItem(DATA_MODE_KEY) as DataMode) || 'mock';
};

// Set the data mode in localStorage
export const setDataMode = (mode: DataMode): void => {
  localStorage.setItem(DATA_MODE_KEY, mode);
};

// Toggle between mock and real data
export const toggleDataMode = (): DataMode => {
  const currentMode = getDataMode();
  const newMode: DataMode = currentMode === 'mock' ? 'real' : 'mock';
  setDataMode(newMode);
  return newMode;
};

// Delete all mock data
export const deleteMockData = async (): Promise<void> => {
  return new Promise((resolve) => {
    // In a real app with a database, we would delete from the database
    // For now, just clear any stored mock data in localStorage
    localStorage.removeItem(MOCK_DATA_KEY);
    
    // Add a small delay to simulate an API call
    setTimeout(resolve, 500);
  });
};

// Get users based on current mode
export const getUsers = async (): Promise<User[]> => {
  const mode = getDataMode();
  
  if (mode === 'mock') {
    return mockUsers;
  } else {
    // In a real app, this would fetch from Supabase or another API
    // For now, we'll return an empty array when in 'real' mode
    return [];
  }
};

// Get journey points based on current mode
export const getJourneyPoints = async (): Promise<JourneyPoint[]> => {
  const mode = getDataMode();
  
  if (mode === 'mock') {
    return mockJourneyPoints;
  } else {
    // In a real app, this would fetch from Supabase or another API
    // For now, we'll return just the start and end points when in 'real' mode
    return [
      mockJourneyPoints[0],
      mockJourneyPoints[mockJourneyPoints.length - 1]
    ];
  }
};

// Get achievements based on current mode
export const getAchievements = async (): Promise<Achievement[]> => {
  const mode = getDataMode();
  
  if (mode === 'mock') {
    return mockAchievements;
  } else {
    // In a real app, this would fetch from Supabase or another API
    // For now, we'll return an empty array when in 'real' mode
    return [];
  }
};

// Calculate team's total distance
export const getTeamTotalDistance = async (): Promise<number> => {
  const mode = getDataMode();
  const users = await getUsers();
  
  if (mode === 'mock') {
    return users.reduce((total, user) => total + user.rowingDistanceM, 0) / 1000; // Convert to km for display
  } else {
    // In a real app, this might be a separate API call or calculation
    return users.reduce((total, user) => total + user.rowingDistanceM, 0) / 1000;
  }
};

// Calculate team's completion percentage
export const getTeamCompletionPercentage = async (): Promise<number> => {
  const totalDistanceKm = await getTeamTotalDistance();
  return Math.min(Math.round((totalDistanceKm / TOTAL_JOURNEY_DISTANCE_KM) * 100), 100);
};

// Calculate current journey position
export const getCurrentJourneyPosition = async (): Promise<any> => {
  const totalDistanceKm = await getTeamTotalDistance();
  const journeyPoints = await getJourneyPoints();
  
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

// Export constants
export { TOTAL_JOURNEY_DISTANCE_KM, TOTAL_JOURNEY_DISTANCE_M };
