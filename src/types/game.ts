export interface GameImage {
  id: string;
  url: string;
  isAI: boolean;
  location?: {
    lat: number;
    lng: number;
    address?: string;
  };
  prompt?: string;
}

export interface GameRound {
  id: string;
  image: GameImage;
  userGuess?: {
    lat: number;
    lng: number;
  };
  userPrediction?: 'ai' | 'real';
  score?: number;
  distance?: number;
  completed: boolean;
}

export interface GameSession {
  id: string;
  rounds: GameRound[];
  currentRound: number;
  totalScore: number;
  startTime: number;
  isCompleted: boolean;
  isDailyChallenge?: boolean;
}

export interface User {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  bestScore: number;
  gamesPlayed: number;
}

export interface Leaderboard {
  daily: LeaderboardEntry[];
  allTime: LeaderboardEntry[];
}

export interface LeaderboardEntry {
  userId: string;
  userName: string;
  score: number;
  date: string;
}