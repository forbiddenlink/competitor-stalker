import { Link } from 'react-router-dom';

const AboutPage: React.FC = () => {
  return (
    <div className="space-y-8 animate-fade-in max-w-4xl">
      <header className="space-y-3">
        <h1 className="text-2xl font-semibold tracking-tight">About Competitor Stalker</h1>
        <p className="text-[var(--text-secondary)]">
          Competitor Stalker is a practical operating console for teams that need fast, consistent competitive
          intelligence across product, strategy, and go-to-market decisions.
        </p>
      </header>

      <section className="surface-card p-6 space-y-3">
        <h2 className="text-lg font-semibold">What The Platform Covers</h2>
        <p className="text-[var(--text-secondary)]">
          The workspace combines competitor dossiers, positioning analysis, feature matrix tracking, pricing
          intelligence, weakness capture, movement alerts, and strategic response planning. The goal is to reduce
          context switching and keep teams aligned on current competitive reality.
        </p>
      </section>

      <section className="surface-card p-6 space-y-3">
        <h2 className="text-lg font-semibold">How Teams Use It</h2>
        <p className="text-[var(--text-secondary)]">
          Product teams use it to prioritize roadmap differentiation, GTM teams use it to sharpen messaging and
          objection handling, and leadership teams use it to understand market pressure before it shows up in topline
          impact.
        </p>
      </section>

      <section className="surface-card p-6 space-y-3">
        <h2 className="text-lg font-semibold">Related Pages</h2>
        <p className="text-[var(--text-secondary)]">
          <Link className="text-[var(--accent-brand-soft)] hover:underline" to="/contact">
            Contact
          </Link>{' '}
          for support or feedback, and review the{' '}
          <Link className="text-[var(--accent-brand-soft)] hover:underline" to="/privacy-policy">
            Privacy Policy
          </Link>{' '}
          for data handling details.
        </p>
      </section>
    </div>
  );
};

export default AboutPage;
