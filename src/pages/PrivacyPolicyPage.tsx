import { Link } from 'react-router-dom';

const PrivacyPolicyPage: React.FC = () => {
  const effectiveDate = 'February 16, 2026';

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl">
      <header className="space-y-3">
        <h1 className="text-2xl font-semibold tracking-tight">Privacy Policy</h1>
        <p className="text-[var(--text-secondary)]">Effective date: {effectiveDate}</p>
      </header>

      <section className="surface-card p-6 space-y-3">
        <h2 className="text-lg font-semibold">What Data Is Stored</h2>
        <p className="text-[var(--text-secondary)]">
          Competitor Stalker stores competitor records, notes, SWOT data, and user profile information in your browser
          localStorage. Data stays on your device unless you explicitly export it.
        </p>
      </section>

      <section className="surface-card p-6 space-y-3">
        <h2 className="text-lg font-semibold">How Data Is Used</h2>
        <p className="text-[var(--text-secondary)]">
          Data is used to power the dashboard and analysis views inside the app. Export actions are user-initiated and
          intended for backups or internal reporting.
        </p>
      </section>

      <section className="surface-card p-6 space-y-3">
        <h2 className="text-lg font-semibold">Your Controls</h2>
        <p className="text-[var(--text-secondary)]">
          You can export your data, import a previous export, reset to sample data, or clear all data at any time from
          Settings.
        </p>
        <p className="text-[var(--text-secondary)]">
          Need help or have privacy questions? Visit the{' '}
          <Link className="text-[var(--accent-brand-soft)] hover:underline" to="/contact">
            Contact page
          </Link>
          .
        </p>
      </section>
    </div>
  );
};

export default PrivacyPolicyPage;
