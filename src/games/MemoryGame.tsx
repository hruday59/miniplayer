import React, { useState, useEffect } from 'react';
import { RotateCcw, Coins, Zap, Shield, Trophy, Flame, Skull, Star, Key, Sword, Diamond } from 'lucide-react';
import { useGame } from '../context/GameContext';

// Available matching icons
const CARD_ICONS = [
  { id: 'shield', icon: Shield, color: 'text-blue-400' },
  { id: 'trophy', icon: Trophy, color: 'text-yellow-400' },
  { id: 'flame', icon: Flame, color: 'text-orange-500' },
  { id: 'skull', icon: Skull, color: 'text-rose-500' },
  { id: 'star', icon: Star, color: 'text-emerald-400' },
  { id: 'key', icon: Key, color: 'text-pink-400' },
  { id: 'sword', icon: Sword, color: 'text-cyan-400' },
  { id: 'diamond', icon: Diamond, color: 'text-purple-400' },
];

interface Card {
  uniqueId: number;
  id: string;
  isFlipped: boolean;
  isMatched: boolean;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

export const MemoryGame: React.FC = () => {
  const { recordPlaySession, triggerAchievement, user } = useGame();

  const [cards, setCards] = useState<Card[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [turns, setTurns] = useState(0);
  const [matchesCount, setMatchesCount] = useState(0);
  const [isWon, setIsWon] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60); // 60s countdown
  const [isGameOver, setIsGameOver] = useState(false);
  const [coinsReward, setCoinsReward] = useState(0);
  const [xpReward, setXpReward] = useState(0);

  // Initialize and shuffle deck
  const initializeDeck = () => {
    const doubled = [...CARD_ICONS, ...CARD_ICONS].map((item, idx) => ({
      uniqueId: idx,
      id: item.id,
      isFlipped: false,
      isMatched: false,
      icon: item.icon,
      color: item.color,
    }));
    
    // Shuffle array
    const shuffled = doubled.sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setFlippedIndices([]);
    setTurns(0);
    setMatchesCount(0);
    setIsWon(false);
    setIsGameOver(false);
    setTimeLeft(60);
    setCoinsReward(0);
    setXpReward(0);
  };

  useEffect(() => {
    initializeDeck();
  }, []);

  // Timer tick
  useEffect(() => {
    if (isWon || isGameOver || cards.length === 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsGameOver(true);
          // Lose Reward fallback
          recordPlaySession('memory', 10, { wins: 0, losses: 1, coins: 2, xp: 5 });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isWon, isGameOver, cards]);

  const handleCardClick = (index: number) => {
    if (cards[index].isFlipped || cards[index].isMatched || flippedIndices.length >= 2 || isGameOver) return;

    // Flip card
    const targetCards = [...cards];
    targetCards[index].isFlipped = true;
    setCards(targetCards);

    const updatedFlipped = [...flippedIndices, index];
    setFlippedIndices(updatedFlipped);

    // Two cards are flipped: evaluate match
    if (updatedFlipped.length === 2) {
      setTurns((prev) => prev + 1);
      const [firstIdx, secondIdx] = updatedFlipped;

      if (cards[firstIdx].id === cards[secondIdx].id) {
        // MATCH found
        setTimeout(() => {
          setCards((prevCards) => {
            const nextCards = [...prevCards];
            nextCards[firstIdx].isMatched = true;
            nextCards[secondIdx].isMatched = true;
            return nextCards;
          });
          setFlippedIndices([]);
          setMatchesCount((c) => {
            const sum = c + 1;
            if (sum === CARD_ICONS.length) {
              handleVictory();
            }
            return sum;
          });
        }, 300);
      } else {
        // NO MATCH: flip back
        setTimeout(() => {
          setCards((prevCards) => {
            const nextCards = [...prevCards];
            nextCards[firstIdx].isFlipped = false;
            nextCards[secondIdx].isFlipped = false;
            return nextCards;
          });
          setFlippedIndices([]);
        }, 1000);
      }
    }
  };

  const handleVictory = () => {
    setIsWon(true);
    const finalTurns = turns + 1; // current turn count

    // Rewards proportional to performance (low turns = higher bonus)
    const bonus = Math.max(25 - finalTurns, 5);
    const coins = bonus * 3;
    const xp = bonus * 12;

    setCoinsReward(coins);
    setXpReward(xp);

    recordPlaySession('memory', indexScore(finalTurns), {
      wins: 1,
      losses: 0,
      coins,
      xp
    });

    if (finalTurns <= 12) {
      triggerAchievement('memory_perfect');
    }
  };

  const indexScore = (t: number) => {
    return Math.max(100 - t * 3, 10);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col md:flex-row gap-6 max-w-4xl mx-auto items-center md:items-start text-white">
      {/* Game board grid layout */}
      <div className="w-full max-w-[340px]">
        {/* Game Stats bar */}
        <div className="flex justify-between items-center text-xs font-mono mb-4 px-2 py-1 bg-slate-950 rounded-lg border border-slate-800">
          <div>TURNS: <span className="text-cyan-400 font-bold">{turns}</span></div>
          <div>MATCHES: <span className="text-emerald-400 font-bold">{matchesCount}/8</span></div>
          <div>TIME: <span className={`font-bold ${timeLeft <= 15 ? 'text-red-400 animate-pulse' : 'text-yellow-400'}`}>{timeLeft}s</span></div>
        </div>

        {/* 16 Grid Columns */}
        <div className="grid grid-cols-4 gap-2.5 p-2 bg-slate-950 border border-slate-800 rounded-xl relative">
          {cards.map((card, idx) => {
            const Icon = card.icon;
            const shown = card.isFlipped || card.isMatched;

            return (
              <button
                key={card.uniqueId}
                disabled={shown || isWon || isGameOver}
                onClick={() => handleCardClick(idx)}
                className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl flex items-center justify-center transition-all duration-300 relative border ${
                  card.isMatched ? 'bg-emerald-950/20 border-emerald-500/80 shadow-[0_0_8px_rgba(16,185,129,0.3)] text-emerald-400' :
                  card.isFlipped ? 'bg-slate-800 border-cyan-500' :
                  'bg-slate-900 hover:bg-slate-850 hover:border-slate-700 border-slate-800 hover:rotate-1'
                }`}
              >
                {/* Back side or front icon */}
                {shown ? (
                  <Icon className={`w-8 h-8 ${card.color} animate-pulse`} />
                ) : (
                  <div className="w-6 h-6 border-2 border-dashed border-slate-700 rounded-full flex items-center justify-center text-[10px] font-mono text-slate-500">
                    M
                  </div>
                )}
              </button>
            );
          })}

          {/* GAME TIMEOUT OVERLAY */}
          {isGameOver && !isWon && (
            <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center p-4 text-center">
              <h4 className="text-rose-500 font-black text-xl tracking-wider">TIME EXPIRED!</h4>
              <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">Your neural signals ran out of energy capacity. Push harder next session!</p>
              <button
                onClick={initializeDeck}
                className="mt-5 px-5 py-2 bg-slate-900 border border-slate-700 hover:bg-slate-800 transition rounded-xl text-xs font-bold font-mono"
              >
                REBOOT MODULE
              </button>
            </div>
          )}

          {/* VICTORY OVERLAY */}
          {isWon && (
            <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md rounded-xl flex flex-col items-center justify-center p-4 text-center">
              <Trophy className="w-10 h-10 text-yellow-400 animate-bounce" />
              <h4 className="text-emerald-400 font-black text-xl tracking-widest mt-2">RECALL COMPLETE!</h4>
              <p className="text-slate-400 text-xs mt-1 font-mono">Matched in {turns} Attempts</p>

              {user && (
                <div className="mt-4 p-2 bg-slate-900 border border-slate-800 rounded-lg flex gap-3 text-[11px] font-mono justify-center">
                  <div className="flex flex-col items-center">
                    <Coins className="w-4 h-4 text-yellow-400" />
                    <span>+{coinsReward} Coins</span>
                  </div>
                  <div className="border-r border-slate-800"></div>
                  <div className="flex flex-col items-center">
                    <Zap className="w-4 h-4 text-cyan-400" />
                    <span>+{xpReward} XP</span>
                  </div>
                </div>
              )}

              <button
                onClick={initializeDeck}
                className="mt-6 px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl text-xs font-bold shadow-[0_4px_10px_rgba(16,185,129,0.3)] hover:brightness-110 active:scale-95 transition"
              >
                PLAY AGAIN
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Guide details / score logic */}
      <div className="flex-1 w-full flex flex-col justify-between">
        <div>
          <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest block">Classic Cognition Game</span>
          <h2 className="text-xl font-bold mt-1.5">Arcade Memory Recall</h2>
          <p className="text-xs text-slate-400 leading-relaxed mt-2.5">
            Identify double matched cards under a decreasing 60-second timer buffer. Completing the grid with fewer overall mistakes unlocks rare gamer badges!
          </p>

          <div className="bg-slate-950/40 p-4 border border-slate-800 rounded-xl mt-5">
            <h4 className="text-xs font-bold text-yellow-500 uppercase tracking-wide font-mono">Bonus Multiplier Tiers</h4>
            <div className="mt-2.5 space-y-2 text-[11px] text-slate-400 font-mono">
              <div className="flex justify-between border-b border-slate-800/50 pb-1">
                <span>&lt;= 12 Turns:</span>
                <span className="text-emerald-400 font-semibold">[PERFECT HOVER] Hyperneuron Badge!</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/50 pb-1">
                <span>&lt;= 16 Turns:</span>
                <span className="text-yellow-400 font-semibold">Premium Coin Rewards x3</span>
              </div>
              <div className="flex justify-between">
                <span>&gt; 16 Turns:</span>
                <span className="text-slate-500">Standard Casual Arcade Rate</span>
              </div>
            </div>
          </div>
        </div>

        {/* Manual Reset */}
        <button
          onClick={initializeDeck}
          className="mt-8 flex items-center justify-center gap-2 py-2 border border-slate-800 bg-slate-950/40 hover:bg-slate-900 transition-all rounded-lg text-slate-400 hover:text-white text-xs font-bold select-none"
        >
          <RotateCcw className="w-4 h-4" />
          <span>SHUFFLE & RESTART GAME</span>
        </button>
      </div>
    </div>
  );
};
