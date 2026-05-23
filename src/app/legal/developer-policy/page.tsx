import type { Metadata } from "next";
import { SiteFooter } from "@/components/layout/site-footer";
import { TopNav } from "@/components/layout/top-nav";

export const metadata: Metadata = {
  title: "Developer Policy"
};

const sections = [
  {
    title: "1. Overview",
    content: (
      <>
        <p>
          This Developer Policy (&ldquo;Policy&rdquo;) sets out the requirements and guidelines
          for developers who submit applications (&ldquo;Apps&rdquo;) to the BabaStore platform.
          By registering as a developer and submitting Apps, you agree to comply with this Policy.
        </p>
        <p>
          The Policy is incorporated into the BabaStore Terms of Service. Capitalized terms used
          but not defined here have the meanings given in the Terms of Service.
        </p>
      </>
    )
  },
  {
    title: "2. Developer Registration",
    content: (
      <>
        <p>To submit Apps to BabaStore, you must:</p>
        <ul>
          <li>Create a developer account by selecting the &ldquo;Developer&rdquo; role during registration.</li>
          <li>Provide accurate and complete account information, including a valid email address.</li>
          <li>Maintain an active account in good standing.</li>
        </ul>
        <p>
          Developer accounts are subject to review. BabaStore reserves the right to deny,
          suspend, or revoke developer access at its sole discretion.
        </p>
      </>
    )
  },
  {
    title: "3. App Submission Requirements",
    content: (
      <>
        <p>Every App submitted to BabaStore must include:</p>
        <ul>
          <li><strong>App name</strong> &mdash; a clear, non-misleading name that does not impersonate other apps or brands.</li>
          <li><strong>Description</strong> &mdash; an accurate description of the App&apos;s functionality, features, and purpose.</li>
          <li><strong>Category</strong> &mdash; the correct category that best describes the App.</li>
          <li><strong>Icon</strong> &mdash; a unique, high-resolution icon (at least 512×512 px) that represents the App.</li>
          <li><strong>Screenshots</strong> &mdash; at least one screenshot showing the App&apos;s interface (recommended: 2–4).</li>
          <li><strong>APK file</strong> &mdash; a valid Android APK that has been scanned and passes VirusTotal security checks.</li>
          <li><strong>Version information</strong> &mdash; version name and version code matching the uploaded APK.</li>
          <li><strong>Privacy policy URL</strong> &mdash; required if the App collects any user data.</li>
        </ul>
        <p>
          All submissions are subject to manual review by the BabaStore admin team before
          publication. Incomplete or low-quality submissions may be rejected without review.
        </p>
      </>
    )
  },
  {
    title: "4. Security and Malware",
    content: (
      <>
        <p>
          User safety is a top priority. The following requirements apply to all Apps:
        </p>
        <ul>
          <li>Apps must not contain viruses, trojans, rootkits, spyware, or any form of malicious code.</li>
          <li>Apps must not exploit device vulnerabilities or attempt unauthorized access to system resources.</li>
          <li>Apps must not collect user data without proper disclosure and, where required by law, explicit consent.</li>
          <li>All submitted APKs are automatically scanned by VirusTotal. Apps with detections classified as &ldquo;malicious&rdquo; or &ldquo;suspicious&rdquo; will be rejected.</li>
          <li>Apps found to contain malware after publication will be immediately removed, and the developer account may be permanently suspended.</li>
        </ul>
      </>
    )
  },
  {
    title: "5. Content Guidelines",
    content: (
      <>
        <p>Apps and their metadata must not contain:</p>
        <ul>
          <li>Illegal content or content that promotes illegal activities.</li>
          <li>Explicit sexual content, pornography, or sexually suggestive material.</li>
          <li>Hate speech, harassment, bullying, or content that promotes discrimination.</li>
          <li>Violence, graphic gore, or content that incites harm against individuals or groups.</li>
          <li>Misleading or deceptive claims about the App&apos;s functionality or purpose.</li>
          <li>Copyrighted or trademarked material that you do not own or have permission to use.</li>
          <li>Brand impersonation or the use of confusingly similar names, icons, or branding.</li>
          <li>References to other app stores, distribution channels, or competing platforms.</li>
        </ul>
      </>
    )
  },
  {
    title: "6. Review Process",
    content: (
      <>
        <p>
          All Apps undergo a moderation process before they are published on BabaStore:
        </p>
        <ol className="list-decimal space-y-1.5 pl-5">
          <li><strong>Submission</strong> &mdash; the developer uploads the App and submits it for review.</li>
          <li><strong>VirusTotal scan</strong> &mdash; the APK is automatically scanned for malware. The scan results are recorded and visible to the admin reviewer.</li>
          <li><strong>Manual review</strong> &mdash; an admin reviews the App&apos;s metadata, description, screenshots, and scan results.</li>
          <li><strong>Decision</strong> &mdash; the App is either <strong>approved</strong> (published and visible to users), <strong>rejected</strong> (with a reason provided to the developer), or <strong>flagged</strong> (requiring additional information).</li>
          <li><strong>Notification</strong> &mdash; the developer receives an email with the review outcome.</li>
        </ol>
        <p>
          The review process typically takes 1–3 business days. Apps that fail policy checks
          may be rejected with instructions for resubmission.
        </p>
      </>
    )
  },
  {
    title: "7. Prohibited Conduct",
    content: (
      <>
        <p>Developers must not engage in the following practices:</p>
        <ul>
          <li>Submitting the same or similar Apps under multiple developer accounts.</li>
          <li>Manipulating ratings, reviews, or download counts through automated or fraudulent means.</li>
          <li>Paying or incentivizing users to post positive reviews or ratings.</li>
          <li>Posting negative reviews on competing Apps to gain a competitive advantage.</li>
          <li>Distributing Apps outside of BabaStore that were originally submitted through the Platform.</li>
          <li>Using the developer console to upload test, incomplete, or non-functional Apps.</li>
          <li>Attempting to access other developers&apos; accounts, apps, or data.</li>
        </ul>
      </>
    )
  },
  {
    title: "8. App Updates and Maintenance",
    content: (
      <>
        <p>
          Developers are expected to maintain their published Apps:
        </p>
        <ul>
          <li>Respond to user reviews and feedback in a timely and professional manner.</li>
          <li>Provide updates to fix security vulnerabilities, bugs, and compatibility issues.</li>
          <li>Update the App&apos;s metadata, screenshots, and privacy policy as the App evolves.</li>
          <li>Remove or update Apps that are no longer functional or supported.</li>
        </ul>
        <p>
          Apps that remain unmaintained for extended periods or accumulate negative reviews
          due to unresolved issues may be removed from the Platform at the admin&apos;s discretion.
        </p>
      </>
    )
  },
  {
    title: "9. App Removal and Account Suspension",
    content: (
      <>
        <p>
          BabaStore reserves the right to remove Apps and suspend or terminate developer
          accounts for violations of this Policy, including:
        </p>
        <ul>
          <li>Malware or security threats discovered after publication.</li>
          <li>Repeated or severe policy violations.</li>
          <li>Fraudulent or deceptive conduct.</li>
          <li>Legal or regulatory requirements.</li>
          <li>Copyright or trademark infringement claims.</li>
        </ul>
        <p>
          In most cases, developers will be notified of the violation and given an opportunity
          to address it before account termination. However, immediate termination may occur
          for egregious violations.
        </p>
      </>
    )
  },
  {
    title: "10. Data Protection and Privacy",
    content: (
      <>
        <p>
          Developers must comply with all applicable data protection laws when handling user
          data through their Apps:
        </p>
        <ul>
          <li>Provide a clear and accessible privacy policy that explains what data your App collects and how it is used.</li>
          <li>Obtain explicit consent before collecting sensitive personal data.</li>
          <li>Do not collect data beyond what is necessary for the App&apos;s stated functionality.</li>
          <li>Implement reasonable security measures to protect user data.</li>
          <li>Notify users of any data breaches affecting their information.</li>
        </ul>
      </>
    )
  },
  {
    title: "11. Changes to This Policy",
    content: (
      <>
        <p>
          We may update this Developer Policy from time to time. Developers will be notified
          of material changes via email and through the developer dashboard. Continued use
          of the developer platform after changes take effect constitutes acceptance of the
          updated Policy.
        </p>
      </>
    )
  },
  {
    title: "12. Contact",
    content: (
      <>
        <p>
          If you have questions about this Policy or need assistance with the developer
          platform, please contact us at:
        </p>
        <p className="font-medium text-neutral-950">
          Email: developers@babastore.m2hio.in
        </p>
      </>
    )
  }
];

export default function DeveloperPolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      <TopNav />
      <main className="page-shell py-12 sm:py-16">
        <div className="mx-auto max-w-3xl">
          <div className="mb-10 space-y-3">
            <p className="mono-label">LEGAL</p>
            <h1 className="text-3xl font-bold tracking-tight text-neutral-950 sm:text-4xl">
              Developer Policy
            </h1>
            <p className="text-sm leading-relaxed text-neutral-500">
              Last updated: May 23, 2026
            </p>
            <p className="text-sm leading-relaxed text-neutral-600">
              Guidelines and requirements for developers publishing Apps on BabaStore.
            </p>
          </div>
          <div className="space-y-8">
            {sections.map((s) => (
              <section key={s.title} className="space-y-3">
                <h2 className="text-lg font-semibold text-neutral-950">{s.title}</h2>
                <div className="space-y-3 text-sm leading-relaxed text-neutral-600 [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:space-y-1.5 [&_ol]:pl-5 [&_a]:text-blue-600 [&_a]:underline [&_a:hover]:text-blue-700 [&_strong]:text-neutral-800">
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
