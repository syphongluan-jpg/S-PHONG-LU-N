import React, { useState, useRef, useEffect } from 'react';
import { UserProfile } from '../types';
import { 
  Sparkles, 
  HelpCircle, 
  Gift, 
  RotateCw, 
  Dices,
  Volume2, 
  VolumeX,
  X,
  Trophy,
  Ticket
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LuckyWheelProps {
  profile: UserProfile;
  onUpdateProfile: (updatedProfile: UserProfile) => void;
  onClose?: () => void;
}

// 6 segments defined as requested
const WHEEL_SECTIONS = [
  { id: 1, name: 'Chúc bạn may mắn lần sau', color: '#1e293b', textColor: '#94a3b8', prize: 'none' }, // 1
  { id: 2, name: '2 Vé VIP', color: '#f59e0b', textColor: '#0f172a', prize: 'vip_2' },              // 2
  { id: 3, name: 'Chúc bạn may mắn lần sau', color: '#1e293b', textColor: '#94a3b8', prize: 'none' }, // 3
  { id: 4, name: 'Chúc bạn may mắn lần sau', color: '#334155', textColor: '#94a3b8', prize: 'none' }, // 4
  { id: 5, name: '1 Vé VIP', color: '#d97706', textColor: '#ffffff', prize: 'vip_1' },              // 5
  { id: 6, name: 'Chúc bạn may mắn lần sau', color: '#1e293b', textColor: '#94a3b8', prize: 'none' }  // 6
];

export function LuckyWheel({ profile, onUpdateProfile, onClose }: LuckyWheelProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [spinsLeft, setSpinsLeft] = useState(3);
  const [prizeResult, setPrizeResult] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  
  const audioCtxRef = useRef<AudioContext | null>(null);
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
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      if (type === 'tick') {
        osc.frequency.setValueAtTime(400, ctx.currentTime);
        gainNode.gain.setValueAtTime(0.04, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
        osc.start();
        osc.stop(ctx.currentTime + 0.05);
      } else if (type === 'victory') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.15); // E5
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.3); // G5
        osc.frequency.setValueAtTime(1046.5, ctx.currentTime + 0.45); // C6
        gainNode.gain.setValueAtTime(0.12, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
        osc.start();
        osc.stop(ctx.currentTime + 0.8);
      } else if (type === 'fail') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, ctx.currentTime);
        osc.frequency.setValueAtTime(150, ctx.currentTime + 0.2);
        gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
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
    // Let's draw with appropriate prob (or simple equal probability)
    const stopIndex = Math.floor(Math.random() * 6); // 0 to 5
    const selectedPrize = WHEEL_SECTIONS[stopIndex];

    // Compute the sector rotation physics
    // Pointer is located exactly at the TOP (90 degrees relative, wait, let's use 270 deg or simply 0 deg to adjust)
    // Slices are 60 deg each. Slice 0 is [0, 60], Slice 1 is [60, 120]...
    // To land slice i in the top center, we rotate by 360 - (i * 60 + 30) degrees
    const sliceAngle = 60;
    const centerOffset = 30;
    const baseRotations = 360 * 7; // Spins 7 complete rounds for awesome visuals
    const stopAngle = (360 - (stopIndex * sliceAngle + centerOffset));
    const targetRotation = baseRotations + stopAngle;

    setRotation(targetRotation);

    // Simulate satisfying sector ticking sound effects during the 3.5 seconds spin animation
    let lastTickAngle = 0;
    const tickInterval = setInterval(() => {
      if (!wheelRef.current) return;
      // Get current rotation matrix in computed style
      const st = window.getComputedStyle(wheelRef.current);
      const tr = st.getPropertyValue("transform");
      if (tr && tr !== "none") {
        const values = tr.split('(')[1].split(')')[0].split(',');
        const a = parseFloat(values[0]);
        const b = parseFloat(values[1]);
        const angle = Math.round(Math.atan2(b, a) * (180 / Math.PI));
        // play tick whenever we cross sector multiples of 60
        if (Math.abs(angle - lastTickAngle) >= 35) {
          playSynthesizedSound('tick');
          lastTickAngle = angle;
        }
      }
    }, 100);

    setTimeout(() => {
      clearInterval(tickInterval);
      setIsSpinning(false);
      
      const newSpins = spinsLeft - 1;
      setSpinsLeft(newSpins);

      // Add VIP Tickets based on result
      let ticketsWon = 0;
      if (selectedPrize.prize === 'vip_2') {
        ticketsWon = 2;
      } else if (selectedPrize.prize === 'vip_1') {
        ticketsWon = 1;
      }

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
        setPrizeResult(`🌟 Chúc mừng! Bạn trúng được ${ticketsWon} Vé VIP! 🎉`);
        playSynthesizedSound('victory');
      } else {
        setPrizeResult('🥲 Chúc bạn may mắn lần sau nhé!');
        playSynthesizedSound('fail');
      }
    }, 3600); // Wait precisely for transition to end (3.5s + small buffer)
  };

  return (
    <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl max-w-sm mx-auto space-y-6 relative overflow-hidden">
      
      {/* Top Banner */}
      <div className="flex justify-between items-center pb-2 border-b border-slate-800">
        <div className="flex items-center gap-1.5">
          <Dices className="text-amber-400 w-5 h-5 animate-bounce" />
          <div>
            <h3 className="text-sm font-serif italic font-black text-slate-100 uppercase tracking-widest leading-none">
              Vòng Quay Nhân Phẩm 🎡
            </h3>
            <span className="text-[10px] text-slate-500 font-bold">Thử thách vận may hằng ngày</span>
          </div>
        </div>
        
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* VIP Indicator */}
      <div className="flex justify-around bg-slate-950/50 border border-slate-850 p-3 rounded-2xl">
        <div className="text-center">
          <p className="text-[8px] uppercase tracking-wider font-semibold text-slate-500">Giữ Vé VIP</p>
          <p className="text-lg font-mono font-black text-amber-400 flex items-center gap-1 justify-center">
            🎟️ {profile.vipTickets ?? 0}
          </p>
        </div>

        <div className="text-center border-l border-slate-800 pl-4">
          <p className="text-[8px] uppercase tracking-wider font-semibold text-slate-500">Lượt quay hôm nay</p>
          <p className="text-lg font-mono font-black text-cyan-400">
            {spinsLeft} / 3
          </p>
        </div>
      </div>

      {/* Interactive Beautiful Canvas/SVG Wheel */}
      <div className="flex flex-col items-center relative py-4">
        
        {/* Pointer Indicator Arrow */}
        <div className="absolute top-0 z-25 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[22px] border-t-rose-500 drop-shadow-[0_4px_6px_rgba(244,63,94,0.4)]" />

        {/* Outer glowing frame */}
        <div className="relative w-64 h-64 rounded-full border-4 border-amber-500 bg-slate-950 flex items-center justify-center p-1 shadow-[0_0_20px_rgba(245,158,11,0.25)] select-none">
          
          {/* Rotating wheel core */}
          <div
            ref={wheelRef}
            className="w-full h-full rounded-full overflow-hidden relative transition-transform duration-[3500ms] ease-out-quint"
            style={{ 
              transform: `rotate(${rotation}deg)`,
              transition: isSpinning ? 'transform 3.5s cubic-bezier(0.1, 0.8, 0.1, 1)' : 'none'
            }}
          >
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {WHEEL_SECTIONS.map((sec, idx) => {
                // Outer circle sectors starting angles (every 60 degrees)
                const startAngle = idx * 60;
                const endAngle = (idx + 1) * 60;
                const x1 = 50 + 50 * Math.cos((startAngle - 90) * Math.PI / 180);
                const y1 = 50 + 50 * Math.sin((startAngle - 90) * Math.PI / 180);
                const x2 = 50 + 50 * Math.cos((endAngle - 90) * Math.PI / 180);
                const y2 = 50 + 50 * Math.sin((endAngle - 90) * Math.PI / 180);

                const d = `M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`;
                
                // Rotated sector label coordinates
                const midAngle = startAngle + 30;
                const textRot = midAngle;

                return (
                  <g key={idx}>
                    <path d={d} fill={sec.color} stroke="#0f172a" strokeWidth="0.5" />
                    <g transform={`rotate(${textRot} 50 50)`}>
                      <text
                        x="50"
                        y="16"
                        textAnchor="middle"
                        fill={sec.textColor}
                        fontSize="3.8"
                        fontWeight="900"
                        fontFamily="serif"
                        className="tracking-tighter select-none pointer-events-none"
                      >
                        {sec.name === 'Chúc bạn may mắn lần sau' ? 'Chúc may mắn 🍀' : sec.name}
                      </text>
                    </g>
                  </g>
                );
              })}
              
              {/* Inner Circle Border decoration */}
              <circle cx="50" cy="50" r="4" fill="#0f172a" stroke="#f59e0b" strokeWidth="1" />
            </svg>
          </div>

          {/* Golden Center Cap */}
          <div className="absolute w-10 h-10 bg-gradient-to-tr from-amber-500 to-amber-600 rounded-full border-2 border-slate-900 shadow-lg flex items-center justify-center z-10 pointer-events-none">
            <span className="text-sm select-none">💎</span>
          </div>

        </div>
      </div>

      {/* Reward Text Banner with Animation */}
      <div className="text-center min-h-[44px]">
        <AnimatePresence mode="wait">
          {prizeResult ? (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className={`p-2.5 rounded-xl border text-xs font-bold leading-normal ${
                prizeResult.includes('Chúc mừng')
                  ? 'bg-amber-950/20 border-amber-800 text-amber-300'
                  : 'bg-slate-950/40 border-slate-800 text-slate-400'
              }`}
            >
              {prizeResult}
            </motion.div>
          ) : (
            <p className="text-[11px] text-slate-500 leading-normal italic">
              🍀 Hãy nhấn nút bên dưới để thử vận mệnh, chúc bạn luôn tràn ngập may mắn học đường!
            </p>
          )}
        </AnimatePresence>
      </div>

      {/* Action Controls */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setIsMuted(prev => !prev)}
          className="bg-slate-950 border border-slate-800 hover:bg-slate-900 p-3 rounded-xl transition duration-155 text-slate-400 hover:text-slate-200"
          title={isMuted ? "Bật âm thanh" : "Tắt âm thanh"}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
        </button>

        <button
          type="button"
          disabled={isSpinning || spinsLeft <= 0}
          onClick={handleSpinClick}
          className={`flex-1 font-serif italic font-extrabold text-xs py-3 rounded-xl uppercase tracking-wider transition-all shadow-md ${
            spinsLeft > 0 && !isSpinning
              ? 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 scale-[1.01] hover:shadow-amber-950/20 cursor-pointer'
              : 'bg-slate-800 text-slate-500 border border-slate-700/50 cursor-not-allowed'
          }`}
        >
          {isSpinning ? '🌀 Đang xoay số mệnh...' : `🎟️ Quay ngay (${spinsLeft} lượt)`}
        </button>
      </div>

    </div>
  );
}
