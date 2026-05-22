import React, { useState, useEffect, useRef } from 'react';
import { Question } from '../types';
import { Loader2, BookOpen, Clock, Zap, ArrowRight, XCircle } from 'lucide-react';
import { fetchNormalQuestions } from '../utils/questionService';

interface NormalGameProps {
  topic: 'cadao' | 'toanhoc' | 'lichsu' | 'khoahoc' | 'custom';
  customQuestions?: Question[]; // load user created questions if mode is custom
  excludeIds: string[];
  username: string; // pass student name to show on results
  studentClass: string; // pass student class to filter difficulty and context
  onGameComplete: (score: number, totalQuestions: number, durationSeconds: number, titleEarned: string, gainedXP: number, newlySolvedIds: string[]) => void;
  onExit: () => void;
}

export function NormalGame({ 
  topic, 
  customQuestions = [], 
  excludeIds, 
  studentClass,
  onGameComplete, 
  onExit 
}: NormalGameProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [shortAnswerInput, setShortAnswerInput] = useState('');
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  
  // Scoring / tracking
  const [solvedIds, setSolvedIds] = useState<string[]>([]);
  const startTime = useRef<number>(Date.now());
  const [timerSeconds, setTimerSeconds] = useState(0);

  // Load questions
  useEffect(() => {
    let active = true;
    
    async function loadQuizQuestions() {
      if (topic === 'custom') {
        const shuffled = [...customQuestions].sort(() => 0.5 - Math.random()).slice(0, 10);
        if (shuffled.length === 0) {
          setError('Không có câu hỏi tự biên soạn nào phù hợp!');
          setLoading(false);
          return;
        }
        setQuestions(shuffled);
        setLoading(false);
        startTime.current = Date.now();
        return;
      }

      try {
        setLoading(true);
        setError('');
        
        const qs = await fetchNormalQuestions(
          topic as 'cadao' | 'toanhoc' | 'lichsu' | 'khoahoc',
          10,
          excludeIds,
          studentClass
        );

        if (active) {
          if (qs && qs.length > 0) {
            setQuestions(qs);
            setLoading(false);
            startTime.current = Date.now();
          } else {
            throw new Error('Không thể xây dựng danh sách câu hỏi phù hợp.');
          }
        }
      } catch (err: any) {
        if (active) {
          setError(err.message || 'Lỗi mạng kết nối máy chủ!');
          setLoading(false);
          startTime.current = Date.now();
        }
      }
    }

    loadQuizQuestions();
    
    // Timer ticker
    const timer = setInterval(() => {
      setTimerSeconds(prev => prev + 1);
    }, 1000);

    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [topic, excludeIds, customQuestions, studentClass]);

  const getCurrentTopicName = () => {
    switch (topic) {
      case 'cadao': return 'Ca dao Tục ngữ Việt Nam';
      case 'toanhoc': return 'Toán học cấp THCS';
      case 'lichsu': return 'Lịch sử nước nhà Việt Nam';
      case 'khoahoc': return 'Khoa học Tự nhiên';
      case 'custom': return 'Bài thi Tự soạn cá nhân';
      default: return '';
    }
  };

  // Audio synthesizer for scientific-futuristic immersion
  const playNormalBeep = (freq: number, duration: number = 0.1, type: 'sine' | 'triangle' | 'sawtooth' | 'square' = 'sine') => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      // Audio autoplay restrictions bypass
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-28 text-center space-y-4 animate-fade-in font-mono">
        <Loader2 className="w-12 h-12 text-cyan-400 animate-spin" />
        <h3 className="text-xl font-black text-slate-100 uppercase tracking-tight">ĐANG KHỞI TẠO TUYỂN TẬP ĐỀ THI TRÍ TUỆ</h3>
        <p className="text-xs text-cyan-400 max-w-sm leading-normal font-bold">
          {topic === 'custom' 
            ? 'Đang lọc câu hỏi trong kho lưu trữ...' 
            : 'Mạng thần kinh đang truy xuất h/thống 10 câu hỏi ngẫu nhiên từ dải dữ liệu 10,000 câu...'}
        </p>
      </div>
    );
  }

  if (error || questions.length === 0) {
    return (
      <div className="p-6 text-center space-y-4 max-w-md mx-auto font-mono">
        <XCircle className="w-16 h-16 text-rose-500 mx-auto" />
        <h3 className="text-xl font-black text-slate-200">TRỤC TRẶC KẾT NỐI MẠNG AN NINH</h3>
        <p className="text-sm text-slate-400 leading-normal">{error || 'Không thể xây dựng danh sách câu đố phù hợp lúc này.'}</p>
        <div className="flex justify-center gap-3">
          <button
            onClick={onExit}
            className="bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 py-2.5 px-6 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            Quay lại bảng thần kinh
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  const handleAnswerSubmit = (chosenVal: string) => {
    if (isAnswered) return;
    
    setSelectedAnswer(chosenVal);
    setIsAnswered(true);

    let isCorrect = false;
    if (currentQuestion.type === 'multiple-choice') {
      isCorrect = chosenVal === currentQuestion.correctAnswer;
    } else {
      const normalizeInput = chosenVal.trim().toLowerCase();
      const normalizeAnswer = currentQuestion.correctAnswer.trim().toLowerCase();
      isCorrect = normalizeInput === normalizeAnswer || normalizeInput.includes(normalizeAnswer) || normalizeAnswer.includes(normalizeInput);
    }

    if (isCorrect) {
      playNormalBeep(880, 0.15, 'triangle');
      setScore(prev => prev + 1);
      setSolvedIds(prev => [...prev, currentQuestion.id]);
    } else {
      playNormalBeep(260, 0.3, 'sawtooth');
    }
  };

  const handleNext = () => {
    playNormalBeep(600, 0.08, 'sine');
    if (currentIndex === questions.length - 1) {
      const totalTime = Math.floor((Date.now() - startTime.current) / 1000);
      const titleEarned = score >= 5 ? 'Đa Tài' : 'học nhiều vào';
      const gainedXP = score * 500;
      onGameComplete(score, questions.length, totalTime, titleEarned, gainedXP, solvedIds);
    } else {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShortAnswerInput('');
      setIsAnswered(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-slate-950 border-2 border-cyan-500/30 rounded-3xl p-6 sm:p-8 shadow-[0_0_30px_rgba(6,182,212,0.15)] space-y-6 relative overflow-hidden cyber-scanlines">
      {/* Dynamic scan line decoration */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse pointer-events-none" />

      {/* Quiz info bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 border-cyan-500/10">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[9px] uppercase font-mono font-black tracking-widest text-[#090d16] bg-cyan-400 border border-cyan-300/30 px-3 py-1 rounded-md shadow-[0_0_10px_rgba(34,211,238,0.2)]">
              {getCurrentTopicName().toUpperCase()}
            </span>
            <span className="text-[9px] font-mono tracking-wider text-amber-400 flex items-center gap-1 bg-slate-900 px-2.5 py-1 rounded border border-amber-500/20 font-black">
              ⭐ Chế độ 3 Sao (+500 EXP / Câu)
            </span>
          </div>
          <h3 className="font-mono text-slate-100 font-extrabold text-sm tracking-tight mt-3">
            PHÂN KHU KHẢO SÁT: <span className="text-cyan-400 uppercase">CÂU {currentIndex + 1} / {questions.length}</span>
          </h3>
        </div>

        <div className="flex items-center gap-3 text-xs shrink-0">
          <div className="flex items-center gap-1.5 font-mono bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-slate-300">
            <Clock className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span className="font-bold">{Math.floor(timerSeconds / 60)}:{(timerSeconds % 60).toString().padStart(2, '0')}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-cyan-950/40 text-cyan-400 border border-cyan-500/20 px-3 py-1.5 rounded-lg font-mono">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-black">ĐÚNG: {score}</span>
          </div>
        </div>
      </div>

      {/* Progress slider */}
      <div className="space-y-1">
        <div className="flex justify-between text-[10px] font-mono text-slate-500 font-bold uppercase tracking-wider">
          <span>Tiến độ truyền tải:</span>
          <span>{Math.round(((currentIndex + 1) / questions.length) * 100)}%</span>
        </div>
        <div className="w-full bg-slate-900 border border-slate-800 h-2.5 rounded-full overflow-hidden">
          <div 
            className="bg-gradient-to-r from-cyan-500 via-teal-400 to-indigo-505 to-indigo-500 h-full transition-all duration-350 shadow-[0_0_10px_rgba(6,182,212,0.4)]"
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question panel with technological layout */}
      <div className="space-y-4">
        <div className="p-6 bg-slate-900/60 rounded-2xl border border-cyan-500/10 min-h-[110px] flex items-center justify-center text-center relative overflow-hidden">
          <div className="absolute top-2 left-2 text-[10px] font-mono text-cyan-600/40 font-black">STATION_DECODER_v4.2</div>
          <p className="text-sm font-semibold text-slate-100 leading-relaxed md:text-base px-2 max-w-xl">
            {currentQuestion.questionText}
          </p>
        </div>

        {/* Input area depending on multiple-choice or short-answer */}
        {currentQuestion.type === 'multiple-choice' ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {currentQuestion.options?.map((opt, i) => {
              const letter = ['A', 'B', 'C', 'D'][i];
              const isSelected = selectedAnswer === letter;
              const isCorrectAnswer = letter === currentQuestion.correctAnswer;
              
              let btnClass = 'border-slate-850 hover:border-cyan-500/40 bg-slate-900/25 text-slate-300 hover:bg-slate-900/50';
              if (isAnswered) {
                if (isCorrectAnswer) {
                  btnClass = 'bg-emerald-950/30 border-emerald-500 text-emerald-350 shadow-[0_0_15px_rgba(16,185,129,0.15)] font-black';
                } else if (isSelected) {
                  btnClass = 'bg-rose-950/30 border-rose-500 text-rose-350 shadow-[0_0_15px_rgba(244,63,94,0.15)] font-black';
                } else {
                  btnClass = 'border-slate-950 bg-transparent text-slate-600 opacity-40';
                }
              }

              return (
                <button
                  key={letter}
                  type="button"
                  disabled={isAnswered}
                  onClick={() => {
                    playNormalBeep(500, 0.05, 'triangle');
                    handleAnswerSubmit(letter);
                  }}
                  className={`p-4 rounded-xl border-2 text-xs sm:text-sm font-semibold text-left flex items-start gap-3.5 transition-all duration-150 cursor-pointer ${btnClass} justify-between items-center`}
                >
                  <div className="flex items-start gap-3">
                    <span className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center font-mono font-bold text-xs ${
                      isAnswered && isCorrectAnswer 
                        ? 'bg-emerald-500 text-slate-900 font-extrabold' 
                        : isAnswered && isSelected 
                        ? 'bg-rose-500 text-slate-900 font-extrabold' 
                        : 'bg-slate-950 text-slate-300 border border-slate-800'
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
          <div className="space-y-2">
            {!isAnswered ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={shortAnswerInput}
                  onChange={(e) => setShortAnswerInput(e.target.value)}
                  placeholder="Nhập câu trả lời cụ thể của bạn tại đây..."
                  onKeyDown={(e) => e.key === 'Enter' && handleAnswerSubmit(shortAnswerInput)}
                  className="flex-1 bg-slate-950 border-2 border-slate-850 rounded-xl py-3 px-4 focus:outline-none focus:border-cyan-400 font-mono tracking-wide text-slate-200 text-sm placeholder:text-slate-650"
                />
                <button
                  type="button"
                  onClick={() => handleAnswerSubmit(shortAnswerInput)}
                  className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono font-black py-3 px-6 rounded-xl text-xs transition duration-150 uppercase tracking-widest shadow-[0_0_15px_rgba(6,182,212,0.25)] cursor-pointer shrink-0"
                >
                  THỦ NGHIỆM
                </button>
              </div>
            ) : (
              <div className="space-y-3 animate-fade-in font-mono text-xs">
                <div className="p-4 rounded-xl border border-slate-900 bg-slate-900/30 flex items-center gap-3 text-slate-300">
                  <span className="text-slate-550 font-bold uppercase">Hồi đáp:</span>
                  <span className={shortAnswerInput.trim().toLowerCase() === currentQuestion.correctAnswer.trim().toLowerCase() ? 'text-emerald-400 font-bold' : 'text-slate-400 font-semibold'}>
                    "{shortAnswerInput || '[BỎ TRỐNG]'}"
                  </span>
                </div>
                
                <div className="p-4 rounded-xl border bg-emerald-950/20 border-emerald-500/30 text-emerald-400 font-black">
                  🔑 TÍN HIỆU KHẢO CHÚNG KHỚP: "{currentQuestion.correctAnswer}"
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Explanatory notes showing after answering */}
      {isAnswered && (
        <div className="p-5 bg-cyan-950/15 border border-cyan-500/20 rounded-2xl space-y-2 animate-fade-in">
          <p className="text-[10px] font-mono font-black text-cyan-400 uppercase tracking-widest flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-cyan-400" />
            GIẢI THÍCH CHUYÊN GIA (MAIN FRAME DECODING)
          </p>
          <p className="text-xs text-slate-305 text-slate-300 leading-relaxed font-semibold">
            {currentQuestion.explanation}
          </p>
        </div>
      )}

      {/* Navigation button at footer */}
      <div className="flex items-center justify-between border-t border-cyan-500/10 pt-5 font-mono">
        <button
          type="button"
          onClick={onExit}
          className="text-slate-500 hover:text-slate-300 py-2 px-3 text-xs font-black uppercase tracking-wider transition cursor-pointer"
        >
          HỦY BỎ LIÊN KẾT
        </button>

        {isAnswered && (
          <button
            type="button"
            onClick={handleNext}
            className="bg-gradient-to-r from-cyan-500 via-teal-500 to-indigo-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-mono font-black py-3 px-6 rounded-xl text-xs transition duration-150 flex items-center gap-1.5 uppercase tracking-widest shadow-[0_0_15px_rgba(6,182,212,0.3)] cursor-pointer"
          >
            {currentIndex === questions.length - 1 ? 'KẾT THÚC KHẢO SÁT 💻' : 'KẾ TIẾP (NEXT_SEQ) ⚙️'}
            <ArrowRight className="w-4 h-4 text-slate-950 shrink-0" />
          </button>
        )}
      </div>
    </div>
  );
}
