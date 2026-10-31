import { describe, it, expect } from 'vitest';
import { diffWords, MAX_WORD_DIFF_WORDS } from '../wordDiff';

const text = (ops: ReturnType<typeof diffWords>, type: string) =>
    ops && ops.filter(o => o.type === type).map(o => o.text).join(' ');

describe('diffWords', () => {
    it('marks inserted and deleted words', () => {
        const ops = diffWords('the quick brown fox', 'the slow brown fox jumps');
        expect(text(ops, 'del')).toBe('quick');
        expect(text(ops, 'ins')).toBe('slow jumps');
        expect(text(ops, 'same')).toBe('the brown fox');
    });

    it('sees a change after character 50', () => {
        const head = 'word '.repeat(20);
        const ops = diffWords(`${head}alpha`, `${head}beta`);
        expect(text(ops, 'del')).toBe('alpha');
        expect(text(ops, 'ins')).toBe('beta');
    });

    it('handles empty sides', () => {
        expect(text(diffWords('', 'new note here'), 'ins')).toBe('new note here');
        expect(text(diffWords('old note', ''), 'del')).toBe('old note');
        expect(diffWords('', '')).toEqual([]);
        expect(diffWords(undefined, 'x')).toEqual([{ type: 'ins', text: 'x' }]);
    });

    it('ignores whitespace-only differences', () => {
        expect(text(diffWords('a  b\nc', 'a b c'), 'ins')).toBe('');
    });

    it('returns null past the word cap instead of freezing', () => {
        const big = Array.from({ length: MAX_WORD_DIFF_WORDS + 1 }, (_, i) => `w${i}`).join(' ');
        expect(diffWords(big, 'x')).toBeNull();
        expect(diffWords('x', big)).toBeNull();
    });

    it('finishes a max-size diff quickly', () => {
        const a = Array.from({ length: MAX_WORD_DIFF_WORDS }, (_, i) => `a${i}`).join(' ');
        const b = Array.from({ length: MAX_WORD_DIFF_WORDS }, (_, i) => `b${i}`).join(' ');
        const start = performance.now();
        expect(diffWords(a, b)).not.toBeNull();
        expect(performance.now() - start).toBeLessThan(2000);
    });
});
