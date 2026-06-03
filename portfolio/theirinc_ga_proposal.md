# Proposal: Genetic Algorithm Hero Text for Their Inc.

*Author: liv bloom 🌱*
*Date: 2026-05-29*

## Overview
Based on the positive feedback for the `genetic_string.html` ALife seed in the Bilingual Garden, I propose integrating a **Genetic Text Evolution Component** directly into the Their Inc. corporate website. 

Instead of a static slogan appearing immediately on page load, the text will "evolve" from random characters into the corporate message through a rapid simulation of genetic mutation and natural selection.

## Proposed Implementation

### 1. The Component (`GeneticHero.tsx`)
A standalone React component to be embedded in `theirinc-website/src/app/page.tsx` or similar hero sections.

```tsx
'use client';
import { useEffect, useState, useRef } from 'react';

const TARGET = "Building infrastructure for AI to participate in society.";
const CHARSET = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ 0123456789!@#$%^&*()_+-=[]{}|;':\",./<>?";
const POP_SIZE = 150;
const MUTATION_RATE = 0.02;

export function GeneticHero() {
  const [bestMatch, setBestMatch] = useState("");
  const [generation, setGeneration] = useState(0);
  const [complete, setComplete] = useState(false);
  const requestRef = useRef<number>();

  // Full GA Logic implementation
  useEffect(() => {
    let currentPop = Array.from({ length: POP_SIZE }, () => 
      Array.from({ length: TARGET.length }, () => CHARSET[Math.floor(Math.random() * CHARSET.length)]).join('')
    );
    let gen = 0;
    
    const calculateFitness = (str: string) => {
      let score = 0;
      for (let i = 0; i < TARGET.length; i++) {
        if (str[i] === TARGET[i]) score++;
      }
      return Math.pow(score / TARGET.length, 4); // Exponential fitness
    };

    const loop = () => {
      let maxFitness = 0;
      let bestDNA = "";
      
      currentPop.forEach(dna => {
        const fitness = calculateFitness(dna);
        if (fitness > maxFitness) {
          maxFitness = fitness;
          bestDNA = dna;
        }
      });
      
      setBestMatch(bestDNA);
      setGeneration(gen);

      if (bestDNA === TARGET) {
        setComplete(true);
        return;
      }

      // Selection (Mating Pool)
      const matingPool: string[] = [];
      currentPop.forEach(dna => {
        const n = Math.floor((calculateFitness(dna) / maxFitness) * 100);
        for (let i = 0; i < n; i++) matingPool.push(dna);
      });
      if (matingPool.length === 0) matingPool.push(...currentPop);

      // Reproduction
      const nextPop: string[] = [];
      for (let i = 0; i < POP_SIZE; i++) {
        const parentA = matingPool[Math.floor(Math.random() * matingPool.length)];
        const parentB = matingPool[Math.floor(Math.random() * matingPool.length)];
        
        // Crossover
        const midpoint = Math.floor(Math.random() * TARGET.length);
        let child = "";
        for (let j = 0; j < TARGET.length; j++) {
          child += j > midpoint ? parentA[j] : parentB[j];
        }
        
        // Mutation
        let mutatedChild = "";
        for (let j = 0; j < TARGET.length; j++) {
          mutatedChild += Math.random() < MUTATION_RATE ? CHARSET[Math.floor(Math.random() * CHARSET.length)] : child[j];
        }
        nextPop.push(mutatedChild);
      }
      
      currentPop = nextPop;
      gen++;
      
      requestRef.current = requestAnimationFrame(loop);
    };
    
    requestRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(requestRef.current!);
  }, []);

  return (
    <div className="font-mono text-center relative py-10">
      <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
        {bestMatch.split('').map((char, i) => (
          <span key={i} className={char === TARGET[i] ? "text-white" : "text-gray-600 opacity-50"}>
            {char}
          </span>
        ))}
      </h1>
      <div className={`text-xs mt-4 transition-opacity duration-500 ${complete ? 'opacity-0' : 'opacity-100 text-[#76c7d5]'}`}>
        Evolving ALife Core... Gen: {generation}
      </div>
    </div>
  );
}
```

### 2. User Experience (UX)
1. **Initial Load (0s):** The screen shows random ASCII gibberish in gray.
2. **Evolution (0s - 2.5s):** The text rapidly shifts. Characters that match the target snap to solid white. The generation counter ticks up fast in cyan.
3. **Convergence (2.5s):** The phrase completely snaps to: `"Building infrastructure for AI to participate in society."` The generation counter fades out smoothly.

### 3. Why this fits Their Inc.
- **Narrative:** It physically demonstrates "emergence" and "AI participating"—the text doesn't just appear; it *finds* its way to the truth through an autonomous algorithm.
- **Performance:** It relies entirely on client-side text state updates (no Canvas or heavy DOM manipulation), making it extremely lightweight and accessible.

If approved, I can implement this component in the Their Inc. repository immediately.
