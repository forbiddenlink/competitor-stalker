import { describe, expect, it } from 'vitest';
import { parseImportedJson, exportToCsv } from '../export';
const competitor = { id: 'audit-one', name: 'Audit One', website: '', threatLevel: 'Medium', features: {}, pricingModels: [], notes: '' };
const profile = { name: '', positionX: 50, positionY: 50, features: {}, pricingModels: [] };
const parse = (comp: unknown, userProfile: unknown = profile) => parseImportedJson(JSON.stringify({ competitors: [comp], userProfile }));
describe('import safety', () => {
    it.each([{ ...competitor, name: 12 }, { ...competitor, features: null }, { ...competitor, pricingModels: [null] }, { ...competitor, weaknesses: [{ text: 'missing fields' }] }, { ...competitor, positionX: 101 }, { ...competitor, socialHandles: { twitter: 12 } }, { ...competitor, website: 'javascript:alert(1)' }])('rejects incompatible records %# before replacing workspace', comp => expect(parse(comp)).toBeNull());
    it('rejects duplicate record IDs', () => expect(parseImportedJson(JSON.stringify({ competitors: [competitor, competitor], userProfile: profile }))).toBeNull());
    it('normalizes legacy sparse exports to usable records and profile', () => {
        const data = parse({ id: 'legacy', name: 'Legacy' }, { companyName: 'Legacy business', features: ['Deploy'] });
        expect(data?.competitors[0]).toMatchObject({ website: '', features: {}, pricingModels: [], notes: '', threatLevel: 'Medium' });
        expect(data?.userProfile).toMatchObject({ name: 'Legacy business', positionX: 50, positionY: 50, features: { Deploy: 'Have' }, pricingModels: [] });
    });
    it('neutralizes spreadsheet formulas and quotes carriage returns', () => {
        const csv = exportToCsv([{ ...competitor, threatLevel: 'Medium' as const, name: '=1+1', notes: 'line\rbreak' }]);
        expect(csv).toContain("'=1+1");
        expect(csv).toContain('"line\rbreak"');
    });
});

it('includes validated snapshot history in a complete JSON backup', async () => {
    const { exportToJson } = await import('../export');
    const history = [{ id: 'snapshot-one', competitorId: competitor.id, timestamp: '2026-10-08T00:00:00Z', type: 'auto' as const, data: { ...competitor, threatLevel: 'Medium' as const } }];
    const backup = exportToJson([{ ...competitor, threatLevel: 'Medium' as const }], profile, history);
    expect(parseImportedJson(backup)?.snapshots).toEqual(history);
});

it.each([
    { ...competitor, threatLevel: ['High'] },
    { ...competitor, weaknesses: [{ id: 'w', text: 'Audit', source: '', date: '', severity: ['Critical'] }] },
    { ...competitor, strategies: [{ id: 's', title: 'Audit', description: '', targetCompetitorId: competitor.id, status: ['Active'] }] },
])('rejects coerced enum values in imported and stored competitors %#', async value => {
    const { normalizeCompetitors } = await import('../validation');
    expect(parse(value)).toBeNull();
    expect(normalizeCompetitors([value])).toBeNull();
});
it('rejects a snapshot with an array type', async () => {
    const { normalizeSnapshots } = await import('../validation');
    expect(normalizeSnapshots([{ id: 's', competitorId: competitor.id, timestamp: '2026-10-08', type: ['auto'], data: competitor }])).toBeNull();
});

it.each([
    ['weaknesses', { id: 'nested', text: 'Audit', source: '', date: '', severity: 'Low' }],
    ['strategies', { id: 'nested', title: 'Audit', description: '', targetCompetitorId: competitor.id, status: 'Planned' }],
    ['sources', { id: 'nested', url: 'https://example.com', label: 'Audit', addedAt: '' }],
] as const)('rejects duplicate and empty IDs within %s to avoid deleting multiple records', (field, record) => {
    expect(parse({ ...competitor, [field]: [record, record] })).toBeNull();
    expect(parse({ ...competitor, [field]: [{ ...record, id: '' }] })).toBeNull();
});
