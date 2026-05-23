import { Resend } from "resend";

const RESEND_KEY = process.env.RESEND_API_KEY;
const FROM = process.env.RESEND_FROM_EMAIL!;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL!.replace(/\/+$/, "");

function getClient() {
  if (!RESEND_KEY) return null;
  return new Resend(RESEND_KEY);
}

function emailLayout(body: string) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:24px 0">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:520px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.06),0 1px 2px rgba(0,0,0,0.04)">
          <tr>
            <td style="padding:32px 32px 0">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="font-size:20px;font-weight:700;color:#171717;letter-spacing:-0.5px">BabaStore</td>
                  <td align="right" style="color:#888;font-size:12px">Android App Marketplace</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr><td style="padding:8px 32px 0"><hr style="border:none;border-top:1px solid #ebebeb;margin:0"></td></tr>
          <tr><td style="padding:24px 32px 0;color:#171717;font-size:15px;line-height:1.6">${body}</td></tr>
          <tr>
            <td style="padding:24px 32px 32px">
              <hr style="border:none;border-top:1px solid #ebebeb;margin:0 0 16px">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="color:#888;font-size:12px;line-height:1.5">
                    BabaStore — The open Android app marketplace<br>
                    <a href="${SITE_URL}" style="color:#0070f3;text-decoration:none">${SITE_URL}</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function primaryButton(href: string, label: string) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0"><tr><td align="center"><a href="${href}" style="display:inline-block;padding:12px 32px;background:#171717;color:#ffffff;text-decoration:none;border-radius:100px;font-size:14px;font-weight:600">${label}</a></td></tr></table>`;
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
      html: emailLayout(params.html)
    });
  } catch {
    // Email sending is best-effort
  }
}

export async function sendConfirmationEmail(email: string, confirmUrl: string) {
  return sendEmail({
    to: email,
    subject: "Confirm your BabaStore account",
    html: `
      <h2 style="font-size:20px;font-weight:600;margin:0 0 8px">Confirm your email</h2>
      <p style="margin:0 0 16px;color:#4d4d4d">Thanks for signing up! Click the button below to confirm your email address and activate your BabaStore account.</p>
      ${primaryButton(confirmUrl, "Confirm account")}
      <p style="margin:16px 0 0;color:#888;font-size:13px">If you didn't create this account, you can ignore this email. The link expires in 24 hours.</p>
      <p style="margin:8px 0 0;color:#888;font-size:13px">Or copy and paste this URL into your browser:</p>
      <p style="margin:4px 0 0;font-size:12px;word-break:break-all;color:#0070f3">${confirmUrl}</p>
    `
  });
}

export async function sendWelcomeEmail(email: string, username?: string) {
  const dashUrl = `${SITE_URL}/dashboard`;
  return sendEmail({
    to: email,
    subject: "Welcome to BabaStore!",
    html: `
      <h2 style="font-size:20px;font-weight:600;margin:0 0 8px">Welcome${username ? `, ${username}` : ""}!</h2>
      <p style="margin:0 0 16px;color:#4d4d4d">You've successfully joined BabaStore — the open Android app marketplace. Browse thousands of free APKs, read reviews, and install apps directly.</p>
      ${primaryButton(dashUrl, "Go to dashboard")}
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0 0">
        <tr>
          <td style="padding:16px;background:#f5f5f5;border-radius:8px;font-size:13px;color:#4d4d4d;line-height:1.5">
            <strong style="color:#171717">Quick tips:</strong><br>
            • Browse and install free Android APKs<br>
            • Publish your own apps as a developer<br>
            • Rate and review apps you've tried
          </td>
        </tr>
      </table>
    `
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
      <h2 style="font-size:20px;font-weight:600;margin:0 0 8px">App published 🎉</h2>
      <p style="margin:0 0 16px;color:#4d4d4d">Your app <strong>${appName}</strong> has been approved and is now live on BabaStore. Users can discover, download, and install it.</p>
      ${primaryButton(`${SITE_URL}/developer/apps`, "View my apps")}
    `
  });
}

export async function sendReviewNotificationEmail(
  email: string,
  appName: string,
  approved: boolean
) {
  const status = approved ? "approved" : "rejected";
  const icon = approved ? "✅" : "⚠️";
  return sendEmail({
    to: email,
    subject: `"${appName}" was ${status}`,
    html: `
      <h2 style="font-size:20px;font-weight:600;margin:0 0 8px">Review complete ${icon}</h2>
      <p style="margin:0 0 16px;color:#4d4d4d">Your app <strong>${appName}</strong> has been reviewed and <strong>${status}</strong> by the BabaStore team.</p>
      ${approved ? primaryButton(`${SITE_URL}/developer/apps`, "View my apps") : `<p style="margin:16px 0 0;color:#888;font-size:13px">If your app was rejected, you can make changes and resubmit it for review.</p>`}
    `
  });
}
