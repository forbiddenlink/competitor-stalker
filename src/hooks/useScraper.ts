import { useState, useCallback } from 'react'
import type { CompetitorPageData, SocialLinks } from '../lib/scraper'

export interface ScraperResult {
    data: CompetitorPageData | null
    loading: boolean
    error: string | null
}

export interface UseScraper {
    scrape: (url: string) => Promise<CompetitorPageData | null>
    loading: boolean
    error: string | null
    data: CompetitorPageData | null
    reset: () => void
}

/**
 * Hook for scraping competitor pages via the server-side API
 * Uses the /api/scrape endpoint to avoid CORS issues
 */
export function useScraper(): UseScraper {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [data, setData] = useState<CompetitorPageData | null>(null)

    const scrape = useCallback(async (url: string): Promise<CompetitorPageData | null> => {
        // Normalize URL
        let normalizedUrl = url.trim()
        if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
            normalizedUrl = `https://${normalizedUrl}`
        }

        // Validate URL
        try {
            new URL(normalizedUrl)
        } catch {
            setError('Invalid URL format')
            return null
        }

        setLoading(true)
        setError(null)

        try {
            const response = await fetch('/api/scrape', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url: normalizedUrl }),
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                throw new Error(errorData.error || `Failed to scrape: ${response.statusText}`)
            }

            const result = await response.json() as CompetitorPageData
            setData(result)
            return result
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to scrape page'
            setError(message)
            return null
        } finally {
            setLoading(false)
        }
    }, [])

    const reset = useCallback(() => {
        setData(null)
        setError(null)
        setLoading(false)
    }, [])

    return { scrape, loading, error, data, reset }
}

// Re-export types for convenience
export type { CompetitorPageData, SocialLinks }
