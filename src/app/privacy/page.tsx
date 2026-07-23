import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Privacy Policy for Influence — how we collect, use, and protect your data.",
};

const LAST_UPDATED = "July 23, 2026";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white text-[#1a1a1a]">
      <header className="border-b border-[#ebebeb]">
        <div className="mx-auto flex h-14 max-w-3xl items-center px-4 sm:px-6">
          <Link href="/" className="text-lg font-bold tracking-tight">
            Influence<span className="text-[var(--brand)]">.</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
        <p className="mt-2 text-sm text-[#717171]">Last updated: {LAST_UPDATED}</p>

        <div className="prose-like mt-8 space-y-8 text-[15px] leading-relaxed text-[#333]">
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-[#1a1a1a]">1. Who we are</h2>
            <p>
              Influence (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) is a marketplace that helps brands
              discover and collaborate with Instagram creators, primarily in
              Pakistan. This Privacy Policy explains what information we collect,
              how we use it, and your choices.
            </p>
            <p>
              Contact:{" "}
              <a
                className="text-[var(--brand)] underline underline-offset-2"
                href="mailto:daemazeemdean@gmail.com"
              >
                daemazeemdean@gmail.com
              </a>
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-[#1a1a1a]">2. Information we collect</h2>
            <p>
              <strong>Account information.</strong> When you sign up, we collect
              your name, email address, password (stored hashed), and role (brand
              or creator). Brands may also provide company name, website,
              industry, and location. Creators may provide display name, bio,
              categories, languages, city, and pricing.
            </p>
            <p>
              <strong>Instagram / Meta data.</strong> If you connect Instagram,
              we receive information you authorize through Meta&apos;s Instagram
              API with Instagram Login, which may include your Instagram user ID,
              username, profile photo, biography, follower/following counts,
              media count, and recent media (captions, thumbnails, permalinks,
              like/comment counts, and where available view metrics). We store an
              encrypted access token so we can sync this data when you reconnect
              or refresh.
            </p>
            <p>
              <strong>Usage &amp; communications.</strong> We store offers,
              messages, notifications, reviews, and saved creators that you create
              on the platform, as well as basic technical logs (e.g. IP address,
              user agent) for security and abuse prevention.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-[#1a1a1a]">3. How we use information</h2>
            <ul className="list-disc space-y-2 pl-5">
              <li>Provide and operate the Influence marketplace</li>
              <li>
                Display creator profiles and verified Instagram stats to brands
                for discovery and hiring
              </li>
              <li>Enable offers, messaging, notifications, and reviews</li>
              <li>Authenticate users and secure accounts</li>
              <li>Improve the product, prevent fraud, and comply with law</li>
            </ul>
            <p>
              We do <strong>not</strong> sell your personal data. We do not use
              Instagram data to advertise on Meta products beyond what is needed
              to run Influence itself.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-[#1a1a1a]">4. Sharing</h2>
            <p>
              Creator profile information you make discoverable (including
              Instagram username, stats, and portfolio media we sync) is visible
              to brands using Influence. Brand profile information is visible to
              creators you interact with.
            </p>
            <p>
              We use service providers (e.g. hosting and database providers) who
              process data only to run the service. We may disclose information if
              required by law or to protect rights and safety.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-[#1a1a1a]">5. Data retention</h2>
            <p>
              We keep account and collaboration data while your account is active.
              Instagram tokens and synced metrics/posts are retained until you
              disconnect Instagram or delete your account. Soft-deleted records
              may remain for a limited period for security and dispute handling,
              then be removed or anonymized.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-[#1a1a1a]">6. Your choices &amp; data deletion</h2>
            <p>
              You may update profile information in Settings, disconnect Instagram
              (which stops further syncing), or request deletion of your account
              and associated personal data by emailing{" "}
              <a
                className="text-[var(--brand)] underline underline-offset-2"
                href="mailto:daemazeemdean@gmail.com"
              >
                daemazeemdean@gmail.com
              </a>
              . We will process deletion requests within a reasonable period,
              subject to legal retention needs.
            </p>
            <p>
              You can also revoke Influence&apos;s access to Instagram in your
              Instagram / Meta account settings.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-[#1a1a1a]">7. Security</h2>
            <p>
              We use industry-standard measures such as encrypted connections
              (HTTPS), hashed passwords, and encrypted storage of Instagram
              access tokens. No method of transmission or storage is 100% secure.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-[#1a1a1a]">8. Children</h2>
            <p>
              Influence is not directed to children under 13 (or the minimum age
              required in your country). We do not knowingly collect personal
              information from children.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-[#1a1a1a]">9. Changes</h2>
            <p>
              We may update this policy from time to time. The &quot;Last
              updated&quot; date at the top will change when we do. Continued use
              of Influence after changes means you accept the updated policy.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-[#1a1a1a]">10. Contact</h2>
            <p>
              Questions about privacy:{" "}
              <a
                className="text-[var(--brand)] underline underline-offset-2"
                href="mailto:daemazeemdean@gmail.com"
              >
                daemazeemdean@gmail.com
              </a>
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
