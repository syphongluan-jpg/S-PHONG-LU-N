import React, { useState, useEffect, useRef } from 'react';
import { Question, UserProfile, HistoryRecord } from '../types';
import { LOCAL_QUESTIONS } from '../localQuestions';
import { generateProceduralMathQuestion, getGradeLevelTier, getOriginalQuestionId } from '../utils/questionService';
import { 
  X, 
  HelpCircle, 
  Clock, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Award, 
  ArrowRight, 
  Flame, 
  TrendingUp, 
  Trophy,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { soundManager } from '../utils/ambientMusic';

import { getTenThousandQuestion } from '../utils/tenThousandQuestions';

interface MemoryModeGameProps {
  profile: UserProfile;
  onExit: () => void;
  onGainXP: (xp: number, finalScore: number) => void;
  useTicket: () => void;
  completedIds: string[];
  onSaveCompletedIds: (ids: string[]) => void;
}

export function MemoryModeGame({ profile, onExit, onGainXP, useTicket, completedIds, onSaveCompletedIds }: MemoryModeGameProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [seenIds, setSeenIds] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [accumulatedXP, setAccumulatedXP] = useState(0);
  const [timeLeft, setTimeLeft] = useState(45); // Standard 45s per memory challenge (between 30s and 1m)
  const [isAnswered, setIsAnswered] = useState(false);
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const synthRef = useRef<AudioContext | null>(null);

  const generateSingleMemoryQuestion = (excludeList: string[]): Question => {
    const studentClass = profile.studentClass || 'Lớp 6';
    
    // Attempt drawing a random unique card from our 10,000 index bank
    let tries = 0;
    while (tries < 150) {
      const randIdx = Math.floor(Math.random() * 10000) + 1;
      const q = getTenThousandQuestion(randIdx, studentClass);
      if (!excludeList.includes(q.id)) {
        // Map original difficulty to star rating
        let stars = 3;
        if (q.difficulty === 'de') stars = Math.random() > 0.5 ? 1 : 2;
        else if (q.difficulty === 'trung-binh') stars = 3;
        else if (q.difficulty === 'kho') stars = 4;
        else if (q.difficulty === 'thach-thuc') stars = 5;
        
        return { ...q, stars };
      }
      tries++;
    }
    
    // Bulletproof fallback - try to find local questions that are not in excludeList first
    const uncompletedLocal = LOCAL_QUESTIONS.filter(lq => !excludeList.includes(getOriginalQuestionId(lq.id)));
    const randLocal = uncompletedLocal.length > 0
      ? uncompletedLocal[Math.floor(Math.random() * uncompletedLocal.length)]
      : LOCAL_QUESTIONS[Math.floor(Math.random() * LOCAL_QUESTIONS.length)];
      
    const fallbackStars = randLocal.difficulty === 'de' ? 2 : randLocal.difficulty === 'trung-binh' ? 3 : randLocal.difficulty === 'kho' ? 4 : 5;
    return {
      ...randLocal,
      stars: fallbackStars,
      id: `${randLocal.id}_fallback_mem_${Date.now()}`
    };
  };

  // Initialize questions based on player's registered Grade class
  const initializeMemoryQuestions = () => {
    const initialList: Question[] = [];
    const previouslyCompletedRawIds = (completedIds || []).map(id => getOriginalQuestionId(id));
    const ids: string[] = [...previouslyCompletedRawIds];
    
    for (let i = 0; i < 5; i++) {
      const q = generateSingleMemoryQuestion(ids);
      initialList.push(q);
      ids.push(q.id);
    }
    
    setQuestions(initialList);
    setSeenIds(ids);
  };

  const playSound = (type: 'correct' | 'wrong' | 'tick' | 'victory') => {
    if (isMuted) return;
    try {
      if (type === 'correct') {
        soundManager.playCorrect();
      } else if (type === 'wrong') {
        soundManager.playIncorrect();
      } else if (type === 'tick') {
        soundManager.playTick(500);
      } else if (type === 'victory') {
        soundManager.playLevelUp();
      }
    } catch (e) {
      console.warn("Lỗi audio:", e);
    }
  };

  const startLevel = () => {
    useTicket(); // Deduct ticket
    initializeMemoryQuestions();
    setGameStarted(true);
    setScore(0);
    setAccumulatedXP(0);
    setCurrentIndex(0);
    setGameOver(false);
    setTimeLeft(45);
    setIsAnswered(false);
    setSelectedLetter(null);
  };

  useEffect(() => {
    if (!gameStarted || gameOver || isAnswered) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleAnswerClick(''); // Empty represents penalty/timeout
          return 0;
        }
        if (prev <= 6) {
          playSound('tick');
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentIndex, gameStarted, gameOver, isAnswered]);

  const getStarXPAward = (stars: number): number => {
    // 1 Sao: 100 EXP, 2 Sao: 300 EXP, 3 Sao: 500 EXP, 4 Sao: 1200 EXP, 5 Sao: 2200 EXP
    if (stars === 1) return 100;
    if (stars === 2) return 300;
    if (stars === 3) return 500;
    if (stars === 4) return 1200;
    if (stars === 5) return 2200;
    return 500; // default 3 star
  };

  const handleAnswerClick = (optLetter: string) => {
    if (isAnswered || gameOver) return;
    setIsAnswered(true);
    setSelectedLetter(optLetter);

    if (timerRef.current) clearInterval(timerRef.current);

    const activeQ = questions[currentIndex];
    const isCorrect = optLetter === activeQ?.correctAnswer;

    if (isCorrect) {
      playSound('correct');
      setScore(prev => prev + 1);
      
      // Save solved question ID to study_game_completed_ids so it won't repeat in other modes either!
      try {
        const rawId = getOriginalQuestionId(activeQ.id);
        const cleanedParsed = (completedIds || []).map(id => getOriginalQuestionId(id));
        if (!cleanedParsed.includes(rawId)) {
          onSaveCompletedIds([...completedIds, rawId]);
        }
      } catch (e) {
        console.error('Error updating completed IDs in MemoryMode:', e);
      }
      
      // Calculate XP with 5x multiplier!
      const qStars = activeQ.stars || 3;
      const baseXP = getStarXPAward(qStars);
      const multipliedXP = baseXP * 5;
      
      setAccumulatedXP(prev => prev + multipliedXP);
    } else {
      playSound('wrong');
    }
  };

  const handleNext = () => {
    const nextIndex = currentIndex + 1;
    // Infinitely append a newly compiled unique question from the database as the user advances
    if (nextIndex >= questions.length) {
      const q = generateSingleMemoryQuestion([...seenIds, ...questions.map(item => item.id)]);
      setQuestions(prev => [...prev, q]);
      setSeenIds(prev => [...prev, q.id]);
    }
    
    setCurrentIndex(nextIndex);
    setTimeLeft(45);
    setIsAnswered(false);
    setSelectedLetter(null);
  };

  const activeQuestion = questions[currentIndex];

  return (
    <div className="max-w-xl mx-auto space-y-6">
      
      {/* Top Header */}
      <div className="flex justify-between items-center bg-gradient-to-r from-purple-950/40 via-slate-900/40 to-cyan-950/40 border border-slate-800 p-4 rounded-2xl">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
          <div>
            <h2 className="text-sm font-serif font-black italic text-slate-100 uppercase tracking-wider">
              Miền Ký Ức ✨
            </h2>
            <p className="text-[10px] text-purple-300 font-bold leading-none">Chế độ nhân 5 lần EXP (5x EXP cực đại)</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {gameStarted && !gameOver && (
            <button
              type="button"
              onClick={() => {
                setGameOver(true);
                playSound('victory');
                if (accumulatedXP > 0) {
                  onGainXP(accumulatedXP, score);
                }
              }}
              className="px-3 py-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-550 border border-amber-500/20 text-slate-950 font-black rounded-lg text-[11px] transition cursor-pointer shadow-md"
            >
              💰 Dừng & Nhận EXP
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsMuted(prev => !prev)}
            className="p-1.5 text-slate-400 hover:text-slate-200 bg-slate-950 rounded-lg transition"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-450" /> : <Volume2 className="w-4 h-4 text-emerald-450" />}
          </button>
          
          <button
            type="button"
            onClick={onExit}
            className="px-3 py-1 bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200 rounded-lg text-xs"
          >
            Thoát
          </button>
        </div>
      </div>

      {!gameStarted ? (
        /* Welcome Lobby requiring 1 VIP ticket */
        <div className="bg-slate-900/60 border border-slate-800/80 p-8 rounded-3xl text-center space-y-6">
          <div className="space-y-2">
            <div className="w-16 h-16 bg-gradient-to-tr from-purple-500/20 to-cyan-500/20 border border-purple-500/30 rounded-2xl flex items-center justify-center mx-auto text-3xl">
              🔑
            </div>
            <h3 className="text-lg font-serif font-black text-slate-100 italic">
              Chào mừng tới Miền Ký Ức
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
              Khu vực học tập bậc cao độc nhất vô nhị. Mỗi câu trả lời đúng được <strong className="text-purple-400">gấp 5 lần EXP</strong>! Thử thách gồm <strong className="text-amber-400">vô hạn câu hỏi không giới hạn số lượng</strong>, được rút trực tiếp từ kho lưu trữ 10,000 câu của hệ thống. Đồng hồ đạt <strong className="text-cyan-400">45 giây</strong> phản tốc cho mỗi lượt chơi.
            </p>
          </div>

          <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-850 max-w-xs mx-auto space-y-2">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Số vé VIP hiện tại của bạn</p>
            <div className="flex items-center justify-center gap-1.5">
              <span className="text-xl">🎟️</span>
              <span className="text-2xl font-mono font-black text-purple-400">
                {profile.vipTickets || 0}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2 max-w-xs mx-auto">
            <button
              type="button"
              disabled={(profile.vipTickets || 0) < 1}
              onClick={startLevel}
              className={`w-full font-serif italic font-extrabold py-3.5 px-6 rounded-xl text-xs flex items-center justify-center gap-2 transition duration-200 ${
                (profile.vipTickets || 0) >= 1
                  ? 'bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-400 hover:to-cyan-400 text-slate-950 cursor-pointer shadow-lg shadow-purple-950/30'
                  : 'bg-slate-800 text-slate-550 border border-slate-700/50 cursor-not-allowed text-slate-500'
              }`}
            >
              🎟️ Sử dụng 1 Vé VIP vào cổng
            </button>
            <p className="text-[9px] text-slate-500">
              {(profile.vipTickets || 0) < 1 ? 'Kiếm thêm vé VIP tại mục Vòng Quay Nhân Phẩm ở thanh Menu!' : 'Nhấn nút phía trên để bắt đầu thử thách!'}
            </p>
          </div>
        </div>
      ) : !gameOver ? (
        /* Question screen challenge */
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-900/30 border border-slate-850 rounded-2xl p-3 flex flex-col items-center justify-center">
              <span className="text-[9px] uppercase font-serif text-slate-500 font-bold tracking-wider mb-0.5">Tiến độ</span>
              <span className="text-sm font-mono font-bold text-slate-200">Câu {currentIndex + 1}</span>
            </div>

            <div className="bg-slate-900/30 border border-slate-850 rounded-2xl p-3 flex flex-col items-center justify-center">
              <span className="text-[9px] uppercase font-serif text-slate-500 font-bold tracking-wider mb-0.5">Đúng</span>
              <span className="text-base font-mono font-black text-emerald-400">{score}</span>
            </div>

            <div className="bg-slate-900/30 border border-slate-850 rounded-2xl p-3 flex flex-col items-center justify-center">
              <span className="text-[9px] uppercase font-serif text-slate-500 font-bold tracking-wider mb-0.5">EXP nhận được</span>
              <span className="text-base font-mono font-black text-purple-400 animate-pulse">+{accumulatedXP}</span>
            </div>
          </div>

          {/* Time Limit Countdown is 45 seconds */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold px-1">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                Thời gian khẩn phản (45s)
              </span>
              <span className="font-mono text-cyan-400">{timeLeft}s</span>
            </div>
            <div className="w-full bg-slate-950/70 border border-slate-900 rounded-full h-1.5 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 transition-all duration-300"
                style={{ width: `${(timeLeft / 45) * 100}%` }}
              />
            </div>
          </div>

          {activeQuestion && (
            <div className="bg-slate-900/60 border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden space-y-6">
              
              {/* Star scale indicator */}
              <div className="flex justify-between items-center border-b border-slate-850 pb-4">
                <div className="flex gap-1 animate-[pulse_1.5s_infinite]">
                  {Array.from({ length: activeQuestion.stars || 3 }).map((_, sIdx) => (
                    <span key={sIdx} className="text-base text-amber-400">⭐</span>
                  ))}
                </div>
                <span className="bg-purple-900/20 text-purple-400 border border-purple-500/10 text-[9px] font-bold px-2 py-0.5 rounded-lg uppercase tracking-wider">
                  {activeQuestion.stars || 3} SAO • +{getStarXPAward(activeQuestion.stars || 3) * 5} EXP
                </span>
              </div>

              <h3 className="text-base sm:text-lg font-serif font-bold text-slate-100 leading-relaxed text-center min-h-[50px]">
                {activeQuestion.questionText}
              </h3>

              {activeQuestion.options ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {activeQuestion.options.map((opt, oIdx) => {
                    const letter = oIdx === 0 ? 'A' : oIdx === 1 ? 'B' : oIdx === 2 ? 'C' : 'D';
                    const isSelected = selectedLetter === letter;
                    const isCorrectAnswer = letter === activeQuestion.correctAnswer;
                    const optClean = opt.replace(/^[A-D]\.\s*/, '');

                    let btnStyle = 'border-slate-850 bg-slate-950/45 hover:bg-slate-900/80 text-slate-300 hover:text-slate-100 hover:border-slate-700';
                    let leadingStyle = 'bg-slate-900 border-slate-800 text-slate-450';

                    if (isAnswered) {
                      if (isCorrectAnswer) {
                        btnStyle = 'border-emerald-500 bg-emerald-500/10 text-emerald-250 font-bold';
                        leadingStyle = 'bg-emerald-500 text-white border-emerald-400';
                      } else if (isSelected) {
                        btnStyle = 'border-rose-500 bg-rose-500/10 text-rose-250 font-bold';
                        leadingStyle = 'bg-rose-500 text-white border-rose-455';
                      } else {
                        btnStyle = 'border-slate-850 bg-slate-950/10 text-slate-500 opacity-50';
                      }
                    }

                    return (
                      <button
                        key={oIdx}
                        disabled={isAnswered}
                        onClick={() => handleAnswerClick(letter)}
                        className={`p-3 border-2 rounded-2xl text-xs sm:text-sm font-semibold transition flex items-center gap-3 w-full cursor-pointer group ${btnStyle}`}
                      >
                        <span className={`w-8 h-8 rounded-lg border flex items-center justify-center font-black select-none ${leadingStyle}`}>
                          {letter}
                        </span>
                        <span className="leading-normal">{optClean}</span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                /* Text answers input fallback if needed */
                <div className="space-y-2">
                  <p className="text-xs text-rose-450 italic">Hỏi đáp trắc nghiệm được tối ưu hóa.</p>
                </div>
              )}

              <AnimatePresence>
                {isAnswered && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="border-t border-slate-850 pt-5 space-y-4"
                  >
                    <div className="p-4 bg-slate-950/50 rounded-2xl border border-slate-850">
                      <p className="text-[10px] text-amber-500 uppercase tracking-widest font-black font-serif mb-1">Góc Trí Tuệ</p>
                      <p className="text-xs text-slate-400 leading-relaxed">{activeQuestion.explanation}</p>
                    </div>

                    <div className="flex justify-between items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setGameOver(true);
                          playSound('victory');
                          if (accumulatedXP > 0) {
                            onGainXP(accumulatedXP, score);
                          }
                        }}
                        className="bg-slate-950 hover:bg-slate-900 border border-slate-800 text-amber-400 font-bold py-2.5 px-4 rounded-xl text-xs transition cursor-pointer"
                      >
                        💰 Dừng & Nhận {accumulatedXP} XP
                      </button>

                      <button
                        type="button"
                        onClick={handleNext}
                        className="bg-purple-500 hover:bg-purple-400 text-slate-950 font-serif italic font-extrabold py-2.5 px-5 rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer"
                      >
                        Tiếp tục
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          )}
        </div>
      ) : (
        /* GameOver / Level End Summary */
        <div className="bg-slate-900/60 border border-slate-800/80 p-8 rounded-3xl text-center space-y-6">
          <div className="space-y-1">
            <span className="text-4xl">👑</span>
            <h3 className="text-lg font-serif font-black text-slate-100 italic">Vượt Ải Thành Công!</h3>
            <p className="text-xs text-slate-400">Bạn đã hoàn tất cuộc thám hiểm trong Miền Ký Ức.</p>
          </div>

          <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto">
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-850">
              <p className="text-[9px] text-slate-500 uppercase tracking-wider font-semibold font-serif mb-0.5">Số câu trả lời đúng</p>
              <p className="text-lg font-mono font-black text-emerald-400">{score} câu</p>
            </div>
            
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-850">
              <p className="text-[9px] text-slate-500 uppercase tracking-wider font-semibold font-serif mb-0.5">EXP nhận được</p>
              <p className="text-lg font-mono font-black text-purple-400 animate-pulse font-serif italic">+{accumulatedXP}</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5 justify-center max-w-sm mx-auto pt-2">
            <button
              type="button"
              disabled={(profile.vipTickets || 0) < 1}
              onClick={startLevel}
              className={`flex-1 font-serif italic font-extrabold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition ${
                (profile.vipTickets || 0) >= 1
                  ? 'bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-400 hover:to-cyan-400 text-slate-950 cursor-pointer'
                  : 'bg-slate-800 text-slate-550 border border-slate-700/50 cursor-not-allowed text-slate-500'
              }`}
            >
              🎟️ Tiếp tục chơi ván mới (1 VIP)
            </button>
            
            <button
              type="button"
              onClick={onExit}
              className="flex-1 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-350 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              Trở lại sảnh chính
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
