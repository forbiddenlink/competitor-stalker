import { lookup } from 'node:dns/promises'
import { isIP } from 'node:net'
import { request as httpRequest, type IncomingMessage, type RequestOptions } from 'node:http'
import { request as httpsRequest } from 'node:https'
import { createGunzip, createInflate, createBrotliDecompress } from 'node:zlib'
import type { VercelRequest, VercelResponse } from '@vercel/node'
import * as cheerio from 'cheerio'

export interface CompetitorPageData {
    title: string
    description: string | undefined
    pricing: string
    features: string[]
    h1: string
    h2s: string[]
    socialLinks: SocialLinks
    techStack: string[]
    ctaButtons: string[]
    openGraph: Record<string, string | undefined>
}

export interface SocialLinks {
    twitter?: string
    linkedin?: string
    facebook?: string
    github?: string
    youtube?: string
}

/**
 * Parse competitor page HTML and extract key data points
 */
function parseCompetitorPage(html: string, pageUrl: URL): CompetitorPageData {
    const $ = cheerio.load(html)

    return {
        title: $('title').text().trim(),
        description: $('meta[name="description"]').attr('content')?.trim(),
        pricing: extractPricing($),
        features: extractFeatures($),
        h1: $('h1').first().text().trim(),
        h2s: $('h2')
            .map((_, el) => $(el).text().trim())
            .get()
            .filter(Boolean),
        socialLinks: extractSocialLinks($, pageUrl),
        techStack: extractTechStack($),
        ctaButtons: extractCTAs($),
        openGraph: extractOpenGraph($),
    }
}

/**
 * Extract pricing information from the page
 */
function extractPricing($: cheerio.CheerioAPI): string {
    // Try common pricing selectors
    const pricingSelectors = [
        '.pricing',
        '[class*="price"]',
        '[class*="pricing"]',
        '[data-pricing]',
        '.plan',
        '[class*="plan"]',
    ]

    for (const selector of pricingSelectors) {
        const text = $(selector).text().trim()
        if (text) return text.slice(0, 500) // Limit length
    }

    // Look for dollar signs in text
    const dollarPattern = /\$[\d,]+(?:\.\d{2})?(?:\/\w+)?/g
    const bodyText = $('body').text()
    const matches = bodyText.match(dollarPattern)
    if (matches?.length) {
        return matches.slice(0, 5).join(', ')
    }

    return ''
}

/**
 * Extract feature list from the page
 */
function extractFeatures($: cheerio.CheerioAPI): string[] {
    const featureSelectors = [
        '[class*="feature"] li',
        '[class*="features"] li',
        '.feature-list li',
        '[class*="benefit"] li',
        '[class*="capability"] li',
    ]

    for (const selector of featureSelectors) {
        const features = $(selector)
            .map((_, el) => $(el).text().trim())
            .get()
            .filter(Boolean)

        if (features.length > 0) {
            return features.slice(0, 20)
        }
    }

    // Fallback: look for elements with "feature" in class
    return $('[class*="feature"]')
        .map((_, el) => $(el).text().trim())
        .get()
        .filter((text) => text.length > 0 && text.length < 200)
        .slice(0, 10)
}

/**
 * Extract social media links
 */
function extractSocialLinks($: cheerio.CheerioAPI, pageUrl: URL): SocialLinks {
    const links: SocialLinks = {}
    const domains: Array<[keyof SocialLinks, string[]]> = [
        ['twitter', ['twitter.com', 'x.com']], ['linkedin', ['linkedin.com']],
        ['facebook', ['facebook.com']], ['github', ['github.com']], ['youtube', ['youtube.com']],
    ]
    $('a[href]').each((_, el) => {
        try {
            const url = new URL($(el).attr('href')!, pageUrl)
            if (!['http:', 'https:'].includes(url.protocol)) return
            for (const [key, hosts] of domains) {
                if (hosts.some(host => url.hostname === host || url.hostname.endsWith(`.${host}`))) links[key] = url.href
            }
        } catch { /* Ignore malformed links without losing other extracted data. */ }
    })
    return links
}

/**
 * Attempt to detect tech stack from page source
 */
function extractTechStack($: cheerio.CheerioAPI): string[] {
    const tech: string[] = []
    const html = $.html()

    // Check for common frameworks/libraries
    const techPatterns: Array<[RegExp, string]> = [
        [/react/i, 'React'],
        [/vue/i, 'Vue'],
        [/angular/i, 'Angular'],
        [/svelte/i, 'Svelte'],
        [/next/i, 'Next.js'],
        [/nuxt/i, 'Nuxt'],
        [/gatsby/i, 'Gatsby'],
        [/tailwind/i, 'Tailwind CSS'],
        [/bootstrap/i, 'Bootstrap'],
        [/stripe/i, 'Stripe'],
        [/intercom/i, 'Intercom'],
        [/segment/i, 'Segment'],
        [/google-analytics|gtag|ga\.js/i, 'Google Analytics'],
        [/hotjar/i, 'Hotjar'],
        [/mixpanel/i, 'Mixpanel'],
        [/hubspot/i, 'HubSpot'],
        [/zendesk/i, 'Zendesk'],
        [/cloudflare/i, 'Cloudflare'],
        [/vercel/i, 'Vercel'],
        [/netlify/i, 'Netlify'],
    ]

    for (const [pattern, name] of techPatterns) {
        if (pattern.test(html) && !tech.includes(name)) {
            tech.push(name)
        }
    }

    return tech
}

/**
 * Extract call-to-action button text
 */
function extractCTAs($: cheerio.CheerioAPI): string[] {
    const ctaSelectors = [
        'a[class*="cta"]',
        'button[class*="cta"]',
        'a[class*="btn-primary"]',
        'button[class*="btn-primary"]',
        'a[class*="button-primary"]',
        'a[href*="signup"]',
        'a[href*="sign-up"]',
        'a[href*="register"]',
        'a[href*="trial"]',
        'a[href*="demo"]',
        'a[href*="get-started"]',
    ]

    const ctas: string[] = []

    for (const selector of ctaSelectors) {
        $(selector).each((_, el) => {
            const text = $(el).text().trim()
            if (text && text.length < 50 && !ctas.includes(text)) {
                ctas.push(text)
            }
        })
    }

    return ctas.slice(0, 10)
}

/**
 * Extract Open Graph metadata
 */
function extractOpenGraph($: cheerio.CheerioAPI): Record<string, string | undefined> {
    return {
        title: $('meta[property="og:title"]').attr('content'),
        description: $('meta[property="og:description"]').attr('content'),
        image: $('meta[property="og:image"]').attr('content'),
        type: $('meta[property="og:type"]').attr('content'),
        url: $('meta[property="og:url"]').attr('content'),
        siteName: $('meta[property="og:site_name"]').attr('content'),
    }
}

const MAX_BODY_BYTES = 2 * 1024 * 1024
const FETCH_TIMEOUT_MS = 10_000
const MAX_REDIRECTS = 5
const RATE_LIMIT_MAX = 10
const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMIT_MAX_KEYS = 5_000

const BLOCKED_HOSTNAMES = new Set([
    'localhost',
    'metadata',
    'metadata.google.internal',
    'instance-data',
    'instance-data.ec2.internal',
])

/** Parse one inet_aton-style component (decimal, 0octal, 0xhex). NaN if invalid. */
function parseV4Part(part: string): number {
    if (/^0x[0-9a-f]+$/i.test(part)) return parseInt(part, 16)
    if (/^0[0-7]+$/.test(part)) return parseInt(part, 8)
    if (/^(0|[1-9]\d*)$/.test(part)) return parseInt(part, 10)
    return NaN
}

/**
 * Parse an IPv4 literal in any inet_aton form (1-4 parts; decimal, octal, hex)
 * into a 32-bit number, or null when the string is not such a literal.
 */
function parseIPv4Loose(host: string): number | null {
    const parts = host.split('.')
    if (parts.length < 1 || parts.length > 4) return null
    const nums = parts.map(parseV4Part)
    if (nums.some((n) => Number.isNaN(n))) return null
    const last = nums[nums.length - 1]
    const lead = nums.slice(0, -1)
    if (lead.some((n) => n > 255)) return null
    if (last >= 256 ** (5 - nums.length)) return null
    let value = last
    lead.forEach((n, i) => {
        value += n * 256 ** (3 - i)
    })
    return value
}

function ipv4Reason(n: number): string | null {
    const a = Math.floor(n / 2 ** 24)
    const b = Math.floor(n / 2 ** 16) % 256
    if (a === 0) return 'unspecified'
    if (a === 10) return 'private'
    if (a === 127) return 'loopback'
    if (a === 169 && b === 254) return 'link-local' // incl. cloud metadata
    if (a === 172 && b >= 16 && b <= 31) return 'private'
    if (a === 192 && b === 168) return 'private'
    if (a === 100 && b >= 64 && b <= 127) return 'cgnat'
    if (a >= 224) return 'reserved' // multicast + future-use + broadcast
    return null
}

/** Expand an IPv6 literal to eight 16-bit groups, or null if malformed. */
function parseIPv6(input: string): number[] | null {
    let ip = input.split('%')[0] // drop zone id
    const dotted = ip.match(/(\d+\.\d+\.\d+\.\d+)$/)
    if (dotted) {
        const v4 = parseIPv4Loose(dotted[1])
        if (v4 === null) return null
        ip = ip.slice(0, -dotted[1].length) + `${(v4 >>> 16).toString(16)}:${(v4 & 0xffff).toString(16)}`
    }
    const halves = ip.split('::')
    if (halves.length > 2) return null
    const toGroups = (h: string) => (h === '' ? [] : h.split(':'))
    const left = toGroups(halves[0])
    const right = halves.length === 2 ? toGroups(halves[1]) : []
    const missing = 8 - left.length - right.length
    if (halves.length === 2 ? missing < 1 : missing !== 0) return null
    const all = [...left, ...Array<string>(halves.length === 2 ? missing : 0).fill('0'), ...right]
    const groups = all.map((g) => (/^[0-9a-f]{1,4}$/i.test(g) ? parseInt(g, 16) : NaN))
    return groups.length === 8 && groups.every((g) => !Number.isNaN(g)) ? groups : null
}

/**
 * Return a reason string if the address falls in a private, loopback,
 * link-local, or otherwise reserved range that must never be reachable from
 * the scraper; null means a routable public IP. Accepts IPv4 in any
 * inet_aton form (decimal, octal, hex, short), bracketed or zoned IPv6, and
 * unwraps every IPv6 form that embeds an IPv4 address (::ffff:, ::/96,
 * 64:ff9b::/96, 6to4). Anything unparseable is blocked (fail closed).
 */
export function blockedIpReason(input: string): string | null {
    const ip = input.replace(/^\[|\]$/g, '')

    if (!ip.includes(':')) {
        const v4 = parseIPv4Loose(ip)
        return v4 === null ? 'unparseable' : ipv4Reason(v4)
    }

    const g = parseIPv6(ip)
    if (!g) return 'unparseable'
    const v4From = (hi: number, lo: number) => hi * 65536 + lo

    if (g.every((x) => x === 0)) return 'unspecified'
    if (g.slice(0, 7).every((x) => x === 0) && g[7] === 1) return 'loopback'
    // ::ffff:0:0/96 mapped, ::/96 compatible, 64:ff9b::/96 NAT64
    const mapped = g.slice(0, 5).every((x) => x === 0) && g[5] === 0xffff
    const compat = g.slice(0, 6).every((x) => x === 0)
    const nat64 = g[0] === 0x64 && g[1] === 0xff9b && g.slice(2, 6).every((x) => x === 0)
    if (mapped || compat || nat64) return ipv4Reason(v4From(g[6], g[7])) ?? (compat ? 'reserved' : null)
    if (g[0] === 0x2002) return ipv4Reason(v4From(g[1], g[2])) ?? null // 6to4
    if (g[0] === 0x2001 && g[1] === 0) return 'reserved' // Teredo
    if ((g[0] & 0xffc0) === 0xfe80) return 'link-local'
    if ((g[0] & 0xfe00) === 0xfc00) return 'unique-local'
    if ((g[0] & 0xff00) === 0xff00) return 'multicast'
    return null
}

// Per-IP fixed-window rate limit. State lives in this lambda instance's
// memory only: each warm instance counts separately and a cold start resets
// it, so this is best-effort abuse damping, NOT a hard global limit. A shared
// store (Vercel Firewall rate-limit rules, Upstash) would be needed for that.
const hits = new Map<string, { count: number; resetAt: number }>()

export function resetRateLimit(): void {
    hits.clear()
}

function rateLimited(ip: string, now = Date.now()): boolean {
    if (hits.size > RATE_LIMIT_MAX_KEYS) {
        for (const [k, v] of hits) if (v.resetAt <= now) hits.delete(k)
        if (hits.size > RATE_LIMIT_MAX_KEYS) hits.clear() // bound memory under a spray
    }
    const entry = hits.get(ip)
    if (!entry || entry.resetAt <= now) {
        hits.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
        return false
    }
    entry.count += 1
    return entry.count > RATE_LIMIT_MAX
}

function clientIp(req: VercelRequest): string {
    const h = req.headers['x-vercel-forwarded-for'] ?? req.headers['x-forwarded-for']
    const first = (Array.isArray(h) ? h[0] : h)?.split(',')[0]?.trim()
    return first || req.socket?.remoteAddress || 'unknown'
}

/** Origin, when sent, must be this deployment's own host. */
function originAllowed(req: VercelRequest): boolean {
    const origin = req.headers.origin
    if (origin === undefined) return true
    try {
        return new URL(origin).host === req.headers.host
    } catch {
        return false
    }
}

class BlockedError extends Error {}
class UpstreamError extends Error {}

interface PublicAddress { address: string; family: number }

function withinDeadline<T>(operation: Promise<T>, signal: AbortSignal): Promise<T> {
    return new Promise((resolve, reject) => {
        const abort = () => reject(new Error('Request timed out'))
        if (signal.aborted) { abort(); return }
        signal.addEventListener('abort', abort, { once: true })
        operation.then(resolve, reject).finally(() => signal.removeEventListener('abort', abort))
    })
}

async function validateTarget(parsed: URL, signal: AbortSignal): Promise<PublicAddress> {
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') throw new BlockedError('scheme')
    if (parsed.username || parsed.password) throw new BlockedError('credentials')
    const hostname = parsed.hostname.replace(/^\[|\]$/g, '').toLowerCase().replace(/\.$/, '')
    if (BLOCKED_HOSTNAMES.has(hostname) || hostname.endsWith('.localhost') || hostname.endsWith('.internal')) throw new BlockedError('host')
    if (isIP(hostname)) {
        if (blockedIpReason(hostname)) throw new BlockedError('host')
        return { address: hostname, family: isIP(hostname) }
    }
    let resolved: PublicAddress[]
    try { resolved = await withinDeadline(lookup(hostname, { all: true }), signal) }
    catch { if (signal.aborted) throw new Error('Request timed out'); throw new UpstreamError('dns') }
    if (!resolved.length || resolved.some(result => blockedIpReason(result.address))) throw new BlockedError('host')
    return resolved[0]
}

/** Keep the original hostname for Host/TLS verification, but connect only to a checked address. */
function requestPublicPage(target: URL, address: PublicAddress, signal: AbortSignal): Promise<IncomingMessage> {
    return new Promise((resolve, reject) => {
        const options: RequestOptions & { autoSelectFamily: boolean; servername?: string } = {
            signal, agent: false, autoSelectFamily: false,
            ...(target.protocol === 'https:' && !isIP(target.hostname.replace(/^\[|\]$/g, '')) ? { servername: target.hostname } : {}),
            lookup: (_hostname, _options, callback) => queueMicrotask(() => callback(null, address.address, address.family)),
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; CompetitorStalker/1.0)',
                'Accept': 'text/html,application/xhtml+xml', 'Accept-Language': 'en-US,en;q=0.5',
                'Accept-Encoding': 'identity',
            },
        }
        const request = (target.protocol === 'https:' ? httpsRequest : httpRequest)(target, options, resolve)
        request.once('error', reject)
        request.end()
    })
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
    if (!originAllowed(req)) return res.status(403).json({ error: 'Cross-origin requests are not allowed' })
    if (rateLimited(clientIp(req))) return res.status(429).json({ error: 'Too many requests' })
    const { url } = req.body ?? {}
    if (!url || typeof url !== 'string') return res.status(400).json({ error: 'URL is required' })
    let target: URL
    try { target = new URL(url) }
    catch { return res.status(400).json({ error: 'Invalid URL' }) }
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
    try {
        for (let redirects = 0; redirects <= MAX_REDIRECTS; redirects++) {
            const address = await validateTarget(target, controller.signal)
            const response = await requestPublicPage(target, address, controller.signal)
            const status = response.statusCode ?? 502
            if ([301, 302, 303, 307, 308].includes(status)) {
                const location = response.headers.location
                response.destroy()
                if (!location || redirects === MAX_REDIRECTS) throw new UpstreamError('redirect could not be followed')
                try { target = new URL(location, target) }
                catch { throw new UpstreamError('invalid redirect') }
                continue
            }
            if (status < 200 || status >= 300) { response.destroy(); return res.status(502).json({ error: 'Target returned an error' }) }
            if (!/^(text\/html|application\/xhtml\+xml)(?:;|$)/i.test(response.headers['content-type'] || '')) {
                response.destroy()
                return res.status(415).json({ error: 'Only HTML pages can be scraped' })
            }
            const declared = Number(response.headers['content-length'])
            if (Number.isFinite(declared) && declared > MAX_BODY_BYTES) { response.destroy(); return res.status(413).json({ error: 'Response too large' }) }
            const encoding = response.headers['content-encoding']?.toLowerCase()
            const decoder = encoding === 'gzip' ? createGunzip() : encoding === 'deflate' ? createInflate() : encoding === 'br' ? createBrotliDecompress() : null
            if (encoding && encoding !== 'identity' && !decoder) { response.destroy(); return res.status(400).json({ error: 'Unsupported page encoding' }) }
            if (decoder) response.on('error', error => decoder.destroy(error))
            const body = decoder ? response.pipe(decoder) : response
            const chunks: Buffer[] = []
            let bytes = 0
            try {
                for await (const chunk of body) {
                    const value = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
                    bytes += value.length
                    if (bytes > MAX_BODY_BYTES) return res.status(413).json({ error: 'Page is too large to extract. Enter details manually.' })
                    chunks.push(value)
                }
            } finally { body.destroy(); response.destroy() }
            if (!bytes) return res.status(400).json({ error: 'The page was empty' })
            return res.status(200).json(parseCompetitorPage(Buffer.concat(chunks).toString('utf8'), target))
        }
    } catch (error) {
        if (controller.signal.aborted || (error instanceof Error && error.name === 'AbortError')) return res.status(504).json({ error: 'Request timed out' })
        if (error instanceof BlockedError) return res.status(400).json({ error: 'URL host is not allowed' })
        if (!(error instanceof UpstreamError)) console.error('Page extraction failed')
        return res.status(502).json({ error: 'Failed to fetch page' })
    } finally { clearTimeout(timeout) }
}
