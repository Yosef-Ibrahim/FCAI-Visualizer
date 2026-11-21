import { describe, it, expect } from 'vitest';
import {
  SENTINEL,
  SUFFIX_PRESETS,
  compareChar,
  comparePatternToSuffix,
  compareSuffixes,
  validatePattern,
  validateSuffixText,
} from './suffixUtils.js';

describe('suffixUtils', () => {
  it('exports sentinel and presets', () => {
    expect(SENTINEL).toBe('$');
    expect(SUFFIX_PRESETS).toEqual(['banana', 'ababa', 'mississippi', 'gattaca']);
  });

  describe('validateSuffixText', () => {
    it('accepts trimmed non-empty strings within maxLen', () => {
      const res = validateSuffixText('  banana  ', 10);
      expect(res.ok).toBe(true);
      expect(res.value).toBe('banana');
      expect(res.chars).toEqual(['b', 'a', 'n', 'a', 'n', 'a']);
      expect(res.errorKey).toBeNull();
    });

    it.each([
      ['', 'suffix:errors.emptyText'],
      ['   ', 'suffix:errors.emptyText'],
      [null, 'suffix:errors.emptyText'],
      ['a b', 'suffix:errors.whitespace'],
      ['ban\tana', 'suffix:errors.whitespace'],
      ['ab$c', 'suffix:errors.sentinelForbidden'],
      ['$', 'suffix:errors.sentinelForbidden'],
    ])('rejects invalid input %j with %s', (input, expectedErrorKey) => {
      const res = validateSuffixText(input, 16);
      expect(res.ok).toBe(false);
      expect(res.errorKey).toBe(expectedErrorKey);
    });

    it('enforces maxLen using Unicode code points', () => {
      expect(validateSuffixText('mississippi', 10).ok).toBe(false);
      expect(validateSuffixText('mississippi', 10).errorKey).toBe('suffix:errors.tooLong');
      expect(validateSuffixText('mississippi', 11).ok).toBe(true);
    });
  });

  describe('validatePattern', () => {
    it('accepts valid patterns and trims outer whitespace', () => {
      const res = validatePattern('  ana ');
      expect(res.ok).toBe(true);
      expect(res.value).toBe('ana');
      expect(res.chars).toEqual(['a', 'n', 'a']);
    });

    it.each([
      ['', 'suffix:errors.emptyPattern'],
      ['   ', 'suffix:errors.emptyPattern'],
      ['a$b', 'suffix:errors.sentinelForbidden'],
    ])('rejects invalid pattern %j with %s', (input, expectedErrorKey) => {
      const res = validatePattern(input);
      expect(res.ok).toBe(false);
      expect(res.errorKey).toBe(expectedErrorKey);
    });
  });

  describe('compareChar and compareSuffixes', () => {
    it('treats sentinel "$" as strictly smaller than every other character including ASCII < 36', () => {
      expect(compareChar('$', '$')).toBe(0);
      expect(compareChar('$', '!')).toBeLessThan(0); // '!' is code point 33 < 36 ('$')
      expect(compareChar('!', '$')).toBeGreaterThan(0);
      expect(compareChar('$', '0')).toBeLessThan(0);
      expect(compareChar('$', 'A')).toBeLessThan(0);
      expect(compareChar('$', 'a')).toBeLessThan(0);
      expect(compareChar('A', 'a')).toBeLessThan(0);
    });

    it('sorts suffixes of "banana$" deterministically', () => {
      const t = 'banana$';
      const indices = [0, 1, 2, 3, 4, 5, 6];
      indices.sort((a, b) => compareSuffixes(t, a, b));
      expect(indices).toEqual([6, 5, 3, 1, 0, 4, 2]);
    });

    it('sorts suffixes containing characters with code point < "$" correctly', () => {
      const t = '!!$';
      const indices = [0, 1, 2];
      indices.sort((a, b) => compareSuffixes(t, a, b));
      // '$' < '!$' < '!!$'
      expect(indices).toEqual([2, 1, 0]);
    });

    it('compares pattern against suffix prefixes accurately', () => {
      const t = 'banana$';
      expect(comparePatternToSuffix(t, 1, 'ana')).toBe(0);
      expect(comparePatternToSuffix(t, 3, 'ana')).toBe(0);
      expect(comparePatternToSuffix(t, 5, 'ana')).toBeGreaterThan(0); // 'ana' > 'a$'
      expect(comparePatternToSuffix(t, 0, 'ana')).toBeLessThan(0); // 'ana' < 'ban'
    });
  });
});
