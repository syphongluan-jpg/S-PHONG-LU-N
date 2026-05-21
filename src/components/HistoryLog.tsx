import React from 'react';
import { HistoryRecord } from '../types';
import { Calendar, Award, Clock, BookOpen, AlertCircle } from 'lucide-react';

interface HistoryLogProps {
  records: HistoryRecord[];
}

export function HistoryLog({ records }: HistoryLogProps) {
  if (records.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-slate-800 rounded-3xl bg-slate-900/10 p-6">
        <AlertCircle id="hist_empty_icon" className="w-12 h-12 text-slate-650 text-slate-500 mb-3" />
        <p className="text-slate-300 font-medium font-serif italic text-base">Chưa ghi nhận kết quả học tập nào</p>
        <p className="text-slate-500 text-xs mt-1">Hãy tham gia các chế độ chơi để tích lũy lịch sử học tập nhé!</p>
      </div>
    );
  }

  const getTopicDisplayName = (topic: string) => {
    switch (topic) {
      case 'cadao': return 'Ca dao Tục ngữ VN';
      case 'toanhoc': return 'Toán học THCS';
      case 'lichsu': return 'Lịch sử Việt Nam';
      case 'khoahoc': return 'Khoa học Tự nhiên';
      case 'custom': return 'Tự tạo / Tùy chỉnh';
      case 'pvp': return 'Đấu trường Tri thức PvP';
      default: return topic;
    }
  };

  const getModeColor = (mode: string) => {
    switch (mode) {
      case 'pvp': return 'bg-purple-500/10 text-purple-300 border-purple-500/20';
      case 'practice': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'custom': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      default: return 'bg-sky-500/10 text-sky-400 border-sky-500/20';
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins} phút ${secs} giây` : `${secs} giây`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <h3 className="font-serif font-bold text-slate-100 flex items-center gap-2 italic text-base sm:text-lg">
          <BookOpen className="w-5 h-5 text-amber-500" />
          Tiến trình Chi tiết ({records.length} lượt học)
        </h3>
        <span className="text-xs text-slate-500 font-mono">Cập nhật tự động</span>
      </div>

      <div className="grid gap-3 max-h-[420px] overflow-y-auto pr-1">
        {records.slice().reverse().map((record) => (
          <div 
            key={record.id} 
            className="p-4 rounded-xl border border-slate-800 bg-slate-900/30 hover:border-slate-700 hover:bg-slate-900/60 transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold border ${getModeColor(record.mode)}`}>
                  {record.mode.toUpperCase()}
                </span>
                <span className="text-sm font-semibold text-slate-200">
                  {getTopicDisplayName(record.topicName)}
                </span>
              </div>
              
              <div className="flex items-center gap-4 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  {new Date(record.timestamp).toLocaleString('vi-VN')}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  {formatDuration(record.durationSeconds)}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800/40">
              <div className="text-left sm:text-right">
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Điểm số</p>
                <p className="text-sm font-bold text-slate-200">
                  {record.score} <span className="text-xs text-slate-500 font-normal">/ {record.totalQuestions}</span>
                </p>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold block text-left sm:text-right">Danh hiệu</span>
                <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg mt-0.5 ${
                  record.titleEarned.includes('Đa Tài') || record.titleEarned.includes('Học Đế') || record.titleEarned.includes('Học Giả') || record.titleEarned.includes('Nhà Vô Địch')
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/25 font-serif italic'
                    : 'bg-slate-800 text-slate-400 border border-slate-700/60'
                }`}>
                  <Award className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  {record.titleEarned}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

