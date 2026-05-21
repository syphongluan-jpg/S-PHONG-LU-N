import React, { useState, useEffect } from 'react';
import { UserProfile, HistoryRecord, Question, LeaderboardItem } from './types';
import { checkUsername } from './utils/nameChecker';
import { HistoryLog } from './components/HistoryLog';
import { Leaderboard } from './components/Leaderboard';
import { CustomQuizCreator } from './components/CustomQuizCreator';
import { NormalGame } from './components/NormalGame';
import { PracticeGame } from './components/PracticeGame';
import { PvPGame } from './components/PvPGame';
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
  FlameKindling
} from 'lucide-react';

const CLASS_LIST = [
  'Lớp 1', 'Lớp 2', 'Lớp 3', 'Lớp 4', 'Lớp 5', 'Lớp 6', 
  'Lớp 7', 'Lớp 8', 'Lớp 9', 'Lớp 10', 'Lớp 11', 'Lớp 12', 'Đại Học'
];

const INITIAL_BOT_PLAYERS: LeaderboardItem[] = [
  { id: 'bot_1', username: 'Nguyễn Chí Thanh', studentClass: 'Lớp 12', level: 125, xp: 26050, title: 'Học Đế 👑', isBot: true },
  { id: 'bot_2', username: 'Lê Kiều Trinh', studentClass: 'Lớp 9', level: 82, xp: 16800, title: 'Học Giả', isBot: true },
  { id: 'bot_3', username: 'Phan Minh Tuấn', studentClass: 'Lớp 8', level: 45, xp: 9240, title: 'Học Sinh', isBot: true },
  { id: 'bot_4', username: 'Đỗ Hà Vân', studentClass: 'Lớp 7', level: 21, xp: 4300, title: 'Học Sinh', isBot: true },
  { id: 'bot_5', username: 'Trần Đăng Khoa', studentClass: 'Đại Học', level: 95, xp: 19800, title: 'Học Giả', isBot: true },
];

export default function App() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [customQuestions, setCustomQuestions] = useState<Question[]>([]);
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  
  // Navigation
  const [activeView, setActiveView] = useState<'login' | 'dashboard' | 'normal-play' | 'practice' | 'pvp'>('login');
  const [selectedTopic, setSelectedTopic] = useState<'cadao' | 'toanhoc' | 'lichsu' | 'khoahoc' | 'custom' | null>(null);
  const [activeTab, setActiveTab] = useState<'play' | 'leaderboard' | 'custom' | 'history'>('play');

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
  }, []);

  // Sync to LS whenever states change
  const saveProfileToLS = (nProfile: UserProfile | null) => {
    setProfile(nProfile);
    if (nProfile) {
      localStorage.setItem('study_game_user_profile', JSON.stringify(nProfile));
    } else {
      localStorage.removeItem('study_game_user_profile');
    }
  };

  const saveHistoryToLS = (nHistory: HistoryRecord[]) => {
    setHistory(nHistory);
    localStorage.setItem('study_game_history', JSON.stringify(nHistory));
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

    if (!inputName.trim()) {
      setLoginError('Vui lòng điền đầy đủ Họ và tên học sinh!');
      return;
    }

    const checkRes = checkUsername(inputName);
    if (!checkRes.isValid) {
      setLoginError(checkRes.reason || 'Tên phản cảm hoặc không đúng cách thức.');
      return;
    }

    const newProfile: UserProfile = {
      username: inputName.trim(),
      studentClass: inputClass,
      level: 1,
      xp: 0,
      unlockedBadges: [],
      title: 'Học Sinh',
    };

    saveProfileToLS(newProfile);
    setActiveView('dashboard');
    setActiveTab('play');
  };

  // XP Gains handler (triggers Level up check)
  const addXP = (amount: number) => {
    if (!profile) return;
    
    const newXP = profile.xp + amount;
    // Level target: math limit 1000
    // Level = floor(sqrt(xp / 20)) + 1
    const targetLevel = Math.min(1000, Math.floor(Math.sqrt(newXP / 20)) + 1);
    
    const hasLeveledUp = targetLevel > profile.level;
    
    const updatedProfile: UserProfile = {
      ...profile,
      xp: newXP,
      level: targetLevel,
    };

    // Badge checker
    let updatedBadges = [...profile.unlockedBadges];
    if (targetLevel >= 5 && !updatedBadges.includes('badge_level_5')) {
      updatedBadges.push('badge_level_5');
    }
    if (targetLevel >= 10 && !updatedBadges.includes('badge_level_10')) {
      updatedBadges.push('badge_level_10');
    }

    // Check custom question badges if they meet requirements
    updatedProfile.unlockedBadges = updatedBadges;

    // Check and preserve pvp title if already earned
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
    
    const updatedProfile = {
      ...profile,
      unlockedBadges: currentBadges,
      xp: profile.xp + gainedXP,
      level: Math.min(1000, Math.floor(Math.sqrt((profile.xp + gainedXP) / 20)) + 1)
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
    const nextLvl = Math.min(1000, Math.floor(Math.sqrt(nextXP / 20)) + 1);

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

  // Formulate active level details
  const getLevelProgressPercentage = () => {
    if (!profile) return 0;
    const currentLvlXPStart = 20 * (profile.level - 1) * (profile.level - 1);
    const nextLvlXPEnd = 20 * profile.level * profile.level;
    const diffTotal = nextLvlXPEnd - currentLvlXPStart;
    const diffCurrent = profile.xp - currentLvlXPStart;
    
    if (diffTotal <= 0) return 100;
    return Math.max(0, Math.min(100, (diffCurrent / diffTotal) * 100));
  };

  const getXPRequiredForNextLevel = () => {
    if (!profile) return 0;
    return 20 * profile.level * profile.level;
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
        
        {/* LOGIN SCREEN */}
        {activeView === 'login' && (
          <div className="max-w-md mx-auto my-12 bg-slate-900/40 border border-slate-800/80 p-6 sm:p-10 rounded-3xl shadow-xl space-y-6">
            <div className="text-center space-y-2 animate-fade-in">
              <span className="text-5xl">🇻🇳</span>
              <h2 className="text-2xl font-serif font-black text-slate-100 italic">Ghi danh Học viên</h2>
              <p className="text-xs text-slate-400 leading-normal">Đăng ký họ tên và cấp học của bạn để ghi danh bảng vàng thi cử trí tuệ.</p>
            </div>

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

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold py-3.5 px-4 rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.01] transition duration-150 text-xs uppercase tracking-wider cursor-pointer"
              >
                🚀 Bắt đầu hành trình
              </button>
            </form>
          </div>
        )}

        {/* STUDY DASHBOARD */}
        {activeView === 'dashboard' && profile && (
          <div className="space-y-6">
            
            {/* User status card header */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="w-12 h-12 bg-slate-950 rounded-2xl flex items-center justify-center text-2xl font-bold border border-slate-800">
                    👨‍🎓
                  </div>
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
                  <p className="text-xl font-mono font-black text-emerald-400">
                    {history.reduce((sum, r) => sum + r.score, 0)}
                  </p>
                </div>
              </div>
            </div>

            {/* Tab controllers */}
            <div className="flex border-b border-slate-800/80 overflow-x-auto gap-2 py-1 scrollbar-none">
              {[
                { id: 'play', name: 'Đề thi & Luyện tập', icon: Play },
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
            {activeTab === 'play' && (
              <div className="space-y-6 animate-fade-in">
                
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
                      { id: 'cadao', name: 'Ca dao Tục ngữ VN', icon: '📜', desc: 'Đề tài thi ca dân gian Việt Nam.', borderHover: 'hover:border-amber-500/40' },
                      { id: 'toanhoc', name: 'Toán học THCS', icon: '🧮', desc: 'Công thức & tư duy lô gic số học.', borderHover: 'hover:border-amber-500/40' },
                      { id: 'lichsu', name: 'Lịch sử Việt Nam', icon: '🛡️', desc: 'Các trang vàng lịch sử hào hùng.', borderHover: 'hover:border-amber-500/40' },
                      { id: 'khoahoc', name: 'Khoa học Tự nhiên', icon: '🔬', desc: 'Sự thật sinh lý hóa học quanh ta.', borderHover: 'hover:border-amber-500/40' }
                    ].map((mod) => (
                      <div 
                        key={mod.id}
                        className={`p-5 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-4 transition-all duration-200 ${mod.borderHover} hover:bg-slate-900/60 bg-slate-900/30 bg-white shadow-sm`}
                      >
                        <div className="space-y-2">
                          <span className="text-3xl block mb-2">{mod.icon}</span>
                          <h4 className="font-serif italic font-extrabold text-sm text-slate-200">{mod.name}</h4>
                          <p className="text-xs text-slate-400 leading-normal">{mod.desc}</p>
                        </div>

                        <button
                          onClick={() => { setSelectedTopic(mod.id as any); setActiveView('normal-play'); }}
                          className="w-full bg-slate-950 border border-slate-800 text-amber-400 hover:bg-amber-500/10 font-bold py-2.5 px-4 rounded-xl text-xs transition duration-150 cursor-pointer text-center"
                        >
                          Làm đề thi thử
                        </button>
                      </div>
                    ))}
                  </div>
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
              <HistoryLog records={history} />
            )}

          </div>
        )}

        {/* NORMAL GAME ACTIVE */}
        {activeView === 'normal-play' && selectedTopic && (
          <NormalGame
            topic={selectedTopic}
            customQuestions={customQuestions}
            excludeIds={completedIds}
            username={profile?.username || 'Học sinh'}
            studentClass={profile?.studentClass || 'Lớp 6'}
            onExit={() => { setActiveView('dashboard'); setSelectedTopic(null); }}
            onGameComplete={handleNormalGameComplete}
          />
        )}

        {/* PRACTICE GAME ACTIVE */}
        {activeView === 'practice' && (
          <PracticeGame
            studentClass={profile?.studentClass || 'Lớp 6'}
            onGainXP={(xp) => addXP(xp)}
            onExit={() => setActiveView('dashboard')}
          />
        )}

        {/* PVP ACTIVE */}
        {activeView === 'pvp' && profile && (
          <PvPGame
            userProfile={profile}
            onExit={() => setActiveView('dashboard')}
            onGameComplete={handlePvPComplete}
          />
        )}

      </main>

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
