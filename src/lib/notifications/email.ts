import { Resend } from "resend";

const RESEND_KEY = process.env.RESEND_API_KEY;
const FROM = process.env.RESEND_FROM_EMAIL ?? "BabaStore <noreply@babastore.m2hio.in>";

function getClient() {
  if (!RESEND_KEY) return null;
  return new Resend(RESEND_KEY);
}

export async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
}) {
  const resend = getClient();
  if (!resend) return;

  try {
    await resend.emails.send({
      from: FROM,
      to: params.to,
      subject: params.subject,
      html: params.html
    });
  } catch {
    // Email sending is best-effort
  }
}

export async function sendWelcomeEmail(email: string) {
  return sendEmail({
    to: email,
    subject: "Welcome to BabaStore!",
    html: `
      <div style="font-family: system-ui; max-width: 480px; margin: 0 auto;">
        <h1 style="font-size: 24px; color: #171717;">Welcome to BabaStore</h1>
        <p style="color: #4d4d4d; line-height: 1.6;">
          You've successfully created your BabaStore account. Start exploring thousands
          of Android APKs or publish your own apps.
        </p>
        <p style="color: #4d4d4d; line-height: 1.6;">
          <a href="{{siteUrl}}/dashboard"
             style="display: inline-block; padding: 10px 24px; background: #171717;
                    color: white; text-decoration: none; border-radius: 100px;">
            Go to dashboard
          </a>
        </p>
        <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 24px 0;" />
        <p style="color: #888; font-size: 12px;">
          BabaStore — The open Android app marketplace
        </p>
      </div>
    `.replace("{{siteUrl}}", process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000")
  });
}

export async function sendAppPublishedEmail(
  email: string,
  appName: string
) {
  return sendEmail({
    to: email,
    subject: `"${appName}" is now live on BabaStore`,
    html: `
      <div style="font-family: system-ui; max-width: 480px; margin: 0 auto;">
        <h1 style="font-size: 24px; color: #171717;">App published</h1>
        <p style="color: #4d4d4d; line-height: 1.6;">
          Your app <strong>${appName}</strong> is now live and available for download
          on BabaStore.
        </p>
        <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 24px 0;" />
        <p style="color: #888; font-size: 12px;">
          BabaStore — The open Android app marketplace
        </p>
      </div>
    `
  });
}

export async function sendReviewNotificationEmail(
  email: string,
  appName: string,
  approved: boolean
) {
  const status = approved ? "approved" : "rejected";
  return sendEmail({
    to: email,
    subject: `"${appName}" was ${status}`,
    html: `
      <div style="font-family: system-ui; max-width: 480px; margin: 0 auto;">
        <h1 style="font-size: 24px; color: #171717;">Review complete</h1>
        <p style="color: #4d4d4d; line-height: 1.6;">
          Your app <strong>${appName}</strong> has been <strong>${status}</strong>
          by the BabaStore review team.
        </p>
        <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 24px 0;" />
        <p style="color: #888; font-size: 12px;">
          BabaStore — The open Android app marketplace
        </p>
      </div>
    `
  });
}
