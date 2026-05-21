import React, { useState, useEffect } from 'react';
import { Question, UserProfile } from '../types';
import { getTenThousandQuestion, getTenThousandQuestionsChunk } from '../utils/tenThousandQuestions';
import { 
  Terminal, 
  Search, 
  Cpu, 
  BookOpen, 
  Sparkles, 
  HelpCircle, 
  CheckCircle2, 
  XOctagon, 
  Zap, 
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MainframeExplorerProps {
  profile: UserProfile;
  onGainXP: (xp: number) => void;
}

export default function MainframeExplorer({ profile, onGainXP }: MainframeExplorerProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchIndexStr, setSearchIndexStr] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [selectedStars, setSelectedStars] = useState<number | 'all'>('all');
  const [chunkQuestions, setChunkQuestions] = useState<Question[]>([]);

  // Practice state
  const [activePracticeQ, setActivePracticeQ] = useState<Question | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'ok' | 'fail'; text: string } | null>(null);

  // Audio synthesis for sci-fi atmosphere
  const playSciFiBeep = (freq: number, duration: number = 0.08, type: 'sine' | 'triangle' | 'sawtooth' | 'square' = 'sine') => {
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
      // Ignored if sound is restricted
    }
  };

  // Generate questions for this chunk/filter set
  useEffect(() => {
    // Generate page chunk
    const baseList = getTenThousandQuestionsChunk(currentPage, profile.studentClass);
    
    // Filter client side based on selection
    const filtered = baseList.filter(q => {
      const topicMatches = selectedTopic === 'all' || q.topic === selectedTopic;
      const starsMatches = selectedStars === 'all' || q.stars === selectedStars;
      return topicMatches && starsMatches;
    });

    setChunkQuestions(filtered);
  }, [currentPage, selectedTopic, selectedStars, profile.studentClass]);

  // Command access to search a specific index directly (1 to 10000)
  const handleIndexSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const idx = parseInt(searchIndexStr);
    if (isNaN(idx) || idx < 1 || idx > 10000) {
      playSciFiBeep(180, 0.25, 'sawtooth');
      alert('Vui lòng nhập mã chỉ mục mạng lưới từ 1 tới 10,000!');
      return;
    }
    
    playSciFiBeep(750, 0.12, 'triangle');
    const targetQ = getTenThousandQuestion(idx, profile.studentClass);
    // Open directly in practice modal
    launchPracticeModal(targetQ);
  };

  const launchPracticeModal = (q: Question) => {
    playSciFiBeep(520, 0.1, 'sine');
    setActivePracticeQ(q);
    setIsAnswered(false);
    setSelectedLetter(null);
    setFeedbackMsg(null);
  };

  const handleSubmitAnswer = (letter: string) => {
    if (isAnswered || !activePracticeQ) return;
    setIsAnswered(true);
    setSelectedLetter(letter);

    const isCorrect = letter === activePracticeQ.correctAnswer;
    if (isCorrect) {
      playSciFiBeep(880, 0.15, 'triangle');
      // Dynamic XP award scaling with stars * 5
      const xpVal = (activePracticeQ.stars || 3) * 5;
      onGainXP(xpVal);
      setFeedbackMsg({
        type: 'ok',
        text: `Đồng bộ Synapse thành công! Nhận kích thích xung nhịp +${xpVal} EXP.`
      });
    } else {
      playSciFiBeep(220, 0.35, 'sawtooth');
      setFeedbackMsg({
        type: 'fail',
        text: `Tín hiệu phản hồi sai lệch. Đáp án đúng là: ${activePracticeQ.correctAnswer}.`
      });
    }
  };

  const closePracticeModal = () => {
    playSciFiBeep(330, 0.08, 'sine');
    setActivePracticeQ(null);
  };

  const getTopicLabel = (topic: string) => {
    switch (topic) {
      case 'toanhoc': return { text: 'Toán logic', icon: '⚛️', color: 'text-indigo-400 border-indigo-400/20' };
      case 'khoahoc': return { text: 'Vật lý / AI', icon: '🔬', color: 'text-cyan-400 border-cyan-400/20' };
      case 'lichsu': return { text: 'Quân sự h/s', icon: '🕰️', color: 'text-rose-400 border-rose-400/20' };
      case 'cadao': return { text: 'Triết học cổ', icon: '🏮', color: 'text-amber-400 border-amber-400/20' };
      default: return { text: 'Chung', icon: '📡', color: 'text-slate-400 border-slate-700' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Dynamic Title Card */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-950 border-2 border-cyan-400/20 p-6 md:p-8 shadow-[0_0_20px_rgba(6,182,212,0.1)]">
        {/* Abstract futuristic grid wireframe background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.05),transparent_60%)] pointer-events-none" />
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent animate-pulse" />
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </span>
              <p className="text-[10px] tracking-[0.25em] text-cyan-400 font-mono font-black uppercase">
                QUANTUM CORE MAINFRAME
              </p>
            </div>
            <h2 className="text-xl md:text-3xl font-mono text-slate-100 font-extrabold tracking-tight">
              Mã Nguồn 1 Vạn Câu <span className="bg-gradient-to-r from-cyan-400 via-teal-400 to-indigo-400 bg-clip-text text-transparent italic font-serif">(10,000 Questions)</span>
            </h2>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              Truy cập dữ liệu bộ nhớ siêu phẳng gồm đúng <strong className="text-cyan-400 font-mono">10,000 câu hỏi học thuật</strong> được mã hóa phân hạng từ <strong className="text-amber-400">1 đến 5 sao (⭐)</strong>. Sử dụng thiết bị đầu cuối phía dưới để truy xuất nhanh chóng!
            </p>
          </div>

          <form onSubmit={handleIndexSearch} className="w-full md:w-auto shrink-0 flex items-center gap-2">
            <div className="relative flex-1 md:w-56">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cyan-500">
                <Terminal className="w-4 h-4" />
              </span>
              <input
                type="number"
                min="1"
                max="10000"
                placeholder="Nhập mã ID (1-10000)..."
                value={searchIndexStr}
                onChange={(e) => setSearchIndexStr(e.target.value)}
                className="w-full bg-slate-900/85 border-2 border-cyan-500/20 focus:border-cyan-400 rounded-xl py-2 px-3 pl-10 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-cyan-400 text-slate-100 placeholder:text-slate-500"
              />
            </div>
            <button
              type="submit"
              className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono text-[11px] font-black uppercase px-4 py-2.5 rounded-xl transition cursor-pointer flex items-center gap-1 shadow-md shadow-cyan-950/20"
            >
              <Cpu className="w-3.5 h-3.5" /> Truy Xuất
            </button>
          </form>
        </div>
      </div>

      {/* Grid Filter Bar */}
      <div className="bg-slate-950 border border-slate-900 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-400 py-1 uppercase">
            <SlidersHorizontal className="w-4 h-4 text-cyan-500" />
            Lọc tín hiệu:
          </div>
          
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'all', label: 'Tất cả chủ đề', emoji: '🌌' },
              { id: 'toanhoc', label: 'Toán học logic', emoji: '⚛️' },
              { id: 'khoahoc', label: 'Vật lý & AI', emoji: '🔬' },
              { id: 'lichsu', label: 'Quân sự Việt', emoji: '🕰️' },
              { id: 'cadao', label: 'Văn học triết cổ', emoji: '🏮' }
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => { setSelectedTopic(t.id); setCurrentPage(1); playSciFiBeep(600, 0.05); }}
                className={`py-1 px-3 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  selectedTopic === t.id
                    ? 'bg-cyan-500/10 border border-cyan-400/40 text-cyan-400'
                    : 'bg-slate-900/60 border border-slate-800 text-slate-450 hover:text-slate-200'
                }`}
              >
                {t.emoji} {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase font-mono text-slate-550 font-bold">Mức năng lượng sao:</span>
          <div className="flex gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
            {['all', 1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => { setSelectedStars(star as any); setCurrentPage(1); playSciFiBeep(600, 0.05); }}
                className={`h-6 px-2 rounded-md text-[10px] font-mono font-bold transition cursor-pointer ${
                  selectedStars === star
                    ? 'bg-amber-500 text-slate-950 font-black'
                    : 'text-slate-400 hover:text-slate-100'
                }`}
              >
                {star === 'all' ? 'TẤT CẢ' : `${star}★`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Terminal List of Questions */}
      <div className="bg-slate-950 border border-slate-900 rounded-3xl overflow-hidden shadow-2xl">
        <div className="bg-slate-900/50 border-b border-slate-900 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-cyan-400 animate-spin" />
            <span className="text-xs font-mono font-black text-slate-300 tracking-wider uppercase">
              BẢNG MÃ ID TỨ 1 ĐẾN 10,000 (Hiển thị trang {currentPage})
            </span>
          </div>
          <span className="text-[10px] font-mono bg-cyan-950 text-cyan-400 py-1 px-2.5 border border-cyan-900/40 rounded-md">
            MẠNG CHUẨN LỚP: {profile.studentClass.toUpperCase()}
          </span>
        </div>

        {chunkQuestions.length === 0 ? (
          <div className="text-center py-16 px-4 space-y-4">
            <HelpCircle className="w-12 h-12 text-slate-600 mx-auto animate-bounce" />
            <p className="text-xs text-slate-400 font-mono">
              Không tìm thấy tín hiệu câu hỏi phù hợp với bộ lọc trong dải tín hiệu này!
            </p>
            <button
              onClick={() => { setSelectedTopic('all'); setSelectedStars('all'); }}
              className="text-xs text-cyan-400 hover:underline cursor-pointer"
            >
              Cách cài đặt lại bộ lọc
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-900">
            {chunkQuestions.map((q) => {
              const labelInfo = getTopicLabel(q.topic);
              const qIndexStr = q.id.replace('index_based_cyber_q_', '');
              return (
                <div 
                  key={q.id}
                  className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-900/35 transition duration-150"
                >
                  <div className="space-y-2 max-w-2xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-mono font-black bg-cyan-950 text-cyan-400 border border-cyan-900/30 py-0.5 px-2 rounded">
                        #{qIndexStr}
                      </span>
                      <span className={`text-[10px] uppercase font-bold border py-0.5 px-2 rounded-md ${labelInfo.color}`}>
                        {labelInfo.icon} {labelInfo.text}
                      </span>
                      
                      {/* Star icons */}
                      <div className="flex gap-0.5">
                        {Array.from({ length: q.stars || 3 }).map((_, sIdx) => (
                          <span key={sIdx} className="text-xs text-amber-400">★</span>
                        ))}
                      </div>

                      <span className="text-[10px] text-slate-550 font-mono">
                        +{ (q.stars || 3) * 5 } EXP
                      </span>
                    </div>

                    <p className="text-sm font-semibold text-slate-200 leading-normal">
                      {q.questionText}
                    </p>
                  </div>

                  <button
                    onClick={() => launchPracticeModal(q)}
                    className="w-full sm:w-auto text-center font-mono font-black uppercase text-[10px] py-1.5 px-3.5 bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-slate-350 hover:text-cyan-400 rounded-lg transition shrink-0 cursor-pointer"
                  >
                    MÔ PHỎNG 💻
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Floating Matrix Page Controller */}
        <div className="border-t border-slate-900 px-6 py-4 flex items-center justify-between bg-slate-900/20">
          <button
            disabled={currentPage <= 1}
            onClick={() => { setCurrentPage(prev => Math.max(1, prev - 1)); playSciFiBeep(450, 0.08); }}
            className={`py-1.5 px-3 text-xs font-mono font-black border rounded-lg transition flex items-center gap-1 cursor-pointer ${
              currentPage <= 1 
                ? 'opacity-30 border-slate-850 text-slate-650 cursor-not-allowed'
                : 'border-slate-800 text-slate-400 hover:text-cyan-400 hover:border-cyan-900'
            }`}
          >
            <ChevronLeft className="w-4 h-4" /> TRƯỚC
          </button>

          <span className="text-xs font-mono text-slate-400">
            DẢI PHÂN HOÁ: <strong className="text-slate-100">{(currentPage - 1) * 15 + 1} - {Math.min(10000, currentPage * 15)}</strong> TRÊN CORES <strong className="text-cyan-450 text-cyan-400">10,000</strong>
          </span>

          <button
            disabled={currentPage >= 667} // 10000 / 15 = 666.6
            onClick={() => { setCurrentPage(prev => prev + 1); playSciFiBeep(550, 0.08); }}
            className="py-1.5 px-3 text-xs font-mono font-black border border-slate-800 text-slate-400 hover:text-cyan-400 hover:border-cyan-900 rounded-lg transition flex items-center gap-1 cursor-pointer"
          >
            TIẾP <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Holographic Practice Sandbox Modal */}
      <AnimatePresence>
        {activePracticeQ && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-950 border-2 border-cyan-400/40 rounded-3xl w-full max-w-xl shadow-[0_0_40px_rgba(6,182,212,0.15)] relative overflow-hidden"
            >
              {/* Top status bar */}
              <div className="bg-slate-900/60 border-b border-cyan-400/10 px-6 py-4 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="text-cyan-400 animate-pulse text-xs font-mono font-black uppercase tracking-widest">
                    🌌 NEURAL SIMULATOR
                  </div>
                  <span className="text-[10px] bg-cyan-950 text-cyan-400 py-0.5 px-2 rounded border border-cyan-700/20 font-mono">
                    ID: #{activePracticeQ.id.replace('index_based_cyber_q_', '')}
                  </span>
                </div>
                <button
                  onClick={closePracticeModal}
                  className="p-1 rounded-lg text-slate-500 hover:text-slate-200 transition cursor-pointer bg-slate-950 border border-slate-900"
                >
                  <ChevronLeft className="w-4 h-4 inline" /> Đóng
                </button>
              </div>

              {/* Arena Body */}
              <div className="p-6 sm:p-8 space-y-6">
                <div className="space-y-4">
                  {/* Star indicators inside simulator */}
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex gap-1">
                      {Array.from({ length: activePracticeQ.stars || 3 }).map((_, sIdx) => (
                        <span key={sIdx} className="text-sm text-amber-400">★</span>
                      ))}
                    </div>
                    <span className="font-mono text-cyan-400 tracking-wider text-[10px]">
                      {activePracticeQ.stars || 3}★ • LƯỢT LUYỆN TẬP
                    </span>
                  </div>

                  <h4 className="text-base sm:text-lg font-bold text-slate-100 text-center leading-relaxed">
                    {activePracticeQ.questionText}
                  </h4>
                </div>

                {/* Multiple choice selections */}
                {activePracticeQ.options && activePracticeQ.options.length > 0 && (
                  <div className="grid gap-3">
                    {activePracticeQ.options.map((opt, oIdx) => {
                      const letter = oIdx === 0 ? 'A' : oIdx === 1 ? 'B' : oIdx === 2 ? 'C' : 'D';
                      const isSelected = selectedLetter === letter;
                      const isCorrectAnswer = letter === activePracticeQ.correctAnswer;
                      const cleanOpt = opt.replace(/^[A-D]\.\s*/, '');

                      let borderClass = 'border-slate-850 hover:border-cyan-500/40 bg-slate-900/30';
                      let letterClass = 'bg-slate-950 text-slate-400 border-slate-800';

                      if (isAnswered) {
                        if (isCorrectAnswer) {
                          borderClass = 'border-emerald-500 bg-emerald-500/10 text-emerald-350';
                          letterClass = 'bg-emerald-500 border-emerald-400 text-slate-950 font-black';
                        } else if (isSelected) {
                          borderClass = 'border-rose-500 bg-rose-500/10 text-rose-350';
                          letterClass = 'bg-rose-500 border-rose-450 text-slate-950 font-black';
                        } else {
                          borderClass = 'border-slate-900 opacity-40 bg-transparent';
                        }
                      }

                      return (
                        <button
                          key={oIdx}
                          disabled={isAnswered}
                          onClick={() => handleSubmitAnswer(letter)}
                          className={`w-full text-left p-3 border rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-3 transition cursor-pointer outline-none ${borderClass}`}
                        >
                          <span className={`w-7 h-7 rounded border flex items-center justify-center font-black ${letterClass}`}>
                            {letter}
                          </span>
                          <span className="flex-1">{cleanOpt}</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Explanation feedback */}
                <AnimatePresence>
                  {isAnswered && (
                    <motion.div
                      initial={{ scale: 0.98, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="border-t border-slate-900 pt-5 space-y-4"
                    >
                      {feedbackMsg && (
                        <div className={`p-3.5 border rounded-2xl flex items-start gap-2.5 text-xs font-semibold ${
                          feedbackMsg.type === 'ok' 
                            ? 'bg-emerald-950/20 border-emerald-500/35 text-emerald-400' 
                            : 'bg-rose-950/20 border-rose-500/35 text-rose-400'
                        }`}>
                          {feedbackMsg.type === 'ok' ? (
                            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
                          ) : (
                            <XOctagon className="w-5 h-5 shrink-0 text-rose-400" />
                          )}
                          <p>{feedbackMsg.text}</p>
                        </div>
                      )}

                      <div className="bg-slate-900/65 border border-slate-900 p-4 rounded-2xl">
                        <div className="flex items-center gap-1.5 text-[10px] text-amber-400 font-mono font-black tracking-widest uppercase mb-1">
                          <Zap className="w-3.5 h-3.5" /> Giải thích thuật toán
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                          {activePracticeQ.explanation}
                        </p>
                      </div>

                      <div className="flex justify-end pt-1">
                        <button
                          onClick={closePracticeModal}
                          className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono text-[11px] font-black uppercase px-6 py-2 rounded-xl transition cursor-pointer"
                        >
                          TIẾP TỤC KHẢO SÁT
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
