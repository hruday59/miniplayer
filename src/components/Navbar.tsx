import React, { useState } from 'react';
import { Gamepad2, Search, Bell, Settings, User, LogOut, Coins, HelpCircle, ShieldAlert, Sparkles } from 'lucide-react';
import { useGame } from '../context/GameContext';

interface NavbarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  searchFilter: string;
  setSearchFilter: (term: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  activeView, 
  setActiveView, 
  searchFilter, 
  setSearchFilter 
}) => {
  const { user, logout, notifications, markNotificationsRead, selectedGame, setSelectedGameById } = useGame();
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleLogoClick = () => {
    setSelectedGameById(null);
    setActiveView('home');
  };

  return (
    <nav className="sticky top-0 z-40 bg-[#0B0E14]/85 backdrop-blur-md border-b border-white/5 shadow-lg select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo Brand */}
          <div 
            onClick={handleLogoClick}
            className="flex items-center gap-2 cursor-pointer select-none group text-white-100"
          >
            <div className="w-10 h-10 bg-gradient-to-tr from-[#FF00FF] to-[#00FFFF] rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20 duration-350 transition-all group-hover:rotate-12 group-hover:scale-105 active:scale-95">
              <Gamepad2 className="w-5 h-5 text-white stroke-[2.5]" />
            </div>
            <div className="hidden sm:block">
              <span className="font-black text-xl tracking-tighter uppercase block neon-text text-white">
                APPY<span className="text-[#00FFFF]">DAY</span>
              </span>
              <span className="text-[9px] font-mono tracking-widest text-[#FF00FF] block uppercase font-bold -mt-1 font-semibold">
                ARCADE PORTS
              </span>
            </div>
          </div>

          {/* Catalog Search Bar */}
          <div className="flex-grow max-w-md hidden md:block">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-white/30">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="Search retro built-ins and Poki embeds..."
                value={searchFilter}
                onChange={(e) => {
                  setSearchFilter(e.target.value);
                  if (activeView !== 'home') {
                    setSelectedGameById(null);
                    setActiveView('home');
                  }
                }}
                className="w-full text-xs bg-white/5 border border-white/10 rounded-full py-2.5 pl-10 pr-4 text-[#E0E6ED] placeholder-white/30 focus:outline-none focus:border-[#00FFFF]/50 transition-colors shadow-inner"
              />
            </div>
          </div>

          {/* Navigation Items (Shortcuts) */}
          <div className="flex items-center gap-2.5 text-white">
            <button
              onClick={() => { setSelectedGameById(null); setActiveView('home'); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide font-mono transition-all ${
                activeView === 'home' && !selectedGame 
                  ? 'bg-gradient-to-r from-[#00FFFF]/10 to-transparent border-l-2 border-[#00FFFF] text-[#00FFFF]' 
                  : 'text-white/60 hover:text-white'
              }`}
            >
              ARCADE
            </button>
            <button
              onClick={() => { setSelectedGameById(null); setActiveView('social'); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide font-mono transition-all ${
                activeView === 'social' 
                  ? 'bg-gradient-to-r from-[#FF00FF]/10 to-transparent border-l-2 border-[#FF00FF] text-[#FF00FF]' 
                  : 'text-white/60 hover:text-white'
              }`}
            >
              LOBBY
            </button>
            <button
              onClick={() => { setSelectedGameById(null); setActiveView('settings'); }}
              className={`p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/60 hover:text-white transition ${
                activeView === 'settings' ? 'text-[#facc15] border-[#facc15]/40 bg-white/10' : ''
              }`}
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Notifications Alert Dropdown */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => {
                    setShowNotifMenu(!showNotifMenu);
                    if (!showNotifMenu) markNotificationsRead();
                  }}
                  className={`p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/60 hover:text-white transition relative ${
                    showNotifMenu ? 'border-[#00FFFF]/50 bg-white/10' : ''
                  }`}
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#FF00FF] text-[9px] font-bold flex items-center justify-center animate-pulse text-white">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Dropdown context list */}
                {showNotifMenu && (
                  <div className="absolute right-0 mt-3 w-80 bg-[#0D111A] border border-white/10 rounded-2xl shadow-2xl overflow-hidden py-1 z-50">
                    <div className="flex justify-between items-center px-4 py-2 bg-white/5 border-b border-white/5">
                      <span className="text-xs font-bold font-mono tracking-wider text-white/40 uppercase">Alert Logs</span>
                    </div>
                    <div className="max-h-[300px] overflow-y-auto divide-y divide-white/5">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-white/30 text-xs font-mono">No new notifications</div>
                      ) : (
                        notifications.map((n) => (
                          <div key={n.id} className="p-3.5 hover:bg-white/5 transition">
                            <div className="flex justify-between items-start">
                              <span className={`text-[10px] font-mono uppercase font-bold tracking-wider ${
                                n.type === 'achievement' ? 'text-[#facc15]' :
                                n.type === 'gift' ? 'text-[#FF00FF]' :
                                n.type === 'social' ? 'text-[#00FFFF]' : 'text-slate-400'
                              }`}>
                                {n.type}
                              </span>
                              <span className="text-[9px] font-mono text-white/40">{n.timestamp}</span>
                            </div>
                            <h4 className="text-xs font-bold text-slate-200 mt-1">{n.title}</h4>
                            <p className="text-[11px] text-[#E0E6ED]/70 leading-normal mt-0.5">{n.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Profile badge status */}
            {user ? (
              <div className="flex items-center gap-2.5 bg-white/5 border border-white/10 pl-3 pr-1.5 py-1 rounded-full text-xs">
                {/* Coins Counter */}
                <div className="flex items-center bg-yellow-500/10 border border-yellow-500/20 px-2.5 py-1 rounded-full" title={`${user.coins} Coins`}>
                  <Coins className="w-3.5 h-3.5 text-[#facc15] mr-1.5" />
                  <span className="font-extrabold font-mono text-[#facc15]">{user.coins}</span>
                </div>

                {/* Profile Avatar trigger */}
                <button
                  onClick={() => { setSelectedGameById(null); setActiveView('profile'); }}
                  className="flex items-center gap-2 hover:opacity-85 transition group"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#00FFFF] to-[#FF00FF] flex items-center justify-center text-sm border border-white/20">
                    {user.avatar}
                  </div>
                  <span className="font-mono font-semibold text-[#E0E6ED] hidden lg:inline max-w-[80px] truncate group-hover:text-white">
                    {user.username}
                  </span>
                </button>

                <button
                  onClick={logout}
                  className="p-1.5 hover:bg-white/10 text-white/40 hover:text-[#FF00FF] rounded-full transition"
                  title="Logout"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => { setSelectedGameById(null); setActiveView('auth'); }}
                className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-[#00FFFF] to-[#FF00FF] hover:brightness-110 rounded-full text-xs font-bold tracking-wider font-mono shadow-lg shadow-cyan-500/10 transition transform hover:scale-102 active:scale-95 text-white"
              >
                <User className="w-4 h-4" />
                <span>SIGN IN</span>
              </button>
            )}

          </div>

        </div>
      </div>
    </nav>
  );
};
