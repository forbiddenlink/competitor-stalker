import { init } from '@sentry/browser';
import { sentryOptions } from './sentry-options';

if (import.meta.env.PROD && sentryOptions.dsn) {
  init(sentryOptions);
}
