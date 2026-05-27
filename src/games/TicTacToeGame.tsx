import React, { useState, useEffect } from 'react';
import { RotateCcw, Trophy, Coins, User, Cpu } from 'lucide-react';
import { useGame } from '../context/GameContext';

export const TicTacToeGame: React.FC = () => {
  const { recordPlaySession, user } = useGame();
  
  const [board, setBoard] = useState<(string | null)[]>(Array(9).fill(null));
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [winner, setWinner] = useState<string | null>(null); // 'X' (User), 'O' (AI), 'Draw'
  const [statusText, setStatusText] = useState('Your Turn');
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);

  // Check board state champion
  const checkWinner = (grid: (string | null)[]) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
      [0, 4, 8], [2, 4, 6]             // Diagonals
    ];

    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (grid[a] && grid[a] === grid[b] && grid[a] === grid[c]) {
        return grid[a];
      }
    }

    if (grid.every(cell => cell !== null)) {
      return 'Draw';
    }
    return null;
  };

  const handleCellClick = (index: number) => {
    if (board[index] || winner || !isPlayerTurn) return;

    const newBoard = [...board];
    newBoard[index] = 'X';
    setBoard(newBoard);

    const gameWinner = checkWinner(newBoard);
    if (gameWinner) {
      handleGameEnd(gameWinner);
    } else {
      setIsPlayerTurn(false);
      setStatusText('Mainframe Computing...');
    }
  };

  // AI turn sequence
  useEffect(() => {
    if (isPlayerTurn || winner) return;

    const timeout = setTimeout(() => {
      // Simple smart AI step logic:
      // 1. Try to win
      // 2. Try to block Player
      // 3. Take center/corners
      // 4. Random move
      const emptyCells = board.map((val, idx) => (val === null ? idx : null)).filter(val => val !== null) as number[];
      
      let targetIndex = -1;

      // Helper to evaluate mock moves
      const findBestMove = (symbol: string) => {
        for (let i = 0; i < emptyCells.length; i++) {
          const testBoard = [...board];
          testBoard[emptyCells[i]] = symbol;
          if (checkWinner(testBoard) === symbol) {
            return emptyCells[i];
          }
        }
        return -1;
      };

      // 1. Win
      targetIndex = findBestMove('O');
      
      // 2. Block
      if (targetIndex === -1) {
        targetIndex = findBestMove('X');
      }

      // 3. Center
      if (targetIndex === -1 && board[4] === null) {
        targetIndex = 4;
      }

      // 4. Random fall
      if (targetIndex === -1 && emptyCells.length > 0) {
        targetIndex = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      }

      if (targetIndex !== -1) {
        const newBoard = [...board];
        newBoard[targetIndex] = 'O';
        setBoard(newBoard);

        const nextWinner = checkWinner(newBoard);
        if (nextWinner) {
          handleGameEnd(nextWinner);
        } else {
          setIsPlayerTurn(true);
          setStatusText('Your Turn');
        }
      }
    }, 850);

    return () => clearTimeout(timeout);
  }, [isPlayerTurn, board, winner]);

  const handleGameEnd = (finalWinner: string) => {
    setWinner(finalWinner);
    
    let coins = 5;
    let xp = 20;

    if (finalWinner === 'X') {
      setStatusText('YOU DEFEATED THE MAINFRAME!');
      coins = 25;
      xp = 100;
      recordPlaySession('tic-tac-toe', 100, { wins: 1, losses: 0, coins, xp });
    } else if (finalWinner === 'O') {
      setStatusText('MAINFRAME WON. SYSTEM OVERRIDE.');
      coins = 2;
      xp = 10;
      recordPlaySession('tic-tac-toe', 10, { wins: 0, losses: 1, coins, xp });
    } else {
      setStatusText('TIE GAME. CODES BALANCED.');
      coins = 10;
      xp = 30;
      recordPlaySession('tic-tac-toe', 50, { wins: 0, losses: 0, coins, xp });
    }

    setCoinsEarned(coins);
    setXpEarned(xp);
  };

  const restartNewGame = () => {
    setBoard(Array(9).fill(null));
    setWinner(null);
    setIsPlayerTurn(true);
    setStatusText('Your Turn');
    setCoinsEarned(0);
    setXpEarned(0);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col md:flex-row gap-6 max-w-4xl mx-auto items-center md:items-start text-white">
      {/* Visual board grid */}
      <div className="flex flex-col items-center">
        {/* State Banner */}
        <div className={`px-4 py-2 rounded-lg font-mono text-xs w-full text-center border mb-4 transition ${
          winner === 'X' ? 'bg-emerald-950 border-emerald-500 text-emerald-300' :
          winner === 'O' ? 'bg-rose-950 border-rose-500 text-rose-300' :
          winner === 'Draw' ? 'bg-amber-950 border-amber-500 text-amber-300' :
          isPlayerTurn ? 'bg-cyan-950 border-cyan-800 text-cyan-300' : 'bg-slate-950 border-slate-800 text-slate-400'
        }`}>
          {statusText.toUpperCase()}
        </div>

        <div className="grid grid-cols-3 gap-3 p-3 bg-slate-950 border border-slate-800 rounded-xl max-w-[340px]">
          {board.map((cell, idx) => (
            <button
              key={idx}
              disabled={cell !== null || winner !== null || !isPlayerTurn}
              onClick={() => handleCellClick(idx)}
              className={`w-24 h-24 rounded-lg flex items-center justify-center font-black text-3xl transition relative overflow-hidden select-none active:scale-95 border ${
                cell === 'X' ? 'bg-cyan-950/40 border-cyan-500 text-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.2)]' :
                cell === 'O' ? 'bg-pink-950/40 border-pink-500 text-pink-400 shadow-[0_0_12px_rgba(236,72,153,0.2)]' :
                'bg-slate-900 border-slate-800 text-slate-600 hover:bg-slate-850 hover:border-slate-700'
              }`}
            >
              {cell === 'X' && (
                <span className="animate-pulse">X</span>
              )}
              {cell === 'O' && (
                <span className="animate-pulse">O</span>
              )}
              {cell === null && (
                <span className="opacity-0 hover:opacity-20 text-slate-300 transition-opacity">?</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Rewards and Description */}
      <div className="flex-grow w-full flex flex-col justify-between">
        <div>
          <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest block">Neural brain game</span>
          <h2 className="text-xl font-bold mt-1">Neon Matrix Grid</h2>
          <p className="text-xs text-slate-400 leading-relaxed mt-2">
            Match columns, rows or diagonal alignments on this retro 3x3 digital table. The AI has deep foresight and will try to trap your moves. Build a counter strategic block!
          </p>

          {/* Results Summary Box */}
          {winner && (
            <div className="mt-5 p-4 bg-slate-950 border border-slate-800 rounded-xl">
              <h4 className="text-xs font-mono text-slate-400 tracking-wider">GAME OVER DETAILS</h4>
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-1.5 text-yellow-400 font-mono text-sm font-bold">
                  <Coins className="w-4 h-4" />
                  <span>+{coinsEarned} Coins</span>
                </div>
                <div className="w-1 h-4 border-r border-slate-800"></div>
                <div className="flex items-center gap-1.5 text-cyan-400 font-mono text-sm font-bold">
                  <Trophy className="w-4 h-4" />
                  <span>+{xpEarned} XP</span>
                </div>
              </div>
              <button
                onClick={restartNewGame}
                className="w-full mt-4 py-2 hover:brightness-110 active:scale-95 bg-gradient-to-r from-cyan-600 to-purple-600 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                <span>PLAY AGAIN</span>
              </button>
            </div>
          )}

          {!winner && (
            <div className="mt-6 flex flex-col gap-3">
              <div className="flex items-center gap-3 bg-slate-950/50 p-2.5 rounded-lg border border-slate-800 text-xs">
                <User className="w-4 h-4 text-cyan-400" />
                <span className="text-slate-300">You operate the <strong className="text-cyan-400">X</strong> matrix tags</span>
              </div>
              <div className="flex items-center gap-3 bg-slate-950/50 p-2.5 rounded-lg border border-slate-800 text-xs">
                <Cpu className="w-4 h-4 text-pink-400" />
                <span className="text-slate-300">Arcade core computer owns the <strong className="text-pink-400">O</strong> tags</span>
              </div>
            </div>
          )}
        </div>

        {/* Quick Restart */}
        {!winner && (
          <button
            onClick={restartNewGame}
            className="mt-6 flex items-center justify-center gap-2 py-2 border border-slate-800 bg-slate-950/30 hover:bg-slate-900 transition-all rounded-lg text-slate-400 hover:text-white text-xs font-bold"
          >
            <RotateCcw className="w-4 h-4" />
            <span>RESET SYSTEM MATCH</span>
          </button>
        )}
      </div>
    </div>
  );
};
