import { useState, useCallback, useRef, useEffect } from 'react'
import type { CompetitorPageData, SocialLinks } from '../lib/scraper'
import { isValidUrl } from '../utils/validation'

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

const validResult = (value: unknown): value is CompetitorPageData => {
    if (!value || typeof value !== 'object') return false
    const result = value as Record<string, unknown>
    const record = (item: unknown): item is Record<string, unknown> => !!item && typeof item === 'object' && !Array.isArray(item)
    return ['title', 'pricing', 'h1'].every(key => typeof result[key] === 'string')
        && (result.description === undefined || typeof result.description === 'string')
        && ['features', 'h2s', 'techStack', 'ctaButtons'].every(key => Array.isArray(result[key]) && result[key].every(item => typeof item === 'string'))
        && record(result.socialLinks) && Object.values(result.socialLinks).every(link => typeof link === 'string' && isValidUrl(link))
        && (result.openGraph === undefined || (record(result.openGraph) && Object.values(result.openGraph).every(item => item === undefined || typeof item === 'string')))
}

/** Request public-page extraction; only the latest active scan can update UI. */
export function useScraper(): UseScraper {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [data, setData] = useState<CompetitorPageData | null>(null)
    const request = useRef<{ revision: number; controller?: AbortController }>({ revision: 0 })
    useEffect(() => () => { request.current.revision++; request.current.controller?.abort() }, [])

    const scrape = useCallback(async (url: string): Promise<CompetitorPageData | null> => {
        request.current.controller?.abort()
        const revision = ++request.current.revision
        const normalizedUrl = /^https?:\/\//i.test(url.trim()) ? url.trim() : `https://${url.trim()}`
        setData(null)
        setError(null)
        if (!isValidUrl(normalizedUrl)) {
            setError('Invalid URL format')
            setLoading(false)
            return null
        }
        const controller = new AbortController()
        request.current.controller = controller
        const timeout = setTimeout(() => controller.abort(), 12000)
        setLoading(true)
        try {
            const response = await fetch('/api/scrape', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: normalizedUrl }), signal: controller.signal,
            })
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                throw new Error(typeof errorData.error === 'string' ? errorData.error : `Page extraction unavailable (${response.status})`)
            }
            const result: unknown = await response.json()
            if (!validResult(result)) throw new Error('Page extraction returned invalid data. Try again or enter details manually.')
            if (revision !== request.current.revision) return null
            setData(result)
            return result
        } catch (err) {
            if (revision === request.current.revision) setError(controller.signal.aborted ? 'Page extraction timed out. Try again or enter details manually.' : err instanceof Error ? err.message : 'Failed to scrape page')
            return null
        } finally {
            clearTimeout(timeout)
            if (revision === request.current.revision) setLoading(false)
        }
    }, [])
    const reset = useCallback(() => {
        request.current.revision++
        request.current.controller?.abort()
        setData(null); setError(null); setLoading(false)
    }, [])
    return { scrape, loading, error, data, reset }
}
export type { CompetitorPageData, SocialLinks }
