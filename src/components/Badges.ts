export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  category: 'cadao' | 'toanhoc' | 'lichsu' | 'khoahoc' | 'pvp' | 'general';
}

export const BADGES: Badge[] = [
  {
    id: 'badge_cadao_master',
    name: 'Nhà Văn Hóa Việt Nam',
    description: 'Trả lời đúng 10 câu hỏi Ca dao Tục ngữ',
    icon: '📜',
    color: 'bg-amber-100 text-amber-800 border-amber-300',
    category: 'cadao'
  },
  {
    id: 'badge_toan_master',
    name: 'Bàn Tính Vàng',
    description: 'Đạt điểm số tuyệt đối 10/10 môn Toán học',
    icon: '🧮',
    color: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    category: 'toanhoc'
  },
  {
    id: 'badge_lichsu_master',
    name: 'Người Kể Sử Việt',
    description: 'Chinh phục 5 ván chơi Lịch sử Việt Nam',
    icon: '🛡️',
    color: 'bg-rose-100 text-rose-800 border-rose-300',
    category: 'lichsu'
  },
  {
    id: 'badge_science_master',
    name: 'Nhà Phát Minh Trẻ',
    description: 'Trả lời đúng liên tiếp 8 câu Khoa học tự nhiên',
    icon: '🔬',
    color: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    category: 'khoahoc'
  },
  {
    id: 'badge_pvp_emperor',
    name: 'Học Đế Không Ngai',
    description: 'Chiến thắng PvP với thời gian tuyệt đối dưới 5 phút',
    icon: '👑',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    category: 'pvp'
  },
  {
    id: 'badge_pvp_warrior',
    name: 'Kiện Tướng Đấu Trường',
    description: 'Đạt danh hiệu "Học Giả" hoặc cao hơn trong Đấu trường PVP',
    icon: '⚔️',
    color: 'bg-purple-100 text-purple-800 border-purple-300',
    category: 'pvp'
  },
  {
    id: 'badge_level_5',
    name: 'Tân Khoa Trạng Nguyên',
    description: 'Vượt qua Cấp độ 5',
    icon: '🎓',
    color: 'bg-teal-100 text-teal-800 border-teal-300',
    category: 'general'
  },
  {
    id: 'badge_level_10',
    name: 'Thượng Thư Giáo Bộ',
    description: 'Vượt qua Cấp độ 10',
    icon: '🦁',
    color: 'bg-cyan-100 text-cyan-800 border-cyan-300',
    category: 'general'
  }
];
