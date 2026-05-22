import React, { useState, useEffect, useRef } from 'react';
import { Question, UserProfile } from '../types';
import { Loader2, ShieldAlert, Clock, ArrowRight, BookOpen, Trophy, Zap, AlertTriangle, CheckCircle } from 'lucide-react';
import { fetchPvPQuestions } from '../utils/questionService';
import { soundManager } from '../utils/ambientMusic';

interface PvPGameProps {
  userProfile: UserProfile;
  onGameComplete: (score: number, totalQuestions: number, durationSeconds: number, titleEarned: string, gainedXP: number, won: boolean, shownMeme?: string) => void;
  onExit: () => void;
}

// Vietnamese Student memes
const MEMES = [
  'Học tài thi sập nguồn! Lau nước mắt đi bạn ơi, làm ván nữa phục thù!',
  'Bố mẹ còng lưng nuôi đi học, vào PvP định làm Học Đế ai ngờ dính ngay meme!',
  'Có thờ có thiêng, có kiêng có... ăn trứng ngỗng hôm nay rồi.',
  'Học hành như chơi, chơi rơi nước mắt, thua Học Bá AI trong cay đắng!',
  'Nước mắt rơi trò chơi kết thúc. Học tập đỉnh cao cần thêm nhiều giấc ngủ!',
  'Không sao cả, thất bại là mẹ thành công... cơ mà làm mẹ hơi nhiều lần rồi đó nha!',
];

const OPONENTS = [
  { name: 'Nguyễn Văn Đạt (Thần đồng)', class: 'Lớp 9', speed: 13.5, accuracy: 0.84 },
  { name: 'Lê Kiều Trinh (Thủ khoa)', class: 'Lớp 12', speed: 11.5, accuracy: 0.90 },
  { name: 'Khánh Linh (Học Bá)', class: 'Lớp 8', speed: 15.0, accuracy: 0.78 }
];

export function PvPGame({ userProfile, onGameComplete, onExit }: PvPGameProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Game state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [shortInput, setShortInput] = useState('');
  const [isAnswered, setIsAnswered] = useState(false);
  const [playerScore, setPlayerScore] = useState(0); // Sum of dynamic points
  const [playerCorrectCount, setPlayerCorrectCount] = useState(0);
  
  // Opponent AI State
  const [opponent, setOpponent] = useState(OPONENTS[0]);
  const [opponentScore, setOpponentScore] = useState(0);
  const [opponentCorrectCount, setOpponentCorrectCount] = useState(0);
  const [opponentCurrentIndex, setOpponentCurrentIndex] = useState(0);

  // Time metrics
  const [timerSeconds, setTimerSeconds] = useState(0);
  const startTime = useRef<number>(Date.now());

  // Synthesizer beep using unified soundManager
  const playPvPBeep = (freq: number, duration: number = 0.1, type: 'sine' | 'triangle' | 'sawtooth' | 'square' = 'sine') => {
    if (freq === 980) {
      soundManager.playCorrect();
    } else if (freq === 180) {
      soundManager.playIncorrect();
    } else if (freq === 320) {
      soundManager.playTick(freq * 1.5); // opponent correct ticking chime
    } else {
      soundManager.playClick();
    }
  };

  // Setup opponent and fetch 50 PVP questions
  useEffect(() => {
    const chosenOpponent = OPONENTS[Math.floor(Math.random() * OPONENTS.length)];
    setOpponent(chosenOpponent);

    let active = true;
    async function fetchPvP() {
      try {
        setLoading(true);
        const qs = await fetchPvPQuestions(userProfile.studentClass);
        if (active) {
          if (qs && qs.length > 0) {
            setQuestions(qs);
            setLoading(false);
            startTime.current = Date.now();
          } else {
            throw new Error('Không thể tải bộ đề Thách đấu PvP');
          }
        }
      } catch (err: any) {
        if (active) {
          setError('Không thể tải bộ đề PvP. Vui lòng quay lại sau!');
          setLoading(false);
        }
      }
    }

    fetchPvP();

    // Timer Interval
    const timer = setInterval(() => {
      setTimerSeconds(prev => prev + 1);
    }, 1000);

    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  // Bot play simulator
  useEffect(() => {
    if (loading || questions.length === 0 || (isAnswered === false && currentIndex === 50)) return;

    // Simulated action ticker
    const interval = setInterval(() => {
      if (opponentCurrentIndex >= 50) {
        clearInterval(interval);
        return;
      }

      // Propose bot advances
      let pts = 5;
      if (opponentCurrentIndex >= 40) pts = 27.5;
      else if (opponentCurrentIndex >= 25) pts = 15;
      else if (opponentCurrentIndex >= 10) pts = 10;

      // Bot accuracy chance based on difficulty of question
      let successChance = opponent.accuracy;
      if (opponentCurrentIndex >= 40) successChance -= 0.25; // hard
      else if (opponentCurrentIndex >= 25) successChance -= 0.10;

      const isBotCorrect = Math.random() < successChance;

      if (isBotCorrect) {
        setOpponentScore(prev => prev + pts);
        setOpponentCorrectCount(prev => prev + 1);
        playPvPBeep(320, 0.08, 'sine'); // soft beep for opponent correct answer
      }

      // Advance opponent index
      setOpponentCurrentIndex(prev => prev + 1);

    }, opponent.speed * 1000 * (0.8 + Math.random() * 0.4)); // bot variance in speed

    return () => clearInterval(interval);
  }, [loading, questions, opponentCurrentIndex]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center space-y-4 font-mono">
        <Loader2 className="w-14 h-14 text-purple-400 animate-spin" />
        <h3 className="text-xl font-black text-slate-100 uppercase tracking-tight">KẾT NỐI ĐẤU TRƯỜNG KIẾN THỨC ĐA CHIỀU</h3>
        <p className="text-xs text-purple-400 max-w-sm font-bold uppercase tracking-widest animate-pulse">ĐANG PHÂN BỔ 50 ĐỀ THI KIẾN THỨC TỪNG PHÂN VÙNG DỮ LIỆU...</p>
      </div>
    );
  }

  if (error || questions.length === 0) {
    return (
      <div className="p-8 text-center space-y-4 max-w-md mx-auto bg-slate-950 border-2 border-red-500/30 rounded-3xl shadow-xl font-mono">
        <ShieldAlert className="w-16 h-16 text-rose-500 mx-auto" />
        <h3 className="text-xl font-black text-slate-100 uppercase tracking-tight">LỖI THIẾT LẬP KẾT KHOA</h3>
        <p className="text-xs text-slate-405 text-slate-400">{error || 'Thất bại khi tổ chức Đấu trường Kiến Thức.'}</p>
        <button
          onClick={onExit}
          className="bg-slate-900 border border-slate-800 hover:bg-slate-805 text-cyan-405 text-cyan-400 py-2.5 px-5 rounded-xl text-xs font-black tracking-widest uppercase cursor-pointer transition duration-150"
        >
          TRỞ VỀ THIẾT CHẾ AN TOÀN
        </button>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  // Specific dynamic points allocation per question index
  const getQuestionPoints = (idx: number) => {
    if (idx >= 40) return 27.5; // Questions 41-50 (Thách thức) -> 27.5 pts each
    if (idx >= 25) return 15;   // Questions 26-40 (Khó) -> 15 pts each
    if (idx >= 10) return 10;   // Questions 11-25 (T.bình) -> 10 pts each
    return 5;                   // Questions 1-10 (Dễ) -> 5 pts each
  };

  const handlePlayerSubmit = (answer: string) => {
    if (isAnswered) return;

    let isCorrect = false;
    if (currentQuestion.type === 'multiple-choice') {
      setSelectedAnswer(answer);
      isCorrect = answer === currentQuestion.correctAnswer;
    } else {
      setSelectedAnswer(answer);
      const normIn = answer.trim().toLowerCase();
      const normAns = currentQuestion.correctAnswer.trim().toLowerCase();
      isCorrect = normIn === normAns || normIn.includes(normAns) || normAns.includes(normIn);
    }

    const pts = getQuestionPoints(currentIndex);
    if (isCorrect) {
      setPlayerScore(prev => prev + pts);
      setPlayerCorrectCount(prev => prev + 1);
      playPvPBeep(980, 0.25, 'triangle');
    } else {
      playPvPBeep(180, 0.45, 'sawtooth');
    }

    setIsAnswered(true);
  };

  const currentPtsVal = getQuestionPoints(currentIndex);

  const handleNext = () => {
    playPvPBeep(580, 0.08, 'sine');
    if (currentIndex === questions.length - 1 || currentIndex >= 49) {
      // Completed All questions 
      const totalTime = Math.floor((Date.now() - startTime.current) / 1000);
      const won = playerScore >= opponentScore;
      
      let titleEarned = won ? 'Nhà Vô Địch' : 'Người Thua Trận';
      
      if (playerScore >= 700) {
        const mins = totalTime / 60;
        if (mins <= 5) titleEarned = 'Học Đế';
        else if (mins <= 7) titleEarned = 'Học Giả';
        else if (mins <= 10) titleEarned = 'Học Sinh';
        else if (mins > 15) titleEarned = 'Học Đần';
        else titleEarned = 'Trạng Nguyên PvP';
      }

      // XP calculation
      const gainedXP = (playerCorrectCount * 25) + (won ? 200 : 0);
      const shownMeme = won ? undefined : MEMES[Math.floor(Math.random() * MEMES.length)];

      onGameComplete(playerScore, 50, totalTime, titleEarned, gainedXP, won, shownMeme);
    } else {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShortInput('');
      setIsAnswered(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Title & Timing Info */}
      <div className="bg-gradient-to-r from-purple-950/50 via-slate-950 to-indigo-950/50 text-slate-100 rounded-3xl p-6 shadow-[0_0_25px_rgba(168,85,247,0.15)] border-2 border-purple-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden cyber-scanlines">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-purple-400 to-transparent pointer-events-none" />
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-450 text-yellow-400 fill-yellow-400 animate-bounce" />
            <h3 className="font-mono font-black text-sm uppercase tracking-wider">ĐẤU TRƯỜNG KIẾN THỨC - TRÍ TUỆ ĐỈNH CAO</h3>
          </div>
          <p className="text-xs text-purple-308 text-purple-300 font-semibold">Tăng cấp giới hạn. Thang điểm đỉnh cao: <strong className="text-amber-400">700 điểm</strong></p>
        </div>

        <div className="flex items-center gap-4 text-xs font-black bg-slate-900 border border-purple-900/40 text-purple-300 px-4 py-2.5 rounded-xl shrink-0 font-mono tracking-widest">
          <Clock className="w-4 h-4 text-amber-500 animate-spin" />
          <span>
            TIME_METRIC: {Math.floor(timerSeconds / 60)}:{(timerSeconds % 60).toString().padStart(2, '0')}
          </span>
        </div>
      </div>

      {/* Side by side Leaderboard Progress */}
      <div className="grid gap-4 md:grid-cols-2 font-mono">
        {/* Player section */}
        <div className="bg-slate-950 border-2 border-cyan-500/20 p-5 rounded-2xl shadow-xl space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-xl filter drop-shadow-[0_2px_8px_rgba(34,211,238,0.4)]">🎒</span>
              <div>
                <h4 className="font-black text-slate-150 text-xs uppercase tracking-tight">{userProfile.username} (LỚP {userProfile.studentClass})</h4>
                <p className="text-[9px] text-cyan-400/70 font-bold uppercase tracking-widest">ĐÁNH CHỐNG CHỦ QUYỀN</p>
              </div>
            </div>

            <div className="text-right">
              <p className="text-[9px] text-slate-450 text-slate-400 uppercase tracking-widest font-black">Xung Điểm</p>
              <p className="font-mono font-black text-cyan-400 text-sm sm:text-base">{playerScore} / 700</p>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-[10px] text-slate-400 font-bold">
              <span>ĐÚNG: {playerCorrectCount} / 50</span>
              <span>CÂU: {currentIndex + 1}</span>
            </div>
            <div className="w-full bg-slate-900 border border-slate-800 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-cyan-500 to-indigo-505 to-indigo-500 h-full transition-all duration-350 shadow-[0_0_8px_rgba(6,182,212,0.4)]"
                style={{ width: `${((currentIndex + 1) / 50) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Bot Opponent section */}
        <div className="bg-slate-950 border-2 border-purple-500/20 p-5 rounded-2xl shadow-xl space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-xl filter drop-shadow-[0_2px_8px_rgba(168,85,247,0.4)]">🤖</span>
              <div>
                <h4 className="font-black text-purple-300 text-xs uppercase tracking-tight">{opponent.name}</h4>
                <p className="text-[9px] text-purple-400/80 font-bold uppercase tracking-widest">ĐỐI THỦ GIẢ LẬP AI</p>
              </div>
            </div>

            <div className="text-right">
              <p className="text-[9px] text-slate-450 text-slate-450 text-slate-400 uppercase tracking-widest font-black">Xung Điểm Địch</p>
              <p className="font-mono font-black text-purple-400 text-sm sm:text-base">{opponentScore} / 700</p>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-[10px] text-slate-400 font-bold">
              <span>ĐÚNG: {opponentCorrectCount} / 50</span>
              <span>CÂU ĐỊCH: {Math.min(opponentCurrentIndex + 1, 50)}</span>
            </div>
            <div className="w-full bg-slate-900 border border-slate-800 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-purple-600 h-full transition-all duration-350 shadow-[0_0_8px_rgba(168,85,247,0.4)]"
                style={{ width: `${(opponentCurrentIndex / 50) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main active question panels */}
      <div className="bg-slate-950 border-2 border-cyan-500/30 rounded-3xl p-6 sm:p-8 shadow-[0_0_30px_rgba(6,182,212,0.15)] space-y-6 relative overflow-hidden cyber-scanlines">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent pointer-events-none animate-pulse" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-cyan-500/10 gap-2 font-mono">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[9px] bg-slate-900 border border-slate-800 text-slate-300 font-black px-2.5 py-1 rounded">
              CÂU {currentIndex + 1} / 50
            </span>
            <span className={`text-[9px] font-black px-2.5 py-1 rounded uppercase tracking-wider ${
              currentIndex >= 40 
                ? 'bg-rose-950/30 text-rose-400 border border-rose-500/30 animate-pulse' 
                : currentIndex >= 25 
                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
            }`}>
              {currentIndex >= 40 ? 'THÁCH THỨC VŨ TRỤ' : currentIndex >= 25 ? 'KHÓ' : currentIndex >= 10 ? 'TRUNG BÌNH' : 'DỄ'}
            </span>
          </div>

          <div className="text-xs font-black text-amber-400 bg-amber-550/10 px-3 py-1.5 rounded border border-amber-500/25 tracking-widest">
            GIÁ TRỊ: +{currentPtsVal} PTS
          </div>
        </div>

        {/* Question content */}
        <div className="p-6 rounded-2xl border border-cyan-500/15 bg-slate-900/60 min-h-[100px] flex items-center justify-center text-center relative">
          <div className="absolute top-2 left-2 text-[9px] font-mono text-cyan-600/30 font-black">NEURAL_DECRYPTION_SYNAPSE</div>
          <p className="text-sm font-semibold text-slate-100 leading-relaxed md:text-base px-2">
            {currentQuestion.questionText}
          </p>
        </div>

        {/* Answers entry */}
        {currentQuestion.type === 'multiple-choice' ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {currentQuestion.options?.map((opt, i) => {
              const letter = ['A', 'B', 'C', 'D'][i];
              const isSelected = selectedAnswer === letter;
              const isCorrectAnswer = letter === currentQuestion.correctAnswer;

              let btnStyle = 'border-slate-850 bg-slate-900/25 text-slate-350 hover:border-cyan-500/40 hover:bg-slate-900/50';
              if (isAnswered) {
                if (isCorrectAnswer) btnStyle = 'bg-emerald-950/30 border-emerald-500 text-emerald-350 shadow-[0_0_15px_rgba(16,185,129,0.15)] font-black';
                else if (isSelected) btnStyle = 'bg-rose-950/30 border-rose-500 text-rose-350 shadow-[0_0_15px_rgba(244,63,94,0.15)] font-black';
                else btnStyle = 'opacity-40 pointer-events-none text-slate-600 border-transparent';
              }

              return (
                <button
                  key={letter}
                  type="button"
                  disabled={isAnswered}
                  onClick={() => handlePlayerSubmit(letter)}
                  className={`p-4 rounded-xl border-2 text-xs sm:text-sm font-semibold text-left flex items-start gap-3.5 transition cursor-pointer ${btnStyle} justify-between items-center`}
                >
                  <div className="flex items-start gap-3">
                    <span className={`w-7 h-7 shrink-0 rounded-lg font-mono font-bold text-xs flex items-center justify-center ${
                      isAnswered && isCorrectAnswer 
                        ? 'bg-emerald-500 text-slate-900 font-extrabold' 
                        : isAnswered && isSelected 
                        ? 'bg-rose-500 text-slate-900 font-extrabold' 
                        : 'bg-slate-950 text-slate-400 border border-slate-800'
                    }`}>
                      {letter}
                    </span>
                    <span className="flex-1 mt-0.5 leading-normal">{opt}</span>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="space-y-3 font-mono">
            {!isAnswered ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={shortInput}
                  onChange={(e) => setShortInput(e.target.value)}
                  placeholder="Điền từ khóa đáp án ngắn gọn..."
                  className="flex-1 bg-slate-950 border-2 border-slate-850 rounded-xl py-3 px-4 focus:outline-none focus:border-cyan-400 text-sm font-semibold text-slate-200 placeholder:text-slate-650"
                  onKeyDown={(e) => e.key === 'Enter' && handlePlayerSubmit(shortInput)}
                />
                <button
                  type="button"
                  onClick={() => handlePlayerSubmit(shortInput)}
                  className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black py-3 px-6 rounded-xl text-xs uppercase tracking-widest shadow-md transition duration-200 cursor-pointer"
                >
                  GIẢI ĐỀ
                </button>
              </div>
            ) : (
              <div className="space-y-3 text-xs font-bold font-mono">
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-slate-350">CỦA BẠN: "{shortInput || '[BỎ TRỐNG]'}"</div>
                <div className="p-4 bg-emerald-950/20 border border-emerald-500/30 text-emerald-400 rounded-xl">🔑 ĐÁP ÁN ĐÚNG CHUẨN: "{currentQuestion.correctAnswer}"</div>
              </div>
            )}
          </div>
        )}

        {/* Explain notes */}
        {isAnswered && (
          <div className="p-5 bg-cyan-950/15 border border-cyan-500/25 rounded-2xl space-y-2 animate-fade-in text-xs font-semibold">
            <p className="text-[10px] font-mono font-black text-cyan-400 uppercase tracking-widest flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-cyan-400" />
              TẬP SỬ & LƯỢC GIẢI ĐẤU TRƯỜNG (DECODED)
            </p>
            <p className="text-slate-300 leading-relaxed">
              {currentQuestion.explanation}
            </p>
          </div>
        )}

        {/* Navigation Footer */}
        <div className="flex items-center justify-between border-t border-cyan-500/10 pt-5 font-mono">
          <button
            type="button"
            onClick={onExit}
            className="text-slate-500 hover:text-rose-400 text-xs font-black uppercase tracking-wider cursor-pointer transition"
          >
            ĐẦU HÀNG THUẬT TOÁN
          </button>

          {isAnswered && (
            <button
              type="button"
              onClick={handleNext}
              className="bg-gradient-to-r from-purple-600 via-indigo-600 to-indigo-755 hover:from-purple-500 hover:to-indigo-500 text-white font-mono font-black py-3 px-6 rounded-xl text-xs shadow-[0_0_15px_rgba(168,85,247,0.35)] transition duration-200 cursor-pointer flex items-center gap-1.5 uppercase tracking-widest"
            >
              {currentIndex === 49 ? 'HOÀN THÀNH ĐẨU SỰ' : 'KẾ TIẾP (NEXT_SEQ) ⚔️'}
              <ArrowRight className="w-4 h-4 shrink-0" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
