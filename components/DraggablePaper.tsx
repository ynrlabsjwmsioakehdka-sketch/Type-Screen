
import React, { useState, useEffect, useRef } from 'react';
import { PaperCard, Position } from '../types';
import { X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { playPaperSlide, playFlySound, playMechanicalStep } from '../utils/soundEffects';

interface DraggablePaperProps {
  card: PaperCard;
  onUpdatePosition: (id: string, position: Position) => void;
  onDelete: (id: string) => void;
  onTypingComplete: (id: string, text: string) => void;
  zIndex: number;
  onBringToFront: (id: string) => void;
}

export const DraggablePaper: React.FC<DraggablePaperProps> = ({
  card,
  onUpdatePosition,
  onDelete,
  onTypingComplete,
  zIndex,
  onBringToFront
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [hasFlown, setHasFlown] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Generate unique ID for scoped styles
  const uniqueId = card.id.replace(/[^a-zA-Z0-9]/g, '');

  // Configuration constants
  const ANIMATION_DURATION = 3000; // 3 seconds total
  // Reduced steps for a more obvious "chunkier" mechanical movement
  const PAPER_STEPS = 15; 

  // Effect: Handle Flight Sound and State
  useEffect(() => {
    // When isTyping turns false, it means we are launching
    if (!card.isTyping && !hasFlown) {
       playFlySound();
       setHasFlown(true);
    }
  }, [card.isTyping, hasFlown]);

  // Effect: Typing Animation & Mechanical Sound Sync
  useEffect(() => {
    if (!card.isTyping) {
      setDisplayedText(card.text);
      return;
    }

    // 1. Text Typing Logic
    let currentIndex = 0;
    const textLength = card.text.length;
    const typingIntervalMs = ANIMATION_DURATION / (textLength || 1);
    
    const textInterval = setInterval(() => {
      if (currentIndex <= textLength) {
        setDisplayedText(card.text.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(textInterval);
        // We rely on the stepInterval to finish timing out before calling complete
      }
    }, typingIntervalMs); 

    // 2. Mechanical Paper Steps Sound Logic
    // Syncs exactly with the CSS steps(15) animation
    let currentStep = 0;
    const stepIntervalMs = ANIMATION_DURATION / PAPER_STEPS;
    
    // Play initial sound
    playMechanicalStep();

    const stepInterval = setInterval(() => {
        currentStep++;
        if (currentStep < PAPER_STEPS) {
            playMechanicalStep();
        } else {
            clearInterval(stepInterval);
            // Ensure text is done too before completing
            onTypingComplete(card.id, card.text);
        }
    }, stepIntervalMs);

    return () => {
        clearInterval(textInterval);
        clearInterval(stepInterval);
    };
  }, [card.text, card.isTyping, card.id, onTypingComplete]);

  // Dragging Logic
  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    onBringToFront(card.id);
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - card.position.x,
      y: e.clientY - card.position.y
    });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      onUpdatePosition(card.id, { x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset, card.id, onUpdatePosition]);

  // --- Animation Styles ---

  // 1. Flight Transition (Outer Div)
  const transitionStyle = isDragging 
    ? 'none' 
    : card.isTyping 
        ? 'none' // No transition while sitting in typewriter
        : 'transform 1.2s cubic-bezier(0.19, 1, 0.22, 1)'; // "Expo ease out" for dramatic flight

  // 2. Ejection Animation (Inner Div)
  // Uses steps(15, end) for the jerky mechanical motion
  const ejectionAnimation = card.isTyping 
    ? `ejectUp_${uniqueId} ${ANIMATION_DURATION}ms steps(${PAPER_STEPS}, end) forwards`
    : 'none';

  return (
    <div
      ref={cardRef}
      onMouseDown={handleMouseDown}
      style={{
        // Outer div handles absolute positioning on the board
        transform: `translate(${card.position.x}px, ${card.position.y}px) rotate(${card.rotation}deg)`,
        transition: transitionStyle,
        zIndex: zIndex,
        position: 'absolute',
        top: 0,
        left: 0,
        pointerEvents: 'auto'
      }}
      className="w-[320px] h-auto focus:outline-none"
    >
      {/* Inner Wrapper handles the 'Ejection' offset animation */}
      <div 
        style={{ 
            animation: ejectionAnimation,
            transformOrigin: 'bottom center'
        }}
        className={`
            bg-[#f4f1ea] 
            rounded-[2px]
            shadow-[2px_4px_20px_rgba(0,0,0,0.25)] 
            hover:shadow-[5px_15px_40px_rgba(0,0,0,0.35)] 
            cursor-grab active:cursor-grabbing
            flex flex-col
            border border-[#d6d0c4]
            overflow-hidden
            transition-shadow duration-300
        `}
      >
        {/* Decorative Top Border */}
        <div className="h-3 bg-[#d9534f] w-full relative overflow-hidden">
            <div className="absolute inset-0 opacity-20" style={{backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 5px, #000 5px, #000 10px)'}}></div>
        </div>
        <div className="h-1 bg-[#f0ad4e] w-full mb-1"></div>

        {/* Card Header */}
        <div className="px-4 pt-2 flex justify-between items-center opacity-70">
            <div className="text-[12px] font-bold tracking-widest text-[#5a5a5a] px-1 rounded-sm" style={{ fontFamily: "'VT323', monospace" }}>
                JOB_ID: {card.id.slice(-4)}
            </div>
            <button 
                onClick={(e) => { e.stopPropagation(); onDelete(card.id); }}
                className="text-stone-400 hover:text-red-600 transition-colors"
            >
                <X size={16} />
            </button>
        </div>

        {/* Card Body */}
        <div className="px-5 py-4 min-h-[140px] flex flex-col relative">
            <div className="absolute inset-0 pointer-events-none opacity-[0.03]" 
                style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22 opacity=%221%22/%3E%3C/svg%3E")' }}>
            </div>

            <div className="flex flex-col gap-4 relative z-10">
            <p className={`text-stone-900 text-2xl leading-tight whitespace-pre-wrap ${card.isTyping ? 'after:content-["_"] after:animate-pulse after:text-stone-400' : ''}`}
                style={{ 
                fontFamily: "'VT323', monospace", 
                textShadow: "1px 1px 0 rgba(0,0,0,0.15), 0 0 1px rgba(0,0,0,0.1)" 
                }}>
                {displayedText}
            </p>

            {(card.imageUrl || card.isGeneratingImage) && (
                <div className="self-end mt-2 transform rotate-[-2deg] transition-all duration-500 animate-in fade-in slide-in-from-bottom-2">
                    <div className="w-24 h-24 bg-[#e8e4dc] border-4 border-white shadow-sm p-1 relative overflow-hidden group">
                    
                    {card.isGeneratingImage && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-stone-400 bg-[#e8e4dc] animate-pulse">
                            <Loader2 size={16} className="animate-spin mb-1" />
                            <span className="text-[8px] font-mono tracking-widest">DEVELOPING</span>
                        </div>
                    )}

                    {card.imageUrl && (
                        <img 
                            src={card.imageUrl} 
                            alt="Retro generated" 
                            className="w-full h-full object-cover filter sepia contrast-125 grayscale-[0.2] transition-transform duration-700 group-hover:scale-110"
                            style={{ imageRendering: 'pixelated' }}
                        />
                    )}
                    
                    <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-multiply"
                            style={{ backgroundImage: 'radial-gradient(circle, transparent 40%, #3d3a35 100%)' }}>
                    </div>
                    </div>
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-4 bg-yellow-100/50 rotate-2 blur-[0.5px]"></div>
                </div>
            )}
            </div>
        </div>

        {/* Footer */}
        <div className="px-4 pb-3 flex justify-between items-end border-t border-stone-300/40 pt-2 mt-auto bg-[#efebe0]/50">
            <div className="flex flex-col">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider" style={{ fontFamily: "'VT323', monospace" }}>DATE ISSUED</span>
                <span className="text-[14px] text-stone-600" style={{ fontFamily: "'VT323', monospace" }}>{new Date(card.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-1 opacity-50">
                <div className="w-10 h-10 rounded-full border-2 border-stone-800 flex items-center justify-center transform -rotate-12 opacity-70 mask-image-grunge">
                    <div className="text-[12px] font-black text-stone-800 text-center leading-none uppercase" style={{ fontFamily: "'VT323', monospace" }}>
                        Suva<br/>PRT
                    </div>
                </div>
            </div>
        </div>
      </div>
      
      <style>{`
        @keyframes ejectUp_${uniqueId} {
          0% { 
            /* Start partially submerged. 
               Don't start at 100% because that might be too deep for the machine height. 
               Start at 60% to ensure some part is near the slot. */
            transform: translateY(60%); 
          }
          100% { 
            /* End at natural position */
            transform: translateY(0); 
          }
        }
      `}</style>
    </div>
  );
};
