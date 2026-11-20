import { sentryOptions } from './sentry-options'

if (import.meta.env.PROD && sentryOptions.dsn) {
  const pending: unknown[] = []
  let loading = false

  function report(error: unknown) {
    if (pending.length < 10) pending.push(error)
    if (loading) return
    loading = true
    void import('@sentry/browser').then(sentry => {
      sentry.init(sentryOptions)
      window.removeEventListener('error', onError)
      window.removeEventListener('unhandledrejection', onRejection)
      for (const item of pending.splice(0)) sentry.captureException(item)
    }).catch(() => {
      pending.length = 0
      loading = false
    })
  }

  function onError(event: ErrorEvent) {
    if (event.error) report(event.error)
  }

  function onRejection(event: PromiseRejectionEvent) {
    report(event.reason)
  }

  window.addEventListener('error', onError)
  window.addEventListener('unhandledrejection', onRejection)
}
