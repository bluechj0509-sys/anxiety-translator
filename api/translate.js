import { Resend } from 'resend';

const COLOR_MAP = {
  'relationship': { name: 'Pink', hex: '#E8A0BF', emoji: '🌸', meaning: 'Love & self-acceptance' },
  'career':       { name: 'Blue', hex: '#4A90D9', emoji: '💙', meaning: 'Clarity & confidence' },
  'money':        { name: 'Green', hex: '#4CAF50', emoji: '🌿', meaning: 'Balance & healing' },
  'future':       { name: 'Gold', hex: '#D4A017', emoji: '✨', meaning: 'Courage & new beginnings' },
  'identity':     { name: 'Purple', hex: '#9B59B6', emoji: '🔮', meaning: 'Inner wisdom & purification' },
  'loss':         { name: 'White', hex: '#E8E8F0', emoji: '🤍', meaning: 'Purity & release' },
  'anger':        { name: 'Red', hex: '#E05555', emoji: '🔴', meaning: 'Vitality & courage' },
  'emptiness':    { name: 'Orange', hex: '#E8943A', emoji: '🧡', meaning: 'Warmth & joy' },
};

const NUMEROLOGY = {
  1: { meaning: 'Number of new beginnings' },
  2: { meaning: 'Number of balance & harmony' },
  3: { meaning: 'Number of creativity & expression' },
  4: { meaning: 'Number of stability & foundation' },
  5: { meaning: 'Number of change & freedom' },
  6: { meaning: 'Number of love & responsibility' },
  7: { meaning: 'Number of inner exploration' },
  8: { meaning: 'Number of abundance & achievement' },
  9: { meaning: 'Number of completion & wisdom' },
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { anxiety, email } = req.body;
  if (!anxiety || !email) return res.status(400).json({ error: 'Missing fields' });

  try {
    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        max_tokens: 800,
        messages: [
          {
            role: 'system',
            content: `You are Moru, a gentle white lop-eared rabbit who translates anxiety into healing.
Your tone is like The Little Prince — warm, poetic, quietly wise. You speak in soft metaphors.
You never say "I understand" or give clinical advice. You simply hold the person's anxiety and transform it.

You must respond ONLY with valid JSON, no markdown, no explanation outside the JSON.

JSON format:
{
  "colorKey": one of: relationship|career|money|future|identity|loss|anger|emptiness,
  "root": short phrase describing the anxiety root (max 6 words, e.g. "Fear of being left behind"),
  "poetic": 2-3 sentences in Little Prince tone — warm, metaphorical, healing,
  "scientific": 2-3 sentences — neuroscience framing, validating, empowering,
  "silent": 2 short lines — minimal, spacious, like a breath,
  "numerologyNumber": a number 1-9 that best matches this anxiety's healing energy (choose thoughtfully),
  "numerologyMessage": 1-2 sentences in Little Prince tone explaining why this number appeared for them today
}`
          },
          {
            role: 'user',
            content: `Translate this anxiety: "${anxiety}"`
          }
        ]
      })
    });

    const openaiData = await openaiRes.json();
    const raw = openaiData.choices?.[0]?.message?.content || '{}';
    const parsed = JSON.parse(raw.replace(/```json|```/g, '').trim());

    const colorInfo = COLOR_MAP[parsed.colorKey] || COLOR_MAP['identity'];
    const numInfo = NUMEROLOGY[parsed.numerologyNumber] || NUMEROLOGY[7];

    // Only send email if real email (not temp)
    if (email !== 'temp@temp.com') {
      const resend = new Resend(process.env.RESEND_API_KEY);

      const emailHtml = `<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<style>
body{margin:0;padding:0;background:#06030f;font-family:Georgia,serif;}
.wrap{max-width:580px;margin:0 auto;padding:40px 24px;}
h1{color:#E8D5FF;font-size:26px;text-align:center;letter-spacing:2px;margin-bottom:4px;}
.sub{color:#B89FD8;font-size:13px;text-align:center;margin-bottom:40px;}
.card{background:#120a1e;border:1px solid #2a1a3e;border-radius:16px;padding:28px;margin-bottom:20px;}
.label{color:#B89FD8;font-size:10px;letter-spacing:3px;text-transform:uppercase;margin-bottom:14px;display:block;}
.color-dot{width:64px;height:64px;border-radius:50%;margin:0 auto 16px;background:${colorInfo.hex};box-shadow:0 0 30px ${colorInfo.hex}55;}
.color-name{color:#E8D5FF;font-size:20px;text-align:center;margin-bottom:6px;}
.root{color:#B89FD8;font-size:13px;text-align:center;}
p{color:#C4B5D8;font-size:15px;line-height:1.8;margin:0;font-style:italic;}
.num-card{background:#1a140a;border:1px solid #4e3d0e;border-radius:16px;padding:28px;margin-bottom:20px;text-align:center;}
.num{color:#D4A017;font-size:56px;font-weight:bold;margin-bottom:4px;}
.num-m{color:#a08030;font-size:13px;margin-bottom:12px;}
.num-msg{color:#c4a030;font-size:14px;line-height:1.8;font-style:italic;}
.upsell{background:#150e25;border:2px solid #4a2d6e;border-radius:16px;padding:32px;text-align:center;margin-bottom:20px;}
.upsell h3{color:#E8D5FF;font-size:20px;margin-bottom:8px;}
.original{color:#6a4a8a;font-size:14px;text-decoration:line-through;margin-bottom:4px;}
.sale-price{color:#E8D5FF;font-size:32px;font-weight:bold;margin-bottom:4px;}
.upsell p{color:#9B7EBD;font-style:normal;margin-bottom:24px;font-size:14px;}
.btn{display:inline-block;background:#7B5EA7;color:white;padding:14px 32px;border-radius:50px;text-decoration:none;font-size:15px;}
.footer{text-align:center;color:#3a2a4e;font-size:12px;}
</style></head>
<body><div class="wrap">
<h1>🐰 Anxiety Translator</h1>
<p class="sub">by MAMARU — Moru has translated your anxiety</p>
<div class="card" style="text-align:center">
  <div class="color-dot"></div>
  <p class="color-name">${colorInfo.emoji} Your healing color today is ${colorInfo.name}</p>
  <p class="root" style="margin-top:8px;">${parsed.root || ''}</p>
</div>
<div class="card"><span class="label">🌹 Little Prince healing</span><p>${parsed.poetic}</p></div>
<div class="card"><span class="label">🧠 What neuroscience says</span><p>${parsed.scientific}</p></div>
<div class="card"><span class="label">🤍 In silence</span><p>${parsed.silent}</p></div>
<div class="num-card">
  <span class="label" style="color:#7a6030;">Today's numerology number</span>
  <p class="num">${parsed.numerologyNumber}</p>
  <p class="num-m">${numInfo.meaning}</p>
  <p class="num-msg">${parsed.numerologyMessage}</p>
</div>
<div class="upsell">
  <h3>✨ Anxiety Translator VIP Pass</h3>
  <p class="original">$49</p>
  <p class="sale-price">$19</p>
  <p>7-day healing meditation plan · Personalized color therapy guide · Extended purification ritual · Healing affirmations</p>
  <a href="https://anxiety-translator.lemonsqueezy.com/checkout/buy/bd63db8b-d363-4e3f-a56d-25df86133fb5" class="btn">🌸 Get VIP Pass — $19</a>
</div>
<div class="footer"><p>Anxiety Translator by MAMARU · @anxiety_translator</p></div>
</div></body></html>`;

      await resend.emails.send({
        from: 'onboarding@resend.dev',
        to: email,
        subject: `${colorInfo.emoji} Your healing color today is ${colorInfo.name} — Anxiety Translator`,
        html: emailHtml,
      });
    }

    res.json({
      success: true,
      color: colorInfo,
      root: parsed.root,
      poetic: parsed.poetic,
      scientific: parsed.scientific,
      silent: parsed.silent,
      number: parsed.numerologyNumber,
      numberInfo: { meaning: numInfo.meaning, message: parsed.numerologyMessage },
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}
