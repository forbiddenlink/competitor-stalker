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
    try {
        new URL(url)
    } catch {
        return res.status(400).json({ error: 'Invalid URL' })
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
