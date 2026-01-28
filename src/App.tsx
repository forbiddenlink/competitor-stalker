import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Shell';
import { CompetitorProvider } from './context/CompetitorContext';
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

function App() {
  return (
    <BrowserRouter>
      <CompetitorProvider>
        <div className="crt-overlay" />
        <Layout>
          <Suspense fallback={<div className="p-8 text-cyan animate-blink">INITIALIZING...</div>}>
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
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </Layout>
      </CompetitorProvider>
    </BrowserRouter>
  );
}

export default App;
