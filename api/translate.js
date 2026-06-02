import Anthropic from '@anthropic-ai/sdk';
import { Resend } from 'resend';

const COLOR_MAP = {
  '연애/관계': { color: 'Pink', hex: '#E8A0BF', emoji: '🌸' },
  '시험/취업': { color: 'Gold', hex: '#D4A017', emoji: '🌟' },
  '돈/생계': { color: 'Green', hex: '#4CAF50', emoji: '🌿' },
  '직장/커리어': { color: 'Blue', hex: '#4A90D9', emoji: '💙' },
  '무기력/막연': { color: 'Purple', hex: '#9B59B6', emoji: '🔮' },
};

const NUMEROLOGY = {
  1: { meaning: 'Number of new beginnings', message: 'A new door is opening for you today.' },
  2: { meaning: 'Number of balance & harmony', message: 'This anxiety is a signal to find deeper balance.' },
  3: { meaning: 'Number of creativity & expression', message: 'The creative force within you is awakening.' },
  4: { meaning: 'Number of stability & foundation', message: 'Though shaken, your roots run deep.' },
  5: { meaning: 'Number of change & freedom', message: 'This anxiety is the prelude to transformation. Do not fear.' },
  6: { meaning: 'Number of love & responsibility', message: 'The weight you carry is proof of how deeply you care.' },
  7: { meaning: 'Number of inner exploration', message: 'The universe is telling you this anxiety is a signal of growth.' },
  8: { meaning: 'Number of abundance & achievement', message: 'This difficulty is the path to greater abundance.' },
  9: { meaning: 'Number of completion & wisdom', message: 'When this cycle completes, you will emerge wiser.' },
};

function getTodayNumber() {
  const today = new Date();
  const dateStr = `${today.getFullYear()}${today.getMonth() + 1}${today.getDate()}`;
  let sum = dateStr.split('').reduce((a, b) => a + parseInt(b), 0);
  while (sum > 9) {
    sum = String(sum).split('').reduce((a, b) => a + parseInt(b), 0);
  }
  return sum || 9;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { anxiety, email } = req.body;
  if (!anxiety || !email) return res.status(400).json({ error: 'Missing fields' });

  try {
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const resend = new Resend(process.env.RESEND_API_KEY);

    const completion = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 1000,
      messages: [{
        role: 'user',
        content: `Analyze this anxiety text and respond ONLY with JSON, no other text.

Anxiety: "${anxiety}"

JSON format:
{
  "category": "연애/관계" | "시험/취업" | "돈/생계" | "직장/커리어" | "무기력/막연",
  "root": "Fear of abandonment" | "Pressure of falling behind" | "Helplessness" | "Self-blame" | "Vague dread",
  "poetic": "Poetic healing message (2-3 sentences, English)",
  "scientific": "Neuroscience-based healing message (2-3 sentences, English)",
  "silent": "Minimalist healing message (1-2 short sentences, English)"
}`
      }]
    });

    const raw = completion.content[0].text.trim();
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    const analysis = JSON.parse(jsonMatch[0]);

    const colorInfo = COLOR_MAP[analysis.category] || COLOR_MAP['무기력/막연'];
    const todayNum = getTodayNumber();
    const numInfo = NUMEROLOGY[todayNum];

    const emailHtml = `<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<style>
body{margin:0;padding:0;background:#06030f;font-family:Georgia,serif;}
.wrap{max-width:580px;margin:0 auto;padding:40px 24px;}
h1{color:#E8D5FF;font-size:26px;text-align:center;letter-spacing:2px;margin-bottom:4px;}
.sub{color:#7B5EA7;font-size:13px;text-align:center;margin-bottom:40px;}
.card{background:#120a1e;border:1px solid #2a1a3e;border-radius:16px;padding:28px;margin-bottom:20px;}
.label{color:#7B5EA7;font-size:10px;letter-spacing:3px;text-transform:uppercase;margin-bottom:14px;}
.color-dot{width:64px;height:64px;border-radius:50%;margin:0 auto 16px;background:${colorInfo.hex};box-shadow:0 0 30px ${colorInfo.hex}55;}
.color-name{color:#E8D5FF;font-size:20px;text-align:center;margin-bottom:6px;}
.root{color:#7B5EA7;font-size:13px;text-align:center;}
p{color:#C4B5D8;font-size:15px;line-height:1.8;margin:0;font-style:italic;}
.num-card{background:#1a140a;border:1px solid #4e3d0e;border-radius:16px;padding:28px;margin-bottom:20px;text-align:center;}
.num{color:#D4A017;font-size:56px;font-weight:bold;margin-bottom:4px;}
.num-m{color:#a08030;font-size:13px;margin-bottom:12px;}
.num-msg{color:#c4a030;font-size:14px;line-height:1.8;font-style:italic;}
.upsell{background:#150e25;border:2px solid #4a2d6e;border-radius:16px;padding:32px;text-align:center;margin-bottom:20px;}
.upsell h3{color:#E8D5FF;font-size:20px;margin-bottom:12px;}
.upsell p{color:#9B7EBD;font-style:normal;margin-bottom:24px;}
.btn{display:inline-block;background:#7B5EA7;color:white;padding:14px 32px;border-radius:50px;text-decoration:none;font-size:15px;}
.footer{text-align:center;color:#3a2a4e;font-size:12px;}
</style></head>
<body><div class="wrap">
<h1>🐰 Anxiety Translator</h1>
<p class="sub">by MAMARU — Moru has translated your anxiety</p>

<div class="card" style="text-align:center">
  <div class="color-dot"></div>
  <p class="color-name">${colorInfo.emoji} Your healing color today is ${colorInfo.color}</p>
  <p class="root">${analysis.root}</p>
</div>

<div class="card">
  <p class="label">🌙 Poetic healing</p>
  <p>${analysis.poetic}</p>
</div>

<div class="card">
  <p class="label">🧠 What neuroscience says</p>
  <p>${analysis.scientific}</p>
</div>

<div class="card">
  <p class="label">🤍 In silence</p>
  <p>${analysis.silent}</p>
</div>

<div class="num-card">
  <p class="label" style="color:#7a6030;">Today's numerology number</p>
  <p class="num">${todayNum}</p>
  <p class="num-m">${numInfo.meaning}</p>
  <p class="num-msg">${numInfo.message}</p>
</div>

<div class="upsell">
  <h3>✨ Deep Healing Package</h3>
  <p>7-day healing meditation plan, personalized color therapy guide, and extended purification ritual — all crafted just for you.</p>
  <a href="https://anxiety-translator.lemonsqueezy.com/checkout/buy/bd63db8b-d363-4e3f-a56d-25df86133fb5" class="btn">🌸 Get VIP Pass — $19</a>
</div>

<div class="footer">
  <p>Anxiety Translator by MAMARU · @anxiety_translator</p>
</div>
</div></body></html>`;

    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: email,
      subject: `${colorInfo.emoji} Your healing color today is ${colorInfo.color} — Anxiety Translator`,
      html: emailHtml,
    });

    res.json({
      success: true,
      category: analysis.category,
      root: analysis.root,
      color: colorInfo,
      poetic: analysis.poetic,
      scientific: analysis.scientific,
      silent: analysis.silent,
      number: todayNum,
      numberInfo: numInfo,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}
