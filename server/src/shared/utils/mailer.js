// server/src/shared/utils/mailer.js
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOrderMail(to, subject, html) {
  try {
    console.log("📧 [Resend] Sending email...");
    console.log("  To:", to);
    console.log("  Subject:", subject);
    console.log(
      "  API Key:",
      process.env.RESEND_API_KEY ? "✓ Set" : "✗ Missing"
    );
    console.log(
      "  From:",
      process.env.RESEND_FROM_EMAIL || "PantheraShop <onboarding@resend.dev>"
    );

    const { data, error } = await resend.emails.send({
      from:
        process.env.RESEND_FROM_EMAIL || "PantheraShop <onboarding@resend.dev>",
      to,
      subject,
      html,
    });

    if (error) {
      console.error("❌ [Resend] Error:", error);
      throw error;
    }

    console.log("✅ [Resend] Email sent successfully:", data);
    return { success: true, data };
  } catch (err) {
    console.error("❌ [Resend] Exception:", err);
    return { success: false, message: err.message };
  }
}
