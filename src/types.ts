export interface Question {
  id: string;
  topic: 'cadao' | 'toanhoc' | 'lichsu' | 'khoahoc';
  type: 'multiple-choice' | 'short-answer';
  questionText: string;
  options?: string[];
  correctAnswer: string; // For multiple-choice: 'A', 'B', 'C', or 'D'. For short-answer: direct string.
  explanation: string;
  difficulty: 'de' | 'trung-binh' | 'kho' | 'thach-thuc';
}

export interface UserProfile {
  username: string;
  studentClass: string;
  level: number;
  xp: number;
  unlockedBadges: string[];
  title?: string; // e.g. "Học Đế", "Đa Tài", "Học Giả", "Học Sinh", "Học Đần"
}

export interface HistoryRecord {
  id: string;
  timestamp: string;
  mode: 'normal' | 'practice' | 'pvp' | 'custom';
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
}

export interface CustomQuiz {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  createdAt: string;
}
