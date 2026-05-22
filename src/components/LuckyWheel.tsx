import React, { useState, useRef, useEffect } from 'react';
import { UserProfile } from '../types';
import { 
  Sparkles, 
  RotateCw, 
  Volume2, 
  VolumeX,
  X,
  Ticket
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { soundManager } from '../utils/ambientMusic';

interface LuckyWheelProps {
  profile: UserProfile;
  onUpdateProfile: (updatedProfile: UserProfile) => void;
  onClose?: () => void;
}

// 6 segments mapped to stellar premium gradients
const WHEEL_SECTIONS = [
  { id: 1, name: '+1 Lượt Quay 🎲', fillUrl: 'url(#cyan-grad)', textColor: '#083344', prize: 'extra_spin' },
  { id: 2, name: 'VÉ VIP X2 🎟️', fillUrl: 'url(#gold-grad-1)', textColor: '#451a03', prize: 'vip_2' },
  { id: 3, name: 'Hụt mất rồi ✨', fillUrl: 'url(#obsidian-grad-2)', textColor: '#e2e8f0', prize: 'none' },
  { id: 4, name: 'Cố lên nhé 💫', fillUrl: 'url(#obsidian-grad-3)', textColor: '#e2e8f0', prize: 'none' },
  { id: 5, name: 'VÉ VIP X1 🎟️', fillUrl: 'url(#gold-grad-2)', textColor: '#451a03', prize: 'vip_1' },
  { id: 6, name: 'Gần trúng rồi 🌠', fillUrl: 'url(#obsidian-grad-1)', textColor: '#e2e8f0', prize: 'none' }
];

export function LuckyWheel({ profile, onUpdateProfile, onClose }: LuckyWheelProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [spinsLeft, setSpinsLeft] = useState(3);
  const [prizeResult, setPrizeResult] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  
  const wheelRef = useRef<HTMLDivElement | null>(null);

  // Initialize daily spins
  useEffect(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    
    // Check if the user hasn't initialized spinning fields or has advanced calendar date
    if (profile.lastSpinTimestamp !== todayStr) {
      const updatedProfile = {
        ...profile,
        spinsLeftToday: 3,
        lastSpinTimestamp: todayStr
      };
      setSpinsLeft(3);
      onUpdateProfile(updatedProfile);
    } else {
      setSpinsLeft(profile.spinsLeftToday ?? 3);
    }
  }, [profile.lastSpinTimestamp]);

  const playSynthesizedSound = (type: 'tick' | 'victory' | 'fail') => {
    if (isMuted) return;
    try {
      if (type === 'tick') {
        soundManager.playTick(450);
      } else if (type === 'victory') {
        soundManager.playLevelUp();
      } else if (type === 'fail') {
        soundManager.playIncorrect();
      }
    } catch (e) {
      console.warn("Lỗi web audio:", e);
    }
  };

  const handleSpinClick = () => {
    if (isSpinning || spinsLeft <= 0) return;

    setIsSpinning(true);
    setPrizeResult(null);

    // Randomize the lucky section to stop at
    const stopIndex = Math.floor(Math.random() * 6); // 0 to 5
    const selectedPrize = WHEEL_SECTIONS[stopIndex];

    // Slices are 60 deg each. Slice 0 is [0, 60], Slice 1 is [60, 120]...
    // To land slice i in the top center, we rotate by 360 - (i * 60 + 30) degrees
    // To ensure continuous forwards rotation, we offset based on the current rotation
    const sliceAngle = 60;
    const centerOffset = 30;
    const currentBase = Math.ceil(rotation / 360) * 360 + 360 * 8; // 8 full spins for premium momentum
    const stopAngle = (360 - (stopIndex * sliceAngle + centerOffset)) % 360;
    const targetRotation = currentBase + stopAngle;

    setRotation(targetRotation);

    // Simulate satisfying sector ticking sound effects
    let lastTickAngle = 0;
    const tickInterval = setInterval(() => {
      if (!wheelRef.current) return;
      const st = window.getComputedStyle(wheelRef.current);
      const tr = st.getPropertyValue("transform");
      if (tr && tr !== "none") {
        const values = tr.split('(')[1].split(')')[0].split(',');
        const a = parseFloat(values[0]);
        const b = parseFloat(values[1]);
        let angle = Math.round(Math.atan2(b, a) * (180 / Math.PI));
        if (angle < 0) angle += 360;
        
        let diff = Math.abs(angle - lastTickAngle);
        if (diff > 180) diff = 360 - diff;
        
        if (diff >= 30) {
          playSynthesizedSound('tick');
          lastTickAngle = angle;
        }
      }
    }, 60);

    setTimeout(() => {
      clearInterval(tickInterval);
      setIsSpinning(false);
      
      let ticketsWon = 0;
      let extraSpinsWon = 0;
      if (selectedPrize.prize === 'vip_2') {
        ticketsWon = 2;
      } else if (selectedPrize.prize === 'vip_1') {
        ticketsWon = 1;
      } else if (selectedPrize.prize === 'extra_spin') {
        extraSpinsWon = 1;
      }

      const newSpins = spinsLeft - 1 + extraSpinsWon;
      setSpinsLeft(newSpins);

      const activeClaims = (profile.vipTickets ?? 0) + ticketsWon;
      const todayStr = new Date().toISOString().split('T')[0];

      const updatedProfile = {
        ...profile,
        vipTickets: activeClaims,
        spinsLeftToday: newSpins,
        lastSpinTimestamp: todayStr
      };

      onUpdateProfile(updatedProfile);

      if (ticketsWon > 0) {
        setPrizeResult(`🌟 Tuyệt vời! Bạn trúng được ${ticketsWon} Vé VIP hằng ngày! 🎉`);
        playSynthesizedSound('victory');
      } else if (extraSpinsWon > 0) {
        setPrizeResult(`🎲 Cực đỉnh! Bạn được thêm +1 Lượt quay miễn phí! ✨`);
        playSynthesizedSound('victory');
      } else {
        setPrizeResult('🥲 Tiếc quá! Chúc bạn may mắn ở vòng quay kế tiếp nhé!');
        playSynthesizedSound('fail');
      }
    }, 4500); // 4.5s timing
  };

  return (
    <div className="bg-slate-950/85 backdrop-blur-md border border-slate-800/75 p-6 sm:p-8 rounded-3xl max-w-lg mx-auto space-y-6 relative overflow-hidden shadow-[0_30px_70px_rgba(0,0,0,0.73)] select-none">
      
      {/* Decorative ambient background glows */}
      <div className="absolute -top-16 -left-16 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -right-16 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Banner */}
      <div className="flex justify-between items-center pb-3 border-b border-slate-800/60 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-xl bg-gradient-to-tr from-amber-500/20 to-yellow-500/20 border border-amber-500/30">
            <Sparkles className="text-amber-400 w-4.5 h-4.5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xs font-mono font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-200 uppercase tracking-wider leading-none">
              VÒNG QUAY NHÂN PHẨM
            </h3>
            <span className="text-[10px] text-slate-400 font-medium">Tìm kiếm đặc quyền VIP hằng ngày</span>
          </div>
        </div>
        
        {onClose && (
          <button
            type="button"
            onClick={() => {
              onClose();
              soundManager.playClick();
            }}
            className="p-1.5 hover:bg-slate-900 rounded-xl text-slate-400 hover:text-slate-200 transition-all border border-transparent hover:border-slate-800/80 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Credit Status Board */}
      <div className="grid grid-cols-2 gap-3 bg-slate-950/60 border border-slate-800/80 p-3 rounded-2xl relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-base shadow-[inset_0_0_8px_rgba(245,158,11,0.05)]">
            🎟️
          </div>
          <div>
            <p className="text-[8px] uppercase tracking-wider font-bold text-slate-500 font-mono">Vé VIP Có</p>
            <p className="text-base font-mono font-black text-amber-400 leading-none">
              {profile.vipTickets ?? 0}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 border-l border-slate-800/60 pl-2.5">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-base shadow-[inset_0_0_8px_rgba(6,182,212,0.05)]">
            🎲
          </div>
          <div>
            <p className="text-[8px] uppercase tracking-wider font-bold text-slate-500 font-mono">Lượt Quay</p>
            <p className="text-base font-mono font-black text-cyan-400 leading-none">
              {spinsLeft} <span className="text-[10px] text-slate-600">/ 3</span>
            </p>
          </div>
        </div>
      </div>

      {/* Visual Canvas Wheel */}
      <div className="flex flex-col items-center relative py-5 relative z-10">
        
        {/* Real-time Blinking pointer arrow facet */}
        <div className="absolute top-1 z-30 flex flex-col items-center select-none pointer-events-none">
          <div className="w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[24px] border-t-rose-500 drop-shadow-[0_4px_10px_rgba(244,63,94,0.6)]" />
          <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[16px] border-t-rose-300 -mt-[22px] z-31" />
        </div>

        {/* Outer glowing border ring with blink light effects */}
        <div className="relative w-80 h-80 sm:w-96 sm:h-96 rounded-full border-[6px] border-slate-900 bg-slate-950 flex items-center justify-center p-1.5 shadow-[0_0_50px_rgba(245,158,11,0.25)] select-none transition-transform duration-300 hover:scale-[1.02]">
          
          {/* Neon LED light bulbs overlay */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-20" viewBox="0 0 100 100">
            {Array.from({ length: 12 }).map((_, i) => {
              const angle = (i * 30 - 90) * Math.PI / 180;
              const cx = 50 + 47.6 * Math.cos(angle);
              const cy = 50 + 47.6 * Math.sin(angle);
              
              // Alternating high contrast amber/cyan chasing pattern
              const color = i % 2 === 0 ? '#fbbf24' : '#22d3ee';
              const delay = `${i * 120}ms`;
              
              return (
                <circle
                  key={i}
                  cx={cx}
                  cy={cy}
                  r="1.2"
                  fill={color}
                  className="opacity-90"
                  style={{
                    animation: 'pulse 1.4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                    animationDelay: delay,
                  }}
                />
              );
            })}
          </svg>

          {/* Rotating wheel core */}
          <div
            ref={wheelRef}
            className="w-full h-full rounded-full overflow-hidden relative"
            style={{ 
              transform: `rotate(${rotation}deg)`,
              transition: isSpinning ? 'transform 4.5s cubic-bezier(0.15, 0.85, 0.1, 1)' : 'none'
            }}
          >
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <defs>
                {/* VIP_2 Epic Gold Sheen Gradient */}
                <linearGradient id="gold-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f59e0b" />
                  <stop offset="30%" stopColor="#ffedd5" />
                  <stop offset="70%" stopColor="#d97706" />
                  <stop offset="100%" stopColor="#fbbf24" />
                </linearGradient>

                {/* VIP_1 Standard Gold Gradient */}
                <linearGradient id="gold-grad-2" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#d97706" />
                  <stop offset="50%" stopColor="#ffedd5" />
                  <stop offset="100%" stopColor="#b45309" />
                </linearGradient>

                {/* Cyan Glow Magic +1 Spin Gradient */}
                <linearGradient id="cyan-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#06b6d4" />
                  <stop offset="50%" stopColor="#e0f7fa" />
                  <stop offset="100%" stopColor="#0891b2" />
                </linearGradient>

                {/* Obsidian Space Dark 1 */}
                <linearGradient id="obsidian-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#090D1A" />
                  <stop offset="100%" stopColor="#1E293B" />
                </linearGradient>

                {/* Obsidian Space Dark 2 */}
                <linearGradient id="obsidian-grad-2" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#1E293B" />
                  <stop offset="100%" stopColor="#0B0F19" />
                </linearGradient>

                {/* Obsidian Cosmic Blue 3 */}
                <linearGradient id="obsidian-grad-3" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0f172a" />
                  <stop offset="100%" stopColor="#1E293B" />
                </linearGradient>
                
                {/* High contrast SVG drop shadow filter */}
                <filter id="shadow">
                  <feDropShadow dx="0" dy="0.3" stdDeviation="0.2" floodColor="#000000" floodOpacity="0.95" />
                </filter>
              </defs>

              {WHEEL_SECTIONS.map((sec, idx) => {
                const startAngle = idx * 60;
                const endAngle = (idx + 1) * 60;
                const x1 = 50 + 50 * Math.cos((startAngle - 90) * Math.PI / 180);
                const y1 = 50 + 50 * Math.sin((startAngle - 90) * Math.PI / 180);
                const x2 = 50 + 50 * Math.cos((endAngle - 90) * Math.PI / 180);
                const y2 = 50 + 50 * Math.sin((endAngle - 90) * Math.PI / 180);

                const d = `M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`;
                
                const midAngle = startAngle + 30;
                const textRot = midAngle;

                const isVip = sec.prize.startsWith('vip');
                const isExtra = sec.prize === 'extra_spin';

                return (
                  <g key={idx}>
                    {/* Sector path using modern fill gradients */}
                    <path 
                      d={d} 
                      fill={sec.fillUrl} 
                      stroke="#0F172A" 
                      strokeWidth="0.5" 
                    />
                    
                    {/* Inner gold line highlighting VIP segments */}
                    {isVip && (
                      <path
                        d={`M 50 50 L ${50 + 49 * Math.cos((startAngle - 90) * Math.PI / 180)} ${50 + 49 * Math.sin((startAngle - 90) * Math.PI / 180)} A 49 49 0 0 1 ${50 + 49 * Math.cos((endAngle - 90) * Math.PI / 180)} ${50 + 49 * Math.sin((endAngle - 90) * Math.PI / 180)} Z`}
                        fill="none"
                        stroke="#fef08a"
                        strokeWidth="0.4"
                        opacity="0.35"
                      />
                    )}
                    
                    <g transform={`rotate(${textRot} 50 50)`}>
                      {/* Reward Icons / Emojis */}
                      <text
                        x="50"
                        y="14"
                        textAnchor="middle"
                        fill="#ffffff"
                        fontSize="5.5"
                        fontWeight="950"
                        className="select-none pointer-events-none"
                        filter="url(#shadow)"
                      >
                        {isVip ? '🎟️' : isExtra ? '🎲' : '🍀'}
                      </text>

                      {/* Reward Labels */}
                      <text
                        x="50"
                        y="23.5"
                        textAnchor="middle"
                        fill={sec.textColor}
                        fontSize="3.7"
                        fontWeight="950"
                        fontFamily="system-ui, sans-serif"
                        className="tracking-tight select-none pointer-events-none"
                        filter="url(#shadow)"
                      >
                        {sec.name}
                      </text>
                    </g>
                  </g>
                );
              })}
              
              {/* Central inner circle */}
              <circle cx="50" cy="50" r="5" fill="#0B0F19" stroke="#fbbf24" strokeWidth="0.8" />
            </svg>
          </div>

          {/* Golden 3D Center Diamond Cap */}
          <div className="absolute w-11 h-11 bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 rounded-full border-2 border-slate-900 shadow-[0_4px_15px_rgba(245,158,11,0.5)] flex items-center justify-center z-12 pointer-events-none">
            <span className="text-sm select-none animate-pulse">💎</span>
          </div>

          {/* Luxury glass dome sheen overlay over the top half of the wheel */}
          <div className="absolute inset-0 rounded-full pointer-events-none bg-gradient-to-b from-white/8 via-white/2 to-transparent opacity-65 z-10" />

        </div>
      </div>

      {/* Reward Text Banner with Animation */}
      <div className="text-center min-h-[48px] relative z-10">
        <AnimatePresence mode="wait">
          {prizeResult ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -8 }}
              className={`p-3 rounded-2xl border text-xs font-bold leading-relaxed shadow-lg flex items-center justify-center gap-2 ${
                prizeResult.includes('Tuyệt vời')
                  ? 'bg-gradient-to-r from-amber-950/20 to-yellow-950/20 border-amber-500/40 text-amber-300 shadow-[0_4px_15px_rgba(245,158,11,0.15)] animate-pulse'
                  : 'bg-slate-950/50 border-slate-800/80 text-slate-400'
              }`}
            >
              <span>{prizeResult}</span>
            </motion.div>
          ) : (
            <p className="text-[11px] text-slate-400 leading-relaxed italic px-2">
              🍀 Hãy bấm nút và thử thách vận số! Tích lũy vé VIP để vượt cấp nhanh chóng hoặc mở khóa đặc quyền học tập cực đỉnh!
            </p>
          )}
        </AnimatePresence>
      </div>

      {/* Action Controls */}
      <div className="flex gap-2.5 relative z-10 pt-1">
        <button
          type="button"
          onClick={() => {
            setIsMuted(prev => !prev);
            soundManager.playClick();
          }}
          className={`p-3.5 rounded-2xl border transition-all duration-150 flex items-center justify-center cursor-pointer ${
            isMuted 
              ? 'bg-rose-950/15 border-rose-900/40 text-rose-400 hover:bg-rose-950/25' 
              : 'bg-emerald-950/15 border-emerald-900/40 text-emerald-400 hover:bg-emerald-950/25'
          }`}
          title={isMuted ? "Bật âm thanh" : "Tắt âm thanh"}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 animate-pulse" />}
        </button>

        <button
          type="button"
          disabled={isSpinning || spinsLeft <= 0}
          onClick={handleSpinClick}
          className={`flex-1 font-mono font-black text-xs py-3.5 px-4 rounded-2xl uppercase tracking-wider transition-all duration-250 relative overflow-hidden flex items-center justify-center gap-1.5 ${
            spinsLeft > 0 && !isSpinning
              ? 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-slate-950 font-extrabold hover:shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:-translate-y-0.5 cursor-pointer active:translate-y-0 active:scale-98'
              : 'bg-slate-900 text-slate-600 border border-slate-850 cursor-not-allowed select-none'
          }`}
        >
          <RotateCw className={`w-3.5 h-3.5 ${isSpinning ? 'animate-spin' : ''}`} />
          <span>{isSpinning ? 'Đang quay số...' : `QUAY NGAY (${spinsLeft})`}</span>
        </button>
      </div>

    </div>
  );
}
