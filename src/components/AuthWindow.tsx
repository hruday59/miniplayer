import React, { useState } from 'react';
import { User, LogIn, Lock, Mail, ShieldAlert, Sparkles, UserCheck } from 'lucide-react';
import { useGame } from '../context/GameContext';

export const AuthWindow: React.FC = () => {
  const { login, signup, loginAsGuest } = useGame();

  const [isLoginView, setIsLoginView] = useState(true);
  const [usernameInput, setUsernameInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameInput.trim()) return;

    if (isLoginView) {
      login(usernameInput.trim(), passwordInput.trim());
    } else {
      signup(usernameInput.trim(), emailInput.trim(), passwordInput.trim());
    }
  };

  // Simulates instantaneous secure OAuth login
  const handleGoogleSignIn = () => {
    const googleNames = ['SpacePilot_Alpha', 'RetroQueen_Core', 'PixelNinja', 'LazerWarlock', 'CyberSamurai'];
    const chosenName = googleNames[Math.floor(Math.random() * googleNames.length)];
    login(chosenName);
  };

  return (
    <div className="text-[#E0E6ED] min-h-[calc(100vh-100px)] flex items-center justify-center py-12 px-4 select-none">
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
        <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-[#00FFFF] rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute top-2/3 right-1/3 w-80 h-80 bg-[#FF00FF] rounded-full blur-[100px] animate-pulse delay-500"></div>
      </div>

      <div className="w-full max-w-sm bg-[#0D111A] border border-white/5 rounded-3xl p-6 shadow-2xl relative z-15 hover:border-[#00FFFF]/30 transition-all duration-300">
        
        {/* Visual Brand logo */}
        <div className="text-center mb-6">
          <div className="inline-flex w-12 h-12 bg-gradient-to-tr from-[#00FFFF] via-[#FF00FF] to-purple-600 rounded-2xl items-center justify-center text-xl font-bold font-mono animate-pulse shadow-lg mb-3">
            🎮
          </div>
          <h2 className="text-lg font-black tracking-tighter uppercase text-white">
            {isLoginView ? 'Welcome BACK ARCADER!' : 'CREATE SYSTEM LOG ID'}
          </h2>
          <p className="text-[11px] text-slate-400 mt-1 font-mono uppercase tracking-wider">
            {isLoginView ? 'Access your stats database' : 'Sync your games progression'}
          </p>
        </div>

        {/* Regular Account Form entry */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block mb-1.5">Arcader Name:</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 pointer-events-none">
                <User className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Enter gamer username..."
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                maxLength={16}
                required
                className="w-full text-xs p-2.5 pl-10 bg-[#0B0E14] border border-white/5 rounded-xl focus:border-[#00FFFF] focus:outline-none text-white"
              />
            </div>
          </div>

          {!isLoginView && (
            <div>
              <label className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block mb-1.5">Email Address:</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 pointer-events-none">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  placeholder="Enter email to verify updates..."
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full text-xs p-2.5 pl-10 bg-[#0B0E14] border border-white/5 rounded-xl focus:border-[#00FFFF] focus:outline-none text-white"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block mb-1.5">Access Codes (Password):</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 pointer-events-none">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                placeholder="••••••••"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                required
                className="w-full text-xs p-2.5 pl-10 bg-[#0B0E14] border border-white/5 rounded-xl focus:border-[#FF00FF] focus:outline-none text-white"
              />
            </div>
          </div>

          {/* Remember me & Forget link row */}
          <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 pt-1">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
                className="accent-[#00FFFF] bg-[#0B0E14] border border-white/5 rounded text-white"
              />
              <span>Remember ID</span>
            </label>
            <button
              type="button"
              onClick={() => alert('Access code recovery logs dispatched. Please verify with local administration.')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Reset Codes?
            </button>
          </div>

          {/* Form Action submit button */}
          <button
            type="submit"
            className="w-full mt-4 py-2.5 bg-gradient-to-r from-[#FF00FF] to-[#00FFFF] hover:brightness-110 rounded-xl text-xs font-bold font-mono tracking-widest active:scale-95 transition-all text-white shadow-lg cursor-pointer"
          >
            {isLoginView ? 'TRANSMIT SIGN IN 🚀' : 'INITIALIZE ACCOUNT ⭐️'}
          </button>
        </form>

        {/* Separator block */}
        <div className="relative my-5 flex items-center justify-center">
          <div className="absolute w-full border-b border-white/5"></div>
          <span className="relative px-3 text-[10px] font-mono text-slate-505 bg-[#0D111A] uppercase">Or alternative methods</span>
        </div>

        {/* Google Mock OAuth and Guest play buttons */}
        <div className="space-y-2.5">
          <button
            onClick={handleGoogleSignIn}
            className="w-full py-2 bg-[#0B0E14] hover:bg-[#0B0E14]/80 border border-white/5 text-xs font-mono font-bold rounded-xl transition flex items-center justify-center gap-2 text-slate-200 cursor-pointer"
          >
            <span className="text-xs">🌐</span>
            <span>Authenticate Google Sync</span>
          </button>

          <button
            onClick={loginAsGuest}
            className="w-full py-2 bg-[#0B0E14]/50 hover:bg-[#0B0E14]/80 border border-white/5 text-xs font-mono rounded-xl transition flex items-center justify-center gap-1.5 text-slate-400 hover:text-white cursor-pointer"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Engage instant Guest sandbox</span>
          </button>
        </div>

        {/* Switch Login / Signup view link */}
        <p className="text-center text-[11px] font-mono text-slate-400 mt-6 pt-1 border-t border-white/5">
          {isLoginView ? 'Do not hold active codes? ' : 'Hold pre-existing portal keys? '}
          <button
            onClick={() => setIsLoginView(!isLoginView)}
            className="text-[#00FFFF] font-bold hover:underline cursor-pointer"
          >
            {isLoginView ? 'SIGN UP HERE' : 'LOGIN HERE'}
          </button>
        </p>

      </div>
    </div>
  );
};
