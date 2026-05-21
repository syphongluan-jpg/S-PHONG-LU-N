import React, { useState, useEffect } from 'react';
import { Question } from '../types';
import { fetchNormalQuestions } from '../utils/questionService';
import { CheckCircle2, XCircle, Award, BookOpen, ChevronRight, Loader2, PlayCircle, HelpCircle } from 'lucide-react';

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
      const xpGained = 10; // +10 XP for practice correct answer
      setStreak(prev => prev + 1);
      setSessionXP(prev => prev + xpGained);
      onGainXP(xpGained);
      
      // Try to play positive audio synth sounds, or visually trigger effects
    } else {
      setStreak(0);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {!selectedTopic ? (
        // Topic Select Screen
        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <h3 className="font-serif italic font-black text-slate-100 text-xl sm:text-2xl">Phòng Luyện thi Vô hạn</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">Chọn một chủ đề môn học để bắt đầu luyện tập, mài giũa kiến thức và cày cấp độ không giới hạn!</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { id: 'cadao', name: 'Ca dao Tục ngữ VN', icon: '📜', color: 'bg-slate-950 hover:bg-slate-900 border-slate-800 text-slate-100 hover:border-amber-500/20' },
              { id: 'toanhoc', name: 'Toán học cấp THCS', icon: '🧮', color: 'bg-slate-950 hover:bg-slate-900 border-slate-800 text-slate-100 hover:border-amber-500/20' },
              { id: 'lichsu', name: 'Lịch sử Việt Nam', icon: '🛡️', color: 'bg-slate-950 hover:bg-slate-900 border-slate-800 text-slate-100 hover:border-amber-500/20' },
              { id: 'khoahoc', name: 'Khoa học Tự nhiên', icon: '🔬', color: 'bg-slate-950 hover:bg-slate-900 border-slate-800 text-slate-100 hover:border-amber-500/20' },
            ].map((topic) => (
              <button
                key={topic.id}
                onClick={() => handleStartTopic(topic.id as any)}
                className={`p-5 rounded-2xl border flex items-center gap-4 text-left transition hover:scale-[1.01] shadow-md cursor-pointer ${topic.color}`}
              >
                <span className="text-3xl">{topic.icon}</span>
                <div>
                  <h4 className="font-serif italic font-extrabold text-sm text-slate-200">{topic.name}</h4>
                  <p className="text-[10px] text-slate-500 mt-1">Trả lời tự do, tích lũy +10 XP mỗi câu đúng</p>
                </div>
              </button>
            ))}
          </div>

          <button
            onClick={onExit}
            className="w-full py-2 px-4 rounded-xl border border-slate-800 text-slate-500 font-bold hover:text-slate-300 text-xs text-center block cursor-pointer transition hover:bg-slate-950"
          >
            Quay lại trang chính
          </button>
        </div>
      ) : (
        // Active practice cards
        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-850">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Mô-đun luyện tập</span>
              <h4 className="text-base font-serif italic font-extrabold text-slate-100">
                {selectedTopic === 'cadao' ? '📜 Ca dao Tục ngữ' : selectedTopic === 'toanhoc' ? '🧮 Toán học' : selectedTopic === 'lichsu' ? '🛡️ Lịch sử' : '🔬 Khoa học'}
              </h4>
            </div>

            <div className="flex gap-2 text-[11px] font-bold">
              <span className="bg-amber-500/10 border border-amber-500/20 text-amber-400 px-3 py-1 rounded-full">
                Chuỗi đúng: {streak} 🔥
              </span>
              <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full">
                +{sessionXP} XP
              </span>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-3">
              <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
              <p className="text-xs text-slate-500">Sinh câu hỏi thông minh mới...</p>
            </div>
          ) : currentQuestion ? (
            <div className="space-y-5 animate-fade-in">
              {/* Question card */}
              <div className="p-5 rounded-2xl border border-slate-800 bg-slate-950/60 min-h-[90px] flex items-center justify-center text-center">
                <p className="text-sm font-serif italic font-bold text-slate-200 leading-relaxed md:text-base">
                  {currentQuestion.questionText}
                </p>
              </div>

              {/* Visual Answer state feedback sound triggers */}
              {isSubmitted && (
                <div className={`p-4 rounded-xl border flex items-center gap-3 animate-bounce ${
                  isCorrect 
                    ? 'bg-emerald-950/20 border-emerald-800/80 text-emerald-400' 
                    : 'bg-rose-950/20 border-rose-800/85 text-rose-400'
                }`}>
                  {isCorrect ? (
                    <>
                      <CheckCircle2 className="w-8 h-8 text-emerald-550 text-emerald-400 shrink-0" />
                      <div>
                        <h4 className="font-serif italic font-extrabold text-sm">Chính xác tuyệt diệu! (+10 XP)</h4>
                        <p className="text-xs text-slate-400">Bạn giữ ngọn lửa nhiệt huyết cực tốt!</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-8 h-8 text-rose-550 text-rose-400 shrink-0" />
                      <div>
                        <h4 className="font-serif italic font-extrabold text-sm">Chưa đúng mất rồi!</h4>
                        <p className="text-xs text-slate-400">Đừng nản lòng, đọc giải thích và tiếp tục nào ván mới nào.</p>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Question choices */}
              {currentQuestion.type === 'multiple-choice' ? (
                <div className="grid gap-2.5 sm:grid-cols-2">
                  {currentQuestion.options?.map((opt, i) => {
                    const letter = ['A', 'B', 'C', 'D'][i];
                    const isSelected = selectedAnswer === letter;
                    const isCorrectAnswer = letter === currentQuestion.correctAnswer;
                    
                    let bgStyle = 'border-slate-800 bg-slate-950 text-slate-300 hover:bg-slate-900/60';
                    if (isSubmitted) {
                      if (isCorrectAnswer) bgStyle = 'bg-emerald-950/30 border-emerald-500 text-emerald-400 ring-1 ring-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.15)]';
                      else if (isSelected) bgStyle = 'bg-rose-950/30 border-rose-500 text-rose-400 ring-1 ring-rose-500/55';
                      else bgStyle = 'opacity-40 pointer-events-none text-slate-500 border-slate-850';
                    }

                    return (
                      <button
                        key={letter}
                        type="button"
                        disabled={isSubmitted}
                        onClick={() => handleSubmitAnswer(letter)}
                        className={`p-3.5 rounded-xl border text-xs font-bold text-left flex items-start gap-3 transition cursor-pointer ${bgStyle}`}
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
                  {!isSubmitted ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={shortInput}
                        onChange={(e) => setShortInput(e.target.value)}
                        placeholder="Nhập câu trả lời cụ thể..."
                        className="flex-1 bg-slate-950 border-2 border-slate-800 rounded-xl py-2 px-4 focus:outline-none focus:border-amber-500 text-sm font-semibold text-slate-200 placeholder:text-slate-650"
                        onKeyDown={(e) => e.key === 'Enter' && handleSubmitAnswer(shortInput)}
                      />
                      <button
                        type="button"
                        onClick={() => handleSubmitAnswer(shortInput)}
                        className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-550 text-slate-950 font-extrabold py-2.5 px-6 rounded-xl text-xs uppercase tracking-wider transition cursor-pointer"
                      >
                        Kiểm chứng
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2 text-xs font-bold">
                      <p className="p-3 bg-slate-950 border border-slate-800/80 rounded-xl text-slate-400">Của bạn: "{shortInput || '[Bỏ trống]'}"</p>
                      <p className="p-3 bg-emerald-950/20 border border-emerald-800 text-emerald-400 rounded-xl">🔑 Thiết lập đúng: "{currentQuestion.correctAnswer}"</p>
                    </div>
                  )}
                </div>
              )}

              {/* Explainer panel */}
              {isSubmitted && (
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                  <p className="text-[10px] font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5" />
                    Bác học Giải nghĩa
                  </p>
                  <p className="text-xs text-slate-350 leading-relaxed font-sans font-normal">
                    {currentQuestion.explanation}
                  </p>
                </div>
              )}

              {/* CTA Next question */}
              <div className="flex justify-between items-center border-t border-slate-850 pt-4">
                <button
                  onClick={() => setSelectedTopic(null)}
                  className="text-slate-500 hover:text-slate-300 text-xs font-bold cursor-pointer transition"
                >
                  Đổi chủ đề thực hành
                </button>

                {isSubmitted && (
                  <button
                    onClick={() => fetchNewQuestion(selectedTopic)}
                    className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold py-2 px-5 rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer tracking-wider uppercase shadow-[0_0_10px_rgba(241,158,11,0.2)]"
                  >
                    Luyện câu tiếp theo
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="py-10 text-center text-slate-500">Không thấy câu đố thích hợp.</div>
          )}
        </div>
      )}
    </div>
  );
}
