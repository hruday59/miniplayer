import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Volume2, Trophy, Coins, Zap } from 'lucide-react';
import { useGame } from '../context/GameContext';

export const SnakeGame: React.FC = () => {
  const { recordPlaySession, user } = useGame();
  
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('mp_snake_highscore') || '0');
  });
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);

  // Snake coordinates & velocities
  const GRID_SIZE = 20;
  const [snake, setSnake] = useState<{ x: number; y: number }[]>([
    { x: 10, y: 10 },
    { x: 10, y: 11 },
    { x: 10, y: 12 },
  ]);
  const [direction, setDirection] = useState({ x: 0, y: -1 });
  const [food, setFood] = useState({ x: 5, y: 5 });
  const [speed, setSpeed] = useState(130); // ms

  // Generate random food coordinate
  const generateNewFood = () => {
    const maxX = 18; // 400px width / 20 grid
    const maxY = 18;
    const rx = Math.floor(Math.random() * maxX) + 1;
    const ry = Math.floor(Math.random() * maxY) + 1;
    setFood({ x: rx, y: ry });
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying || isGameOver) return;
      switch (e.key) {
        case 'ArrowUp':
          if (direction.y !== 1) setDirection({ x: 0, y: -1 });
          break;
        case 'ArrowDown':
          if (direction.y !== -1) setDirection({ x: 0, y: 1 });
          break;
        case 'ArrowLeft':
          if (direction.x !== 1) setDirection({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
          if (direction.x !== -1) setDirection({ x: 1, y: 0 });
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [direction, isPlaying, isGameOver]);

  // Main game ticks
  useEffect(() => {
    if (!isPlaying || isGameOver) return;

    const gameInterval = setInterval(() => {
      setSnake((prevSnake) => {
        const head = { ...prevSnake[0] };
        head.x += direction.x;
        head.y += direction.y;

        // Collision Check: Boundaries or Self
        if (
          head.x < 0 || head.x >= 20 ||
          head.y < 0 || head.y >= 20 ||
          prevSnake.some((segment) => segment.x === head.x && segment.y === head.y)
        ) {
          setIsGameOver(true);
          setIsPlaying(false);
          
          // Calculate rewards based on final score
          const finalScore = score;
          const coins = Math.floor(finalScore / 2);
          const xp = finalScore * 10;
          
          setCoinsEarned(coins);
          setXpEarned(xp);

          recordPlaySession('snake', finalScore, {
            wins: finalScore >= 15 ? 1 : 0,
            losses: finalScore < 15 ? 1 : 0,
            coins,
            xp
          });

          if (finalScore > highScore) {
            setHighScore(finalScore);
            localStorage.setItem('mp_snake_highscore', String(finalScore));
          }

          return prevSnake;
        }

        const newSnake = [head, ...prevSnake];

        // Eat food check
        if (head.x === food.x && head.y === food.y) {
          setScore((prev) => prev + 1);
          generateNewFood();
        } else {
          newSnake.pop(); // remove tail
        }

        return newSnake;
      });
    }, speed);

    return () => clearInterval(gameInterval);
  }, [isPlaying, isGameOver, direction, food, speed, score, recordPlaySession, highScore]);

  // Redraw loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear background
    ctx.fillStyle = '#020617'; // slate-950
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Grid subtle lines
    ctx.strokeStyle = '#1e293b'; // slate-800
    ctx.lineWidth = 0.5;
    for (let i = 0; i < canvas.width; i += GRID_SIZE) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvas.height);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(canvas.width, i);
      ctx.stroke();
    }

    // Draw Neon Food item (Apple / Core powerup)
    ctx.fillStyle = '#f43f5e'; // rose-500
    ctx.shadowBlur = 12;
    ctx.shadowColor = '#f43f5e';
    ctx.beginPath();
    ctx.arc(
      food.x * GRID_SIZE + GRID_SIZE / 2,
      food.y * GRID_SIZE + GRID_SIZE / 2,
      GRID_SIZE / 2.5,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Draw Glow Snake SEGMENTS
    snake.forEach((segment, index) => {
      const isHead = index === 0;
      ctx.fillStyle = isHead ? '#22d3ee' : '#a855f7'; // head: cyan, tail: purple
      ctx.shadowBlur = isHead ? 15 : 5;
      ctx.shadowColor = isHead ? '#22d3ee' : '#a855f7';
      
      // Draw rounded rect Segment
      const pad = 1.5;
      ctx.fillRect(
        segment.x * GRID_SIZE + pad,
        segment.y * GRID_SIZE + pad,
        GRID_SIZE - pad * 2,
        GRID_SIZE - pad * 2
      );
    });

    // Reset shadow for performance
    ctx.shadowBlur = 0;
  }, [snake, food]);

  const restartGame = () => {
    setSnake([
      { x: 10, y: 10 },
      { x: 10, y: 11 },
      { x: 10, y: 12 },
    ]);
    setDirection({ x: 0, y: -1 });
    generateNewFood();
    setScore(0);
    setCoinsEarned(0);
    setXpEarned(0);
    setIsGameOver(false);
    setIsPlaying(true);
  };

  const handleMobileControl = (dirX: number, dirY: number) => {
    if (!isPlaying || isGameOver) return;
    if (dirX !== 0 && direction.x !== 0) return; // ignore polar opposites
    if (dirY !== 0 && direction.y !== 0) return;
    setDirection({ x: dirX, y: dirY });
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col md:flex-row gap-6 max-w-4xl mx-auto items-center md:items-start text-white">
      {/* Left panel: Gameplay Display */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={400}
          height={400}
          className="border-2 border-slate-700 bg-slate-950 rounded-xl overflow-hidden shadow-[0_0_20px_rgba(34,211,238,0.15)] block"
        />

        {/* OVERLAY State controls: Welcome/Pause/GameOver */}
        {!isPlaying && !isGameOver && score === 0 && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center select-none rounded-xl">
            <Trophy className="w-12 h-12 text-[#eab308] animate-bounce mb-3 drop-shadow-[0_0_8px_gold]" />
            <h3 className="text-xl font-bold tracking-wider">NEON SNAKE REDUX</h3>
            <p className="text-xs text-slate-400 max-w-[280px] mt-1.5 mb-6">
              Use arrow keys or onscreen buttons to eat raw energy nodes. Do not hit borders or your tail warp segment.
            </p>
            <button
              onClick={restartGame}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-xl font-bold hover:brightness-110 active:scale-95 transition"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>START PLAYING</span>
            </button>
          </div>
        )}

        {isGameOver && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center select-none rounded-xl">
            <h3 className="text-2xl font-black text-rose-500 tracking-wide">SYSTEM COLLISION!</h3>
            <p className="text-sm font-mono text-slate-400 mt-1">Final Score Match: <span className="text-yellow-400">{score}</span></p>

            {user ? (
              <div className="mt-4 p-3 bg-slate-900 border border-slate-800 rounded-xl flex gap-4 text-xs font-mono max-w-[300px]">
                <div className="flex flex-col items-center gap-1">
                  <Coins className="w-5 h-5 text-yellow-400" />
                  <span>+{coinsEarned} Coins</span>
                </div>
                <div className="border-r border-slate-800"></div>
                <div className="flex flex-col items-center gap-1">
                  <Zap className="w-5 h-5 text-cyan-400" />
                  <span>+{xpEarned} XP Boost</span>
                </div>
              </div>
            ) : (
              <p className="text-[11px] text-[#f43f5e] uppercase tracking-wider font-mono mt-3">Signup/Login to secure XP & rewards!</p>
            )}

            <button
              onClick={restartGame}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-pink-500 to-rose-600 rounded-xl font-bold mt-6 hover:brightness-110 active:scale-95 transition text-xs"
            >
              <RotateCcw className="w-4 h-4" />
              <span>RESTART RUN</span>
            </button>
          </div>
        )}
      </div>

      {/* Right panel: Game Dash & Stats Controls */}
      <div className="flex-1 w-full flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <div>
              <h4 className="text-xs font-mono text-slate-400 uppercase tracking-widest">Active Game Stats</h4>
              <h2 className="text-lg font-bold text-cyan-400">Neon Snake Redux</h2>
            </div>
            <div className="flex gap-2">
              <button
                disabled={isGameOver || score === 0}
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-1.5 bg-slate-800 border border-slate-700 hover:bg-slate-700 disabled:opacity-40 rounded"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
              <button
                onClick={restartGame}
                className="p-1.5 bg-slate-800 border border-slate-700 hover:bg-slate-700 rounded"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Current Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] font-mono text-slate-500 uppercase block">Nodes Eaten</span>
              <span className="text-xl font-extrabold text-cyan-400">{score}</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] font-mono text-slate-500 uppercase block">My Highscore</span>
              <span className="text-xl font-extrabold text-yellow-500">{highScore}</span>
            </div>
          </div>

          <div className="bg-slate-950/50 border border-slate-800/80 p-3.5 rounded-xl mt-4">
            <h4 className="text-xs font-bold text-[#d946ef] mb-1.5">Game Speed Increments</h4>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="50"
                max="200"
                step="10"
                value={250 - speed}
                onChange={(e) => setSpeed(250 - parseInt(e.target.value))}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <span className="text-xs font-mono text-slate-400 whitespace-nowrap">{(250 - speed)} Hz</span>
            </div>
          </div>
        </div>

        {/* Mobile controls inside UI explicitly for touch access */}
        <div className="mt-6">
          <span className="text-[10px] font-mono text-slate-400 uppercase text-center block mb-3">Responsive Keys Controller</span>
          <div className="flex flex-col items-center gap-1.5">
            <button
              onClick={() => handleMobileControl(0, -1)}
              className="w-12 h-10 bg-slate-800 border border-slate-700 hover:bg-slate-700 rounded-lg flex items-center justify-center font-bold text-emerald-400 transition transform duration-100 active:scale-95 active:bg-cyan-900"
            >
              ▲
            </button>
            <div className="flex gap-4">
              <button
                onClick={() => handleMobileControl(-1, 0)}
                className="w-12 h-10 bg-slate-800 border border-slate-700 hover:bg-slate-700 rounded-lg flex items-center justify-center font-bold text-[#d946ef] transition transform duration-100 active:scale-95 active:bg-pink-900"
              >
                ◀
              </button>
              <div className="w-12 h-10"></div>
              <button
                onClick={() => handleMobileControl(1, 0)}
                className="w-12 h-10 bg-slate-800 border border-slate-700 hover:bg-slate-700 rounded-lg flex items-center justify-center font-bold text-yellow-400 transition transform duration-100 active:scale-95 active:bg-amber-900"
              >
                ▶
              </button>
            </div>
            <button
              onClick={() => handleMobileControl(0, 1)}
              className="w-12 h-10 bg-slate-800 border border-slate-700 hover:bg-slate-700 rounded-lg flex items-center justify-center font-bold text-cyan-400 transition transform duration-100 active:scale-95 active:bg-cyan-900"
            >
              ▼
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
