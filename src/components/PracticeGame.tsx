import React, { useState, useEffect } from 'react';
import { Question } from '../types';
import { fetchNormalQuestions } from '../utils/questionService';
import { BookOpen, ChevronRight, Loader2, Cpu, Clock, HelpCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import { soundManager } from '../utils/ambientMusic';

interface PracticeGameProps {
  studentClass: string;
  onGainXP: (xpAmount: number) => void;
  onExit: () => void;
}

export function PracticeGame({ studentClass, onGainXP, onExit }: PracticeGameProps) {
  const [selectedTopic, setSelectedTopic] = useState<'cadao' | 'toanhoc' | 'lichsu' | 'khoahoc' | null>(null);
  
  // Game state
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [shortInput, setShortInput] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  
  const [streak, setStreak] = useState(0);
  const [sessionXP, setSessionXP] = useState(0);
  const [shownIds, setShownIds] = useState<string[]>([]);

  // Synthesizer beep using unified soundManager
  const playPracticeBeep = (freq: number, duration: number = 0.1, type: 'sine' | 'triangle' | 'sawtooth' | 'square' = 'sine') => {
    if (freq === 880) {
      soundManager.playCorrect();
    } else if (freq === 220) {
      soundManager.playIncorrect();
    } else {
      soundManager.playClick();
    }
  };

  // Fetch or retrieve a question
  const fetchNewQuestion = async (topicCode: 'cadao' | 'toanhoc' | 'lichsu' | 'khoahoc') => {
    setLoading(true);
    setIsSubmitted(false);
    setSelectedAnswer(null);
    setShortInput('');
    setIsCorrect(false);

    try {
      const qs = await fetchNormalQuestions(topicCode, 1, shownIds, studentClass);
      
      if (qs && qs.length > 0) {
        const q = qs[0];
        setCurrentQuestion(q);
        setShownIds(prev => [...prev, q.id]);
      } else {
        throw new Error('No question returned');
      }
    } catch (e) {
      console.warn('Practice mode failed to load question:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleStartTopic = (topic: 'cadao' | 'toanhoc' | 'lichsu' | 'khoahoc') => {
    playPracticeBeep(450, 0.1, 'sine');
    setSelectedTopic(topic);
    fetchNewQuestion(topic);
  };

  const handleSubmitAnswer = (answer: string) => {
    if (!currentQuestion || isSubmitted) return;

    let correct = false;
    if (currentQuestion.type === 'multiple-choice') {
      correct = answer === currentQuestion.correctAnswer;
      setSelectedAnswer(answer);
    } else {
      const normInput = answer.trim().toLowerCase();
      const normAnswer = currentQuestion.correctAnswer.trim().toLowerCase();
      correct = normInput === normAnswer || normInput.includes(normAnswer) || normAnswer.includes(normInput);
      setSelectedAnswer(answer);
    }

    setIsCorrect(correct);
    setIsSubmitted(true);

    if (correct) {
      playPracticeBeep(880, 0.2, 'triangle');
      const xpGained = 10; // +10 XP for practice correct answer
      setStreak(prev => prev + 1);
      setSessionXP(prev => prev + xpGained);
      onGainXP(xpGained);
    } else {
      playPracticeBeep(220, 0.35, 'square');
      setStreak(0);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {!selectedTopic ? (
        // Topic Select Screen
        <div className="bg-slate-950 border-2 border-cyan-500/20 rounded-3xl p-6 sm:p-8 shadow-[0_0_25px_rgba(6,182,212,0.1)] space-y-6 relative overflow-hidden cyber-scanlines">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
          <div className="text-center space-y-2">
            <h3 className="font-mono text-slate-100 text-xl font-black uppercase tracking-tight">PHÒNG LUYỆN THI THUẬT TOÁN COGNITIVE</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto font-semibold leading-relaxed">Chọn một nguồn chủ đề để kiểm chứng, mài giũa xung thần kinh tri thức liên tục.</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { id: 'cadao', name: 'Ca dao Tục ngữ VN', icon: '📜', color: 'bg-slate-900 border-rose-500/20 text-rose-450 hover:bg-rose-500/10 hover:border-rose-400/50' },
              { id: 'toanhoc', name: 'Toán học cấp THCS', icon: '🧮', color: 'bg-slate-900 border-cyan-500/25 text-cyan-450 hover:bg-cyan-500/10 hover:border-cyan-400/50' },
              { id: 'lichsu', name: 'Lịch sử Việt Nam', icon: '🛡️', color: 'bg-slate-900 border-amber-500/20 text-amber-450 hover:bg-amber-500/10 hover:border-amber-400/50' },
              { id: 'khoahoc', name: 'Khoa học Tự nhiên', icon: '🔬', color: 'bg-slate-900 border-emerald-500/20 text-emerald-450 hover:bg-emerald-500/10 hover:border-emerald-400/50' },
            ].map((topic) => (
              <button
                key={topic.id}
                onClick={() => handleStartTopic(topic.id as any)}
                className={`p-5 rounded-2xl border flex items-center gap-4 text-left transition hover:scale-[1.02] shadow-md cursor-pointer ${topic.color}`}
              >
                <span className="text-3xl filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)]">{topic.icon}</span>
                <div>
                  <h4 className="font-mono font-black text-sm uppercase tracking-tight">{topic.name}</h4>
                  <p className="text-[10px] text-slate-400 mt-1 font-semibold">Tích lũy +10 XP chuẩn xác không giới hạn</p>
                </div>
              </button>
            ))}
          </div>

          <button
            onClick={onExit}
            className="w-full py-3.5 px-4 rounded-xl border border-slate-800 text-slate-400 font-mono tracking-widest font-black uppercase text-[10px] hover:text-white text-center cursor-pointer transition bg-slate-900 hover:bg-slate-800"
          >
            QUAY LẠI TRANG CHỦ
          </button>
        </div>
      ) : (
        // Active practice cards
        <div className="bg-slate-950 border-2 border-cyan-500/30 rounded-3xl p-6 sm:p-8 shadow-[0_0_30px_rgba(6,182,212,0.15)] space-y-5 relative overflow-hidden cyber-scanlines animate-fade-in">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-cyan-500/10 gap-3">
            <div>
              <span className="text-[9px] uppercase font-mono font-black tracking-widest text-cyan-400">PHÒNG LUYỆN THI VÔ HẠN</span>
              <h4 className="text-sm font-mono font-black text-slate-100 uppercase tracking-tight">
                {selectedTopic === 'cadao' ? '📜 CA DAO TỤC NGỮ' : selectedTopic === 'toanhoc' ? '🧮 TOÁN HỌC' : selectedTopic === 'lichsu' ? '🛡️ LỊCH SỬ VIỆT NAM' : '🔬 KHOA HỌC TỰ NHIÊN'}
              </h4>
            </div>

            <div className="flex gap-2 text-[10px] font-mono tracking-wider">
              <span className="bg-amber-500/15 border border-amber-500/30 text-amber-400 px-3 py-1.5 rounded-lg font-black uppercase shadow-[0_0_8px_rgba(245,158,11,0.15)]">
                Streak: {streak} 🔥
              </span>
              <span className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 px-3 py-1.5 rounded-lg font-black uppercase">
                +{sessionXP} XP
              </span>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-3 font-mono">
              <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" />
              <p className="text-xs text-cyan-400 font-bold uppercase tracking-widest animate-pulse">ĐANG BIÊN SOẠN THUẬT TOÁN MỚI...</p>
            </div>
          ) : currentQuestion ? (
            <div className="space-y-5 animate-fade-in">
              {/* Question card */}
              <div className="p-6 rounded-2xl border border-cyan-500/10 bg-slate-900/60 min-h-[90px] flex items-center justify-center text-center">
                <p className="text-sm font-semibold text-slate-100 leading-relaxed md:text-base px-2">
                  {currentQuestion.questionText}
                </p>
              </div>

              {/* Visual Answer state feedback sound triggers */}
              {isSubmitted && (
                <div className={`p-4 rounded-xl border flex items-center gap-3 animate-fade-in font-mono ${
                  isCorrect 
                    ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.1)]' 
                    : 'bg-rose-950/20 border-rose-500/40 text-rose-450 text-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.1)]'
                }`}>
                  {isCorrect ? (
                    <>
                      <CheckCircle className="w-8 h-8 text-emerald-450 shrink-0" />
                      <div>
                        <h4 className="font-bold text-sm tracking-tight uppercase text-emerald-400">CHÍNH XÁC (+10 XP)</h4>
                        <p className="text-[11px] text-slate-400 mt-0.5 font-bold">Xung điện cực mạnh! Hãy tiếp tục duy trì đà thắng.</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-8 h-8 text-rose-455 text-rose-400 shrink-0 animate-pulse" />
                      <div>
                        <h4 className="font-bold text-sm tracking-tight uppercase text-rose-400">CHƯA CHÍNH XÁC!</h4>
                        <p className="text-[11px] text-slate-400 mt-0.5 font-bold">Hãy bổ sung lỗ hổng tri thức với giáo sư AI ngay.</p>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Question choices */}
              {currentQuestion.type === 'multiple-choice' ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {currentQuestion.options?.map((opt, i) => {
                    const letter = ['A', 'B', 'C', 'D'][i];
                    const isSelected = selectedAnswer === letter;
                    const isCorrectAnswer = letter === currentQuestion.correctAnswer;
                    
                    let bgStyle = 'border-slate-850 bg-slate-900/25 text-slate-300 hover:border-cyan-500/40 hover:bg-slate-905';
                    if (isSubmitted) {
                      if (isCorrectAnswer) bgStyle = 'bg-emerald-950/30 border-emerald-500 text-emerald-350 shadow-[0_0_12px_rgba(16,185,129,0.2)] font-black';
                      else if (isSelected) bgStyle = 'bg-rose-950/30 border-rose-505 border-rose-500 text-rose-350 font-black';
                      else bgStyle = 'opacity-40 pointer-events-none text-slate-600 border-transparent';
                    }

                    return (
                      <button
                        key={letter}
                        type="button"
                        disabled={isSubmitted}
                        onClick={() => handleSubmitAnswer(letter)}
                        className={`p-4 rounded-xl border-2 text-xs sm:text-sm font-semibold text-left flex items-start gap-3.5 transition cursor-pointer ${bgStyle} items-center`}
                      >
                        <span className={`w-7 h-7 shrink-0 rounded-lg font-mono font-bold text-xs flex items-center justify-center ${
                          isSubmitted && isCorrectAnswer 
                            ? 'bg-emerald-500 text-slate-900 font-extrabold' 
                            : isSubmitted && isSelected 
                            ? 'bg-rose-500 text-slate-900 font-extrabold' 
                            : 'bg-slate-950 text-slate-400 border border-slate-800'
                        }`}>
                          {letter}
                        </span>
                        <span className="flex-1 mt-0.5 leading-normal">{opt}</span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-3 font-mono">
                  {!isSubmitted ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={shortInput}
                        onChange={(e) => setShortInput(e.target.value)}
                        placeholder="Nhập câu trả lời cụ thể..."
                        className="flex-1 bg-slate-950 border-2 border-slate-850 rounded-xl py-3 px-4 focus:outline-none focus:border-cyan-400 text-sm font-semibold text-slate-200 placeholder:text-slate-650"
                        onKeyDown={(e) => e.key === 'Enter' && handleSubmitAnswer(shortInput)}
                      />
                      <button
                        type="button"
                        onClick={() => handleSubmitAnswer(shortInput)}
                        className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black py-3 px-6 rounded-xl text-xs uppercase tracking-widest transition duration-150 shadow-[0_0_15px_rgba(6,182,212,0.25)] cursor-pointer shrink-0"
                      >
                        KIỂM CHỨNG
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2 text-xs font-bold">
                      <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-slate-350">CỦA BẠN: "{shortInput || '[BỎ TRỐNG]'}"</div>
                      <div className="p-4 bg-emerald-950/20 border border-emerald-500/30 text-emerald-400 rounded-xl">🔑 ĐÁP ÁN ĐÚNG: "{currentQuestion.correctAnswer}"</div>
                    </div>
                  )}
                </div>
              )}

              {/* Explainer panel */}
              {isSubmitted && (
                <div className="p-5 bg-cyan-950/15 border border-cyan-500/25 rounded-2xl space-y-2 animate-fade-in text-xs font-semibold">
                  <p className="text-[10px] font-mono font-black text-cyan-400 uppercase tracking-widest flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-cyan-400" />
                    GIẢI THÍCH CHUYÊN GIA (MAIN FRAME DECODING)
                  </p>
                  <p className="text-slate-300 leading-relaxed">
                    {currentQuestion.explanation}
                  </p>
                </div>
              )}

              {/* CTA Next question */}
              <div className="flex justify-between items-center border-t border-cyan-500/10 pt-4 font-mono">
                <button
                  type="button"
                  onClick={() => {
                    playPracticeBeep(300, 0.1, 'sine');
                    setSelectedTopic(null);
                  }}
                  className="text-slate-500 hover:text-slate-305 hover:text-slate-300 text-xs font-black uppercase tracking-wider cursor-pointer transition"
                >
                  ĐỔI CHỦ ĐỀ KHÁC
                </button>

                {isSubmitted && (
                  <button
                    type="button"
                    onClick={() => {
                      playPracticeBeep(550, 0.1, 'sine');
                      fetchNewQuestion(selectedTopic);
                    }}
                    className="bg-gradient-to-r from-cyan-500 via-teal-500 to-indigo-505 to-indigo-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-mono font-black py-3 px-6 rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer tracking-widest uppercase shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                  >
                    BÀI TIẾP THEO (NEXT_P)
                    <ChevronRight className="w-4 h-4 shrink-0" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="py-10 text-center text-slate-500 font-mono">Không thấy câu đố thích hợp.</div>
          )}
        </div>
      )}
    </div>
  );
}
