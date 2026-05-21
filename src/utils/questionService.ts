import { Question } from '../types';
import { LOCAL_QUESTIONS } from '../localQuestions';

// Utility helper to safely check if a value is in an array
function safeIncludes(arr: any, value: any): boolean {
  if (!arr || !Array.isArray(arr)) return false;
  return arr.includes(value);
}

// Map grade classes to appropriate level information
export function getGradeLevelTier(studentClass: string) {
  const c = studentClass || '';
  if (['Lớp 1', 'Lớp 2', 'Lớp 3', 'Lớp 4', 'Lớp 5'].includes(c)) {
    return {
      tier: 'Tiểu học',
      difficulty: 'de' as const,
      prefix: '[Cơ bản Tiểu Học] 🍼'
    };
  } else if (['Lớp 6', 'Lớp 7', 'Lớp 8', 'Lớp 9'].includes(c)) {
    return {
      tier: 'THCS',
      difficulty: 'trung-binh' as const,
      prefix: '[THCS Học tập] 🎒'
    };
  } else if (['Lớp 10', 'Lớp 11', 'Lớp 12'].includes(c)) {
    return {
      tier: 'THPT',
      difficulty: 'kho' as const,
      prefix: '[Nâng cao THPT] ⚡'
    };
  } else {
    return {
      tier: 'Đại Học',
      difficulty: 'thach-thuc' as const,
      prefix: '[Trí tuệ Đại Học] 👑'
    };
  }
}

// Procedural Maths generator based on grade class
export function generateProceduralMathQuestion(index: number, studentClass: string): Question {
  const factor = index + 1;
  const c = studentClass || '';
  
  if (['Lớp 1', 'Lớp 2', 'Lớp 3', 'Lớp 4', 'Lớp 5'].includes(c)) {
    // Primary School maths: Simple add/sub/mul
    const op = Math.random() > 0.5 ? '+' : '*';
    if (op === '+') {
      const num1 = Math.floor(Math.random() * 50) + 10;
      const num2 = Math.floor(Math.random() * 40) + 5;
      const ans = num1 + num2;
      return {
        id: `procedural_math_primary_${index}_${Date.now()}`,
        topic: 'toanhoc',
        type: 'multiple-choice',
        questionText: `[Toán Học Tiểu Học - Cấp ${factor}] Kết quả phép tính: ${num1} + ${num2} bằng bao nhiêu?`,
        options: [`${ans}`, `${ans - 3}`, `${ans + 4}`, `${ans + 1}`],
        correctAnswer: 'A',
        explanation: `Phép cộng cơ bản giữa hai số tự nhiên: ${num1} + ${num2} = ${ans}.`,
        difficulty: 'de'
      };
    } else {
      const num1 = Math.floor(Math.random() * 9) + 2;
      const num2 = Math.floor(Math.random() * 9) + 2;
      const ans = num1 * num2;
      return {
        id: `procedural_math_primary_mul_${index}_${Date.now()}`,
        topic: 'toanhoc',
        type: 'multiple-choice',
        questionText: `[Toán Học Tiểu Học - Cấp ${factor}] Đố bạn biết kết quả bảng cửu chương: ${num1} x ${num2} bằng mấy?`,
        options: [`${ans + 2}`, `${ans}`, `${ans - 4}`, `${ans + 6}`],
        correctAnswer: 'B',
        explanation: `Theo bảng cửu chương, phép nhân ${num1} x ${num2} có kết quả là ${ans}.`,
        difficulty: 'de'
      };
    }
  } else if (['Lớp 10', 'Lớp 11', 'Lớp 12'].includes(c)) {
    // High school maths: Equations, trigonometry, log
    const num = Math.floor(Math.random() * 10) + 2;
    const ans = num * num;
    return {
      id: `procedural_math_thpt_${index}_${Date.now()}`,
      topic: 'toanhoc',
      type: 'multiple-choice',
      questionText: `[Toán Học THPT - Cấp ${factor}] Nghiệm dương của phương trình logarit: log_2(x^2 - ${ans - 4}) = 2 là:`,
      options: [`x = ${num + 2}`, `x = ${num}`, `x = ${num - 1}`, `x = ${num + 1}`],
      correctAnswer: 'B',
      explanation: `log_2(x^2 - ${ans - 4}) = 2 <=> x^2 - ${ans - 4} = 2^2 = 4 <=> x^2 = ${ans} <=> x = ${num} (do lấy nghiệm dương).`,
      difficulty: 'kho'
    };
  } else if (c === 'Đại Học') {
    // University maths: matrices, limit, derivative
    const a = Math.floor(Math.random() * 5) + 1;
    const b = Math.floor(Math.random() * 5) + 1;
    const det = a * 4 - b * 3;
    return {
      id: `procedural_math_uni_${index}_${Date.now()}`,
      topic: 'toanhoc',
      type: 'multiple-choice',
      questionText: `[Toán Cao Cấp Đại Học - Cấp ${factor}] Tính định thức (determinant) của ma trận vuông cấp hai A = [[${a}, 3], [${b}, 4]]:`,
      options: [`det(A) = ${det + 2}`, `det(A) = ${det - 1}`, `det(A) = ${det}`, `det(A) = 0`],
      correctAnswer: 'C',
      explanation: `Định thức ma trận 2x2 là: a*d - b*c = ${a} * 4 - 3 * ${b} = ${det}.`,
      difficulty: 'thach-thuc'
    };
  } else {
    // Standard Junior High (THCS) maths: Algebra
    const val = Math.floor(Math.random() * 15) + 3;
    return {
      id: `procedural_math_thcs_${index}_${Date.now()}`,
      topic: 'toanhoc',
      type: 'multiple-choice',
      questionText: `[Toán Học THCS - Cấp ${factor}] Tìm x biết phương trình: 3x - ${val * 3} = 0.`,
      options: [`x = ${val}`, `x = ${val + 2}`, `x = ${val - 1}`, `x = ${val + 1}`],
      correctAnswer: 'A',
      explanation: `Chuyển vế ta có: 3x = ${val * 3} <=> x = ${val * 3} / 3 = ${val}.`,
      difficulty: 'trung-binh'
    };
  }
}

// Generate a set of Normal questions adapted to student level completely client-side (no server required)
export function generateNormalQuestionsClient(
  topic: 'cadao' | 'toanhoc' | 'lichsu' | 'khoahoc',
  count: number = 10,
  excludeIds: string[] = [],
  studentClass: string = 'Lớp 6'
): Question[] {
  const topicCode = topic;
  const levelInfo = getGradeLevelTier(studentClass);
  const exclude = Array.isArray(excludeIds) ? excludeIds : [];

  // Filter pool by topic
  let filtered = LOCAL_QUESTIONS.filter(q => q.topic === topicCode && !safeIncludes(exclude, q.id));
  
  // If no questions left in filtered pool, fallback to entire topic
  let pool = filtered.length > 0 ? filtered : LOCAL_QUESTIONS.filter(q => q.topic === topicCode);
  
  // Try to sort pool by matching ideal difficulty for grade level
  const idealDiff = levelInfo.difficulty;
  const sortedPool = [...pool].sort((a, b) => {
    if (a.difficulty === idealDiff && b.difficulty !== idealDiff) return -1;
    if (a.difficulty !== idealDiff && b.difficulty === idealDiff) return 1;
    return 0;
  });

  // Shuffle and slice
  const shuffled = sortedPool.sort(() => 0.5 - Math.random());
  let selection = shuffled.slice(0, Math.min(count, shuffled.length));

  // If we selected maths topic, inject some procedurally generated grade-appropriate maths to make it truly unlimited
  if (topicCode === 'toanhoc') {
    selection = selection.map((q, idx) => {
      if (Math.random() > 0.4) {
        return generateProceduralMathQuestion(idx, studentClass);
      }
      return q;
    });
  }

  // Prepend localized visual badge according to class rank so user is aware the game matches their grade
  return selection.map((q, idx) => ({
    ...q,
    id: q.id.startsWith('procedural_') ? q.id : `client_${topicCode}_${studentClass.replace(/\s+/g, '')}_${q.id}_${idx}`,
    questionText: `${levelInfo.prefix} ${q.questionText}`
  }));
}

// Generate 50 PvP questions completely client-side spanning all topics and ramping up difficulty
export function generatePvPQuestionsClient(studentClass: string = 'Lớp 6'): Question[] {
  const pvpPool: Question[] = [];
  const topics: Array<'cadao' | 'toanhoc' | 'lichsu' | 'khoahoc'> = ['cadao', 'toanhoc', 'lichsu', 'khoahoc'];
  const levelInfo = getGradeLevelTier(studentClass);

  for (let i = 0; i < 50; i++) {
    const topic = topics[i % topics.length];
    
    // Ramp up difficulty:
    // q1-15: Easy ('de')
    // q16-30: Medium ('trung-binh')
    // q31-42: Hard ('kho')
    // q43-50: Extreme challenge ('thach-thuc')
    const targetDiff: 'de' | 'trung-binh' | 'kho' | 'thach-thuc' = 
      i < 15 ? 'de' : i < 30 ? 'trung-binh' : i < 42 ? 'kho' : 'thach-thuc';
    
    if (topic === 'toanhoc') {
      // Create spectacular procedural math scaled to level and index difficulty
      const mathQ = generateProceduralMathQuestion(i, studentClass);
      pvpPool.push({
        ...mathQ,
        id: `procedural_pvp_${i}_${Date.now()}`,
        questionText: `⚔️ [Chinh phục PvP ${levelInfo.tier} - Câu ${i + 1}] ${mathQ.questionText.replace(/\[.*?\]\s*/g, '')}`,
        difficulty: targetDiff
      });
    } else {
      // Pull and modify template
      const candidates = LOCAL_QUESTIONS.filter(q => q.topic === topic && q.difficulty === targetDiff);
      const fallback = LOCAL_QUESTIONS.filter(q => q.topic === topic);
      const chosenTemplate = candidates[Math.floor(Math.random() * candidates.length)] || 
                             fallback[Math.floor(Math.random() * fallback.length)] || 
                             LOCAL_QUESTIONS[0];

      pvpPool.push({
        ...chosenTemplate,
        id: `client_pvp_${i}_${chosenTemplate.id}_${Date.now()}`,
        questionText: `⚔️ [Chinh phục PvP ${levelInfo.tier} - Câu ${i + 1}] ${chosenTemplate.questionText}`,
        difficulty: targetDiff
      });
    }
  }

  return pvpPool;
}

// Highly reliable Unified Question Fetcher with smart service fallbacks
export async function fetchNormalQuestions(
  topic: 'cadao' | 'toanhoc' | 'lichsu' | 'khoahoc',
  count: number = 10,
  excludeIds: string[] = [],
  studentClass: string = 'Lớp 6'
): Promise<Question[]> {
  try {
    // Skip server call if we are running the application purely offline or static (e.g. Netlify/Vercel/GitHub Pages)
    const hostname = window.location.hostname;
    const isStaticHost = hostname.includes('netlify.app') || 
                         hostname.includes('vercel.app') || 
                         hostname.includes('github.io') ||
                         hostname.includes('localhost') === false && hostname.indexOf('.') !== -1 && !hostname.endsWith('.run.app');

    if (isStaticHost) {
      console.log('Static hosting detected. Generating high-quality questions on the client side directly.');
      return generateNormalQuestionsClient(topic, count, excludeIds, studentClass);
    }

    const response = await fetch('/api/generate-questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic,
        count,
        excludeIds,
        difficulty: 'ngẫu nhiên',
        studentClass
      })
    });

    if (!response.ok) {
      throw new Error('Status not ok');
    }

    // Double check that we actually got JSON (and not index.html SPA content)
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      throw new Error('Server returned HTML instead of JSON');
    }

    const data = await response.json();
    if (data && data.questions && data.questions.length > 0) {
      return data.questions;
    }
    
    throw new Error('Server returned empty array');
  } catch (err) {
    console.warn('Backend server unreachable or returned invalid response, using local question generator fallback:', err);
    return generateNormalQuestionsClient(topic, count, excludeIds, studentClass);
  }
}

// Highly reliable PvP Question Fetcher with smart service fallbacks
export async function fetchPvPQuestions(studentClass: string = 'Lớp 6'): Promise<Question[]> {
  try {
    const hostname = window.location.hostname;
    const isStaticHost = hostname.includes('netlify.app') || 
                         hostname.includes('vercel.app') || 
                         hostname.includes('github.io') ||
                         hostname.includes('localhost') === false && hostname.indexOf('.') !== -1 && !hostname.endsWith('.run.app');

    if (isStaticHost) {
      console.log('Static hosting detected. Generating 50 PvP questions client-side.');
      return generatePvPQuestionsClient(studentClass);
    }

    const response = await fetch('/api/generate-pvp-questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentClass })
    });

    if (!response.ok) {
      throw new Error('Status not ok');
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      throw new Error('Server returned HTML instead of JSON');
    }

    const data = await response.json();
    if (data && data.questions && data.questions.length > 0) {
      return data.questions;
    }

    throw new Error('Server returned empty array');
  } catch (err) {
    console.warn('Backend PvP service call failed, generating PvP array on client:', err);
    return generatePvPQuestionsClient(studentClass);
  }
}
