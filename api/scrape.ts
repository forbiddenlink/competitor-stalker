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

/**
 * Return a reason string if the IP falls in a private, loopback, link-local,
 * or otherwise reserved range that must never be reachable from the scraper;
 * null means the address is a routable public IP. Blocks SSRF to internal
 * services and cloud metadata endpoints (e.g. 169.254.169.254).
 */
function blockedIpReason(ip: string): string | null {
    // Unwrap IPv4-mapped IPv6 (e.g. ::ffff:169.254.169.254)
    const mapped = ip.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/i)
    if (mapped) ip = mapped[1]
    const mappedHex = ip.match(/^::ffff:([\da-f]{1,4}):([\da-f]{1,4})$/i)
    if (mappedHex) {
        const high = parseInt(mappedHex[1], 16), low = parseInt(mappedHex[2], 16)
        ip = `${high >> 8}.${high & 255}.${low >> 8}.${low & 255}`
    }

    if (isIP(ip) === 4) {
        const [a, b] = ip.split('.').map(Number)
        if (a === 0) return 'unspecified'
        if (a === 10) return 'private'
        if (a === 127) return 'loopback'
        if (a === 169 && b === 254) return 'link-local' // incl. cloud metadata
        if (a === 172 && b >= 16 && b <= 31) return 'private'
        if (a === 192 && b === 168) return 'private'
        if (a === 100 && b >= 64 && b <= 127) return 'cgnat'
        if (a >= 224) return 'reserved' // multicast + future-use
        return null
    }

    const v6 = ip.toLowerCase()
    if (v6 === '::' || v6 === '::0') return 'unspecified'
    if (v6 === '::1') return 'loopback'
    if ((parseInt(v6.split(':')[0], 16) & 0xffc0) === 0xfe80) return 'link-local'
    if (v6.startsWith('fc') || v6.startsWith('fd')) return 'unique-local' // fc00::/7
    if (v6.startsWith('ff')) return 'multicast'
    return null
}

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
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') throw new Error('Only http and https URLs are allowed')
    if (parsed.username || parsed.password) throw new Error('URLs with credentials are not allowed')
    const hostname = parsed.hostname.replace(/^\[|\]$/g, '')
    if (hostname === 'localhost' || hostname.endsWith('.localhost')) throw new Error('URL host is not allowed')
    if (isIP(hostname)) {
        if (blockedIpReason(hostname)) throw new Error('URL host is not allowed')
        return { address: hostname, family: isIP(hostname) }
    }
    let resolved: PublicAddress[]
    try { resolved = await withinDeadline(lookup(hostname, { all: true }), signal) }
    catch { if (signal.aborted) throw new Error('Request timed out'); throw new Error('Could not resolve URL host') }
    if (!resolved.length || resolved.some(result => blockedIpReason(result.address))) throw new Error('URL host is not allowed')
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
    const { url } = req.body ?? {}
    if (!url || typeof url !== 'string') return res.status(400).json({ error: 'URL is required' })
    let target: URL
    try { target = new URL(url) }
    catch { return res.status(400).json({ error: 'Invalid URL' }) }
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10000)
    try {
        for (let redirects = 0; redirects <= 3; redirects++) {
            let address: PublicAddress
            try { address = await validateTarget(target, controller.signal) }
            catch (error) {
                if (controller.signal.aborted) throw error
                return res.status(400).json({ error: error instanceof Error ? error.message : 'URL host is not allowed' })
            }
            const response = await requestPublicPage(target, address, controller.signal)
            const status = response.statusCode ?? 502
            if ([301, 302, 303, 307, 308].includes(status)) {
                const location = response.headers.location
                response.destroy()
                if (!location || redirects === 3) return res.status(400).json({ error: 'Page redirect could not be followed' })
                try { target = new URL(location, target) }
                catch { return res.status(400).json({ error: 'Invalid page redirect' }) }
                continue
            }
            if (status < 200 || status >= 300) { response.destroy(); return res.status(status).json({ error: `Failed to fetch page (${status})` }) }
            if (!/^(text\/html|application\/xhtml\+xml)(?:;|$)/i.test(response.headers['content-type'] || '')) {
                response.destroy()
                return res.status(400).json({ error: 'The URL did not return an HTML page' })
            }
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
                    if (bytes > 2 * 1024 * 1024) return res.status(413).json({ error: 'Page is too large to extract. Enter details manually.' })
                    chunks.push(value)
                }
            } finally { body.destroy(); response.destroy() }
            if (!bytes) return res.status(400).json({ error: 'The page was empty' })
            return res.status(200).json(parseCompetitorPage(Buffer.concat(chunks).toString('utf8'), target))
        }
    } catch (error) {
        if (controller.signal.aborted || (error instanceof Error && error.name === 'AbortError')) return res.status(504).json({ error: 'Request timed out' })
        console.error('Page extraction failed')
        return res.status(500).json({ error: 'Failed to scrape page' })
    } finally { clearTimeout(timeout) }
}
