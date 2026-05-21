export interface Question {
  id: string;
  topic: 'cadao' | 'toanhoc' | 'lichsu' | 'khoahoc';
  type: 'multiple-choice' | 'short-answer';
  questionText: string;
  options?: string[];
  correctAnswer: string; // For multiple-choice: 'A', 'B', 'C', or 'D'. For short-answer: direct string.
  explanation: string;
  difficulty: 'de' | 'trung-binh' | 'kho' | 'thach-thuc';
  stars?: number; // 1 to 5 stars
}

export interface UserProfile {
  username: string;
  studentClass: string;
  level: number;
  xp: number;
  unlockedBadges: string[];
  title?: string; // e.g. "Học Đế", "Đa Tài", "Học Giả", "Học Sinh", "Học Đần"
  avatar?: string;
  vipTickets?: number;
  spinsLeftToday?: number;
  lastSpinTimestamp?: string; // "YYYY-MM-DD"
}

export interface HistoryRecord {
  id: string;
  timestamp: string;
  mode: 'normal' | 'practice' | 'pvp' | 'custom' | 'special';
  topicName: string;
  score: number;
  totalQuestions: number;
  durationSeconds: number;
  titleEarned: string; // "Đa Tài", "học nhiều vào", "Học Đế", etc.
}

export interface LeaderboardItem {
  id: string;
  username: string;
  studentClass: string;
  level: number;
  xp: number;
  title?: string;
  isBot: boolean;
  avatar?: string;
}

export interface CustomQuiz {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  createdAt: string;
}
