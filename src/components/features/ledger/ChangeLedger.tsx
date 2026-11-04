import React, { useMemo } from 'react';
import { diffWords, type WordDiffOp } from '../../../utils/wordDiff';
import type { LedgerRecord } from '../../../data/sampleChange';

const countWords = (ops: WordDiffOp[], type: WordDiffOp['type']): number =>
    ops.filter((o) => o.type === type).reduce((n, o) => n + o.text.split(' ').length, 0);

const Ops: React.FC<{ ops: WordDiffOp[] }> = ({ ops }) => (
    <>
        {ops.map((op, i) => (
            <React.Fragment key={i}>
                {i > 0 && ' '}
                {op.type === 'same' && <span>{op.text}</span>}
                {op.type === 'del' && <del className="ledger-del"><span className="sr-only">Removed: </span>{op.text}</del>}
                {op.type === 'ins' && <ins className="ledger-ins"><span className="sr-only">Added: </span>{op.text}</ins>}
            </React.Fragment>
        ))}
    </>
);

/**
 * Renders the same word-level diff the history view uses (diffWords),
 * so every mark on screen is computed from the before/after text.
 */
export const ChangeLedger: React.FC<{ record: LedgerRecord }> = ({ record }) => {
    const rows = useMemo(
        () => record.fields.map((f) => ({ ...f, ops: diffWords(f.before, f.after) })),
        [record],
    );
    const added = rows.reduce((n, r) => n + (r.ops ? countWords(r.ops, 'ins') : 0), 0);
    const removed = rows.reduce((n, r) => n + (r.ops ? countWords(r.ops, 'del') : 0), 0);

    return (
        <section className="ledger" aria-labelledby="change-ledger-title">
            <div className="ledger-head">
                <h2 id="change-ledger-title" className="!text-xs !font-semibold !tracking-[0.08em] uppercase !text-[var(--text-secondary)] !font-[var(--font-mono)]">
                    Change ledger / {record.name} / {record.host}
                </h2>
                <span>{record.beforeLabel} to {record.afterLabel}</span>
            </div>
            {rows.map((r) => (
                <div className="ledger-row" key={r.label}>
                    <span className="ledger-field">{r.label}</span>
                    <p>{r.ops ? <Ops ops={r.ops} /> : r.after}</p>
                </div>
            ))}
            <div className="ledger-foot">
                <span>+{added} words added</span>
                <span>-{removed} words removed</span>
                <span>{record.isSample ? 'Sample record using example.com. Your saved snapshots replace it.' : 'From your two latest saved snapshots.'}</span>
            </div>
        </section>
    );
};
