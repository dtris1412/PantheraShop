// server/src/shared/utils/mailer.js
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOrderMail(to, subject, html) {
  try {
    const { data, error } = await resend.emails.send({
      from:
        process.env.RESEND_FROM_EMAIL || "PantheraShop <onboarding@resend.dev>",
      to,
      subject,
      html,
    });
    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    return { success: false, message: err.message };
  }
}
