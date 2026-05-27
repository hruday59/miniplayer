/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { GameProvider, useGame } from './context/GameContext';
import { Navbar } from './components/Navbar';
import { SplashScreen } from './components/SplashScreen';
import { HeroSection } from './components/HeroSection';
import { PlayContainer } from './games/PlayContainer';
import { ProfileDashboard } from './components/ProfileDashboard';
import { SettingsPage } from './components/SettingsPage';
import { SocialWorkspace } from './components/SocialWorkspace';
import { AuthWindow } from './components/AuthWindow';

function MainAppContent() {
  const { splashFinished, setSplashFinished, selectedGame } = useGame();
  const [activeView, setActiveView] = useState<string>('home');
  const [searchFilter, setSearchFilter] = useState('');

  // Handle splash completion screen routing
  if (!splashFinished) {
    return <SplashScreen onComplete={() => setSplashFinished(true)} />;
  }

  return (
    <div className="min-h-screen bg-[#0B0E14] text-[#E0E6ED] font-sans flex flex-col justify-between">
      
      {/* 1. STICKY NAV HUB */}
      <Navbar 
        activeView={activeView} 
        setActiveView={setActiveView} 
        searchFilter={searchFilter} 
        setSearchFilter={setSearchFilter} 
      />

      {/* 2. DYNAMIC CONTENT INTERFACES GRID */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {selectedGame ? (
          // Play Mode (High Priority overlay runner)
          <PlayContainer />
        ) : (
          // standard router tabs
          <>
            {activeView === 'home' && (
              <HeroSection 
                searchFilter={searchFilter} 
                setSearchFilter={setSearchFilter}
                setActiveView={setActiveView}
              />
            )}
            {activeView === 'profile' && <ProfileDashboard />}
            {activeView === 'settings' && <SettingsPage />}
            {activeView === 'social' && <SocialWorkspace />}
            {activeView === 'auth' && <AuthWindow />}
          </>
        )}
      </main>

      {/* 3. TECHNICAL ARCADE STATIC FOOTER */}
      <footer className="border-t border-white/5 bg-[#0D111A]/80 backdrop-blur-md py-8 select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-mono text-slate-400">
          <div>
            <span>© 2026 APPYDAY MAIN INTERFACE | PEGI-3 COMPACT SAFE</span>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => { setSplashFinished(false); }}
              className="hover:text-brand-cyan transition font-bold"
              title="Boot system sequence afresh"
            >
              RUN BOOT LOADER ⚙️
            </button>
            <span>•</span>
            <a href="#" className="hover:text-brand-cyan transition">ARCADE TERMS</a>
            <span>•</span>
            <a href="#" className="hover:text-brand-yellow transition font-bold">CLIENT OFFLINE SECURE (VITE/ESNEXT)</a>
          </div>
        </div>
      </footer>

    </div>
  );
}

export default function App() {
  return (
    <GameProvider>
      <MainAppContent />
    </GameProvider>
  );
}
