import React, { useState } from 'react';
import { Question } from '../types';
import { PlusCircle, FileText, CheckCircle, Trash2, BookOpen, Layers } from 'lucide-react';

interface CustomQuizCreatorProps {
  customQuestions: Question[];
  onAddQuestion: (question: Question) => void;
  onDeleteQuestion: (id: string) => void;
  onStartCustomQuiz: () => void;
}

export function CustomQuizCreator({ 
  customQuestions, 
  onAddQuestion, 
  onDeleteQuestion, 
  onStartCustomQuiz 
}: CustomQuizCreatorProps) {
  // Form states
  const [topic, setTopic] = useState<'cadao' | 'toanhoc' | 'lichsu' | 'khoahoc'>('cadao');
  const [type, setType] = useState<'multiple-choice' | 'short-answer'>('multiple-choice');
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState<string[]>(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState('A');
  const [explanation, setExplanation] = useState('');
  const [difficulty, setDifficulty] = useState<'de' | 'trung-binh' | 'kho' | 'thach-thuc'>('de');
  
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleOptionChange = (index: number, val: string) => {
    const updated = [...options];
    updated[index] = val;
    setOptions(updated);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!questionText.trim()) {
      setErrorMsg('Vui lòng nhập nội dung câu hỏi!');
      return;
    }

    if (type === 'multiple-choice') {
      const emptyOption = options.some(opt => !opt.trim());
      if (emptyOption) {
        setErrorMsg('Vui lòng nhập đầy đủ nội dung cho cả 4 lựa chọn A, B, C, D!');
        return;
      }
      if (!['A', 'B', 'C', 'D'].includes(correctAnswer)) {
        setErrorMsg('Lựa chọn đáp án đúng phải là A, B, C hoặc D!');
        return;
      }
    } else {
      if (!correctAnswer.trim()) {
        setErrorMsg('Vui lòng nhập từ khóa đáp án ngắn chính xác!');
        return;
      }
    }

    const nQuestion: Question = {
      id: `custom_${Date.now()}`,
      topic,
      type,
      questionText: questionText.trim(),
      options: type === 'multiple-choice' ? options.map(o => o.trim()) : [],
      correctAnswer: type === 'multiple-choice' ? correctAnswer : correctAnswer.trim(),
      explanation: explanation.trim() || 'Giải thích chi tiết do người tạo lập biên soạn.',
      difficulty
    };

    onAddQuestion(nQuestion);
    setSuccessMsg('Thêm câu hỏi tự tạo thành công!');
    
    // Reset form fields
    setQuestionText('');
    setOptions(['', '', '', '']);
    setCorrectAnswer(type === 'multiple-choice' ? 'A' : '');
    setExplanation('');
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Quiz builder form */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
        <div className="pb-3 border-b border-slate-800">
          <h3 className="font-serif font-bold text-slate-100 text-lg flex items-center gap-2 italic">
            <PlusCircle className="w-5 h-5 text-amber-500 drop-shadow-[0_0_6px_rgba(245,158,11,0.5)]" />
            Biên soạn câu hỏi cá nhân
          </h3>
          <p className="text-xs text-slate-400">Tự tạo giáo phẩm học thuật tùy biến để ôn tập hoặc đố bạn bè!</p>
        </div>

        <form onSubmit={handleFormSubmit} className="space-y-4 text-sm">
          {errorMsg && (
            <div className="p-3 text-xs bg-rose-950/40 text-rose-400 rounded-xl border border-rose-800/50">
              ⚠️ {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="p-3 text-xs bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/25">
              ✨ {successMsg}
            </div>
          )}

          {/* Module or Topic row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Chủ đề (Mô-đun)</label>
              <select 
                value={topic} 
                onChange={(e) => setTopic(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-amber-500 font-medium"
              >
                <option value="cadao">Ca dao Tục ngữ VN</option>
                <option value="toanhoc">Toán học</option>
                <option value="lichsu">Lịch sử Việt Nam</option>
                <option value="khoahoc">Khoa học Tự nhiên</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Độ khó đề ra</label>
              <select 
                value={difficulty} 
                onChange={(e) => setDifficulty(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-amber-500 font-medium"
              >
                <option value="de">Dễ (Học sinh trung bình)</option>
                <option value="trung-binh">Trung bình (Học sinh khá)</option>
                <option value="kho">Khó (Học sinh giỏi)</option>
                <option value="thach-thuc">Thách thức cực đại</option>
              </select>
            </div>
          </div>

          {/* Type picker */}
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1.5">Hình thức kiểm tra</label>
            <div className="grid grid-cols-2 gap-2 text-center">
              <button
                type="button"
                onClick={() => { setType('multiple-choice'); setCorrectAnswer('A'); }}
                className={`py-2 px-3.5 rounded-xl text-xs font-bold border transition-all ${
                  type === 'multiple-choice' 
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 border-amber-500 text-slate-950 shadow-[0_0_10px_rgba(245,158,11,0.25)]' 
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                Trắc nghiệm (4 lựa chọn)
              </button>
              <button
                type="button"
                onClick={() => { setType('short-answer'); setCorrectAnswer(''); }}
                className={`py-2 px-3.5 rounded-xl text-xs font-bold border transition-all ${
                  type === 'short-answer' 
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 border-amber-500 text-slate-950 shadow-[0_0_10px_rgba(245,158,11,0.25)]' 
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                Trả lời ngắn (Tự luận)
              </button>
            </div>
          </div>

          {/* Question Text */}
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">Câu hỏi kiểm tra</label>
            <textarea
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="Ví dụ: Rút gọn biểu thức (x-1)^2 - x^2 bằng bao nhiêu?"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 h-20 focus:outline-none focus:border-amber-500 font-sans"
            />
          </div>

          {/* Multiple choice controls or short answer inputs */}
          {type === 'multiple-choice' ? (
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-400">Nội dung 4 đáp án:</label>
              <div className="grid gap-2">
                {['A', 'B', 'C', 'D'].map((letter, idx) => (
                  <div key={letter} className="flex items-center gap-2">
                    <span className="w-6 h-6 text-xs flex items-center justify-center font-bold bg-slate-800 text-slate-300 rounded-full">{letter}</span>
                    <input
                      type="text"
                      value={options[idx]}
                      onChange={(e) => handleOptionChange(idx, e.target.value)}
                      placeholder={`Lựa chọn đápân ${letter}...`}
                      className="flex-1 bg-slate-950 border border-slate-800/80 rounded-lg py-1.5 px-3 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                ))}
              </div>

              {/* Select Correct letter */}
              <div className="mt-3">
                <label className="block text-xs font-bold text-slate-400 mb-1">Đáp án đúng chính xác là</label>
                <div className="flex gap-2">
                  {['A', 'B', 'C', 'D'].map(l => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => setCorrectAnswer(l)}
                      className={`w-10 h-10 rounded-xl font-bold border transition ${
                        correctAnswer === l 
                          ? 'bg-amber-500/10 border-amber-500 text-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.2)]' 
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Đáp án từ khóa chuẩn xác</label>
              <input
                type="text"
                value={correctAnswer}
                onChange={(e) => setCorrectAnswer(e.target.value)}
                placeholder="Nhập trực tiếp giá trị (Ví dụ: 12 hoặc Lý Công Uẩn)"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-amber-500 font-medium"
              />
              <p className="text-[10px] text-slate-500 mt-1">Lưu ý: Hệ thống so khớp động không phân biệt dấu và chữ hoa chữ thường.</p>
            </div>
          )}

          {/* Explanation */}
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">Lời giải thích sâu sắc (Không bắt buộc)</label>
            <textarea
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder="Diễn giải từng bước chứng minh hoặc sự thật của câu hỏi..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 h-16 text-slate-200 focus:outline-none focus:border-amber-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold py-2.5 px-4 rounded-xl shadow-[0_0_15px_rgba(245,158,11,0.2)] transition duration-200 text-xs font-bold uppercase tracking-wider cursor-pointer"
          >
            ➕ Lưu trữ Câu hỏi mới
          </button>
        </form>
      </div>

      {/* List of custom questions */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col justify-between space-y-4">
        <div className="space-y-4 animate-fade-in">
          <div className="pb-3 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="font-serif font-bold text-slate-100 text-lg flex items-center gap-2 italic">
                <FileText className="w-5 h-5 text-amber-500" />
                Kho lưu trữ cá nhân ({customQuestions.length})
              </h3>
              <p className="text-xs text-slate-400 font-sans">Danh sách các câu hỏi do bạn chủ biên.</p>
            </div>
            
            {customQuestions.length >= 3 && (
              <button
                type="button"
                onClick={onStartCustomQuiz}
                className="bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold py-1.5 px-3 rounded-lg text-xs transition duration-200 shadow-md flex items-center gap-1.5"
              >
                🎮 Bắt đầu làm bài
              </button>
            )}
          </div>

          {customQuestions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center text-slate-550 text-slate-500 select-none">
              <Layers className="w-14 h-14 mb-3 text-slate-800" />
              <p className="font-medium text-slate-450 font-serif italic text-sm">Chưa có câu hỏi tự biên soạn nào!</p>
              <p className="text-xs text-slate-500 max-w-sm mt-1 leading-normal">
                Biên soạn ít nhất 3 câu hỏi ở bảng bên trái để mở khóa nút tổ chức thi thử cá nhân nhé!
              </p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
              {customQuestions.map((q, idx) => (
                <div key={q.id} className="p-3 bg-slate-800/30 rounded-xl border border-slate-800/80 flex items-start justify-between gap-3 hover:border-slate-700 transition">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] bg-slate-800 text-slate-300 font-mono font-bold px-1.5 py-0.5 rounded">
                        Câu {idx + 1}
                      </span>
                      <span className="text-[10px] bg-amber-500/10 text-amber-400 font-bold px-1.5 py-0.5 rounded border border-amber-500/20">
                        {q.topic === 'cadao' ? 'Ca dao' : q.topic === 'toanhoc' ? 'Toán' : q.topic === 'lichsu' ? 'Lịch sử' : 'Khoa học'}
                      </span>
                      <span className="text-[10px] bg-slate-800/80 text-slate-450 text-slate-400 font-medium px-1.5 py-0.5 rounded border border-slate-700/50">
                        {q.difficulty === 'de' ? 'Dễ' : q.difficulty === 'trung-binh' ? 'T.Bình' : 'Khó'}
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-slate-200 mt-1.5 leading-normal line-clamp-2">{q.questionText}</p>
                    <p className="text-[10px] text-amber-400 font-bold mt-1">Đáp án chính: {q.correctAnswer}</p>
                  </div>

                  <button
                    onClick={() => onDeleteQuestion(q.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition shrink-0"
                    title="Xóa câu hỏi"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {customQuestions.length > 0 && customQuestions.length < 3 && (
          <div className="bg-amber-500/10 p-3 rounded-xl border border-amber-500/20 text-[11px] text-amber-300">
            🔔 Vui lòng biên soạn thêm ít nhất <strong>{3 - customQuestions.length}</strong> bài tập để tổ chức đề thi thử.
          </div>
        )}
      </div>
    </div>
  );
}

