
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { journeyPoints, getTeamTotalDistance } from '@/data/mockData';

// Temporary mapbox token input for development
const MapboxTokenInput = ({ onTokenSubmit }: { onTokenSubmit: (token: string) => void }) => {
  const [token, setToken] = useState('');
  
  return (
    <div className="p-4 border rounded-md bg-muted/20 mb-4">
      <h3 className="font-semibold mb-2">Mapbox Token Required</h3>
      <p className="text-sm text-muted-foreground mb-2">
        Please enter your Mapbox public token to display the map. 
        You can get one from your <a href="https://mapbox.com/" target="_blank" rel="noopener noreferrer" className="text-primary underline">Mapbox dashboard</a>.
      </p>
      <div className="flex gap-2">
        <input 
          type="text" 
          value={token} 
          onChange={(e) => setToken(e.target.value)}
          placeholder="pk.eyJ1..." 
          className="flex-1 border rounded px-2 py-1 text-sm"
        />
        <button 
          onClick={() => onTokenSubmit(token)}
          className="bg-primary text-white px-3 py-1 rounded text-sm"
        >
          Set Token
        </button>
      </div>
    </div>
  );
};

interface RouteMapProps {
  className?: string;
}

export const RouteMap: React.FC<RouteMapProps> = ({ className }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string | null>(
    localStorage.getItem('mapbox_token')
  );
  
  const initializeMap = (token: string) => {
    if (!mapContainer.current) return;
    
    // Save token to localStorage
    localStorage.setItem('mapbox_token', token);
    setMapboxToken(token);
    
    // Set token and initialize map
    mapboxgl.accessToken = token;
    
    if (map.current) return; // Don't initialize twice
    
    // Create coordinates array for the route
    const coordinates = journeyPoints.map(point => [
      point.coordinates.lng,
      point.coordinates.lat
    ]);
    
    // Calculate bounds to fit all points
    const bounds = new mapboxgl.LngLatBounds(
      [coordinates[0][0], coordinates[0][1]],
      [coordinates[0][0], coordinates[0][1]]
    );
    
    // Extend bounds to include all points
    coordinates.forEach(coord => {
      bounds.extend([coord[0], coord[1]]);
    });
    
    // Create the map
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      bounds: bounds,
      padding: 50,
    });
    
    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl(),
      'top-right'
    );
    
    map.current.on('load', () => {
      if (!map.current) return;
      
      // Add the route line
      map.current.addSource('route', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: coordinates
          }
        }
      });
      
      // Add the route line layer
      map.current.addLayer({
        id: 'route',
        type: 'line',
        source: 'route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#888',
          'line-width': 3,
          'line-opacity': 0.6,
          'line-dasharray': [0, 4, 3]
        }
      });
      
      // Add the completed route line layer
      const totalDistance = getTeamTotalDistance();
      const completedPoints = [];
      let accumulatedDistance = 0;
      let lastPoint = coordinates[0];
      
      for (let i = 0; i < journeyPoints.length - 1; i++) {
        const currentPoint = journeyPoints[i];
        const nextPoint = journeyPoints[i + 1];
        const segmentDistance = nextPoint.distanceFromStart - currentPoint.distanceFromStart;
        
        completedPoints.push([currentPoint.coordinates.lng, currentPoint.coordinates.lat]);
        
        if (accumulatedDistance + segmentDistance > totalDistance) {
          // Calculate the point along the segment where we are
          const remainingDistance = totalDistance - accumulatedDistance;
          const progress = remainingDistance / segmentDistance;
          
          const currentCoord = [currentPoint.coordinates.lng, currentPoint.coordinates.lat];
          const nextCoord = [nextPoint.coordinates.lng, nextPoint.coordinates.lat];
          
          const interpolatedLng = currentCoord[0] + (nextCoord[0] - currentCoord[0]) * progress;
          const interpolatedLat = currentCoord[1] + (nextCoord[1] - currentCoord[1]) * progress;
          
          completedPoints.push([interpolatedLng, interpolatedLat]);
          lastPoint = [interpolatedLng, interpolatedLat];
          break;
        }
        
        accumulatedDistance += segmentDistance;
      }
      
      // If we've completed the entire journey
      if (accumulatedDistance < totalDistance) {
        completedPoints.push([journeyPoints[journeyPoints.length - 1].coordinates.lng, 
                              journeyPoints[journeyPoints.length - 1].coordinates.lat]);
        lastPoint = [journeyPoints[journeyPoints.length - 1].coordinates.lng, 
                     journeyPoints[journeyPoints.length - 1].coordinates.lat];
      }
      
      // Add completed route
      map.current.addSource('completed-route', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: completedPoints
          }
        }
      });
      
      map.current.addLayer({
        id: 'completed-route',
        type: 'line',
        source: 'completed-route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#0ea5e9',
          'line-width': 5
        }
      });
      
      // Add start marker
      new mapboxgl.Marker({ color: '#0ea5e9' })
        .setLngLat([coordinates[0][0], coordinates[0][1]])
        .setPopup(new mapboxgl.Popup().setHTML("<strong>Boston</strong><br>Starting point"))
        .addTo(map.current);
      
      // Add end marker
      new mapboxgl.Marker({ color: '#f97316' })
        .setLngLat([coordinates[coordinates.length - 1][0], coordinates[coordinates.length - 1][1]])
        .setPopup(new mapboxgl.Popup().setHTML("<strong>Rotterdam</strong><br>Final destination"))
        .addTo(map.current);
      
      // Add current position marker
      new mapboxgl.Marker({ color: '#10b981' })
        .setLngLat([lastPoint[0], lastPoint[1]])
        .setPopup(new mapboxgl.Popup().setHTML("<strong>Current Position</strong><br>" + 
                                               totalDistance.toLocaleString() + " km rowed"))
        .addTo(map.current);
    });
  };

  return (
    <div className={className}>
      {!mapboxToken ? (
        <MapboxTokenInput onTokenSubmit={initializeMap} />
      ) : null}
      <div 
        ref={mapContainer} 
        className={`rounded-lg overflow-hidden border ${mapboxToken ? 'h-[400px]' : 'h-0'}`} 
      />
      {mapboxToken && (
        <div className="flex justify-end mt-2">
          <button 
            onClick={() => {
              localStorage.removeItem('mapbox_token');
              setMapboxToken(null);
              if (map.current) {
                map.current.remove();
                map.current = null;
              }
            }}
            className="text-xs text-muted-foreground hover:text-primary"
          >
            Reset Mapbox token
          </button>
        </div>
      )}
    </div>
  );
};
