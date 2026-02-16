import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const sharedSecurityHeaders = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), geolocation=(), microphone=()',
}

const devSecurityHeaders = {
  ...sharedSecurityHeaders,
  'Content-Security-Policy':
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; font-src 'self' data:; img-src 'self' data: https:; connect-src 'self' ws: wss: http: https:; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
}

const previewSecurityHeaders = {
  ...sharedSecurityHeaders,
  'Content-Security-Policy':
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; font-src 'self' data:; img-src 'self' data: https:; connect-src 'self' https:; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
}

const createManualChunks = (id: string) => {
  if (!id.includes('node_modules')) {
    return undefined
  }

  if (id.includes('lucide-react')) {
    return 'icons'
  }

  return 'vendor'
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  esbuild: {
    legalComments: 'none',
  },
  build: {
    minify: 'terser',
    terserOptions: {
      format: {
        comments: false,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: createManualChunks,
      },
    },
  },
  server: {
    headers: devSecurityHeaders,
  },
  preview: {
    headers: previewSecurityHeaders,
  },
})
