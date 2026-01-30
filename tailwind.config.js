/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Background scale
                'bg-base': 'var(--bg-base)',
                'bg-primary': 'var(--bg-primary)',
                'bg-secondary': 'var(--bg-secondary)',
                'bg-tertiary': 'var(--bg-tertiary)',
                'bg-elevated': 'var(--bg-elevated)',
                'bg-surface': 'var(--bg-surface)',

                // Border scale
                'border-subtle': 'var(--border-subtle)',
                'border-default': 'var(--border-default)',
                'border-muted': 'var(--border-muted)',
                'border-emphasis': 'var(--border-emphasis)',
                'border-strong': 'var(--border-strong)',

                // Text scale
                'text-primary': 'var(--text-primary)',
                'text-secondary': 'var(--text-secondary)',
                'text-muted': 'var(--text-muted)',
                'text-subtle': 'var(--text-subtle)',

                // Accent colors
                'accent-brand': 'var(--accent-brand)',
                'accent-brand-soft': 'var(--accent-brand-soft)',
                'accent-success': 'var(--accent-success)',
                'accent-success-soft': 'var(--accent-success-soft)',
                'accent-warning': 'var(--accent-warning)',
                'accent-warning-soft': 'var(--accent-warning-soft)',
                'accent-danger': 'var(--accent-danger)',
                'accent-danger-soft': 'var(--accent-danger-soft)',
                'accent-info': 'var(--accent-info)',
                'accent-info-soft': 'var(--accent-info-soft)',
                'accent-purple': 'var(--accent-purple)',
                'accent-purple-soft': 'var(--accent-purple-soft)',

                // Threat levels
                'threat-low': 'var(--threat-low)',
                'threat-medium': 'var(--threat-medium)',
                'threat-high': 'var(--threat-high)',
            },
            fontFamily: {
                sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
                mono: ['var(--font-mono)', 'monospace'],
                display: ['var(--font-display)', 'serif'],
            },
            fontSize: {
                '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
            },
            boxShadow: {
                'xs': 'var(--shadow-xs)',
                'sm': 'var(--shadow-sm)',
                'md': 'var(--shadow-md)',
                'lg': 'var(--shadow-lg)',
                'xl': 'var(--shadow-xl)',
                'glow-brand': 'var(--shadow-glow-brand)',
                'glow-success': 'var(--shadow-glow-success)',
                'glow-warning': 'var(--shadow-glow-warning)',
                'glow-danger': 'var(--shadow-glow-danger)',
            },
            borderRadius: {
                'sm': 'var(--radius-sm)',
                'md': 'var(--radius-md)',
                'lg': 'var(--radius-lg)',
                'xl': 'var(--radius-xl)',
                '2xl': 'var(--radius-2xl)',
            },
            spacing: {
                '18': '4.5rem',
                '22': '5.5rem',
            },
            transitionDuration: {
                'fast': '100ms',
                'base': '150ms',
                'slow': '250ms',
                'slower': '350ms',
            },
            keyframes: {
                'fade-in': {
                    '0%': { opacity: '0', transform: 'translateY(8px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                'fade-in-up': {
                    '0%': { opacity: '0', transform: 'translateY(16px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                'slide-in-left': {
                    '0%': { opacity: '0', transform: 'translateX(-16px)' },
                    '100%': { opacity: '1', transform: 'translateX(0)' },
                },
                'slide-in-right': {
                    '0%': { opacity: '0', transform: 'translateX(16px)' },
                    '100%': { opacity: '1', transform: 'translateX(0)' },
                },
                'scale-in': {
                    '0%': { opacity: '0', transform: 'scale(0.95)' },
                    '100%': { opacity: '1', transform: 'scale(1)' },
                },
                'pulse-soft': {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '0.5' },
                },
                'shimmer': {
                    '0%': { backgroundPosition: '-200% 0' },
                    '100%': { backgroundPosition: '200% 0' },
                },
                'ping-slow': {
                    '75%, 100%': { transform: 'scale(1.5)', opacity: '0' },
                },
            },
            animation: {
                'fade-in': 'fade-in 0.4s ease-out',
                'fade-in-up': 'fade-in-up 0.5s ease-out',
                'slide-in-left': 'slide-in-left 0.4s ease-out',
                'slide-in-right': 'slide-in-right 0.4s ease-out',
                'scale-in': 'scale-in 0.3s ease-out',
                'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
                'shimmer': 'shimmer 1.5s ease-in-out infinite',
                'ping-slow': 'ping-slow 1.5s ease-out infinite',
            },
            backdropBlur: {
                'xs': '2px',
            },
        },
    },
    plugins: [],
}
