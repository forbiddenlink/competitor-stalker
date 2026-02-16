import { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Layout } from './components/layout/Shell';
import { CompetitorProvider } from './context/CompetitorContext';
import { ToastProvider } from './context/ToastContext';
import { ToastContainer } from './components/common/Toast';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import './styles/index.css';

// Lazy Load Pages
const Dashboard = lazy(() => import('./pages/Dashboard'));
const DossierPage = lazy(() => import('./pages/DossierPage'));
const PositioningPage = lazy(() => import('./pages/PositioningPage'));
const MatrixPage = lazy(() => import('./pages/MatrixPage'));
const PricingPage = lazy(() => import('./pages/PricingPage'));
const SocialPage = lazy(() => import('./pages/SocialPage'));
const WeaknessPage = lazy(() => import('./pages/WeaknessPage'));
const AlertsPage = lazy(() => import('./pages/AlertsPage'));
const StrategyPage = lazy(() => import('./pages/StrategyPage'));
const SwotPage = lazy(() => import('./pages/SwotPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage'));

const routeMetadata: Record<string, { title: string; description: string }> = {
  '/': {
    title: 'Dashboard | Stalker',
    description: 'Central intelligence dashboard for tracking competitor risk, movement, and strategic response.',
  },
  '/dossier': {
    title: 'Competitor Dossiers | Stalker',
    description: 'Maintain detailed competitor profiles, summaries, notes, and key commercial signals.',
  },
  '/positioning': {
    title: 'Positioning Map | Stalker',
    description: 'Compare competitors on a live positioning map to identify whitespace and direct pressure.',
  },
  '/matrix': {
    title: 'Feature Matrix | Stalker',
    description: 'Analyze feature parity and product differentiation across your competitive landscape.',
  },
  '/pricing': {
    title: 'Pricing Intel | Stalker',
    description: 'Track competitor plans, packaging, and pricing shifts to inform commercial strategy.',
  },
  '/social': {
    title: 'Social Monitor | Stalker',
    description: 'Monitor competitor social presence and messaging changes over time.',
  },
  '/weaknesses': {
    title: 'Weakness Spotter | Stalker',
    description: 'Capture verified competitor weaknesses and evidence to support your positioning strategy.',
  },
  '/alerts': {
    title: 'Movement Alerts | Stalker',
    description: 'Review movement alerts and stay ahead of strategic competitor changes.',
  },
  '/strategy': {
    title: 'Counter Strategy | Stalker',
    description: 'Plan and track strategic response initiatives against top competitive threats.',
  },
  '/swot': {
    title: 'SWOT Analysis | Stalker',
    description: 'Maintain SWOT context for each competitor and map opportunity against risk.',
  },
  '/settings': {
    title: 'Settings | Stalker',
    description: 'Manage exports, imports, and data controls for your intelligence workspace.',
  },
  '/about': {
    title: 'About | Stalker',
    description: 'Learn how Stalker helps teams make faster, better competitive decisions.',
  },
  '/contact': {
    title: 'Contact | Stalker',
    description: 'Contact the Stalker team for product support and partnership inquiries.',
  },
  '/privacy-policy': {
    title: 'Privacy Policy | Stalker',
    description: 'Read how data is handled in the Stalker competitive intelligence workspace.',
  },
};

const TITLE_SUFFIX = ' | Competitive Intelligence';
const DESCRIPTION_SUFFIX =
  ' Trusted by teams for fast, evidence-based decisions.';

const setMetaByName = (name: string, content: string) => {
  const meta = document.querySelector(`meta[name="${name}"]`);
  if (meta instanceof HTMLMetaElement) {
    meta.content = content;
  }
};

const setMetaByProperty = (property: string, content: string) => {
  const meta = document.querySelector(`meta[property="${property}"]`);
  if (meta instanceof HTMLMetaElement) {
    meta.content = content;
  }
};

const RouteMetadata = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    const withoutHtmlSuffix = pathname.replace(/\/index\.html$/, '/').replace(/\.html$/, '');
    const normalizedPath = withoutHtmlSuffix === '/' ? '/' : withoutHtmlSuffix.replace(/\/+$/, '');
    const metadata = routeMetadata[normalizedPath] ?? {
      title: 'Stalker — Competitive Intelligence Workspace',
      description: 'Track competitor strategy, pricing, positioning, and risk in one focused intelligence workspace.',
    };

    const routeUrl = `${window.location.origin}${normalizedPath}`;
    const pageTitle = `${metadata.title}${TITLE_SUFFIX}`;
    const pageDescription = `${metadata.description}${DESCRIPTION_SUFFIX}`;

    document.title = pageTitle;
    setMetaByName('description', pageDescription);
    setMetaByProperty('og:title', pageTitle);
    setMetaByProperty('og:description', pageDescription);
    setMetaByProperty('og:url', routeUrl);
    setMetaByName('twitter:title', pageTitle);
    setMetaByName('twitter:description', pageDescription);

    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical instanceof HTMLLinkElement) {
      canonical.href = routeUrl;
    }
  }, [pathname]);

  return null;
};

// Loading component
const PageLoader = () => (
  <div className="flex items-center justify-center h-64">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 border-2 border-[var(--accent-brand)] border-t-transparent rounded-full animate-spin" />
      <span className="text-sm text-[var(--text-muted)]">Loading...</span>
    </div>
  </div>
);

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <RouteMetadata />
        <ToastProvider>
          <CompetitorProvider>
            <Layout>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/index.html" element={<Dashboard />} />
                <Route path="/dossier" element={<DossierPage />} />
                <Route path="/dossier.html" element={<DossierPage />} />
                <Route path="/positioning" element={<PositioningPage />} />
                <Route path="/positioning.html" element={<PositioningPage />} />
                <Route path="/matrix" element={<MatrixPage />} />
                <Route path="/matrix.html" element={<MatrixPage />} />
                <Route path="/pricing" element={<PricingPage />} />
                <Route path="/pricing.html" element={<PricingPage />} />
                <Route path="/social" element={<SocialPage />} />
                <Route path="/social.html" element={<SocialPage />} />
                <Route path="/weaknesses" element={<WeaknessPage />} />
                <Route path="/weaknesses.html" element={<WeaknessPage />} />
                <Route path="/alerts" element={<AlertsPage />} />
                <Route path="/alerts.html" element={<AlertsPage />} />
                <Route path="/strategy" element={<StrategyPage />} />
                <Route path="/strategy.html" element={<StrategyPage />} />
                <Route path="/swot" element={<SwotPage />} />
                <Route path="/swot.html" element={<SwotPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/settings.html" element={<SettingsPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/about.html" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/contact.html" element={<ContactPage />} />
                <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                <Route path="/privacy-policy.html" element={<PrivacyPolicyPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Suspense>
            </Layout>
            <ToastContainer />
          </CompetitorProvider>
        </ToastProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
