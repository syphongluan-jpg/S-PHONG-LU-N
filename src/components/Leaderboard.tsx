import React from 'react';
import { LeaderboardItem, UserProfile } from '../types';
import { BADGES } from './Badges';
import { Trophy, ShieldCheck, HelpCircle, GraduationCap, Flame, Award } from 'lucide-react';

interface LeaderboardProps {
  userProfile: UserProfile;
  competitors: LeaderboardItem[];
}

export function Leaderboard({ userProfile, competitors }: LeaderboardProps) {
  // Combine user with competitors
  const allStandings: LeaderboardItem[] = [
    {
      id: 'current_user',
      username: userProfile.username,
      studentClass: userProfile.studentClass,
      level: userProfile.level,
      xp: userProfile.xp,
      title: userProfile.title || 'Học Sinh',
      isBot: false,
      avatar: userProfile.avatar,
    },
    ...competitors,
  ].sort((a, b) => b.xp - a.xp);

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {/* Competitors Leaderboard */}
      <div className="md:col-span-2 bg-slate-900/40 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-500 font-bold drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
            <h3 className="font-serif font-bold text-slate-100 text-lg sm:text-xl italic">Bảng Vàng Trạng Nguyên</h3>
          </div>
          <span className="text-xs bg-amber-500/10 text-amber-400 font-semibold px-2.5 py-1 rounded-full border border-amber-500/20">
            Tổng hợp Học sinh toàn bang
          </span>
        </div>

        <div className="space-y-2.5">
          {allStandings.map((item, index) => {
            const isSelf = item.id === 'current_user';
            const rank = index + 1;
            
            return (
              <div 
                key={item.id}
                className={`p-3.5 rounded-xl border flex items-center justify-between transition-all duration-200 ${
                  isSelf 
                    ? 'bg-slate-900/90 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.25)] ring-1 ring-amber-500/50' 
                    : 'bg-slate-800/30 border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Rank Numbers */}
                  <div className="w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm shrink-0">
                    {rank === 1 ? (
                      <span className="text-2xl filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">🥇</span>
                    ) : rank === 2 ? (
                      <span className="text-2xl filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">🥈</span>
                    ) : rank === 3 ? (
                      <span className="text-2xl filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">🥉</span>
                    ) : (
                      <span className="text-slate-500 font-mono">#{rank}</span>
                    )}
                  </div>

                  {/* Avatar Container */}
                  <div className="w-10 h-10 rounded-xl bg-slate-950 flex items-center justify-center border border-slate-800 text-lg shrink-0 overflow-hidden font-bold select-none shadow-inner">
                    {item.avatar && item.avatar.startsWith('data:') ? (
                      <img src={item.avatar} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <span>{item.avatar || '👨‍🎓'}</span>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`font-semibold ${isSelf ? 'text-amber-400 font-bold font-serif italic text-base' : 'text-slate-100'}`}>
                        {item.username}
                      </span>
                      {isSelf && (
                        <span className="text-[9px] bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black px-2 py-0.5 rounded-full shadow-sm animate-pulse">
                          BẠN
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span>Lớp: {item.studentClass}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                      <span className="text-amber-500 font-semibold font-mono">Cấp {item.level}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-sm font-black text-slate-200 font-mono">{item.xp.toLocaleString()} XP</p>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded inline-block mt-0.5 ${
                    item.title?.includes('Học Đế') 
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/35 font-serif italic' 
                      : item.title?.includes('Học Giả')
                      ? 'bg-teal-500/20 text-teal-300 border border-teal-500/35 font-serif italic'
                      : item.title?.includes('Đa Tài')
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/35'
                      : 'bg-slate-800 text-slate-400 border border-slate-700/60'
                  }`}>
                    🎓 {item.title || 'Học Sinh'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Badges / Achievements panel */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
        <div className="pb-3 border-b border-slate-800">
          <h3 className="font-serif font-bold text-slate-100 text-lg flex items-center gap-2 italic">
            <Award className="w-5 h-5 text-amber-500 drop-shadow-[0_0_6px_rgba(245,158,11,0.5)]" />
            Hệ thống Huy hiệu
          </h3>
          <p className="text-xs text-slate-450 text-slate-400">Hoàn thành thách thức toàn năng để tích lũy huân chương!</p>
        </div>

        <div className="grid gap-3 max-h-[450px] overflow-y-auto pr-1">
          {BADGES.map((badge) => {
            // Check if player has unlocked this badge
            const isUnlocked = userProfile.unlockedBadges.includes(badge.id);
            
            return (
              <div 
                key={badge.id}
                className={`p-3 rounded-xl border flex items-start gap-3 transition-all duration-200 ${
                  isUnlocked 
                    ? `bg-slate-800/40 border-amber-500/30 shadow-[0_0_8px_rgba(245,158,11,0.05)] opacity-100` 
                    : 'bg-slate-900/20 border-slate-800/40 opacity-40 hover:opacity-50'
                }`}
              >
                <div className={`w-10 h-10 shrink-0 text-2xl flex items-center justify-center rounded-xl border shadow-sm ${
                  isUnlocked 
                    ? 'bg-slate-800 border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.15)]' 
                    : 'bg-slate-900 border-slate-800 text-slate-600 filter grayscale'
                }`}>
                  {badge.icon}
                </div>

                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <h4 className={`text-sm font-bold ${isUnlocked ? 'text-amber-300 font-serif' : 'text-slate-500 line-through'}`}>
                      {badge.name}
                    </h4>
                    {isUnlocked ? (
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    ) : (
                      <HelpCircle className="w-3.5 h-3.5 text-slate-650 text-slate-500 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-slate-400 leading-tight">
                    {badge.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

