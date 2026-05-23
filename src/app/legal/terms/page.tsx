import type { Metadata } from "next";
import { SiteFooter } from "@/components/layout/site-footer";
import { TopNav } from "@/components/layout/top-nav";

export const metadata: Metadata = {
  title: "Terms of Service"
};

const sections = [
  {
    title: "1. Acceptance of Terms",
    content: (
      <>
        <p>
          By accessing or using BabaStore (&ldquo;the Platform&rdquo;), you agree to be bound by
          these Terms of Service (&ldquo;Terms&rdquo;). If you do not agree, you may not use
          the Platform.
        </p>
        <p>
          We reserve the right to update these Terms at any time. Material changes will be
          notified via the Platform. Continued use after changes constitutes acceptance of the
          new Terms.
        </p>
      </>
    )
  },
  {
    title: "2. Eligibility",
    content: (
      <>
        <p>You must meet the following conditions to use BabaStore:</p>
        <ul>
          <li>You are at least 13 years of age (or 16 in the European Union).</li>
          <li>You have the legal capacity to enter into a binding agreement.</li>
          <li>You are not located in a jurisdiction where use of the Platform is prohibited.</li>
          <li>You have not been previously banned or suspended from the Platform.</li>
        </ul>
      </>
    )
  },
  {
    title: "3. Account Registration and Security",
    content: (
      <>
        <p>
          You are responsible for maintaining the confidentiality of your account credentials
          and for all activities that occur under your account. You agree to:
        </p>
        <ul>
          <li>Provide accurate, current, and complete information during registration.</li>
          <li>Promptly update your account information if it changes.</li>
          <li>Notify us immediately of any unauthorized use of your account.</li>
          <li>Use a strong password and not share your credentials with others.</li>
        </ul>
        <p>
          We are not liable for any loss or damage arising from unauthorized use of your
          account resulting from your failure to safeguard your credentials.
        </p>
      </>
    )
  },
  {
    title: "4. User Conduct",
    content: (
      <>
        <p>You agree not to:</p>
        <ul>
          <li>Use the Platform for any unlawful purpose or in violation of any applicable law.</li>
          <li>Upload, publish, or distribute malware, viruses, or any malicious code.</li>
          <li>Submit apps that infringe on any third-party intellectual property rights.</li>
          <li>Post false, misleading, or deceptive reviews or ratings.</li>
          <li>Harass, abuse, or harm other users, developers, or platform staff.</li>
          <li>Attempt to bypass security measures, rate limits, or access restricted areas.</li>
          <li>Scrape, crawl, or otherwise extract data from the Platform without authorization.</li>
          <li>Impersonate any person or entity or misrepresent your affiliation.</li>
        </ul>
      </>
    )
  },
  {
    title: "5. App Listings and Downloads",
    content: (
      <>
        <p>
          BabaStore provides a platform for discovering and downloading Android APK files.
          The following applies to all app listings and downloads:
        </p>
        <ul>
          <li>Apps listed on the Platform may include third-party content not owned or controlled by BabaStore.</li>
          <li>We do not guarantee the accuracy, completeness, or safety of any app listing.</li>
          <li>APK files are scanned with VirusTotal before publication, but no security guarantee is expressed or implied.</li>
          <li>Downloads are provided &ldquo;as is&rdquo; without warranty of any kind.</li>
          <li>You download and install apps at your own risk.</li>
        </ul>
      </>
    )
  },
  {
    title: "6. Developer Submissions",
    content: (
      <>
        <p>
          Developers who submit apps to BabaStore agree to the following additional terms:
        </p>
        <ul>
          <li>You represent and warrant that you own or have all necessary rights to the app and its content.</li>
          <li>Your app must not contain malware, spyware, or any code that harms user devices or privacy.</li>
          <li>Your app must comply with all applicable laws, including data protection and consumer protection regulations.</li>
          <li>You are solely responsible for the apps you submit and any consequences of their distribution.</li>
          <li>You grant BabaStore a non-exclusive, royalty-free license to distribute, display, and promote your app on the Platform.</li>
          <li>You agree to the Developer Policy, which is incorporated into these Terms by reference.</li>
        </ul>
      </>
    )
  },
  {
    title: "7. Reviews and User Content",
    content: (
      <>
        <p>
          Users may submit reviews, ratings, and other content. By submitting content, you agree that:
        </p>
        <ul>
          <li>You grant BabaStore a non-exclusive, royalty-free, worldwide license to display and distribute your content on the Platform.</li>
          <li>Your content must be accurate, not misleading, and based on your genuine experience with the app.</li>
          <li>You retain ownership of your content, but BabaStore may moderate, edit, or remove it at its discretion.</li>
          <li>You may not submit content that is illegal, offensive, defamatory, or infringes on third-party rights.</li>
        </ul>
      </>
    )
  },
  {
    title: "8. Intellectual Property",
    content: (
      <>
        <p>
          The BabaStore name, logo, design, and platform code are the intellectual property of
          BabaStore and its operators. You may not reproduce, modify, distribute, or create
          derivative works without prior written consent.
        </p>
        <p>
          All apps, trademarks, and content submitted by developers remain the property of
          their respective owners.
        </p>
      </>
    )
  },
  {
    title: "9. Termination",
    content: (
      <>
        <p>
          We reserve the right to suspend or terminate your access to the Platform at any
          time, with or without notice, for conduct that we believe violates these Terms,
          applicable law, or is harmful to other users or the Platform.
        </p>
        <p>
          Upon termination, your right to use the Platform ceases immediately. We may delete
          your account, app listings, reviews, and associated data. Sections 8, 10, 11, and 12
          survive termination.
        </p>
      </>
    )
  },
  {
    title: "10. Limitation of Liability",
    content: (
      <>
        <p>
          To the maximum extent permitted by law, BabaStore and its operators shall not be
          liable for any indirect, incidental, special, consequential, or punitive damages
          arising from or related to your use of the Platform.
        </p>
        <p>
          This includes, but is not limited to, damages for loss of data, loss of profits,
          device damage, or service interruption, even if we have been advised of the
          possibility of such damages.
        </p>
      </>
    )
  },
  {
    title: "11. Disclaimer of Warranties",
    content: (
      <>
        <p>
          The Platform is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without
          warranties of any kind, either express or implied. We do not warrant that:
        </p>
        <ul>
          <li>The Platform will be uninterrupted, timely, secure, or error-free.</li>
          <li>The results obtained from using the Platform will be accurate or reliable.</li>
          <li>The quality of any apps, services, or information obtained through the Platform will meet your expectations.</li>
          <li>APK files are free from malware or other harmful components, notwithstanding VirusTotal scanning.</li>
        </ul>
      </>
    )
  },
  {
    title: "12. Governing Law",
    content: (
      <>
        <p>
          These Terms shall be governed by and construed in accordance with the laws of
          India, without regard to its conflict of law provisions. Any disputes arising
          under these Terms shall be resolved in the courts of India.
        </p>
      </>
    )
  },
  {
    title: "13. Contact",
    content: (
      <>
        <p>
          For questions about these Terms, please contact us at:
        </p>
        <p className="font-medium text-neutral-950">
          Email: legal@babastore.m2hio.in
        </p>
      </>
    )
  }
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <TopNav />
      <main className="page-shell py-12 sm:py-16">
        <div className="mx-auto max-w-3xl">
          <div className="mb-10 space-y-3">
            <p className="mono-label">LEGAL</p>
            <h1 className="text-3xl font-bold tracking-tight text-neutral-950 sm:text-4xl">
              Terms of Service
            </h1>
            <p className="text-sm leading-relaxed text-neutral-500">
              Last updated: May 23, 2026
            </p>
            <p className="text-sm leading-relaxed text-neutral-600">
              These Terms govern your use of BabaStore. Please read them carefully before
              using the Platform.
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
