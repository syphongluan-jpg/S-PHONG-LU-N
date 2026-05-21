import React, { useState, useEffect, useRef } from 'react';
import { Question, UserProfile } from '../types';
import { Loader2, Award, Clock, ArrowRight, ShieldAlert, Sparkles, Trophy, Zap, AlertCircle } from 'lucide-react';
import { fetchPvPQuestions } from '../utils/questionService';

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
  { name: 'Nguyễn Văn Đạt (Thần đồng)', class: 'Lớp 9', speed: 5.5, accuracy: 0.84 },
  { name: 'Lê Kiều Trinh (Thủ khoa)', class: 'Lớp 12', speed: 4.8, accuracy: 0.90 },
  { name: 'Khánh Linh (Học Bá)', class: 'Lớp 8', speed: 6.2, accuracy: 0.78 }
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

  // Setup opponent and fetch 50 PVP questions
  useEffect(() => {
    // Choose random opponent
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
    if (loading || questions.length === 0 || isAnswered === false && currentIndex === 50) return;

    // Simulated action ticker
    const interval = setInterval(() => {
      if (opponentCurrentIndex >= 50) {
        clearInterval(interval);
        return;
      }

      // Propose bot advances
      const botQ = questions[opponentCurrentIndex];
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
      }

      // Advance opponent index
      setOpponentCurrentIndex(prev => prev + 1);

    }, opponent.speed * 1000 * (0.8 + Math.random() * 0.4)); // bot variance in speed

    return () => clearInterval(interval);
  }, [loading, questions, opponentCurrentIndex]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
        <Loader2 className="w-14 h-14 text-amber-500 animate-spin" />
        <h3 className="text-xl font-serif italic font-black text-slate-100">Đang chuẩn hóa Đấu trường Đỉnh cao...</h3>
        <p className="text-xs text-slate-400 max-w-sm">Vui lòng chờ. Gemini AI đang thiết kế 50 ván bài đại thăng hoa tăng dần độ khó vô tận!</p>
      </div>
    );
  }

  if (error || questions.length === 0) {
    return (
      <div className="p-8 text-center space-y-4 max-w-md mx-auto bg-slate-900 border border-slate-800 rounded-3xl shadow-xl">
        <ShieldAlert className="w-16 h-16 text-rose-500 mx-auto" />
        <h3 className="text-xl font-serif italic font-extrabold text-slate-100">Lỗi Đấu trường</h3>
        <p className="text-xs text-slate-400">{error || 'Thất bại khi tổ chức Đấu trường PvP.'}</p>
        <button
          onClick={onExit}
          className="bg-slate-950 border border-slate-800 hover:bg-slate-900 text-amber-450 text-amber-400 py-2.5 px-5 rounded-xl text-xs font-bold cursor-pointer transition duration-150"
        >
          Trở về an toàn
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
    }

    setIsAnswered(true);
  };

  const currentPtsVal = getQuestionPoints(currentIndex);

  const handleNext = () => {
    if (currentIndex === questions.length - 1 || currentIndex >= 49) {
      // Completed PvP Arena!
      const totalTime = Math.floor((Date.now() - startTime.current) / 1000);
      const won = playerScore >= opponentScore;
      
      // Compute Titles ONLY if scored perfect 700 points
      let titleEarned = won ? 'Nhà Vô Địch' : 'Người Thua Trận';
      
      if (playerScore >= 700) {
        const mins = totalTime / 60;
        if (mins <= 5) titleEarned = 'Học Đế';
        else if (mins <= 7) titleEarned = 'Học Giả';
        else if (mins <= 10) titleEarned = 'Học Sinh';
        else if (mins > 15) titleEarned = 'Học Đần';
        else titleEarned = 'Trạng Nguyên PvP';
      }

      // XP: +25 XP per correct answer, with a giant 200 XP bonus if won the arena
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
      <div className="bg-gradient-to-r from-purple-950/40 via-slate-900/50 to-indigo-950/40 text-slate-100 rounded-3xl p-5 shadow-xl border border-purple-900/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-405 text-yellow-400 fill-yellow-400 animate-spin" />
            <h3 className="font-serif italic font-extrabold text-base uppercase tracking-wider">Đấu trường Khoa học - Trí Tuệ PvP</h3>
          </div>
          <p className="text-xs text-purple-300">Kiến thức tăng cao không giới hạn. Thang điểm đỉnh cao: <strong className="text-amber-400">700 điểm</strong></p>
        </div>

        <div className="flex items-center gap-4 text-sm font-bold bg-slate-950 border border-purple-900/40 text-purple-300 px-4 py-2 rounded-xl shrink-0">
          <Clock className="w-4 h-4 text-amber-500" />
          <span className="font-mono">
            Thời gian: {Math.floor(timerSeconds / 60)}:{(timerSeconds % 60).toString().padStart(2, '0')}
          </span>
        </div>
      </div>

      {/* Side by side Leaderboard Progress */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Player section */}
        <div className="bg-slate-900/40 border border-slate-800/80 p-5 rounded-2xl shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">🎒</span>
              <div>
                <h4 className="font-serif italic font-bold text-slate-200 text-xs">{userProfile.username} (Lớp {userProfile.studentClass})</h4>
                <p className="text-[10px] text-slate-500">Bạn đang thi đấu</p>
              </div>
            </div>

            <div className="text-right">
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Điểm số</p>
              <p className="font-mono font-black text-amber-400 text-base">{playerScore} / 700</p>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-[10px] text-slate-400 font-semibold font-mono">
              <span>Đúng: {playerCorrectCount} / 50</span>
              <span>Cầu đứng: {currentIndex + 1}</span>
            </div>
            <div className="w-full bg-slate-950 border border-slate-800/60 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-amber-400 to-amber-500 h-full transition-all duration-300 shadow-[0_0_8px_rgba(245,158,11,0.25)]"
                style={{ width: `${((currentIndex + 1) / 50) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Bot Opponent section */}
        <div className="bg-slate-900/40 border border-purple-900/20 p-5 rounded-2xl shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">🤖</span>
              <div>
                <h4 className="font-serif italic font-bold text-purple-300 text-xs">{opponent.name} ({opponent.class})</h4>
                <p className="text-[10px] text-slate-500">Đối thủ giả lập AI</p>
              </div>
            </div>

            <div className="text-right">
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Điểm của Địch</p>
              <p className="font-mono font-black text-purple-400 text-base">{opponentScore} / 700</p>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-[10px] text-slate-400 font-semibold font-mono">
              <span>Học bá giải đúng: {opponentCorrectCount} / 50</span>
              <span>Cầu địch: {Math.min(opponentCurrentIndex + 1, 50)}</span>
            </div>
            <div className="w-full bg-slate-950 border border-slate-805 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-purple-600 h-full transition-all duration-300 shadow-[0_0_8px_rgba(168,85,247,0.25)]"
                style={{ width: `${(opponentCurrentIndex / 55) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main active question panels */}
      <div className="bg-slate-900/40 border border-slate-800/80 p-5 sm:p-7 shadow-xl space-y-5">
        <div className="flex items-center justify-between pb-2 border-b border-slate-850">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] bg-slate-950 border border-slate-800 text-slate-400 font-bold px-2.5 py-0.5 rounded font-mono">
              Câu {currentIndex + 1} của 50
            </span>
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wide ${
              currentIndex >= 40 
                ? 'bg-rose-950/20 text-rose-400 border border-rose-800/50 font-serif italic' 
                : currentIndex >= 25 
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
            }`}>
              Hạng: {currentIndex >= 40 ? 'THÁCH THỨC VŨ TRỤ' : currentIndex >= 25 ? 'KHÓ' : currentIndex >= 10 ? 'TRUNG BÌNH' : 'DỄ'}
            </span>
          </div>

          <div className="text-xs font-black text-amber-450 text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/20 font-mono">
            Giá trị: +{currentPtsVal} điểm
          </div>
        </div>

        {/* Question content */}
        <div className="p-4 p-5 rounded-2xl border border-slate-800 bg-slate-950/60 min-h-[90px] flex items-center justify-center text-center">
          <p className="text-sm font-serif italic font-semibold text-slate-200 leading-relaxed md:text-base">
            {currentQuestion.questionText}
          </p>
        </div>

        {/* Answers entry */}
        {currentQuestion.type === 'multiple-choice' ? (
          <div className="grid gap-2.5 sm:grid-cols-2">
            {currentQuestion.options?.map((opt, i) => {
              const letter = ['A', 'B', 'C', 'D'][i];
              const isSelected = selectedAnswer === letter;
              const isCorrectAnswer = letter === currentQuestion.correctAnswer;

              let btnStyle = 'border-slate-800 bg-slate-950 text-slate-350 hover:bg-slate-900/60';
              if (isAnswered) {
                if (isCorrectAnswer) btnStyle = 'bg-emerald-950/30 border-emerald-500 text-emerald-400 ring-1 ring-emerald-500/40 shadow-[0_0_8px_rgba(16,185,129,0.15)]';
                else if (isSelected) btnStyle = 'bg-rose-950/30 border-rose-500 text-rose-400 ring-1 ring-rose-500/40';
                else btnStyle = 'opacity-40 pointer-events-none text-slate-500 border-slate-850';
              }

              return (
                <button
                  key={letter}
                  type="button"
                  disabled={isAnswered}
                  onClick={() => handlePlayerSubmit(letter)}
                  className={`p-3.5 rounded-xl border text-xs font-bold text-left flex items-start gap-3 transition cursor-pointer ${btnStyle}`}
                >
                  <span className="w-6 h-6 shrink-0 bg-slate-900 text-slate-400 rounded-full font-bold text-xs flex items-center justify-center border border-slate-800">
                    {letter}
                  </span>
                  <span className="flex-1 mt-0.5">{opt}</span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="space-y-3">
            {!isAnswered ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={shortInput}
                  onChange={(e) => setShortInput(e.target.value)}
                  placeholder="Điền từ khóa đáp án ngắn gọn..."
                  className="flex-1 bg-slate-950 border-2 border-slate-800 rounded-xl py-2 px-4 focus:outline-none focus:border-amber-500 text-sm font-semibold text-slate-200 placeholder:text-slate-650"
                  onKeyDown={(e) => e.key === 'Enter' && handlePlayerSubmit(shortInput)}
                />
                <button
                  type="button"
                  onClick={() => handlePlayerSubmit(shortInput)}
                  className="bg-gradient-to-r from-purple-600 to-indigo-650 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold py-2.5 px-6 rounded-xl text-xs uppercase tracking-wider shadow-md transition duration-200 cursor-pointer"
                >
                  Giải đề
                </button>
              </div>
            ) : (
              <div className="space-y-2 text-xs font-bold font-sans">
                <p className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-400">Của bạn: "{shortInput || '[Bỏ trống]'}"</p>
                <p className="p-3 bg-emerald-950/20 border border-emerald-800 text-emerald-400 rounded-xl">🔑 Đáp án đúng chuẩn: "{currentQuestion.correctAnswer}"</p>
              </div>
            )}
          </div>
        )}

        {/* Explain notes */}
        {isAnswered && (
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
            <p className="text-[10px] font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1 font-serif italic">
              <Sparkles className="w-3.5 h-3.5" />
              Tập sử & Lược giải đấu trường
            </p>
            <p className="text-xs text-slate-350 leading-relaxed font-sans font-normal">
              {currentQuestion.explanation}
            </p>
          </div>
        )}

        {/* Navigation Footer */}
        <div className="flex items-center justify-between border-t border-slate-800 pt-4">
          <button
            onClick={onExit}
            className="text-slate-500 hover:text-rose-400 text-xs font-bold cursor-pointer transition hover:underline"
          >
            Đầu hàng thua trận
          </button>

          {isAnswered && (
            <button
              onClick={handleNext}
              className="bg-gradient-to-r from-purple-600 to-indigo-650 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold py-2.5 px-6 rounded-xl text-xs shadow-[0_0_12px_rgba(168,85,247,0.2)] transition duration-200 cursor-pointer flex items-center gap-1.5 uppercase tracking-wider"
            >
              {currentIndex === 49 ? 'Hoàn thành Đấu trường' : 'Câu tiếp đấu'}
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
