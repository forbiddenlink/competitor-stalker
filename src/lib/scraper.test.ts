import { describe, expect, it } from 'vitest'
import { extractLinks } from './scraper'

describe('extractLinks scheme allowlist', () => {
    const base = 'https://example.com/'
    const html = (href: string) => `<a href="${href}">x</a>`

    it.each([
        'javascript:alert(1)',
        'JavaScript:alert(1)',
        ' javascript:alert(1)',
        'data:text/html,<script>alert(1)</script>',
        'vbscript:msgbox(1)',
        'file:///etc/passwd',
        'ftp://example.com/x',
        'mailto:a@b.co',
        'tel:123',
    ])('drops %s', (href) => {
        expect(extractLinks(html(href), base)).toEqual({ internal: [], external: [] })
    })

    it('keeps http and https links', () => {
        const out = extractLinks(
            html('/pricing') + html('http://other.com/a') + html('https://example.com/b'),
            base
        )
        expect(out.internal).toEqual(['https://example.com/pricing', 'https://example.com/b'])
        expect(out.external).toEqual(['http://other.com/a'])
    })
})
