import React, { useState } from 'react';
import { Play, Star, Calendar, Sparkles, Filter, Search, Award, Flame, Zap, HelpCircle } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { Game } from '../types';

interface HeroProps {
  searchFilter: string;
  setSearchFilter: (term: string) => void;
  setActiveView: (view: string) => void;
}

export const HeroSection: React.FC<HeroProps> = ({ 
  searchFilter, 
  setSearchFilter,
  setActiveView
}) => {
  const { games, setSelectedGameById, user, dailySpinClaimed } = useGame();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Arcade', 'Action', 'Puzzle', 'Shooter', 'Card'];

  // Filter criteria
  const filteredGames = games.filter((game) => {
    const matchesSearch = game.title.toLowerCase().includes(searchFilter.toLowerCase()) || 
                          game.description.toLowerCase().includes(searchFilter.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || game.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="text-[#E0E6ED] select-none">
      
      {/* 1. STYLIZED ARCADE HERO PROMOTIONAL BANNER */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#0D111A] via-[#0B0E14] to-[#0D111A] border border-white/5 rounded-3xl p-6 md:p-8 mb-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-[#FF00FF]/10 via-[#00FFFF]/5 to-[#FF00FF]/10 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-[#00FFFF]/10 via-[#FF00FF]/5 to-[#00FFFF]/10 rounded-full blur-[80px] pointer-events-none"></div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center relative z-10">
          
          {/* Hero Headline CTA */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 bg-[#FF00FF]/10 border border-[#FF00FF]/30 text-[#FF00FF] text-[10px] font-bold font-mono tracking-widest rounded-full uppercase flex items-center gap-1.5 shadow-[0_0_10px_rgba(255,0,255,0.15)]">
                <Flame className="w-3.5 h-3.5 animate-pulse" />
                <span>SEASONAL TOURNAMENT LIVE</span>
              </span>
            </div>
            
            <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-none text-white">
              THE CASUAL <br className="hidden sm:inline" />
              <span className="text-[#00FFFF] font-black drop-shadow-[0_0_10px_rgba(0,255,255,0.4)]">ARCADE REVOLUTION</span>
            </h1>

            <p className="text-xs md:text-sm text-[#E0E6ED]/70 mt-4 max-w-xl leading-relaxed">
              Play modular instant casual mini-games natively with zero downloads or redirects. Level up your XP, unlock rare achievements, claim daily spins, and scale global leaderboards easily!
            </p>

            <div className="flex flex-wrap gap-3 mt-6">
              <button
                onClick={() => setSelectedGameById('space-shooter')}
                className="px-6 py-3 bg-gradient-to-r from-[#FF00FF] to-[#00FFFF] rounded-xl font-black text-xs tracking-wider shadow-lg shadow-cyan-500/15 hover:brightness-110 active:scale-95 transition flex items-center gap-1.5 text-white"
              >
                <Play className="w-4 h-4 fill-white text-white" />
                <span>PLAY FEATURED TITLE</span>
              </button>
              
              {!dailySpinClaimed && user && (
                <button
                  onClick={() => setActiveView('profile')}
                  className="px-5 py-3 bg-white/5 hover:bg-white/10 text-[#facc15] rounded-xl font-bold font-mono text-xs border border-[#facc15]/30 hover:border-[#facc15]/60 transition-all flex items-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4 text-[#facc15] animate-spin" />
                  <span>CLAIM FREE SPIN REWARD!</span>
                </button>
              )}
            </div>
          </div>

          {/* Gamified Bento teaser widget (Right column) */}
          <div className="bg-[#0D111A]/80 border border-white/5 p-5 rounded-2xl flex flex-col justify-between h-full hover:border-[#FF00FF]/40 transition duration-300">
            <div>
              <div className="flex justify-between items-center pb-2 border-b border-white/5 text-xs font-mono text-slate-400">
                <span className="flex items-center gap-1 text-[#FF00FF] font-bold">
                  <Award className="w-4 h-4 text-[#FF00FF]" />
                  BATTLE PASS S1
                </span>
                <span className="text-[#00FFFF] font-bold">LVL {user ? Math.floor(user.xp / 100) + 1 : '1'}</span>
              </div>
              <div className="mt-3">
                <h4 className="text-xs font-bold text-white-100">Weekly Combat Streak</h4>
                <p className="text-[10px] text-slate-400 mt-1">Play any 3 arcade series this week for an automatic +50 coins gift drop.</p>
              </div>
            </div>

            <div className="mt-6">
              <div className="w-full bg-[#0B0E14] rounded-full h-1.5 overflow-hidden border border-white/5 mb-2.5">
                <div 
                  style={{ width: user ? `${(user.xp % 100)}%` : '20%' }}
                  className="bg-gradient-to-r from-[#FF00FF] to-[#00FFFF] h-full shadow-[0_0_8px_rgba(255,0,255,0.5)]"
                ></div>
              </div>
              <div className="flex justify-between items-center text-[10px] font-mono text-slate-500">
                <span>{user ? user.xp % 100 : '20'}/100 XP TO PASS UP</span>
                <span className="text-[#00FFFF] font-bold">SPINS RESET DAILY</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 2. HOT CATEGORIES SCROLL / SHORTCUTS BAR */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        {/* Categories Pill filters */}
        <div className="flex flex-wrap gap-2.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold font-mono tracking-wide border transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-gradient-to-r from-[#FF00FF] to-[#00FFFF] text-white border-transparent shadow-md shadow-pink-500/10'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:border-white/20'
              }`}
            >
              {cat === 'All' ? '🎮 ALL TITLES' : cat.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Dynamic Items count indicator */}
        <div className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-[#00FFFF]" />
          <span>INDEXING: <strong className="text-[#00FFFF] font-bold">{filteredGames.length}</strong> CASUAL PORTS</span>
        </div>
      </div>

      {/* 3. GAMES GRID CATALOGUE */}
      {filteredGames.length === 0 ? (
        <div className="py-24 text-center border-2 border-dashed border-white/5 bg-[#0D111A]/50 rounded-3xl p-8 max-w-lg mx-auto">
          <Search className="w-12 h-12 text-slate-600 mx-auto animate-bounce mb-3" />
          <h3 className="text-base font-bold text-[#E0E6ED]">No Arcade Records Found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
            We couldn't locate any game records matching your keyword "{searchFilter}" under category "{selectedCategory}". Add custom embeds via the administrator panel.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredGames.map((game) => (
            <div
              key={game.id}
              onClick={() => setSelectedGameById(game.id)}
              className="bg-[#0D111A] border border-white/5 hover:border-[#00FFFF]/50 rounded-2xl overflow-hidden cursor-pointer flex flex-col justify-between shadow-lg duration-350 transform hover:-translate-y-1.5 hover:shadow-[0_10px_20px_rgba(0,255,255,0.12)] group"
            >
              
              {/* Product Hero image layer */}
              <div className="relative overflow-hidden aspect-[4/3] bg-slate-950">
                <img
                  src={game.imageUrl}
                  alt={game.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 duration-500 transition-transform"
                />
                
                {/* Visual Category absolute tags */}
                <div className="absolute top-2.5 left-2.5">
                  <span className="text-[9px] font-bold font-mono tracking-wider text-slate-100 px-2.5 py-0.5 bg-[#0B0E14]/85 backdrop-blur-md rounded-full border border-white/10">
                    {game.category.toUpperCase()}
                  </span>
                </div>

                {/* Rating overlay absolute flags */}
                <div className="absolute top-2.5 right-2.5">
                  <span className="text-[9px] font-bold px-2 py-0.5 bg-[#facc15] text-slate-950 rounded font-mono flex items-center gap-1 shadow-lg">
                    <Star className="w-3 h-3 fill-slate-950 stroke-[0]" />
                    <span>{game.rating}</span>
                  </span>
                </div>
              </div>

              {/* Text Description payload */}
              <div className="p-4.5 flex-grow flex flex-col justify-between">
                <div>
                  <h3 className="font-extrabold text-sm text-slate-100 group-hover:text-[#00FFFF] transition-colors line-clamp-1">
                    {game.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 mb-4 leading-relaxed line-clamp-2">
                    {game.description}
                  </p>
                </div>

                {/* Bottom interactive metadata */}
                <div className="flex items-center justify-between mt-auto border-t border-white/5 pt-3 text-[10px] font-mono text-slate-500">
                  <span className="uppercase">{game.plays.toLocaleString()} Plays</span>
                  <span className="flex items-center gap-1 text-[#00FFFF] font-bold group-hover:translate-x-1 transition-transform">
                    <span>LAUNCH PORT</span>
                    <Play className="w-3 h-3 fill-[#00FFFF] text-[#00FFFF] stroke-[0]" />
                  </span>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
};
