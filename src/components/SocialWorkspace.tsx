import React, { useState } from 'react';
import { Send, Star, Trophy, Users, Award, Shield, UserCheck, MessageSquare, Flame } from 'lucide-react';
import { useGame } from '../context/GameContext';

export const SocialWorkspace: React.FC = () => {
  const { user, chatMessages, sendChatMessage, friends } = useGame();
  
  const [chatInput, setChatInput] = useState('');

  // Quick Emoji reactions
  const QUICK_EMOJIS = ['🔥', '🎮', '👑', '🎉', '🏆', '👀', '💀', '😱'];

  // Mock global arcade leaderboard participants
  const LEADERBOARD_ENTRIES = [
    { username: 'CyberGamer_Apex', avatar: '🦁', rank: 'Platinum Champion', level: 14, xp: 1480, coins: 340 },
    { username: 'RetroSlayer_99', avatar: '👾', rank: 'Gold Vanguard', level: 11, xp: 1150, coins: 210 },
    { username: 'SpeedRunner_Pro', avatar: '🐱', rank: 'Gold Vanguard', level: 9, xp: 940, coins: 180 },
    { username: 'PixelMaster', avatar: '🕹️', rank: 'Silver Tactician', level: 6, xp: 580, coins: 95 },
    { username: 'LudoMaster', avatar: '🦉', rank: 'Silver Tactician', level: 4, xp: 420, coins: 60 },
  ];

  // Insert current user dynamic rank if authenticated
  const finalLeaderboard = [...LEADERBOARD_ENTRIES];
  if (user) {
    const userLvl = Math.floor(user.xp / 100) + 1;
    const exists = finalLeaderboard.some(l => l.username === user.username);
    if (!exists) {
      finalLeaderboard.push({
        username: user.username,
        avatar: user.avatar,
        rank: user.rank,
        level: userLvl,
        xp: user.xp,
        coins: user.coins
      });
    }
  }

  // Sort by highest XP
  const sortedLeaderboard = finalLeaderboard.sort((a, b) => b.xp - a.xp);

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    sendChatMessage(chatInput.trim());
    setChatInput('');
  };

  const handleQuickEmoji = (emoji: string) => {
    sendChatMessage(emoji);
  };

  return (
    <div className="text-[#E0E6ED] max-w-7xl mx-auto py-6 px-4 md:px-8 select-none">
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEADERBOARD (Left/Middle Column) */}
        <div className="lg:col-span-2 bg-[#0D111A] border border-white/5 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-black tracking-wider font-mono text-[#00FFFF] border-b border-white/5 pb-2 mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500 fill-yellow-500" />
              <span>GLOBAL ARCADE LEADERBOARD</span>
            </h2>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              Real-time synchronization with general database ranks. Earn XP by beating high scores globally in any built-in titles!
            </p>

            <div className="space-y-3">
              {sortedLeaderboard.map((player, idx) => {
                const isCurrentUser = user && player.username === user.username;
                return (
                  <div 
                    key={player.username}
                    className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                      isCurrentUser 
                        ? 'bg-gradient-to-r from-[#00FFFF]/10 via-[#0D111A] to-[#00FFFF]/5 border-[#00FFFF]/30 shadow-[0_0_10px_rgba(0,255,255,0.05)]' 
                        : 'bg-[#0B0E14] border-white/5 hover:border-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Rank digit badge */}
                      <span className={`w-6 text-center font-mono font-black text-xs ${
                        idx === 0 ? 'text-yellow-400' :
                        idx === 1 ? 'text-slate-350' :
                        idx === 2 ? 'text-amber-500' : 'text-slate-500'
                      }`}>
                        #{idx + 1}
                      </span>

                      {/* Avatar character */}
                      <div className="w-9 h-9 rounded-full bg-[#0B0E14] border border-white/5 flex items-center justify-center text-lg">
                        {player.avatar}
                      </div>

                      {/* Player tags */}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold ${isCurrentUser ? 'text-[#00FFFF]' : 'text-white'}`}>
                            {player.username}
                          </span>
                          {isCurrentUser && (
                            <span className="text-[8px] font-mono font-bold bg-[#00FFFF]/10 text-[#00FFFF] border border-[#00FFFF]/20 px-1.5 py-0.5 rounded uppercase">
                              you
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-mono text-slate-500 uppercase block">{player.rank}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 font-mono text-xs text-right">
                      <div className="hidden sm:block">
                        <span className="text-slate-550 text-[10px] block uppercase">XP BALANCE</span>
                        <span className="text-[#00FFFF] font-extrabold">{player.xp} XP</span>
                      </div>
                      <div>
                        <span className="text-slate-550 text-[10px] block uppercase">LEVEL</span>
                        <span className="text-yellow-400 font-bold">LVL {player.level}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-8 bg-[#0B0E14]/70 p-4 rounded-xl border border-white/5 flex gap-4 text-xs select-text">
            <Award className="w-10 h-10 text-[#00FFFF]" />
            <div>
              <h4 className="font-bold text-slate-200">How do Ranks calculate?</h4>
              <p className="text-[11px] text-slate-400 leading-normal mt-1">
                Bronze starts at 100 XP, Silver at 300 XP, Gold starts at 600 XP, and elite Grandmaster Champion is unlocked when achieving more than 1000 accumulated XP.
              </p>
            </div>
          </div>
        </div>

        {/* INTERACTIVE CHAT CABINET (Right Column) */}
        <div className="bg-[#0D111A] border border-white/5 rounded-2xl p-5 shadow-xl flex flex-col justify-between h-[560px]">
          
          <div className="flex flex-col flex-grow overflow-hidden">
            <h2 className="text-sm font-bold tracking-wider font-mono text-[#FF00FF] border-b border-white/5 pb-2 mb-4 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <MessageSquare className="w-4.5 h-4.5 text-[#FF00FF]" />
                <span>ARCADE LOBBY CHAT</span>
              </span>
              <span className="text-[10px] bg-[#0B0E14] px-2 py-0.5 border border-white/5 rounded text-emerald-400 flex items-center gap-1 font-mono">
                ● 27 ACTIVE
              </span>
            </h2>

            {/* Chat list viewport */}
            <div className="flex-grow overflow-y-auto space-y-3.5 pr-1 py-2 divide-y divide-white/5 max-h-[350px]">
              {chatMessages.map((msg) => (
                <div key={msg.id} className="pt-3.5 first:pt-0">
                  <div className="flex items-center gap-2 mb-1 justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs">{msg.avatar}</span>
                      <span className="font-mono text-xs font-bold text-slate-300">{msg.sender}</span>
                    </div>
                    <span className="text-[9px] font-mono text-slate-600">{msg.timestamp}</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed font-sans select-text pl-5">{msg.text}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            {/* Quick reaction emojis drawer */}
            <div className="border-t border-white/5 pt-3 mb-3">
              <span className="text-[9px] font-mono text-slate-500 uppercase block mb-1.5">Quick React:</span>
              <div className="flex gap-2 justify-between">
                {QUICK_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleQuickEmoji(emoji)}
                    disabled={!user}
                    className="p-1 text-sm bg-[#0B0E14] border border-white/5 rounded hover:border-[#FF00FF] transition active:scale-95 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Chat controls sender form */}
            {user ? (
              <form onSubmit={handleChatSubmit} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Communicate with arcade lobby..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="flex-grow text-xs bg-[#0B0E14] border border-white/5 focus:border-[#FF00FF] focus:outline-none p-2.5 rounded-xl text-slate-200"
                />
                <button
                  type="submit"
                  className="p-2.5 bg-gradient-to-r from-[#FF00FF] to-[#00FFFF] rounded-xl hover:brightness-110 active:scale-95 transition cursor-pointer"
                >
                  <Send className="w-4 h-4 text-white" />
                </button>
              </form>
            ) : (
              <div className="p-3 bg-[#0B0E14]/40 border border-white/5 border-dashed rounded-xl text-center">
                <p className="text-[10px] text-slate-400">
                  Please Sign-In with an active account to transmit messages to the lobby chat.
                </p>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
