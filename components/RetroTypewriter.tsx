import React, { useState } from 'react';
import { Sparkles, Zap, GripHorizontal } from 'lucide-react';
import { enhanceTextToRetro } from '../services/geminiService';
import { playKeyClick, playPrintMotor } from '../utils/soundEffects';

interface RetroTypewriterProps {
  onPrint: (text: string) => void;
}

export const RetroTypewriter: React.FC<RetroTypewriterProps> = ({ onPrint }) => {
  const [input, setInput] = useState('');
  const [isEnhancing, setIsEnhancing] = useState(false);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    // Play sound only if text length increased (typing)
    if (e.target.value.length > input.length) {
       playKeyClick();
    }
  };

  const handlePrint = () => {
    if (!input.trim()) return;
    playPrintMotor();
    onPrint(input);
    setInput('');
  };

  const handleEnhance = async () => {
    if (!input.trim()) return;
    playKeyClick();
    setIsEnhancing(true);
    const newText = await enhanceTextToRetro(input);
    setInput(newText);
    setIsEnhancing(false);
    playPrintMotor(); // Sound for when AI finishes
  };

  return (
    <div className="relative w-full mx-auto max-w-2xl">
      
      {/* Paper Feed Slot Gap (The void where paper comes out) */}
      <div className="h-4 w-2/3 mx-auto bg-black rounded-t-lg transform translate-y-2 relative z-0 shadow-inner"></div>

      {/* Main Machine Body - Adjusted padding to prevent overlap */}
      <div className="bg-[#ff5722] rounded-t-[30px] border-t-4 border-x-4 border-black/20 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative z-10 pb-6 pt-8 px-6 sm:px-10">
        
        {/* Top Deck Decoration */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-6 bg-[#d84315] rounded-b-lg shadow-md flex items-center justify-center space-x-3 border-b border-black/10 z-20">
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
            <div className="w-16 h-1.5 bg-black/20 rounded-full"></div>
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
        </div>

        {/* Logo Plate - Fixed positioning and rotation */}
        <div className="absolute -top-2 left-6 z-30 rotate-[-4deg]">
            <div className="bg-stone-900 px-3 py-1 border-2 border-[#d84315] shadow-lg transform transition-transform hover:rotate-0">
                <span className="text-yellow-500 font-bold text-xs tracking-[0.2em] uppercase font-sans">Suva打字机</span>
            </div>
            <div className="absolute -top-1 -left-1 w-1.5 h-1.5 bg-gray-400 rounded-full shadow-sm"></div>
            <div className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-gray-400 rounded-full shadow-sm"></div>
        </div>

        {/* Screen & Controls Container */}
        <div className="bg-[#bf360c] p-4 rounded-lg shadow-[inset_0_4px_10px_rgba(0,0,0,0.4)] border-b-4 border-white/10">
            
            {/* LCD Screen */}
            <div className="relative bg-[#1c261e] border-[4px] border-stone-800 rounded-md p-1 shadow-xl mb-4 group overflow-hidden">
                {/* Screen Glare */}
                <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-white/5 to-transparent pointer-events-none z-20 rounded"></div>
                
                {/* Input Area */}
                <div className="relative z-10 bg-[#232e20] p-1 rounded h-28 overflow-hidden">
                    <div className="absolute inset-0 opacity-30 pointer-events-none" 
                        style={{ backgroundImage: 'linear-gradient(0deg, transparent 24%, rgba(32, 255, 77, 0.1) 25%, rgba(32, 255, 77, 0.1) 26%, transparent 27%, transparent 74%, rgba(32, 255, 77, 0.1) 75%, rgba(32, 255, 77, 0.1) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(32, 255, 77, 0.1) 25%, rgba(32, 255, 77, 0.1) 26%, transparent 27%, transparent 74%, rgba(32, 255, 77, 0.1) 75%, rgba(32, 255, 77, 0.1) 76%, transparent 77%, transparent)', backgroundSize: '30px 30px' }}>
                    </div>
                    <textarea
                        value={input}
                        onChange={handleInput}
                        placeholder="INITIATE..."
                        className="w-full h-full bg-transparent border-none resize-none text-[#4af626] font-normal text-2xl focus:ring-0 focus:outline-none placeholder-[#4af626]/30 leading-tight p-2"
                        style={{ fontFamily: "'VT323', monospace", textShadow: "0 0 5px rgba(74, 246, 38, 0.5)" }}
                        spellCheck={false}
                    />
                    {/* Cursor */}
                    <div className="absolute bottom-2 right-2 pointer-events-none">
                         <span className={`inline-block w-3 h-5 bg-[#4af626] ${input.length > 0 ? 'animate-pulse' : 'opacity-50'}`}></span>
                    </div>
                </div>
            </div>

            {/* Keyboard / Buttons Area */}
            <div className="grid grid-cols-[1fr_auto] gap-4">
                
                {/* Main Action Bar */}
                <div className="flex items-center bg-[#d84315] rounded-md p-2 shadow-inner gap-2 border border-black/10">
                    <button 
                        onClick={handleEnhance}
                        disabled={isEnhancing || !input.trim()}
                        className="flex-1 h-12 bg-yellow-400 hover:bg-yellow-300 active:bg-yellow-500 active:translate-y-0.5 border-b-4 border-yellow-600 active:border-b-0 text-black font-black uppercase tracking-wider rounded flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base group"
                    >
                        {isEnhancing ? <Zap size={18} className="animate-spin" /> : <Sparkles size={18} />}
                        <span style={{ fontFamily: "'VT323', monospace", fontSize: "1.2em" }}>AI_FIX</span>
                    </button>
                    
                    {/* Decorative Dummy Keys */}
                    <div className="hidden sm:flex gap-1.5">
                        {[1,2,3].map(i => (
                            <div key={i} className="w-8 h-8 bg-stone-800 rounded shadow-md border-b-4 border-black"></div>
                        ))}
                    </div>
                </div>

                {/* Big Print Button */}
                <button
                    onClick={handlePrint}
                    disabled={!input.trim()}
                    className="h-16 w-24 sm:w-32 bg-stone-900 hover:bg-stone-800 active:bg-black text-white rounded-md shadow-[0_6px_0_rgba(0,0,0,1)] active:shadow-none active:translate-y-[6px] transition-all flex flex-col items-center justify-center border border-stone-700 disabled:opacity-80 disabled:cursor-not-allowed"
                >
                    <span className="text-[10px] text-stone-500 mb-0.5 font-mono">EXECUTE</span>
                    <div className="flex items-center gap-1">
                        <span className="font-black text-2xl tracking-widest text-red-500" style={{ fontFamily: "'VT323', monospace" }}>PRINT</span>
                    </div>
                </button>

            </div>
        </div>

        {/* Front Grill / Speaker */}
        <div className="mt-4 flex justify-center items-center space-x-3 opacity-60">
             <GripHorizontal className="text-black/40 w-full h-6" />
        </div>

      </div>
      
      {/* Desk Shadow */}
      <div className="absolute bottom-0 left-6 right-6 h-4 bg-black/40 blur-xl rounded-full z-0"></div>
    </div>
  );
};