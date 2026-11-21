import { describe, it, expect } from 'vitest';
import {
  DEFAULT_TABLE_SIZE,
  HASH_CODE_SNIPPETS,
  HASH_OPS,
  HASH_STRATEGIES,
  HASH_TABLE_SIZES,
  HashTable,
  MAX_REHASH_CAPACITY,
  SLOT_STATE,
  getHashCodeByLang,
  getNextRehashCapacity,
  hash1,
  hash2,
  isPrime,
  nextPrime,
  parseHashKey,
  prevPrime,
  probeIndex,
} from './HashTable.js';

function assertStepContract(steps, expectedStrategy) {
  expect(steps.length).toBeGreaterThan(0);
  for (const step of steps) {
    expect(step.kind).toBeTypeOf('string');
    expect(step.phase).toBeTypeOf('string');
    expect(step.formula).toBeTypeOf('string');
    expect(Array.isArray(step.probePath)).toBe(true);
    expect(Array.isArray(step.buckets)).toBe(true);
    expect(step.msg).toBeTruthy();
    expect(step.msgKey).toMatch(/^hashing:steps\./);
    expect(step.metrics).toMatchObject({
      size: expect.any(Number),
      capacity: expect.any(Number),
      loadFactor: expect.any(Number),
      tombstones: expect.any(Number),
      effectiveLoad: expect.any(Number),
      collisions: expect.any(Number),
      probes: expect.any(Number),
    });

    const strategy = expectedStrategy ?? step.strategy;
    const op = HASH_OPS.includes(step.op) ? step.op : 'insert';
    for (const lang of ['js', 'python', 'cpp']) {
      const snippet = HASH_CODE_SNIPPETS[strategy][op][lang];
      const line = step.codeLines[lang];
      expect(Number.isInteger(line)).toBe(true);
      expect(line).toBeGreaterThanOrEqual(0);
      expect(line).toBeLessThan(snippet.length);
    }
  }
}

describe('HashTable math & key validation helpers', () => {
  it('computes prime helpers accurately', () => {
    expect(isPrime(1)).toBe(false);
    expect(isPrime(2)).toBe(true);
    expect(isPrime(7)).toBe(true);
    expect(isPrime(9)).toBe(false);
    expect(isPrime(37)).toBe(true);

    expect(prevPrime(7)).toBe(5);
    expect(prevPrime(11)).toBe(7);
    expect(prevPrime(13)).toBe(11);
    expect(prevPrime(17)).toBe(13);
    expect(prevPrime(19)).toBe(17);

    expect(nextPrime(14)).toBe(17);
    expect(nextPrime(22)).toBe(23);
    expect(nextPrime(26)).toBe(29);
    expect(nextPrime(34)).toBe(37);

    expect(getNextRehashCapacity(7)).toBe(17);
    expect(getNextRehashCapacity(11)).toBe(23);
    expect(getNextRehashCapacity(13)).toBe(29);
    expect(getNextRehashCapacity(17)).toBe(37);
    expect(getNextRehashCapacity(19)).toBe(MAX_REHASH_CAPACITY);
    expect(getNextRehashCapacity(37)).toBe(MAX_REHASH_CAPACITY);
  });

  it('computes negative-safe h1 and non-zero h2 across all prime capacities', () => {
    for (const m of HASH_TABLE_SIZES) {
      const r = prevPrime(m);
      for (const k of [-100, -m, -1, 0, 1, m, 23, 99]) {
        const h1Val = hash1(k, m);
        expect(h1Val).toBeGreaterThanOrEqual(0);
        expect(h1Val).toBeLessThan(m);
        expect(Object.is(h1Val, -0)).toBe(false);

        const h2Val = hash2(k, m);
        expect(h2Val).toBeGreaterThanOrEqual(1);
        expect(h2Val).toBeLessThanOrEqual(r);
      }
    }

    expect(hash1(-1, 7)).toBe(6);
    expect(hash1(-7, 7)).toBe(0);
    expect(hash1(23, 7)).toBe(2);
    expect(probeIndex('linear', 6, 7, 1)).toBe(0);
    expect(probeIndex('quadratic', 3, 7, 2)).toBe(0);
    expect(probeIndex('double', 10, 7, 1)).toBe((3 + hash2(10, 7)) % 7);
  });

  it('strictly validates integer keys via parseHashKey', () => {
    // Valid inputs: explicit 0, "0", negatives, trimmed strings
    expect(parseHashKey(0)).toEqual({ ok: true, value: 0 });
    expect(parseHashKey('0')).toEqual({ ok: true, value: 0 });
    expect(parseHashKey(' 0 ')).toEqual({ ok: true, value: 0 });
    expect(parseHashKey(-0)).toEqual({ ok: true, value: 0 });
    expect(parseHashKey('-0')).toEqual({ ok: true, value: 0 });
    expect(parseHashKey(-42)).toEqual({ ok: true, value: -42 });
    expect(parseHashKey('-42')).toEqual({ ok: true, value: -42 });
    expect(parseHashKey('+15')).toEqual({ ok: true, value: 15 });

    // Invalid inputs: empty, whitespace, null/undefined, non-integers, NaN, Infinity
    for (const bad of ['', '   ', null, undefined, NaN, Infinity, -Infinity, 3.14, '3.14', '12px', 'abc', true, false, {}]) {
      const res = parseHashKey(bad);
      expect(res.ok).toBe(false);
      expect(res.errorKey).toMatch(/^hashing:errors\./);
    }
  });
});

describe('HASH_CODE_SNIPPETS coverage', () => {
  it('provides distinct JS, Python, and idiomatic C++ snippets for every strategy and op', () => {
    for (const strategy of HASH_STRATEGIES) {
      for (const op of HASH_OPS) {
        const entry = HASH_CODE_SNIPPETS[strategy][op];
        expect(entry).toBeDefined();
        expect(entry.js.length).toBeGreaterThan(3);
        expect(entry.python.length).toBeGreaterThan(3);
        expect(entry.cpp.length).toBeGreaterThan(5);

        const cppText = entry.cpp.join('\n');
        const jsText = entry.js.join('\n');
        const pyText = entry.python.join('\n');

        expect(cppText).not.toBe(jsText);
        expect(cppText).not.toBe(pyText);
        expect(cppText).toContain('#include <vector>');
        if (strategy === 'chaining') {
          expect(cppText).toContain('#include <list>');
        } else {
          expect(cppText).toContain('enum class SlotState');
        }

        const joined = getHashCodeByLang(strategy, op);
        expect(joined.cpp).toBe(cppText);
      }
    }
  });
});

describe('HashTable — Separate Chaining', () => {
  it('inserts colliding keys, prevents duplicates, searches, and physically unlinks on delete', () => {
    const ht = new HashTable({ strategy: 'chaining', capacity: 7 });

    const r1 = ht.insert(10); // bucket 3
    const r2 = ht.insert(17); // bucket 3 (collision)
    const r3 = ht.insert(0);  // bucket 0 (explicit 0)
    const r4 = ht.insert(-4); // ((-4 % 7) + 7) % 7 = 3

    expect(r1.ok && r1.inserted).toBe(true);
    expect(r2.ok && r2.inserted).toBe(true);
    expect(r3.ok && r3.inserted).toBe(true);
    expect(r4.ok && r4.inserted).toBe(true);
    assertStepContract(r1.steps, 'chaining');
    assertStepContract(r2.steps, 'chaining');

    expect(ht.getState().buckets[3].chain).toEqual([10, 17, -4]);
    expect(ht.getState().buckets[0].chain).toEqual([0]);
    expect(ht.getMetrics().size).toBe(4);
    expect(ht.getMetrics().tombstones).toBe(0);

    // Duplicate ignored
    const dup = ht.insert(17);
    expect(dup.ok).toBe(true);
    expect(dup.inserted).toBe(false);
    expect(dup.duplicate).toBe(true);
    expect(dup.steps.at(-1).kind).toBe('duplicate');
    assertStepContract(dup.steps, 'chaining');

    // Search hits and misses
    const found = ht.search(-4);
    expect(found.ok && found.found).toBe(true);
    expect(found.index).toBe(3);
    assertStepContract(found.steps, 'chaining');

    const miss = ht.search(99);
    expect(miss.ok).toBe(true);
    expect(miss.found).toBe(false);
    assertStepContract(miss.steps, 'chaining');

    // Physical unlink on delete (no tombstones)
    const del = ht.delete(17);
    expect(del.ok && del.deleted).toBe(true);
    expect(ht.getState().buckets[3].chain).toEqual([10, -4]);
    expect(ht.getMetrics().tombstones).toBe(0);
    expect(ht.search(17).found).toBe(false);
    expect(ht.search(-4).found).toBe(true);
    assertStepContract(del.steps, 'chaining');

    // Deleting missing key
    const delMiss = ht.delete(17);
    expect(delMiss.ok).toBe(true);
    expect(delMiss.deleted).toBe(false);
    assertStepContract(delMiss.steps, 'chaining');
  });
});

describe('HashTable — Open Addressing (Linear, Quadratic, Double)', () => {
  it('handles tombstones accurately during search, duplicate detection, and reuse (linear)', () => {
    const ht = new HashTable({ strategy: 'linear', capacity: 7 });

    ht.insert(7);  // slot 0
    ht.insert(14); // slot 1
    ht.insert(21); // slot 2

    // Delete 14 -> slot 1 becomes DELETED tombstone
    const del = ht.delete(14);
    expect(del.ok && del.deleted).toBe(true);
    expect(del.steps.at(-1).kind).toBe('delete');
    expect(ht.getState().buckets[1].state).toBe(SLOT_STATE.DELETED);
    expect(ht.getMetrics().tombstones).toBe(1);
    expect(ht.getMetrics().size).toBe(2);
    assertStepContract(del.steps, 'linear');

    // Search must walk PAST tombstone at slot 1 to find 21 at slot 2
    const s21 = ht.search(21);
    expect(s21.ok && s21.found).toBe(true);
    expect(s21.index).toBe(2);
    expect(s21.steps.some((st) => st.kind === 'tombstone')).toBe(true);
    assertStepContract(s21.steps, 'linear');

    // Inserting 21 again MUST detect downstream duplicate instead of writing into tombstone slot 1
    const dup21 = ht.insert(21);
    expect(dup21.ok).toBe(true);
    expect(dup21.inserted).toBe(false);
    expect(dup21.duplicate).toBe(true);
    expect(ht.getState().buckets[1].state).toBe(SLOT_STATE.DELETED);
    expect(ht.getMetrics().size).toBe(2);
    assertStepContract(dup21.steps, 'linear');

    // Inserting new key 28 (h1 = 0) probes 0(occ) -> 1(DEL remembered) -> 2(occ) -> 3(EMPTY)
    // and places 28 into remembered tombstone slot 1!
    const ins28 = ht.insert(28);
    expect(ins28.ok && ins28.inserted).toBe(true);
    expect(ins28.index).toBe(1);
    expect(ins28.reusedTombstone).toBe(true);
    expect(ht.getState().buckets[1].state).toBe(SLOT_STATE.OCCUPIED);
    expect(ht.getState().buckets[1].key).toBe(28);
    expect(ht.getMetrics().tombstones).toBe(0);
    assertStepContract(ins28.steps, 'linear');
  });

  it('reuses a tombstone even when the table has 0 EMPTY slots remaining', () => {
    const ht = new HashTable({ strategy: 'linear', capacity: 7 });
    for (let k = 0; k < 7; k += 1) {
      expect(ht.insert(k).inserted).toBe(true);
    }
    // Delete slot 3 -> 6 occupied, 1 DELETED, 0 EMPTY
    ht.delete(3);
    expect(ht.getMetrics().tombstones).toBe(1);

    // Insert 10 (h1 = 3): immediately hits tombstone at 3, scans remaining 6 slots for duplicates,
    // finishes full scan, and reuses slot 3!
    const res = ht.insert(10);
    expect(res.ok && res.inserted).toBe(true);
    expect(res.index).toBe(3);
    expect(res.reusedTombstone).toBe(true);
    expect(ht.getMetrics().size).toBe(7);
    expect(ht.getMetrics().tombstones).toBe(0);
    assertStepContract(res.steps, 'linear');
  });

  it('cleanly terminates with a narrated full-table step when linear table is completely full', () => {
    const ht = new HashTable({ strategy: 'linear', capacity: 7 });
    for (let k = 0; k < 7; k += 1) {
      ht.insert(k);
    }
    const fullRes = ht.insert(99);
    expect(fullRes.ok).toBe(false);
    expect(fullRes.reason).toBe('full');
    expect(fullRes.errorKey).toBe('hashing:errors.tableFull');
    expect(fullRes.steps.at(-1).kind).toBe('full');
    assertStepContract(fullRes.steps, 'linear');
  });

  it('detects quadratic probing cycle cleanly without infinite loop', () => {
    // On m = 7, quadratic probes from h1 = 0 visit ONLY {0, 1, 4, 2} (4 distinct slots).
    const ht = new HashTable({ strategy: 'quadratic', capacity: 7 });
    expect(ht.insert(0).index).toBe(0);
    expect(ht.insert(7).index).toBe(1);
    expect(ht.insert(14).index).toBe(4);
    expect(ht.insert(21).index).toBe(2);

    // 5th key with h1 = 0 must hit a cycle even though slots 3, 5, 6 are empty!
    const cycleRes = ht.insert(28);
    expect(cycleRes.ok).toBe(false);
    expect(cycleRes.reason).toBe('cycle');
    expect(cycleRes.errorKey).toBe('hashing:errors.probeCycle');
    expect(cycleRes.steps.at(-1).kind).toBe('cycle');
    assertStepContract(cycleRes.steps, 'quadratic');

    // Search for 28 also terminates cleanly on cycle without hanging
    const searchRes = ht.search(28);
    expect(searchRes.ok).toBe(true);
    expect(searchRes.found).toBe(false);
    assertStepContract(searchRes.steps, 'quadratic');
  });

  it('supports double hashing insert, search, delete, and full-table detection', () => {
    const ht = new HashTable({ strategy: 'double', capacity: 7 });
    // Keys colliding on h1 = 3: 10 (h2=5), 17 (h2=3), 24 (h2=1), 3 (h2=2)
    expect(ht.insert(10).index).toBe(3);
    expect(ht.insert(17).index).toBe(6); // (3 + 3) % 7 = 6
    expect(ht.insert(24).index).toBe(4); // (3 + 1) % 7 = 4
    expect(ht.insert(3).index).toBe(5);  // (3 + 2) % 7 = 5

    expect(ht.search(3).found).toBe(true);
    expect(ht.search(3).index).toBe(5);

    const del = ht.delete(17);
    expect(del.deleted).toBe(true);
    expect(ht.getState().buckets[6].state).toBe(SLOT_STATE.DELETED);
    expect(ht.search(3).found).toBe(true);
    assertStepContract(del.steps, 'double');

    // Fill remaining slots and verify clean full termination
    const ht2 = new HashTable({ strategy: 'double', capacity: 7 });
    for (let k = 1; k <= 7; k += 1) {
      expect(ht2.insert(k * 7).inserted).toBe(true);
    }
    const fullRes = ht2.insert(70);
    expect(fullRes.ok).toBe(false);
    expect(fullRes.reason).toBe('full');
    assertStepContract(fullRes.steps, 'double');
  });
});

describe('HashTable — Rehash, Sample, Clear & Snapshot Immutability', () => {
  it('rehashes to next prime >= 2m, preserves all active keys, and purges tombstones', () => {
    for (const strategy of HASH_STRATEGIES) {
      const ht = new HashTable({ strategy, capacity: DEFAULT_TABLE_SIZE });
      const inserted = [10, 17, -5, 0, 24];
      for (const k of inserted) ht.insert(k);
      ht.delete(17);

      const expectedKeys = [10, -5, 0, 24];
      const rehashRes = ht.rehash();

      expect(rehashRes.ok).toBe(true);
      expect(rehashRes.oldCapacity).toBe(7);
      expect(rehashRes.newCapacity).toBe(17);
      expect(rehashRes.rehashedCount).toBe(expectedKeys.length);
      expect(ht.getMetrics().capacity).toBe(17);
      expect(ht.getMetrics().tombstones).toBe(0);
      expect(ht.getMetrics().size).toBe(expectedKeys.length);
      assertStepContract(rehashRes.steps, strategy);

      for (const k of expectedKeys) {
        expect(ht.search(k).found).toBe(true);
      }
      expect(ht.search(17).found).toBe(false);
    }
  });

  it('loads sample cleanly across all strategies and prime table sizes, then clears', () => {
    for (const strategy of HASH_STRATEGIES) {
      for (const capacity of HASH_TABLE_SIZES) {
        const ht = new HashTable({ strategy, capacity });
        const sample = ht.loadSample();
        expect(sample.ok).toBe(true);
        expect(ht.getMetrics().size).toBe(sample.keys.length);
        assertStepContract(sample.steps, strategy);

        const cleared = ht.clear();
        expect(cleared.ok).toBe(true);
        expect(ht.getMetrics().size).toBe(0);
        expect(ht.getMetrics().tombstones).toBe(0);
        assertStepContract(cleared.steps, strategy);
      }
    }
  });

  it('emits immutable step snapshots that do not change after later mutations', () => {
    const ht = new HashTable({ strategy: 'linear', capacity: 7 });
    const r1 = ht.insert(10);
    const snap1 = structuredClone(r1.steps[r1.steps.length - 1]);

    ht.insert(17);
    ht.delete(10);
    ht.rehash();

    expect(r1.steps[r1.steps.length - 1]).toEqual(snap1);
  });

  it('rejects invalid inputs on insert, search, and delete without mutating state', () => {
    const ht = new HashTable({ strategy: 'linear', capacity: 7 });
    ht.insert(5);
    const before = ht.getState();

    for (const op of ['insert', 'search', 'delete']) {
      const res = ht[op]('');
      expect(res.ok).toBe(false);
      expect(res.steps).toEqual([]);
      expect(res.errorKey).toBe('hashing:errors.emptyKey');
    }

    expect(ht.getState()).toEqual(before);
  });
});
