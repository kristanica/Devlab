export interface CodingInterface {
  html?: string;
  css?: string;
  js?: string;
  sql?: string;
}

export interface ContentBlock {
  id: string | number;
  type: "Divider" | "Image" | "Title" | "Text" | "Code" | string;
  value: string | File | null;
}

export interface Stage {
  id: string; // e.g. "Stage1"
  title: string;
  description: string;
  instruction: string;
  type: "Lesson" | "BugBust" | "CodeRush" | "CodeCrafter" | "BrainBytes";
  codingInterface?: CodingInterface;
  blocks: ContentBlock[];
  videoPresentation?: string;
  order?: number;
  isHidden?: boolean;
  replicationFile?: string;
  choices?: string[]; // Specifically for BrainBytes MC questions
  timer?: string | number; // Specifically for CodeRush challenges
}

export interface Level {
  id: string; // e.g. "Level1"
  title: string;
  description: string;
  expReward: number;
  coinsReward: number;
  levelOrder: number;
  stages: Stage[];
}

export interface SubjectLesson {
  id: string; // e.g. "Lesson1"
  Lesson: number;
  levels: Level[];
  optimistic?: boolean;
}

export interface UserAchievement {
  quantity: number;
}

export interface User {
  id: string;
  username?: string;
  email?: string;
  profileImage?: string;
  isAccountSuspended?: boolean;
  bio?: string;
  coins?: number;
  exp?: number;
  userLevel?: number;
  levelCount: Record<string, number>;
  achievements?: Record<string, UserAchievement>;
}
