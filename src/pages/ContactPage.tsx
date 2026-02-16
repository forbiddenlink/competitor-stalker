import { Link } from 'react-router-dom';

const ContactPage: React.FC = () => {
  return (
    <div className="space-y-8 animate-fade-in max-w-3xl">
      <header className="space-y-3">
        <h1 className="text-2xl font-semibold tracking-tight">Contact</h1>
        <p className="text-[var(--text-secondary)]">
          Questions, bug reports, and product feedback are welcome. Use the details below to reach the team.
        </p>
      </header>

      <section className="surface-card p-6 space-y-4">
        <h2 className="text-lg font-semibold">Support Channels</h2>
        <div className="space-y-2 text-[var(--text-secondary)]">
          <p>
            Product Support:{' '}
            <a className="text-[var(--accent-brand-soft)] hover:underline" href="mailto:support@competitorstalker.com">
              support@competitorstalker.com
            </a>
          </p>
          <p>
            Security Reports:{' '}
            <a className="text-[var(--accent-brand-soft)] hover:underline" href="mailto:security@competitorstalker.com">
              security@competitorstalker.com
            </a>
          </p>
          <p>
            Partnership Inquiries:{' '}
            <a
              className="text-[var(--accent-brand-soft)] hover:underline"
              href="mailto:partnerships@competitorstalker.com"
            >
              partnerships@competitorstalker.com
            </a>
          </p>
        </div>
      </section>

      <section className="surface-card p-6 space-y-3">
        <h2 className="text-lg font-semibold">Response Time</h2>
        <p className="text-[var(--text-secondary)]">
          We typically respond to support requests within one business day. Security reports are prioritized and
          triaged as soon as possible.
        </p>
        <p className="text-[var(--text-secondary)]">
          For policy details, see the{' '}
          <Link className="text-[var(--accent-brand-soft)] hover:underline" to="/privacy-policy">
            Privacy Policy
          </Link>
          .
        </p>
      </section>
    </div>
  );
};

export default ContactPage;
