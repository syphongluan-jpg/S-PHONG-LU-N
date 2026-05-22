import React, { useState, useEffect, useRef } from 'react';
import { Question, UserProfile } from '../types';
import { LOCAL_QUESTIONS } from '../localQuestions';
import { 
  Heart, 
  Zap, 
  Clock, 
  Flame, 
  Trophy, 
  X, 
  ArrowRight, 
  Sparkles, 
  HelpCircle, 
  RotateCcw,
  BookOpen,
  Volume2,
  VolumeX,
  History
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { soundManager } from '../utils/ambientMusic';

interface SpecialGameProps {
  profile: UserProfile;
  onExit: () => void;
  onGainXP: (xp: number) => void;
}

interface HighScoreRecord {
  score: number;
  maxStreak: number;
  timestamp: string;
}

// 18 Vietnamese Fun/Troll Brain-teaser questions
const TROLL_QUESTIONS: Question[] = [
  {
    id: 'troll_1',
    topic: 'cadao',
    type: 'multiple-choice',
    questionText: 'Một con vịt đi trước hai con vịt, một con vịt đi sau hai con vịt, một con vịt đi giữa hai con vịt. Hỏi có tất cả mấy con vịt?',
    options: ['A. 3 con vịt', 'B. 4 con vịt', 'C. 5 con vịt', 'D. 6 con vịt'],
    correctAnswer: 'A',
    explanation: 'Chỉ có 3 con vịt đi thẳng hàng một hàng dọc: vịt đầu đi trước 2 vịt sau, vịt cuối đi sau 2 vịt trước, vịt giữa đi giữa 2 vịt!',
    difficulty: 'trung-binh'
  },
  {
    id: 'troll_2',
    topic: 'khoahoc',
    type: 'multiple-choice',
    questionText: 'Khi bạn chạy đua và vượt qua người đang ở vị trí thứ hai, lúc đó bạn đứng ở vị trí thứ mấy?',
    options: ['A. Vị trí thứ nhất', 'B. Vị trí thứ hai', 'C. Vị trí thứ ba', 'D. Vị trí bét bảng'],
    correctAnswer: 'B',
    explanation: 'Bạn vượt qua người thứ hai tức là bạn thế chỗ của họ, bạn vẫn đang ở vị trí thứ hai thôi!',
    difficulty: 'de'
  },
  {
    id: 'troll_3',
    topic: 'lichsu',
    type: 'multiple-choice',
    questionText: 'Đố bạn biết con đường nào dài nhất thế giới?',
    options: ['A. Đường Trường Sơn lịch sử', 'B. Đường xích đạo Trái Đất', 'C. Đường đời gian truân', 'D. Đường Quốc lộ 1A'],
    correctAnswer: 'C',
    explanation: 'Đường đời là con đường dài nhất, kéo dài suốt cả một đời người!',
    difficulty: 'de'
  },
  {
    id: 'troll_4',
    topic: 'khoahoc',
    type: 'multiple-choice',
    questionText: 'Cái gì mang màu đen khi bạn mới mua, màu đỏ rực khi đang dùng và xám xịt khi vứt bỏ?',
    options: ['A. Điếu thuốc lá', 'B. Thanh sắt rèn nung', 'C. Than củi sưởi', 'D. Viên gạch nung'],
    correctAnswer: 'C',
    explanation: 'Đá là than củi! Khi mua thì có màu đen sẫm, khi đốt sưởi thì đỏ hồng lửa, khi tàn vứt đi chỉ còn là tro xám xịt.',
    difficulty: 'trung-binh'
  },
  {
    id: 'troll_5',
    topic: 'toanhoc',
    type: 'multiple-choice',
    questionText: 'Bố của cô bé Mary có 5 người con gái: Nana, Nene, Nini, Nono. Hỏi người con gái thứ năm tên là gì?',
    options: ['A. Nunu đáng yêu', 'B. Nyny kiêu kỳ', 'C. Mary tinh nghịch', 'D. Không có tên nào khác'],
    correctAnswer: 'C',
    explanation: 'Bố của Mary thì chắc chắn người con gái thứ năm chính là Mary rồi!',
    difficulty: 'de'
  },
  {
    id: 'troll_6',
    topic: 'toanhoc',
    type: 'multiple-choice',
    questionText: 'Cái gì càng lau chùi sạch sẽ thì nó lại càng biến thành màu đen bẩn?',
    options: ['A. Miếng mút lau nhà', 'B. Tấm bảng đen trường học', 'C. Cửa kính chống nắng', 'D. Chiếc điện thoại thông minh'],
    correctAnswer: 'B',
    explanation: 'Tấm bảng đen lớp học, càng viết phấn xong lau sạch thì tấm bảng lại hiện rõ màu đen bóng loáng ban đầu.',
    difficulty: 'de'
  },
  {
    id: 'troll_7',
    topic: 'lichsu',
    type: 'multiple-choice',
    questionText: 'Đố bạn: Cuốn lịch nào dài nhất trong lịch sử nhân loại?',
    options: ['A. Lịch vạn niên cổ', 'B. Lịch sử tiến hóa loài người', 'C. Lịch âm dương ngũ hành', 'D. Lịch treo tường siêu đại'],
    correctAnswer: 'B',
    explanation: 'Lịch sử là cuốn lịch dài nhất, ghi chép lại toàn bộ tiến trình thời gian từ thuở sơ khai cho đến mãi mãi về sau!',
    difficulty: 'de'
  },
  {
    id: 'troll_8',
    topic: 'cadao',
    type: 'multiple-choice',
    questionText: 'Đố bạn: Tỉnh/Xã nào có số dân đông đúc nhất hành tinh hiện tại?',
    options: ['A. Xã hội loài người', 'B. Xã Đàn trung tâm Hà Nội', 'C. Tỉnh Thanh Hóa rộng lớn', 'D. Xã Nghĩa trang'],
    correctAnswer: 'A',
    explanation: 'Xã hội tụ họp toàn thể loài người trên toàn thế giới nên hiển nhiên đây là xã đông dân nhất!',
    difficulty: 'trung-binh'
  },
  {
    id: 'troll_9',
    topic: 'toanhoc',
    type: 'multiple-choice',
    questionText: 'Một năm có tối đa bao nhiêu tháng có ít nhất 28 ngày?',
    options: ['A. Chỉ 1 tháng (Tháng Hai)', 'B. 4 tháng hè thu', 'C. 6 tháng chẵn', 'D. Đủ cả 12 tháng'],
    correctAnswer: 'D',
    explanation: 'Tất cả 12 tháng trong năm đều có ít nhất là 28 ngày! Các tháng còn lại thậm chí có 30 hoặc 31 ngày.',
    difficulty: 'de'
  },
  {
    id: 'troll_10',
    topic: 'khoahoc',
    type: 'multiple-choice',
    questionText: 'Cái gì mà bạn có thể dễ dàng bắt lấy (truyền nhiễm) nhưng tuyệt đối không thể ném đi?',
    options: ['A. Quả bong bóng xà phòng', 'B. Ngọn gió ban mai', 'C. Bệnh cảm lạnh/Cúm mùa', 'D. Vận may giàu có'],
    correctAnswer: 'C',
    explanation: 'Bị nhiễm/mắc cảm cúm (tiếng Anh: catch a cold). Bạn bị lây bệnh chứ không thể ném bệnh đi bừa bãi được!',
    difficulty: 'trung-binh'
  }
];

export function SpecialGame({ onExit, onGainXP }: SpecialGameProps) {
  // Game states
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [activeQuestion, setActiveQuestion] = useState<Question | null>(null);
  
  // 1: Easy ('de'), 2: Medium ('trung-binh'), 3: Hard ('kho'), 4: Expert ('thach-thuc')
  const [currentDifficultyTier, setCurrentDifficultyTier] = useState<'de' | 'trung-binh' | 'kho' | 'thach-thuc'>('de');
  
  // Timer settings
  const [timeLeft, setTimeLeft] = useState(10); // 10 seconds max limit
  const [isAnswered, setIsAnswered] = useState(false);
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [isGameOver, setIsGameOver] = useState(false);
  
  // Settings & highscore list
  const [isMuted, setIsMuted] = useState(false);
  const [pastHighScores, setPastHighScores] = useState<HighScoreRecord[]>([]);
  const [isNewHighScore, setIsNewHighScore] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const synthRef = useRef<AudioContext | null>(null);

  // Load high scores
  useEffect(() => {
    const saved = localStorage.getItem('study_game_special_highscores');
    if (saved) {
      try {
        setPastHighScores(JSON.parse(saved));
      } catch (e) {
        console.error("Lỗi parse lịch sử điểm cao", e);
      }
    }
  }, []);

  // Fetch / Generate next question dynamically based on adaptive difficulty
  const generateAdaptiveQuestion = () => {
    setIsAnswered(false);
    setSelectedLetter(null);
    setTimeLeft(10);

    let difficultyTarget: 'de' | 'trung-binh' | 'kho' | 'thach-thuc' = 'de';
    if (currentStreak >= 3 && currentStreak < 6) {
      difficultyTarget = 'trung-binh';
    } else if (currentStreak >= 6 && currentStreak < 9) {
      difficultyTarget = 'kho';
    } else if (currentStreak >= 9) {
      difficultyTarget = 'thach-thuc';
    }
    setCurrentDifficultyTier(difficultyTarget);

    const useTroll = Math.random() < 0.35;
    let chosenQ: Question;

    if (useTroll) {
      const candidates = TROLL_QUESTIONS.filter(q => q.difficulty === difficultyTarget || q.difficulty === 'de' || q.difficulty === 'trung-binh');
      const fallbackList = TROLL_QUESTIONS;
      chosenQ = candidates[Math.floor(Math.random() * candidates.length)] || fallbackList[Math.floor(Math.random() * fallbackList.length)];
    } else {
      const candidates = LOCAL_QUESTIONS.filter(q => q.difficulty === difficultyTarget && q.type === 'multiple-choice');
      const fallbackList = LOCAL_QUESTIONS.filter(q => q.type === 'multiple-choice');
      chosenQ = candidates[Math.floor(Math.random() * candidates.length)] || fallbackList[Math.floor(Math.random() * fallbackList.length)];
    }

    if (!chosenQ) {
      chosenQ = TROLL_QUESTIONS[0];
    }

    const modifiedQ: Question = {
      ...chosenQ,
      id: `${chosenQ.id}_special_${Date.now()}`
    };

    setActiveQuestion(modifiedQ);
  };

  // Sound generator using Web Audio API Synth if enabled
  const playSound = (type: 'correct' | 'wrong' | 'gameover' | 'tick' | 'highscore') => {
    if (isMuted) return;
    try {
      if (type === 'correct') {
        soundManager.playCorrect();
      } else if (type === 'wrong') {
        soundManager.playIncorrect();
      } else if (type === 'tick') {
        soundManager.playTick(600);
      } else if (type === 'highscore' || type === 'gameover') {
        soundManager.playLevelUp();
      }
    } catch (e) {
      console.warn("Lỗi tạo âm thanh tinh giản:", e);
    }
  };

  // Initialize first question
  useEffect(() => {
    generateAdaptiveQuestion();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Timer Countdown loop
  useEffect(() => {
    if (isGameOver || isAnswered) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleWrongAnswer();
          return 0;
        }
        if (prev <= 4) {
          playSound('tick'); 
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeQuestion, isGameOver, isAnswered]);

  const handleWrongAnswer = () => {
    setIsAnswered(true);
    playSound('wrong');
    setCurrentStreak(0);
    const newLives = lives - 1;
    setLives(newLives);

    if (newLives <= 0) {
      handleEndGame(score);
    }
  };

  const handleAnswerClick = (optionLetter: string) => {
    if (isAnswered || isGameOver) return;
    setIsAnswered(true);
    setSelectedLetter(optionLetter);

    if (timerRef.current) clearInterval(timerRef.current);

    const isCorrect = optionLetter === activeQuestion?.correctAnswer;

    if (isCorrect) {
      playSound('correct');
      const newStreak = currentStreak + 1;
      setCurrentStreak(newStreak);
      if (newStreak > maxStreak) {
        setMaxStreak(newStreak);
      }

      const speedBonus = timeLeft >= 8 ? 5 : timeLeft >= 6 ? 3 : 0;
      const pointsEarned = 10 + (2 * newStreak) + speedBonus;
      setScore(prev => prev + pointsEarned);

    } else {
      playSound('wrong');
      setCurrentStreak(0);
      const newLives = lives - 1;
      setLives(newLives);
      if (newLives <= 0) {
        handleEndGame(score);
      }
    }
  };

  const handleEndGame = (finalScore: number) => {
    setIsGameOver(true);
    playSound('gameover');

    const newRecord: HighScoreRecord = {
      score: finalScore,
      maxStreak: maxStreak,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' - ' + new Date().toLocaleDateString('vi-VN')
    };

    const currentList = [...pastHighScores];
    const topScore = currentList.length > 0 ? Math.max(...currentList.map(r => r.score)) : 0;
    const isNewTop = finalScore > topScore && finalScore > 0;
    setIsNewHighScore(isNewTop);

    if (isNewTop) {
      setTimeout(() => playSound('highscore'), 1200);
    }

    currentList.push(newRecord);
    const updatedList = currentList.sort((a, b) => b.score - a.score).slice(0, 5);
    setPastHighScores(updatedList);
    localStorage.setItem('study_game_special_highscores', JSON.stringify(updatedList));

    const xpReward = Math.min(Math.floor(finalScore / 1.5), 150);
    if (xpReward > 0) {
      onGainXP(xpReward);
    }
  };

  const handleRestart = () => {
    setLives(3);
    setScore(0);
    setCurrentStreak(0);
    setMaxStreak(0);
    setIsGameOver(false);
    setIsNewHighScore(false);
    generateAdaptiveQuestion();
  };

  const getTopicDisplayName = (topicCode?: string) => {
    if (topicCode === 'cadao') return 'Ca Dao';
    if (topicCode === 'toanhoc') return 'Toán Học';
    if (topicCode === 'lichsu') return 'Lịch Sử';
    if (topicCode === 'khoahoc') return 'Khoa Học';
    return 'Lĩnh Vực Đố';
  };

  const getTopicBadgeColor = (topicCode?: string) => {
    if (topicCode === 'cadao') return 'bg-rose-500/15 text-rose-450 border border-rose-500/20';
    if (topicCode === 'toanhoc') return 'bg-cyan-500/15 text-cyan-405 border border-cyan-500/20';
    if (topicCode === 'lichsu') return 'bg-amber-500/15 text-amber-455 border border-amber-500/20';
    if (topicCode === 'khoahoc') return 'bg-emerald-500/15 text-emerald-455 border border-emerald-500/20';
    return 'bg-purple-500/15 text-purple-450 border border-purple-500/20';
  };

  const getDifficultyTierName = (tier: string) => {
    if (tier === 'de') return 'Dễ';
    if (tier === 'trung-binh') return 'Trung Bình';
    if (tier === 'kho') return 'Khó ⚡';
    return 'Thách Thức 🔥';
  };

  const getDifficultyTierColor = (tier: string) => {
    if (tier === 'de') return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (tier === 'trung-binh') return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20';
    if (tier === 'kho') return 'text-amber-400 bg-amber-500/10 border-amber-500/10';
    return 'text-rose-500 bg-rose-500/20 border-rose-500/30';
  };

  const getOptionLetter = (idx: number) => {
    if (idx === 0) return 'A';
    if (idx === 1) return 'B';
    if (idx === 2) return 'C';
    return 'D';
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      
      {/* 1. Header Toolbar */}
      <div className="flex justify-between items-center bg-slate-905 bg-slate-950 border-2 border-cyan-200/20 p-4 rounded-2xl font-mono">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-5 h-5 text-cyan-455 animate-pulse text-cyan-400" />
          <div>
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-105 text-white">
              ĐẤU TRƯỜNG SINH TỒN ADAPTIVE
            </h2>
            <p className="text-[9px] text-slate-500 uppercase font-bold tracking-wider leading-none mt-1">CHẾ ĐỘ TỰ CĂN CHỈNH COGNITIVE</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsMuted(prev => !prev)}
            className="p-2 text-slate-400 hover:text-slate-205 hover:text-slate-200 bg-slate-900 border border-slate-800 rounded-xl transition duration-150 cursor-pointer"
            title={isMuted ? "Bật âm thanh" : "Tắt âm thanh"}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-450" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>

          <button
            type="button"
            onClick={onExit}
            className="px-3.5 py-2.5 bg-slate-900 hover:bg-slate-805 border border-slate-800 text-slate-400 hover:text-white rounded-xl text-[10px] tracking-widest uppercase font-black transition duration-150 flex items-center gap-1 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            Thoát
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!isGameOver ? (
          <motion.div
            key="game-room"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.22 }}
            className="space-y-6"
          >
            
            {/* 2. Top Banner Status Grid: Score, Lives, Streak */}
            <div className="grid grid-cols-3 gap-3 font-mono">
              <div className="bg-slate-950 border-2 border-cyan-500/10 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                <span className="text-[9px] uppercase text-cyan-550 text-cyan-500/80 font-black tracking-wider mb-1">XUNG ĐIỂM</span>
                <span className="text-lg font-black text-amber-400 leading-none">{score}</span>
              </div>

              <div className="bg-slate-950 border-2 border-cyan-500/10 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                <span className="text-[9px] uppercase text-rose-500/80 font-black tracking-wider mb-1.5">SINH MỆNH</span>
                <div className="flex gap-1 items-center justify-center">
                  {[1, 2, 3].map((heartIdx) => {
                    const isFilled = lives >= heartIdx;
                    return (
                      <Heart 
                        key={heartIdx} 
                        className={`w-4 h-4 transition-transform duration-300 ${
                          isFilled 
                            ? 'text-rose-500 fill-rose-500 scale-105 filter drop-shadow-[0_0_6px_rgba(244,63,94,0.4)]' 
                            : 'text-slate-800 scale-95'
                        }`} 
                      />
                    );
                  })}
                </div>
              </div>

              <div className="bg-slate-950 border-2 border-cyan-500/10 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                <span className="text-[9px] uppercase text-orange-400/85 font-black tracking-wider mb-1">STREAK</span>
                <div className="flex items-center gap-1 justify-center leading-none">
                  <Flame className={`w-3.5 h-3.5 transition ${currentStreak > 0 ? 'text-orange-500 animate-bounce' : 'text-slate-700'}`} />
                  <span className={`text-lg font-black ${currentStreak > 0 ? 'text-orange-450 text-orange-400' : 'text-slate-600'}`}>
                    {currentStreak}
                  </span>
                </div>
              </div>
            </div>

            {/* 3. Snappy Timer Bar */}
            <div className="space-y-1.5 font-mono">
              <div className="flex justify-between items-center text-[10px] font-bold px-1 uppercase tracking-wider">
                <span className="flex items-center gap-1 leading-none text-slate-550 text-slate-500">
                  <Clock className={`w-3.5 h-3.5 ${timeLeft <= 3 ? 'text-rose-500 animate-spin' : 'text-slate-505 text-cyan-400'}`} />
                  XUNG NHỊP THỜI GIAN:
                </span>
                <span className={`text-xs ${timeLeft <= 3 ? 'text-rose-400 animate-pulse font-black' : 'text-cyan-400 font-bold'}`}>
                  {timeLeft}s SEC
                </span>
              </div>
              <div className="w-full bg-slate-950 border border-slate-900 rounded-full h-2.5 overflow-hidden">
                <motion.div 
                  initial={{ width: '100%' }}
                  animate={{ width: `${timeLeft * 10}%` }}
                  transition={{ duration: isAnswered ? 0.1 : 1, ease: 'linear' }}
                  className={`h-full rounded-full transition-all duration-300 ${
                    timeLeft <= 3 
                      ? 'bg-gradient-to-r from-rose-500 to-rose-600 shadow-[0_0_8px_rgba(239,68,68,0.5)]' 
                      : 'bg-gradient-to-r from-cyan-500 via-teal-400 to-indigo-500'
                  }`}
                />
              </div>
            </div>

            {/* 4. Core Question Component */}
            {activeQuestion && (
              <div className="bg-slate-950 border-2 border-cyan-500/30 rounded-3xl p-6 sm:p-8 shadow-[0_0_30px_rgba(6,182,212,0.15)] relative overflow-hidden space-y-6 cyber-scanlines">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent pointer-events-none" />
                
                {/* Visual badges (Topic, Adaptive Difficulty Indicator) */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-cyan-500/10 pb-4 font-mono">
                  <span className={`text-[10px] font-black px-3 py-1 rounded-md uppercase tracking-widest ${getTopicBadgeColor(activeQuestion.topic)}`}>
                    🛡️ {getTopicDisplayName(activeQuestion.topic).toUpperCase()}
                  </span>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-540 text-slate-500 font-bold uppercase tracking-wider">THUẬT TOÁN:</span>
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded border uppercase tracking-widest ${getDifficultyTierColor(currentDifficultyTier)}`}>
                      {getDifficultyTierName(currentDifficultyTier).toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Question Paragraph */}
                <h3 className="text-sm sm:text-base font-semibold text-slate-100 leading-relaxed text-center min-h-[48px] px-2 max-w-xl mx-auto">
                  {activeQuestion.questionText}
                </h3>

                {/* Multiple choice options */}
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-2">
                  {activeQuestion.options && activeQuestion.options.map((opt, oIdx) => {
                    const optLetter = getOptionLetter(oIdx);
                    const isSelected = selectedLetter === optLetter;
                    const isCorrectAnswer = optLetter === activeQuestion.correctAnswer;
                    const optText = opt.replace(/^[A-D]\.\s*/, ''); // strip prefix clean

                    let btnStyle = 'border-slate-850 bg-slate-900/25 text-slate-300 hover:border-cyan-500/40 hover:bg-slate-900/50';
                    let leadingBadgeStyle = 'bg-slate-950 border-slate-800 text-slate-400';

                    if (isAnswered) {
                      if (isCorrectAnswer) {
                        btnStyle = 'border-emerald-500 bg-emerald-500/10 text-emerald-350 font-bold';
                        leadingBadgeStyle = 'bg-emerald-555 bg-emerald-500 text-slate-900 border-transparent font-extrabold';
                      } else if (isSelected) {
                        btnStyle = 'border-rose-500 bg-rose-550 bg-rose-500/10 text-rose-350 font-bold';
                        leadingBadgeStyle = 'bg-rose-555 bg-rose-505 bg-rose-500 text-slate-900 border-transparent font-extrabold';
                      } else {
                        btnStyle = 'border-transparent bg-transparent text-slate-650 text-slate-600 opacity-30';
                      }
                    }

                    return (
                      <button
                        key={oIdx}
                        type="button"
                        disabled={isAnswered}
                        onClick={() => handleAnswerClick(optLetter)}
                        className={`p-4 text-left border-2 rounded-2xl text-xs sm:text-sm font-semibold transition duration-150 flex items-center gap-3.5 w-full cursor-pointer ${btnStyle}`}
                      >
                        <span className={`w-7 h-7 rounded-lg border flex items-center justify-center font-mono font-black text-xs shrink-0 select-none ${leadingBadgeStyle}`}>
                          {optLetter}
                        </span>
                        <span className="leading-normal flex-1">{optText}</span>
                      </button>
                    );
                  })}
                </div>

                {/* 5. Answer Explanatory Feedback Slide Down */}
                <AnimatePresence>
                  {isAnswered && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-t border-cyan-500/10 pt-5 space-y-4 overflow-hidden"
                    >
                      <div className="p-5 bg-cyan-950/15 border border-cyan-500/20 rounded-2xl space-y-2">
                        <div className="flex items-center gap-1.5 text-cyan-400 font-mono font-black text-[10px] uppercase tracking-widest">
                          <BookOpen className="w-4 h-4 text-cyan-400" />
                          GIẢI THÍCH CHUYÊN GIA (MAIN FRAME)
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed font-semibold">
                          {activeQuestion.explanation}
                        </p>
                      </div>

                      <div className="flex justify-end font-mono">
                        <button
                          type="button"
                          onClick={() => {
                            playSound('tick');
                            generateAdaptiveQuestion();
                          }}
                          className="bg-gradient-to-r from-cyan-500 via-teal-500 to-indigo-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-mono font-black py-3 px-6 rounded-xl text-xs flex items-center gap-1.5 uppercase tracking-widest shadow-[0_0_15px_rgba(6,182,212,0.35)] cursor-pointer"
                        >
                          TIẾP THEO (NEXT_Q)
                          <ArrowRight className="w-4 h-4 text-slate-950" />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>
            )}

          </motion.div>
        ) : (
          
          /* =================================== 
             5. GAME OVER / RESULT SCREEN 
             =================================== */
          <motion.div
            key="game-over-banner"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="space-y-6 animate-fade-in"
          >
            <div className="bg-slate-955 bg-slate-950 border-2 border-cyan-500/30 p-8 rounded-3xl shadow-[0_0_30px_rgba(6,182,212,0.15)] text-center relative space-y-6 overflow-hidden cyber-scanlines">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent pointer-events-none" />
              <div className="space-y-2 relative font-mono">
                <span className="text-5xl block animate-bounce filter drop-shadow-md">💀</span>
                <h3 className="text-lg font-black text-slate-100 uppercase tracking-widest">KẾT THÚC THỬ THÁCH SINH TỒN</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                  Trận tuyến phòng bích của bạn đã sập nguồn. Hệ thống ghi nhận các thông số vận hành như sau:
                </p>
              </div>

              {/* Personal Record Celebratory Highlight */}
              {isNewHighScore && (
                <div className="p-4 bg-gradient-to-r from-cyan-500/10 via-cyan-500/15 to-transparent border border-cyan-500/35 rounded-2xl flex flex-col sm:flex-row items-center justify-center gap-3 animate-pulse font-mono">
                  <Trophy className="w-8 h-8 text-amber-400 filter drop-shadow-[0_0_10px_rgba(245,158,11,0.5)] shrink-0" />
                  <div className="text-center sm:text-left">
                    <p className="text-xs text-amber-400 font-black uppercase tracking-widest">KỶ LỤC CÁ NHÂN MỚI THIẾT LẬP 🏆</p>
                    <p className="text-[10px] text-slate-400 leading-relaxed font-semibold mt-0.5">Bạn vừa ghi danh bảng mã điểm số xuất sắc nhất từ trước đến nay.</p>
                  </div>
                </div>
              )}

              {/* Metrics summary */}
              <div className="grid grid-cols-2 gap-4 max-w-md mx-auto font-mono">
                <div className="p-4 bg-slate-900/60 rounded-2xl border border-cyan-500/10 flex flex-col items-center justify-center space-y-1 shadow-inner">
                  <span className="text-[9px] text-slate-500 uppercase font-black tracking-wider">ĐIỂM SỐ</span>
                  <span className="text-2xl font-black text-cyan-400 leading-none">{score}</span>
                </div>

                <div className="p-4 bg-slate-900/60 rounded-2xl border border-cyan-500/10 flex flex-col items-center justify-center space-y-1 shadow-inner">
                  <span className="text-[9px] text-slate-500 uppercase font-black tracking-wider">KỶ LỤC STREAK</span>
                  <span className="text-2xl font-black text-rose-400 leading-none flex items-center gap-1">
                    <Flame className="w-5 h-5 text-orange-500 animate-pulse" />
                    {maxStreak}
                  </span>
                </div>
              </div>

              {/* Reward notice */}
              {Math.floor(score / 1.5) > 0 && (
                <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-black uppercase rounded-xl max-w-md mx-auto flex items-center justify-center gap-1.5 leading-none">
                  <Zap className="w-4 h-4 text-amber-400" />
                  NHẬN: +{Math.min(Math.floor(score / 1.5), 150)} EXP HỌC PHẦN HOÀN TẤT!
                </div>
              )}

              {/* Action Trigger keys */}
              <div className="flex flex-col sm:flex-row justify-center items-center gap-3 pt-2 font-mono">
                <button
                  type="button"
                  onClick={handleRestart}
                  className="w-full sm:w-auto min-w-[160px] bg-gradient-to-r from-cyan-500 via-teal-500 to-indigo-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-mono font-black py-3 px-6 rounded-xl text-xs tracking-widest uppercase transition shadow-[0_0_15px_rgba(6,182,212,0.3)] cursor-pointer flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4 text-slate-955 text-slate-950" />
                  ĐẤU TÁI SINH
                </button>

                <button
                  type="button"
                  onClick={onExit}
                  className="w-full sm:w-auto min-w-[160px] bg-slate-900 border border-slate-800 hover:bg-slate-805 text-slate-300 font-black tracking-widest uppercase py-3.5 px-6 rounded-xl text-[10px] transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  QUAY LẠI
                </button>
              </div>

            </div>

            {/* 6. Past Highscores Record Panel (History of top 5 highest achievements) */}
            <div className="bg-slate-950 border-2 border-cyan-500/15 p-5 rounded-3xl space-y-3.5 font-mono">
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-100 flex items-center gap-1.5 border-b border-cyan-500/10 pb-2">
                <History className="w-4 h-4 text-cyan-400 animate-pulse" />
                ĐỊA LỘ KỶ LỤC SINH TỒN (TOP 5)
              </h4>

              {pastHighScores.length > 0 ? (
                <div className="space-y-2">
                  {pastHighScores.map((rec, rIdx) => {
                    const isTop1 = rIdx === 0;
                    return (
                      <div 
                        key={rIdx} 
                        className={`flex justify-between items-center p-3 bg-slate-900/35 rounded-xl border transition duration-150 ${
                          isTop1 
                            ? 'border-cyan-500/25 bg-cyan-500/5 shadow-[0_2px_12px_rgba(6,182,212,0.03)] font-semibold text-slate-105 text-white' 
                            : 'border-slate-850 hover:bg-slate-900/30 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`w-6 h-6 flex items-center justify-center rounded-lg text-xs font-black select-none ${
                            isTop1 
                              ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' 
                              : 'bg-slate-950 text-slate-500 border border-slate-800'
                          }`}>
                            {rIdx + 1}
                          </span>
                          <div>
                            <p className="text-xs font-bold font-mono">
                              {rec.score} ĐIỂM SỐ
                            </p>
                            <p className="text-[9px] text-[#555a6d] leading-none mt-0.5">
                              {rec.timestamp}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 text-xs font-bold text-orange-400">
                          <span className="text-[9px] text-slate-500 uppercase tracking-widest font-black">STREAK:</span>
                          <span>🔥 {rec.maxStreak}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-4 text-center text-[10px] text-[#5c6275] uppercase tracking-widest font-bold">
                  CHƯA GHI NHẬN KỶ LỤC CỦA BẠN. HOÀN THÀNH ĐỂ THIẾT LẬP BẢN GHI ĐẦU TIÊN!
                </div>
              )}
            </div>

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
