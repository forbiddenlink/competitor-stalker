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
                'bg-elevated': 'var(--bg-elevated)',
                'border-dim': 'var(--border-dim)',
                'border-bright': 'var(--border-bright)',
                'border-active': 'var(--border-active)',
                'text-primary': 'var(--text-primary)',
                'text-secondary': 'var(--text-secondary)',
                'text-muted': 'var(--text-muted)',
                'accent-red': 'var(--accent-red)',
                'accent-amber': 'var(--accent-amber)',
                'accent-green': 'var(--accent-green)',
                'accent-cyan': 'var(--accent-cyan)',
                'accent-blue': 'var(--accent-blue)',
                'accent-purple': 'var(--accent-purple)',
            },
            fontFamily: {
                mono: ['var(--font-mono)', 'monospace'],
                sans: ['var(--font-sans)', 'sans-serif'],
                display: ['var(--font-display)', 'sans-serif'],
            },
            boxShadow: {
                'glow': '0 0 20px rgba(94, 114, 228, 0.4)',
                'glow-cyan': '0 0 20px rgba(0, 212, 255, 0.3)',
                'glow-red': '0 0 20px rgba(255, 71, 87, 0.4)',
                'glow-green': '0 0 20px rgba(46, 213, 115, 0.3)',
                'sm': '0 2px 8px rgba(0, 0, 0, 0.3)',
                'md': '0 4px 16px rgba(0, 0, 0, 0.4)',
                'lg': '0 12px 32px rgba(0, 0, 0, 0.5)',
                'xl': '0 20px 48px rgba(0, 0, 0, 0.6)',
            },
            dropShadow: {
                'glow': '0 0 10px rgba(0, 204, 255, 0.5)',
                'glow-red': '0 0 10px rgba(255, 71, 87, 0.5)',
                'glow-blue': '0 0 10px rgba(94, 114, 228, 0.5)',
                'glow-green': '0 0 10px rgba(46, 213, 115, 0.4)',
            },
            backdropBlur: {
                'xs': '2px',
            },
            keyframes: {
                'fade-in': {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                'slide-in-left': {
                    '0%': { opacity: '0', transform: 'translateX(-20px)' },
                    '100%': { opacity: '1', transform: 'translateX(0)' },
                },
                'slide-in-right': {
                    '0%': { opacity: '0', transform: 'translateX(20px)' },
                    '100%': { opacity: '1', transform: 'translateX(0)' },
                },
                'glow-pulse': {
                    '0%, 100%': { boxShadow: '0 0 20px rgba(94, 114, 228, 0.3)' },
                    '50%': { boxShadow: '0 0 30px rgba(94, 114, 228, 0.5)' },
                },
                'float': {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-8px)' },
                },
                'scan': {
                    '0%': { top: '0%', opacity: '0' },
                    '10%, 90%': { opacity: '0.3' },
                    '100%': { top: '100%', opacity: '0' },
                },
                'typewriter': {
                    'from': { width: '0' },
                    'to': { width: '100%' },
                },
                'shimmer': {
                    '0%': { backgroundPosition: '-1000px 0' },
                    '100%': { backgroundPosition: '1000px 0' },
                },
                'pulse-glow': {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '0.6' },
                },
            },
            animation: {
                'fade-in': 'fade-in 0.6s ease-out',
                'slide-in-left': 'slide-in-left 0.5s ease-out',
                'slide-in-right': 'slide-in-right 0.5s ease-out',
                'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
                'float': 'float 3s ease-in-out infinite',
                'scan': 'scan 3s linear infinite',
                'typewriter': 'typewriter 2s steps(40, end)',
                'blink': 'blink 1.2s ease-in-out infinite',
                'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'shimmer': 'shimmer 2s infinite',
                'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
            },
            borderRadius: {
                'xs': 'var(--radius-sm)',
                'sm': 'var(--radius-md)',
                'md': 'var(--radius-lg)',
            },
            spacing: {
                'xs': 'var(--spacing-xs)',
                'sm': 'var(--spacing-sm)',
                'md': 'var(--spacing-md)',
                'lg': 'var(--spacing-lg)',
                'xl': 'var(--spacing-xl)',
                '2xl': 'var(--spacing-2xl)',
            }
        },
    },
    plugins: [],
}
