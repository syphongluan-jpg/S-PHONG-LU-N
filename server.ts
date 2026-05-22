import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { LOCAL_QUESTIONS } from './src/localQuestions';
import { Question } from './src/types';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK Lazily
let ai: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
    return null;
  }
  if (!ai) {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return ai;
}

// 1. Health endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', hasGeminiKey: !!process.env.GEMINI_API_KEY });
});

// Helper to scale subjects & instructions based on selected class/grade level
function getLevelDescription(studentClass: string) {
  const c = studentClass || '';
  if (['Lớp 1', 'Lớp 2', 'Lớp 3', 'Lớp 4', 'Lớp 5'].includes(c)) {
    return {
      tier: 'Tiểu học',
      mathDesc: 'Toán tiểu học đơn giản (phép tính cộng, trừ, nhân, chia, đo lường cấp tiểu học phát triển IQ)',
      scienceDesc: 'Tự nhiên và Xã hội cấp tiểu học (hiện tượng thiên nhiên cơ bản, động thực vật quang hợp, chăm sóc sức khỏe thường thức)',
      historyDesc: 'Sự kiện và nhân vật lịch sử Việt Nam nổi tiếng dễ tiếp thụ nhất (Thánh Gióng, Hai Bà Trưng, Ngô Quyền và sông Bạch Đằng, Đinh Bộ Lĩnh dẹp loạn...)',
      cadaoDesc: 'Ca dao tục ngữ về ông bà cha mẹ, trường lớp, tình bạn, lòng bao dung, rất rõ ràng và dễ nhớ',
      generalPrompt: 'Đặc biệt thiết kế ngôn từ trong sáng, nội dung rõ ràng, giản dị phù hợp hoàn toàn với tư duy trực quan của học sinh cấp Tiểu học.'
    };
  } else if (['Lớp 6', 'Lớp 7', 'Lớp 8', 'Lớp 9'].includes(c)) {
    return {
      tier: 'Trung học cơ sở (THCS)',
      mathDesc: 'Toán học cấp THCS (Hình học Euclid trực quan, số hữu tỉ, đại số cơ bản, phương trình bậc nhất, hệ thức lượng cơ bản, thống kê thực tế)',
      scienceDesc: 'Khoa học tự nhiên THCS (Khái niệm Vật lý lực và chuyển động, động năng cơ bản, Hóa học nguyên tố sơ khai, Sinh học tế bào thực vật động vật THCS)',
      historyDesc: 'Lịch sử THCS Việt Nam hào hùng (nhà Lý, nhà Trần chống Nguyên-Mông vĩ đại, nhà Lê, Nguyễn Huệ đại phá quân Thanh, kháng chiến chống ngoại xâm)',
      cadaoDesc: 'Ca dao tục ngữ dạy rèn luyện đạo đức con người, kinh nghiệm sản xuất, đời sống thời xưa chất chứa tinh thần hiếu nghĩa',
      generalPrompt: 'Sử dụng tư duy logic và kiến thức chuẩn mực thuộc khung chương trình sách giáo dục cấp THCS Việt Nam.'
    };
  } else if (['Lớp 10', 'Lớp 11', 'Lớp 12'].includes(c)) {
    return {
      tier: 'Trung học phổ thông (THPT)',
      mathDesc: 'Toán học cấp THPT (Hàm số lượng giác, đạo hàm và tích phân ứng dụng, tổ hợp và xác suất thống kê nâng cao, hình học không gian Oxyz lý thú)',
      scienceDesc: 'Khoa học tự nhiên THPT nâng cao (Di truyền học nhiễm sắc thể Mendel, hóa hữu cơ phân tử, sóng âm, dòng điện xoay chiều, cơ học Newton chuẩn xác)',
      historyDesc: 'Lịch sử THPT chuyên sâu (Địa chính trị Việt Nam, phong trào yêu nước cuối thế kỷ 19, lịch sử cận đại thế gian và cuộc cách mạng dân tộc thế kỷ 20)',
      cadaoDesc: 'Văn học dân gian ca dao tục ngữ sâu lắng, phân tích biện pháp ẩn dụ nghệ thuật giàu tính nghệ thuật và so sánh tu từ sâu sắc',
      generalPrompt: 'Yêu cầu tư duy học thuật THPT, có câu hỏi phân hóa đỉnh cao, lập luận lý thuyết bài bản rõ ràng.'
    };
  } else {
    // Đại học / College Tier
    return {
      tier: 'Đại học và Cao học chuyên sâu',
      mathDesc: 'Toán học cao cấp (Đại số tuyến tính không gian ma trận, vi tích phân đa biến lý thuyết toán tin, logic học, lý thuyết trò chơi đỉnh cao)',
      scienceDesc: 'Khoa học hiện đại vĩ mô và vi mô (Thuyết tương đối, cơ học lượng tử đại cương, công nghệ gen CRISPR, hóa học phân tích nâng cao, cơ học chất lưu)',
      historyDesc: 'Sử học so sánh biên niên cổ xưa tinh hoa chí tôn (Lịch sử ngoại giao khu vực, diễn tiến phong kiến phồn thịnh thế giới, khảo cứu chi tiết triều đại, tư liệu chép tay)',
      cadaoDesc: 'Cổ học dân gian học thuật triết lý phương Đông sâu xa (Khảo cứu tu từ đặc sắc trung đại, điển tích điển cố ẩn tế trong hệ thống ca dao tục ngữ cổ)',
      generalPrompt: 'Trình độ mang tính tổng hợp tri thức uyên bác, đố mẹo tư duy bách khoa đỉnh cao mang sắc thái nghiên cứu xuất chúng.'
    };
  }
}

// 2. Generate questions from topic
app.post('/api/generate-questions', async (req, res) => {
  const { topic, count = 10, excludeIds = [], difficulty = 'ngẫu nhiên', studentClass = 'Lớp 6' } = req.body;

  const validTopics = ['cadao', 'toanhoc', 'lichsu', 'khoahoc'];
  const topicCode = validTopics.includes(topic) ? topic : 'cadao';

  // Extract original raw IDs from client-mangled or PvP-mangled IDs
  const rawExcludeIds = (excludeIds || []).map((id: string) => {
    if (typeof id === 'string' && id.startsWith('client_')) {
      const parts = id.split('_');
      if (parts.length >= 5) {
        return parts.slice(3, -1).join('_');
      }
    }
    return id;
  });

  const client = getGeminiClient();
  if (!client) {
    // Offline mode: Filter and shuffle local questions
    console.log('Gemini API key is not configured or invalid. Using local question library.');
    const filtered = LOCAL_QUESTIONS.filter(q => q.topic === topicCode && !rawExcludeIds.includes(q.id));
    const pool = filtered.length > 0 ? filtered : LOCAL_QUESTIONS.filter(q => q.topic === topicCode);
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    const result = shuffled.slice(0, Math.min(count, shuffled.length));
    res.json({ source: 'local', questions: result });
    return;
  }

  try {
    const levelInfo = getLevelDescription(studentClass);
    
    let topicNameVi = '';
    if (topicCode === 'cadao') topicNameVi = `${levelInfo.cadaoDesc} (${levelInfo.tier})`;
    else if (topicCode === 'toanhoc') topicNameVi = `${levelInfo.mathDesc} (${levelInfo.tier})`;
    else if (topicCode === 'lichsu') topicNameVi = `${levelInfo.historyDesc} (${levelInfo.tier})`;
    else if (topicCode === 'khoahoc') topicNameVi = `${levelInfo.scienceDesc} (${levelInfo.tier})`;

    const systemInstruction = `Bạn là Hội đồng khảo thí cấp quốc gia hàng đầu Việt Nam. Bạn có nhiệm vụ tạo ra đề kiểm tra cấp bậc ${levelInfo.tier} hoàn mỹ nhất.`;
    const promptText = `Bạn hãy tạo danh sách gồm chính xác ${count} câu hỏi tiếng Việt thuộc chủ đề "${topicNameVi}".
Yêu cầu sư phạm khắt khe:
- Trình độ đối tượng: Thí sinh đang học ở trình độ '${studentClass}'. ${levelInfo.generalPrompt}
- Độ khó mong muốn: ${difficulty}. Nếu độ khó là "de" thì câu hỏi phải rất nền tảng cơ bản ở đối tượng này, nếu "thach-thuc" thì đòi hỏi suy luận cao độ.
- Tỉ lệ dạng câu hỏi: Khoảng 80% câu trắc nghiệm lựa chọn (type là 'multiple-choice' với 4 lựa chọn có đáp án nhiễu gài bẫy khéo léo nhưng logic trong 'options'), và 20% câu hỏi trả lời ngắn (type là 'short-answer', người chơi điền đáp án ngắn gọn ví dụ từ ngữ danh từ hoặc con số, options hãy để mảng rỗng []).
- Tránh trùng lặp với các câu hỏi có mã sau: [${rawExcludeIds.join(', ')}].
- Đáp án chính xác tuyệt đối, lời giải thích tại trường 'explanation' sâu sắc học thuật bằng tiếng Việt thân thiện, súc tích giúp thí sinh tăng cường tri thức hữu lý.
- Trường 'id' của câu hỏi phải là duy nhất dạng chuỗi ngẫu nhiên kết thúc bằng mã cấp lớp (ví dụ 'gemini_${topicCode}_${studentClass.replace(/\s+/g, '')}_x').
- Hãy trả về kết quả dưới dạng mảng JSON thô ghép khớp chuẩn chỉnh cấu trúc Schema.`;

    const response = await client.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: promptText,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING, description: 'Mã câu hỏi ngẫu nhiên duy nhất' },
              topic: { type: Type.STRING, description: 'Chủ đề: phải là "' + topicCode + '"' },
              type: { type: Type.STRING, description: '"multiple-choice" hoặc "short-answer"' },
              questionText: { type: Type.STRING, description: 'Nội dung câu hỏi rõ ràng' },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '4 lựa chọn nếu là multiple-choice, để rỗng nếu là short-answer'
              },
              correctAnswer: { type: Type.STRING, description: 'Nếu là trắc nghiệm chỉ nhận "A", "B", "C", "D". Nếu là câu hỏi ngắn thì điền chữ hoặc số đáp án chính xác ngắn gọn.' },
              explanation: { type: Type.STRING, description: 'Giải thích học thuật sâu sắc' },
              difficulty: { type: Type.STRING, description: 'Độ khó thực tế: "de", "trung-binh", "kho" hoặc "thach-thuc"' }
            },
            required: ['id', 'topic', 'type', 'questionText', 'correctAnswer', 'explanation', 'difficulty']
          }
        }
      }
    });

    const text = response.text;
    if (text) {
      const generatedQuestions = JSON.parse(text);
      // Ensure the topic matches requested code
      const standardized = generatedQuestions.map((q: any) => ({
        ...q,
        topic: q.topic || topicCode,
        options: q.type === 'multiple-choice' ? (q.options?.length === 4 ? q.options : ['A', 'B', 'C', 'D']) : []
      }));
      res.json({ source: 'gemini', questions: standardized });
    } else {
      throw new Error('Empty response from model');
    }
  } catch (error: any) {
    console.error('Error generating questions with Gemini:', error);
    // Fallback to local
    const filtered = LOCAL_QUESTIONS.filter(q => q.topic === topicCode && !rawExcludeIds.includes(q.id));
    const pool = filtered.length > 0 ? filtered : LOCAL_QUESTIONS.filter(q => q.topic === topicCode);
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    const result = shuffled.slice(0, Math.min(count, shuffled.length));
    res.json({ source: 'error-fallback', questions: result, error: error.message });
  }
});

// 3. Generate 50 questions for PvP with ascending difficulty (unlimited ceiling)
app.post('/api/generate-pvp-questions', async (req, res) => {
  const { studentClass = 'Lớp 6' } = req.body;
  const client = getGeminiClient();
  const topics = ['cadao', 'toanhoc', 'lichsu', 'khoahoc'];

  if (!client) {
    console.log(`Gemini API key not configured. Procedurally generating 50 PVP questions for ${studentClass} from local pool.`);
    // Generate 50 questions by repeating & shuffling the local pool and ramping up difficulty levels
    const pvpPool: Question[] = [];
    for (let i = 0; i < 50; i++) {
      const topic = topics[i % topics.length];
      const difficultyOrder: Array<'de' | 'trung-binh' | 'kho' | 'thach-thuc'> = ['de', 'trung-binh', 'kho', 'thach-thuc'];
      const targetDiff = difficultyOrder[Math.min(Math.floor(i / 12), 3)];
      
      const matched = LOCAL_QUESTIONS.filter(q => q.topic === topic && q.difficulty === targetDiff);
      const fallback = LOCAL_QUESTIONS.filter(q => q.topic === topic);
      const chosenTemplate = matched.length > 0 ? matched[Math.floor(Math.random() * matched.length)] : fallback[Math.floor(Math.random() * fallback.length)];
      
      // Procedurally mutate to make it distinct
      if (chosenTemplate.topic === 'toanhoc') {
        const factor = i + 1;
        const num1 = Math.floor(Math.random() * 20) + factor;
        const num2 = Math.floor(Math.random() * 20) + 10;
        const sum = num1 + num2;
        pvpPool.push({
          id: `procedural_pvp_${i}`,
          topic: 'toanhoc',
          type: 'multiple-choice',
          questionText: `[Xếp hạng PvP - ${studentClass} - Thử thách cấp ${factor}] Hãy tính kết quả phép toán nâng cao: ${num1} + ${num2}.`,
          options: [`${sum}`, `${sum - 2}`, `${sum + 5}`, `${sum + 1}`],
          correctAnswer: 'A',
          explanation: `Phép tính cộng ${num1} + ${num2} bằng ${sum} chuẩn kiến thức lớp học.`,
          difficulty: targetDiff
        });
      } else {
        pvpPool.push({
          ...chosenTemplate,
          id: `procedural_pvp_${i}_${chosenTemplate.id}`,
          questionText: `[Chinh phục PvP ${studentClass} Câu ${i + 1}] ${chosenTemplate.questionText}`
        });
      }
    }
    res.json({ source: 'procedural', questions: pvpPool });
    return;
  }

  try {
    const levelInfo = getLevelDescription(studentClass);
    const systemInstruction = `Bạn là vị giáo sư thủ khoa bách khoa vĩ đại nhất cuộc thi "Đấu trường Tri thức Việt Nam" phụ trách kỳ thi cấp bậc: ${levelInfo.tier}.`;
    const promptText = `Bạn hãy tạo danh sách câu hỏi gồm đúng chính xác 50 câu hỏi tiếng Việt cho trận đấu PVP Trí Tuệ Đỉnh Cao dành riêng cho đối tượng thí sinh có học lực tầm lớp: "${studentClass}".
Yêu cầu biên soạn cực kỳ khắt khe:
- Kiến thức & kỹ năng cần gài bẫy lắt léo xoay quanh trình độ "${studentClass}". ${levelInfo.generalPrompt}
- Đề khảo nghiệm nằm rải rác đan xen ở cả 4 chủ đề môn học: 'cadao', 'toanhoc', 'lichsu', 'khoahoc'.
- Độ khó leo thang tăng tiến: Tăng dần đều từ dễ đối với cấp học này (câu 1-10: 'de') -> trung bình nâng cao một chút (câu 11-25: 'trung-binh') -> nâng cao khó khăn (câu 26-40: 'kho') -> cấp bậc vũ trụ siêu việt vượt giới hạn đỉnh cao dành cho học sinh giỏi đại diện lớp mẫu mực (câu 41-50: 'thach-thuc').
- Tỉ lệ cấu trúc câu hỏi: Gồm đúng 40 câu trắc nghiệm (mảng options chứa đúng 4 đáp án gây nhiễu tốt, correctAnswer là "A", "B", "C" hoặc "D") và 10 câu hỏi tự điền đáp án ngắn (type là "short-answer", options để mảng rỗng []).
- Hãy trả về một danh sách JSON chuẩn khớp tuyệt đối với schema cấu trúc Question.`;

    const response = await client.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: promptText,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              topic: { type: Type.STRING, description: 'Một trong bốn giá trị: "cadao" | "toanhoc" | "lichsu" | "khoahoc"' },
              type: { type: Type.STRING, description: '"multiple-choice" hoặc "short-answer"' },
              questionText: { type: Type.STRING },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              correctAnswer: { type: Type.STRING, description: 'Nếu multiple-choice thì "A", "B", "C", hoặc "D". Nếu short-answer thì viết câu đáp án chính xác ngắn gọn.' },
              explanation: { type: Type.STRING },
              difficulty: { type: Type.STRING }
            },
            required: ['id', 'topic', 'type', 'questionText', 'correctAnswer', 'explanation', 'difficulty']
          }
        }
      }
    });

    const text = response.text;
    if (text) {
      const generated = JSON.parse(text);
      if (generated.length === 50) {
        res.json({ source: 'gemini-pvp', questions: generated });
      } else {
        // If length is slightly off, pad or truncate
        res.json({ source: 'gemini-pvp-partial', questions: generated.slice(0, 50) });
      }
    } else {
      throw new Error('Empty response from model');
    }
  } catch (error: any) {
    console.error('Error generating PvP questions with Gemini:', error);
    // Fallback to procedurally generated 50 questions
    const pvpPool: Question[] = [];
    for (let i = 0; i < 50; i++) {
      const topic = topics[i % topics.length];
      const targetDiff = i < 15 ? 'de' : i < 30 ? 'trung-binh' : i < 42 ? 'kho' : 'thach-thuc';
      const fallback = LOCAL_QUESTIONS.filter(q => q.topic === topic);
      const chosenTemplate = fallback[Math.floor(Math.random() * fallback.length)];
      pvpPool.push({
        ...chosenTemplate,
        id: `procedural_pvp_${i}_${chosenTemplate.id}`,
        questionText: `[Chinh phục PvP ${studentClass} Câu ${i + 1}] ${chosenTemplate.questionText}`,
        difficulty: targetDiff
      });
    }
    res.json({ source: 'fallback', questions: pvpPool });
  }
});

// Dynamic Vite and Static File Server setup
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server fully functional on http://0.0.0.0:${PORT}`);
  });
}

startServer();
