import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, Shield, Coins, Zap } from 'lucide-react';
import { useGame } from '../context/GameContext';

export const SpaceShooterGame: React.FC = () => {
  const { recordPlaySession, user, triggerAchievement } = useGame();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('mp_shooter_highscore') || '0');
  });
  const [lives, setLives] = useState(3);
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);

  // Keyboard controls
  const keysPressedRef = useRef<{ [key: string]: boolean }>({});

  interface Bullet {
    x: number;
    y: number;
    speed: number;
  }

  interface Meteor {
    id: number;
    x: number;
    y: number;
    size: number;
    speed: number;
    color: string;
  }

  const shipXRef = useRef(180);
  const bulletsRef = useRef<Bullet[]>([]);
  const meteorsRef = useRef<Meteor[]>([]);
  const frameIdRef = useRef<number | null>(null);
  const meteorIdCounterRef = useRef(0);
  const lastShotTimeRef = useRef(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressedRef.current[e.key] = true;
      if (e.key === ' ' && isPlaying && !isGameOver) {
        shootBullet();
      }
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
  }, [isPlaying, isGameOver]);

  const shootBullet = () => {
    const now = Date.now();
    if (now - lastShotTimeRef.current < 250) return; // rate limit: 250ms
    lastShotTimeRef.current = now;

    bulletsRef.current.push({
      x: shipXRef.current + 17, // center of ship
      y: 350,
      speed: 6.5,
    });
  };

  const spawnMeteor = (width: number) => {
    const minSize = 15;
    const maxSize = 35;
    const randX = Math.floor(Math.random() * (width - 40)) + 10;
    const colors = ['#f43f5e', '#fb1111', '#fb923c', '#eab308'];

    meteorIdCounterRef.current += 1;
    meteorsRef.current.push({
      id: meteorIdCounterRef.current,
      x: randX,
      y: -40,
      size: Math.random() * (maxSize - minSize) + minSize,
      speed: Math.random() * 2 + 1.2,
      color: colors[Math.floor(Math.random() * colors.length)],
    });
  };

  // Main game logic loop (60 FPS)
  useEffect(() => {
    if (!isPlaying || isGameOver) return;

    shipXRef.current = 180;
    bulletsRef.current = [];
    meteorsRef.current = [];
    setScore(0);
    setLives(3);

    const gameLoop = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // 1. Draw Space Background
      ctx.fillStyle = '#020617'; // slate-950
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Starfields scrolling downwards
      ctx.fillStyle = '#64748b';
      for (let i = 0; i < 20; i++) {
        const x = (i * 37) % canvas.width;
        const y = (Date.now() / 40 + i * 50) % canvas.height;
        ctx.fillRect(x, y, 1.2, 1.2);
      }

      // 2. Drive fighter ship x position
      const moveSpeed = 4.5;
      if (keysPressedRef.current['ArrowLeft'] || keysPressedRef.current['a']) {
        shipXRef.current = Math.max(0, shipXRef.current - moveSpeed);
      }
      if (keysPressedRef.current['ArrowRight'] || keysPressedRef.current['d']) {
        shipXRef.current = Math.min(canvas.width - 40, shipXRef.current + moveSpeed);
      }

      // Draw Spaceship
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#06b6d4'; // cyan laser highlight
      ctx.fillStyle = '#06b6d4';
      ctx.beginPath();
      ctx.moveTo(shipXRef.current + 20, 340); // nose cone
      ctx.lineTo(shipXRef.current, 375); // left wing
      ctx.lineTo(shipXRef.current + 40, 375); // right wing
      ctx.closePath();
      ctx.fill();

      // Draw Thruster fire flame outline
      ctx.shadowColor = '#f43f5e';
      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      ctx.moveTo(shipXRef.current + 15, 376);
      ctx.lineTo(shipXRef.current + 20, 390);
      ctx.lineTo(shipXRef.current + 25, 376);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0; // stop shadows

      // 3. Move and Render bullets
      const currentBullets: Bullet[] = [];
      bulletsRef.current.forEach((bullet) => {
        bullet.y -= bullet.speed;

        // Draw laser dot
        ctx.fillStyle = '#38bdf8';
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#38bdf8';
        ctx.fillRect(bullet.x - 2, bullet.y, 4, 12);
        ctx.shadowBlur = 0;

        if (bullet.y > 0) {
          currentBullets.push(bullet);
        }
      });
      bulletsRef.current = currentBullets;

      // 4. Spawn meteors randomly
      if (Math.random() < 0.025) {
        spawnMeteor(canvas.width);
      }

      // Move & collide meteors
      const nextMeteors: Meteor[] = [];
      for (let i = 0; i < meteorsRef.current.length; i++) {
        const m = meteorsRef.current[i];
        m.y += m.speed;

        // Draw Meteor
        ctx.fillStyle = m.color;
        ctx.shadowBlur = 8;
        ctx.shadowColor = m.color;
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.size / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Collision: ship vs meteor
        const distToShipX = Math.abs(m.x - (shipXRef.current + 20));
        const distToShipY = Math.abs(m.y - 360);
        if (distToShipX < m.size / 2 + 15 && distToShipY < m.size / 2 + 15) {
          // HIT! Reduce shield lives
          setLives((prevLives) => {
            const nextL = prevLives - 1;
            if (nextL <= 0) {
              triggerGameOver();
            }
            return nextL;
          });
          continue; // skip pushing to next screen meteors
        }

        // Collision: bullet vs meteor
        let meteorDestroyed = false;
        for (let j = 0; j < bulletsRef.current.length; j++) {
          const b = bulletsRef.current[j];
          const distToBullet = Math.hypot(m.x - b.x, m.y - b.y);
          if (distToBullet < m.size / 2 + 4) {
            // Smash meteor! Remove bullet, reward score
            bulletsRef.current.splice(j, 1);
            setScore((curr) => curr + 5);
            meteorDestroyed = true;
            break;
          }
        }

        if (meteorDestroyed) continue;

        if (m.y < canvas.height + 40) {
          nextMeteors.push(m);
        }
      }
      meteorsRef.current = nextMeteors;

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

    setScore((currScore) => {
      const finalVal = currScore;
      const coins = Math.floor(finalVal / 4);
      const xp = Math.floor(finalVal * 3);
      setCoinsEarned(coins);
      setXpEarned(xp);

      recordPlaySession('space-shooter', finalVal, {
        wins: finalVal >= 100 ? 1 : 0,
        losses: finalVal < 100 ? 1 : 0,
        coins,
        xp
      });

      if (finalVal >= 250) {
        triggerAchievement('shooter_slayer');
      }

      if (finalVal > highScore) {
        setHighScore(finalVal);
        localStorage.setItem('mp_shooter_highscore', String(finalVal));
      }
      return finalVal;
    });
  };

  const startNewRun = () => {
    shipXRef.current = 180;
    bulletsRef.current = [];
    meteorsRef.current = [];
    setScore(0);
    setCoinsEarned(0);
    setXpEarned(0);
    setLives(3);
    setIsGameOver(false);
    setIsPlaying(true);
  };

  const handleHoldInput = (dir: 'L' | 'R') => {
    if (dir === 'L') {
      shipXRef.current = Math.max(0, shipXRef.current - 22);
    } else {
      shipXRef.current = Math.min(360, shipXRef.current + 22);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col md:flex-row gap-6 max-w-4xl mx-auto items-center md:items-start text-white select-none">
      {/* Simulation Screen container */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={400}
          height={400}
          className="border-2 border-slate-700 bg-slate-950 rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.15)] block"
        />

        {/* OVERLAYS */}
        {!isPlaying && !isGameOver && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center rounded-xl">
            <h3 className="text-xl font-bold tracking-wider text-cyan-400">GALACTIC INVADER 2099</h3>
            <p className="text-xs text-slate-400 mt-2 mb-6 max-w-[280px]">
              Use **Arrow Left / Right** keys to navigate. Press **SPACEBAR** to fire cosmic lasers at incoming debris. Don't let meteors crash your hull!
            </p>
            <button
              onClick={startNewRun}
              className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 rounded-xl font-bold transition text-xs flex items-center gap-2"
            >
              🚀 ENGAGE ENGINE THRUSTERS
            </button>
          </div>
        )}

        {isGameOver && (
          <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center rounded-xl">
            <h3 className="text-2xl font-black text-rose-500 tracking-wide">SHIP DESTROYED!</h3>
            <p className="text-sm font-mono text-slate-400 mt-1">Cosmic Enemies Blasted: <span className="text-cyan-400 font-bold">{score}</span></p>

            {user && (
              <div className="mt-4 p-3 bg-slate-900 border border-slate-800 rounded-xl flex gap-4 text-xs font-mono max-w-[300px]">
                <div className="flex flex-col items-center gap-1">
                  <Coins className="w-5 h-5 text-yellow-400" />
                  <span>+{coinsEarned} Coins</span>
                </div>
                <div className="border-r border-slate-800"></div>
                <div className="flex flex-col items-center gap-1">
                  <Zap className="w-5 h-5 text-cyan-400" />
                  <span>+{xpEarned} XP</span>
                </div>
              </div>
            )}

            <button
              onClick={startNewRun}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-xl font-bold mt-6 hover:brightness-110 active:scale-95 transition text-xs"
            >
              <RotateCcw className="w-4 h-4" />
              <span>REDEPLOY FIGHTER</span>
            </button>
          </div>
        )}
      </div>

      {/* Control statistics dashboard */}
      <div className="flex-grow w-full flex flex-col justify-between">
        <div>
          <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest block">Retro Space Shootout</span>
          <h2 className="text-xl font-bold mt-1">Galactic Invader 2099</h2>

          {/* Active status cells */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-center">
              <span className="text-[10px] font-mono text-slate-500 uppercase block">Ship Score</span>
              <span className="text-xl font-black text-cyan-400">{score}</span>
            </div>
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-center">
              <span className="text-[10px] font-mono text-slate-500 uppercase block">Energy Shield</span>
              <div className="flex gap-1 items-center justify-center mt-1">
                {Array(3).fill(null).map((_, i) => (
                  <Shield
                    key={i}
                    className={`w-4 h-4 ${i < lives ? 'text-emerald-400 fill-emerald-400' : 'text-slate-700'}`}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-slate-400 text-[11px] leading-relaxed select-text">
            <div className="flex justify-between border-b border-slate-900 pb-1.5 mb-1.5 text-slate-300 font-mono text-[10px]">
              <span>PLAYER CONTROLLERS</span>
              <span>KEY ASSIGNMENT</span>
            </div>
            <div className="flex justify-between">
              <span>Steer Left/Right:</span>
              <span className="text-cyan-400 font-mono">◀ / ▶ or A / D</span>
            </div>
            <div className="flex justify-between mt-1">
              <span>Fire Plasma Lasers:</span>
              <span className="text-yellow-400 font-mono">Spacebar [Hold]</span>
            </div>
          </div>
        </div>

        {/* Handy touch controllers to help players on notebooks with no keyboards */}
        <div className="mt-6">
          <span className="text-[10px] font-mono text-slate-500 uppercase block text-center mb-1.5">Mobile Touch Controller</span>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => handleHoldInput('L')}
              className="py-2 px-5 bg-slate-800 hover:bg-slate-700 transition rounded-lg text-xs font-mono font-bold font-semibold min-w-[70px] border border-slate-700"
            >
              ◀ STEER LEFT
            </button>
            <button
              onClick={shootBullet}
              className="py-2 px-5 bg-cyan-950 hover:bg-cyan-900 text-cyan-400 transition rounded-lg text-xs font-semibold border border-cyan-800"
            >
              🚀 FIRE LASER
            </button>
            <button
              onClick={() => handleHoldInput('R')}
              className="py-2 px-5 bg-slate-800 hover:bg-slate-700 transition rounded-lg text-xs font-mono font-bold font-semibold min-w-[70px] border border-slate-700"
            >
              STEER RIGHT ▶
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
