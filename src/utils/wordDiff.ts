export type WordDiffOp = { type: 'same' | 'ins' | 'del'; text: string };

/** Longest note (in words) we compare. The LCS table is words x words. */
export const MAX_WORD_DIFF_WORDS = 1500;

const words = (s: string | undefined): string[] => (s ?? '').split(/\s+/).filter(Boolean);

/**
 * Word-level diff via longest common subsequence. Whitespace is normalised.
 * Returns null when either side exceeds MAX_WORD_DIFF_WORDS so callers can say so.
 */
export const diffWords = (oldText: string | undefined, newText: string | undefined): WordDiffOp[] | null => {
    const a = words(oldText);
    const b = words(newText);
    if (a.length > MAX_WORD_DIFF_WORDS || b.length > MAX_WORD_DIFF_WORDS) return null;

    const w = b.length + 1;
    const lcs = new Uint16Array((a.length + 1) * w);
    for (let i = a.length - 1; i >= 0; i--) {
        for (let j = b.length - 1; j >= 0; j--) {
            lcs[i * w + j] = a[i] === b[j]
                ? lcs[(i + 1) * w + j + 1] + 1
                : Math.max(lcs[(i + 1) * w + j], lcs[i * w + j + 1]);
        }
    }

    const ops: WordDiffOp[] = [];
    const push = (type: WordDiffOp['type'], text: string) => {
        const last = ops[ops.length - 1];
        if (last && last.type === type) last.text += ` ${text}`;
        else ops.push({ type, text });
    };
    let i = 0;
    let j = 0;
    while (i < a.length && j < b.length) {
        if (a[i] === b[j]) { push('same', a[i]); i++; j++; }
        else if (lcs[(i + 1) * w + j] >= lcs[i * w + j + 1]) { push('del', a[i]); i++; }
        else { push('ins', b[j]); j++; }
    }
    while (i < a.length) push('del', a[i++]);
    while (j < b.length) push('ins', b[j++]);
    return ops;
};
