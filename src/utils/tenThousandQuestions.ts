import { Question } from '../types';

// A deterministic pseudo-random number generator seeded with the question index
// This ensures that for any index between 1 and 10000, we always get the exact same question.
function seedRandom(seed: number) {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

// Arrays of subjects, concepts, values to construct 10,000 high-fidelity questions
const MATH_TOPICS = [
  { concept: 'Phương trình bậc hai', formula: 'ax^2 + bx + c = 0', desc: 'đại số nhị thức' },
  { concept: 'Tích phân xác định', formula: '∫ f(x)dx', desc: 'giới hạn diện tích dưới đường cong' },
  { concept: 'Ma trận vuông cấp hai', formula: 'det(A) = ad - bc', desc: 'đại số tuyến tính học' },
  { concept: 'Hàm số lượng giác', formula: 'sin^2(x) + cos^2(x) = 1', desc: 'hình học sóng lượng giác' },
  { concept: 'Đạo hàm hàm hợp', formula: 'd/dx [f(g(x))] = f\'(g(x)) * g\'(x)', desc: 'tốc độ biến thiên tức thời' },
  { concept: 'Xác suất thống kê', formula: 'P(A|B) = P(B|A)P(A)/P(B)', desc: 'định lý Bayes trong AI' },
  { concept: 'Logarit tự nhiên', formula: 'ln(xy) = ln(x) + ln(y)', desc: 'thang đo số mũ vi phân' },
  { concept: 'Hình học Oxyz không gian', formula: 'x^2 + y^2 + z^2 = R^2', desc: 'tọa độ mặt cầu lượng tử' }
];

const SCIENCE_CONCEPTS = [
  { subject: 'Vật lý lượng tử', term: 'Sự vướng víu lượng tử (Quantum Entanglement)', desc: 'hai hạt liên kết bất kể khoảng cách vũ trụ', fact: 'Einstein gọi là hành động ma quái ở khoảng cách xa' },
  { subject: 'Thiên văn học', term: 'Chân trời sự kiện (Event Horizon)', desc: 'vạch ranh giới vô hồi của hố đen vũ trụ', fact: 'ngay cả ánh sáng cũng không thể thoát ra khỏi vùng này' },
  { subject: 'Sinh học phân tử', term: 'Công nghệ chỉnh sửa gen CRISPR-Cas9', desc: 'hệ thống cắt ghép DNA chuẩn xác', fact: 'phát triển từ hệ thống miễn dịch tự nhiên của vi khuẩn chống thực khuẩn thể' },
  { subject: 'Hóa chất bán dẫn', term: 'Chất bán dẫn Silicon doping', desc: 'pha tạp nguyên tố Phosphor hoặc Bo', fact: 'giúp tạo ra các mối nối P-N cho bóng bán dẫn máy tính' },
  { subject: 'Khoa học máy tính', term: 'Mạng thần kinh nhân tạo (Artificial Neural Network)', desc: 'mô phỏng liên kết synapse sinh học', fact: 'sử dụng lan truyền ngược (backpropagation) để cập nhật trọng số liên kết' },
  { subject: 'Vật lý Hawking', term: 'Bức xạ Hawking', desc: 'sự bay hơi nhiệt lượng của lỗ đen', fact: 'do các cặp hạt-phản hạt ảo sinh ra ở rìa chân trời sự kiện' },
  { subject: 'Khoa học vật liệu', term: 'Graphene một lớp nguyên tử', desc: 'mạng tinh thể carbon hình tổ ong 2D', fact: 'dẫn điện tốt hơn đồng và cứng hơn thép gấp 200 lần' },
  { subject: 'Địa chất học vũ trụ', term: 'Vành đai bức xạ Van Allen', desc: 'vành đai hạt mang điện tích bao quanh Trái Đất', fact: 'được giữ lại bởi từ trường bẫy các tia vũ trụ nguy hại' }
];

const HISTORY_EVENTS = [
  { era: 'Nhà Trần chống Nguyên Mông', hero: 'Trần Hưng Đạo', event: 'Chiến thắng sông Bạch Đằng năm 1288', tactic: 'cắm cọc gỗ đầu bịt sắt triệt hạ chiến thuyền phản công' },
  { era: 'Nhà Tây Sơn', hero: 'Quang Trung - Nguyễn Huệ', event: 'Đại phá 29 vạn quân Thanh xuân Kỷ Dậu 1789', tactic: 'hỏa tốc hành quân thần tốc, đánh úp đồn Ngọc Hồi - Khương Thượng' },
  { era: 'Nhà Lý độc lập', hero: 'Lý Thường Kiệt', event: 'Phụng văn thơ Nam Quốc Sơn Hà năm 1077', tactic: 'tuyên truyền tâm lý chiến trên dòng sông Như Nguyệt bẻ gãy ý chí quân Tống' },
  { era: 'Khởi nghĩa Hai Bà Trưng', hero: 'Trưng Trắc và Trưng Nhị', event: 'Khởi nghĩa năm 40 sau Công Nguyên', tactic: 'chiêu binh phất cờ khởi nghĩa tại Hát Môn bẻ gãy ách đô hộ của nhà Đông Hán' },
  { era: 'Nhà Lê sơ lập quốc', hero: 'Lê Lợi và Nguyễn Trãi', event: 'Khởi nghĩa Lam Sơn ròng rã 10 năm', tactic: 'chủ trương dời binh, vây thành diệt viện bẻ gãy viện binh Liễu Thăng ở Chi Lăng' },
  { era: 'Triều đại Ngô Quyền', hero: 'Ngô Quyền', event: 'Đại phá quân Nam Hán năm 938 trên sông Bạch Đằng', tactic: 'chấm dứt hơn 1000 năm Bắc thuộc mở ra kỷ nguyên độc lập tự chủ lâu dài' }
];

const CADAO_METAPHORS = [
  { item: 'Cây đa, bến nước, con đò', meaning: 'tình yêu quê hương, hoài niệm thủy chung nghĩa tình xưa cũ' },
  { item: 'Ngọc kia chuốt đỏ thêm thanh / Công cha nghĩa mẹ', meaning: 'lòng kính trọng vô bờ bến và sự hiếu kính dưỡng dục sinh thành' },
  { item: 'Bầu ơi thương lấy bí cùng / Tuy rằng khác giống', meaning: 'tinh thần đoàn kết tương thân tương ái, đồng bào tương trợ lúc nguy nan' },
  { item: 'Nhiễu điều phủ lấy giá gương / Người trong một nước', meaning: 'trách nhiệm bảo bọc, yêu thương đùm bọc che chở lẫn nhau' },
  { item: 'Lá lành đùm lá rách', meaning: 'giúp đỡ người nghèo đói tổn thương bằng tấm lòng nhân ái' },
  { item: 'Muốn lành nghề phải trọng thầy / Không thầy đố mày làm nên', meaning: 'truyền thống tôn sư trọng đạo, tôn vinh người thầy dẫn lối trí tuệ' }
];

// Generates a fully cohesive question deterministically mapping to indices 1 to 10000
export function getTenThousandQuestion(index: number, studentClass: string = 'Lớp 6'): Question {
  // Normalize index within range 1 to 10000
  const normalizedIndex = Math.max(1, Math.min(10000, index));
  
  // Use seeded random values
  const r1 = seedRandom(normalizedIndex);
  const r2 = seedRandom(normalizedIndex * 4.32);
  const r3 = seedRandom(normalizedIndex * 19.8);
  const r4 = seedRandom(normalizedIndex * 99.1);

  // Assign topic
  const topics: Array<'toanhoc' | 'khoahoc' | 'lichsu' | 'cadao'> = ['toanhoc', 'khoahoc', 'lichsu', 'cadao'];
  const topic = topics[Math.floor(r1 * topics.length)];

  // Determine star level (1 to 5 stars)
  const stars = (normalizedIndex % 5) + 1; // 1, 2, 3, 4, 5 balance
  
  // Assign difficulty and score multipliers
  let difficulty: 'de' | 'trung-binh' | 'kho' | 'thach-thuc' = 'trung-binh';
  if (stars === 1) difficulty = 'de';
  else if (stars === 2) difficulty = 'de';
  else if (stars === 3) difficulty = 'trung-binh';
  else if (stars === 4) difficulty = 'kho';
  else difficulty = 'thach-thuc';

  let questionText = '';
  let options: string[] = [];
  let correctAnswer = 'A';
  let explanation = '';

  const id = `index_based_cyber_q_${normalizedIndex}`;

  if (topic === 'toanhoc') {
    // Generate Math question using seeded index
    const mItem = MATH_TOPICS[Math.floor(r2 * MATH_TOPICS.length)];
    const coeffA = Math.floor(r3 * 12) + 2;
    const coeffB = Math.floor(r4 * 25) + 5;
    
    if (mItem.concept === 'Phương trình bậc hai') {
      const x1 = Math.floor(r3 * 5) + 1;
      const x2 = Math.floor(r4 * 4) + 2;
      const sum = x1 + x2;
      const prod = x1 * x2;
      questionText = `🛡️ [Toán Học Lớp ${studentClass}] Tìm nghiệm nguyên dương lớn nhất của phương trình bậc hai: x² - ${sum}x + ${prod} = 0?`;
      options = [`x = ${Math.max(x1, x2)}`, `x = ${Math.min(x1, x2) - 1}`, `x = ${sum + 2}`, `x = ${prod + 4}`];
      correctAnswer = 'A';
      explanation = `Phân tích đa thức thành nhân tử ta thu được: (x - ${x1})(x - ${x2}) = 0. Phương trình có hai nghiệm phân biệt là x = ${x1} và x = ${x2}. Nghiệm nguyên dương lớn nhất là x = ${Math.max(x1, x2)}.`;
    } 
    else if (mItem.concept === 'Tích phân xác định') {
      const lower = Math.floor(r3 * 3) + 1;
      const upper = lower + Math.floor(r4 * 3) + 1;
      const ans = upper * upper - lower * lower;
      questionText = `🧪 [Toán Học Lớp ${studentClass}] Tính giá trị của tích phân xác định I = ∫_{${lower}}^{${upper}} (2x) dx?`;
      options = [`I = ${ans + 3}`, `I = ${ans}`, `I = ${ans - 4}`, `I = 0`];
      correctAnswer = 'B';
      explanation = `Nguyên hàm của f(x) = 2x là F(x) = x². Giá trị tích phân xác định là: I = F(${upper}) - F(${lower}) = ${upper}² - ${lower}² = ${upper * upper} - ${lower * lower} = ${ans}.`;
    }
    else if (mItem.concept === 'Ma trận vuông cấp hai') {
      const a = coeffA;
      const b = Math.floor(r4 * 4) + 1;
      const c = Math.floor(r3 * 3) + 1;
      const d = Math.floor(r4 * 3) + 2;
      const det = a * d - b * c;
      questionText = `⚛️ [Toán Cao Cấp] Tính định thức (determinant) d của ma trận vuông cấp hai A = [[${a}, ${b}], [${c}, ${d}]]:`;
      options = [`d = ${det + 5}`, `d = ${det}`, `d = ${det - 2}`, `d = 0`];
      correctAnswer = 'B';
      explanation = `Công thức định thức ma trận 2x2 là det(A) = ad - bc. Thay các hệ số ta có: ${a} * ${d} - ${b} * ${c} = ${a * d} - ${b * c} = ${det}.`;
    }
    else if (mItem.concept === 'Hàm số lượng giác') {
      const angleVal = 30;
      questionText = `⚡ [Toán Học Lớp ${studentClass}] Trong lượng tử hình học, tính giá trị của biểu thức lượng giác cơ bản: A = sin²(${angleVal}°) + cos²(${angleVal}°) + ${coeffA}?`;
      options = [`A = ${coeffA - 1}`, `A = ${coeffA + 1}`, `A = ${coeffA + 2}`, `A = ${coeffA}`];
      correctAnswer = 'B';
      explanation = `Theo hệ thức lượng giác cơ bản: sin²(α) + cos²(α) = 1 với mọi góc α. Vì thế, biểu thức lượng giác A = 1 + ${coeffA} = ${coeffA + 1}.`;
    }
    else if (mItem.concept === 'Đạo hàm hàm hợp') {
      const uVal = 3 * coeffA - 1;
      const ans = 6 * uVal;
      questionText = `🧬 [Toán Học Lớp ${studentClass}] Tính giá trị đạo hàm f'(x) của hàm số f(x) = (3x - 1)² tại điểm x = ${coeffA}?`;
      options = [`f'(${coeffA}) = ${ans}`, `f'(${coeffA}) = ${ans - 6}`, `f'(${coeffA}) = ${ans + 12}`, `f'(${coeffA}) = 0`];
      correctAnswer = 'A';
      explanation = `Đạo hàm của hàm hợp: f'(x) = 2 * (3x - 1) * (3x - 1)' = 6(3x - 1). Tại x = ${coeffA}, giá trị đạo hàm tương ứng là f'(${coeffA}) = 6 * (3 * ${coeffA} - 1) = 6 * ${uVal} = ${ans}.`;
    }
    else if (mItem.concept === 'Xác suất thống kê') {
      const totalChips = Math.floor(r3 * 10) + 12;
      const whiteChips = Math.floor(r4 * 5) + 5;
      questionText = `🎲 [Toán Học Lớp ${studentClass}] Một hộp có ${totalChips} viên bi gồm ${whiteChips} viên bi màu trắng, còn lại là màu đỏ. Lấy ngẫu nhiên 1 viên bi. Tính xác suất P để lấy được viên bi màu trắng?`;
      options = [`P = ${whiteChips - 2}/${totalChips}`, `P = 1/${totalChips}`, `P = ${whiteChips}/${totalChips}`, `P = ${totalChips - whiteChips}/${totalChips}`];
      correctAnswer = 'C';
      explanation = `Số kết quả thuận lợi cho biến cố lấy được bi trắng là ${whiteChips}. Tổng số kết quả có thể xảy ra khi lấy ngẫu nhiên 1 viên bi là ${totalChips}. Xác suất cần tìm là P = ${whiteChips}/${totalChips}.`;
    }
    else if (mItem.concept === 'Logarit tự nhiên') {
      const pwr = Math.min(6, coeffA);
      const ans = Math.pow(2, pwr);
      questionText = `🔢 [Toán Học Lớp ${studentClass}] Tìm nghiệm thực x của phương trình logarit sau đây: log_2(x) = ${pwr}?`;
      options = [`x = ${ans - 1}`, `x = ${ans + 2}`, `x = ${ans}`, `x = ${pwr * 2}`];
      correctAnswer = 'C';
      explanation = `Theo định nghĩa cơ bản của phép toán logarit: log_a(b) = c <=> b = a^c. Phương trình cho nghiệm thực duy nhất là x = 2^${pwr} = ${ans}.`;
    }
    else {
      // Hình học Oxyz không gian
      const radius = Math.floor(r3 * 5) + 2;
      const rSquare = radius * radius;
      questionText = `🌐 [Toán Học Lớp ${studentClass}] Trong không gian Oxyz, tìm bán kính R của mặt cầu (S) có phương trình tương ứng như sau: x² + y² + z² = ${rSquare}?`;
      options = [`R = ${radius}`, `R = ${rSquare}`, `R = ${radius + 1}`, `R = ${radius - 1}`];
      correctAnswer = 'A';
      explanation = `Phương trình chính tắc của mặt cầu tâm O là x² + y² + z² = R². Do đó, ta có R² = ${rSquare} <=> bán kính R = ${radius}.`;
    }
  } 
  else if (topic === 'khoahoc') {
    // Generate Science & Space concepts
    const sItem = SCIENCE_CONCEPTS[Math.floor(r2 * SCIENCE_CONCEPTS.length)];
    questionText = `🛸 [Khoa Học Hiện Đại] Ý nghĩa khoa học của khái niệm "${sItem.term}" biểu trưng cho điều gì?`;
    
    options = [
      `Là ${sItem.desc}`,
      `Là một chất xúc tác tăng tốc độ phản ứng tổng hợp hạt nhân`,
      `Là thuật ngữ điện toán đám mây chỉ luồng truyền tải dữ liệu ảo`,
      `Là công nghệ nén xung nhịp lượng tử trong CPU`
    ];
    
    // Shuffle options using seeded value
    if (r3 > 0.5) {
      options = [
        `Là thuật ngữ điện toán đám mây chỉ luồng truyền tải dữ liệu ảo`,
        `Là ${sItem.desc}`,
        `Là công nghệ nén xung nhịp lượng tử trong CPU`,
        `Là một chất xúc tác tăng tốc độ phản ứng tổng hợp hạt nhân`
      ];
      correctAnswer = 'B';
    } else if (r3 > 0.25) {
      options = [
        `Là công nghệ nén xung nhịp lượng tử trong CPU`,
        `Là một chất xúc tác tăng tốc độ phản ứng tổng hợp hạt nhân`,
        `Là thuật ngữ điện toán đám mây chỉ luồng truyền tải dữ liệu ảo`,
        `Là ${sItem.desc}`
      ];
      correctAnswer = 'D';
    } else {
      correctAnswer = 'A';
    }

    explanation = `Khảo cứu thực tế: ${sItem.term} định nghĩa chính xác và trực quan nhất khái niệm nghiên cứu: ${sItem.desc}. Thú vị là: ${sItem.fact}.`;
  } 
  else if (topic === 'lichsu') {
    // Generate Military History concepts
    const hItem = HISTORY_EVENTS[Math.floor(r2 * HISTORY_EVENTS.length)];
    questionText = `🕰️ [Biên Niên Sử Việt Nam] Bối cảnh lịch sử của "${hItem.event}" gắn liền với vị hào kiệt nào và chiến thuật quân sự nào?`;
    
    options = [
      `Anh hùng ${hItem.hero} với chiến thuật mưu kế: ${hItem.tactic}`,
      `Quốc công tiết chế Lê Lợi áp dụng vây thành diệt viện thần tốc`,
      `Chúa Nguyễn Hoàng khai phá bờ cõi phía Nam dùng hỏa khí dẹp loạn`,
      `Tả quân Lê Văn Duyệt dùng mưu gài gián điệp quấy rối quân thù`
    ];

    if (r3 > 0.6) {
      options = [
        `Chúa Nguyễn Hoàng khai phá đất Thuận Hóa dựng đồn lũy`,
        `Anh hùng ${hItem.hero} với chiến thuật mưu kế: ${hItem.tactic}`,
        `Tả quân Lê Văn Duyệt dùng binh biến thần tốc dụ địch dẹp loạn`,
        `Tướng quân Lý Thường Kiệt phong biên ải phản công bất ngờ`
      ];
      correctAnswer = 'B';
    } else if (r3 > 0.3) {
      options = [
        `Tướng quân Lý Thường Kiệt dựng lũy Như Nguyệt thủy chiến`,
        `Quốc công Lê Lợi mở đường hành quân thần tốc bất ngờ dẹp địch`,
        `Anh hùng ${hItem.hero} với chiến thuật mưu kế: ${hItem.tactic}`,
        `Chúa Nguyễn Hoàng lập mưu phản gián phá tan dinh lũy đối phương`
      ];
      correctAnswer = 'C';
    }

    explanation = `Trang sử hào hùng chí tôn: "${hItem.event}" thuộc triều đại ${hItem.era}. Vị tướng trực tiếp chỉ đạo tối cao là ${hItem.hero}, sử dụng nghệ thuật dụng binh xuất chúng: ${hItem.tactic}.`;
  } 
  else {
    // Generate Folklore & Ca Dao linguistics concepts
    const cItem = CADAO_METAPHORS[Math.floor(r2 * CADAO_METAPHORS.length)];
    questionText = `🏮 [Văn Học Dân Gian] Trong kho tàng ca dao tục ngữ Việt Nam, hình ảnh biểu trưng "${cItem.item}" hàm ý chỉ bài học triết lý nào?`;
    
    options = [
      `Răn dạy triết học rèn luyện con người: ${cItem.meaning}`,
      `Mô tả vẻ đẹp thuần khiết tinh khôi mộc mạc của quang cảnh làng quê`,
      `Chiêm nghiệm về chu kỳ luân hồi biến đổi thịnh suy của đất trời`,
      `Phê phán những thói hư tật xấu cờ bạc lười lao động cổ xưa`
    ];

    if (r2 > 0.5) {
      options = [
        `Mô tả nét đẹp hiền hòa, trù phú sầm uất của giao thương chợ bến`,
        `Răn dạy triết học rèn luyện con người: ${cItem.meaning}`,
        `Khuyên răn giới nho sĩ nỗ lực vượt qua khó khăn danh vọng`,
        `Ca ngợi vẻ đẹp nông nghiệp gặt hái lúa mùa trăng tròn`
      ];
      correctAnswer = 'B';
    }

    explanation = `Văn hóa phương Đông sâu sắc lý giải ý nghĩa biểu trưng của tục ngữ: "${cItem.item}" chính là ẩn dụ cho ${cItem.meaning}.`;
  }

  return {
    id,
    topic,
    type: 'multiple-choice',
    questionText,
    options,
    correctAnswer,
    explanation,
    difficulty,
    stars
  };
}

// Function to serve list of 20 sample questions around a specific page for UI explorer
export function getTenThousandQuestionsChunk(page: number, studentClass: string = 'Lớp 6'): Question[] {
  const pageSize = 15;
  const startIdx = (page - 1) * pageSize + 1;
  const list: Question[] = [];
  for (let i = 0; i < pageSize; i++) {
    const qIndex = startIdx + i;
    if (qIndex > 10000) break;
    list.push(getTenThousandQuestion(qIndex, studentClass));
  }
  return list;
}
