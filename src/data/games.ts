import { Game, Achievement, GameReview, SocialFriend } from '../types';

export const INITIAL_GAMES: Game[] = [
  {
    id: 'snake',
    title: 'Neon Snake Redux',
    description: 'Guide the glowing electronic serpent, gobble digital nodes, and grow your tail while avoiding walls and yourself under intense speed progression.',
    category: 'Arcade',
    imageUrl: 'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?auto=format&fit=crop&w=400&q=80',
    isPlayable: true,
    rating: 4.8,
    ratingsCount: 342,
    plays: 5412,
  },
  {
    id: 'flappy',
    title: 'Flappy Cosmic Bolt',
    description: 'Fly a futuristic plasma capsule through oscillating laser high-voltage security gates. Tap to ascend, release to drop, dodge hurdles.',
    category: 'Action',
    imageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=400&q=80',
    isPlayable: true,
    rating: 4.6,
    ratingsCount: 220,
    plays: 9102,
  },
  {
    id: 'tic-tac-toe',
    title: 'Neon Matrix Grid',
    description: 'Play Tic-Tac-Toe against the core system mainframe. Align three neural nodes horizontally, vertically, or diagonally before the AI blocks you.',
    category: 'Puzzle',
    imageUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=400&q=80',
    isPlayable: true,
    rating: 4.2,
    ratingsCount: 95,
    plays: 2450,
  },
  {
    id: 'memory',
    title: 'Arcade Memory Recall',
    description: 'Match pairs of vintage tech symbols under a tight countdown clock. Sharpen your visual reflex and score critical combos.',
    category: 'Puzzle',
    imageUrl: 'https://images.unsplash.com/photo-1606167668584-78701c57f13d?auto=format&fit=crop&w=400&q=80',
    isPlayable: true,
    rating: 4.5,
    ratingsCount: 112,
    plays: 1845,
  },
  {
    id: 'space-shooter',
    title: 'Galactic Invader 2099',
    description: 'An action-packed arcade shooter. Navigate your fighter ship, fire rapid laser beams, and demolish waves of incoming asteroid debris and alien cruisers.',
    category: 'Shooter',
    imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=400&q=80',
    isPlayable: true,
    rating: 4.9,
    ratingsCount: 450,
    plays: 12503,
  },
  {
    id: 'brick-breaker',
    title: 'Hyper Bricks Demolisher',
    description: 'Bounce the metal cyber-ball with your magnetic paddle to demolish arrays of complex chemical brick compositions. Release power-up orbs to boost score.',
    category: 'Arcade',
    imageUrl: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=400&q=80',
    isPlayable: true,
    rating: 4.7,
    ratingsCount: 185,
    plays: 4030,
  },
  // External Browser Game Embeds
  {
    id: 'embed-tetris',
    title: 'Beto-Blocks 3D',
    description: 'Engaging classical block puzzle. Match full lines to perform massive clear-outs in a vibrant 3D aesthetic workspace.',
    category: 'Puzzle',
    imageUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=400&q=80',
    embedUrl: 'https://tetris.com/', // Simulated or safe default embedding
    isPlayable: false,
    rating: 4.4,
    ratingsCount: 89,
    plays: 3105,
  },
  {
    id: 'embed-slope',
    title: 'Cyber Slope Runaway',
    description: 'Speed run down unpredictable slopes and narrow neon pathways. Keep your balance, dodge walls, and claim your top velocity.',
    category: 'Racing',
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=400&q=80',
    embedUrl: 'https://play.pacman.com/', // Live authorized classic link
    isPlayable: false,
    rating: 4.7,
    ratingsCount: 312,
    plays: 14500,
  }
];

export const ALL_ACHIEVEMENTS: Achievement[] = [
  // Snake Achievements
  {
    id: 'snake_first_eat',
    title: 'First Digital Byte',
    description: 'Consume your first food item in Neon Snake Redux.',
    gameId: 'snake',
    iconName: 'Apple',
    xpReward: 50,
    coinReward: 10,
    conditionDescription: 'Score 1 point'
  },
  {
    id: 'snake_high_score',
    title: 'AnacondAI',
    description: 'Reach a length of 20 or more in a single game.',
    gameId: 'snake',
    iconName: 'Sparkles',
    xpReward: 200,
    coinReward: 50,
    conditionDescription: 'Score 20 points'
  },
  // Flappy Cosmic Bolt
  {
    id: 'flappy_score_10',
    title: 'Astral Pilot',
    description: 'Fly safely through 10 high-voltage neon barriers.',
    gameId: 'flappy',
    iconName: 'Flame',
    xpReward: 150,
    coinReward: 30,
    conditionDescription: 'Score 10 points'
  },
  // Memory
  {
    id: 'memory_perfect',
    title: 'Hyperneuron',
    description: 'Complete the memory recall grid in under 12 attempts.',
    gameId: 'memory',
    iconName: 'Trophy',
    xpReward: 250,
    coinReward: 60,
    conditionDescription: 'Match with low mistakes'
  },
  // Galactic Invader
  {
    id: 'shooter_slayer',
    title: 'Astroid Pulverizer',
    description: 'Vanquish 50 meteoroids or enemies in a space dogfight.',
    gameId: 'space-shooter',
    iconName: 'Zap',
    xpReward: 300,
    coinReward: 80,
    conditionDescription: 'Destroy 50 targets'
  },
  // Global
  {
    id: 'streak_3',
    title: 'Daily Warrior',
    description: 'Maintain a casual gaming streak of at least 3 consecutive logins.',
    gameId: 'global',
    iconName: 'Zap',
    xpReward: 100,
    coinReward: 40,
    conditionDescription: 'Streak of 3 days'
  }
];

export const INITIAL_REVIEWS: GameReview[] = [
  {
    id: 'r1',
    gameId: 'space-shooter',
    username: 'GalaxyRanger_99',
    avatar: '🦊',
    rating: 5,
    text: 'Insane retro vibes! The lasers feel extremely snappy and responsive on mobile!',
    date: '2026-05-26'
  },
  {
    id: 'r2',
    gameId: 'snake',
    username: 'PixelByte',
    avatar: '👾',
    rating: 4,
    text: 'A highly elegant modern take on the 97 classic snake. I love how the body sparkles!',
    date: '2026-05-25'
  },
  {
    id: 'r3',
    gameId: 'flappy',
    username: 'CloudHopper',
    avatar: '🦉',
    rating: 5,
    text: 'Extremely addictive! The neon gates look amazing.',
    date: '2026-05-27'
  }
];

export const MOCK_FRIENDS: SocialFriend[] = [
  { id: 'f1', username: 'SpeedRunner_Pro', avatar: '🐱', status: 'online' },
  { id: 'f2', username: 'PixelMaster', avatar: '🕹️', status: 'ingame', currentGame: 'Neon Snake Redux' },
  { id: 'f3', username: 'CasualGamerX', avatar: '🐨', status: 'offline' },
  { id: 'f4', username: 'TacticalAI', avatar: '🤖', status: 'online' }
];

export const AD_CAMPAIGNS = [
  { id: 'ad1', title: 'GigaTech Gaming Rig Upgrade', link: '#', sponsorName: 'GigaTech Electronics' },
  { id: 'ad2', title: 'CyberQuest VR Arena Alpha Launch', link: '#', sponsorName: 'Cosmic Lab Studio' }
];
