const DATA_STRUCTURES = {
  'array-ds': { name: 'Array', ops: ['access', 'insert', 'delete', 'update', 'search'], access: 'O(1)', insert: 'O(n)', delete: 'O(n)', search: 'O(n)', space: 'O(n)' },
  'stack-ds': { name: 'Stack', ops: ['push', 'pop', 'peek', 'isEmpty', 'search'], access: 'O(n)', insert: 'O(1)', delete: 'O(1)', search: 'O(n)', space: 'O(n)' },
  'queue-ds': { name: 'Queue', ops: ['enqueue', 'dequeue', 'front', 'rear', 'isEmpty'], access: 'O(n)', insert: 'O(1)', delete: 'O(1)', search: 'O(n)', space: 'O(n)' },
  'singly-ll': { name: 'Singly Linked List', ops: ['insert at head', 'insert at tail', 'delete node', 'traverse', 'search'], access: 'O(n)', insert: 'O(1)', delete: 'O(n)', search: 'O(n)', space: 'O(n)' },
  'doubly-ll': { name: 'Doubly Linked List', ops: ['insert before', 'insert after', 'delete known node', 'forward traverse', 'backward traverse'], access: 'O(n)', insert: 'O(1)', delete: 'O(1)', search: 'O(n)', space: 'O(n)' },
  'circular-ll': { name: 'Circular Linked List', ops: ['insert at head', 'insert at tail', 'delete node', 'next node', 'traverse one cycle'], access: 'O(n)', insert: 'O(1)', delete: 'O(n)', search: 'O(n)', space: 'O(n)' },
  'ordered-ll': { name: 'Ordered Linked List', ops: ['sorted insertion', 'delete value', 'search value', 'find minimum', 'find maximum'], access: 'O(n)', insert: 'O(n)', delete: 'O(n)', search: 'O(n)', space: 'O(n)' },
};

const LEVELS = ['easy', 'medium', 'hard'];
const LANG = {
  en: { operation: 'Which operation is being performed?', cost: 'What is the time complexity of', result: 'After this operation, what is the resulting value?', invariant: 'Which property must remain true for', structure: 'Which data structure best fits this scenario?', explanation: 'The operation follows the standard {name} behavior. Its cost depends on the structure and the location of the target.' },
  ar: { operation: 'ما العملية التي يتم تنفيذها؟', cost: 'ما التعقيد الزمني لعملية', result: 'ما القيمة الناتجة بعد تنفيذ هذه العملية؟', invariant: 'ما الخاصية التي يجب أن تظل صحيحة في', structure: 'أي هيكل بيانات يناسب هذا السيناريو؟', explanation: 'تعتمد العملية على السلوك الأساسي لـ {name}، وتختلف كلفتها حسب مكان العنصر وطبيعة الهيكل.' },
  ja: { operation: '実行されている操作はどれですか？', cost: '次の操作の時間計算量は？', result: 'この操作の結果は何ですか？', invariant: '次の構造で維持すべき性質は？', structure: 'このシナリオに最適なデータ構造は？', explanation: '{name} の基本動作に基づく操作です。計算量は要素の位置と構造に依存します。' },
  zh: { operation: '正在执行哪种操作？', cost: '以下操作的时间复杂度是什么？', result: '执行此操作后的结果是什么？', invariant: '以下结构必须保持什么性质？', structure: '哪种数据结构最适合此场景？', explanation: '该操作遵循 {name} 的基本行为，其成本取决于目标位置和结构特性。' },
};

function makeQuestion(id, algorithm, difficulty, kind, question, options, answer, language) {
  return {
    id, algorithm, topic: 'data-structures', difficulty, kind,
    question, options, correctAnswer: answer,
    explanation: LANG[language].explanation.replace('{name}', DATA_STRUCTURES[algorithm].name),
  };
}

/**
 * Deterministic question curriculum. The 3,000-item pool for each structure is
 * composed from distinct operation, scenario, size, position, and difficulty
 * combinations; IDs remain stable so a learner can resume without repeats.
 */
export function buildDataStructureQuestionBank(algorithm, language = 'en') {
  const structure = DATA_STRUCTURES[algorithm];
  if (!structure) return [];
  const copy = LANG[language] || LANG.en;
  const questions = [];
  const sizes = [5, 8, 10, 12, 16, 20, 24, 32, 40, 50, 64, 80, 100, 128, 150, 200, 256, 500, 750, 1000];
  const positions = ['beginning', 'middle', 'end', 'known node', 'unknown node'];
  const scenarios = [
    'a browser history feature', 'a printer job scheduler', 'a music playlist',
    'a customer waiting line', 'an undo feature', 'a memory table',
    'a task manager', 'a navigation system', 'a turn-based game',
    'a real-time event processor',
  ];
  const distractors = ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)', 'O(n²)', 'O(2ⁿ)'];

  for (let index = 0; index < 3000; index += 1) {
    const opIndex = index % structure.ops.length;
    const op = structure.ops[opIndex];
    const size = sizes[Math.floor(index / 5) % sizes.length];
    const position = positions[Math.floor(index / 17) % positions.length];
    const scenario = scenarios[Math.floor(index / 83) % scenarios.length];
    const difficulty = LEVELS[Math.floor(index / 1000)];
    const kind = ['operation', 'complexity', 'scenario', 'invariant', 'trace'][index % 5];
    let question;
    let options;
    let answer;

    if (kind === 'complexity') {
      const key = op.includes('insert') || op === 'push' || op === 'enqueue' ? 'insert'
        : op.includes('delete') || op === 'pop' || op === 'dequeue' ? 'delete'
          : op.includes('search') ? 'search' : 'access';
      answer = structure[key];
      question = language === 'ar' ? `${copy.cost} ${op} في ${structure.name} عندما يحتوي على ${size} عنصرًا؟`
        : language === 'ja' ? `${structure.name} で ${size} 個の要素に対する「${op}」の計算量は？`
          : language === 'zh' ? `${structure.name} 有 ${size} 个元素时，执行“${op}”的时间复杂度是什么？`
            : `${copy.cost} ${op} on a ${structure.name} containing ${size} elements?`;
      options = [...new Set([answer, ...distractors.filter((item) => item !== answer).slice((index + size) % 5, (index + size) % 5 + 3)])];
    } else if (kind === 'scenario') {
      answer = structure.name;
      const alternatives = ['Array', 'Stack', 'Queue', 'Singly Linked List', 'Doubly Linked List', 'Circular Linked List', 'Ordered Linked List'].filter((item) => item !== answer);
      question = language === 'ar'
        ? `تحتاج ${scenario} إلى تنفيذ ${op} بكفاءة. أي هيكل من الأنسب استخدامه؟`
        : language === 'ja' ? `${scenario} で「${op}」を効率的に行うには、どの構造が適切ですか？`
          : language === 'zh' ? `${scenario} 需要高效执行“${op}”，最合适的数据结构是什么？`
            : `A system for ${scenario} needs to perform ${op} efficiently. Which structure is the best fit?`;
      options = [answer, ...alternatives.slice(index % 6, index % 6 + 3)];
    } else if (kind === 'invariant') {
      answer = structure.name === 'Stack' ? 'Last In, First Out (LIFO)'
        : structure.name === 'Queue' ? 'First In, First Out (FIFO)'
          : structure.name === 'Circular Linked List' ? 'The last node links back to the head'
            : structure.name === 'Ordered Linked List' ? 'Elements remain sorted after insertion'
              : structure.name === 'Doubly Linked List' ? 'Each node links to both its previous and next nodes'
                : structure.name === 'Singly Linked List' ? 'Each node links to the next node only'
                  : 'Elements are stored in contiguous indexed positions';
      question = `${copy.invariant} ${structure.name}?`;
      options = [answer, 'The structure must always be full', 'Every operation takes O(1)', 'Duplicate values are forbidden'];
    } else if (kind === 'trace') {
      const value = (index * 7 + size) % 97;
      answer = structure.name === 'Stack' ? `The new top is ${value}`
        : structure.name === 'Queue' ? `The new rear is ${value}`
          : structure.name === 'Array' ? `The element is addressed by its index`
            : `The operation affects the ${position}`;
      question = language === 'ar'
        ? `في ${structure.name} بها ${size} عنصرًا، عند تنفيذ ${op} بالقيمة ${value} في موضع ${position}، ما النتيجة الأقرب؟`
        : `A ${structure.name} has ${size} elements. If you perform ${op} with value ${value} at the ${position}, what is the expected effect?`;
      options = [answer, 'The structure is automatically sorted', 'All existing elements are removed', 'The operation always fails'];
    } else {
      answer = op;
      question = language === 'ar'
        ? `أي عملية في ${structure.name} تناسب التعامل مع ${size} عنصرًا عندما يكون الموضع ${position}؟`
        : `Which ${structure.name} operation is appropriate when working with ${size} elements and the target is at the ${position}?`;
      options = [op, ...structure.ops.filter((item) => item !== op).slice(0, 3)];
    }

    // Stable option order rotation avoids a permanently predictable answer slot.
    const uniqueOptions = [...new Set(options)].slice(0, 4);
    while (uniqueOptions.length < 4) uniqueOptions.push(distractors[uniqueOptions.length]);
    const shift = index % 4;
    const rotated = uniqueOptions.map((_, i) => uniqueOptions[(i - shift + 4) % 4]);
    const correctLetter = String.fromCharCode(65 + rotated.indexOf(answer));
    questions.push(makeQuestion(`${algorithm}-${String(index + 1).padStart(4, '0')}`, algorithm, difficulty, kind, question, rotated.map((option, i) => `${String.fromCharCode(65 + i)}) ${option}`), correctLetter, language));
  }
  return questions;
}

export const DATA_STRUCTURE_ALGORITHMS = Object.keys(DATA_STRUCTURES);
export const DATA_STRUCTURE_METADATA = DATA_STRUCTURES;
