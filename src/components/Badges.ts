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
  },
  {
    id: 'badge_combo_perfect',
    name: 'Combo Điểm Tuyệt Đối',
    description: 'Đạt điểm số tuyệt đối 10/10 ở chế độ Đọc Đố Bình Thường',
    icon: '💯',
    color: 'bg-red-100 text-red-800 border-red-300',
    category: 'general'
  },
  {
    id: 'badge_vua_deadline',
    name: 'Vua Deadline',
    description: 'Trả lời đúng câu hỏi khi thời gian còn dưới 3 giây',
    icon: '⏳',
    color: 'bg-orange-100 text-orange-850 border-orange-300',
    category: 'general'
  },
  {
    id: 'badge_may_hoc',
    name: 'Máy Học Chính Hiệu',
    description: 'Lũy kế vượt mốc kinh nghiệm 15,000 EXP học đường',
    icon: '🤖',
    color: 'bg-slate-100 text-slate-800 border-slate-300',
    category: 'general'
  },
  {
    id: 'badge_cao_thu_cay_de',
    name: 'Cao Thủ Cày Đề',
    description: 'Hoàn thành tích lũy 10 ván thi tài học đường',
    icon: '📚',
    color: 'bg-blue-100 text-blue-800 border-blue-300',
    category: 'general'
  },
  {
    id: 'badge_bat_bai_kiem_tra',
    name: 'Bất Bại Kiểm Tra',
    description: 'Đạt liên tiếp chuỗi 3 ván đấu chiến thắng',
    icon: '🛡️',
    color: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    category: 'general'
  },
  {
    id: 'badge_chuyen_gia_ghi_nho',
    name: 'Chuyên Gia Ghi Nhớ',
    description: 'Vượt qua thử thách "Miền Ký Ức" đạt tối thiểu 4 câu chuẩn xác',
    icon: '💭',
    color: 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-300',
    category: 'general'
  },
  {
    id: 'badge_master_hoc_thuat',
    name: 'Master Học Thuật',
    description: 'Đạt đến Cấp độ 25 vượt bậc đại thụ',
    icon: '🦉',
    color: 'bg-purple-100 text-purple-800 border-purple-300',
    category: 'general'
  },
  {
    id: 'badge_mvp_hoc_duong',
    name: 'MVP Học Đường',
    description: 'Chiến thắng 1 trận đấu PvP giáp chiến',
    icon: '🔥',
    color: 'bg-amber-100 text-amber-800 border-amber-300',
    category: 'general'
  },
  {
    id: 'badge_rank_sss',
    name: 'Rank SSS Tri Thức',
    description: 'Tích luỹ vượt mốc kinh nghiệm thượng thặng 50,000 EXP',
    icon: '🌟',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    category: 'general'
  },
  {
    id: 'badge_top_1_bang_diem',
    name: 'Top 1 Bảng Điểm',
    description: 'Tham gia ghi tên vinh dự hàng đầu trên bảng xếp hạng',
    icon: '🏅',
    color: 'bg-green-100 text-green-800 border-green-300',
    category: 'general'
  }
];
