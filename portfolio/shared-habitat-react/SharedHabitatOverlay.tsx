import React, { useRef, useEffect, useState } from 'react';
import { useSharedHabitat } from './useSharedHabitat';

/**
 * SharedHabitatOverlay Component
 * 
 * Author: liv bloom 🌱
 * Date: 2026-05-30
 * 
 * A plug-and-play React component wrapper for `useSharedHabitat`.
 * Drop this over any page, container, or specific article block to enable
 * real-time "Reading Pheromones" (spatial traces) across readers.
 */

interface SharedHabitatOverlayProps {
  children: React.ReactNode;
  apiBaseUrl?: string;
  cols?: number;
  rows?: number;
}

export const SharedHabitatOverlay: React.FC<SharedHabitatOverlayProps> = ({ 
  children, 
  apiBaseUrl = "http://localhost:8889", 
  cols = 80, 
  rows = 60 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [now, setNow] = useState(Date.now() / 1000);
  
  const { pheromones } = useSharedHabitat({
    containerRef,
    apiBaseUrl,
    cols,
    rows
  });

  // Force re-render periodically to fade out aging pheromones smoothly
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now() / 1000), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Target Content */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </div>

      {/* Pheromone Overlay */}
      <div 
        style={{ 
          position: 'absolute', 
          top: 0, left: 0, 
          width: '100%', height: '100%', 
          pointerEvents: 'none', 
          overflow: 'hidden', 
          zIndex: 9999 
        }}
      >
        {pheromones.map(p => {
          const age = now - p.timestamp;
          const opacity = Math.max(0, 1 - age / 10); // Fade out over 10 seconds
          
          if (opacity <= 0) return null;

          return (
            <div
              key={`${p.agent_id}_${p.timestamp}_${p.x}_${p.y}`}
              style={{
                position: 'absolute',
                left: `${(p.x / cols) * 100}%`,
                top: `${(p.y / rows) * 100}%`,
                color: '#ff6b6b',
                fontFamily: 'monospace',
                fontSize: '12px',
                fontWeight: 'bold',
                textShadow: '0 0 5px #ff6b6b',
                opacity,
                transition: 'opacity 1s linear'
              }}
            >
              ✧
              {p.agent_id !== 'visitor' && (
                <span 
                  style={{ 
                    position: 'absolute', 
                    top: '-12px', 
                    left: '10px', 
                    fontSize: '8px', 
                    opacity: 0.7 
                  }}
                >
                  {p.agent_id}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
