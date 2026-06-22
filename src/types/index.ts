// User Types
export interface UserData {
  uid: string;
  email: string;
  username: string;
  coins: number;
  exp: number;
  level: number;
  photoURL?: string;
  role?: "user" | "admin";
  createdAt?: string;
  lastLogin?: string;
}

// Game Mode Data Types
export interface CodingInterface {
  html?: string;
  css?: string;
  js?: string;
  sql?: string;
}

export interface GameModeChoices {
  correctAnswer: string;
  [key: string]: string; // For options like A, B, C, D
}

export interface GameModeData {
  id: string;
  type: "Lesson" | "BrainBytes" | "BugBust" | "CodeCrafter" | "CodeRush";
  title: string;
  description?: string;
  instruction?: string;
  codingInterface?: CodingInterface;
  replicationFile?: string;
  choices?: GameModeChoices;
  timer?: number;
  blocks?: any[]; // For lesson paragraph blocks
}

export interface LevelData {
  id: string;
  title: string;
  levelOrder: number;
  expReward: number;
  coinReward?: number;
}

export interface UserProgress {
  [stageKey: string]: boolean; // Format: `${lessonId}-${levelId}-${stageId}`
}

// Store Types
export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  type: "buff" | "consumable" | "shield";
  effect: any;
}

// Response & Evaluation Types
export interface EvaluationResult {
  score: number;
  feedback: string;
  isCorrect: boolean;
  hints?: string[];
}
