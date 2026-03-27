async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  try {
    await fetch("/api/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to, subject, html }),
    });
  } catch (err) {
    console.error("sendEmail error:", err);
  }
}

const brandColor = "#06082C";
const redColor = "#9B2640";

function baseTemplate(content: string): string {
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
      <div style="background: ${brandColor}; padding: 24px 32px;">
        <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 700;">
          Freight Link Network
        </h1>
      </div>
      <div style="padding: 32px;">
        ${content}
      </div>
      <div style="background: #f9fafb; padding: 16px 32px; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 12px; margin: 0;">
          &copy; ${new Date().getFullYear()} Freight Link Network. South Africa's leading B2B logistics platform.
        </p>
      </div>
    </div>
  `;
}

export function sendRegistrationApproved(email: string, name: string): void {
  const html = baseTemplate(`
    <h2 style="color: ${brandColor}; margin-top: 0;">Registration Approved</h2>
    <p>Dear ${name},</p>
    <p>Your registration on Freight Link Network has been approved. You can now log in and complete your company setup.</p>
    <a href="${process.env.NEXT_PUBLIC_SITE_URL}/login"
       style="display: inline-block; background: ${brandColor}; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 16px;">
      Log In Now
    </a>
  `);
  sendEmail(email, "Your Registration Has Been Approved", html);
}

export function sendRegistrationRejected(email: string, name: string, reason: string): void {
  const html = baseTemplate(`
    <h2 style="color: ${redColor}; margin-top: 0;">Registration Not Approved</h2>
    <p>Dear ${name},</p>
    <p>Unfortunately, your registration on Freight Link Network was not approved for the following reason:</p>
    <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px; margin: 16px 0;">
      <p style="margin: 0; color: #991b1b;">${reason}</p>
    </div>
    <p>If you believe this is an error, please contact our support team.</p>
  `);
  sendEmail(email, "Registration Update — Freight Link Network", html);
}

export function sendAccountActivated(email: string, name: string): void {
  const html = baseTemplate(`
    <h2 style="color: ${brandColor}; margin-top: 0;">Account Activated!</h2>
    <p>Dear ${name},</p>
    <p>Great news! Your Freight Link Network account has been reviewed and activated. You now have full access to the platform.</p>
    <a href="${process.env.NEXT_PUBLIC_SITE_URL}/login"
       style="display: inline-block; background: ${brandColor}; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 16px;">
      Access Your Dashboard
    </a>
  `);
  sendEmail(email, "Your Account Is Now Active — Freight Link Network", html);
}

export function sendSetupRejected(email: string, name: string, reason: string): void {
  const html = baseTemplate(`
    <h2 style="color: ${redColor}; margin-top: 0;">Setup Submission Not Approved</h2>
    <p>Dear ${name},</p>
    <p>Your company setup submission could not be approved for the following reason:</p>
    <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px; margin: 16px 0;">
      <p style="margin: 0; color: #991b1b;">${reason}</p>
    </div>
    <p>Please log in to update your information and resubmit.</p>
    <a href="${process.env.NEXT_PUBLIC_SITE_URL}/login"
       style="display: inline-block; background: ${brandColor}; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 16px;">
      Log In to Resubmit
    </a>
  `);
  sendEmail(email, "Setup Submission Update — Freight Link Network", html);
}

export function sendLoadApproved(email: string, name: string, loadTitle: string): void {
  const html = baseTemplate(`
    <h2 style="color: ${brandColor}; margin-top: 0;">Load Approved</h2>
    <p>Dear ${name},</p>
    <p>Your load <strong>"${loadTitle}"</strong> has been reviewed and approved. It is now visible to transporters on the platform.</p>
    <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/supplier/loads"
       style="display: inline-block; background: ${brandColor}; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 16px;">
      View My Loads
    </a>
  `);
  sendEmail(email, `Load Approved: ${loadTitle}`, html);
}

export function sendLoadRejected(email: string, name: string, loadTitle: string, reason: string): void {
  const html = baseTemplate(`
    <h2 style="color: ${redColor}; margin-top: 0;">Load Not Approved</h2>
    <p>Dear ${name},</p>
    <p>Your load <strong>"${loadTitle}"</strong> was not approved for the following reason:</p>
    <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px; margin: 16px 0;">
      <p style="margin: 0; color: #991b1b;">${reason}</p>
    </div>
    <p>Please log in to edit your load and resubmit for review.</p>
    <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/supplier/loads"
       style="display: inline-block; background: ${brandColor}; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 16px;">
      Edit My Loads
    </a>
  `);
  sendEmail(email, `Load Submission Update: ${loadTitle}`, html);
}
