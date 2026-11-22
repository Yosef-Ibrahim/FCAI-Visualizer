// ── Pure Hash Table Engine (framework-free) ─────────────────────────────────
// Supports Separate Chaining, Linear Probing, Quadratic Probing, and Double
// Hashing with prime capacities, negative-safe modulo, tombstone tracking,
// cycle detection, rehashing, and immutable step snapshots.

export const HASH_STRATEGIES = Object.freeze([
  'chaining',
  'linear',
  'quadratic',
  'double',
]);

export const HASH_TABLE_SIZES = Object.freeze([7, 11, 13, 17, 19]);
export const DEFAULT_TABLE_SIZE = 7;
export const MAX_REHASH_CAPACITY = 37;

export const SLOT_STATE = Object.freeze({
  EMPTY: 'EMPTY',
  OCCUPIED: 'OCCUPIED',
  DELETED: 'DELETED',
});

export const HASH_OPS = Object.freeze(['insert', 'search', 'delete', 'rehash']);

// ── Math & Hash Utilities ────────────────────────────────────────────────────

export function isPrime(n) {
  if (!Number.isInteger(n) || n < 2) return false;
  if (n === 2) return true;
  if (n % 2 === 0) return false;
  for (let d = 3; d * d <= n; d += 2) {
    if (n % d === 0) return false;
  }
  return true;
}

export function prevPrime(m) {
  for (let candidate = Math.floor(m) - 1; candidate >= 2; candidate -= 1) {
    if (isPrime(candidate)) return candidate;
  }
  return 1;
}

export function nextPrime(n) {
  let candidate = Math.max(2, Math.ceil(n));
  while (!isPrime(candidate)) {
    candidate += 1;
  }
  return candidate;
}

export function getNextRehashCapacity(capacity) {
  if (capacity >= MAX_REHASH_CAPACITY) return MAX_REHASH_CAPACITY;
  const candidate = nextPrime(capacity * 2);
  return candidate > MAX_REHASH_CAPACITY ? MAX_REHASH_CAPACITY : candidate;
}

/** Division hash safe for negative keys: always in [0, m - 1]. */
export function hash1(key, m) {
  const result = ((key % m) + m) % m;
  return result === 0 ? 0 : result;
}

/** Secondary hash for double hashing: always in [1, prevPrime(m)], never 0. */
export function hash2(key, m) {
  const r = prevPrime(m);
  const mod = ((key % r) + r) % r;
  return r - (mod === 0 ? 0 : mod);
}

/** Probe index at step i (0-indexed) for the chosen collision strategy. */
export function probeIndex(strategy, key, m, step = 0) {
  const base = hash1(key, m);
  if (strategy === 'chaining' || step === 0) return base;
  if (strategy === 'linear') return (base + step) % m;
  if (strategy === 'quadratic') return (base + step * step) % m;
  if (strategy === 'double') {
    const stepSize = hash2(key, m);
    return (base + step * stepSize) % m;
  }
  return base;
}

/** Human-readable mathematical hash equation for the live telemetry bar. */
export function formatHashFormula(strategy, key, m, step = 0) {
  if (key === null || key === undefined) {
    if (strategy === 'double') {
      const r = prevPrime(m);
      return `h₁(k) = k mod ${m}, h₂(k) = ${r} - (k mod ${r})`;
    }
    return `h(k) = k mod ${m}`;
  }

  const h1Val = hash1(key, m);
  if (strategy === 'chaining') {
    return `h(${key}) = ${key} mod ${m} = ${h1Val}`;
  }

  if (strategy === 'double') {
    const r = prevPrime(m);
    const h2Val = hash2(key, m);
    if (step === 0) {
      return `h₁(${key}) = ${h1Val}, h₂(${key}) = ${r} - (${key} mod ${r}) = ${h2Val}`;
    }
    const idx = (h1Val + step * h2Val) % m;
    return `(${h1Val} + ${step} × ${h2Val}) mod ${m} = ${idx}`;
  }

  if (step === 0) {
    return `h(${key}) = ${key} mod ${m} = ${h1Val}`;
  }

  if (strategy === 'linear') {
    const idx = (h1Val + step) % m;
    return `(${h1Val} + ${step}) mod ${m} = ${idx}`;
  }

  // quadratic
  const idx = (h1Val + step * step) % m;
  return `(${h1Val} + ${step}²) mod ${m} = ${idx}`;
}

/**
 * Strict integer key parser.
 * Parses with `Number` (never `parseInt`), rejects empty/whitespace/null/
 * undefined/NaN/Infinity/decimals/non-integers, and accepts explicit `0`, `"0"`,
 * and negative integers.
 */
export function parseHashKey(raw) {
  if (raw === null || raw === undefined || typeof raw === 'boolean') {
    return { ok: false, errorKey: 'hashing:errors.invalidKey' };
  }

  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (trimmed === '') {
      return { ok: false, errorKey: 'hashing:errors.emptyKey' };
    }
    if (!/^[+-]?\d+$/.test(trimmed)) {
      return { ok: false, errorKey: 'hashing:errors.integerOnly' };
    }
    const parsed = Number(trimmed);
    if (!Number.isFinite(parsed) || !Number.isSafeInteger(parsed)) {
      return { ok: false, errorKey: 'hashing:errors.integerOnly' };
    }
    return { ok: true, value: parsed === 0 ? 0 : parsed };
  }

  if (typeof raw === 'number') {
    if (!Number.isFinite(raw) || !Number.isInteger(raw) || !Number.isSafeInteger(raw)) {
      return { ok: false, errorKey: 'hashing:errors.integerOnly' };
    }
    return { ok: true, value: raw === 0 ? 0 : raw };
  }

  return { ok: false, errorKey: 'hashing:errors.invalidKey' };
}

// ── Educational Code Snippets (JS, Python, C++) ──────────────────────────────
// Every (strategy, op) pair exposes idiomatic JS, Python, and C++ line arrays.
// Line maps below keep every step's codeLines[lang] guaranteed in bounds.

function makeOpenAddressingSnippets(strategy) {
  const probeFormulaJs = strategy === 'linear'
    ? 'const idx = (h1 + i) % m;'
    : strategy === 'quadratic'
      ? 'const idx = (h1 + i * i) % m;'
      : 'const idx = (h1 + i * h2) % m;';

  const probeFormulaPy = strategy === 'linear'
    ? '        idx = (h1 + i) % m'
    : strategy === 'quadratic'
      ? '        idx = (h1 + i * i) % m'
      : '        idx = (h1 + i * h2) % m';

  const probeFormulaCpp = strategy === 'linear'
    ? '        int idx = (h1 + i) % m;'
    : strategy === 'quadratic'
      ? '        int idx = (h1 + i * i) % m;'
      : '        int idx = (h1 + i * h2) % m;';

  const h2Js = strategy === 'double'
    ? '  const h2 = R - (((key % R) + R) % R);'
    : '  const visited = new Set();';

  const h2Py = strategy === 'double'
    ? '    h2 = R - (key % R)'
    : '    visited = set()';

  const h2Cpp = strategy === 'double'
    ? '    int h2 = R - (((key % R) + R) % R);'
    : '    std::vector<bool> seen(m, false);';

  const insert = {
    js: [
      'function insert(table, key, m, R) {',                     // 0
      '  const h1 = ((key % m) + m) % m;',                       // 1  compute
      h2Js,                                                      // 2
      '  let firstDel = -1;',                                    // 3
      '  for (let i = 0; i < m; i++) {',                         // 4  loop
      `    ${probeFormulaJs}`,                                   // 5  probe
      '    if (table[idx].state === "OCCUPIED") {',              // 6  collision
      '      if (table[idx].key === key) return false;',         // 7  duplicate
      '    } else if (table[idx].state === "DELETED") {',        // 8  tombstone
      '      if (firstDel === -1) firstDel = idx;',              // 9
      '    } else {',                                            // 10 empty
      '      const dest = firstDel !== -1 ? firstDel : idx;',    // 11
      '      table[dest] = { state: "OCCUPIED", key };',         // 12 write
      '      return true;',                                      // 13
      '    }',                                                   // 14
      '  }',                                                     // 15
      '  if (firstDel !== -1) {',                                // 16 reuse after full scan
      '    table[firstDel] = { state: "OCCUPIED", key };',       // 17
      '    return true;',                                        // 18
      '  }',                                                     // 19
      '  return false; // table full or probe cycle',            // 20 full/cycle
      '}',                                                       // 21
    ],
    python: [
      'def insert(table, key, m, R):',                           // 0
      '    h1 = key % m',                                        // 1  compute
      h2Py,                                                      // 2
      '    first_del = -1',                                      // 3
      '    for i in range(m):',                                  // 4  loop
      probeFormulaPy,                                            // 5  probe
      '        if table[idx].state == "OCCUPIED":',              // 6  collision
      '            if table[idx].key == key: return False',      // 7  duplicate
      '        elif table[idx].state == "DELETED":',             // 8  tombstone
      '            if first_del == -1: first_del = idx',         // 9
      '        else:',                                           // 10 empty
      '            dest = first_del if first_del != -1 else idx', // 11
      '            table[dest] = Slot("OCCUPIED", key)',         // 12 write
      '            return True',                                 // 13
      '    if first_del != -1:',                                 // 14 reuse
      '        table[first_del] = Slot("OCCUPIED", key)',        // 15
      '        return True',                                     // 16
      '    return False  # table full or probe cycle',           // 17 full/cycle
    ],
    cpp: [
      '#include <vector>',                                       // 0
      'enum class SlotState { EMPTY, OCCUPIED, DELETED };',      // 1
      'struct Slot { SlotState state = SlotState::EMPTY; int key = 0; };', // 2
      'bool insert(std::vector<Slot>& table, int key, int R) {', // 3
      '    int m = static_cast<int>(table.size());',             // 4
      '    int h1 = ((key % m) + m) % m;',                       // 5  compute
      h2Cpp,                                                     // 6
      '    int firstDel = -1;',                                  // 7
      '    for (int i = 0; i < m; ++i) {',                       // 8  loop
      probeFormulaCpp,                                           // 9  probe
      '        if (table[idx].state == SlotState::OCCUPIED) {',  // 10 collision
      '            if (table[idx].key == key) return false;',    // 11 duplicate
      '        } else if (table[idx].state == SlotState::DELETED) {', // 12 tombstone
      '            if (firstDel == -1) firstDel = idx;',         // 13
      '        } else {',                                        // 14 empty
      '            int dest = (firstDel != -1) ? firstDel : idx;', // 15
      '            table[dest] = {SlotState::OCCUPIED, key};',   // 16 write
      '            return true;',                                // 17
      '        }',                                               // 18
      '    }',                                                   // 19
      '    if (firstDel != -1) {',                               // 20 reuse
      '        table[firstDel] = {SlotState::OCCUPIED, key};',   // 21
      '        return true;',                                    // 22
      '    }',                                                   // 23
      '    return false; // table full or probe cycle',          // 24 full/cycle
      '}',                                                       // 25
    ],
  };

  const search = {
    js: [
      'function search(table, key, m, R) {',                     // 0
      '  const h1 = ((key % m) + m) % m;',                       // 1  compute
      h2Js,                                                      // 2
      '  for (let i = 0; i < m; i++) {',                         // 3  loop
      `    ${probeFormulaJs}`,                                   // 4  probe
      '    if (table[idx].state === "EMPTY") return -1;',        // 5  not-found empty
      '    if (table[idx].state === "DELETED") continue;',       // 6  tombstone
      '    if (table[idx].key === key) return idx;',             // 7  found
      '  }',                                                     // 8  collision / next
      '  return -1;',                                            // 9  not-found exhausted
      '}',                                                       // 10
    ],
    python: [
      'def search(table, key, m, R):',                           // 0
      '    h1 = key % m',                                        // 1  compute
      h2Py,                                                      // 2
      '    for i in range(m):',                                  // 3  loop
      probeFormulaPy,                                            // 4  probe
      '        if table[idx].state == "EMPTY": return -1',       // 5  not-found empty
      '        if table[idx].state == "DELETED": continue',      // 6  tombstone
      '        if table[idx].key == key: return idx',            // 7  found
      '    return -1',                                           // 8  not-found exhausted
    ],
    cpp: [
      '#include <vector>',                                       // 0
      'enum class SlotState { EMPTY, OCCUPIED, DELETED };',      // 1
      'struct Slot { SlotState state = SlotState::EMPTY; int key = 0; };', // 2
      'int search(const std::vector<Slot>& table, int key, int R) {', // 3
      '    int m = static_cast<int>(table.size());',             // 4
      '    int h1 = ((key % m) + m) % m;',                       // 5  compute
      h2Cpp,                                                     // 6
      '    for (int i = 0; i < m; ++i) {',                       // 7  loop
      probeFormulaCpp,                                           // 8  probe
      '        if (table[idx].state == SlotState::EMPTY) return -1;', // 9  not-found empty
      '        if (table[idx].state == SlotState::DELETED) continue;', // 10 tombstone
      '        if (table[idx].key == key) return idx;',          // 11 found
      '    }',                                                   // 12
      '    return -1;',                                          // 13 not-found exhausted
      '}',                                                       // 14
    ],
  };

  const del = {
    js: [
      'function removeKey(table, key, m, R) {',                  // 0
      '  const h1 = ((key % m) + m) % m;',                       // 1  compute
      h2Js,                                                      // 2
      '  for (let i = 0; i < m; i++) {',                         // 3  loop
      `    ${probeFormulaJs}`,                                   // 4  probe
      '    if (table[idx].state === "EMPTY") return false;',     // 5  not-found
      '    if (table[idx].state === "DELETED") continue;',       // 6  tombstone
      '    if (table[idx].key === key) {',                       // 7  match
      '      table[idx] = { state: "DELETED", key: null };',     // 8  delete tombstone
      '      return true;',                                      // 9
      '    }',                                                   // 10
      '  }',                                                     // 11
      '  return false;',                                         // 12 not-found exhausted
      '}',                                                       // 13
    ],
    python: [
      'def remove_key(table, key, m, R):',                       // 0
      '    h1 = key % m',                                        // 1  compute
      h2Py,                                                      // 2
      '    for i in range(m):',                                  // 3  loop
      probeFormulaPy,                                            // 4  probe
      '        if table[idx].state == "EMPTY": return False',    // 5  not-found
      '        if table[idx].state == "DELETED": continue',      // 6  tombstone
      '        if table[idx].key == key:',                       // 7  match
      '            table[idx] = Slot("DELETED", None)',          // 8  delete tombstone
      '            return True',                                 // 9
      '    return False',                                        // 10 not-found exhausted
    ],
    cpp: [
      '#include <vector>',                                       // 0
      'enum class SlotState { EMPTY, OCCUPIED, DELETED };',      // 1
      'struct Slot { SlotState state = SlotState::EMPTY; int key = 0; };', // 2
      'bool removeKey(std::vector<Slot>& table, int key, int R) {', // 3
      '    int m = static_cast<int>(table.size());',             // 4
      '    int h1 = ((key % m) + m) % m;',                       // 5  compute
      h2Cpp,                                                     // 6
      '    for (int i = 0; i < m; ++i) {',                       // 7  loop
      probeFormulaCpp,                                           // 8  probe
      '        if (table[idx].state == SlotState::EMPTY) return false;', // 9 not-found
      '        if (table[idx].state == SlotState::DELETED) continue;', // 10 tombstone
      '        if (table[idx].key == key) {',                    // 11 match
      '            table[idx] = {SlotState::DELETED, 0};',       // 12 delete tombstone
      '            return true;',                                // 13
      '        }',                                               // 14
      '    }',                                                   // 15
      '    return false;',                                       // 16 not-found exhausted
      '}',                                                       // 17
    ],
  };

  const rehash = {
    js: [
      'function rehash(oldTable, newM) {',                       // 0
      '  const fresh = Array.from({ length: newM }, () => ({ state: "EMPTY", key: null }));', // 1 start
      '  for (const slot of oldTable) {',                        // 2
      '    if (slot.state === "OCCUPIED") {',                    // 3 skip tombstones
      '      insert(fresh, slot.key, newM, prevPrime(newM));',   // 4 move
      '    }',                                                   // 5
      '  }',                                                     // 6
      '  return fresh; // all tombstones purged',                // 7 done
      '}',                                                       // 8
    ],
    python: [
      'def rehash(old_table, new_m):',                           // 0
      '    fresh = [Slot("EMPTY", None) for _ in range(new_m)]', // 1 start
      '    for slot in old_table:',                              // 2
      '        if slot.state == "OCCUPIED":',                    // 3 skip tombstones
      '            insert(fresh, slot.key, new_m, prev_prime(new_m))', // 4 move
      '    return fresh  # all tombstones purged',               // 5 done
    ],
    cpp: [
      '#include <vector>',                                       // 0
      'enum class SlotState { EMPTY, OCCUPIED, DELETED };',      // 1
      'struct Slot { SlotState state = SlotState::EMPTY; int key = 0; };', // 2
      'std::vector<Slot> rehash(const std::vector<Slot>& oldTable, int newM, int newR) {', // 3
      '    std::vector<Slot> fresh(newM);',                      // 4 start
      '    for (const auto& slot : oldTable) {',                 // 5
      '        if (slot.state == SlotState::OCCUPIED) {',        // 6 skip tombstones
      '            insert(fresh, slot.key, newR);',              // 7 move
      '        }',                                               // 8
      '    }',                                                   // 9
      '    return fresh; // all tombstones purged',              // 10 done
      '}',                                                       // 11
    ],
  };

  return { insert, search, delete: del, rehash };
}

const CHAINING_SNIPPETS = {
  insert: {
    js: [
      'function insert(buckets, key, m) {',                      // 0
      '  const idx = ((key % m) + m) % m;',                      // 1 compute
      '  const chain = buckets[idx];',                           // 2
      '  for (const item of chain) {',                           // 3 probe
      '    if (item === key) return false; // duplicate',        // 4 duplicate
      '  }',                                                     // 5
      '  chain.push(key);',                                      // 6 write
      '  return true;',                                          // 7
      '}',                                                       // 8
    ],
    python: [
      'def insert(buckets, key, m):',                            // 0
      '    idx = key % m',                                       // 1 compute
      '    chain = buckets[idx]',                                // 2
      '    for item in chain:',                                  // 3 probe
      '        if item == key: return False  # duplicate',       // 4 duplicate
      '    chain.append(key)',                                   // 5 write
      '    return True',                                         // 6
    ],
    cpp: [
      '#include <list>',                                         // 0
      '#include <vector>',                                       // 1
      'bool insert(std::vector<std::list<int>>& buckets, int key) {', // 2
      '    int m = static_cast<int>(buckets.size());',           // 3
      '    int idx = ((key % m) + m) % m;',                      // 4 compute
      '    for (int item : buckets[idx]) {',                     // 5 probe
      '        if (item == key) return false; // duplicate',     // 6 duplicate
      '    }',                                                   // 7
      '    buckets[idx].push_back(key);',                        // 8 write
      '    return true;',                                        // 9
      '}',                                                       // 10
    ],
  },
  search: {
    js: [
      'function search(buckets, key, m) {',                      // 0
      '  const idx = ((key % m) + m) % m;',                      // 1 compute
      '  for (const item of buckets[idx]) {',                    // 2 probe
      '    if (item === key) return idx;',                       // 3 found
      '  }',                                                     // 4
      '  return -1;',                                            // 5 not-found
      '}',                                                       // 6
    ],
    python: [
      'def search(buckets, key, m):',                            // 0
      '    idx = key % m',                                       // 1 compute
      '    for item in buckets[idx]:',                           // 2 probe
      '        if item == key: return idx',                      // 3 found
      '    return -1',                                           // 4 not-found
    ],
    cpp: [
      '#include <list>',                                         // 0
      '#include <vector>',                                       // 1
      'int search(const std::vector<std::list<int>>& buckets, int key) {', // 2
      '    int m = static_cast<int>(buckets.size());',           // 3
      '    int idx = ((key % m) + m) % m;',                      // 4 compute
      '    for (int item : buckets[idx]) {',                     // 5 probe
      '        if (item == key) return idx;',                    // 6 found
      '    }',                                                   // 7
      '    return -1;',                                          // 8 not-found
      '}',                                                       // 9
    ],
  },
  delete: {
    js: [
      'function removeKey(buckets, key, m) {',                   // 0
      '  const idx = ((key % m) + m) % m;',                      // 1 compute
      '  const chain = buckets[idx];',                           // 2
      '  for (let i = 0; i < chain.length; i++) {',              // 3 probe
      '    if (chain[i] === key) {',                             // 4
      '      chain.splice(i, 1);',                               // 5 delete
      '      return true;',                                      // 6
      '    }',                                                   // 7
      '  }',                                                     // 8
      '  return false;',                                         // 9 not-found
      '}',                                                       // 10
    ],
    python: [
      'def remove_key(buckets, key, m):',                        // 0
      '    idx = key % m',                                       // 1 compute
      '    chain = buckets[idx]',                                // 2
      '    for i, item in enumerate(chain):',                    // 3 probe
      '        if item == key:',                                 // 4
      '            chain.pop(i)',                                // 5 delete
      '            return True',                                 // 6
      '    return False',                                        // 7 not-found
    ],
    cpp: [
      '#include <list>',                                         // 0
      '#include <vector>',                                       // 1
      'bool removeKey(std::vector<std::list<int>>& buckets, int key) {', // 2
      '    int m = static_cast<int>(buckets.size());',           // 3
      '    int idx = ((key % m) + m) % m;',                      // 4 compute
      '    auto& chain = buckets[idx];',                         // 5
      '    for (auto it = chain.begin(); it != chain.end(); ++it) {', // 6 probe
      '        if (*it == key) {',                               // 7
      '            chain.erase(it);',                            // 8 delete
      '            return true;',                                // 9
      '        }',                                               // 10
      '    }',                                                   // 11
      '    return false;',                                       // 12 not-found
      '}',                                                       // 13
    ],
  },
  rehash: {
    js: [
      'function rehash(oldBuckets, newM) {',                     // 0
      '  const fresh = Array.from({ length: newM }, () => []);', // 1 start
      '  for (const chain of oldBuckets) {',                     // 2
      '    for (const key of chain) {',                          // 3
      '      fresh[((key % newM) + newM) % newM].push(key);',    // 4 move
      '    }',                                                   // 5
      '  }',                                                     // 6
      '  return fresh;',                                         // 7 done
      '}',                                                       // 8
    ],
    python: [
      'def rehash(old_buckets, new_m):',                         // 0
      '    fresh = [[] for _ in range(new_m)]',                  // 1 start
      '    for chain in old_buckets:',                           // 2
      '        for key in chain:',                               // 3
      '            fresh[key % new_m].append(key)',              // 4 move
      '    return fresh',                                        // 5 done
    ],
    cpp: [
      '#include <list>',                                         // 0
      '#include <vector>',                                       // 1
      'std::vector<std::list<int>> rehash(const std::vector<std::list<int>>& oldBuckets, int newM) {', // 2
      '    std::vector<std::list<int>> fresh(newM);',            // 3 start
      '    for (const auto& chain : oldBuckets) {',              // 4
      '        for (int key : chain) {',                         // 5
      '            fresh[((key % newM) + newM) % newM].push_back(key);', // 6 move
      '        }',                                               // 7
      '    }',                                                   // 8
      '    return fresh;',                                       // 9 done
      '}',                                                       // 10
    ],
  },
};

export const HASH_CODE_SNIPPETS = Object.freeze({
  chaining: CHAINING_SNIPPETS,
  linear: makeOpenAddressingSnippets('linear'),
  quadratic: makeOpenAddressingSnippets('quadratic'),
  double: makeOpenAddressingSnippets('double'),
});

function getHashJavaSnippet(strategy, op) {
  if (op === 'insert') return strategy === 'chaining'
    ? 'boolean insert(List<Integer>[] buckets, int key, int m) {\n    int idx = ((key % m) + m) % m;\n    if (buckets[idx].contains(key)) return false;\n    buckets[idx].add(key);\n    return true;\n}'
    : 'boolean insert(Integer[] slots, int key, int m) {\n    int h1 = ((key % m) + m) % m;\n    for (int i = 0; i < m; i++) {\n        int idx = (h1 + i) % m;\n        if (slots[idx] == null) { slots[idx] = key; return true; }\n    }\n    return false;\n}';
  if (op === 'search') return 'boolean search(List<Integer>[] buckets, int key, int m) {\n    int idx = ((key % m) + m) % m;\n    return buckets[idx].contains(key);\n}';
  if (op === 'delete') return 'boolean deleteKey(List<Integer>[] buckets, int key, int m) {\n    int idx = ((key % m) + m) % m;\n    return buckets[idx].remove(Integer.valueOf(key));\n}';
  return 'void rehash(List<Integer>[] fresh, List<Integer>[] old, int m) {\n    for (var bucket : old)\n        for (int key : bucket)\n            fresh[((key % m) + m) % m].add(key);\n}';
}

function getHashCSharpSnippet(strategy, op) {
  if (op === 'insert') return strategy === 'chaining'
    ? 'bool Insert(List<int>[] buckets, int key, int m) {\n    int idx = ((key % m) + m) % m;\n    if (buckets[idx].Contains(key)) return false;\n    buckets[idx].Add(key);\n    return true;\n}'
    : 'bool Insert(int?[] slots, int key, int m) {\n    int h1 = ((key % m) + m) % m;\n    for (int i = 0; i < m; i++) {\n        int idx = (h1 + i) % m;\n        if (slots[idx] is null) { slots[idx] = key; return true; }\n    }\n    return false;\n}';
  if (op === 'search') return 'bool Search(List<int>[] buckets, int key, int m) {\n    int idx = ((key % m) + m) % m;\n    return buckets[idx].Contains(key);\n}';
  if (op === 'delete') return 'bool DeleteKey(List<int>[] buckets, int key, int m) {\n    int idx = ((key % m) + m) % m;\n    return buckets[idx].Remove(key);\n}';
  return 'void Rehash(List<int>[] fresh, List<int>[] old, int m) {\n    foreach (var bucket in old)\n        foreach (int key in bucket)\n            fresh[((key % m) + m) % m].Add(key);\n}';
}

/** Convenience helper returning joined code strings for `CodePanel`. */
export function getHashCodeByLang(strategy, op) {
  const safeStrategy = HASH_STRATEGIES.includes(strategy) ? strategy : 'linear';
  const safeOp = HASH_OPS.includes(op) ? op : 'insert';
  const entry = HASH_CODE_SNIPPETS[safeStrategy][safeOp];
  return {
    js: entry.js.join('\n'),
    python: entry.python.join('\n'),
    cpp: entry.cpp.join('\n'),
    java: getHashJavaSnippet(safeStrategy, safeOp),
    csharp: getHashCSharpSnippet(safeStrategy, safeOp),
  };
}

// Line maps keep every emitted step's codeLines[lang] synchronized & in bounds.
const OPEN_LINES = {
  insert: {
    compute: { js: 1, python: 1, cpp: 5 },
    collision: { js: 6, python: 6, cpp: 10 },
    duplicate: { js: 7, python: 7, cpp: 11 },
    tombstone: { js: 9, python: 9, cpp: 13 },
    probe: { js: 5, python: 5, cpp: 9 },
    write: { js: 12, python: 12, cpp: 16 },
    reuseAfterScan: { js: 17, python: 15, cpp: 21 },
    error: { js: 20, python: 17, cpp: 24 },
  },
  search: {
    compute: { js: 1, python: 1, cpp: 5 },
    emptyStop: { js: 5, python: 5, cpp: 9 },
    tombstone: { js: 6, python: 6, cpp: 10 },
    found: { js: 7, python: 7, cpp: 11 },
    collision: { js: 4, python: 4, cpp: 8 },
    exhausted: { js: 9, python: 8, cpp: 13 },
  },
  delete: {
    compute: { js: 1, python: 1, cpp: 5 },
    emptyStop: { js: 5, python: 5, cpp: 9 },
    tombstone: { js: 6, python: 6, cpp: 10 },
    collision: { js: 4, python: 4, cpp: 8 },
    delete: { js: 8, python: 8, cpp: 12 },
    exhausted: { js: 12, python: 10, cpp: 16 },
  },
  rehash: {
    start: { js: 1, python: 1, cpp: 4 },
    move: { js: 4, python: 4, cpp: 7 },
    done: { js: 7, python: 5, cpp: 10 },
  },
};

const CHAIN_LINES = {
  insert: {
    compute: { js: 1, python: 1, cpp: 4 },
    probe: { js: 3, python: 3, cpp: 5 },
    duplicate: { js: 4, python: 4, cpp: 6 },
    write: { js: 6, python: 5, cpp: 8 },
  },
  search: {
    compute: { js: 1, python: 1, cpp: 4 },
    probe: { js: 2, python: 2, cpp: 5 },
    found: { js: 3, python: 3, cpp: 6 },
    notFound: { js: 5, python: 4, cpp: 8 },
  },
  delete: {
    compute: { js: 1, python: 1, cpp: 4 },
    probe: { js: 3, python: 3, cpp: 6 },
    delete: { js: 5, python: 5, cpp: 8 },
    notFound: { js: 9, python: 7, cpp: 12 },
  },
  rehash: {
    start: { js: 1, python: 1, cpp: 3 },
    move: { js: 4, python: 4, cpp: 6 },
    done: { js: 7, python: 5, cpp: 9 },
  },
};

function cloneCodeLines(lines) {
  return { js: lines.js, python: lines.python, cpp: lines.cpp };
}

// ── HashTable Engine Class ───────────────────────────────────────────────────

export class HashTable {
  constructor({ strategy = 'linear', capacity = DEFAULT_TABLE_SIZE } = {}) {
    this.strategy = HASH_STRATEGIES.includes(strategy) ? strategy : 'linear';
    this.capacity = isPrime(capacity) ? capacity : DEFAULT_TABLE_SIZE;
    this._resetStorage();
  }

  _resetStorage() {
    this._chains = Array.from({ length: this.capacity }, () => []);
    this._slots = Array.from({ length: this.capacity }, () => ({
      state: SLOT_STATE.EMPTY,
      key: null,
    }));
    this._lastCollisions = 0;
    this._lastProbes = 0;
  }

  setConfig({ strategy = this.strategy, capacity = this.capacity } = {}) {
    if (HASH_STRATEGIES.includes(strategy)) {
      this.strategy = strategy;
    }
    if (isPrime(capacity)) {
      this.capacity = capacity;
    }
    this._resetStorage();
    return this.getState();
  }

  getSize() {
    if (this.strategy === 'chaining') {
      return this._chains.reduce((sum, chain) => sum + chain.length, 0);
    }
    return this._slots.reduce(
      (sum, slot) => sum + (slot.state === SLOT_STATE.OCCUPIED ? 1 : 0),
      0,
    );
  }

  getTombstoneCount() {
    if (this.strategy === 'chaining') return 0;
    return this._slots.reduce(
      (sum, slot) => sum + (slot.state === SLOT_STATE.DELETED ? 1 : 0),
      0,
    );
  }

  getMetrics(collisions = this._lastCollisions, probes = this._lastProbes) {
    const size = this.getSize();
    const capacity = this.capacity;
    const tombstones = this.getTombstoneCount();
    const loadFactor = size / capacity;
    const effectiveLoad = (size + tombstones) / capacity;
    return {
      size,
      capacity,
      loadFactor,
      tombstones,
      effectiveLoad,
      collisions,
      probes,
    };
  }

  snapshotBuckets() {
    if (this.strategy === 'chaining') {
      return this._chains.map((chain, index) => ({
        index,
        state: chain.length > 0 ? SLOT_STATE.OCCUPIED : SLOT_STATE.EMPTY,
        key: chain.length > 0 ? chain[0] : null,
        chain: [...chain],
      }));
    }
    return this._slots.map((slot, index) => ({
      index,
      state: slot.state,
      key: slot.state === SLOT_STATE.OCCUPIED ? slot.key : null,
      chain: slot.state === SLOT_STATE.OCCUPIED ? [slot.key] : [],
    }));
  }

  getState() {
    return {
      strategy: this.strategy,
      capacity: this.capacity,
      buckets: this.snapshotBuckets(),
      metrics: this.getMetrics(),
    };
  }

  _makeStep({
    kind,
    phase,
    op,
    key = null,
    formula = formatHashFormula(this.strategy, key, this.capacity, 0),
    bucketIndex = null,
    probePath = [],
    targetIndex = null,
    activeChainIndex = null,
    collisions = 0,
    probes = 0,
    msg,
    msgKey,
    msgParams = {},
    codeLines,
  }) {
    this._lastCollisions = collisions;
    this._lastProbes = probes;
    return {
      kind,
      phase,
      op,
      strategy: this.strategy,
      key,
      formula,
      bucketIndex,
      probePath: [...probePath],
      targetIndex,
      activeChainIndex,
      buckets: this.snapshotBuckets(),
      metrics: this.getMetrics(collisions, probes),
      msg,
      msgKey,
      msgParams: { ...msgParams },
      codeLines: cloneCodeLines(codeLines),
    };
  }

  // ── INSERT ─────────────────────────────────────────────────────────────────

  insert(rawKey) {
    const parsed = parseHashKey(rawKey);
    if (!parsed.ok) {
      return { ok: false, errorKey: parsed.errorKey, steps: [], state: this.getState() };
    }
    const key = parsed.value;
    if (this.strategy === 'chaining') {
      return this._insertChaining(key);
    }
    return this._insertOpenAddressing(key);
  }

  _insertChaining(key) {
    const m = this.capacity;
    const idx = hash1(key, m);
    const formula = formatHashFormula('chaining', key, m, 0);
    const steps = [];
    let probes = 0;
    let collisions = 0;

    steps.push(this._makeStep({
      kind: 'compute',
      phase: 'hash',
      op: 'insert',
      key,
      formula,
      bucketIndex: idx,
      probePath: [idx],
      collisions,
      probes,
      msg: `Compute ${formula} — target bucket ${idx}.`,
      msgKey: 'hashing:steps.computeHash',
      msgParams: { key, formula, index: idx },
      codeLines: CHAIN_LINES.insert.compute,
    }));

    const chain = this._chains[idx];
    for (let c = 0; c < chain.length; c += 1) {
      probes += 1;
      if (chain[c] === key) {
        steps.push(this._makeStep({
          kind: 'duplicate',
          phase: 'done',
          op: 'insert',
          key,
          formula,
          bucketIndex: idx,
          probePath: [idx],
          targetIndex: idx,
          activeChainIndex: c,
          collisions,
          probes,
          msg: `Key ${key} already exists in bucket ${idx}; skipping duplicate insert.`,
          msgKey: 'hashing:steps.duplicateFound',
          msgParams: { key, index: idx },
          codeLines: CHAIN_LINES.insert.duplicate,
        }));
        return {
          ok: true,
          inserted: false,
          duplicate: true,
          index: idx,
          steps,
          state: this.getState(),
        };
      }

      collisions += 1;
      steps.push(this._makeStep({
        kind: 'probe',
        phase: 'probe',
        op: 'insert',
        key,
        formula,
        bucketIndex: idx,
        probePath: [idx],
        activeChainIndex: c,
        collisions,
        probes,
        msg: `Bucket ${idx} node ${c} holds ${chain[c]} ≠ ${key}; continue walking chain.`,
        msgKey: 'hashing:steps.chainCheckNode',
        msgParams: { index: idx, pos: c, existing: chain[c], key },
        codeLines: CHAIN_LINES.insert.probe,
      }));
    }

    chain.push(key);
    const insertedPos = chain.length - 1;
    steps.push(this._makeStep({
      kind: 'insert',
      phase: 'write',
      op: 'insert',
      key,
      formula,
      bucketIndex: idx,
      probePath: [idx],
      targetIndex: idx,
      activeChainIndex: insertedPos,
      collisions,
      probes: Math.max(1, probes),
      msg: insertedPos === 0
        ? `Inserted key ${key} into empty bucket ${idx}.`
        : `Collision resolved by chaining: appended key ${key} to bucket ${idx}.`,
      msgKey: insertedPos === 0 ? 'hashing:steps.insertChainEmpty' : 'hashing:steps.insertChainAppend',
      msgParams: { key, index: idx, length: chain.length },
      codeLines: CHAIN_LINES.insert.write,
    }));

    return {
      ok: true,
      inserted: true,
      duplicate: false,
      index: idx,
      steps,
      state: this.getState(),
    };
  }

  _insertOpenAddressing(key) {
    const m = this.capacity;
    const h1Val = hash1(key, m);
    const baseFormula = formatHashFormula(this.strategy, key, m, 0);
    const steps = [];
    const visited = new Set();
    const probePath = [];
    let firstTombstone = -1;
    let probes = 0;
    let collisions = 0;
    let hitCycle = false;
    let cycleIdx = h1Val;

    steps.push(this._makeStep({
      kind: 'compute',
      phase: 'hash',
      op: 'insert',
      key,
      formula: baseFormula,
      bucketIndex: h1Val,
      probePath: [],
      collisions,
      probes,
      msg: `Compute ${baseFormula} — start probing at slot ${h1Val}.`,
      msgKey: 'hashing:steps.computeHash',
      msgParams: { key, formula: baseFormula, index: h1Val },
      codeLines: OPEN_LINES.insert.compute,
    }));

    for (let i = 0; i < m; i += 1) {
      const idx = probeIndex(this.strategy, key, m, i);
      const stepFormula = formatHashFormula(this.strategy, key, m, i);

      if (visited.has(idx)) {
        hitCycle = true;
        cycleIdx = idx;
        break;
      }

      visited.add(idx);
      probePath.push(idx);
      probes += 1;
      const slot = this._slots[idx];

      if (slot.state === SLOT_STATE.OCCUPIED) {
        if (slot.key === key) {
          steps.push(this._makeStep({
            kind: 'duplicate',
            phase: 'done',
            op: 'insert',
            key,
            formula: stepFormula,
            bucketIndex: idx,
            probePath,
            targetIndex: idx,
            collisions,
            probes,
            msg: `Key ${key} already exists at slot ${idx}; skipping duplicate insert.`,
            msgKey: 'hashing:steps.duplicateFound',
            msgParams: { key, index: idx },
            codeLines: OPEN_LINES.insert.duplicate,
          }));
          return {
            ok: true,
            inserted: false,
            duplicate: true,
            index: idx,
            steps,
            state: this.getState(),
          };
        }

        collisions += 1;
        steps.push(this._makeStep({
          kind: 'collision',
          phase: 'probe',
          op: 'insert',
          key,
          formula: stepFormula,
          bucketIndex: idx,
          probePath,
          targetIndex: firstTombstone !== -1 ? firstTombstone : null,
          collisions,
          probes,
          msg: `Collision at slot ${idx} (occupied by ${slot.key}); probing next index.`,
          msgKey: 'hashing:steps.probeCollision',
          msgParams: { index: idx, existing: slot.key, step: i + 1 },
          codeLines: OPEN_LINES.insert.collision,
        }));
        continue;
      }

      if (slot.state === SLOT_STATE.DELETED) {
        const isFirst = firstTombstone === -1;
        if (isFirst) firstTombstone = idx;
        steps.push(this._makeStep({
          kind: 'tombstone',
          phase: 'probe',
          op: 'insert',
          key,
          formula: stepFormula,
          bucketIndex: idx,
          probePath,
          targetIndex: firstTombstone,
          collisions,
          probes,
          msg: isFirst
            ? `Slot ${idx} is a tombstone (DELETED) — remember it as the first reusable slot and continue checking for duplicates.`
            : `Slot ${idx} is another tombstone (DELETED); keeping slot ${firstTombstone} as insertion target and continuing duplicate check.`,
          msgKey: isFirst ? 'hashing:steps.tombstoneRemember' : 'hashing:steps.tombstoneSkip',
          msgParams: { index: idx, firstIndex: firstTombstone },
          codeLines: OPEN_LINES.insert.tombstone,
        }));
        continue;
      }

      // EMPTY slot terminates the duplicate scan cleanly.
      const dest = firstTombstone !== -1 ? firstTombstone : idx;
      const reused = firstTombstone !== -1;
      this._slots[dest] = { state: SLOT_STATE.OCCUPIED, key };

      steps.push(this._makeStep({
        kind: 'insert',
        phase: 'write',
        op: 'insert',
        key,
        formula: stepFormula,
        bucketIndex: dest,
        probePath,
        targetIndex: dest,
        collisions,
        probes,
        msg: reused
          ? `Reached empty slot ${idx} (no duplicate found); inserted key ${key} into remembered tombstone slot ${dest}.`
          : `Slot ${dest} is empty; inserted key ${key}.`,
        msgKey: reused ? 'hashing:steps.insertReuseTombstone' : 'hashing:steps.insertEmpty',
        msgParams: { key, index: dest, emptyIndex: idx },
        codeLines: OPEN_LINES.insert.write,
      }));

      return {
        ok: true,
        inserted: true,
        duplicate: false,
        index: dest,
        reusedTombstone: reused,
        steps,
        state: this.getState(),
      };
    }

    // Loop terminated via cycle or m probes. If we saved a tombstone and saw every
    // reachable slot without finding a duplicate, we can safely reuse it.
    if (firstTombstone !== -1) {
      this._slots[firstTombstone] = { state: SLOT_STATE.OCCUPIED, key };
      const finalFormula = formatHashFormula(this.strategy, key, m, Math.max(0, probes - 1));
      steps.push(this._makeStep({
        kind: 'insert',
        phase: 'write',
        op: 'insert',
        key,
        formula: finalFormula,
        bucketIndex: firstTombstone,
        probePath,
        targetIndex: firstTombstone,
        collisions,
        probes,
        msg: `Finished probing all reachable slots with no duplicate; inserted key ${key} into tombstone slot ${firstTombstone}.`,
        msgKey: 'hashing:steps.insertReuseAfterScan',
        msgParams: { key, index: firstTombstone },
        codeLines: OPEN_LINES.insert.reuseAfterScan,
      }));
      return {
        ok: true,
        inserted: true,
        duplicate: false,
        index: firstTombstone,
        reusedTombstone: true,
        steps,
        state: this.getState(),
      };
    }

    if (hitCycle) {
      const cycleFormula = formatHashFormula(this.strategy, key, m, probes);
      steps.push(this._makeStep({
        kind: 'cycle',
        phase: 'error',
        op: 'insert',
        key,
        formula: cycleFormula,
        bucketIndex: cycleIdx,
        probePath,
        targetIndex: null,
        collisions,
        probes,
        msg: `Probe sequence repeated slot ${cycleIdx} after ${probes} probes without finding an open slot — rehash to expand the table.`,
        msgKey: 'hashing:steps.probeCycle',
        msgParams: { index: cycleIdx, probes, key },
        codeLines: OPEN_LINES.insert.error,
      }));
      return {
        ok: false,
        inserted: false,
        reason: 'cycle',
        errorKey: 'hashing:errors.probeCycle',
        steps,
        state: this.getState(),
      };
    }

    const fullFormula = formatHashFormula(this.strategy, key, m, Math.max(0, probes - 1));
    steps.push(this._makeStep({
      kind: 'full',
      phase: 'error',
      op: 'insert',
      key,
      formula: fullFormula,
      bucketIndex: probePath[probePath.length - 1] ?? h1Val,
      probePath,
      targetIndex: null,
      collisions,
      probes,
      msg: `Table is full after probing all ${m} slots; cannot insert key ${key}. Rehash to expand.`,
      msgKey: 'hashing:steps.tableFull',
      msgParams: { capacity: m, key },
      codeLines: OPEN_LINES.insert.error,
    }));
    return {
      ok: false,
      inserted: false,
      reason: 'full',
      errorKey: 'hashing:errors.tableFull',
      steps,
      state: this.getState(),
    };
  }

  // ── SEARCH ─────────────────────────────────────────────────────────────────

  search(rawKey) {
    const parsed = parseHashKey(rawKey);
    if (!parsed.ok) {
      return { ok: false, errorKey: parsed.errorKey, steps: [], state: this.getState() };
    }
    const key = parsed.value;
    if (this.strategy === 'chaining') {
      return this._searchChaining(key);
    }
    return this._searchOpenAddressing(key);
  }

  _searchChaining(key) {
    const m = this.capacity;
    const idx = hash1(key, m);
    const formula = formatHashFormula('chaining', key, m, 0);
    const steps = [];
    let probes = 0;
    let collisions = 0;

    steps.push(this._makeStep({
      kind: 'compute',
      phase: 'hash',
      op: 'search',
      key,
      formula,
      bucketIndex: idx,
      probePath: [idx],
      collisions,
      probes,
      msg: `Compute ${formula} — searching bucket ${idx}.`,
      msgKey: 'hashing:steps.computeHash',
      msgParams: { key, formula, index: idx },
      codeLines: CHAIN_LINES.search.compute,
    }));

    const chain = this._chains[idx];
    for (let c = 0; c < chain.length; c += 1) {
      probes += 1;
      if (chain[c] === key) {
        steps.push(this._makeStep({
          kind: 'found',
          phase: 'done',
          op: 'search',
          key,
          formula,
          bucketIndex: idx,
          probePath: [idx],
          targetIndex: idx,
          activeChainIndex: c,
          collisions,
          probes,
          msg: `Found key ${key} at bucket ${idx}, chain position ${c}.`,
          msgKey: 'hashing:steps.searchFoundChain',
          msgParams: { key, index: idx, pos: c },
          codeLines: CHAIN_LINES.search.found,
        }));
        return {
          ok: true,
          found: true,
          index: idx,
          chainIndex: c,
          steps,
          state: this.getState(),
        };
      }

      collisions += 1;
      steps.push(this._makeStep({
        kind: 'probe',
        phase: 'search',
        op: 'search',
        key,
        formula,
        bucketIndex: idx,
        probePath: [idx],
        activeChainIndex: c,
        collisions,
        probes,
        msg: `Bucket ${idx} node ${c} holds ${chain[c]} ≠ ${key}; advancing along chain.`,
        msgKey: 'hashing:steps.chainCheckNode',
        msgParams: { index: idx, pos: c, existing: chain[c], key },
        codeLines: CHAIN_LINES.search.probe,
      }));
    }

    steps.push(this._makeStep({
      kind: 'not-found',
      phase: 'done',
      op: 'search',
      key,
      formula,
      bucketIndex: idx,
      probePath: [idx],
      targetIndex: null,
      collisions,
      probes: Math.max(1, probes),
      msg: `Key ${key} was not found in bucket ${idx}.`,
      msgKey: 'hashing:steps.searchNotFoundChain',
      msgParams: { key, index: idx },
      codeLines: CHAIN_LINES.search.notFound,
    }));

    return { ok: true, found: false, index: -1, steps, state: this.getState() };
  }

  _searchOpenAddressing(key) {
    const m = this.capacity;
    const h1Val = hash1(key, m);
    const baseFormula = formatHashFormula(this.strategy, key, m, 0);
    const steps = [];
    const visited = new Set();
    const probePath = [];
    let probes = 0;
    let collisions = 0;

    steps.push(this._makeStep({
      kind: 'compute',
      phase: 'hash',
      op: 'search',
      key,
      formula: baseFormula,
      bucketIndex: h1Val,
      probePath: [],
      collisions,
      probes,
      msg: `Compute ${baseFormula} — start searching at slot ${h1Val}.`,
      msgKey: 'hashing:steps.computeHash',
      msgParams: { key, formula: baseFormula, index: h1Val },
      codeLines: OPEN_LINES.search.compute,
    }));

    for (let i = 0; i < m; i += 1) {
      const idx = probeIndex(this.strategy, key, m, i);
      const stepFormula = formatHashFormula(this.strategy, key, m, i);

      if (visited.has(idx)) {
        steps.push(this._makeStep({
          kind: 'not-found',
          phase: 'done',
          op: 'search',
          key,
          formula: stepFormula,
          bucketIndex: idx,
          probePath,
          targetIndex: null,
          collisions,
          probes,
          msg: `Probe sequence repeated slot ${idx}; key ${key} is not in the table.`,
          msgKey: 'hashing:steps.searchCycleStop',
          msgParams: { key, index: idx },
          codeLines: OPEN_LINES.search.exhausted,
        }));
        return { ok: true, found: false, index: -1, steps, state: this.getState() };
      }

      visited.add(idx);
      probePath.push(idx);
      probes += 1;
      const slot = this._slots[idx];

      if (slot.state === SLOT_STATE.EMPTY) {
        steps.push(this._makeStep({
          kind: 'not-found',
          phase: 'done',
          op: 'search',
          key,
          formula: stepFormula,
          bucketIndex: idx,
          probePath,
          targetIndex: null,
          collisions,
          probes,
          msg: `Slot ${idx} is EMPTY — stop probing; key ${key} is not in the table.`,
          msgKey: 'hashing:steps.searchEmptyStop',
          msgParams: { key, index: idx },
          codeLines: OPEN_LINES.search.emptyStop,
        }));
        return { ok: true, found: false, index: -1, steps, state: this.getState() };
      }

      if (slot.state === SLOT_STATE.DELETED) {
        steps.push(this._makeStep({
          kind: 'tombstone',
          phase: 'search',
          op: 'search',
          key,
          formula: stepFormula,
          bucketIndex: idx,
          probePath,
          targetIndex: null,
          collisions,
          probes,
          msg: `Slot ${idx} is a tombstone (DELETED) — keep probing past it.`,
          msgKey: 'hashing:steps.searchSkipTombstone',
          msgParams: { index: idx, key },
          codeLines: OPEN_LINES.search.tombstone,
        }));
        continue;
      }

      if (slot.key === key) {
        steps.push(this._makeStep({
          kind: 'found',
          phase: 'done',
          op: 'search',
          key,
          formula: stepFormula,
          bucketIndex: idx,
          probePath,
          targetIndex: idx,
          collisions,
          probes,
          msg: `Found key ${key} at slot ${idx} after ${probes} probe(s).`,
          msgKey: 'hashing:steps.searchFound',
          msgParams: { key, index: idx, probes },
          codeLines: OPEN_LINES.search.found,
        }));
        return { ok: true, found: true, index: idx, steps, state: this.getState() };
      }

      collisions += 1;
      steps.push(this._makeStep({
        kind: 'collision',
        phase: 'search',
        op: 'search',
        key,
        formula: stepFormula,
        bucketIndex: idx,
        probePath,
        targetIndex: null,
        collisions,
        probes,
        msg: `Slot ${idx} holds ${slot.key} ≠ ${key}; continue probing.`,
        msgKey: 'hashing:steps.searchMismatch',
        msgParams: { index: idx, existing: slot.key, key },
        codeLines: OPEN_LINES.search.collision,
      }));
    }

    steps.push(this._makeStep({
      kind: 'not-found',
      phase: 'done',
      op: 'search',
      key,
      formula: formatHashFormula(this.strategy, key, m, Math.max(0, probes - 1)),
      bucketIndex: probePath[probePath.length - 1] ?? h1Val,
      probePath,
      targetIndex: null,
      collisions,
      probes,
      msg: `Probed all ${m} slots; key ${key} is not in the table.`,
      msgKey: 'hashing:steps.searchExhausted',
      msgParams: { key, capacity: m },
      codeLines: OPEN_LINES.search.exhausted,
    }));
    return { ok: true, found: false, index: -1, steps, state: this.getState() };
  }

  // ── DELETE ─────────────────────────────────────────────────────────────────

  delete(rawKey) {
    const parsed = parseHashKey(rawKey);
    if (!parsed.ok) {
      return { ok: false, errorKey: parsed.errorKey, steps: [], state: this.getState() };
    }
    const key = parsed.value;
    if (this.strategy === 'chaining') {
      return this._deleteChaining(key);
    }
    return this._deleteOpenAddressing(key);
  }

  _deleteChaining(key) {
    const m = this.capacity;
    const idx = hash1(key, m);
    const formula = formatHashFormula('chaining', key, m, 0);
    const steps = [];
    let probes = 0;
    let collisions = 0;

    steps.push(this._makeStep({
      kind: 'compute',
      phase: 'hash',
      op: 'delete',
      key,
      formula,
      bucketIndex: idx,
      probePath: [idx],
      collisions,
      probes,
      msg: `Compute ${formula} — locating key ${key} in bucket ${idx}.`,
      msgKey: 'hashing:steps.computeHash',
      msgParams: { key, formula, index: idx },
      codeLines: CHAIN_LINES.delete.compute,
    }));

    const chain = this._chains[idx];
    for (let c = 0; c < chain.length; c += 1) {
      probes += 1;
      if (chain[c] === key) {
        chain.splice(c, 1);
        steps.push(this._makeStep({
          kind: 'delete',
          phase: 'delete',
          op: 'delete',
          key,
          formula,
          bucketIndex: idx,
          probePath: [idx],
          targetIndex: idx,
          activeChainIndex: c,
          collisions,
          probes,
          msg: `Unlinked key ${key} from bucket ${idx}.`,
          msgKey: 'hashing:steps.deleteChain',
          msgParams: { key, index: idx },
          codeLines: CHAIN_LINES.delete.delete,
        }));
        return { ok: true, deleted: true, index: idx, steps, state: this.getState() };
      }

      collisions += 1;
      steps.push(this._makeStep({
        kind: 'probe',
        phase: 'probe',
        op: 'delete',
        key,
        formula,
        bucketIndex: idx,
        probePath: [idx],
        activeChainIndex: c,
        collisions,
        probes,
        msg: `Bucket ${idx} node ${c} holds ${chain[c]} ≠ ${key}; continue walking chain.`,
        msgKey: 'hashing:steps.chainCheckNode',
        msgParams: { index: idx, pos: c, existing: chain[c], key },
        codeLines: CHAIN_LINES.delete.probe,
      }));
    }

    steps.push(this._makeStep({
      kind: 'not-found',
      phase: 'done',
      op: 'delete',
      key,
      formula,
      bucketIndex: idx,
      probePath: [idx],
      targetIndex: null,
      collisions,
      probes: Math.max(1, probes),
      msg: `Key ${key} not found in bucket ${idx}; nothing deleted.`,
      msgKey: 'hashing:steps.deleteNotFound',
      msgParams: { key },
      codeLines: CHAIN_LINES.delete.notFound,
    }));
    return { ok: true, deleted: false, index: -1, steps, state: this.getState() };
  }

  _deleteOpenAddressing(key) {
    const m = this.capacity;
    const h1Val = hash1(key, m);
    const baseFormula = formatHashFormula(this.strategy, key, m, 0);
    const steps = [];
    const visited = new Set();
    const probePath = [];
    let probes = 0;
    let collisions = 0;

    steps.push(this._makeStep({
      kind: 'compute',
      phase: 'hash',
      op: 'delete',
      key,
      formula: baseFormula,
      bucketIndex: h1Val,
      probePath: [],
      collisions,
      probes,
      msg: `Compute ${baseFormula} — probing from slot ${h1Val} to delete ${key}.`,
      msgKey: 'hashing:steps.computeHash',
      msgParams: { key, formula: baseFormula, index: h1Val },
      codeLines: OPEN_LINES.delete.compute,
    }));

    for (let i = 0; i < m; i += 1) {
      const idx = probeIndex(this.strategy, key, m, i);
      const stepFormula = formatHashFormula(this.strategy, key, m, i);

      if (visited.has(idx)) {
        steps.push(this._makeStep({
          kind: 'not-found',
          phase: 'done',
          op: 'delete',
          key,
          formula: stepFormula,
          bucketIndex: idx,
          probePath,
          targetIndex: null,
          collisions,
          probes,
          msg: `Probe sequence repeated slot ${idx}; key ${key} not found.`,
          msgKey: 'hashing:steps.deleteNotFound',
          msgParams: { key },
          codeLines: OPEN_LINES.delete.exhausted,
        }));
        return { ok: true, deleted: false, index: -1, steps, state: this.getState() };
      }

      visited.add(idx);
      probePath.push(idx);
      probes += 1;
      const slot = this._slots[idx];

      if (slot.state === SLOT_STATE.EMPTY) {
        steps.push(this._makeStep({
          kind: 'not-found',
          phase: 'done',
          op: 'delete',
          key,
          formula: stepFormula,
          bucketIndex: idx,
          probePath,
          targetIndex: null,
          collisions,
          probes,
          msg: `Reached EMPTY slot ${idx}; key ${key} not found, nothing deleted.`,
          msgKey: 'hashing:steps.deleteNotFound',
          msgParams: { key },
          codeLines: OPEN_LINES.delete.emptyStop,
        }));
        return { ok: true, deleted: false, index: -1, steps, state: this.getState() };
      }

      if (slot.state === SLOT_STATE.DELETED) {
        steps.push(this._makeStep({
          kind: 'tombstone',
          phase: 'probe',
          op: 'delete',
          key,
          formula: stepFormula,
          bucketIndex: idx,
          probePath,
          targetIndex: null,
          collisions,
          probes,
          msg: `Slot ${idx} is already a tombstone (DELETED) — continue probing.`,
          msgKey: 'hashing:steps.searchSkipTombstone',
          msgParams: { index: idx, key },
          codeLines: OPEN_LINES.delete.tombstone,
        }));
        continue;
      }

      if (slot.key === key) {
        this._slots[idx] = { state: SLOT_STATE.DELETED, key: null };
        steps.push(this._makeStep({
          kind: 'delete',
          phase: 'delete',
          op: 'delete',
          key,
          formula: stepFormula,
          bucketIndex: idx,
          probePath,
          targetIndex: idx,
          collisions,
          probes,
          msg: `Marked slot ${idx} as DELETED (tombstone) so downstream probe chains stay intact.`,
          msgKey: 'hashing:steps.deleteTombstone',
          msgParams: { key, index: idx },
          codeLines: OPEN_LINES.delete.delete,
        }));
        return { ok: true, deleted: true, index: idx, steps, state: this.getState() };
      }

      collisions += 1;
      steps.push(this._makeStep({
        kind: 'collision',
        phase: 'probe',
        op: 'delete',
        key,
        formula: stepFormula,
        bucketIndex: idx,
        probePath,
        targetIndex: null,
        collisions,
        probes,
        msg: `Slot ${idx} holds ${slot.key} ≠ ${key}; continue probing.`,
        msgKey: 'hashing:steps.searchMismatch',
        msgParams: { index: idx, existing: slot.key, key },
        codeLines: OPEN_LINES.delete.collision,
      }));
    }

    steps.push(this._makeStep({
      kind: 'not-found',
      phase: 'done',
      op: 'delete',
      key,
      formula: formatHashFormula(this.strategy, key, m, Math.max(0, probes - 1)),
      bucketIndex: probePath[probePath.length - 1] ?? h1Val,
      probePath,
      targetIndex: null,
      collisions,
      probes,
      msg: `Probed all ${m} slots; key ${key} not found.`,
      msgKey: 'hashing:steps.deleteNotFound',
      msgParams: { key },
      codeLines: OPEN_LINES.delete.exhausted,
    }));
    return { ok: true, deleted: false, index: -1, steps, state: this.getState() };
  }

  // ── REHASH ─────────────────────────────────────────────────────────────────

  rehash() {
    const oldCapacity = this.capacity;
    const newCapacity = getNextRehashCapacity(oldCapacity);
    const purgedTombstones = this.getTombstoneCount();
    const activeKeys = this.strategy === 'chaining'
      ? this._chains.flat()
      : this._slots
        .filter((slot) => slot.state === SLOT_STATE.OCCUPIED)
        .map((slot) => slot.key);

    this.capacity = newCapacity;
    this._resetStorage();

    const lines = this.strategy === 'chaining' ? CHAIN_LINES.rehash : OPEN_LINES.rehash;
    const steps = [];
    let totalProbes = 0;
    let totalCollisions = 0;
    let movedCount = 0;

    steps.push(this._makeStep({
      kind: 'rehash-start',
      phase: 'rehash',
      op: 'rehash',
      key: null,
      formula: formatHashFormula(this.strategy, null, newCapacity, 0),
      bucketIndex: null,
      probePath: [],
      collisions: totalCollisions,
      probes: totalProbes,
      msg: `Rehashing table from m = ${oldCapacity} to prime m = ${newCapacity}; moving ${activeKeys.length} active key(s) and purging ${purgedTombstones} tombstone(s).`,
      msgKey: 'hashing:steps.rehashStart',
      msgParams: {
        oldM: oldCapacity,
        newM: newCapacity,
        count: activeKeys.length,
        purged: purgedTombstones,
      },
      codeLines: lines.start,
    }));

    for (const key of activeKeys) {
      if (this.strategy === 'chaining') {
        const idx = hash1(key, newCapacity);
        const hadItems = this._chains[idx].length > 0;
        if (hadItems) totalCollisions += 1;
        totalProbes += 1;
        this._chains[idx].push(key);
        movedCount += 1;
        const formula = formatHashFormula('chaining', key, newCapacity, 0);
        steps.push(this._makeStep({
          kind: 'rehash-move',
          phase: 'rehash',
          op: 'rehash',
          key,
          formula,
          bucketIndex: idx,
          probePath: [idx],
          targetIndex: idx,
          activeChainIndex: this._chains[idx].length - 1,
          collisions: totalCollisions,
          probes: totalProbes,
          msg: `Re-inserted key ${key} into bucket ${idx} (${formula}).`,
          msgKey: 'hashing:steps.rehashMove',
          msgParams: { key, index: idx, formula },
          codeLines: lines.move,
        }));
      } else {
        const visited = new Set();
        const probePath = [];
        let placedIdx = -1;
        let stepUsed = 0;

        for (let i = 0; i < newCapacity; i += 1) {
          const idx = probeIndex(this.strategy, key, newCapacity, i);
          if (visited.has(idx)) break;
          visited.add(idx);
          probePath.push(idx);
          totalProbes += 1;
          stepUsed = i;

          if (this._slots[idx].state === SLOT_STATE.EMPTY) {
            this._slots[idx] = { state: SLOT_STATE.OCCUPIED, key };
            placedIdx = idx;
            movedCount += 1;
            break;
          }
          totalCollisions += 1;
        }

        const formula = formatHashFormula(this.strategy, key, newCapacity, stepUsed);
        if (placedIdx !== -1) {
          steps.push(this._makeStep({
            kind: 'rehash-move',
            phase: 'rehash',
            op: 'rehash',
            key,
            formula,
            bucketIndex: placedIdx,
            probePath,
            targetIndex: placedIdx,
            collisions: totalCollisions,
            probes: totalProbes,
            msg: `Re-inserted key ${key} into slot ${placedIdx} (${formula}).`,
            msgKey: 'hashing:steps.rehashMove',
            msgParams: { key, index: placedIdx, formula },
            codeLines: lines.move,
          }));
        }
      }
    }

    steps.push(this._makeStep({
      kind: 'rehash-done',
      phase: 'done',
      op: 'rehash',
      key: null,
      formula: formatHashFormula(this.strategy, null, newCapacity, 0),
      bucketIndex: null,
      probePath: [],
      collisions: totalCollisions,
      probes: totalProbes,
      msg: `Rehash complete: ${movedCount} key(s) stored in m = ${newCapacity} slots with 0 tombstones.`,
      msgKey: 'hashing:steps.rehashDone',
      msgParams: { count: movedCount, newM: newCapacity },
      codeLines: lines.done,
    }));

    return {
      ok: true,
      oldCapacity,
      newCapacity,
      rehashedCount: movedCount,
      purgedTombstones,
      steps,
      state: this.getState(),
    };
  }

  // ── SAMPLE & CLEAR ─────────────────────────────────────────────────────────

  loadSample() {
    this._resetStorage();
    const m = this.capacity;
    // Guarantees primary collisions & wrap-around across every prime size m,
    // and reaches α ≈ 0.71 on default m = 7 without filling the table.
    const sampleKeys = [10, 10 + m, 10 + 2 * m, 2, 2 + m];
    const allSteps = [];

    for (const key of sampleKeys) {
      const res = this.insert(key);
      if (res.steps.length > 0) {
        allSteps.push(res.steps[res.steps.length - 1]);
      }
    }

    const lines = this.strategy === 'chaining' ? CHAIN_LINES.insert.write : OPEN_LINES.insert.write;
    const summaryStep = this._makeStep({
      kind: 'sample',
      phase: 'done',
      op: 'insert',
      key: sampleKeys[sampleKeys.length - 1],
      formula: formatHashFormula(this.strategy, null, m, 0),
      bucketIndex: null,
      probePath: [],
      collisions: this._lastCollisions,
      probes: this._lastProbes,
      msg: `Loaded sample keys [${sampleKeys.join(', ')}] into m = ${m} table.`,
      msgKey: 'hashing:steps.sampleLoaded',
      msgParams: { keys: sampleKeys.join(', '), capacity: m },
      codeLines: lines,
    });

    return {
      ok: true,
      keys: sampleKeys,
      steps: [...allSteps, summaryStep],
      state: this.getState(),
    };
  }

  clear() {
    this._resetStorage();
    const lines = this.strategy === 'chaining' ? CHAIN_LINES.insert.compute : OPEN_LINES.insert.compute;
    const step = this._makeStep({
      kind: 'clear',
      phase: 'done',
      op: 'insert',
      key: null,
      formula: formatHashFormula(this.strategy, null, this.capacity, 0),
      bucketIndex: null,
      probePath: [],
      collisions: 0,
      probes: 0,
      msg: `Cleared hash table (m = ${this.capacity}).`,
      msgKey: 'hashing:steps.cleared',
      msgParams: { capacity: this.capacity },
      codeLines: lines,
    });

    return {
      ok: true,
      steps: [step],
      state: this.getState(),
    };
  }
}

export default HashTable;
