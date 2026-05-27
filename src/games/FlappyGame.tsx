import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, Coins, Zap } from 'lucide-react';
import { useGame } from '../context/GameContext';

export const FlappyGame: React.FC = () => {
  const { recordPlaySession, user } = useGame();
  
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('mp_flappy_highscore') || '0');
  });
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);

  // Flight variables
  const birdYRef = useRef(150);
  const velocityRef = useRef(0);
  const gravity = 0.4;
  const jumpPower = -6.5;

  // Obstacles list (each obstacle has x, gapY, gapHeight, width)
  interface Pipe {
    x: number;
    gapY: number;
    gapHeight: number;
    width: number;
    passed: boolean;
  }
  const pipesRef = useRef<Pipe[]>([]);
  const frameIdRef = useRef<number | null>(null);

  // Jump control
  const jump = () => {
    if (isGameOver) {
      restartGame();
      return;
    }
    if (!isPlaying) {
      setIsPlaying(true);
      return;
    }
    velocityRef.current = jumpPower;
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.code === 'Space' || e.code === 'ArrowUp') {
      e.preventDefault();
      jump();
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, isGameOver]);

  // Main game tick (60 FPS recursive loop)
  useEffect(() => {
    if (!isPlaying || isGameOver) return;

    pipesRef.current = [
      { x: 450, gapY: 100, gapHeight: 125, width: 45, passed: false },
      { x: 680, gapY: 140, gapHeight: 125, width: 45, passed: false }
    ];
    birdYRef.current = 150;
    velocityRef.current = 0;

    const gameLoop = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // 1. Clear background
      ctx.fillStyle = '#0f172a'; // slate-900 background
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Stars floating background simulation
      ctx.fillStyle = '#475569';
      for (let i = 0; i < 15; i++) {
        const x = (Date.now() / 50 + i * 50) % canvas.width;
        const y = (i * 27) % canvas.height;
        ctx.fillRect(x, y, 1.5, 1.5);
      }

      // 2. Physics & Bird mechanics
      velocityRef.current += gravity;
      birdYRef.current += velocityRef.current;

      // Draw Glowing Plasma ship
      ctx.save();
      ctx.translate(100, birdYRef.current);
      // rotate based on velocity
      const angle = Math.min(Math.max(velocityRef.current * 0.04, -0.5), 0.5);
      ctx.rotate(angle);

      // Glow effect
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#d946ef'; // pink glow
      ctx.fillStyle = '#d946ef';

      // Draw ship polygon
      ctx.beginPath();
      ctx.moveTo(15, 0);
      ctx.lineTo(-12, -8);
      ctx.lineTo(-7, 0);
      ctx.lineTo(-12, 8);
      ctx.closePath();
      ctx.fill();

      // Reactor engine flare red outline
      ctx.shadowColor = '#fb7185';
      ctx.fillStyle = '#fb7185';
      ctx.beginPath();
      ctx.arc(-13, 0, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
      ctx.shadowBlur = 0; // reset shadow

      // Ground or ceiling boundary collision check
      if (birdYRef.current <= 5 || birdYRef.current >= canvas.height - 10) {
        triggerGameOver();
        return;
      }

      // 3. Pipes and obstacle logic
      const updatedPipes: Pipe[] = [];
      pipesRef.current.forEach((pipe) => {
        // move pipe left
        pipe.x -= 2.2;

        // Draw obstacle laser gates
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#22d3ee'; // cyan gates
        ctx.fillStyle = 'rgba(34, 211, 238, 0.4)';
        ctx.strokeStyle = '#22d3ee';
        ctx.lineWidth = 2.5;

        // Draw Top Pipe
        ctx.fillRect(pipe.x, 0, pipe.width, pipe.gapY);
        ctx.strokeRect(pipe.x, -5, pipe.width, pipe.gapY + 5);

        // Draw Bottom Pipe
        const bottomPipeY = pipe.gapY + pipe.gapHeight;
        ctx.fillRect(pipe.x, bottomPipeY, pipe.width, canvas.height - bottomPipeY);
        ctx.strokeRect(pipe.x, bottomPipeY, pipe.width, canvas.height - bottomPipeY + 5);

        // Draw electrical laser beam gap
        ctx.shadowColor = '#f43f5e';
        ctx.strokeStyle = 'rgba(244, 63, 94, 0.5)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(pipe.x + pipe.width / 2, pipe.gapY);
        ctx.lineTo(pipe.x + pipe.width / 2, bottomPipeY);
        ctx.stroke();

        ctx.shadowBlur = 0; // reset shadows

        // Collision box detections
        const birdLeft = 100 - 10;
        const birdRight = 100 + 10;
        const birdTop = birdYRef.current - 6;
        const birdBottom = birdYRef.current + 6;

        if (
          birdRight > pipe.x &&
          birdLeft < pipe.x + pipe.width &&
          (birdTop < pipe.gapY || birdBottom > pipe.gapY + pipe.gapHeight)
        ) {
          triggerGameOver();
          return;
        }

        // Passed score trigger
        if (!pipe.passed && pipe.x + pipe.width < 100) {
          pipe.passed = true;
          setScore((prev) => prev + 1);
        }

        // recycle pipe if goes offscreen
        if (pipe.x > -pipe.width) {
          updatedPipes.push(pipe);
        }
      });

      // Spawn new pipe
      if (updatedPipes.length > 0 && updatedPipes[updatedPipes.length - 1].x < 260) {
        const minGapY = 50;
        const maxGapY = canvas.height - 180;
        const randGapY = Math.floor(Math.random() * (maxGapY - minGapY)) + minGapY;
        updatedPipes.push({
          x: 450,
          gapY: randGapY,
          gapHeight: 125,
          width: 45,
          passed: false,
        });
      }

      pipesRef.current = updatedPipes;
      frameIdRef.current = requestAnimationFrame(gameLoop);
    };

    frameIdRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (frameIdRef.current) cancelAnimationFrame(frameIdRef.current);
    };
  }, [isPlaying, isGameOver]);

  const triggerGameOver = () => {
    setIsGameOver(true);
    setIsPlaying(false);

    // Give scores & rewards
    setScore((currScore) => {
      const finalVal = currScore;
      const coins = finalVal * 2;
      const xp = finalVal * 15;
      setCoinsEarned(coins);
      setXpEarned(xp);

      recordPlaySession('flappy', finalVal, {
        wins: finalVal >= 10 ? 1 : 0,
        losses: finalVal < 10 ? 1 : 0,
        coins,
        xp
      });

      if (finalVal > highScore) {
        setHighScore(finalVal);
        localStorage.setItem('mp_flappy_highscore', String(finalVal));
      }
      return finalVal;
    });
  };

  const restartGame = () => {
    birdYRef.current = 150;
    velocityRef.current = 0;
    pipesRef.current = [
      { x: 450, gapY: 100, gapHeight: 125, width: 45, passed: false },
      { x: 680, gapY: 140, gapHeight: 125, width: 45, passed: false }
    ];
    setScore(0);
    setCoinsEarned(0);
    setXpEarned(0);
    setIsGameOver(false);
    setIsPlaying(true);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col md:flex-row gap-6 max-w-4xl mx-auto items-center md:items-start text-white select-none">
      {/* Gameplay Display screen */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={400}
          height={400}
          onClick={jump}
          className="border-2 border-slate-700 bg-slate-950 rounded-xl cursor-pointer shadow-[0_0_20px_rgba(217,70,239,0.15)] block"
        />

        {/* OVERLAYS */}
        {!isPlaying && !isGameOver && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center rounded-xl">
            <h3 className="text-xl font-bold tracking-wider text-[#d946ef]">FLAPPY COSMIC BOLT</h3>
            <p className="text-xs text-slate-400 mt-2 mb-6 max-w-[280px]">
              Tap/Click the game board or press **SPACEBAR** to fire upward jets. Fly between the energized cyan lightning poles cleanly.
            </p>
            <button
              onClick={restartGame}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl font-bold hover:brightness-110 active:scale-95 transition text-sm"
            >
              🚀 LAUNCH SHUTTLE
            </button>
          </div>
        )}

        {isGameOver && (
          <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center rounded-xl">
            <h3 className="text-2xl font-black text-rose-500 tracking-wide text-center">SHUTTLE CRASHED!</h3>
            <p className="text-sm font-mono text-slate-400 mt-1">Obstacles Crossed: <span className="text-[#22d3ee] font-bold">{score}</span></p>

            {user && (
              <div className="mt-4 p-3 bg-slate-900 border border-slate-800 rounded-xl flex gap-4 text-xs font-mono max-w-[300px]">
                <div className="flex flex-col items-center gap-1">
                  <Coins className="w-5 h-5 text-yellow-400" />
                  <span>+{coinsEarned} Coins</span>
                </div>
                <div className="border-r border-slate-800"></div>
                <div className="flex flex-col items-center gap-1">
                  <Zap className="w-5 h-5 text-cyan-400" />
                  <span>+{xpEarned} XP Gain</span>
                </div>
              </div>
            )}

            <button
              onClick={restartGame}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-xl font-bold mt-6 hover:brightness-110 active:scale-95 transition text-xs"
            >
              <RotateCcw className="w-4 h-4" />
              <span>REDEPLOY RUN</span>
            </button>
          </div>
        )}
      </div>

      {/* Stats and guide info */}
      <div className="flex-grow w-full flex flex-col justify-between">
        <div>
          <span className="text-xs font-mono text-[#d946ef] uppercase tracking-widest block">Action flight game</span>
          <h2 className="text-xl font-extrabold text-white mt-1 border-b border-slate-800 pb-3">Flappy Cosmic Bolt</h2>

          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
              <span className="text-[10px] font-mono text-slate-500 uppercase block">Gates Cleared</span>
              <span className="text-2xl font-black text-[#d946ef]">{score}</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
              <span className="text-[10px] font-mono text-slate-500 uppercase block">Total Record</span>
              <span className="text-2xl font-black text-yellow-500">{highScore}</span>
            </div>
          </div>

          <div className="mt-6 bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-slate-300 text-xs leading-relaxed">
            <h4 className="text-xs font-bold text-cyan-300 mb-1.5 uppercase font-mono">Flight Rule Manual</h4>
            <ul className="list-disc list-inside space-y-1.5 text-slate-400">
              <li>Tap spacebar or click page continuously to avoid plummeting.</li>
              <li>Hitting the upper shield or floor forces a structural crash.</li>
              <li>Gain +2 Coins and +15 XP for every electric shield gate crossed.</li>
            </ul>
          </div>
        </div>

        {/* Big Touch Trigger key for handy laptop-pad clickers */}
        <button
          onClick={jump}
          className="w-full py-6 mt-8 bg-slate-950/80 hover:bg-slate-950 border border-slate-700/80 active:bg-cyan-950 hover:border-cyan-500 hover:text-cyan-300 active:scale-95 rounded-xl text-center text-xs font-mono font-bold tracking-widest text-slate-400 transition"
        >
          CLICK TO HOP / PROPULSION BOOSTER 🚀
        </button>
      </div>
    </div>
  );
};
