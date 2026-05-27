import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, ShieldAlert, Play, Sparkles } from 'lucide-react';

interface SplashProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashProps> = ({ onComplete }) => {
  const [percent, setPercent] = useState(0);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [dots, setDots] = useState('');

  // Simulating asset scanning progress
  useEffect(() => {
    const interval = setInterval(() => {
      setPercent((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        // Random increments to look real
        const inc = Math.floor(Math.random() * 8) + 3;
        return Math.min(prev + inc, 100);
      });
    }, 120);

    return () => clearInterval(interval);
  }, []);

  // Animating loading dots
  useEffect(() => {
    const dotInterval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 450);
    return () => clearInterval(dotInterval);
  }, []);

  // Complete callback once progress reaches 100%
  useEffect(() => {
    if (percent === 100) {
      const delay = setTimeout(() => {
        onComplete();
      }, 800);
      return () => clearTimeout(delay);
    }
  }, [percent, onComplete]);

  return (
    <div className="fixed inset-0 min-h-screen bg-[#0B0E14] flex flex-col items-center justify-between p-6 z-50 text-white overflow-hidden select-none">
      {/* Absolute floating neon particles in background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#00FFFF] rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#FF00FF] rounded-full blur-[120px] animate-pulse delay-700"></div>
      </div>

      {/* Top Header controls */}
      <div className="w-full max-w-5xl flex justify-between items-center z-10">
        <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-[#FF00FF] uppercase">
          <Sparkles className="w-4 h-4 animate-spin text-[#FF00FF]" />
          <span>System Boot v1.0.3_Alpha</span>
        </div>
        <button
          onClick={() => setAudioEnabled(!audioEnabled)}
          className="flex items-center gap-2 px-3 py-1.5 bg-[#0D111A] border border-white/5 rounded-full hover:bg-slate-800 transition text-slate-400 hover:text-white cursor-pointer"
        >
          {audioEnabled ? <Volume2 className="w-4 h-4 text-[#00FFFF]" /> : <VolumeX className="w-4 h-4 text-red-450" />}
          <span className="text-xs font-mono">{audioEnabled ? 'SOUND: ON' : 'SOUND: OFF'}</span>
        </button>
      </div>

      {/* Modern Centered Branding */}
      <div className="flex flex-col items-center justify-center flex-grow z-10 text-center select-none">
        
        {/* HUGE pulses / glowing arcade texts */}
        <div className="relative group perspective-1000">
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase select-none animate-bounce">
            <span className="bg-gradient-to-r from-[#00FFFF] via-[#FF00FF] to-purple-600 bg-clip-text text-transparent filter drop-shadow-[0_0_15px_rgba(255,0,255,0.5)]">
              Appy
            </span>
            <br className="md:hidden" />
            <span className="bg-gradient-to-r from-purple-600 via-[#FF00FF] to-yellow-450 bg-clip-text text-transparent filter drop-shadow-[0_0_15px_rgba(255,0,255,0.4)] md:ml-4">
              Day
            </span>
          </h1>

          {/* Subtitle matrix */}
          <div className="mt-4 pointer-events-none text-xs md:text-sm font-mono text-[#00FFFF] tracking-[0.3em] uppercase drop-shadow-[0_0_4px_rgba(0,255,255,0.4)]">
            Casual Arcade Mainframe
          </div>
        </div>

        {/* Dynamic letter animation row */}
        <div className="flex gap-1.5 mt-8 pointer-events-none">
          {['A', 'R', 'C', 'A', 'D', 'E'].map((char, index) => (
            <span
              key={index}
              style={{ animationDelay: `${index * 150}ms` }}
              className="w-8 h-8 flex items-center justify-center border border-white/5 bg-[#0D111A]/80 rounded font-mono font-bold text-xs text-[#FF00FF] animate-pulse"
            >
              {char}
            </span>
          ))}
        </div>
      </div>

      {/* Bottom Progress Controls */}
      <div className="w-full max-w-sm flex flex-col items-center gap-4 z-10 bg-[#0D111A]/50 backdrop-blur-md p-5 rounded-2xl border border-white/5 shadow-2xl">
        <div className="w-full flex justify-between items-center text-xs font-mono text-slate-450">
          <span>INITIALIZING SYSTEMS{dots}</span>
          <span className="text-[#00FFFF]">{percent}%</span>
        </div>
        
        {/* Progress Bar Container */}
        <div className="w-full h-1.5 bg-[#0B0E14] rounded-full overflow-hidden border border-white/5">
          <div
            style={{ width: `${percent}%` }}
            className="h-full bg-gradient-to-r from-[#00FFFF] via-[#FF00FF] to-yellow-450 transition-all duration-100 ease-out shadow-[0_0_10px_rgba(0,255,255,0.5)]"
          ></div>
        </div>

        {/* Skip button allows instant bypass */}
        <button
          onClick={onComplete}
          className="flex items-center gap-1.5 px-5 py-2 mt-1 bg-gradient-to-r from-[#FF00FF] to-[#00FFFF] hover:brightness-110 rounded-xl font-bold font-mono text-xs w-full justify-center transition-all shadow-[0_4px_12px_rgba(255,0,255,0.3)] active:scale-95 cursor-pointer text-white"
        >
          <Play className="w-4 h-4 fill-white" />
          <span>SKIP SYSTEM BOOT</span>
        </button>
      </div>

      {/* Technical Footer */}
      <div className="mt-4 text-[10px] font-mono text-slate-600 tracking-wider">
        COMPATIBILITY CHECK PASS | PERSISTENT LOCAL STORAGE ON
      </div>
    </div>
  );
};
