import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(to: string, verificationUrl: string) {
  const { error } = await resend.emails.send({
    // onboarding@resend.dev is Resend's shared testing sender — fine for
    // development, but it can only deliver to the email address you
    // personally signed up to Resend with, until a custom domain is
    // verified. See setup notes for details.
    from: "Verified Hairs <onboarding@resend.dev>",
    to,
    subject: "Verify your Verified Hairs account",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #be123c;">Verify your email</h2>
        <p>Thanks for signing up to Verified Hairs. Click the button below to verify your email address.</p>
        <p style="margin: 24px 0;">
          <a href="${verificationUrl}" style="background: #be123c; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
            Verify Email
          </a>
        </p>
        <p style="color: #78716c; font-size: 13px;">This link expires in 24 hours. If you didn't create this account, you can ignore this email.</p>
      </div>
    `,
  });

  if (error) {
    console.error("Failed to send verification email:", error);
    throw new Error("Failed to send verification email");
  }
}
