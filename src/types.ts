export interface UserProfile {
  id: string;
  username: string;
  avatar: string;
  xp: number;
  coins: number;
  rank: string;
  wins: number;
  losses: number;
  totalGamesPlayed: number;
  favorites: string[]; // game IDs
  achievements: string[]; // achievement IDs
  dailyStreak: number;
  lastLoginDate: string;
  isGuest: boolean;
}

export interface Game {
  id: string;
  title: string;
  description: string;
  category: 'Action' | 'Puzzle' | 'Racing' | 'Arcade' | 'Shooter' | 'Card';
  imageUrl: string;
  embedUrl?: string; // for Poki-style embeds
  isPlayable: boolean; // built-in playable vs external embed
  rating: number;
  ratingsCount: number;
  plays: number;
  highScore?: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  gameId: string;
  iconName: string;
  xpReward: number;
  coinReward: number;
  conditionDescription: string;
}

export interface GameLeaderboard {
  gameId: string;
  entries: {
    username: string;
    avatar: string;
    score: number;
    date: string;
  }[];
}

export interface UserSettings {
  musicVolume: number;
  effectsVolume: number;
  graphicsQuality: 'low' | 'medium' | 'high';
  themeColor: string;
  accessibilityMode: boolean;
  language: string;
}

export interface GameReview {
  id: string;
  gameId: string;
  username: string;
  avatar: string;
  rating: number;
  text: string;
  date: string;
}

export interface SocialFriend {
  id: string;
  username: string;
  avatar: string;
  status: 'online' | 'offline' | 'ingame';
  currentGame?: string;
}
