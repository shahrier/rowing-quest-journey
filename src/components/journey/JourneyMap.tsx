import { useEffect, useRef } from 'react';

interface Checkpoint {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  distance_from_start: number;
  is_reached: boolean;
}

interface JourneyMapProps {
  checkpoints: Checkpoint[];
  currentDistance: number;
  totalDistance: number;
}

export function JourneyMap({ checkpoints, currentDistance, totalDistance }: JourneyMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!mapRef.current || !checkpoints.length) return;
    
    // This is a placeholder for a real map implementation
    // In a real app, you would use a library like Leaflet or Google Maps
    
    const canvas = document.createElement('canvas');
    canvas.width = mapRef.current.clientWidth;
    canvas.height = 300;
    mapRef.current.innerHTML = '';
    mapRef.current.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Draw a simple representation of the journey
    const padding = 40;
    const width = canvas.width - padding * 2;
    const height = canvas.height - padding * 2;
    
    // Draw the path
    ctx.beginPath();
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 4;
    ctx.moveTo(padding, padding);
    
    // Create a curved path through all checkpoints
    const points = checkpoints.map((cp, i) => {
      const x = padding + (width * cp.distance_from_start) / totalDistance;
      const y = padding + Math.sin(i * 0.5) * height * 0.3 + height * 0.3;
      return { x, y };
    });
    
    // Draw the path
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    
    for (let i = 0; i < points.length - 1; i++) {
      const xc = (points[i].x + points[i + 1].x) / 2;
      const yc = (points[i].y + points[i + 1].y) / 2;
      ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
    }
    
    ctx.quadraticCurveTo(
      points[points.length - 1].x,
      points[points.length - 1].y,
      points[points.length - 1].x,
      points[points.length - 1].y
    );
    
    ctx.stroke();
    
    // Draw the completed path
    const progressX = padding + (width * currentDistance) / totalDistance;
    
    ctx.beginPath();
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 4;
    ctx.moveTo(points[0].x, points[0].y);
    
    let lastPoint = points[0];
    
    for (let i = 0; i < points.length - 1; i++) {
      const xc = (points[i].x + points[i + 1].x) / 2;
      constyc = (points[i].y + points[i + 1].y) / 2;
      
      if (points[i + 1].x <= progressX) {
        // Draw full segment
        ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
        lastPoint = { x: xc, y: yc };
      } else if (points[i].x <= progressX && progressX <= points[i + 1].x) {
        // Draw partial segment
        const t = (progressX - points[i].x) / (points[i + 1].x - points[i].x);
        const x = (1 - t) * (1 - t) * points[i].x + 2 * (1 - t) * t * points[i].x + t * t * points[i + 1].x;
        const y = (1 - t) * (1 - t) * points[i].y + 2 * (1 - t) * t * points[i].y + t * t * points[i + 1].y;
        ctx.quadraticCurveTo(points[i].x, points[i].y, x, y);
        lastPoint = { x, y };
        break;
      }
    }
    
    ctx.stroke();
    
    // Draw checkpoints
    checkpoints.forEach((checkpoint, i) => {
      const x = points[i].x;
      const y = points[i].y;
      
      // Draw checkpoint circle
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, Math.PI * 2);
      ctx.fillStyle = checkpoint.distance_from_start <= currentDistance ? '#3b82f6' : '#e5e7eb';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Draw checkpoint label
      ctx.font = '12px Arial';
      ctx.fillStyle = '#374151';
      ctx.textAlign = 'center';
      ctx.fillText(checkpoint.name, x, y - 15);
    });
    
    // Draw current position
    ctx.beginPath();
    ctx.arc(lastPoint.x, lastPoint.y, 10, 0, Math.PI * 2);
    ctx.fillStyle = '#ef4444';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();
    
  }, [checkpoints, currentDistance, totalDistance]);
  
  return (
    <div className="rounded-lg border overflow-hidden bg-white dark:bg-gray-950">
      <div ref={mapRef} className="h-[300px] w-full"></div>
    </div>
  );
}