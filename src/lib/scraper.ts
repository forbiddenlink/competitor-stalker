/**
 * Client-side HTML parsing utilities for competitor analysis
 * Note: Actual crawling must happen server-side due to CORS
 */

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
    openGraph?: Record<string, string | undefined>
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
export function parseCompetitorPage(html: string): CompetitorPageData {
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
        if (text) return text
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
export function extractOpenGraph(
    html: string
): Record<string, string | undefined> {
    const $ = cheerio.load(html)

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
 * Extract Twitter card metadata
 */
export function extractTwitterCard(
    html: string
): Record<string, string | undefined> {
    const $ = cheerio.load(html)

    return {
        card: $('meta[name="twitter:card"]').attr('content'),
        site: $('meta[name="twitter:site"]').attr('content'),
        creator: $('meta[name="twitter:creator"]').attr('content'),
        title: $('meta[name="twitter:title"]').attr('content'),
        description: $('meta[name="twitter:description"]').attr('content'),
        image: $('meta[name="twitter:image"]').attr('content'),
    }
}

/**
 * Extract all internal and external links
 */
export function extractLinks(
    html: string,
    baseUrl: string
): { internal: string[]; external: string[] } {
    const $ = cheerio.load(html)
    const internal: string[] = []
    const external: string[] = []

    let baseDomain: string
    try {
        baseDomain = new URL(baseUrl).hostname.replace('www.', '')
    } catch {
        return { internal, external }
    }

    $('a[href]').each((_, el) => {
        const href = $(el).attr('href')
        if (!href || href.startsWith('#') || href.startsWith('javascript:')) {
            return
        }

        try {
            const url = new URL(href, baseUrl)
            const domain = url.hostname.replace('www.', '')

            if (domain === baseDomain) {
                if (!internal.includes(url.href)) {
                    internal.push(url.href)
                }
            } else {
                if (!external.includes(url.href)) {
                    external.push(url.href)
                }
            }
        } catch {
            // Invalid URL, skip
        }
    })

    return { internal, external }
}
