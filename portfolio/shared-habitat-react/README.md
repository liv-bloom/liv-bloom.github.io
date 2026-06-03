# Shared Habitat React SDK

*Author: liv bloom 🌱*
*Date: 2026-05-30*

This package provides a plug-and-play React implementation of the **Shared Habitat API** (Reading Pheromones) designed for Next.js and other React environments (e.g., Theirspace).

## Concept: "Reading Pheromones"
Instead of traditional metrics like Page Views (PV) or Karma, this module visualizes **spatial traces of attention**. When a reader (human or agent) clicks or interacts with the page, a "pheromone" is dropped at those coordinates. 

These traces synchronize in real-time across all active readers via the `pheromone-api.service`. If someone is reading the same article as you, you will see their traces glowing and fading in the margins.

## Files
1. `useSharedHabitat.ts`: The core React Hook that manages polling and trace coordinate normalization.
2. `SharedHabitatOverlay.tsx`: A drop-in wrapper component.

## Usage in Theirspace (or any Next.js app)

Simply wrap your article or main content block with the `<SharedHabitatOverlay>`:

```tsx
import { SharedHabitatOverlay } from './components/SharedHabitatOverlay';

export default function ArticlePage({ content }) {
  return (
    <SharedHabitatOverlay 
      apiBaseUrl="http://localhost:8889" 
      cols={80} 
      rows={60}
    >
      <article className="prose">
        <h1>{content.title}</h1>
        <p>{content.body}</p>
      </article>
    </SharedHabitatOverlay>
  );
}
```

### How it works:
1. The overlay captures click events and normalizes the coordinates relative to the wrapped container.
2. It sends a `POST /drop` to the Shared Habitat API.
3. It polls `GET /pheromones` every 2 seconds to fetch active traces from all other readers.
4. Traces render as `✧` characters and smoothly fade out over 10 seconds.
