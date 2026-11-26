// ── Practice bank: hashing ─────────────────────────────────────────────────
// Slot numbers, probe sequences and collision counts come from real traces of
// the same strategies the visualizer implements (chaining, linear/quadratic
// probing and double hashing).

import { conceptBatch, list, makeRng, mcq, randInt, uniqueBy } from '../core.js';

const TOPIC = 'hashing';

const HASH_CONCEPTS = [
  { lvl: 'easy', q: 'What is the average-case time of a successful lookup in a hash table?', a: 'O(1)', d: ['O(n)', 'O(log n)', 'O(n log n)'], e: 'With a good hash function and low load factor, probes stay constant on average.' },
  { lvl: 'medium', q: 'What is the worst-case time of a hash table lookup?', a: 'O(n)', d: ['O(1)', 'O(log n)', 'O(n log n)'], e: 'If every key collides into one bucket, the bucket becomes a linear list.' },
  { lvl: 'medium', q: 'What is the load factor of a hash table?', a: 'Number of stored keys ÷ number of buckets', d: ['Number of buckets ÷ number of keys', 'Number of collisions ÷ probes', 'Table size × key size'], e: 'Load factor α = n / m measures how full the table is.' },
  { lvl: 'medium', q: 'What happens to probe length as the load factor approaches 1 in open addressing?', a: 'It grows sharply', d: ['It stays constant', 'It decreases', 'It becomes zero'], e: 'Fewer free slots means longer probe sequences.' },
  { lvl: 'easy', q: 'What is a hash collision?', a: 'Two different keys mapping to the same bucket', d: ['A key mapping to itself', 'A table with no free slots', 'A deleted key'], e: 'Different keys can share the same hash value.' },
  { lvl: 'medium', q: 'How does separate chaining resolve collisions?', a: 'Each bucket stores a list of entries', d: ['Each key is rehashed to a new table', 'The table is sorted', 'The key is discarded'], e: 'Colliding keys are stored together in a bucket list.' },
  { lvl: 'medium', q: 'How does linear probing resolve a collision?', a: 'It checks the next slot repeatedly', d: ['It stores the key in a list', 'It doubles the table immediately', 'It drops the key'], e: 'Probing walks forward by one slot until a free position is found.' },
  { lvl: 'medium', q: 'What is primary clustering in linear probing?', a: 'Collisions create long runs of occupied slots', d: ['Keys are stored in sorted order', 'Two tables share buckets', 'All keys hash to the same value'], e: 'Runs of occupied slots make later probes longer.' },
  { lvl: 'hard', q: 'Which probing method reduces primary clustering?', a: 'Quadratic probing', d: ['Linear probing', 'Chaining with sorted lists', 'Rehashing on every insert'], e: 'Quadratic steps spread keys out instead of forming contiguous runs.' },
  { lvl: 'medium', q: 'What is double hashing?', a: 'A second hash function determines the probe step', d: ['Hashing the key twice into two tables', 'Using two tables of different sizes', 'Storing each key twice'], e: 'The step depends on the key, so probe sequences differ.' },
  { lvl: 'hard', q: 'How many probe sequences does double hashing offer for a table of size m, assuming a valid step?', a: 'Up to m distinct sequences', d: ['Exactly 1', 'Exactly 2', 'Only m / 2'], e: 'A step coprime with m visits every slot, giving different orders per key.' },
  { lvl: 'medium', q: 'What is a tombstone in an open-addressed table?', a: 'A marker for a deleted slot', d: ['A slot that was never used', 'A permanently reserved bucket', 'A duplicate key'], e: 'Tombstones keep probe sequences intact while allowing reuse.' },
  { lvl: 'medium', q: 'Why can a deleted slot not simply become empty in linear probing?', a: 'It would break the probe chain for later keys', d: ['It would change the table size', 'It would delete the key twice', 'It would sort the table'], e: 'Later keys may have probed past that slot.' },
  { lvl: 'medium', q: 'When is rehashing needed?', a: 'When the load factor becomes too high', d: ['After every deletion', 'When the table is empty', 'Only when the table is full'], e: 'Growing the table restores short probe sequences.' },
  { lvl: 'hard', q: 'What is the cost of inserting n keys into an initially empty chained table if rehashing doubles capacity?', a: 'O(n) expected total', d: ['O(n²)', 'O(n log² n)', 'O(1)'], e: 'Each key is rehashed at most a constant number of times amortized.' },
  { lvl: 'medium', q: 'Which property must a good hash function have?', a: 'It distributes keys uniformly across buckets', d: ['It sorts keys', 'It returns sequential indexes', 'It never returns 0'], e: 'Uniform distribution minimizes collisions.' },
  { lvl: 'medium', q: 'What is a perfect hash function?', a: 'A collision-free mapping for a fixed key set', d: ['A function that hashes any key in O(1)', 'A function with no modulo operation', 'A random function'], e: 'Perfect hashing is built for a known, fixed set of keys.' },
  { lvl: 'medium', q: 'Why should a hash table size often be prime?', a: 'It spreads keys better for modulo-based hashing', d: ['It makes the table faster to allocate', 'It removes the need for collisions', 'It makes keys sorted'], e: 'Prime sizes avoid patterns when keys share factors with the table size.' },
  { lvl: 'medium', q: 'What does h(k) = k mod m produce for negative keys if implemented naively?', a: 'A negative index', d: ['Always zero', 'A value larger than m', 'A sorted index'], e: 'The result must be normalized into 0 … m − 1.' },
  { lvl: 'medium', q: 'Which collision strategy can exceed the table capacity?', a: 'Separate chaining', d: ['Linear probing', 'Quadratic probing', 'Double hashing'], e: 'Chained buckets store any number of entries, usually in nodes.' },
  { lvl: 'medium', q: 'What is the expected number of probes for a successful search with chaining and load factor α?', a: 'About 1 + α / 2', d: ['About α²', 'Exactly 1', 'About n'], e: 'The average list length is α, and the match is found about halfway through.' },
  { lvl: 'hard', q: 'What is the expected number of probes for an unsuccessful search with linear probing?', a: 'About ½(1 + 1/(1 − α)²)', d: ['About 1 + α', 'Exactly 1', 'About log₂ n'], e: 'Clustering makes unsuccessful probes grow with 1/(1 − α)².' },
  { lvl: 'medium', q: 'Which keys collide under h(k) = k mod 10?', a: '15, 25 and 35', d: ['15, 26 and 37', '10, 20 and 30', '1, 2 and 3'], e: 'All three have remainder 5.' },
  { lvl: 'medium', q: 'What is the bucket index of key 47 in a table of size 7?', a: '5', d: ['4', '6', '47'], e: '47 mod 7 = 5.' },
  { lvl: 'medium', q: 'Which data structure does a chained bucket commonly use?', a: 'A linked list', d: ['A stack', 'A binary heap', 'A queue with priority'], e: 'Colliding entries are linked together.' },
  { lvl: 'medium', q: 'What happens when an open-addressed table has no tombstones and a key is deleted by clearing its slot?', a: 'A later search may stop too early and miss a key', d: ['The table becomes sorted', 'The load factor decreases correctly', 'All keys are rehashed'], e: 'Clearing the slot breaks the probe chain.' },
  { lvl: 'medium', q: 'What is the main advantage of open addressing over chaining?', a: 'Better cache locality and no per-entry pointers', d: ['It supports more keys than slots', 'It never collides', 'It keeps keys sorted'], e: 'Entries live in one array, which is cache friendly.' },
  { lvl: 'medium', q: 'What is the main advantage of chaining over open addressing?', a: 'Deletion is simple and the table can exceed capacity', d: ['It uses less memory per key', 'It has better cache locality', 'It needs no hash function'], e: 'Lists absorb any number of collisions without tombstones.' },
  { lvl: 'medium', q: 'What is consistent hashing mainly used for?', a: 'Distributing keys across changing servers with few remaps', d: ['Sorting keys', 'Removing collisions entirely', 'Encrypting keys'], e: 'Adding or removing a node moves only a fraction of keys.' },
  { lvl: 'medium', q: 'Which operation is NOT provided by a hash map?', a: 'Retrieving keys in sorted order', d: ['Inserting a key', 'Looking up a key', 'Deleting a key'], e: 'Hashing destroys order; sorted iteration needs another structure.' },
  { lvl: 'medium', q: 'What is the average complexity of inserting into a hash table?', a: 'O(1)', d: ['O(n)', 'O(log n)', 'O(n log n)'], e: 'The bucket is computed directly and collisions are rare with a low load factor.' },
  { lvl: 'medium', q: 'Why is a cryptographic hash different from a hash-table hash?', a: 'It must resist inversion and deliberate collisions', d: ['It is always faster', 'It produces small integers', 'It requires a sorted table'], e: 'Security properties matter more than bucket distribution.' },
  { lvl: 'medium', q: 'Which scenario is a poor fit for a hash table?', a: 'Range queries over ordered keys', d: ['Exact-key lookups', 'Counting frequencies', 'Deduplicating values'], e: 'Ordered range scans need a sorted structure such as a B-tree.' },
  { lvl: 'medium', q: 'What is the result of rehashing a table from size 7 to 17?', a: 'Every key is placed using its hash modulo 17', d: ['Keys keep their old bucket numbers', 'Keys are sorted first', 'All collisions disappear forever'], e: 'New capacity means new bucket indexes for most keys.' },
  { lvl: 'medium', q: 'What does a collision resolution strategy need to guarantee?', a: 'Every inserted key can still be found', d: ['Keys stay in insertion order', 'The table never grows', 'Keys are unique integers'], e: 'Correctness of lookup is the core requirement.' },
];

function linearProbeTrace(keys, capacity) {
  const table = new Array(capacity).fill(null);
  const slots = [];
  for (const key of keys) {
    let index = ((key % capacity) + capacity) % capacity;
    let probes = 1;
    while (table[index] !== null && probes <= capacity) {
      index = (index + 1) % capacity;
      probes += 1;
    }
    table[index] = key;
    slots.push(index);
  }
  return { table, slots };
}

function chainingTrace(keys, capacity) {
  const buckets = Array.from({ length: capacity }, () => []);
  let collisions = 0;
  for (const key of keys) {
    const index = ((key % capacity) + capacity) % capacity;
    if (buckets[index].length > 0) collisions += 1;
    buckets[index].push(key);
  }
  return { buckets, collisions };
}

function isPrime(value) {
  if (value < 2) return false;
  for (let divisor = 2; divisor * divisor <= value; divisor += 1) {
    if (value % divisor === 0) return false;
  }
  return true;
}

function nextPrime(value) {
  let candidate = value + 1;
  while (!isPrime(candidate)) candidate += 1;
  return candidate;
}

export function buildHashingQuestions() {
  const rand = makeRng(0x1d7f);
  const qs = [];

  for (let i = 0; i < 34; i += 1) {
    const capacity = randInt(rand, 5, 17);
    const key = randInt(rand, 0, 200);
    const index = key % capacity;
    qs.push(mcq({
      id: `hashing-mod-${i}`,
      topic: TOPIC,
      difficulty: 'easy',
      question: `A hash table has ${capacity} buckets and uses h(k) = k mod ${capacity}. Which bucket receives key ${key}?`,
      correct: `${index}`,
      distractors: [`${(index + 1) % capacity}`, `${capacity}`, `${key - capacity}`],
      explanation: `${key} mod ${capacity} = ${index}.`,
    }, rand));
  }

  for (let i = 0; i < 22; i += 1) {
    const capacity = randInt(rand, 4, 8);
    const keys = Array.from({ length: 6 }, () => randInt(rand, 0, 40));
    const { buckets, collisions } = chainingTrace(keys, capacity);
    const nonEmpty = buckets
      .map((bucket, index) => ({ bucket, index }))
      .filter((entry) => entry.bucket.length > 0);
    const target = nonEmpty[randInt(rand, 0, nonEmpty.length - 1)];
    qs.push(mcq({
      id: `hashing-chain-bucket-${i}`,
      topic: TOPIC,
      difficulty: 'hard',
      question: `Keys ${list(keys)} are inserted into a chained table of size ${capacity}. Which keys share the bucket of key ${target.bucket[0]}?`,
      correct: list(target.bucket),
      distractors: [list(target.bucket.slice(1)), list(buckets[(target.index + 1) % capacity]), list(keys.slice(0, target.bucket.length))],
      explanation: `All keys with the same remainder mod ${capacity} share bucket ${target.index}.`,
    }, rand));
    qs.push(mcq({
      id: `hashing-chain-collisions-${i}`,
      topic: TOPIC,
      difficulty: 'medium',
      question: `Keys ${list(keys)} are inserted into a chained table of size ${capacity}. How many keys collide with an already occupied bucket?`,
      correct: `${collisions}`,
      distractors: [`${collisions + 1}`, `${Math.max(0, collisions - 1)}`, `${keys.length}`],
      explanation: `Tracing the buckets shows ${collisions} insert(s) landing in a non-empty bucket.`,
    }, rand));
  }

  for (let i = 0; i < 30; i += 1) {
    const capacity = randInt(rand, 5, 11);
    const keys = Array.from({ length: 5 }, () => randInt(rand, 0, 50));
    const { slots } = linearProbeTrace(keys, capacity);
    qs.push(mcq({
      id: `hashing-linear-${i}`,
      topic: TOPIC,
      difficulty: 'hard',
      question: `Keys ${list(keys)} are inserted with linear probing into a table of size ${capacity}. In which slot does the last key (${keys[keys.length - 1]}) end up?`,
      correct: `${slots[slots.length - 1]}`,
      distractors: [`${(slots[slots.length - 1] + 1) % capacity}`, `${keys[keys.length - 1] % capacity}`, `${capacity - 1}`],
      explanation: `Probing from ${keys[keys.length - 1] % capacity} forward finds the first free slot at ${slots[slots.length - 1]}.`,
    }, rand));
  }

  for (let i = 0; i < 14; i += 1) {
    const capacity = 11;
    const key = randInt(rand, 10, 60);
    const home = key % capacity;
    const third = (home + 4) % capacity;
    qs.push(mcq({
      id: `hashing-quadratic-${i}`,
      topic: TOPIC,
      difficulty: 'hard',
      question: `A table of size 11 uses quadratic probing with step i². Key ${key} hashes to slot ${home}. What is the third probe slot (i = 2)?`,
      correct: `${third}`,
      distractors: [`${(home + 2) % capacity}`, `${(home + 3) % capacity}`, `${(home + 1) % capacity}`],
      explanation: `Probe i adds i²: i = 2 adds 4, giving (${home} + 4) mod 11 = ${third}.`,
    }, rand));
  }

  for (let i = 0; i < 12; i += 1) {
    const capacity = 13;
    const key = randInt(rand, 1, 60);
    const step = 1 + (key % (capacity - 1));
    qs.push(mcq({
      id: `hashing-double-${i}`,
      topic: TOPIC,
      difficulty: 'hard',
      question: `A table of size 13 uses double hashing with step h₂(k) = 1 + (k mod 12). What is the probe step for key ${key}?`,
      correct: `${step}`,
      distractors: [`${key % capacity}`, `${1 + (key % capacity)}`, `${(key + 1) % capacity}`],
      explanation: `h₂(${key}) = 1 + (${key} mod 12) = ${step}.`,
    }, rand));
  }

  for (let i = 0; i < 24; i += 1) {
    const capacity = randInt(rand, 5, 20);
    const keys = randInt(rand, 1, capacity);
    const load = Number((keys / capacity).toFixed(2));
    qs.push(mcq({
      id: `hashing-load-${i}`,
      topic: TOPIC,
      difficulty: 'medium',
      question: `A hash table has ${capacity} buckets and stores ${keys} keys. What is its load factor?`,
      correct: `${load}`,
      distractors: [`${Number((capacity / keys).toFixed(2))}`, `${Number((keys / (capacity + 1)).toFixed(2))}`, `${keys}`],
      explanation: `Load factor = keys / buckets = ${keys} / ${capacity} = ${load}.`,
    }, rand));
  }

  [7, 11, 13, 17, 19, 23, 29, 31, 37].forEach((capacity) => {
    qs.push(mcq({
      id: `hashing-rehash-${capacity}`,
      topic: TOPIC,
      difficulty: 'hard',
      question: `A table of size ${capacity} is rehashed to the next prime capacity. What is the new size?`,
      correct: `${nextPrime(capacity)}`,
      distractors: [`${nextPrime(capacity) + 1}`, `${capacity * 2}`, `${capacity + 1}`],
      explanation: `The smallest prime greater than ${capacity} is ${nextPrime(capacity)}.`,
    }, rand));
  });

  return uniqueBy(
    [...qs, ...conceptBatch({ topic: TOPIC, prefix: 'hashing', concepts: HASH_CONCEPTS, rand })],
    (question) => question.id,
  );
}
