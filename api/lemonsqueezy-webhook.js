import { Resend } from 'resend';
import crypto from 'crypto';

// Verifies the request actually came from LemonSqueezy using the webhook secret
function verifySignature(rawBody, signature, secret) {
  if (!secret) return true; // allow through if no secret configured yet (set one in LemonSqueezy + Vercel env)
  const hmac = crypto.createHmac('sha256', secret);
  const digest = hmac.update(rawBody).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(digest, 'utf8'), Buffer.from(signature, 'utf8'));
}

export const config = {
  api: {
    bodyParser: false, // we need the raw body to verify the signature
  },
};

async function getRawBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return Buffer.concat(chunks).toString('utf8');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const rawBody = await getRawBody(req);
    const signature = req.headers['x-signature'] || '';
    const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;

    if (secret && !verifySignature(rawBody, signature, secret)) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const payload = JSON.parse(rawBody);
    const eventName = payload.meta?.event_name;

    // Only act on successful order/payment events
    if (eventName !== 'order_created') {
      return res.status(200).json({ received: true, skipped: eventName });
    }

    const email = payload.data?.attributes?.user_email;
    if (!email) return res.status(200).json({ received: true, skipped: 'no email' });

    const resend = new Resend(process.env.RESEND_API_KEY);

    const emailHtml = `<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<style>
body{margin:0;padding:0;background:#06030f;font-family:Georgia,serif;}
.wrap{max-width:580px;margin:0 auto;padding:40px 24px;}
h1{color:#E8D5FF;font-size:26px;text-align:center;letter-spacing:2px;margin-bottom:8px;}
.sub{color:#B89FD8;font-size:14px;text-align:center;margin-bottom:36px;font-style:italic;}
.card{background:#150e25;border:2px solid #4a2d6e;border-radius:16px;padding:28px;margin-bottom:20px;}
.card h2{color:#E8D5FF;font-size:18px;margin-bottom:14px;font-weight:normal;}
p{color:#C4B5D8;font-size:15px;line-height:1.8;margin:0 0 12px;}
.btn{display:inline-block;background:linear-gradient(135deg,#7B5EA7,#9B59B6);color:white;padding:14px 32px;border-radius:50px;text-decoration:none;font-size:15px;margin-top:8px;}
.center{text-align:center;}
.footer{text-align:center;color:#3a2a4e;font-size:12px;margin-top:30px;}
</style></head>
<body><div class="wrap">
<h1>🌸 Welcome to the VIP Pass</h1>
<p class="sub">Moru is glad you're here</p>

<div class="card">
  <h2>What's unlocked for you now</h2>
  <p>You now have <b>unlimited access</b> to Anxiety Translator — bring Moru your anxiety as many times as you need, any day.</p>
  <p>Every translation includes your healing color, a Little Prince–style purification message, a neuroscience explanation, and your numerology number for that moment.</p>
</div>

<div class="card center">
  <h2>Keep Moru one tap away</h2>
  <p>Add Anxiety Translator to your phone's home screen so it feels like your own healing app.</p>
  <p style="font-size:13px;color:#9B7EBD;">On iPhone: tap Share → Add to Home Screen.<br>On Android: tap the browser menu (⋮) → Add to Home Screen.</p>
</div>

<div class="center">
  <a href="https://anxiety-translator.vercel.app" class="btn">Open Anxiety Translator 🐰</a>
</div>

<div class="footer"><p>Anxiety Translator by MAMARU · @anxiety_translator</p></div>
</div></body></html>`;

    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: email,
      subject: '🌸 Welcome to VIP Pass — Moru is ready whenever you are',
      html: emailHtml,
    });

    return res.status(200).json({ received: true, emailed: email });

  } catch (err) {
    console.error('LemonSqueezy webhook error:', err);
    return res.status(500).json({ error: 'Webhook processing failed' });
  }
}
