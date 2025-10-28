function orderConfirmationHtml(orderId: string) {
  const appName = process.env.APP_NAME || 'CourseHub';
  return `<!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>${appName} – Order Confirmation</title>
      <style>
        body { font-family: -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; color: #111827; }
        .container { max-width: 560px; margin: 24px auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 10px; }
        .btn { display:inline-block; padding: 10px 16px; background: #111827; color:#fff; text-decoration:none; border-radius:8px; }
        .muted { color: #6b7280; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Thanks for your purchase!</h1>
        <p>Your order <strong>#${orderId}</strong> is confirmed.</p>
        <p>You now have access to your enrolled courses.</p>
        <p style="margin-top:24px;" class="muted">If you didn’t make this purchase, please contact support immediately.</p>
      </div>
    </body>
  </html>`;
}

export async function sendOrderConfirmation(to: string, orderId: string) {
  const enabled = (process.env.EMAIL_ENABLED || '').toLowerCase() === 'true';
  if (!enabled) {
    console.log(`[email] Skipped (EMAIL_ENABLED!=true). Would send order ${orderId} to ${to}`);
    return;
  }

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM;

  if (!host || !user || !pass || !from) {
    console.warn('[email] Missing SMTP config (SMTP_HOST/SMTP_USER/SMTP_PASS/SMTP_FROM). Email not sent.');
    return;
  }

  try {
    // @ts-ignore – allow dynamic import without type declarations
    const nodemailer: any = await import('nodemailer');
    const transporter = nodemailer.createTransport({ host, port, auth: { user, pass } });
    const subject = `Order Confirmation #${orderId}`;
    const html = orderConfirmationHtml(orderId);
    await transporter.sendMail({ from, to, subject, html, text: `Your order ${orderId} is confirmed.` });
    console.log(`[email] Sent order confirmation to ${to} for order ${orderId}`);
  } catch (err) {
    console.error('[email] Failed to send order confirmation:', err);
  }
}
