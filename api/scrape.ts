import { lookup } from 'node:dns/promises'
import { isIP } from 'node:net'
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
    if (v6.startsWith('fe80')) return 'link-local'
    if (v6.startsWith('fc') || v6.startsWith('fd')) return 'unique-local' // fc00::/7
    if (v6.startsWith('ff')) return 'multicast'
    return null
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    const { url } = req.body

    if (!url || typeof url !== 'string') {
        return res.status(400).json({ error: 'URL is required' })
    }

    // Validate URL
    let parsed: URL
    try {
        parsed = new URL(url)
    } catch {
        return res.status(400).json({ error: 'Invalid URL' })
    }

    // SSRF guard: only public http(s) hosts. Reject non-web schemes and any
    // host that resolves to a private/loopback/link-local/reserved address.
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        return res.status(400).json({ error: 'Only http and https URLs are allowed' })
    }

    const hostname = parsed.hostname.replace(/^\[|\]$/g, '') // strip IPv6 brackets
    if (hostname === 'localhost' || hostname.endsWith('.localhost')) {
        return res.status(400).json({ error: 'URL host is not allowed' })
    }

    try {
        if (isIP(hostname)) {
            if (blockedIpReason(hostname)) {
                return res.status(400).json({ error: 'URL host is not allowed' })
            }
        } else {
            const resolved = await lookup(hostname, { all: true })
            // Note: residual DNS-rebinding risk remains (fetch re-resolves);
            // acceptable for this workload — no internal network to pivot into.
            if (resolved.length === 0 || resolved.some((r) => blockedIpReason(r.address))) {
                return res.status(400).json({ error: 'URL host is not allowed' })
            }
        }
    } catch {
        return res.status(400).json({ error: 'Could not resolve URL host' })
    }

    try {
        // Fetch the page with timeout
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000)

        const response = await fetch(url, {
            signal: controller.signal,
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; CompetitorStalker/1.0)',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
            },
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
            return res.status(response.status).json({
                error: `Failed to fetch page: ${response.statusText}`,
            })
        }

        const html = await response.text()
        const data = parseCompetitorPage(html)

        return res.status(200).json(data)
    } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
            return res.status(504).json({ error: 'Request timed out' })
        }

        console.error('Scraping error:', error)
        return res.status(500).json({
            error: error instanceof Error ? error.message : 'Failed to scrape page',
        })
    }
}
