import { lookup } from 'node:dns/promises'
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
function parseCompetitorPage(html: string): CompetitorPageData {
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
        socialLinks: extractSocialLinks($),
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
function extractSocialLinks($: cheerio.CheerioAPI): SocialLinks {
    const links: SocialLinks = {}

    $('a[href*="twitter.com"], a[href*="x.com"]').each((_, el) => {
        links.twitter = $(el).attr('href')
    })

    $('a[href*="linkedin.com"]').each((_, el) => {
        links.linkedin = $(el).attr('href')
    })

    $('a[href*="facebook.com"]').each((_, el) => {
        links.facebook = $(el).attr('href')
    })

    $('a[href*="github.com"]').each((_, el) => {
        links.github = $(el).attr('href')
    })

    $('a[href*="youtube.com"]').each((_, el) => {
        links.youtube = $(el).attr('href')
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

/**
 * Check that a URL is public http(s) and that EVERY address its host resolves
 * to is public. Throws BlockedError otherwise. Residual risk: fetch() resolves
 * the name again, so a DNS-rebinding host can still answer differently the
 * second time; pinning the validated IP needs a custom undici dispatcher.
 */
async function assertPublicUrl(target: URL): Promise<void> {
    if (target.protocol !== 'http:' && target.protocol !== 'https:') {
        throw new BlockedError('scheme')
    }
    const host = target.hostname.replace(/^\[|\]$/g, '').toLowerCase().replace(/\.$/, '')
    if (BLOCKED_HOSTNAMES.has(host) || host.endsWith('.localhost') || host.endsWith('.internal')) {
        throw new BlockedError('host')
    }
    if (host.includes(':') || parseIPv4Loose(host) !== null) {
        if (blockedIpReason(host)) throw new BlockedError('ip')
        return
    }
    let resolved: Array<{ address: string }>
    try {
        resolved = await lookup(host, { all: true })
    } catch {
        throw new UpstreamError('dns')
    }
    if (resolved.length === 0 || resolved.some((r) => blockedIpReason(r.address))) {
        throw new BlockedError('resolved')
    }
}

/** fetch with manual redirects, re-validating every hop (max MAX_REDIRECTS). */
async function fetchPublic(start: URL, signal: AbortSignal): Promise<Response> {
    let current = start
    for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
        await assertPublicUrl(current)
        const response = await fetch(current, {
            signal,
            redirect: 'manual',
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; CompetitorStalker/1.0)',
                'Accept': 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.5',
                'Accept-Language': 'en-US,en;q=0.5',
            },
        })
        if (response.status < 300 || response.status >= 400) return response
        const location = response.headers.get('location')
        await response.body?.cancel().catch(() => undefined)
        if (!location) throw new UpstreamError('redirect without location')
        try {
            current = new URL(location, current)
        } catch {
            throw new UpstreamError('bad redirect')
        }
    }
    throw new UpstreamError('too many redirects')
}

/** Read at most MAX_BODY_BYTES, cancelling the stream once the cap is hit. */
async function readCapped(response: Response): Promise<string> {
    const declared = Number(response.headers.get('content-length'))
    if (Number.isFinite(declared) && declared > MAX_BODY_BYTES) {
        await response.body?.cancel().catch(() => undefined)
        throw new RangeError('too large')
    }
    if (!response.body) return ''
    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let received = 0
    let text = ''
    for (;;) {
        const { done, value } = await reader.read()
        if (done) break
        received += value.byteLength
        if (received > MAX_BODY_BYTES) {
            await reader.cancel().catch(() => undefined)
            throw new RangeError('too large')
        }
        text += decoder.decode(value, { stream: true })
    }
    return text + decoder.decode()
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    if (!originAllowed(req)) {
        return res.status(403).json({ error: 'Cross-origin requests are not allowed' })
    }

    if (rateLimited(clientIp(req))) {
        return res.status(429).json({ error: 'Too many requests' })
    }

    const url = req.body?.url

    if (!url || typeof url !== 'string') {
        return res.status(400).json({ error: 'URL is required' })
    }

    let parsed: URL
    try {
        parsed = new URL(url)
    } catch {
        return res.status(400).json({ error: 'Invalid URL' })
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

    try {
        const response = await fetchPublic(parsed, controller.signal)

        if (!response.ok) {
            await response.body?.cancel().catch(() => undefined)
            return res.status(502).json({ error: 'Target returned an error' })
        }

        const contentType = response.headers.get('content-type') ?? ''
        if (!/^(text\/html|application\/xhtml\+xml)\b/i.test(contentType)) {
            await response.body?.cancel().catch(() => undefined)
            return res.status(415).json({ error: 'Only HTML pages can be scraped' })
        }

        const html = await readCapped(response)
        return res.status(200).json(parseCompetitorPage(html))
    } catch (error) {
        if (error instanceof BlockedError) {
            return res.status(400).json({ error: 'URL host is not allowed' })
        }
        if (error instanceof RangeError) {
            return res.status(413).json({ error: 'Response too large' })
        }
        if (controller.signal.aborted || (error instanceof Error && error.name === 'AbortError')) {
            return res.status(504).json({ error: 'Request timed out' })
        }
        if (!(error instanceof UpstreamError)) console.error('Scraping error:', error)
        return res.status(502).json({ error: 'Failed to fetch page' })
    } finally {
        clearTimeout(timeoutId)
    }
}
