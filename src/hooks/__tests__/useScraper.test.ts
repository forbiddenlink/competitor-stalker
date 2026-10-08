import { act, renderHook } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { useScraper } from '../useScraper';
const intel = (title: string) => ({ title, description: '', pricing: '', features: [], h1: '', h2s: [], socialLinks: {}, techStack: [], ctaButtons: [] });
afterEach(() => vi.unstubAllGlobals());
it('ignores stale responses when a later scan finishes first', async () => {
    let finishFirst!: (response: Response) => void;
    vi.stubGlobal('fetch', vi.fn().mockImplementationOnce(() => new Promise(resolve => { finishFirst = resolve; })).mockResolvedValueOnce(new Response(JSON.stringify(intel('Newer')))));
    const { result } = renderHook(useScraper);
    let old!: Promise<unknown>;
    act(() => { old = result.current.scrape('https://example.com/old'); });
    await act(async () => { await result.current.scrape('https://example.com/new'); });
    await act(async () => { finishFirst(new Response(JSON.stringify(intel('Older')))); expect(await old).toBeNull(); });
    expect(result.current.data?.title).toBe('Newer');
});
it('rejects malformed success payloads rather than crashing the form', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ title: 'Incomplete' }))));
    const { result } = renderHook(useScraper);
    await act(async () => { expect(await result.current.scrape('https://example.com')).toBeNull(); });
    expect(result.current.error).toMatch(/invalid|unavailable/i);
});
it('reset prevents an interrupted response from restoring stale data', async () => {
    let finish!: (response: Response) => void;
    vi.stubGlobal('fetch', vi.fn().mockImplementation(() => new Promise(resolve => { finish = resolve; })));
    const { result } = renderHook(useScraper);
    let pending!: Promise<unknown>;
    act(() => { pending = result.current.scrape('https://example.com'); });
    act(() => result.current.reset());
    await act(async () => { finish(new Response(JSON.stringify(intel('Cancelled')))); await pending; });
    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
});
