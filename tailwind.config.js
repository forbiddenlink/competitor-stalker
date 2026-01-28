/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'bg-primary': 'var(--bg-primary)',
                'bg-secondary': 'var(--bg-secondary)',
                'bg-tertiary': 'var(--bg-tertiary)',
                'border-dim': 'var(--border-dim)',
                'border-bright': 'var(--border-bright)',
                'text-primary': 'var(--text-primary)',
                'text-muted': 'var(--text-muted)',
                'accent-red': 'var(--accent-red)',
                'accent-amber': 'var(--accent-amber)',
                'accent-green': 'var(--accent-green)',
                'accent-cyan': 'var(--accent-cyan)',
            },
            fontFamily: {
                mono: ['var(--font-mono)', 'monospace'],
                sans: ['var(--font-sans)', 'sans-serif'],
                display: ['var(--font-display)', 'curr_monospace'],
            },
            dropShadow: {
                'glow': '0 0 10px rgba(0, 204, 255, 0.5)',
                'glow-red': '0 0 10px rgba(255, 51, 51, 0.5)',
            },
            keyframes: {
                flicker: {
                    '0%, 10%, 15%, 20%, 30%, 35%, 40%, 45%, 50%, 60%, 65%, 70%, 80%, 85%, 90%, 95%, 100%': { opacity: '0.15' },
                    '5%, 25%, 55%, 75%': { opacity: '0.12' },
                },
                scan: {
                    '0%': { top: '0%', opacity: '0' },
                    '10%, 90%': { opacity: '1' },
                    '100%': { top: '100%', opacity: '0' },
                },
                typewriter: {
                    'from': { width: '0' },
                    'to': { width: '100%' },
                }
            },
            animation: {
                'flicker': 'flicker 0.15s infinite',
                'scan': 'scan 3s linear infinite',
                'typewriter': 'typewriter 2s steps(40, end)',
                'blink': 'blink 1s infinite',
                'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            }
        },
    },
    plugins: [],
}
