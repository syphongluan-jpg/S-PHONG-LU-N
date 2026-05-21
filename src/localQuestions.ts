import { Question } from './types';

export const LOCAL_QUESTIONS: Question[] = [
  // === TOPIC: CA DAO TỤC NGỮ VIỆT NAM (cadao) ===
  {
    id: 'cadao_1',
    topic: 'cadao',
    type: 'multiple-choice',
    questionText: 'Điền từ còn thiếu vào câu ca dao sau: "Bầu ơi thương lấy bí cùng, Tuy rằng ... nhưng chung một giàn."',
    options: ['khác giống', 'khác nòi', 'khác họ', 'khác loài'],
    correctAnswer: 'A',
    explanation: 'Câu ca dao đầy đủ là: "Bầu ơi thương lấy bí cùng, Tuy rằng khác giống nhưng chung một giàn," dạy chúng ta tình yêu thương đồng bào dù khác biệt.',
    difficulty: 'de'
  },
  {
    id: 'cadao_2',
    topic: 'cadao',
    type: 'multiple-choice',
    questionText: 'Câu tục ngữ "Ăn quả nhớ kẻ trồng cây" nói về đạo lý truyền thống nào của dân tộc ta?',
    options: ['Đoàn kết', 'Hiếu học', 'Uống nước nhớ nguồn', 'Cần cù lao động'],
    correctAnswer: 'C',
    explanation: 'Ăn quả nhớ kẻ trồng cây khuyên chúng ta biết ơn những người đã có công giúp đỡ hoặc tạo dựng thành quả, giống như truyền thống Uống nước nhớ nguồn.',
    difficulty: 'de'
  },
  {
    id: 'cadao_3',
    topic: 'cadao',
    type: 'multiple-choice',
    questionText: 'Điền tiếp vào câu ca dao sau: "Thương dân dân lập đền thờ, Làm hại dân thì ..."',
    options: ['dân hạ bệ thờ', 'dân sẽ oán than', 'dân bắt tội cho', 'dân rủa dân nguyền'],
    correctAnswer: 'A',
    explanation: 'Câu ca dao hoàn chỉnh: "Thương dân dân lập đền thờ, Làm hại dân thì dân hạ bệ thờ", thể hiện vai trò to lớn của lòng dân.',
    difficulty: 'trung-binh'
  },
  {
    id: 'cadao_4',
    topic: 'cadao',
    type: 'multiple-choice',
    questionText: 'Ý nghĩa của câu ca dao "Một cây làm chẳng nên non, Ba cây chụm lại nên hòn núi cao" là gì?',
    options: ['Đề cao sức mạnh của sự kết hợp số lượng', 'Khẳng định sức mạnh của tinh thần đoàn kết', 'Khuyên người dân trồng thật nhiều cây xanh', 'Nêu cao đức tính cần cù cải tạo đất đai'],
    correctAnswer: 'B',
    explanation: '"Ba cây chụm lại" đại diện cho sự liên kết, hợp sức đoàn kết để vượt qua những khó khăn mà một cá nhân không làm nổi.',
    difficulty: 'de'
  },
  {
    id: 'cadao_5',
    topic: 'cadao',
    type: 'short-answer',
    questionText: 'Hoàn thành câu thành ngữ nói về tính kiên trì vượt khó sau (chỉ điền các từ còn thiếu, viết thường không dấu hoặc có dấu tiếng Việt chuẩn): "Nước chảy ... mòn"',
    correctAnswer: 'đá',
    explanation: 'Thành ngữ đầy đủ là "Nước chảy đá mòn", nói lên lòng kiên trì bền bỉ lâu dài sẽ làm nên việc lớn.',
    difficulty: 'de'
  },
  {
    id: 'cadao_6',
    topic: 'cadao',
    type: 'multiple-choice',
    questionText: 'Điền từ vào câu ca dao: "Công cha như núi Thái Sơn, Nghĩa mẹ như nước trong ... chảy ra."',
    options: ['nguồn', 'sông', 'khe', 'suối'],
    correctAnswer: 'A',
    explanation: 'Câu ca dao: "Công cha như núi Thái Sơn, Nghĩa mẹ như nước trong nguồn chảy ra" ca ngợi công ơn trời biển của đấng sinh thành.',
    difficulty: 'de'
  },
  {
    id: 'cadao_7',
    topic: 'cadao',
    type: 'multiple-choice',
    questionText: 'Câu ca dao: "Thân em như chẽn lúa đòng đòng / Phất phơ dưới ngọn nắng hồng ban mai" miêu tả đặc điểm gì của người con gái?',
    options: ['Vẻ đẹp thanh tân, tràn đầy sức sống', 'Số phận lênh đênh, chìm nổi', 'Nỗi buồn thầm kín, cô đơn', 'Sự vất vả chịu thương chịu khó'],
    correctAnswer: 'A',
    explanation: 'Hình ảnh "chẽn lúa đòng đòng phất phơ dưới ngọn nắng hồng ban mai" gợi lên vẻ đẹp thanh khiết, trẻ trung, căng tràn sức sống của thiếu nữ nông thôn Việt Nam.',
    difficulty: 'trung-binh'
  },
  {
    id: 'cadao_8',
    topic: 'cadao',
    type: 'multiple-choice',
    questionText: 'Điền từ còn thiếu vào câu thành ngữ sau: "Gần mực thì đen, gần ... thì sáng"',
    options: ['lửa', 'bạn', 'đèn', 'thầy'],
    correctAnswer: 'C',
    explanation: 'Thành ngữ là "Gần mực thì đen, gần đèn thì sáng", ý khuyên môi trường xung quanh có ảnh hưởng rất lớn tới nhân cách con người.',
    difficulty: 'de'
  },
  {
    id: 'cadao_9',
    topic: 'cadao',
    type: 'short-answer',
    questionText: 'Hoàn thành câu ca dao nói về tình anh em sau: "Anh em như thể ... chân tay, Rách lành đùm bọc dở hay đỡ đần" (Hãy điền 1 từ còn thiếu)',
    correctAnswer: 'tay',
    explanation: 'Câu đầy đủ: "Anh em như thể tay chân, Rách lành đùm bọc dở hay đỡ đần."',
    difficulty: 'de'
  },
  {
    id: 'cadao_10',
    topic: 'cadao',
    type: 'multiple-choice',
    questionText: 'Câu ca dao "Ai ơi bưng bát cơm đầy / Dẻo thơm một hạt, ... đắng cay muôn phần" nói về đức tính hoặc công lao nào?',
    options: ['Sự hiếu thảo', 'Sự chăm chỉ học hành', 'Nỗi vất vả sương gió của người nông dân tạo ra hạt gạo', 'Lòng dũng cảm anh dũng chống giặc ngoại xâm'],
    correctAnswer: 'C',
    explanation: 'Câu ca dao đầy đủ: "Ai ơi bưng bát cơm đầy, Dẻo thơm một hạt đắng cay muôn phần" khuyên ta quý trọng hạt gạo vì chúng thấm đẫm mồ hôi của người nông dân chăm chỉ.',
    difficulty: 'trung-binh'
  },


  // === TOPIC: TOÁN HỌC (toanhoc) ===
  {
    id: 'toan_1',
    topic: 'toanhoc',
    type: 'multiple-choice',
    questionText: 'Tính giá trị của biểu thức: x² - 4 tại x = 3.',
    options: ['5', '9', '2', '1'],
    correctAnswer: 'A',
    explanation: 'Thay x = 3 vào biểu thức ta được: 3² - 4 = 9 - 4 = 5.',
    difficulty: 'de'
  },
  {
    id: 'toan_2',
    topic: 'toanhoc',
    type: 'multiple-choice',
    questionText: 'Trong tam giác vuông, bình phương cạnh huyền bằng tổng bình phương hai cạnh góc vuông. Đây là nội dung của định lý nào?',
    options: ['Định lý Thales', 'Định lý Euclid', 'Định lý Pythagoras', 'Định lý Descartes'],
    correctAnswer: 'C',
    explanation: 'Định lý Pythagoras phát biểu về mối quan hệ giữa ba cạnh của một tam giác vuông: a² + b² = c².',
    difficulty: 'de'
  },
  {
    id: 'toan_3',
    topic: 'toanhoc',
    type: 'short-answer',
    questionText: 'Tìm x biết: 3x - 12 = 0',
    correctAnswer: '4',
    explanation: 'Ta có 3x = 12 <=> x = 12 / 3 = 4.',
    difficulty: 'de'
  },
  {
    id: 'toan_4',
    topic: 'toanhoc',
    type: 'multiple-choice',
    questionText: 'Tìm tập hợp nghiệm của phương trình (x - 2)(x + 5) = 0.',
    options: ['{2}', '{-5}', '{2; -5}', '{-2; 5}'],
    correctAnswer: 'C',
    explanation: 'Phương trình dạng tích tích phân thành x - 2 = 0 hoặc x + 5 = 0, nên nghiệm là x = 2 hoặc x = -5.',
    difficulty: 'de'
  },
  {
    id: 'toan_5',
    topic: 'toanhoc',
    type: 'multiple-choice',
    questionText: 'Công thức tính diện tích hình tròn có bán kính R là:',
    options: ['S = 2πR', 'S = πR²', 'S = 4πR²', 'S = πR'],
    correctAnswer: 'B',
    explanation: 'Diện tích hình tròn được tính bằng tích số Pi (khoảng 3.14) nhân với bình phương bán kính R: S = πR².',
    difficulty: 'de'
  },
  {
    id: 'toan_6',
    topic: 'toanhoc',
    type: 'multiple-choice',
    questionText: 'Hệ số góc của đường thẳng y = -3x + 5 là bao nhiêu?',
    options: ['5', '3', '-3', '-3/5'],
    correctAnswer: 'C',
    explanation: 'Đường thẳng y = ax + b có hệ số góc là a. Trong phương trình y = -3x + 5, hệ số góc a = -3.',
    difficulty: 'trung-binh'
  },
  {
    id: 'toan_7',
    topic: 'toanhoc',
    type: 'multiple-choice',
    questionText: 'Tổng số đo 3 góc trong một tam giác bằng bao nhiêu độ?',
    options: ['90 độ', '180 độ', '270 độ', '360 độ'],
    correctAnswer: 'B',
    explanation: 'Trong mọi tam giác trên mặt phẳng Euclide, tổng số đo của ba góc trong luôn bằng 180 độ.',
    difficulty: 'de'
  },
  {
    id: 'toan_8',
    topic: 'toanhoc',
    type: 'short-answer',
    questionText: 'Tính căn bậc hai số học của 144.',
    correctAnswer: '12',
    explanation: 'Căn bậc hai số học của 144 là con số không âm x sao cho x² = 144, đó chính là 12.',
    difficulty: 'de'
  },
  {
    id: 'toan_9',
    topic: 'toanhoc',
    type: 'multiple-choice',
    questionText: 'Phân tích đa thức x² - 4x + 4 thành nhân tử, ta được hằng đẳng thức nào?',
    options: ['(x + 2)²', '(x - 2)²', '(x - 4)²', 'x(x - 4)'],
    correctAnswer: 'B',
    explanation: 'Áp dụng hằng đẳng thức bình phương của một hiệu: a² - 2ab + b² = (a - b)². Ở đây x² - 2*2*x + 2² = (x - 2)².',
    difficulty: 'de'
  },
  {
    id: 'toan_10',
    topic: 'toanhoc',
    type: 'multiple-choice',
    questionText: 'Tìm nguyên lý hoặc khái niệm toán học liên quan đến câu đố cổ: "Vừa gà vừa chó, Bó lại cho tròn, Ba mươi sáu con, Một trăm chân chẵn." Hỏi có bao nhiêu con gà?',
    options: ['12 con gà', '22 con gà', '14 con gà', '20 con gà'],
    correctAnswer: 'B',
    explanation: 'Gọi số gà là x, số chó là y. Ta có hệ phương trình: x + y = 36 và 2x + 4y = 100. Giải hệ phương trình ta có x = 22, y = 14. Vậy có 22 con gà.',
    difficulty: 'trung-binh'
  },


  // === TOPIC: LỊCH SỬ VIỆT NAM (lichsu) ===
  {
    id: 'lichsu_1',
    topic: 'lichsu',
    type: 'multiple-choice',
    questionText: 'Ai là người lãnh đạo nhân dân đánh tan quân Nam Hán trên sông Bạch Đằng năm 938, mở đầu kỷ nguyên độc lập tự chủ lâu dài cho nước ta?',
    options: ['Đinh Bộ Lĩnh', 'Ngô Quyền', 'Lê Hoàn', 'Lý Công Uẩn'],
    correctAnswer: 'B',
    explanation: 'Năm 938, Ngô Quyền chỉ huy nhân dân cắm cọc gỗ đầu bịt sắt trên sông Bạch Đằng, tiêu diệt quân Nam Hán, giành độc lập rực rỡ.',
    difficulty: 'de'
  },
  {
    id: 'lichsu_2',
    topic: 'lichsu',
    type: 'multiple-choice',
    questionText: 'Triều đại nào đã ban hành bộ luật Hồng Đức (Quốc triều hình luật) nổi tiếng trong lịch sử Việt Nam?',
    options: ['Nhà Lý', 'Nhà Trần', 'Nhà Hậu Lê', 'Nhà Nguyễn'],
    correctAnswer: 'C',
    explanation: 'Bộ luật Hồng Đức được khởi xướng và hoàn chỉnh dưới thời Lê Thánh Tông (Nhà Hậu Lê), là bộ luật tiến bộ bảo vệ quyền lợi phụ nữ.',
    difficulty: 'trung-binh'
  },
  {
    id: 'lichsu_3',
    topic: 'lichsu',
    type: 'multiple-choice',
    questionText: 'Thành phố mang tên Bác Hồ kính yêu (Thành phố Hồ Chí Minh) chính thức được Quốc hội đổi tên từ Sài Gòn - Gia Định vào năm nào?',
    options: ['1975', '1976', '1986', '1990'],
    correctAnswer: 'B',
    explanation: 'Kỳ họp thứ nhất Quốc hội khóa VI nước Cộng hòa Xã hội chủ nghĩa Việt Nam diễn ra vào tháng 7 năm 1976 đã chính thức đổi tên thành phố Sài Gòn thành Thành phố Hồ Chí Minh.',
    difficulty: 'trung-binh'
  },
  {
    id: 'lichsu_4',
    topic: 'lichsu',
    type: 'short-answer',
    questionText: 'Tên vị vua đầu tiên lập nên triều đại nhà Lý và dời đô từ Hoa Lư về Thăng Long năm 1010 là ai?',
    correctAnswer: 'Lý Công Uẩn',
    explanation: 'Lý Thái Tổ (Lý Công Uẩn) lên ngôi năm 1009 và đưa ra quyết định lịch sử dời đô về Đại La (Thăng Long) vào năm 1010.',
    difficulty: 'de'
  },
  {
    id: 'lichsu_5',
    topic: 'lichsu',
    type: 'multiple-choice',
    questionText: 'Chiến thắng nào dưới sự lãnh đạo tài tình của Đại tướng Võ Nguyên Giáp đã chấn động địa cầu, kết thúc chiến tranh Đông Dương lập lại hòa bình năm 1954?',
    options: ['Chiến dịch Điện Biên Phủ', 'Chiến thắng Ấp Bắc', 'Chiến dịch Hồ Chí Minh', 'Trận Điện Biên Phủ trên không'],
    correctAnswer: 'A',
    explanation: 'Chiến thắng Điện Biên Phủ "lừng lẫy năm châu, chấn động địa cầu" ngày 7/5/1954 đánh bại hoàn toàn thực dân Pháp xâm lược.',
    difficulty: 'de'
  },
  {
    id: 'lichsu_6',
    topic: 'lichsu',
    type: 'multiple-choice',
    questionText: 'Vị anh hùng áo vải Tây Sơn nào đã lãnh đạo đại quân quét sạch 29 vạn quân Thanh xâm lược vào dịp Tết Kỷ Dậu năm 1789?',
    options: ['Nguyễn Nhạc', 'Nguyễn Lữ', 'Nguyễn Huệ', 'Trần Hưng Đạo'],
    correctAnswer: 'C',
    explanation: 'Quang Trung - Nguyễn Huệ, vị hoàng đế kiệt xuất đại phá quân Thanh thần tốc giành lấy chiến thắng vẻ vang tại gò Đống Đa năm 1789.',
    difficulty: 'de'
  },
  {
    id: 'lichsu_7',
    topic: 'lichsu',
    type: 'multiple-choice',
    questionText: 'Hai nữ anh hùng lỗi lạc chống lại ách thống trị của nhà Đông Hán năm 40 đầu Công nguyên là ai?',
    options: ['Mẹ Thứ và Mẹ Suốt', 'Bác và Đảng', 'Hai Bà Trưng', 'Bà Triệu'],
    correctAnswer: 'C',
    explanation: 'Hai Bà Trưng (Trưng Trắc, Trưng Nhị) dựng cờ khởi nghĩa ở Hát Môn năm 40 để giành lại quyền độc lập từ thái thú Tô Định.',
    difficulty: 'de'
  },
  {
    id: 'lichsu_8',
    topic: 'lichsu',
    type: 'short-answer',
    questionText: 'Bản tuyên ngôn độc lập đầu tiên trong lịch sử nước ta gắn liền với triều đại nhà Lý chống quân Tống xâm lược là tác phẩm có tựa đề là gì? (Nhập tên tác phẩm bằng tiếng Việt)',
    correctAnswer: 'Nam quốc sơn hà',
    explanation: 'Bài thơ "Nam quốc sơn hà", tương truyền do Lý Thường Kiệt đọc vang trên sông Như Nguyệt, được coi là bản Tuyên ngôn độc lập đầu tiên của nước Việt Nam.',
    difficulty: 'trung-binh'
  },
  {
    id: 'lichsu_9',
    topic: 'lichsu',
    type: 'multiple-choice',
    questionText: 'Năm 1975, sự kiện xe tăng mang số hiệu 390 và 843 húc đổ cổng Dinh Độc Lập diễn ra vào ngày nào trọn vẹn non sông?',
    options: ['30 tháng 4', '2 tháng 9', '19 tháng 5', '22 tháng 12'],
    correctAnswer: 'A',
    explanation: 'Ngày 30/4/1975 là ngày giải phóng hoàn toàn Miền Nam, thống nhất đất nước Việt Nam.',
    difficulty: 'de'
  },
  {
    id: 'lichsu_10',
    topic: 'lichsu',
    type: 'multiple-choice',
    questionText: 'Thương cảng sầm uất và nổi tiếng bậc nhất Đàng Trong Việt Nam trong thế kỷ XVII-XVIII ngày nay thuộc tỉnh nào?',
    options: ['Quảng Ninh', 'Hải Phòng', 'Quảng Nam', 'Thanh Hóa'],
    correctAnswer: 'C',
    explanation: 'Thương cảng Hội An lừng lẫy thu hút thương nhân Nhật Bản, Trung Hoa, phương Tây... ngày nay là đô thị cổ Hội An thuộc tỉnh Quảng Nam.',
    difficulty: 'trung-binh'
  },


  // === TOPIC: KHOA HỌC TỰ NHIÊN (khoahoc) ===
  {
    id: 'khoahoc_1',
    topic: 'khoahoc',
    type: 'multiple-choice',
    questionText: 'Nước ở thể lỏng hóa thành thể hơi được gọi là hiện tượng gì?',
    options: ['Sự ngưng tụ', 'Sự bay hơi', 'Sự nóng chảy', 'Sự đông đặc'],
    correctAnswer: 'B',
    explanation: 'Sự chuyển hóa từ chất lỏng sang chất khí ở bề mặt chất lỏng được gọi là sự bay hơi.',
    difficulty: 'de'
  },
  {
    id: 'khoahoc_2',
    topic: 'khoahoc',
    type: 'multiple-choice',
    questionText: 'Chất khí nào chiếm thể tích lớn nhất trong bầu khí quyển Trái Đất (chiếm khoảng 78%)?',
    options: ['Khí Oxy (Oxygen)', 'Khí Cacbonic (Carbon dioxide)', 'Khí Nitơ (Nitrogen)', 'Khí Hydro (Hydrogen)'],
    correctAnswer: 'C',
    explanation: 'Bầu khí quyển Trái Đất chứa khoảng 78% khí Nitơ (N₂), 21% khí Oxy (O₂), phần còn lại là Argon, Cacbonic và hơi nước.',
    difficulty: 'de'
  },
  {
    id: 'khoahoc_3',
    topic: 'khoahoc',
    type: 'multiple-choice',
    questionText: 'Bào quan nào được ví như "nhà máy năng lượng" của tế bào nhân thực, giúp hô hấp tế bào tạo ra ATP?',
    options: ['Bao myelin', 'Lục lạp', 'Ti thể', 'Nhân tế bào'],
    correctAnswer: 'C',
    explanation: 'Ti thể (Mitochondria) là nơi diễn ra các quá trình hô hấp tế bào sinh học để chuyển hóa chất hữu cơ thành năng lượng ATP nuôi cơ thể.',
    difficulty: 'trung-binh'
  },
  {
    id: 'khoahoc_4',
    topic: 'khoahoc',
    type: 'short-answer',
    questionText: 'Ký hiệu hóa học của nguyên tố Sắt (Iron) trong bảng tuần hoàn Mendeleev là gì?',
    correctAnswer: 'Fe',
    explanation: 'Sắt có ký hiệu hóa học là Fe, bắt nguồn từ tên Latinh Ferrum.',
    difficulty: 'de'
  },
  {
    id: 'khoahoc_5',
    topic: 'khoahoc',
    type: 'multiple-choice',
    questionText: 'Hành tinh nào gần Mặt Trời nhất trong Hệ Mặt Trời của chúng ta?',
    options: ['Sao Kim', 'Sao Thủy', 'Sao Hỏa', 'Trái Đất'],
    correctAnswer: 'B',
    explanation: 'Hệ Mặt Trời theo thứ tự từ gần nhất: Sao Thủy, Sao Kim, Trái Đất, Sao Hỏa, Sao Mộc, Sao Thổ, Sao Thiên Vương, Sao Hải Vương.',
    difficulty: 'de'
  },
  {
    id: 'khoahoc_6',
    topic: 'khoahoc',
    type: 'multiple-choice',
    questionText: 'Khi ánh sáng trắng đi qua lăng kính thủy tinh, nó bị phân tách thành dải màu đỏ, cam, vàng, lục, lam, chàm, tím. Đây là hiện tượng gì?',
    options: ['Hiện tượng phản xạ ánh sáng', 'Hiện tượng khúc xạ ánh sáng', 'Hiện tượng tán sắc ánh sáng', 'Hiện tượng giao thoa ánh sáng'],
    correctAnswer: 'C',
    explanation: 'Tán sắc ánh sáng là sự phân tách một chùm ánh sáng phức tạp (như ánh sáng trắng) thành các ánh sáng đơn sắc màu sắc khác nhau do chiết suất thủy tinh đổi theo bước sóng.',
    difficulty: 'trung-binh'
  },
  {
    id: 'khoahoc_7',
    topic: 'khoahoc',
    type: 'multiple-choice',
    questionText: 'Vì sao lá cây đa số có màu xanh lục?',
    options: ['Vì lá cây hấp thụ toàn bộ ánh sáng màu lục từ mặt trời', 'Vì trong lá cây có chứa bào quan lục lạp chứa chất diệp lục phản xạ ánh sáng xanh lục', 'Vì lá cây hút màu xanh từ mạch gỗ', 'Vì lá cây chứa sắc tố carotene'],
    correctAnswer: 'B',
    explanation: 'Chất diệp lục (chlorophyll) có trong lục lạp của lá cây hấp thụ hầu hết ánh sáng đỏ và ánh sáng lục-lam, nhưng phản xạ lại (không hấp thụ) ánh sáng màu lục, chiếu vào mắt người đọc khiến ta thấy lá xanh lục.',
    difficulty: 'trung-binh'
  },
  {
    id: 'khoahoc_8',
    topic: 'khoahoc',
    type: 'short-answer',
    questionText: 'Lực hút của Trái Đất tác dụng lên mọi vật thể được gọi là gì? (Nhập 1 danh từ thường, 2 chữ tiếng Việt)',
    correctAnswer: 'trọng lực',
    explanation: 'Trọng lực là lực hút của Trái Đất tác dụng lên các vật thể quanh nó, gây ra trọng lượng của vật thể.',
    difficulty: 'de'
  },
  {
    id: 'khoahoc_9',
    topic: 'khoahoc',
    type: 'multiple-choice',
    questionText: 'Độ pH của một dung dịch trung tính ở nhiệt độ phòng (25 độ C) bằng bao nhiêu?',
    options: ['0', '7', '14', '1'],
    correctAnswer: 'B',
    explanation: 'Dung dịch trung tính (như nước cất nguyên chất) có độ pH bằng 7. pH < 7 là axit, pH > 7 là bazơ.',
    difficulty: 'de'
  },
  {
    id: 'khoahoc_10',
    topic: 'khoahoc',
    type: 'multiple-choice',
    questionText: 'Trong hô hấp tế bào của sinh vật tiến hóa và động vật có vú, tế bào lấy khí nào từ máu và thải ra khí nào vào máu?',
    options: ['Lấy CO2 và thải O2', 'Lấy O2 và thải CO2', 'Lấy N2 và thải O2', 'Lấy O2 và thải H2O'],
    correctAnswer: 'B',
    explanation: 'Trong quá trình hô hấp, tế bào tiêu thụ Oxy (O₂) để phân giải các chất dinh dưỡng thành năng lượng, đồng thời thải ra Carbon dioxide (CO₂).',
    difficulty: 'de'
  }
];
