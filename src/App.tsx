import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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
        <ToastProvider>
          <CompetitorProvider>
            <Layout>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/dossier" element={<DossierPage />} />
                <Route path="/positioning" element={<PositioningPage />} />
                <Route path="/matrix" element={<MatrixPage />} />
                <Route path="/pricing" element={<PricingPage />} />
                <Route path="/social" element={<SocialPage />} />
                <Route path="/weaknesses" element={<WeaknessPage />} />
                <Route path="/alerts" element={<AlertsPage />} />
                <Route path="/strategy" element={<StrategyPage />} />
                <Route path="/swot" element={<SwotPage />} />
                <Route path="/settings" element={<SettingsPage />} />
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
