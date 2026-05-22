import React, { useState, useEffect } from 'react';
import { UserProfile, HistoryRecord, Question, LeaderboardItem } from './types';
import { checkUsername } from './utils/nameChecker';
import { HistoryLog } from './components/HistoryLog';
import { Leaderboard } from './components/Leaderboard';
import { CustomQuizCreator } from './components/CustomQuizCreator';
import { NormalGame } from './components/NormalGame';
import { PracticeGame } from './components/PracticeGame';
import { PvPGame } from './components/PvPGame';
import { SpecialGame } from './components/SpecialGame';
import { LuckyWheel } from './components/LuckyWheel';
import { MemoryModeGame } from './components/MemoryModeGame';
import MainframeExplorer from './components/MainframeExplorer';
import { getLevelAndProgress, getRequiredXPForLevel } from './utils/levelCalc';
import { 
  GraduationCap, 
  Lightbulb, 
  Trophy, 
  History, 
  Play, 
  PlusCircle, 
  LogOut, 
  Award, 
  Sparkles, 
  Zap, 
  BookOpen, 
  CheckCircle, 
  Flame, 
  FlameKindling,
  Upload,
  X,
  User,
  Image as ImageIcon,
  RotateCcw,
  RotateCw,
  Compass,
  Ticket,
  Cpu,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const CLASS_LIST = [
  'Lớp 1', 'Lớp 2', 'Lớp 3', 'Lớp 4', 'Lớp 5', 'Lớp 6', 
  'Lớp 7', 'Lớp 8', 'Lớp 9', 'Lớp 10', 'Lớp 11', 'Lớp 12', 'Đại Học'
];

const INITIAL_BOT_PLAYERS: LeaderboardItem[] = [
  { id: 'bot_1', username: 'Nguyễn Chí Thanh', studentClass: 'Lớp 12', level: 125, xp: 26050, title: 'Học Đế 👑', isBot: true, avatar: '🧙‍♂️' },
  { id: 'bot_2', username: 'Lê Kiều Trinh', studentClass: 'Lớp 9', level: 82, xp: 16800, title: 'Học Giả', isBot: true, avatar: '🦊' },
  { id: 'bot_3', username: 'Phan Minh Tuấn', studentClass: 'Lớp 8', level: 45, xp: 9240, title: 'Học Sinh', isBot: true, avatar: '🤖' },
  { id: 'bot_4', username: 'Đỗ Hà Vân', studentClass: 'Lớp 7', level: 21, xp: 4300, title: 'Học Sinh', isBot: true, avatar: '🦖' },
  { id: 'bot_5', username: 'Trần Đăng Khoa', studentClass: 'Đại Học', level: 95, xp: 19800, title: 'Học Giả', isBot: true, avatar: '🥷' },
];

const AVATAR_OPTIONS = [
  '👨‍🎓', '👩‍🎓', '🧑‍🚀', '🧙‍♂️', '🐱', '🦊', '🦁', '🦖', '🦉', '🤖', '🥷', '🦄', '⚡', '🏆'
];

interface AvatarFileDropperProps {
  profile: UserProfile;
  onCompleted: (profile: UserProfile) => void;
}

function AvatarFileDropper({ profile, onCompleted }: AvatarFileDropperProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    if (!file || !file.type.startsWith('image/')) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
         onCompleted({
           ...profile,
           avatar: dataUrl
         });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
      className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition duration-200 select-none ${
        isDragOver
          ? 'border-amber-500 bg-amber-500/10 text-amber-300'
          : 'border-slate-800 bg-slate-950/30 text-slate-400 hover:border-slate-700 hover:text-slate-300'
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            processFile(e.target.files[0]);
          }
        }}
        className="hidden"
      />
      
      <div className="space-y-2 flex flex-col items-center">
        <div className="w-10 h-10 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center">
          <Upload className={`w-5 h-5 ${isDragOver ? 'text-amber-400' : 'text-slate-500'}`} />
        </div>
        <div>
          <p className="text-xs font-bold font-serif leading-none">Kéo &amp; Thả bức ảnh tại đây</p>
          <p className="text-[10px] text-slate-500 mt-1 leading-none">Hoặc nhấn vào đây để chọn từ thiết bị của bạn</p>
        </div>
      </div>
    </div>
  );
}

const reEvaluateBadges = (currentProfile: UserProfile, currentHistory: HistoryRecord[]): UserProfile => {
  const currentBadges = new Set(currentProfile.unlockedBadges || []);

  // Standard level-based
  if (currentProfile.level >= 5) currentBadges.add('badge_level_5');
  if (currentProfile.level >= 10) currentBadges.add('badge_level_10');
  if (currentProfile.level >= 25) currentBadges.add('badge_master_hoc_thuat');

  // XP-based
  if (currentProfile.xp >= 15000) currentBadges.add('badge_may_hoc');
  if (currentProfile.xp >= 50000) currentBadges.add('badge_rank_sss');
  if (currentProfile.xp >= 26050) currentBadges.add('badge_top_1_bang_diem');

  // History-based
  if (currentHistory.length >= 10) currentBadges.add('badge_cao_thu_cay_de');

  // Combo Điểm Tuyệt Đối
  if (currentHistory.some(h => h.mode === 'normal' && h.score === 10 && h.totalQuestions === 10)) {
    currentBadges.add('badge_combo_perfect');
  }

  // Chuyên Gia Ghi Nhớ
  if (currentHistory.some(h => (h.topicName || '').includes('Miền Ký Ức') && h.score >= 4)) {
    currentBadges.add('badge_chuyen_gia_ghi_nho');
  }

  // MVP Học Đường
  if (currentHistory.some(h => h.mode === 'pvp' && h.titleEarned !== 'Thua trận')) {
    currentBadges.add('badge_mvp_hoc_duong');
  }

  // Bất Bại Kiểm Tra (3 consecutive pvp wins)
  let pvpStreak = 0;
  let maxPvpStreak = 0;
  const sortedHistory = [...currentHistory].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  for (const h of sortedHistory) {
    if (h.mode === 'pvp') {
      if (h.titleEarned !== 'Thua trận') {
        pvpStreak++;
        if (pvpStreak > maxPvpStreak) {
          maxPvpStreak = pvpStreak;
        }
      } else {
        pvpStreak = 0;
      }
    }
  }
  if (maxPvpStreak >= 3) {
    currentBadges.add('badge_bat_bai_kiem_tra');
  }

  return {
    ...currentProfile,
    unlockedBadges: Array.from(currentBadges)
  };
};

export default function App() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [customQuestions, setCustomQuestions] = useState<Question[]>([]);
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [savedAccounts, setSavedAccounts] = useState<UserProfile[]>([]);
  const [accountToDelete, setAccountToDelete] = useState<string | null>(null);
  
  // Custom avatars
  const [selectedAvatar, setSelectedAvatar] = useState('👨‍🎓');
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isLuckyWheelOpen, setIsLuckyWheelOpen] = useState(false);
  
  // Navigation
  const [activeView, setActiveView] = useState<'login' | 'dashboard' | 'normal-play' | 'practice' | 'pvp' | 'special' | 'memory-mode'>('login');
  const [selectedTopic, setSelectedTopic] = useState<'cadao' | 'toanhoc' | 'lichsu' | 'khoahoc' | 'custom' | null>(null);
  const [activeTab, setActiveTab] = useState<'play' | 'leaderboard' | 'custom' | 'history' | 'mainframe'>('play');

  // Input states in login
  const [inputName, setInputName] = useState('');
  const [inputClass, setInputClass] = useState('Lớp 6');
  const [loginError, setLoginError] = useState('');

  // Dialog Modals
  const [resultsModal, setResultsModal] = useState<{
    isOpen: boolean;
    score: number;
    total: number;
    duration: number;
    title: string;
    xpGained: number;
    won?: boolean;
    memeText?: string;
  } | null>(null);

  // Load from local storage upon boot
  useEffect(() => {
    const savedProfile = localStorage.getItem('study_game_user_profile');
    const savedHistory = localStorage.getItem('study_game_history');
    const savedCustom = localStorage.getItem('study_game_custom_questions');
    const savedCompleted = localStorage.getItem('study_game_completed_ids');
    const savedAccs = localStorage.getItem('study_game_saved_accounts');

    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
      setActiveView('dashboard');
    }
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
    if (savedCustom) {
      setCustomQuestions(JSON.parse(savedCustom));
    }
    if (savedCompleted) {
      setCompletedIds(JSON.parse(savedCompleted));
    }
    if (savedAccs) {
      setSavedAccounts(JSON.parse(savedAccs));
    }
  }, []);

  // Listen to custom deadline event to unlock Vua Deadline achievement
  useEffect(() => {
    const handleDeadlineBadge = () => {
      if (!profile) return;
      if (!profile.unlockedBadges.includes('badge_vua_deadline')) {
        const updated = [...profile.unlockedBadges, 'badge_vua_deadline'];
        saveProfileToLS({
          ...profile,
          unlockedBadges: updated
        });
      }
    };
    window.addEventListener('unlock_badge_vua_deadline', handleDeadlineBadge);
    return () => {
      window.removeEventListener('unlock_badge_vua_deadline', handleDeadlineBadge);
    };
  }, [profile]);

  // Sync to LS whenever states change
  const saveProfileToLS = (nProfile: UserProfile | null, passedHistory?: HistoryRecord[]) => {
    if (nProfile) {
      const activeHistory = passedHistory || history;
      const finalProfile = reEvaluateBadges(nProfile, activeHistory);
      setProfile(finalProfile);
      localStorage.setItem('study_game_user_profile', JSON.stringify(finalProfile));
      // Also sync and upsert into savedAccounts!
      setSavedAccounts(prev => {
        const index = prev.findIndex(acc => acc.username.toLowerCase() === finalProfile.username.toLowerCase());
        let updatedList = [...prev];
        if (index >= 0) {
          updatedList[index] = finalProfile;
        } else {
          updatedList.push(finalProfile);
        }
        localStorage.setItem('study_game_saved_accounts', JSON.stringify(updatedList));
        return updatedList;
      });
    } else {
      setProfile(null);
      localStorage.removeItem('study_game_user_profile');
    }
  };

  const saveHistoryToLS = (nHistory: HistoryRecord[]) => {
    setHistory(nHistory);
    localStorage.setItem('study_game_history', JSON.stringify(nHistory));
    if (profile) {
      // Delay slightly or call directly to evaluate with new history
      saveProfileToLS(profile, nHistory);
    }
  };

  const saveCustomToLS = (nCustom: Question[]) => {
    setCustomQuestions(nCustom);
    localStorage.setItem('study_game_custom_questions', JSON.stringify(nCustom));
  };

  const saveCompletedToLS = (nCompleted: string[]) => {
    setCompletedIds(nCompleted);
    localStorage.setItem('study_game_completed_ids', JSON.stringify(nCompleted));
  };

  // Login handler
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const trimmedName = inputName.trim();
    if (!trimmedName) {
      setLoginError('Vui lòng điền đầy đủ Họ và tên học sinh!');
      return;
    }

    const checkRes = checkUsername(trimmedName);
    if (!checkRes.isValid) {
      setLoginError(checkRes.reason || 'Tên phản cảm hoặc không đúng cách thức.');
      return;
    }

    // Check if account already exists to remember avoiding loss of data
    const existing = savedAccounts.find(acc => acc.username.toLowerCase() === trimmedName.toLowerCase());
    if (existing) {
      saveProfileToLS({
        ...existing,
        studentClass: inputClass // Update class if they selected a new class during login or preserve
      });
      setActiveView('dashboard');
      setActiveTab('play');
      return;
    }

    const newProfile: UserProfile = {
      username: trimmedName,
      studentClass: inputClass,
      level: 1,
      xp: 0,
      unlockedBadges: [],
      title: 'Học Sinh',
      avatar: selectedAvatar,
      vipTickets: 2, // starts with 2 free VIP tickets as a warm welcome!
      spinsLeftToday: 3,
      lastSpinTimestamp: new Date().toISOString().split('T')[0]
    };

    saveProfileToLS(newProfile);
    setActiveView('dashboard');
    setActiveTab('play');
  };

  // XP Gains handler (triggers Level up check)
  const addXP = (amount: number) => {
    if (!profile) return;
    
    const newXP = profile.xp + amount;
    const { level: targetLevel } = getLevelAndProgress(newXP);
    
    // Badge checker
    let updatedBadges = [...profile.unlockedBadges];
    if (targetLevel >= 5 && !updatedBadges.includes('badge_level_5')) {
      updatedBadges.push('badge_level_5');
    }
    if (targetLevel >= 10 && !updatedBadges.includes('badge_level_10')) {
      updatedBadges.push('badge_level_10');
    }

    const updatedProfile: UserProfile = {
      ...profile,
      xp: newXP,
      level: targetLevel,
      unlockedBadges: updatedBadges
    };

    saveProfileToLS(updatedProfile);
  };

  // Sign out
  const handleSignOut = () => {
    saveProfileToLS(null);
    setInputName('');
    setLoginError('');
    setActiveView('login');
  };

  // Normal Quiz Round Result handler
  const handleNormalGameComplete = (
    score: number, 
    total: number, 
    durationSeconds: number, 
    titleEarned: string, 
    gainedXP: number,
    newlySolvedIds: string[]
  ) => {
    if (!profile) return;

    // Save completed Ids to local storage to prevent redundancy
    const updatedCompletedIds = Array.from(new Set([...completedIds, ...newlySolvedIds]));
    saveCompletedToLS(updatedCompletedIds);

    // Save history record
    const nRecord: HistoryRecord = {
      id: `record_${Date.now()}`,
      timestamp: new Date().toISOString(),
      mode: 'normal',
      topicName: selectedTopic || 'Chung',
      score,
      totalQuestions: total,
      durationSeconds,
      titleEarned,
    };

    const nHistory = [...history, nRecord];
    saveHistoryToLS(nHistory);

    // Apply XP progress
    addXP(gainedXP);

    // Check achievement badges based on the latest history
    let currentBadges = [...profile.unlockedBadges];
    if (selectedTopic === 'cadao' && score >= 5 && !currentBadges.includes('badge_cadao_master')) {
      currentBadges.push('badge_cadao_master');
    }
    if (selectedTopic === 'toanhoc' && score === 10 && !currentBadges.includes('badge_toan_master')) {
      currentBadges.push('badge_toan_master');
    }
    
    const nextXP = profile.xp + gainedXP;
    const { level: targetLevel } = getLevelAndProgress(nextXP);
    
    const updatedProfile: UserProfile = {
      ...profile,
      unlockedBadges: currentBadges,
      xp: nextXP,
      level: targetLevel
    };
    saveProfileToLS(updatedProfile);

    // Trigger Results modal display
    setResultsModal({
      isOpen: true,
      score,
      total,
      duration: durationSeconds,
      title: titleEarned,
      xpGained: gainedXP,
    });

    setActiveView('dashboard');
  };

  // PvP Arena Game Result handler
  const handlePvPComplete = (
    score: number,
    total: number,
    durationSeconds: number,
    titleEarned: string,
    gainedXP: number,
    won: boolean,
    shownMeme?: string
  ) => {
    if (!profile) return;

    const nRecord: HistoryRecord = {
      id: `record_pvp_${Date.now()}`,
      timestamp: new Date().toISOString(),
      mode: 'pvp',
      topicName: 'pvp',
      score,
      totalQuestions: total,
      durationSeconds,
      titleEarned,
    };

    const nHistory = [...history, nRecord];
    saveHistoryToLS(nHistory);

    // Badges update
    let currentBadges = [...profile.unlockedBadges];
    if (won) {
      if (titleEarned === 'Học Đế' && !currentBadges.includes('badge_pvp_emperor')) {
        currentBadges.push('badge_pvp_emperor');
      }
      if ((titleEarned === 'Học Đế' || titleEarned === 'Học Giả') && !currentBadges.includes('badge_pvp_warrior')) {
        currentBadges.push('badge_pvp_warrior');
      }
    }

    const nextXP = profile.xp + gainedXP;
    const { level: nextLvl } = getLevelAndProgress(nextXP);

    // Set high-tier title persistently on the profile if player unlocked it!
    const updatedProfile: UserProfile = {
      ...profile,
      xp: nextXP,
      level: nextLvl,
      unlockedBadges: currentBadges,
      title: won ? titleEarned : profile.title,
    };
    saveProfileToLS(updatedProfile);

    setResultsModal({
      isOpen: true,
      score,
      total,
      duration: durationSeconds,
      title: won ? titleEarned : 'Thua trận',
      xpGained: gainedXP,
      won,
      memeText: shownMeme,
    });

    setActiveView('dashboard');
  };

  // Memory Mode Result handler
  const handleMemoryModeComplete = (
    score: number,
    total: number,
    durationSeconds: number,
    gainedXP: number
  ) => {
    if (!profile) return;

    const nextXP = profile.xp + gainedXP;
    const { level: targetLevel } = getLevelAndProgress(nextXP);
    const tickets = Math.max(0, (profile.vipTickets || 0) - 1);

    const updatedProfile: UserProfile = {
      ...profile,
      xp: nextXP,
      level: targetLevel,
      vipTickets: tickets
    };
    saveProfileToLS(updatedProfile);

    const nRecord: HistoryRecord = {
      id: `record_mem_${Date.now()}`,
      timestamp: new Date().toISOString(),
      mode: 'special',
      topicName: 'Miền Ký Ức 🌌',
      score,
      totalQuestions: total,
      durationSeconds,
      titleEarned: score >= 5 ? 'Ký Ức Master' : 'Ký Ức Học Sinh'
    };

    const nHistory = [...history, nRecord];
    saveHistoryToLS(nHistory);

    setResultsModal({
      isOpen: true,
      score,
      total,
      duration: durationSeconds,
      title: score >= 5 ? 'Ký Ức Master' : 'Ký Ức Học Sinh',
      xpGained: gainedXP,
    });

    setActiveView('dashboard');
  };

  // Custom Quiz Creation Helpers
  const handleAddQuestion = (q: Question) => {
    const updated = [...customQuestions, q];
    saveCustomToLS(updated);
  };

  const handleDeleteQuestion = (id: string) => {
    const updated = customQuestions.filter(q => q.id !== id);
    saveCustomToLS(updated);
  };

  const handleStartCustomQuiz = () => {
    if (customQuestions.length < 3) return;
    setSelectedTopic('custom');
    setActiveView('normal-play');
  };

  const handleResetHistoryOnly = () => {
    saveHistoryToLS([]);
    saveCompletedToLS([]);
    setIsResetConfirmOpen(false);
  };

  const handleResetEverything = () => {
    if (!profile) return;
    const resetProfile: UserProfile = {
      ...profile,
      level: 1,
      xp: 0,
      unlockedBadges: [],
      title: 'Học Sinh',
    };
    saveProfileToLS(resetProfile);
    saveHistoryToLS([]);
    saveCompletedToLS([]);
    setIsResetConfirmOpen(false);
  };

  const handleDeleteActiveAccount = () => {
    if (!profile) return;
    const usernameToDelete = profile.username;
    const updated = savedAccounts.filter(acc => acc.username.toLowerCase() !== usernameToDelete.toLowerCase());
    setSavedAccounts(updated);
    localStorage.setItem('study_game_saved_accounts', JSON.stringify(updated));
    saveProfileToLS(null);
    setInputName('');
    setLoginError('');
    setIsResetConfirmOpen(false);
    setActiveView('login');
  };

  // Formulate active level details
  const getLevelProgressPercentage = () => {
    if (!profile) return 0;
    const { progressPercent } = getLevelAndProgress(profile.xp);
    return progressPercent;
  };

  const getXPRequiredForNextLevel = () => {
    if (!profile) return 0;
    return getRequiredXPForLevel(profile.level);
  };

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-100 antialiased flex flex-col justify-between">
      {/* 1. Header Navigation Bar */}
      <header className="bg-slate-900/80 backdrop-blur border-b border-slate-800 sticky top-0 z-40 px-4 py-3 shadow-xl">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-[0_0_10px_rgba(245,158,11,0.25)]">
              <GraduationCap className="text-slate-950 w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="font-serif italic font-black text-base tracking-tight text-slate-100 sm:text-lg">
                Trò chơi Học tập Tổng hợp
              </h1>
              <p className="text-[10px] text-amber-400 font-semibold uppercase tracking-wider">Học Viện Thần Đồng Việt Nam</p>
            </div>
          </div>

          {profile && (
            <div className="flex items-center gap-3">
              <div 
                onClick={() => { if (activeView === 'dashboard') setIsAvatarModalOpen(true); }}
                className={`w-8 h-8 rounded-lg bg-slate-950 flex items-center justify-center border border-slate-800 text-base font-bold shrink-0 overflow-hidden select-none ${activeView === 'dashboard' ? 'cursor-pointer hover:border-amber-500/80 hover:scale-105 transition-all' : ''}`}
                title={activeView === 'dashboard' ? "Thay đổi ảnh đại diện" : ""}
              >
                {profile.avatar && profile.avatar.startsWith('data:') ? (
                  <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <span>{profile.avatar || '👨‍🎓'}</span>
                )}
              </div>
              <button
                type="button"
                onClick={handleSignOut}
                className="p-2 text-slate-500 hover:text-rose-450 hover:text-rose-400 hover:bg-rose-950/20 rounded-xl transition duration-150 cursor-pointer"
                title="Đăng xuất khỏi lớp"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </header>

      {/* 2. Main Area content */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        
        <AnimatePresence mode="wait">
          {/* LOGIN SCREEN */}
          {activeView === 'login' && (
            <motion.div
              key="login"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
            >
              <div className="max-w-md mx-auto my-12 bg-slate-950/85 border-2 border-cyan-500/20 p-6 sm:p-10 rounded-3xl shadow-[0_0_35px_rgba(6,182,212,0.15)] space-y-6 relative overflow-hidden cyber-scanlines">
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
                <div className="text-center space-y-2 animate-fade-in">
                  <div className="w-14 h-14 bg-gradient-to-tr from-cyan-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto shadow-[0_0_15px_rgba(6,182,212,0.4)] border border-cyan-300/30">
                    <Cpu className="text-slate-950 w-7 h-7 stroke-[2]" />
                  </div>
                  <h2 className="text-2xl font-mono font-black text-slate-100 uppercase tracking-tight">KẾT NỐI MAINFRAME</h2>
                  <p className="text-[10px] text-cyan-450 text-cyan-400 font-mono font-black uppercase tracking-[0.2em] leading-normal">HỆ THỐNG HỌC TẬP THÔNG MINH VIÊN TƯỞNG</p>
                </div>

                {savedAccounts.length > 0 && (
                  <div className="space-y-2 border-b border-slate-800/80 pb-5 mb-1">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest font-serif">
                      Tài khoản đã nhớ máy này 📁
                    </label>
                    <div className="grid gap-2 max-h-[150px] overflow-y-auto pr-1">
                      {savedAccounts.map((acc, keyIdx) => (
                        <div
                          key={keyIdx}
                          onClick={() => {
                            saveProfileToLS(acc);
                            setInputName(acc.username);
                            setInputClass(acc.studentClass);
                            setActiveView('dashboard');
                            setActiveTab('play');
                          }}
                          className="bg-slate-950/60 border border-slate-850 hover:border-amber-500/50 p-2.5 rounded-2xl flex items-center justify-between cursor-pointer transition hover:bg-slate-900 group"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-xl shrink-0">
                              {acc.avatar && acc.avatar.startsWith('data:') ? (
                                <img src={acc.avatar} alt="avatar" className="w-5 h-5 rounded-full object-cover inline" referrerPolicy="no-referrer" />
                              ) : (
                                acc.avatar || '👨‍🎓'
                              )}
                            </span>
                            <div className="leading-tight text-left">
                              <p className="text-xs font-serif font-black text-slate-100 italic group-hover:text-amber-400">{acc.username}</p>
                              <p className="text-[10px] text-slate-500 font-bold">{acc.studentClass} • Cấp {acc.level}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                            <span 
                              onClick={() => {
                                saveProfileToLS(acc);
                                setInputName(acc.username);
                                setInputClass(acc.studentClass);
                                setActiveView('dashboard');
                                setActiveTab('play');
                              }}
                              className="text-[10px] bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 text-amber-400 py-0.5 px-2 rounded-lg font-bold transition duration-155 select-none"
                            >
                              Vào nhanh
                            </span>
                            <button
                              type="button"
                              onClick={() => setAccountToDelete(acc.username)}
                              className="p-1 px-1.5 text-slate-500 hover:text-rose-455 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-550/20 rounded-lg transition-all duration-155 cursor-pointer"
                              title="Xóa tài khoản này khỏi máy"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  {loginError && (
                    <div className="p-3 bg-rose-950/20 border border-rose-800/55 text-rose-400 text-xs font-semibold rounded-xl">
                      ⚠️ {loginError}
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider font-serif">Họ và tên học sinh</label>
                    <input
                      type="text"
                      value={inputName}
                      onChange={(e) => setInputName(e.target.value)}
                      placeholder="Ví dụ: Nguyễn Văn Hải"
                      className="w-full bg-slate-950 border-2 border-slate-800 focus:border-amber-500 rounded-xl py-2.5 px-4 focus:outline-none text-sm font-semibold transition text-slate-200 placeholder:text-slate-650"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider font-serif">Cấp lớp học hiện tại</label>
                    <select
                      value={inputClass}
                      onChange={(e) => setInputClass(e.target.value)}
                      className="w-full bg-slate-950 border-2 border-slate-800 focus:border-amber-500 rounded-xl py-2.5 px-4 focus:outline-none text-sm font-semibold text-slate-300 transition select-dark"
                    >
                      {CLASS_LIST.map((c) => (
                        <option key={c} value={c} className="bg-slate-900 text-slate-200">{c}</option>
                      ))}
                    </select>
                    <p className="text-[10px] text-slate-500 font-normal">Giới hạn học lực phân loại từ lớp 1 đến Lớp Đại học.</p>
                  </div>

                  {/* Starting Avatar Selection Grid */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider font-serif">
                      Hình đại diện (Mascot) ban đầu
                    </label>
                    <div className="flex flex-wrap gap-2 justify-center p-3.5 bg-slate-950/65 border border-slate-850 rounded-2xl">
                      {AVATAR_OPTIONS.map((avatar) => {
                        const isSelected = selectedAvatar === avatar;
                        return (
                          <button
                            key={avatar}
                            type="button"
                            onClick={() => setSelectedAvatar(avatar)}
                            className={`w-9 h-9 text-xl flex items-center justify-center rounded-xl transition duration-150 cursor-pointer ${
                              isSelected
                                ? 'bg-amber-500 text-slate-950 font-bold scale-110 shadow-[0_0_12px_rgba(245,158,11,0.5)] ring-2 ring-amber-400'
                                : 'bg-slate-905 border border-slate-800 text-slate-300 hover:bg-slate-800 hover:scale-105'
                            }`}
                          >
                            {avatar}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-cyan-500 via-teal-500 to-indigo-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-mono font-black py-4 px-4 rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:scale-[1.01] transition duration-150 text-xs uppercase tracking-widest cursor-pointer"
                  >
                    ⚡ KHIÊU CHIẾN KHÔNG GIAN TRI THỨC ⚡
                  </button>
                </form>
              </div>
            </motion.div>
          )}

        {/* STUDY DASHBOARD */}
        {activeView === 'dashboard' && profile && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="space-y-6"
          >
            
            {/* User status card header */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAvatarModalOpen(true)}
                    className="w-14 h-14 bg-slate-950 hover:bg-slate-900 rounded-2xl flex items-center justify-center text-3xl font-bold border-2 border-slate-800 hover:border-amber-500/80 transition-all duration-300 cursor-pointer overflow-hidden group relative shrink-0 shadow-lg"
                    title="Thay đổi ảnh đại diện (avatar)"
                  >
                    {profile.avatar && profile.avatar.startsWith('data:') ? (
                      <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover group-hover:opacity-60 transition-opacity" referrerPolicy="no-referrer" />
                    ) : (
                      <span className="group-hover:scale-105 transition-transform">{profile.avatar || '👨‍🎓'}</span>
                    )}
                    <div className="absolute inset-0 bg-slate-950/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-xl text-[10px] text-amber-450 text-amber-400 font-extrabold uppercase select-none tracking-tight">
                      Sửa
                    </div>
                  </button>
                  <div>
                    <div className="flex items-center gap-2">
                       <h2 className="font-serif italic font-bold text-slate-100 text-lg sm:text-xl">{profile.username}</h2>
                      <span className="text-[10px] uppercase font-bold px-2.5 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-md">
                        {profile.studentClass}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                      Danh hiệu tích lũy:
                      <span className="font-serif italic font-bold text-amber-400 text-xs bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded">
                        🏆 {profile.title || 'Học Sinh'}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Level parameters */}
                <div className="space-y-1 max-w-sm">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span className="font-bold text-amber-400">Cấp {profile.level}</span>
                    <span className="font-mono text-slate-500">{profile.xp.toLocaleString()} / {getXPRequiredForNextLevel().toLocaleString()} XP</span>
                  </div>
                  <div className="w-full bg-slate-950 border border-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-amber-400 to-amber-500 h-full transition-all duration-305 shadow-[0_0_8px_rgba(245,158,11,0.3)]"
                      style={{ width: `${getLevelProgressPercentage()}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Badges unlocked tally inside header */}
              <div className="flex items-center gap-4 bg-slate-950/40 p-4 rounded-2xl border border-slate-800 shrink-0">
                <div className="text-center">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none mb-1">Huy hiệu</p>
                  <p className="text-xl font-mono font-black text-slate-100">{profile.unlockedBadges.length}</p>
                </div>
                <div className="w-[1px] h-10 bg-slate-800"></div>
                <div className="text-center">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none mb-1">Số câu đúng</p>
                  <p className="text-xl font-mono font-black text-emerald-400 flex items-center justify-center gap-1.5">
                    {history.reduce((sum, r) => sum + r.score, 0)}
                    {history.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setIsResetConfirmOpen(true)}
                        className="p-1 text-slate-500 hover:text-rose-400 hover:bg-slate-950 rounded-lg transition-all duration-150 cursor-pointer self-center"
                        title="Đặt lại số câu đúng và lịch sử học"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Tab controllers */}
            <div className="flex border-b border-slate-800/80 overflow-x-auto gap-2 py-1 scrollbar-none">
              {[
                { id: 'play', name: 'Đề thi & Luyện tập', icon: Play },
                { id: 'wheel', name: 'Vòng Quay Nhân Phẩm 🎡', icon: RotateCw },
                { id: 'leaderboard', name: 'Xếp hạng & Huy chương', icon: Trophy },
                { id: 'custom', name: 'Sáng tạo câu đố', icon: PlusCircle },
                { id: 'history', name: 'Lịch sử học tập', icon: History }
              ].map((tab) => {
                const Icon = tab.icon;
                const isSelected = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`py-2 px-4 text-xs font-extrabold rounded-xl transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                      isSelected 
                        ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400 shadow-md ring-1 ring-amber-500/10' 
                        : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-amber-400' : 'text-slate-500'}`} />
                    {tab.name}
                  </button>
                );
              })}
            </div>

            {/* TAB CONTENTS */}
            {activeTab === 'play' && profile && (
              <div className="space-y-6 animate-fade-in">

                {/* LUCKY WHEEL & MEMORY GATE INTERACTIVE BENTO CARD ROW */}
                <div className="grid gap-4 md:grid-cols-2">
                  {/* Bánh Xe Nhân Phẩm */}
                  <div className="bg-gradient-to-r from-teal-950/20 via-slate-900/40 to-emerald-950/25 border border-emerald-500/20 rounded-3xl p-5 shadow-xl flex items-center justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold uppercase">
                          Cơ Hội Hàng Ngày ✨
                        </span>
                        <span className="text-xs text-slate-400 font-semibold">• 3 lượt/ngày</span>
                      </div>
                      <h4 className="font-serif italic font-black text-slate-100 text-base">Vòng Quay Nhân Phẩm 🎡</h4>
                      <p className="text-xs text-slate-400 leading-normal max-w-[280px]">
                        Quay bánh xe may mắn nhận <span className="text-amber-400 font-bold">Vé VIP 🎟️</span> vào cổng "Miền Ký Ức" để gấp 5 lần kinh nghiệm cày cấp siêu hạng!
                      </p>
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <span className="text-[10.5px] bg-slate-950 px-2 py-1 rounded-md border border-slate-850 font-mono text-emerald-400 font-bold">
                          Vé của bạn: <strong className="text-emerald-300">{(profile.vipTickets || 0)} 🎟️</strong>
                        </span>
                        <span className="text-[10.5px] bg-slate-950 px-2 py-1 rounded-md border border-slate-850 font-mono text-cyan-400 font-bold">
                          Lượt quay: <strong className="text-cyan-300">{(profile.spinsLeftToday !== undefined ? profile.spinsLeftToday : 3)} / 3 🔄</strong>
                        </span>
                      </div>
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => setActiveTab('wheel')}
                      className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold py-3 px-5 rounded-2xl text-xs transition duration-150 transform hover:scale-[1.03] active:scale-[0.98] shrink-0 font-serif italic cursor-pointer shadow-md shadow-emerald-950/30"
                    >
                      🎪 Quay Ngay
                    </button>
                  </div>

                  {/* Miền Ký Ức */}
                  <div className="bg-gradient-to-r from-indigo-950/20 via-slate-900/40 to-purple-950/25 border border-purple-500/20 rounded-3xl p-5 shadow-xl flex items-center justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold uppercase">
                          Sự Kiện Đặc Biệt 🎟️
                        </span>
                        <span className="text-xs text-slate-400 font-semibold">• Yêu cầu 1 Vé VIP</span>
                      </div>
                      <h4 className="font-serif italic font-black text-slate-100 text-base">Hành Trình "Miền Ký Ức" 🌌</h4>
                      <p className="text-xs text-slate-400 leading-normal max-w-[280px]">
                        Hồi tưởng quá khứ tuyệt đỉnh với hệ thống câu đố phân loại từ <span className="text-amber-400 font-bold">1 đến 5 sao</span> cùng tỉ lệ cày cấp <span className="text-purple-400 font-black">Nhân 5 Lần EXP! 🔥</span>
                      </p>
                      <div className="pt-1">
                        <span className="text-[10.5px] bg-slate-950 px-2.5 py-1 rounded-md border border-slate-850 font-mono text-purple-400 font-bold">
                          Thời gian đề thi: <strong className="text-purple-300">30 Giây - 1 Phút / câu</strong>
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if ((profile.vipTickets || 0) < 1) {
                          alert('Bạn không đủ Vé VIP! Hãy quay bánh xe nhân phẩm tích luỹ thêm hoặc thử vận may nhé.');
                          return;
                        }
                        setActiveView('memory-mode');
                      }}
                      className="bg-gradient-to-r from-purple-500 to-pink-550 hover:from-purple-400 hover:to-pink-500 hover:scale-[1.03] text-white font-bold py-3 px-5 rounded-2xl text-xs transition duration-150 active:scale-[0.98] shrink-0 font-serif italic cursor-pointer shadow-md shadow-purple-950/30"
                    >
                      🌌 Vào Ải VIP
                    </button>
                  </div>
                </div>
                
                {/* 1. Module category grids for 10-Question Normal game */}
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <h3 className="text-lg font-serif italic font-extrabold text-slate-200 flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-amber-500" />
                      Mô-đun Khảo sát (10 Câu ngẫu nhiên không trùng)
                    </h3>
                    <p className="text-xs text-slate-500">Tự động loại bớt các câu hỏi bạn đã làm đúng trong quá khứ.</p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {[
                      { 
                        id: 'cadao', 
                        name: 'Ca dao Tục ngữ VN', 
                        icon: '📜', 
                        desc: 'Bảo tàng thi ca dân gian, ca dao tục ngữ và trí tuệ Việt Nam hào hùng.', 
                        themeClass: 'from-[rgba(244,63,94,0.12)] to-[rgba(244,63,94,0.02)] border-rose-500/30 hover:border-rose-450 shadow-[0_0_15px_rgba(244,63,94,0.05)]',
                        btnClass: 'bg-rose-500 hover:bg-rose-400 text-slate-950 shadow-[0_0_15px_rgba(244,63,94,0.35)]',
                        badgeText: 'Hồn Việt',
                        badgeClass: 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                      },
                      { 
                        id: 'toanhoc', 
                        name: 'Toán học THCS', 
                        icon: '🧮', 
                        desc: 'Rèn luyện tư duy logic, đại số lớp học, phương trình hữu ích vô hạn.', 
                        themeClass: 'from-[rgba(6,182,212,0.12)] to-[rgba(6,182,212,0.02)] border-cyan-500/30 hover:border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.05)]',
                        btnClass: 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.35)]',
                        badgeText: 'Logic',
                        badgeClass: 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                      },
                      { 
                        id: 'lichsu', 
                        name: 'Lịch sử Việt Nam', 
                        icon: '🛡️', 
                        desc: 'Khám phá các triều đại hưng thịnh và cuộc đấu tranh bảo vệ giang sơn.', 
                        themeClass: 'from-[rgba(245,158,11,0.12)] to-[rgba(245,158,11,0.02)] border-amber-500/30 hover:border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.05)]',
                        btnClass: 'bg-amber-550 bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.35)]',
                        badgeText: 'Sử Vàng',
                        badgeClass: 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                      },
                      { 
                        id: 'khoahoc', 
                        name: 'Khoa học Tự nhiên', 
                        icon: '🔬', 
                        desc: 'Bí ẩn vật lý, phản ứng hóa học thú vị và cấu trúc sinh giới đa dạng.', 
                        themeClass: 'from-[rgba(16,185,129,0.12)] to-[rgba(16,185,129,0.02)] border-emerald-500/30 hover:border-emerald-450 shadow-[0_0_15px_rgba(16,185,129,0.05)]',
                        btnClass: 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.35)]',
                        badgeText: 'Khám Phá',
                        badgeClass: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      }
                    ].map((mod) => (
                      <div 
                        key={mod.id}
                        className={`p-5 rounded-2xl border bg-gradient-to-br ${mod.themeClass} flex flex-col justify-between space-y-4 transition-all duration-350 hover:scale-[1.03] group relative overflow-hidden`}
                      >
                        <div className="absolute top-0 right-0 w-24 h-24 bg-white/[0.01] rounded-full blur-xl pointer-events-none" />
                        <div className="space-y-2 relative z-10">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-3xl filter drop-shadow-[0_2px_12px_rgba(0,0,0,0.55)]">{mod.icon}</span>
                            <span className={`text-[10px] font-mono tracking-wider font-extrabold uppercase px-2 py-0.5 rounded-full ${mod.badgeClass}`}>
                              {mod.badgeText}
                            </span>
                          </div>
                          <h4 className="font-mono font-black text-sm text-slate-150 group-hover:text-white transition-colors tracking-tight">
                            {mod.name.toUpperCase()}
                          </h4>
                          <p className="text-xs text-slate-400 leading-relaxed font-semibold min-h-[36px]">
                            {mod.desc}
                          </p>
                        </div>

                        <button
                          onClick={() => { setSelectedTopic(mod.id as any); setActiveView('normal-play'); }}
                          className={`w-full font-mono font-black uppercase text-xs py-3 px-4 rounded-xl transition-all duration-150 cursor-pointer text-center tracking-widest flex items-center justify-center gap-2 border-2 border-white/20 active:scale-[0.98] ${mod.btnClass}`}
                        >
                          <Play className="w-3.5 h-3.5 fill-current" /> LÀM ĐỀ THI THỬ 📚
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 1.5. Chế độ Đặc biệt: Đấu Trường Vô Hạn */}
                <div className="bg-gradient-to-b from-amber-950/20 via-slate-900/45 to-rose-950/25 text-white rounded-3xl p-5 sm:p-6 shadow-xl border border-amber-500/20 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all duration-300 hover:border-amber-500/40 hover:scale-[1.01]">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="bg-amber-550/15 font-extrabold text-[9px] px-2.5 py-1 rounded-lg uppercase tracking-widest border border-amber-550/30 text-amber-400">
                        Chế độ Đặc biệt 🔥
                      </span>
                      <span className="text-[11px] text-slate-400 font-semibold">• Đấu Trường Vô Hạn</span>
                    </div>
                    <h3 className="font-serif italic font-black text-slate-100 text-lg flex items-center gap-2">
                      Đấu Trường Vô Hạn ⏱️⚡
                    </h3>
                    <p className="text-xs text-slate-350 leading-relaxed max-w-xl">
                      Cơ chế sinh tồn cực nhịp độ với <span className="text-amber-400 font-bold">10 giây</span> đếm ngược cho mỗi câu hỏi. Độ khó <span className="text-teal-400 font-bold">tự động căn chỉnh</span> theo chuỗi thắng (streak) của bạn. Hệ thống trộn ngẫu nhiên từ kho 4 chủ đề và đặc biệt bổ sung hàng loạt <span className="text-rose-450 text-rose-400 font-bold">câu hỏi troll mẹo hài hước, dí dỏm!</span> Giữ vững <span className="text-rose-500 font-bold">3 mạng sống ❤️</span> để thi đua lập kỷ lục điểm cao nhất!
                    </p>
                  </div>

                  <button
                    onClick={() => setActiveView('special')}
                    className="bg-gradient-to-r from-amber-500 to-rose-550 hover:from-amber-400 hover:to-rose-450 text-slate-950 font-serif italic font-black py-3 px-6 rounded-xl text-xs hover:scale-[1.01] transition duration-200 shrink-0 self-start md:self-auto cursor-pointer shadow-lg shadow-amber-950/30"
                  >
                    ⚡ Thích ứng Vô Hạn
                  </button>
                </div>

                {/* 2. Specialized training launcher */}
                <div className="bg-slate-900/40 rounded-3xl border border-slate-800 p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-1">
                    <span className="text-xs uppercase font-extrabold text-amber-400 tracking-wider">Môi trường tự luyện</span>
                    <h3 className="font-serif italic font-black text-slate-100 text-lg">Chế độ ôn tập & Luyện kỹ năng vô tận</h3>
                    <p className="text-xs text-slate-400 max-w-xl">
                      Luyện tập ngẫu nhiên từng câu hỏi nhỏ để ôn thi THCS, nhận giải trình cực kỳ chi tiết của Giáo sư AI và tích trữ XP cày cấp mọi lúc.
                    </p>
                  </div>

                  <button
                    onClick={() => { setSelectedTopic(null); setActiveView('practice'); }}
                    className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold py-2.5 px-6 rounded-xl text-xs shadow-lg transition duration-150 shrink-0 self-start md:self-auto flex items-center gap-1.5 cursor-pointer"
                  >
                    🚀Vào ôn kỹ năng
                  </button>
                </div>

                {/* 3. PvP Battle launcher */}
                <div className="bg-gradient-to-b from-purple-950/20 via-slate-900/40 to-indigo-950/25 text-white rounded-3xl p-6 shadow-xl border border-purple-900/30 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="bg-purple-900/30 font-extrabold text-[10px] px-2.5 py-1 rounded uppercase tracking-widest border border-purple-500/30 text-purple-300">
                        Chế độ Cao Cấp
                      </span>
                      <span className="text-xs text-slate-400 font-semibold">• 50 câu hỏi khó</span>
                    </div>
                    <h3 className="font-serif italic font-extrabold text-lg sm:text-xl">Trận đấu Tri Thức PvP ⚔️</h3>
                    <p className="text-xs text-purple-200/90 max-w-xl leading-normal">
                      Khớp đấu với các học sinh xuất chúng giả lập AI toàn trường. Thử thách 50 câu hỏi tăng dần độ khó vô tận lên tới 700 điểm tối đa. Trở thành <strong className="text-yellow-300 font-serif italic">Học Đế 👑</strong> nếu hoàn thành dưới 5 phút! Thua cuộc sẽ nhận meme bất ngờ thú vị!
                    </p>
                  </div>

                  <button
                    onClick={() => setActiveView('pvp')}
                    className="bg-gradient-to-r from-purple-600 to-indigo-650 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold py-3 px-6 rounded-xl text-xs shadow-[0_0_15px_rgba(168,85,247,0.2)] hover:scale-[1.01] transition duration-200 shrink-0 self-start md:self-auto cursor-pointer"
                  >
                    ⚔️ Thách đấu Học Bá
                  </button>
                </div>

              </div>
            )}

            {activeTab === 'leaderboard' && (
              <Leaderboard 
                userProfile={profile} 
                competitors={INITIAL_BOT_PLAYERS} 
              />
            )}

            {activeTab === 'custom' && (
              <CustomQuizCreator 
                customQuestions={customQuestions}
                onAddQuestion={handleAddQuestion}
                onDeleteQuestion={handleDeleteQuestion}
                onStartCustomQuiz={handleStartCustomQuiz}
              />
            )}

            {activeTab === 'history' && (
              <div className="space-y-4">
                {history.length > 0 && (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setIsResetConfirmOpen(true)}
                      className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-serif font-bold text-xs rounded-xl border border-rose-500/20 hover:border-rose-500/40 hover:scale-[1.01] active:scale-[0.99] transition duration-155 flex items-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Xóa Lịch Sử Học &amp; Đặt Lại Số Câu Đúng
                    </button>
                  </div>
                )}
                <HistoryLog records={history} />
              </div>
            )}

            {activeTab === 'wheel' && profile && (
              <div className="animate-fade-in bg-slate-900/60 p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl space-y-6">
                <LuckyWheel
                  profile={profile}
                  onUpdateProfile={(updatedProfile) => saveProfileToLS(updatedProfile)}
                />
              </div>
            )}

            {activeTab === 'mainframe' && profile && (
              <div className="animate-fade-in">
                <MainframeExplorer profile={profile} onGainXP={(xpVal) => addXP(xpVal)} />
              </div>
            )}

          </motion.div>
        )}

        {/* NORMAL GAME ACTIVE */}
        {activeView === 'normal-play' && selectedTopic && (
          <motion.div
            key="normal-play"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          >
            <NormalGame
              topic={selectedTopic}
              customQuestions={customQuestions}
              excludeIds={completedIds}
              username={profile?.username || 'Học sinh'}
              studentClass={profile?.studentClass || 'Lớp 6'}
              onExit={() => { setActiveView('dashboard'); setSelectedTopic(null); }}
              onGameComplete={handleNormalGameComplete}
            />
          </motion.div>
        )}

        {/* PRACTICE GAME ACTIVE */}
        {activeView === 'practice' && (
          <motion.div
            key="practice"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          >
            <PracticeGame
              studentClass={profile?.studentClass || 'Lớp 6'}
              onGainXP={(xp) => addXP(xp)}
              onExit={() => setActiveView('dashboard')}
            />
          </motion.div>
        )}

        {/* PVP ACTIVE */}
        {activeView === 'pvp' && profile && (
          <motion.div
            key="pvp"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          >
            <PvPGame
              userProfile={profile}
              onExit={() => setActiveView('dashboard')}
              onGameComplete={handlePvPComplete}
            />
          </motion.div>
        )}

        {/* SPECIAL GAME ACTIVE */}
        {activeView === 'special' && profile && (
          <motion.div
            key="special"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          >
            <SpecialGame
              profile={profile}
              onExit={() => setActiveView('dashboard')}
              onGainXP={(xp) => addXP(xp)}
            />
          </motion.div>
        )}

        {/* MEMORY MODE ACTIVE */}
        {activeView === 'memory-mode' && profile && (
          <motion.div
            key="memory-mode"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          >
            <MemoryModeGame
              profile={profile}
              onExit={() => setActiveView('dashboard')}
              onGainXP={(xpGained, finalScore) => {
                addXP(xpGained);
                
                // Update the most recent 'Miền Ký Ức 🌌' record that has score === 0
                const updatedHistory = [...history];
                for (let i = updatedHistory.length - 1; i >= 0; i--) {
                  if (updatedHistory[i].topicName === 'Miền Ký Ức 🌌' && updatedHistory[i].score === 0) {
                    updatedHistory[i] = { ...updatedHistory[i], score: finalScore };
                    break;
                  }
                }
                saveHistoryToLS(updatedHistory);
                
                const finalProfile = reEvaluateBadges({
                  ...profile,
                  xp: profile.xp + xpGained
                }, updatedHistory);
                saveProfileToLS(finalProfile, updatedHistory);
              }}
              useTicket={() => {
                if (!profile) return;
                const tickets = Math.max(0, (profile.vipTickets || 0) - 1);
                const nRecord: HistoryRecord = {
                  id: `record_mem_${Date.now()}`,
                  timestamp: new Date().toISOString(),
                  mode: 'special',
                  topicName: 'Miền Ký Ức 🌌',
                  score: 0,
                  totalQuestions: 5,
                  durationSeconds: 150,
                  titleEarned: 'Ký Ức Học Sinh'
                };
                const updatedHistory = [...history, nRecord];
                
                // First save history records
                setHistory(updatedHistory);
                localStorage.setItem('study_game_history', JSON.stringify(updatedHistory));

                // Then update profile with both the updated VIP tickets and updated history
                saveProfileToLS({
                  ...profile,
                  vipTickets: tickets
                }, updatedHistory);
              }}
            />
          </motion.div>
        )}

        </AnimatePresence>

      </main>

      {/* Avatar Customize Modal Popup */}
      {isAvatarModalOpen && profile && (
        <div className="fixed inset-0 bg-slate-950/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm z-[100] animate-fade-in animate-duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl relative space-y-5 animate-[scaleUp_0.18s_ease-out]">
            <button 
              type="button"
              onClick={() => setIsAvatarModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 cursor-pointer p-1.5 hover:bg-slate-800 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <h3 className="text-base font-serif font-black text-slate-100 italic flex items-center gap-2">
                <User className="text-amber-500 w-4 h-4" />
                Thay đổi ảnh đại diện
              </h3>
              <p className="text-[11px] text-slate-400">Chọn một linh vật biểu trưng học đường hoặc tải tập ảnh của riêng bạn.</p>
            </div>

            {/* Built-in emojis list */}
            <div className="space-y-2">
              <h4 className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Linh vật biểu trưng học tập</h4>
              <div className="grid grid-cols-7 gap-1.5">
                {AVATAR_OPTIONS.map((avatar) => {
                  const isSelected = profile.avatar === avatar;
                  return (
                    <button
                      key={avatar}
                      type="button"
                      onClick={() => {
                        const updatedProfile = { ...profile, avatar };
                        saveProfileToLS(updatedProfile);
                        setIsAvatarModalOpen(false);
                      }}
                      className={`w-9 h-9 text-xl flex items-center justify-center rounded-xl border transition cursor-pointer select-none ${
                        isSelected
                          ? 'bg-amber-500/10 border-amber-500 scale-105 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                          : 'bg-slate-950 border-slate-850 hover:border-slate-700 hover:bg-slate-900'
                      }`}
                    >
                      {avatar}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-slate-800"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-slate-900 px-3 text-[10px] text-slate-500 font-bold">Hoặc Tải ảnh cá nhân</span>
              </div>
            </div>

            {/* File Dropper implementation */}
            <AvatarFileDropper 
              profile={profile} 
              onCompleted={(updatedProfile) => {
                saveProfileToLS(updatedProfile);
                setIsAvatarModalOpen(false);
              }} 
            />
          </div>
        </div>
      )}

      {/* Saved Account Deletion confirmation modal */}
      {accountToDelete && (
        <div className="fixed inset-0 bg-slate-950/85 z-50 flex items-center justify-center p-4 backdrop-blur-sm z-[100] animate-fade-in animate-duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl relative space-y-5 animate-[scaleUp_0.18s_ease-out]">
            <button 
              type="button"
              onClick={() => setAccountToDelete(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 cursor-pointer p-1.5 hover:bg-slate-800 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-rose-500/10 border border-rose-500/20 text-rose-450 text-rose-400 rounded-2xl flex items-center justify-center mx-auto text-xl">
                🗑️
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-serif font-black text-slate-100 italic">
                  Xóa tài khoản đã lưu?
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed text-center">
                  Bạn đang chuẩn bị xóa tài khoản <strong className="text-amber-400 font-mono">{accountToDelete}</strong> khỏi trình duyệt máy này. Tất cả chỉ số cấp độ, lịch sử và huy hiệu đã ghi nhận sẽ bị xóa sạch!
                </p>
              </div>
            </div>

            <div className="space-y-2 font-mono">
              <button
                type="button"
                onClick={() => {
                  const updated = savedAccounts.filter(acc => acc.username.toLowerCase() !== accountToDelete.toLowerCase());
                  setSavedAccounts(updated);
                  localStorage.setItem('study_game_saved_accounts', JSON.stringify(updated));
                  
                  // If current logged-in user is deleted, return to login state
                  if (profile && profile.username.toLowerCase() === accountToDelete.toLowerCase()) {
                    saveProfileToLS(null);
                    setInputName('');
                    setLoginError('');
                    setActiveView('login');
                  }
                  
                  setAccountToDelete(null);
                }}
                className="w-full bg-rose-650 hover:bg-rose-550 text-white font-extrabold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition duration-150 cursor-pointer text-center shadow-lg shadow-rose-950/40"
              >
                Xác nhận xoá bỏ 🗑️
              </button>

              <button
                type="button"
                onClick={() => setAccountToDelete(null)}
                className="w-full bg-slate-805 bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-slate-200 font-bold py-2.5 px-4 rounded-xl text-xs transition duration-150 cursor-pointer text-center"
              >
                Hủy bỏ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal Popup */}
      {isResetConfirmOpen && profile && (
        <div className="fixed inset-0 bg-slate-950/85 z-50 flex items-center justify-center p-4 backdrop-blur-sm z-[100] animate-fade-in animate-duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl relative space-y-5 animate-[scaleUp_0.18s_ease-out]">
            <button 
              type="button"
              onClick={() => setIsResetConfirmOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 cursor-pointer p-1.5 hover:bg-slate-800 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-rose-500/10 border border-rose-500/20 text-rose-450 text-rose-400 rounded-2xl flex items-center justify-center mx-auto text-xl">
                ⚠️
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-serif font-black text-slate-100 italic">
                  Đặt lại kết quả học tập?
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Bạn có chắc chắn muốn làm mới chỉ số <strong className="text-emerald-400 font-mono">Số câu đúng</strong> không? Hãy chọn hình thức đặt lại:
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={handleResetHistoryOnly}
                className="w-full bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-150 font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition duration-150 cursor-pointer text-center"
              >
                <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
                Chỉ Reset Số câu đúng &amp; Lịch sử
              </button>

              <button
                type="button"
                onClick={handleResetEverything}
                className="w-full bg-gradient-to-r from-rose-650 to-amber-650 hover:from-rose-550 hover:to-amber-550 bg-rose-650 hover:bg-rose-600 text-white font-extrabold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition duration-150 cursor-pointer text-center shadow-md shadow-rose-950/20"
              >
                🔥 Reset Toàn Bộ (Cấp 1 &amp; 0 XP)
              </button>

              <button
                type="button"
                onClick={() => {
                  if (window.confirm("Bạn có chắc chắn muốn XÓA HOÀN TOÀN tài khoản này khỏi máy không? Mọi lịch sử và cấp độ đều sẽ bị xoá sạch!")) {
                    handleDeleteActiveAccount();
                  }
                }}
                className="w-full bg-rose-950/40 hover:bg-rose-900/50 text-rose-400 font-extrabold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition duration-150 cursor-pointer text-center border border-rose-500/20"
              >
                🗑️ Xóa Vĩnh Viễn Tài Khoản Này
              </button>

              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(false)}
                className="w-full bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-slate-200 font-bold py-2.5 px-4 rounded-xl text-xs transition duration-150 cursor-pointer text-center"
              >
                Hủy bỏ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Game completion results display alert box modal */}
      {resultsModal && resultsModal.isOpen && (
        <div className="fixed inset-0 bg-slate-950/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in z-[100]">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center space-y-6 transform animate-[scaleUp_0.2s_ease-out]">
            <div className="space-y-2">
              <span className="text-5xl block animate-bounce">
                {resultsModal.won !== false ? '🎓' : '🥺'}
              </span>
              <h3 className="text-xl sm:text-2xl font-serif italic font-black text-slate-100">
                {resultsModal.won !== false ? 'Thi cử thành công!' : 'Trận đấu kết thúc'}
              </h3>
              <p className="text-xs text-slate-400">Mã kết quả đã lưu vào cơ sở học bạ cá nhân.</p>
            </div>

            {/* Meme Display for Losers */}
            {resultsModal.won === false && resultsModal.memeText && (
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2 text-center select-none shadow-inner">
                <p className="text-[10px] text-amber-500 font-extrabold uppercase tracking-widest">🔥 Meme Học Sinh Thất Trận</p>
                <p className="text-xs font-bold text-slate-300 leading-relaxed italic">
                  "{resultsModal.memeText}"
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-2xl">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Điểm đạt</p>
                <p className="text-2xl font-mono font-black text-amber-400">{resultsModal.score}</p>
                <p className="text-[10px] text-slate-500 font-medium">trên {resultsModal.total} câu</p>
              </div>

              <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-2xl">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Thưởng XP</p>
                <p className="text-2xl font-mono font-black text-emerald-400">+{resultsModal.xpGained}</p>
                <p className="text-[10px] text-slate-500 font-medium">Lớp học tiếp bộ</p>
              </div>
            </div>

            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 inline-flex items-center gap-2 justify-center w-full">
              <Award className="w-5 h-5 text-amber-500 shrink-0" />
              <div className="text-left">
                <span className="text-[10px] text-slate-500 font-bold block uppercase leading-none">Danh hiệu gặt hái</span>
                <span className="text-xs font-extrabold text-amber-400">{resultsModal.title}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setResultsModal(null)}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold py-3 px-4 rounded-xl text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition cursor-pointer"
            >
              Trở lại Bảng điều khiển
            </button>
          </div>
        </div>
      )}

      {/* 4. Footer credit panel */}
      <footer className="bg-transparent border-t border-slate-900/60 py-6 text-center">
        <p className="text-[10px] text-slate-600 font-mono">
          Phát triển theo chuẩn Giáo trình THCS Việt Nam &amp; Tối ưu hóa bởi Gemini 3.5 AI
        </p>
      </footer>
    </div>
  );
}
