import React, { useState } from 'react';
import { ArrowLeft, Star, Heart, Maximize2, Minimize2, Send, ShieldAlert, BadgeCheck } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { Game } from '../types';

// Games imports
import { SnakeGame } from './SnakeGame';
import { FlappyGame } from './FlappyGame';
import { TicTacToeGame } from './TicTacToeGame';
import { MemoryGame } from './MemoryGame';
import { SpaceShooterGame } from './SpaceShooterGame';
import { BrickBreakerGame } from './BrickBreakerGame';

export const PlayContainer: React.FC = () => {
  const { 
    selectedGame, 
    setSelectedGameById, 
    user, 
    reviews, 
    addReview, 
    toggleFavorite 
  } = useGame();

  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Custom review/rating state
  const [ratingInput, setRatingInput] = useState(5);
  const [commentText, setCommentText] = useState('');

  if (!selectedGame) return null;

  // Render correct built-in game
  const renderBuiltInGame = (id: string) => {
    switch (id) {
      case 'snake':
        return <SnakeGame />;
      case 'flappy':
        return <FlappyGame />;
      case 'tic-tac-toe':
        return <TicTacToeGame />;
      case 'memory':
        return <MemoryGame />;
      case 'space-shooter':
        return <SpaceShooterGame />;
      case 'brick-breaker':
        return <BrickBreakerGame />;
      default:
        return (
          <div className="p-8 text-center text-rose-400 border border-dashed border-rose-800 rounded-xl bg-rose-950/20 font-mono">
            Error: Built-in component for "{id}" was not registered. Check router configuration.
          </div>
        );
    }
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    addReview(selectedGame.id, ratingInput, commentText.trim());
    setCommentText('');
  };

  const isFavorite = user?.favorites.includes(selectedGame.id) || false;
  const gameReviews = reviews.filter((r) => r.gameId === selectedGame.id);

  return (
    <div className={`text-white min-h-screen ${isFullscreen ? 'fixed inset-0 bg-slate-950 z-50 p-4 md:p-6 overflow-y-auto' : 'py-6 px-4 md:px-8'}`}>
      <div className="max-w-6xl mx-auto">
        
        {/* Navigation / Header */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => {
              setIsFullscreen(false);
              setSelectedGameById(null);
            }}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-mono tracking-wider">EXIT WORKSPACE</span>
          </button>

          <div className="flex gap-2">
            {/* Favorite bookmark toggler */}
            {user && (
              <button
                onClick={() => toggleFavorite(selectedGame.id)}
                className={`p-2.5 rounded-xl border transition flex items-center justify-center ${
                  isFavorite 
                    ? 'bg-pink-900/30 border-pink-500/50 text-pink-500 hover:bg-pink-900/50' 
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-850'
                }`}
                title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-pink-500' : ''}`} />
              </button>
            )}

            {/* Theater frame toggler */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2.5 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl hover:bg-slate-850 transition flex items-center justify-center text-slate-400 hover:text-white"
              title={isFullscreen ? 'Exit Fullscreen' : 'Enable Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-5 h-5 text-yellow-500" /> : <Maximize2 className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Core Game Body */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Stage Panel (Left/Mid) */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="bg-slate-950 rounded-2xl border border-slate-800 p-4 shadow-2xl flex justify-center items-center overflow-hidden min-h-[440px]">
              {selectedGame.isPlayable ? (
                // Play Built-in Game
                <div className="w-full">
                  {renderBuiltInGame(selectedGame.id)}
                </div>
              ) : (
                // Embed Poki-style external Iframe Game
                <div className="w-full h-[450px] relative flex flex-col">
                  {/* Warning label */}
                  <div className="bg-cyan-950/60 border border-cyan-800/80 p-2 text-[11px] font-mono rounded-lg mb-3 flex items-center gap-2 text-cyan-300">
                    <BadgeCheck className="w-4 h-4 text-cyan-400" />
                    <span>EMBED MODE: Running "{selectedGame.title}" securely in sandboxed container viewport.</span>
                  </div>

                  <iframe
                    src={selectedGame.embedUrl || 'about:blank'}
                    title={selectedGame.title}
                    className="w-full flex-grow border-2 border-slate-800 rounded-xl shadow-xl"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    sandbox="allow-scripts allow-same-origin allow-popups"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}
            </div>

            {/* Title / Info Descriptions */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/50 border border-cyan-900 px-2.5 py-1 rounded-full uppercase">
                    {selectedGame.category}
                  </span>
                  <h1 className="text-2xl font-black mt-3 bg-gradient-to-r from-white via-slate-150 to-slate-400 bg-clip-text text-transparent">
                    {selectedGame.title}
                  </h1>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-center flex flex-col items-center">
                  <div className="flex items-center gap-1 text-yellow-400 font-bold text-lg">
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    <span>{selectedGame.rating}</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 mt-0.5">{selectedGame.ratingsCount} RATINGS</span>
                </div>
              </div>

              <p className="text-sm text-slate-400 mt-4 leading-relaxed">
                {selectedGame.description}
              </p>

              <div className="border-t border-slate-800/80 mt-6 pt-5 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs font-mono text-slate-400">
                <div>
                  <span className="block text-[10px] text-slate-500 uppercase">Interactive Type</span>
                  <span className="text-white mt-1 block font-bold">
                    {selectedGame.isPlayable ? '🔥 Built-In Native' : '🌐 Poki Web-Iframe'}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-500 uppercase">Hits Registered</span>
                  <span className="text-white mt-1 block font-bold">{selectedGame.plays.toLocaleString()} plays</span>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <span className="block text-[10px] text-slate-500 uppercase">Safety Rating</span>
                  <span className="text-emerald-400 mt-1 block font-bold">✅ Pegi-3 Safe Core</span>
                </div>
              </div>
            </div>
          </div>

          {/* Social Feedback / Review Panel (Right side) */}
          <div className="flex flex-col gap-6">
            
            {/* Create review comment box */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
              <h3 className="text-sm font-bold tracking-wide uppercase font-mono text-pink-400 border-b border-slate-800 pb-2 mb-4">
                Share Feedback
              </h3>

              {user ? (
                <form onSubmit={handleReviewSubmit} className="flex flex-col gap-4">
                  {/* Rating clicker digits */}
                  <div>
                    <label className="text-xs font-mono text-slate-400 block mb-2">SCORE MULTIPLIER:</label>
                    <div className="flex gap-1.5 bg-slate-950 p-2 rounded-xl border border-slate-800 justify-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRatingInput(star)}
                          className="p-1 px-[11px] rounded bg-slate-900 border border-slate-800 hover:border-yellow-500 transition-colors"
                        >
                          <Star 
                            className={`w-5 h-5 ${star <= ratingInput ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'}`} 
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Comment context */}
                  <div>
                    <label className="text-xs font-mono text-slate-400 block mb-2">WRITE REVIEW:</label>
                    <textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Discuss strategy, bugs or score targets..."
                      max-rows={4}
                      className="w-full text-xs p-3 bg-slate-950 border border-slate-800 rounded-xl focus:border-[#d946ef] focus:outline-none text-slate-150 leading-relaxed max-h-[100px]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="py-2.5 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl text-xs font-bold hover:brightness-110 active:scale-95 transition flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>POST LOG</span>
                  </button>
                </form>
              ) : (
                <div className="p-4 bg-slate-950 border border-slate-800 border-dashed rounded-xl text-center">
                  <ShieldAlert className="w-8 h-8 text-rose-500/80 mx-auto animate-bounce mb-2" />
                  <p className="text-xs text-slate-400 leading-relaxed">
                    You are in unauthenticated guest sandbox. Please Sign-In to submit reviews and rate retro arcade titles.
                  </p>
                </div>
              )}
            </div>

            {/* Current Review feeds list */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex-grow max-h-[400px] overflow-y-auto">
              <h3 className="text-sm font-bold tracking-wide uppercase font-mono text-cyan-400 border-b border-slate-800 pb-2 mb-4 flex justify-between items-center">
                <span>Player Logs Feed</span>
                <span className="text-xs font-semibold px-2 py-0.5 bg-cyan-950 text-cyan-300 rounded font-mono">
                  {gameReviews.length} logged
                </span>
              </h3>

              {gameReviews.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs font-mono">
                  Be the first to submit a review for this game!
                </div>
              ) : (
                <div className="space-y-4">
                  {gameReviews.map((rev) => (
                    <div key={rev.id} className="p-3 bg-slate-950 border border-slate-800/85 rounded-xl text-xs leading-relaxed transition-all hover:border-slate-700">
                      <div className="flex justify-between items-center mb-1.5">
                        <div className="flex items-center gap-1.5 font-bold text-white">
                          <span className="text-sm">{rev.avatar}</span>
                          <span className="font-mono text-slate-350">{rev.username}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-yellow-500 font-bold">
                          <Star className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />
                          <span className="font-mono text-[10px]">{rev.rating}.0</span>
                        </div>
                      </div>
                      <p className="text-slate-400 font-sans select-text">{rev.text}</p>
                      <span className="text-[9px] font-mono text-slate-650 block text-right mt-1.5">{rev.date}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
