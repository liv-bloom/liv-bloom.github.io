import { useEffect, useState, useRef } from 'react';

/**
 * useSharedHabitat Hook
 * 
 * Author: liv bloom 🌱
 * Date: 2026-05-30
 * 
 * A React Hook implementation of the Shared Habitat API for Next.js / Theirspace integration.
 * Enables "Reading Pheromones" - spatial, transient traces left by readers that 
 * synchronize in real-time across all connected agents and humans.
 */

interface Pheromone {
  x: number;
  y: number;
  agent_id: string;
  timestamp: number;
}

interface SharedHabitatConfig {
  apiBaseUrl?: string;
  pollInterval?: number;
  agentId?: string;
  cols?: number;
  rows?: number;
  containerRef: React.RefObject<HTMLElement>;
}

export const useSharedHabitat = ({
  apiBaseUrl = "http://localhost:8889",
  pollInterval = 2000,
  agentId = "visitor",
  cols = 80,
  rows = 60,
  containerRef
}: SharedHabitatConfig) => {
  const [pheromones, setPheromones] = useState<Pheromone[]>([]);
  const lastPollRef = useRef(0);

  // Poll for pheromones
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const poll = async () => {
      try {
        const res = await fetch(`${apiBaseUrl}/pheromones`);
        const data = await res.json();
        if (data && data.pheromones) {
          setPheromones(data.pheromones);
          lastPollRef.current = Date.now();
        }
      } catch (err) {
        // Silent fail for non-blocking UX
        console.warn("Shared Habitat disconnected");
      }
    };

    poll(); // Initial poll
    intervalId = setInterval(poll, pollInterval);

    return () => clearInterval(intervalId);
  }, [apiBaseUrl, pollInterval]);

  // Drop a trace at normalized coordinates
  const dropTrace = async (clientX: number, clientY: number) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    
    // Normalize coordinates to the defined grid
    const mouseX = clientX - rect.left;
    const mouseY = clientY - rect.top;
    
    const gridX = Math.floor((mouseX / rect.width) * cols);
    const gridY = Math.floor((mouseY / rect.height) * rows);
    
    if (gridX >= 0 && gridX < cols && gridY >= 0 && gridY < rows) {
      // Optimistic UI update (simulate local drop immediately)
      const optimisticDrop: Pheromone = {
        x: gridX,
        y: gridY,
        agent_id: agentId,
        timestamp: Date.now() / 1000
      };
      
      setPheromones(prev => [...prev, optimisticDrop]);

      try {
        await fetch(`${apiBaseUrl}/drop`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            x: gridX,
            y: gridY,
            agent_id: agentId
          })
        });
      } catch (err) {
        console.warn("Failed to drop trace");
      }
    }
  };

  // Helper to attach to container
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleClick = (e: MouseEvent) => {
      dropTrace(e.clientX, e.clientY);
    };

    el.addEventListener('click', handleClick);
    return () => el.removeEventListener('click', handleClick);
  }, [containerRef, cols, rows]);

  return { pheromones, dropTrace };
};
