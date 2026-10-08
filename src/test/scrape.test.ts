import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { EventEmitter } from 'node:events';
import { PassThrough } from 'node:stream';
import { gzipSync } from 'node:zlib';
import type { RequestOptions, IncomingMessage } from 'node:http';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { act, renderHook } from '@testing-library/react';
import { useScraper } from '../hooks/useScraper';
import handler from '../../api/scrape';
const transport = vi.hoisted(() => ({ request: vi.fn(), lookup: vi.fn<() => Promise<{ address: string; family: number }[]>>(), responses: [] as { status?: number; headers?: Record<string, string>; body?: string | Buffer; hold?: boolean }[], addresses: [] as string[] }));
vi.mock('node:http', async importOriginal => { const actual = await importOriginal<typeof import('node:http')>(); return { ...actual, request: transport.request, default: { ...actual, request: transport.request } }; });
vi.mock('node:https', async importOriginal => { const actual = await importOriginal<typeof import('node:https')>(); return { ...actual, request: transport.request, default: { ...actual, request: transport.request } }; });
vi.mock('node:dns/promises', async importOriginal => {
    const actual = await importOriginal<typeof import('node:dns/promises')>();
    const lookup = transport.lookup;
    return { ...actual, lookup, default: { ...actual, lookup } };
});
const call = async (body: unknown, method = 'POST') => {
    let code = 0; let data: unknown;
    const res = { status: (status: number) => { code = status; return res; }, json: (value: unknown) => { data = value; return res; } };
    await handler({ method, body } as VercelRequest, res as unknown as VercelResponse);
    return { code, data };
};
beforeEach(() => {
    transport.responses.length = 0; transport.addresses.length = 0;
    transport.lookup.mockResolvedValue([{ address: '93.184.216.34', family: 4 }]);
    transport.request.mockReset().mockImplementation((_url: URL, options: RequestOptions, callback: (response: IncomingMessage) => void) => {
        const request = new EventEmitter();
        Object.assign(request, { end: () => {
            const emitResponse = () => queueMicrotask(() => {
                const fixture = transport.responses.shift() ?? {};
                const response = new PassThrough();
                Object.assign(response, { statusCode: fixture.status ?? 200, headers: fixture.headers ?? { 'content-type': 'text/html' } });
                callback(response as unknown as IncomingMessage);
                if (fixture.hold) { options.signal?.addEventListener('abort', () => response.destroy(Object.assign(new Error('Aborted'), { name: 'AbortError' })), { once: true }); return; }
                response.end(fixture.body ?? '<title>Audit public page</title><div class="features"><li>Deploy</li></div>');
            });
            if (options.lookup) options.lookup('example.com', {}, (_error, address) => { transport.addresses.push(String(address)); emitResponse(); });
            else emitResponse();
        } });
        return request;
    });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('<title>Old transport</title>', { headers: { 'content-type': 'text/html' } })));
});
afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers(); });
describe('scrape endpoint boundary', () => {
    it('handles missing request bodies as validation errors', async () => expect((await call(undefined)).code).toBe(400));
    it('pins connections to the validated address without a second DNS lookup', async () => {
        transport.lookup.mockResolvedValueOnce([{ address: '93.184.216.34', family: 4 }]).mockResolvedValue([{ address: '127.0.0.1', family: 4 }]);
        expect((await call({ url: 'https://example.com' })).code).toBe(200);
        expect(transport.addresses).toEqual(['93.184.216.34']);
        expect(transport.lookup).toHaveBeenCalledTimes(1);
        expect(transport.request).toHaveBeenCalledWith(expect.objectContaining({ hostname: 'example.com' }), expect.objectContaining({ agent: false, servername: 'example.com', autoSelectFamily: false }), expect.any(Function));
    });
    it('rejects redirects to private hosts before another request', async () => {
        transport.responses.push({ status: 302, headers: { location: 'http://127.0.0.1/admin' } });
        expect((await call({ url: 'https://example.com' })).code).toBe(400);
        expect(transport.request).toHaveBeenCalledTimes(1);
    });
    it.each(['http://[::ffff:a9fe:a9fe]', 'http://[febf::1]', 'http://127.0.0.1', 'http://10.1.2.3', 'file:///tmp/a'])('rejects unsafe address %s', async url => {
        expect((await call({ url })).code).toBe(400);
        expect(transport.request).not.toHaveBeenCalled();
    });
    it('validates and pins each public redirect then extracts actual HTML', async () => {
        transport.responses.push({ status: 301, headers: { location: 'https://other.example/public' } });
        transport.lookup.mockResolvedValueOnce([{ address: '93.184.216.34', family: 4 }]).mockResolvedValueOnce([{ address: '93.184.216.35', family: 4 }]);
        expect(await call({ url: 'https://example.com/start' })).toMatchObject({ code: 200, data: { title: 'Audit public page', features: ['Deploy'] } });
        expect(transport.addresses).toEqual(['93.184.216.34', '93.184.216.35']);
    });
    it('does not treat JSON as a successfully scraped page', async () => {
        transport.responses.push({ headers: { 'content-type': 'application/json' }, body: '{}' });
        expect((await call({ url: 'https://example.com' })).code).toBe(400);
    });
    it('normalizes protocol-relative social links into a response the client accepts', async () => {
        transport.responses.push({ body: '<title>Social page</title><a href="//x.com/acme">Follow</a><a href="javascript:github.com">Unsafe</a>' });
        const response = await call({ url: 'https://example.com' });
        expect(response).toMatchObject({ code: 200, data: { socialLinks: { twitter: 'https://x.com/acme' } } });
        expect((response.data as { socialLinks: object }).socialLinks).not.toHaveProperty('github');
        vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify(response.data)));
        const { result } = renderHook(useScraper);
        await act(async () => { expect(await result.current.scrape('https://example.com')).not.toBeNull(); });
        expect(result.current.data?.socialLinks.twitter).toBe('https://x.com/acme');
    });
    it('bounds stalled DNS validation with the overall request deadline', async () => {
        vi.useFakeTimers(); transport.lookup.mockImplementation(() => new Promise(() => {}));
        const pending = call({ url: 'https://example.com' });
        await vi.advanceTimersByTimeAsync(10001);
        expect((await pending).code).toBe(504);
        expect(transport.request).not.toHaveBeenCalled();
    });
    it('times out while waiting for a page body', async () => {
        vi.useFakeTimers(); transport.responses.push({ hold: true });
        const pending = call({ url: 'https://example.com' });
        await vi.advanceTimersByTimeAsync(10001);
        expect((await pending).code).toBe(504);
    });
    it('extracts compressed HTML and applies limits after decompression', async () => {
        transport.responses.push({ headers: { 'content-type': 'text/html', 'content-encoding': 'gzip' }, body: gzipSync('<title>Compressed page</title>') });
        expect(await call({ url: 'https://example.com' })).toMatchObject({ code: 200, data: { title: 'Compressed page' } });
        transport.responses.push({ headers: { 'content-type': 'text/html', 'content-encoding': 'gzip' }, body: gzipSync('x'.repeat(2 * 1024 * 1024 + 1)) });
        expect((await call({ url: 'https://example.com' })).code).toBe(413);
    });
    it('rejects oversized HTML', async () => {
        transport.responses.push({ body: 'x'.repeat(2 * 1024 * 1024 + 1) });
        expect((await call({ url: 'https://example.com' })).code).toBe(413);
    });
});
