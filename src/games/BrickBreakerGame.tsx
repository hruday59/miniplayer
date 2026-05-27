import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, Award, Coins, Zap } from 'lucide-react';
import { useGame } from '../context/GameContext';

export const BrickBreakerGame: React.FC = () => {
  const { recordPlaySession, user } = useGame();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('mp_breaker_highscore') || '0');
  });
  const [isWonState, setIsWonState] = useState(false);
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);

  // Layout parameters
  const paddleHeight = 12;
  const paddleWidth = 75;
  const ballRadius = 6;

  // Mutable game refs
  const paddleXRef = useRef(162); // centered at start (400 - 75)/2
  const ballXRef = useRef(200);
  const ballYRef = useRef(350);
  const ballDXRef = useRef(3);
  const ballDYRef = useRef(-3);

  // Bricks setup
  const brickRowCount = 4;
  const brickColumnCount = 5;
  const brickWidth = 65;
  const brickHeight = 18;
  const brickPadding = 8;
  const brickOffsetTop = 40;
  const brickOffsetLeft = 20;

  interface Brick {
    x: number;
    y: number;
    status: number; // 1: active, 0: broken
    color: string;
  }

  const bricksRef = useRef<Brick[]>([]);
  const frameIdRef = useRef<number | null>(null);
  const keysPressedRef = useRef<{ [key: string]: boolean }>({});

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressedRef.current[e.key] = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressedRef.current[e.key] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const initializeBricks = () => {
    const colors = ['#f43f5e', '#d946ef', '#a855f7', '#06b6d4'];
    const b: Brick[] = [];
    for (let c = 0; c < brickColumnCount; c++) {
      for (let r = 0; r < brickRowCount; r++) {
        const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
        const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
        b.push({
          x: brickX,
          y: brickY,
          status: 1,
          color: colors[r % colors.length]
        });
      }
    }
    bricksRef.current = b;
  };

  // Gameloop tick (60 FPS)
  useEffect(() => {
    if (!isPlaying || isGameOver || isWonState) return;

    // Reset ball positions
    paddleXRef.current = 162;
    ballXRef.current = 200;
    ballYRef.current = 340;
    ballDXRef.current = 2.5;
    ballDYRef.current = -3;
    setScore(0);
    initializeBricks();

    const loop = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Clear Frame
      ctx.fillStyle = '#020617'; // slate-950
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 1. Move Player paddle
      const paddleSpeed = 5;
      if (keysPressedRef.current['ArrowLeft'] || keysPressedRef.current['a']) {
        paddleXRef.current = Math.max(0, paddleXRef.current - paddleSpeed);
      }
      if (keysPressedRef.current['ArrowRight'] || keysPressedRef.current['d']) {
        paddleXRef.current = Math.min(canvas.width - paddleWidth, paddleXRef.current + paddleSpeed);
      }

      // Draw Paddle
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#d946ef'; // pink paddle glow
      ctx.fillStyle = '#d946ef';
      ctx.fillRect(paddleXRef.current, canvas.height - paddleHeight - 8, paddleWidth, paddleHeight);
      ctx.shadowBlur = 0;

      // 2. Draw Bricks
      let activeBricksCount = 0;
      bricksRef.current.forEach((brick) => {
        if (brick.status === 1) {
          activeBricksCount += 1;
          ctx.fillStyle = brick.color;
          ctx.shadowBlur = 4;
          ctx.shadowColor = brick.color;
          ctx.fillRect(brick.x, brick.y, brickWidth, brickHeight);
          ctx.shadowBlur = 0;
        }
      });

      // Win Condition Check
      if (activeBricksCount === 0) {
        setIsWonState(true);
        setIsPlaying(false);
        triggerVictory();
        return;
      }

      // 3. Move Ball
      ballXRef.current += ballDXRef.current;
      ballYRef.current += ballDYRef.current;

      // Draw Ball
      ctx.fillStyle = '#f59e0b'; // amber ball
      ctx.shadowBlur = 12;
      ctx.shadowColor = '#f59e0b';
      ctx.beginPath();
      ctx.arc(ballXRef.current, ballYRef.current, ballRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Ball Wall Collsions (left/right)
      if (ballXRef.current + ballDXRef.current > canvas.width - ballRadius || ballXRef.current + ballDXRef.current < ballRadius) {
        ballDXRef.current = -ballDXRef.current;
      }

      // Ceiling bounce
      if (ballYRef.current + ballDYRef.current < ballRadius) {
        ballDYRef.current = -ballDYRef.current;
      }

      // Paddle Collision bounce or Pit Floor Game Over
      if (ballYRef.current + ballDYRef.current > canvas.height - paddleHeight - 15) {
        if (ballXRef.current > paddleXRef.current && ballXRef.current < paddleXRef.current + paddleWidth) {
          // Bounce off paddle
          ballDYRef.current = -Math.abs(ballDYRef.current);
          // Add angle bias based on where it hit on the paddle
          const relativeHit = (ballXRef.current - (paddleXRef.current + paddleWidth / 2)) / (paddleWidth / 2);
          ballDXRef.current = relativeHit * 3.5;
        } else if (ballYRef.current + ballDYRef.current > canvas.height - ballRadius) {
          // PIT FLOOR Collision! GAME OVER
          triggerGameOver();
          return;
        }
      }

      // Brick-Ball Collision Detection
      bricksRef.current.forEach((brick) => {
        if (brick.status === 1) {
          if (
            ballXRef.current > brick.x &&
            ballXRef.current < brick.x + brickWidth &&
            ballYRef.current > brick.y &&
            ballYRef.current < brick.y + brickHeight
          ) {
            ballDYRef.current = -ballDYRef.current;
            brick.status = 0; // break brick
            setScore((currScore) => currScore + 10);
          }
        }
      });

      frameIdRef.current = requestAnimationFrame(loop);
    };

    frameIdRef.current = requestAnimationFrame(loop);

    return () => {
      if (frameIdRef.current) cancelAnimationFrame(frameIdRef.current);
    };
  }, [isPlaying, isGameOver, isWonState]);

  const triggerGameOver = () => {
    setIsGameOver(true);
    setIsPlaying(false);

    setScore((curr) => {
      const finalS = curr;
      const coins = Math.floor(finalS / 5);
      const xp = finalS * 2;
      setCoinsEarned(coins);
      setXpEarned(xp);

      recordPlaySession('brick-breaker', finalS, { wins: 0, losses: 1, coins, xp });
      return finalS;
    });
  };

  const triggerVictory = () => {
    const finalS = score + 200; // Clear bonus
    const coins = 40;
    const xp = 150;
    setCoinsEarned(coins);
    setXpEarned(xp);
    setScore(finalS);

    recordPlaySession('brick-breaker', finalS, { wins: 1, losses: 0, coins, xp });

    if (finalS > highScore) {
      setHighScore(finalS);
      localStorage.setItem('mp_breaker_highscore', String(finalS));
    }
  };

  const startNewRun = () => {
    setIsGameOver(false);
    setIsWonState(false);
    setIsPlaying(true);
  };

  const handleHoldInput = (dir: 'L' | 'R') => {
    if (dir === 'L') {
      paddleXRef.current = Math.max(0, paddleXRef.current - 35);
    } else {
      paddleXRef.current = Math.min(325, paddleXRef.current + 35);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col md:flex-row gap-6 max-w-4xl mx-auto text-white items-center md:items-start select-none">
      {/* Simulation Screen */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={400}
          height={400}
          className="border-2 border-slate-700 bg-slate-950 rounded-xl overflow-hidden shadow-[0_0_20px_rgba(217,70,239,0.15)] block"
        />

        {/* OVERLAYS */}
        {!isPlaying && !isGameOver && !isWonState && (
          <div className="absolute inset-x-0 inset-y-0 bg-slate-950/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center rounded-xl">
            <h3 className="text-xl font-bold text-[#d946ef] tracking-wider">HYPER BRICKS DEMOLISHER</h3>
            <p className="text-xs text-slate-400 mt-2 mb-6 max-w-[280px]">
              Bounce the magnetic sphere under the brick rows utilizing your paddle block. Don't let the sphere crash into the core floor pit!
            </p>
            <button
              onClick={startNewRun}
              className="px-6 py-2.5 bg-gradient-to-r from-purple-500 to-pink-600 hover:brightness-110 active:scale-95 text-xs font-bold font-mono transition rounded-xl"
            >
              LAUNCH AMBER SPHERE
            </button>
          </div>
        )}

        {isGameOver && (
          <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center rounded-xl">
            <h3 className="text-xl font-black text-rose-500 tracking-wide">SYSTEM DETONATED</h3>
            <span className="text-xs font-mono text-slate-400 mt-1">Bricks Block Score: <span className="text-pink-400 font-bold">{score}</span></span>

            {user && (
              <div className="mt-4 p-2.5 bg-slate-900 border border-slate-800 rounded-xl flex gap-4 text-xs font-mono max-w-[280px] justify-center">
                <div className="flex flex-col items-center">
                  <Coins className="w-4 h-4 text-yellow-400" />
                  <span>+{coinsEarned} Coins</span>
                </div>
                <div className="border-r border-slate-800"></div>
                <div className="flex flex-col items-center">
                  <Zap className="w-4 h-4 text-pink-400" />
                  <span>+{xpEarned} XP</span>
                </div>
              </div>
            )}

            <button
              onClick={startNewRun}
              className="mt-6 flex items-center gap-1.5 px-6 py-2 bg-[#d946ef] rounded-xl text-xs font-bold transition"
            >
              <RotateCcw className="w-4 h-4" />
              <span>RESTART RUN</span>
            </button>
          </div>
        )}

        {isWonState && (
          <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center rounded-xl">
            <Award className="w-12 h-12 text-emerald-400 animate-bounce" />
            <h3 className="text-xl font-black text-emerald-400 tracking-widest mt-2">GRID CLEARED!</h3>
            <span className="text-xs font-mono text-slate-400">Total Run Score: <span className="text-yellow-400">{score}</span></span>

            {user && (
              <div className="mt-4 p-2.5 bg-slate-900 border border-slate-800 rounded-xl flex gap-4 text-xs font-mono max-w-[280px] justify-center">
                <div className="flex flex-col items-center">
                  <Coins className="w-4 h-4 text-yellow-400" />
                  <span>+{coinsEarned} Coins</span>
                </div>
                <div className="border-r border-slate-800"></div>
                <div className="flex flex-col items-center">
                  <Zap className="w-4 h-4 text-cyan-400" />
                  <span>+{xpEarned} XP Boost</span>
                </div>
              </div>
            )}

            <button
              onClick={startNewRun}
              className="mt-6 flex items-center gap-1.5 px-6 py-2 bg-gradient-to-r from-[#d946ef] to-purple-600 rounded-xl text-xs font-bold transition"
            >
              <RotateCcw className="w-4 h-4 animate-spin" />
              <span>NEXT SECTOR RUN</span>
            </button>
          </div>
        )}
      </div>

      {/* Guide Details panel */}
      <div className="flex-grow w-full flex flex-col justify-between">
        <div>
          <span className="text-xs font-mono text-[#d946ef] uppercase tracking-widest block">Physics Arcade</span>
          <h2 className="text-xl font-bold mt-1">Hyper Bricks Demolisher</h2>

          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-center">
              <span className="text-[10px] font-mono text-slate-500 uppercase block">Demolition Value</span>
              <span className="text-xl font-black text-[#d946ef]">{score}</span>
            </div>
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-center">
              <span className="text-[10px] font-mono text-slate-500 uppercase block">Best Break Score</span>
              <span className="text-xl font-black text-yellow-500">{highScore}</span>
            </div>
          </div>

          <div className="mt-5 p-3.5 bg-slate-950/60 rounded-xl border border-slate-800 text-[11px] text-slate-400 leading-relaxed font-mono">
            <h4 className="text-xs font-bold text-pink-300 font-sans mb-1 uppercase">Break Guidelines</h4>
            <ul className="list-disc list-inside space-y-1">
              <li>Glide Left/Right via Arrow Left/Right or (A/D).</li>
              <li>Shattering color codes rewards +10 raw credits each.</li>
              <li>Fully clearing blocks awards an extra +200 bonus units!</li>
            </ul>
          </div>
        </div>

        {/* Handy mobile buttons for pads/notebooks */}
        <div className="mt-8 flex gap-3 justify-center">
          <button
            onClick={() => handleHoldInput('L')}
            className="flex-1 py-1 px-4 bg-slate-800 hover:bg-slate-700 active:bg-cyan-950 transition rounded-lg text-xs font-mono font-bold"
          >
            ◀ SHIFT LEFT
          </button>
          <button
            onClick={() => handleHoldInput('R')}
            className="flex-1 py-1 px-4 bg-slate-800 hover:bg-slate-700 active:bg-cyan-950 transition rounded-lg text-xs font-mono font-bold"
          >
            SHIFT RIGHT ▶
          </button>
        </div>
      </div>
    </div>
  );
};
