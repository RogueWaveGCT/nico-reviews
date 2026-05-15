"use client";

interface FooterProps {
  businessName: string;
}

export function Footer({ businessName }: FooterProps) {
  return (
    <footer className="text-center py-16 px-4">
      <div className="glass-card inline-block px-8 py-4 mx-auto">
        <a
          href="tel:+447946065211"
          className="text-accent-teal hover:text-accent-gold transition-colors text-lg font-medium"
        >
          Get in touch
        </a>
      </div>
      <p className="text-text-tertiary text-xs mt-8">
        {businessName} · Reviews aggregated from Google and TripAdvisor
      </p>
    </footer>
  );
}
