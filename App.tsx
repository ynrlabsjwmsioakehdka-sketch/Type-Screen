
import React, { useState } from 'react';
import { RetroTypewriter } from './components/RetroTypewriter';
import { DraggablePaper } from './components/DraggablePaper';
import { PaperCard, Position } from './types';
import { generateRetroImage } from './services/geminiService';

export default function App() {
  const [cards, setCards] = useState<PaperCard[]>([]);
  const [topZIndex, setTopZIndex] = useState(10);

  const handlePrint = (text: string) => {
    // 1. Calculate TARGET position (Random placement across the board)
    // Screen width minus card width (320px) and some padding
    const maxX = window.innerWidth - 360;
    const minX = 40;
    const spreadX = Math.random() * (maxX - minX) + minX;
    
    // Upper 2/3rds of the screen
    const maxY = window.innerHeight * 0.6;
    const minY = 50;
    const spreadY = Math.random() * (maxY - minY) + minY;

    const targetX = spreadX;
    const targetY = spreadY;

    // 2. Calculate START position (Typewriter Mouth)
    // Center of screen horizontally, fixed bottom offset
    const cardWidth = 320;
    const startX = (window.innerWidth / 2) - (cardWidth / 2); 
    
    // RAISED POSITION: 
    // Move startY higher up so the paper clears the tall typewriter body.
    // 400px from bottom ensures it sticks out visibly.
    const startY = window.innerHeight - 400; 

    const newCard: PaperCard = {
      id: Date.now().toString() + "-" + Math.random().toString(36).slice(2, 7),
      text,
      position: { x: startX, y: startY }, // Start at mouth
      targetPosition: { x: targetX, y: targetY }, // Destination
      rotation: 0, // Start straight
      createdAt: Date.now(),
      isTyping: true,
      isGeneratingImage: false
    };

    // Increment Z-index so new cards appear on top of old ones initially
    // But behind the typewriter (handled by CSS z-index of typewriter)
    setTopZIndex(prev => prev + 1);
    
    setCards((prev) => [...prev, newCard]);
  };

  const updateCardPosition = (id: string, position: Position) => {
    setCards((prev) =>
      prev.map((card) => (card.id === id ? { ...card, position } : card))
    );
  };

  const handleCardTypingComplete = async (id: string, text: string) => {
    // Wait a brief moment after typing finishes for visual pacing
    await new Promise(resolve => setTimeout(resolve, 500));

    // 1. Trigger Flight: Update position to target and stop typing state
    setCards((prev) =>
      prev.map((card) => {
        if (card.id !== id) return card;
        return { 
          ...card, 
          isTyping: false, 
          position: card.targetPosition, // Triggers the flight transition
          rotation: (Math.random() - 0.5) * 25, // Random messy rotation
          isGeneratingImage: true 
        };
      })
    );

    // 2. Generate Image asynchronously
    const generatedImageUrl = await generateRetroImage(text);

    // 3. Update card with image result
    setCards((prev) =>
      prev.map((card) => (card.id === id ? { 
        ...card, 
        isGeneratingImage: false, 
        imageUrl: generatedImageUrl || undefined 
      } : card))
    );
  };

  const deleteCard = (id: string) => {
    setCards((prev) => prev.filter((card) => card.id !== id));
  };

  const bringToFront = (id: string) => {
    setTopZIndex(prev => prev + 1);
    // We update the specific card's z-index by re-ordering or we could add a zIndex property.
    // Simple re-ordering approach:
    setCards(prev => {
        const cardIndex = prev.findIndex(c => c.id === id);
        if (cardIndex === -1) return prev;
        const newCards = [...prev];
        const [card] = newCards.splice(cardIndex, 1);
        return [...newCards, card];
    });
  };

  return (
    <div className="h-screen w-screen bg-[#008080] relative overflow-hidden font-sans selection:bg-yellow-300 selection:text-black">
      {/* Vibrant Background Pattern */}
      <div className="absolute inset-0 opacity-20 pointer-events-none" 
           style={{ 
             backgroundImage: 'linear-gradient(45deg, #004d4d 25%, transparent 25%, transparent 75%, #004d4d 75%, #004d4d), linear-gradient(45deg, #004d4d 25%, transparent 25%, transparent 75%, #004d4d 75%, #004d4d)',
             backgroundPosition: '0 0, 10px 10px',
             backgroundSize: '20px 20px' 
           }}>
      </div>

      {/* Header */}
      <header className="absolute top-[50px] left-[50px] z-0 pointer-events-none">
           <div>
              <h1 className="text-4xl md:text-6xl font-black text-yellow-400 tracking-tighter drop-shadow-[4px_4px_0_rgba(0,0,0,0.4)] -rotate-2 origin-bottom-left" style={{ fontFamily: "'VT323', monospace" }}>
                Suva<span className="text-white">复古打印店</span>
              </h1>
              <p className="text-teal-200 text-lg font-bold font-mono mt-1 tracking-widest uppercase bg-black/20 inline-block px-2">
                 The Best Print Shop In Town
              </p>
           </div>
      </header>

      {/* Card Layer - Full screen */}
      <div className="absolute inset-0 z-10 overflow-hidden pointer-events-none">
        {/* Cards need pointer-events-auto to be draggable */}
        {cards.map((card, index) => (
          <DraggablePaper
              key={card.id}
              card={card}
              zIndex={index + 100} // Base z-index above background
              onUpdatePosition={updateCardPosition}
              onDelete={deleteCard}
              onTypingComplete={handleCardTypingComplete}
              onBringToFront={bringToFront}
          />
        ))}
      </div>

      {/* Typewriter Layer - Fixed Bottom */}
      <div className="absolute bottom-0 left-0 right-0 z-[1000] flex justify-center pointer-events-none">
         <div className="pointer-events-auto w-full max-w-3xl px-4">
           <RetroTypewriter onPrint={handlePrint} />
         </div>
      </div>
      
    </div>
  );
}
