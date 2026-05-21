import React, { useState, useEffect, useRef } from 'react';
import { Question, HistoryRecord } from '../types';
import { CheckCircle2, XCircle, Award, ArrowRight, Loader2, BookOpen, Clock, Zap } from 'lucide-react';
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
  username,
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-28 text-center space-y-4 animate-fade-in">
        <Loader2 className="w-12 h-12 text-amber-500 animate-spin" />
        <h3 className="text-xl font-serif font-black text-slate-100 italic">Đang khởi tạo tuyển tập đề thi...</h3>
        <p className="text-xs text-slate-400 max-w-sm leading-normal">
          {topic === 'custom' 
            ? 'Đang lọc câu hỏi trong kho lưu trữ...' 
            : 'Gemini AI đang truy xuất & thẩm định 10 câu hỏi ngẫu nhiên từ ngân hàng không trùng lặp...'}
        </p>
      </div>
    );
  }

  if (error || questions.length === 0) {
    return (
      <div className="p-6 text-center space-y-4 max-w-md mx-auto">
        <XCircle className="w-16 h-16 text-rose-500 mx-auto" />
        <h3 className="text-xl font-serif font-bold text-slate-200">Trục trặc kỹ thuật</h3>
        <p className="text-sm text-slate-400 leading-normal">{error || 'Không thể xây dựng danh sách câu đố phù hợp lúc này.'}</p>
        <div className="flex justify-center gap-3">
          <button
            onClick={onExit}
            className="bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 py-2.5 px-6 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            Quay lại dashboard
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
      // For short-answer, trim, lowercase, ignore accents difference of basic style or direct match
      const normalizeInput = chosenVal.trim().toLowerCase();
      const normalizeAnswer = currentQuestion.correctAnswer.trim().toLowerCase();
      isCorrect = normalizeInput === normalizeAnswer || normalizeInput.includes(normalizeAnswer) || normalizeAnswer.includes(normalizeInput);
    }

    if (isCorrect) {
      setScore(prev => prev + 1);
      setSolvedIds(prev => [...prev, currentQuestion.id]);
    }
  };

  const handleNext = () => {
    if (currentIndex === questions.length - 1) {
      // Completed All 10 Questions!
      const totalTime = Math.floor((Date.now() - startTime.current) / 1000);
      
      // Title logic
      // > 5-7 (meaning >= 5): "Đa Tài"
      // < 5: "học nhiều vào"
      const titleEarned = score >= 5 ? 'Đa Tài' : 'học nhiều vào';
      
      // Calculate XP gained: +15 XP for every correct answer, +30 bonus XP for scores >= 7!
      const gainedXP = (score * 15) + (score >= 7 ? 30 : 0);
      
      onGameComplete(score, questions.length, totalTime, titleEarned, gainedXP, solvedIds);
    } else {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShortAnswerInput('');
      setIsAnswered(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-slate-900/40 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xl space-y-6">
      {/* Quiz info bar */}
      <div className="flex items-center justify-between border-b pb-4 border-slate-800/80">
        <div>
          <span className="text-[10px] uppercase font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
            {getCurrentTopicName()}
          </span>
          <h3 className="font-serif italic font-bold text-slate-100 text-sm mt-2">Câu {currentIndex + 1} trên {questions.length}</h3>
        </div>

        <div className="flex items-center gap-4 text-xs font-semibold text-slate-400">
          <div className="flex items-center gap-1.5 font-mono">
            <Clock className="w-4 h-4 text-slate-500" />
            <span>{Math.floor(timerSeconds / 60)}:{(timerSeconds % 60).toString().padStart(2, '0')}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-amber-500/10 text-amber-400 px-2.5 py-1 rounded-lg border border-amber-500/20">
            <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>Đúng: {score}</span>
          </div>
        </div>
      </div>

      {/* Progress slider */}
      <div className="w-full bg-slate-950 border border-slate-800/40 h-2.5 rounded-full overflow-hidden">
        <div 
          className="bg-gradient-to-r from-amber-400 to-amber-500 h-full transition-all duration-300 shadow-[0_0_10px_rgba(245,158,11,0.4)]"
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Question panel */}
      <div className="space-y-4">
        <div className="p-5 bg-slate-950/60 rounded-xl border border-slate-800/80 min-h-[100px] flex items-center justify-center text-center">
          <p className="text-sm font-bold text-slate-200 leading-relaxed md:text-base">
            {currentQuestion.questionText}
          </p>
        </div>

        {/* Input area depending on multiple-choice or short-answer */}
        {currentQuestion.type === 'multiple-choice' ? (
          <div className="grid gap-2.5 sm:grid-cols-2">
            {currentQuestion.options?.map((opt, i) => {
              const letter = ['A', 'B', 'C', 'D'][i];
              const isSelected = selectedAnswer === letter;
              const isCorrectAnswer = letter === currentQuestion.correctAnswer;
              
              let btnClass = 'border-slate-805 border-slate-800 bg-slate-950 text-slate-300 hover:bg-slate-900/40 hover:border-slate-700';
              if (isAnswered) {
                if (isCorrectAnswer) {
                  btnClass = 'bg-emerald-950/40 border-emerald-500 text-emerald-300 ring-2 ring-emerald-500/50';
                } else if (isSelected) {
                  btnClass = 'bg-rose-950/40 border-rose-500 text-rose-300 ring-2 ring-rose-500/50';
                } else {
                  btnClass = 'border-slate-950 bg-slate-950/20 text-slate-600 opacity-45';
                }
              }

              return (
                <button
                  key={letter}
                  type="button"
                  disabled={isAnswered}
                  onClick={() => handleAnswerSubmit(letter)}
                  className={`p-3.5 rounded-xl border-2 text-xs font-bold text-left flex items-start gap-3 transition-all duration-150 cursor-pointer ${btnClass}`}
                >
                  <span className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center font-bold text-xs ${
                    isAnswered && isCorrectAnswer 
                      ? 'bg-emerald-600 text-white' 
                      : isAnswered && isSelected 
                      ? 'bg-rose-600 text-white' 
                      : 'bg-slate-850 text-slate-300 bg-slate-800'
                  }`}>
                    {letter}
                  </span>
                  <span className="flex-1 mt-0.5">{opt}</span>
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
                  className="flex-1 bg-slate-950 border-2 border-slate-800 rounded-xl py-2.5 px-4 focus:outline-none focus:border-amber-500 font-bold text-slate-200 text-sm placeholder:text-slate-600"
                />
                <button
                  type="button"
                  onClick={() => handleAnswerSubmit(shortAnswerInput)}
                  className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold py-2.5 px-6 rounded-xl text-xs transition duration-150 uppercase shadow-[0_0_10px_rgba(245,158,11,0.25)] cursor-pointer shrink-0"
                >
                  Xác nhận
                </button>
              </div>
            ) : (
              <div className="space-y-2 animate-fade-in">
                <div className="p-3.5 rounded-xl border border-slate-805 border-slate-800/80 flex items-center gap-3 bg-slate-950/40 text-sm font-bold text-slate-350 text-slate-300">
                  <span>Bạn trả lời:</span>
                  <span className={shortAnswerInput.trim().toLowerCase() === currentQuestion.correctAnswer.trim().toLowerCase() ? 'text-emerald-400' : 'text-slate-400 font-medium'}>
                    "{shortAnswerInput || '[Bỏ trống]'}"
                  </span>
                </div>
                
                <div className="p-3.5 rounded-xl border bg-emerald-950/45 border-emerald-500/40 text-sm font-bold text-emerald-400">
                  🔑 Đáp án chuẩn xác của Giáo sư: "{currentQuestion.correctAnswer}"
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Explanatory notes showing after answering */}
      {isAnswered && (
        <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl space-y-1.5 animate-fade-in">
          <p className="text-[10px] font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1.5 font-serif italic">
            <BookOpen className="w-3.5 h-3.5 text-amber-500" />
            Ống kính tri thức và Giải thích
          </p>
          <p className="text-xs text-slate-300 leading-relaxed font-medium">
            {currentQuestion.explanation}
          </p>
        </div>
      )}

      {/* Navigation button at footer */}
      <div className="flex items-center justify-between border-t border-slate-800/60 pt-4">
        <button
          type="button"
          onClick={onExit}
          className="text-slate-500 hover:text-slate-300 py-2 px-3 text-xs font-bold transition cursor-pointer"
        >
          Hủy bỏ ván chơi
        </button>

        {isAnswered && (
          <button
            type="button"
            onClick={handleNext}
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold py-2.5 px-6 rounded-xl text-xs transition duration-150 flex items-center gap-1.5 uppercase tracking-wider shadow-[0_0_15px_rgba(245,158,11,0.25)] cursor-pointer"
          >
            {currentIndex === questions.length - 1 ? 'Xem kết quả' : 'Câu kế tiếp'}
            <ArrowRight className="w-4 h-4 text-slate-950 shrink-0" />
          </button>
        )}
      </div>
    </div>
  );
}
