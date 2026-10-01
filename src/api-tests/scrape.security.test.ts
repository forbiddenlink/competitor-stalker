import { beforeEach, describe, expect, it, vi } from 'vitest'

const lookupMock = vi.hoisted(() => vi.fn())
vi.mock('node:dns/promises', () => ({ lookup: lookupMock, default: { lookup: lookupMock } }))

import handler, { blockedIpReason, resetRateLimit } from '../../api/scrape'

interface FakeRes {
    statusCode: number
    body: unknown
    status: (c: number) => FakeRes
    json: (b: unknown) => FakeRes
}

function makeRes(): FakeRes {
    const res: FakeRes = {
        statusCode: 200,
        body: undefined,
        status(c) {
            res.statusCode = c
            return res
        },
        json(b) {
            res.body = b
            return res
        },
    }
    return res
}

async function call(
    url: string,
    opts: { headers?: Record<string, string>; ip?: string } = {},
): Promise<FakeRes> {
    const res = makeRes()
    const req = {
        method: 'POST',
        body: { url },
        headers: { host: 'app.example', 'x-forwarded-for': opts.ip ?? '203.0.113.9', ...opts.headers },
        socket: { remoteAddress: '198.51.100.1' },
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await handler(req as any, res as any)
    return res
}

function htmlResponse(body = '<html><head><title>Hi</title></head><body><h1>x</h1></body></html>', headers: Record<string, string> = {}) {
    return new Response(body, { status: 200, headers: { 'content-type': 'text/html; charset=utf-8', ...headers } })
}

beforeEach(() => {
    resetRateLimit()
    lookupMock.mockReset()
    lookupMock.mockResolvedValue([{ address: '93.184.216.34', family: 4 }])
    vi.stubGlobal('fetch', vi.fn(async () => htmlResponse()))
})

describe('blockedIpReason bypass forms', () => {
    const blocked: Array<[string, string]> = [
        ['::ffff:7f00:1', 'IPv4-mapped loopback (hex form URL emits)'],
        ['::ffff:a9fe:a9fe', 'IPv4-mapped metadata'],
        ['::ffff:127.0.0.1', 'IPv4-mapped dotted'],
        ['::7f00:1', 'IPv4-compatible loopback'],
        ['64:ff9b::7f00:1', 'NAT64 loopback'],
        ['64:ff9b::a9fe:a9fe', 'NAT64 metadata'],
        ['2002:7f00:1::', '6to4 loopback'],
        ['::1', 'loopback v6'],
        ['::', 'unspecified v6'],
        ['fe80::1', 'link-local v6'],
        ['febf::1', 'link-local v6 upper edge'],
        ['fc00::1', 'ULA'],
        ['fdff::1', 'ULA'],
        ['ff02::1', 'multicast v6'],
        ['0:0:0:0:0:ffff:7f00:1', 'expanded mapped'],
        ['127.0.0.1', 'loopback'],
        ['127.255.255.254', 'loopback range'],
        ['10.1.2.3', 'private'],
        ['172.16.0.1', 'private'],
        ['172.31.255.255', 'private'],
        ['192.168.1.1', 'private'],
        ['169.254.169.254', 'metadata'],
        ['100.64.0.1', 'cgnat'],
        ['100.127.255.255', 'cgnat'],
        ['0.0.0.0', 'unspecified'],
        ['0.1.2.3', '0/8'],
        ['224.0.0.1', 'multicast'],
        ['255.255.255.255', 'broadcast'],
        ['2130706433', 'decimal'],
        ['0x7f000001', 'hex'],
        ['0177.0.0.1', 'octal'],
        ['127.1', 'short form'],
        ['0x7f.1', 'mixed hex short'],
    ]
    it.each(blocked)('blocks %s (%s)', (ip) => {
        expect(blockedIpReason(ip)).not.toBeNull()
    })

    const allowed = ['93.184.216.34', '8.8.8.8', '172.32.0.1', '100.63.255.255', '2606:4700:4700::1111', '::ffff:5db8:d822']
    it.each(allowed)('allows public %s', (ip) => {
        expect(blockedIpReason(ip)).toBeNull()
    })
})

describe('handler: URL forms', () => {
    const urls = [
        'http://[::ffff:127.0.0.1]/',
        'http://[::ffff:7f00:1]/',
        'http://[::ffff:169.254.169.254]/latest/meta-data',
        'http://2130706433/',
        'http://0x7f000001/',
        'http://0177.0.0.1/',
        'http://127.1/',
        'http://[::1]/',
        'http://localhost/',
        'http://foo.localhost/',
        'http://metadata.google.internal/',
        'http://169.254.169.254/',
        'http://0.0.0.0/',
        'ftp://example.com/',
    ]
    it.each(urls)('rejects %s without fetching', async (u) => {
        const res = await call(u)
        expect(res.statusCode).toBe(400)
        expect(fetch).not.toHaveBeenCalled()
    })

    it('rejects a hostname whose DNS answer includes any private address', async () => {
        lookupMock.mockResolvedValue([
            { address: '93.184.216.34', family: 4 },
            { address: '::ffff:7f00:1', family: 6 },
        ])
        const res = await call('http://rebind.example/')
        expect(res.statusCode).toBe(400)
        expect(fetch).not.toHaveBeenCalled()
    })
})

describe('handler: redirects', () => {
    it('calls fetch with redirect: manual', async () => {
        await call('http://public.example/')
        const init = vi.mocked(fetch).mock.calls[0][1] as RequestInit
        expect(init.redirect).toBe('manual')
    })

    it('blocks a redirect to a private IP literal', async () => {
        vi.mocked(fetch).mockResolvedValueOnce(
            new Response(null, { status: 302, headers: { location: 'http://169.254.169.254/latest' } }),
        )
        const res = await call('http://public.example/')
        expect(res.statusCode).toBe(400)
        expect(fetch).toHaveBeenCalledTimes(1)
    })

    it('blocks a redirect to a mapped IPv6 loopback', async () => {
        vi.mocked(fetch).mockResolvedValueOnce(
            new Response(null, { status: 301, headers: { location: 'http://[::ffff:7f00:1]/' } }),
        )
        const res = await call('http://public.example/')
        expect(res.statusCode).toBe(400)
        expect(fetch).toHaveBeenCalledTimes(1)
    })

    it('blocks a redirect to a hostname resolving to a private address', async () => {
        lookupMock.mockImplementation(async (h: string) =>
            h === 'internal.example'
                ? [{ address: '10.0.0.5', family: 4 }]
                : [{ address: '93.184.216.34', family: 4 }],
        )
        vi.mocked(fetch).mockResolvedValueOnce(
            new Response(null, { status: 307, headers: { location: '/x' } }),
        )
        vi.mocked(fetch).mockResolvedValueOnce(
            new Response(null, { status: 302, headers: { location: 'http://internal.example/' } }),
        )
        const res = await call('http://public.example/')
        expect(res.statusCode).toBe(400)
        expect(fetch).toHaveBeenCalledTimes(2)
    })

    it('follows a safe redirect and returns parsed data', async () => {
        vi.mocked(fetch).mockResolvedValueOnce(
            new Response(null, { status: 301, headers: { location: 'https://public.example/new' } }),
        )
        vi.mocked(fetch).mockResolvedValueOnce(htmlResponse())
        const res = await call('http://public.example/')
        expect(res.statusCode).toBe(200)
        expect((res.body as { title: string }).title).toBe('Hi')
    })

    it('stops after too many redirects', async () => {
        vi.mocked(fetch).mockImplementation(
            async () => new Response(null, { status: 302, headers: { location: 'http://public.example/loop' } }),
        )
        const res = await call('http://public.example/')
        expect(res.statusCode).toBe(502)
        expect(vi.mocked(fetch).mock.calls.length).toBeLessThanOrEqual(6)
    })
})

describe('handler: response limits', () => {
    it('rejects a non-HTML content type', async () => {
        vi.mocked(fetch).mockResolvedValueOnce(
            new Response('{"a":1}', { status: 200, headers: { 'content-type': 'application/json' } }),
        )
        const res = await call('http://public.example/')
        expect(res.statusCode).toBe(415)
    })

    it('aborts a body larger than 2 MB (no content-length)', async () => {
        const chunk = new Uint8Array(512 * 1024).fill(97)
        let sent = 0
        const stream = new ReadableStream<Uint8Array>({
            pull(controller) {
                sent += 1
                controller.enqueue(chunk)
                if (sent > 100) controller.close()
            },
        })
        vi.mocked(fetch).mockResolvedValueOnce(
            new Response(stream, { status: 200, headers: { 'content-type': 'text/html' } }),
        )
        const res = await call('http://public.example/')
        expect(res.statusCode).toBe(413)
        expect(sent).toBeLessThan(10) // stopped reading early
    })

    it('rejects when content-length already exceeds the cap', async () => {
        vi.mocked(fetch).mockResolvedValueOnce(
            htmlResponse('<html></html>', { 'content-length': String(5 * 1024 * 1024) }),
        )
        const res = await call('http://public.example/')
        expect(res.statusCode).toBe(413)
    })

    it('does not echo upstream status text or error messages', async () => {
        vi.mocked(fetch).mockResolvedValueOnce(
            new Response('x', { status: 500, statusText: 'secret-internal-detail' }),
        )
        const res = await call('http://public.example/')
        expect(JSON.stringify(res.body)).not.toContain('secret-internal-detail')
        vi.mocked(fetch).mockRejectedValueOnce(new Error('connect ECONNREFUSED 10.0.0.1:5432'))
        const res2 = await call('http://public.example/')
        expect(JSON.stringify(res2.body)).not.toContain('10.0.0.1')
    })
})

describe('handler: same-origin check', () => {
    it('rejects a mismatched Origin', async () => {
        const res = await call('http://public.example/', { headers: { origin: 'https://evil.example' } })
        expect(res.statusCode).toBe(403)
        expect(fetch).not.toHaveBeenCalled()
    })

    it('rejects an unparseable Origin', async () => {
        const res = await call('http://public.example/', { headers: { origin: 'null' } })
        expect(res.statusCode).toBe(403)
    })

    it('allows a matching Origin and a missing Origin', async () => {
        expect((await call('http://public.example/', { headers: { origin: 'https://app.example' } })).statusCode).toBe(200)
        expect((await call('http://public.example/')).statusCode).toBe(200)
    })
})

describe('handler: rate limit', () => {
    it('returns 429 after the per-IP budget and isolates other IPs', async () => {
        const codes: number[] = []
        for (let i = 0; i < 12; i++) codes.push((await call('http://public.example/', { ip: '198.51.100.7' })).statusCode)
        expect(codes.slice(0, 10).every((c) => c === 200)).toBe(true)
        expect(codes[10]).toBe(429)
        expect(codes[11]).toBe(429)
        expect((await call('http://public.example/', { ip: '198.51.100.8' })).statusCode).toBe(200)
    })
})
