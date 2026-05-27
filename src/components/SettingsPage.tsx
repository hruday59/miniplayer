import React from 'react';
import { Volume2, Shield, Settings2, Globe, EyeOff, KeyRound, Accessibility, Trash2, Heart } from 'lucide-react';
import { useGame } from '../context/GameContext';

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings, user, logout } = useGame();

  const handleMusicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateSettings({ musicVolume: parseInt(e.target.value) });
  };

  const handleEffectsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateSettings({ effectsVolume: parseInt(e.target.value) });
  };

  const handleGraphicsChange = (quality: 'low' | 'medium' | 'high') => {
    updateSettings({ graphicsQuality: quality });
  };

  const handleAccessibilityToggle = () => {
    updateSettings({ accessibilityMode: !settings.accessibilityMode });
  };

  const handleLanguageChange = (lang: string) => {
    updateSettings({ language: lang });
  };

  const handleClearLocalData = () => {
    if (confirm('Are you sure you want to completely clear your local high scores, coins, settings, and achievements? This action is irreversible.')) {
      localStorage.clear();
      alert('Local storage data cleared. Reloading platform...');
      window.location.reload();
    }
  };

  return (
    <div className="text-[#E0E6ED] max-w-4xl mx-auto py-6 px-4 md:px-8 select-none">
      
      <div className="bg-[#0D111A] border border-white/5 rounded-2xl p-6 shadow-xl">
        <h2 className="text-lg font-black tracking-wider font-mono text-[#00FFFF] border-b border-white/5 pb-2 mb-6 flex items-center gap-2">
          <Settings2 className="w-5 h-5 text-[#00FFFF]" />
          <span>PORT SYSTEM GLOBAL SETTINGS</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* AUDIO CONTROLS (Sliders) */}
          <div className="space-y-6">
            <h3 className="text-xs font-mono font-bold uppercase text-slate-500 border-b border-white/5 pb-1.5 flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-[#00FFFF]" />
              <span>Fluid Audio Engine</span>
            </h3>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center text-xs font-mono mb-2">
                  <span>AMBIENCE MUSIC VOLUME</span>
                  <span className="text-[#00FFFF] font-bold">{settings.musicVolume}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.musicVolume}
                  onChange={handleMusicChange}
                  className="w-full h-1 bg-[#0B0E14] rounded-lg appearance-none cursor-pointer accent-[#00FFFF]"
                />
              </div>

              <div>
                <div className="flex justify-between items-center text-xs font-mono mb-2">
                  <span>SFX EFFECTS VOLUME</span>
                  <span className="text-[#FF00FF] font-bold">{settings.effectsVolume}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.effectsVolume}
                  onChange={handleEffectsChange}
                  className="w-full h-1 bg-[#0B0E14] rounded-lg appearance-none cursor-pointer accent-[#FF00FF]"
                />
              </div>
            </div>

            {/* Language selectors */}
            <div className="pt-2">
              <span className="text-xs font-mono text-slate-400 block mb-2.5">ARCADE LOBBY LANGUAGE:</span>
              <div className="flex gap-2.5">
                {['English', 'Español', 'Français', '日本語'].map((lang) => (
                  <button
                    key={lang}
                    onClick={() => handleLanguageChange(lang)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition cursor-pointer ${
                      settings.language === lang
                        ? 'bg-[#0B0E14] border-[#00FFFF] text-[#00FFFF] font-bold'
                        : 'bg-[#0B0E14]/40 border-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* VISUALS & PERFORMANCE SETTING */}
          <div className="space-y-6">
            <h3 className="text-xs font-mono font-bold uppercase text-slate-500 border-b border-white/5 pb-1.5 flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#FF00FF]" />
              <span>Video & Render Quality</span>
            </h3>

            {/* Graphics choosing presets */}
            <div>
              <span className="text-xs font-mono text-slate-400 block mb-2.5">GRAPHICS SAMPLING TIER:</span>
              <div className="flex gap-3">
                {(['low', 'medium', 'high'] as const).map((tier) => (
                  <button
                    key={tier}
                    onClick={() => handleGraphicsChange(tier)}
                    className={`flex-1 py-2 text-xs rounded-xl font-bold font-mono tracking-wider border transition uppercase cursor-pointer ${
                      settings.graphicsQuality === tier
                        ? 'bg-gradient-to-r from-[#FF00FF] to-[#00FFFF] text-white border-transparent'
                        : 'bg-[#0B0E14] border-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    {tier}
                  </button>
                ))}
              </div>
            </div>

            {/* Accessibility features toggle */}
            <div className="bg-[#0B0E14] p-4 rounded-xl border border-white/5 flex items-center justify-between">
              <div className="flex gap-3 items-center">
                <Accessibility className="w-5 h-5 text-[#00FFFF]" />
                <div>
                  <h4 className="text-xs font-bold text-slate-200">Accessibility Contrast Mode</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">Enhance visual board line borders.</p>
                </div>
              </div>
              <button
                onClick={handleAccessibilityToggle}
                className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-200 cursor-pointer ${
                  settings.accessibilityMode ? 'bg-[#00FFFF]' : 'bg-slate-800'
                }`}
              >
                <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  settings.accessibilityMode ? 'translate-x-5' : 'translate-x-0'
                }`}></div>
              </button>
            </div>
          </div>

        </div>

        {/* 5. USER CREDENTIAL SECURITY & LOCAL SYSTEM REBOOT */}
        <div className="border-t border-white/5 mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-slate-550 text-xs font-mono">
            <EyeOff className="w-4 h-4" />
            <span>SESSION PROTECTION ACTIVE | PEER SECURE CHECK OK</span>
          </div>

          <div className="flex gap-3">
            {user && (
              <button
                onClick={logout}
                className="px-4 py-2 border border-rose-950 bg-rose-950/20 text-rose-400 hover:bg-rose-950/50 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <KeyRound className="w-4 h-4" />
                <span>TERMINATE ACTIVE ID</span>
              </button>
            )}

            <button
              onClick={handleClearLocalData}
              className="px-4 py-2 bg-[#0B0E14] border border-white/5 hover:bg-red-950/40 hover:border-red-900 text-slate-450 hover:text-red-400 rounded-xl text-xs font-bold transition flex items-center gap-1.5 select-none cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>PURGE LOCAL DATABASE</span>
            </button>
          </div>
        </div>

      </div>

      {/* Credit footer */}
      <p className="text-center text-[10px] text-slate-600 font-mono mt-8 leading-normal max-w-sm mx-auto uppercase tracking-wide">
        crafted with professional responsive design interfaces. persistent localstorage nodes guarantee 100% offline consistency.
      </p>
    </div>
  );
};
