// ── Practice topic registry ─────────────────────────────────────────────────
// Single source of truth for the practice hub. Each topic module is loaded on
// demand, so the question text never ships in the initial bundle. Content lives
// in this folder (not a separate service) so practice keeps working offline;
// the schema is stable enough to extract into its own package later.

export const PRACTICE_COURSES = [
  { id: 'data-structure', color: 'blue' },
  { id: 'advanced-data-structure', color: 'gold' },
  { id: 'algorithms', color: 'emerald' },
  { id: 'operating-systems', color: 'coral' },
  { id: 'information-theory-compression', color: 'violet' },
];

export const PRACTICE_TOPICS = [
  { id: 'arrays', course: 'data-structure', icon: 'array', labelKey: 'catalog:topic.arrays.title', descriptionKey: 'catalog:topic.arrays.description', questionCount: 200 },
  { id: 'stacks', course: 'data-structure', icon: 'stack', labelKey: 'catalog:topic.stacks.title', descriptionKey: 'catalog:topic.stacks.description', questionCount: 200 },
  { id: 'queues', course: 'data-structure', icon: 'queue', labelKey: 'catalog:topic.queues.title', descriptionKey: 'catalog:topic.queues.description', questionCount: 200 },
  { id: 'linked-lists', course: 'data-structure', icon: 'linked', labelKey: 'catalog:topic.linked-lists.title', descriptionKey: 'catalog:topic.linked-lists.description', questionCount: 200 },
  { id: 'sorting', course: 'data-structure', icon: 'sorting', labelKey: 'catalog:topic.sorting.title', descriptionKey: 'catalog:topic.sorting.description', questionCount: 200 },
  { id: 'searching', course: 'data-structure', icon: 'search', labelKey: 'catalog:topic.searching.title', descriptionKey: 'catalog:topic.searching.description', questionCount: 200 },
  { id: 'graphs', course: 'data-structure', icon: 'graph', labelKey: 'catalog:topic.graphs.title', descriptionKey: 'catalog:topic.graphs.description', questionCount: 200 },
  { id: 'hashing', course: 'data-structure', icon: 'hash', labelKey: 'catalog:topic.hashing.title', descriptionKey: 'catalog:topic.hashing.description', questionCount: 200 },
  { id: 'trees', course: 'advanced-data-structure', icon: 'tree', labelKey: 'practice:hub.topics.trees', descriptionKey: 'practice:hub.topicDescriptions.trees', questionCount: 200 },
  { id: 'trie-suffix', course: 'advanced-data-structure', icon: 'string', labelKey: 'practice:hub.topics.trie-suffix', descriptionKey: 'practice:hub.topicDescriptions.trie-suffix', questionCount: 200 },
  { id: 'dynamic-programming', course: 'algorithms', icon: 'grid', labelKey: 'catalog:topic.dynamic-programming.title', descriptionKey: 'catalog:topic.dynamic-programming.description', questionCount: 200 },
  { id: 'greedy', course: 'algorithms', icon: 'zap', labelKey: 'catalog:topic.greedy.title', descriptionKey: 'catalog:topic.greedy.description', questionCount: 200 },
  { id: 'cpu-scheduling', course: 'operating-systems', icon: 'cpu', labelKey: 'catalog:topic.cpu-scheduling.title', descriptionKey: 'catalog:topic.cpu-scheduling.description', questionCount: 200 },
  { id: 'compression', course: 'information-theory-compression', icon: 'archive', labelKey: 'practice:hub.topics.compression', descriptionKey: 'practice:hub.topicDescriptions.compression', questionCount: 200 },
];

const LOADERS = {
  arrays: () => import('./topics/dataStructures.js').then((module) => module.buildDataStructureTopic('arrays')),
  stacks: () => import('./topics/dataStructures.js').then((module) => module.buildDataStructureTopic('stacks')),
  queues: () => import('./topics/dataStructures.js').then((module) => module.buildDataStructureTopic('queues')),
  'linked-lists': () => import('./topics/dataStructures.js').then((module) => module.buildDataStructureTopic('linked-lists')),
  sorting: () => import('./topics/sortingSearching.js').then((module) => module.buildSortingQuestions()),
  searching: () => import('./topics/sortingSearching.js').then((module) => module.buildSearchingQuestions()),
  graphs: () => import('./topics/graphs.js').then((module) => module.buildGraphsQuestions()),
  hashing: () => import('./topics/hashing.js').then((module) => module.buildHashingQuestions()),
  trees: () => import('./topics/trees.js').then((module) => module.buildTreesQuestions()),
  'trie-suffix': () => import('./topics/strings.js').then((module) => module.buildStringQuestions()),
  'dynamic-programming': () => import('./topics/algorithms.js').then((module) => module.buildDynamicProgrammingQuestions()),
  greedy: () => import('./topics/algorithms.js').then((module) => module.buildGreedyQuestions()),
  'cpu-scheduling': () => import('./topics/scheduling.js').then((module) => module.buildSchedulingQuestions()),
  compression: () => import('./topics/compression.js').then((module) => module.buildCompressionQuestions()),
};

const cache = new Map();

export function getPracticeTopic(topicId) {
  return PRACTICE_TOPICS.find((topic) => topic.id === topicId) ?? null;
}

/** Load (and cache) one topic's questions. Returns [] for unknown topic ids. */
export async function loadPracticeTopic(topicId) {
  if (cache.has(topicId)) return cache.get(topicId);
  const loader = LOADERS[topicId];
  if (!loader) return [];
  const questions = await loader();
  cache.set(topicId, questions);
  return questions;
}

export function shuffleQuestionSet(questions, limit = Infinity) {
  const copy = [...questions];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return Number.isFinite(limit) ? copy.slice(0, limit) : copy;
}

/** Pick a balanced session: respect the requested difficulty when possible. */
export function buildSessionPool(questions, difficulty = 'mixed') {
  if (difficulty === 'mixed') return questions;
  const filtered = questions.filter((question) => question.difficulty === difficulty);
  return filtered.length >= 5 ? filtered : questions;
}
