import type { Metadata } from "next";
import { SiteFooter } from "@/components/layout/site-footer";
import { TopNav } from "@/components/layout/top-nav";

export const metadata: Metadata = {
  title: "Privacy Policy"
};

const sections = [
  {
    title: "1. Information We Collect",
    content: (
      <>
        <p>
          We collect information you provide directly to us when you create an account,
          submit an app, write a review, or contact us. This includes:
        </p>
        <ul>
          <li><strong>Account information</strong> &mdash; email address, username, and account role (user, developer, or admin).</li>
          <li><strong>Profile information</strong> &mdash; avatar image and any other profile details you choose to add.</li>
          <li><strong>App metadata</strong> &mdash; for developers: app name, description, icon, screenshots, APK files, category, version data, and privacy policy URL.</li>
          <li><strong>User content</strong> &mdash; app reviews, ratings, wishlist entries, and feedback submissions.</li>
          <li><strong>Communication</strong> &mdash; if you contact us, we collect the content of your message and your contact details.</li>
        </ul>
        <p>
          We also automatically collect certain information when you use BabaStore:
        </p>
        <ul>
          <li><strong>Download logs</strong> &mdash; when you download an APK, we record the app ID, a timestamp, and a unique device or session identifier for analytics.</li>
          <li><strong>Usage data</strong> &mdash; page views, search queries, and interaction with app listings.</li>
          <li><strong>Technical data</strong> &mdash; IP address, browser type and version, device type, operating system, and referrer URL.</li>
        </ul>
      </>
    )
  },
  {
    title: "2. How We Use Your Information",
    content: (
      <>
        <p>We use the collected information to:</p>
        <ul>
          <li>Operate, maintain, and improve BabaStore and its features.</li>
          <li>Authenticate your account and authorize access based on your role.</li>
          <li>Process app submissions, including VirusTotal malware scanning before publication.</li>
          <li>Display app listings, ratings, and reviews to other users.</li>
          <li>Send transactional emails via Resend (account confirmation, password reset, app publish/rejection notifications, review responses).</li>
          <li>Send real-time admin alerts via Telegram for new registrations, app submissions, and security events.</li>
          <li>Generate download analytics and top-chart rankings.</li>
          <li>Detect and prevent abuse, spam, and policy violations.</li>
          <li>Comply with legal obligations and enforce our Terms of Service.</li>
        </ul>
      </>
    )
  },
  {
    title: "3. Third-Party Services",
    content: (
      <>
        <p>BabaStore relies on several third-party services to function:</p>
        <ul>
          <li>
            <strong>Supabase</strong> &mdash; authentication, database (PostgreSQL), and file storage.
            Your account credentials, profile, and app data are stored in Supabase.
            See <a href="https://supabase.com/privacy">Supabase Privacy Policy</a>.
          </li>
          <li>
            <strong>Cloudflare R2</strong> &mdash; object storage for APK files, app icons, and screenshots.
            See <a href="https://www.cloudflare.com/privacypolicy/">Cloudflare Privacy Policy</a>.
          </li>
          <li>
            <strong>Resend</strong> &mdash; transactional email delivery (confirmation emails, notifications).
            Your email address is shared with Resend for delivery purposes.
            See <a href="https://resend.com/legal/privacy">Resend Privacy Policy</a>.
          </li>
          <li>
            <strong>VirusTotal</strong> &mdash; APK malware scanning. Uploaded APK files and their hashes
            are sent to VirusTotal for analysis.
            See <a href="https://www.virustotal.com/en/about/terms-of-service/">VirusTotal Terms</a>.
          </li>
          <li>
            <strong>NVIDIA NIM &amp; Google Gemini</strong> &mdash; AI-powered app description generation.
            App metadata may be sent to these services when you use the AI description feature.
          </li>
          <li>
            <strong>BabaStore Feed API</strong> &mdash; external catalog data provider for app search and listings.
          </li>
          <li>
            <strong>Vercel</strong> &mdash; hosting and deployment platform.
            See <a href="https://vercel.com/legal/privacy">Vercel Privacy Policy</a>.
          </li>
        </ul>
        <p>
          These third parties have their own privacy policies governing the use of your data.
          We encourage you to review them.
        </p>
      </>
    )
  },
  {
    title: "4. Data Sharing and Disclosure",
    content: (
      <>
        <p>We do not sell your personal information. We may share your data in the following circumstances:</p>
        <ul>
          <li><strong>Public content</strong> &mdash; your username, reviews, ratings, and wishlist items are visible to other users as part of the platform.</li>
          <li><strong>Developer information</strong> &mdash; if you publish apps, your developer name and contact information chosen for your developer profile are displayed on your app listings.</li>
          <li><strong>Service providers</strong> &mdash; we share necessary data with the third-party services listed above to operate the platform.</li>
          <li><strong>Legal compliance</strong> &mdash; we may disclose information if required by law, court order, or governmental regulation.</li>
          <li><strong>Protection of rights</strong> &mdash; we may disclose information to enforce our policies, protect our rights, or investigate fraud and abuse.</li>
        </ul>
      </>
    )
  },
  {
    title: "5. Data Retention",
    content: (
      <>
        <p>
          We retain your account information for as long as your account is active. If you
          delete your account, we will remove or anonymize your personal data within a
          reasonable period, except where retention is required by law.
        </p>
        <p>
          Download logs and analytics data are retained for up to 12 months. App submissions
          and associated scan results are retained for the lifetime of the app listing.
        </p>
      </>
    )
  },
  {
    title: "6. Your Rights",
    content: (
      <>
        <p>Depending on your jurisdiction, you may have the right to:</p>
        <ul>
          <li>Access the personal data we hold about you.</li>
          <li>Request correction or deletion of your personal data.</li>
          <li>Object to or restrict processing of your data.</li>
          <li>Request data portability.</li>
          <li>Withdraw consent at any time where processing is based on consent.</li>
        </ul>
        <p>
          To exercise any of these rights, contact us at the email address below. We will
          respond within 30 days.
        </p>
      </>
    )
  },
  {
    title: "7. Cookies and Tracking",
    content: (
      <>
        <p>
          BabaStore uses essential cookies for authentication and session management via Supabase
          Auth. These cookies are necessary for the platform to function. We do not use
          tracking cookies, analytics cookies, or advertising cookies.
        </p>
        <p>
          The Supabase SSR framework sets session cookies to maintain your logged-in state
          across page requests. These are first-party cookies and are deleted when you sign out.
        </p>
      </>
    )
  },
  {
    title: "8. Children's Privacy",
    content: (
      <>
        <p>
          BabaStore is not directed to children under 13 (or under 16 in the EU). We do not
          knowingly collect personal information from children. If we learn that a child has
          provided us with personal data, we will delete it promptly.
        </p>
      </>
    )
  },
  {
    title: "9. Security",
    content: (
      <>
        <p>
          We implement reasonable security measures to protect your data, including encryption
          in transit (TLS), Content Security Policy headers, rate limiting on API routes, and
          Supabase Row-Level Security policies on all database tables. However, no method of
          electronic storage or transmission is 100% secure.
        </p>
      </>
    )
  },
  {
    title: "10. Changes to This Policy",
    content: (
      <>
        <p>
          We may update this Privacy Policy from time to time. Material changes will be
          communicated via the BabaStore website or through other reasonable means. Your
          continued use of the platform after changes constitutes acceptance of the updated policy.
        </p>
      </>
    )
  },
  {
    title: "11. Contact",
    content: (
      <>
        <p>
          If you have questions about this Privacy Policy or wish to exercise your data rights,
          please contact us at:
        </p>
        <p className="font-medium text-neutral-950">
          Email: privacy@babastore.m2hio.in
        </p>
      </>
    )
  }
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <TopNav />
      <main className="page-shell py-12 sm:py-16">
        <div className="mx-auto max-w-3xl">
          <div className="mb-10 space-y-3">
            <p className="mono-label">LEGAL</p>
            <h1 className="text-3xl font-bold tracking-tight text-neutral-950 sm:text-4xl">
              Privacy Policy
            </h1>
            <p className="text-sm leading-relaxed text-neutral-500">
              Last updated: May 23, 2026
            </p>
            <p className="text-sm leading-relaxed text-neutral-600">
              This policy describes how BabaStore collects, uses, and protects your
              personal information when you use our platform.
            </p>
          </div>
          <div className="space-y-8">
            {sections.map((s) => (
              <section key={s.title} className="space-y-3">
                <h2 className="text-lg font-semibold text-neutral-950">{s.title}</h2>
                <div className="space-y-3 text-sm leading-relaxed text-neutral-600 [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5 [&_a]:text-blue-600 [&_a]:underline [&_a:hover]:text-blue-700 [&_strong]:text-neutral-800">
                  {s.content}
                </div>
              </section>
            ))}
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
