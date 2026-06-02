import { Resend } from 'resend';

const HEALING_DATA = {
  '연애/관계': {
    color: { name: 'Pink', hex: '#E8A0BF', emoji: '🌸' },
    messages: [
      {
        poetic: "The words you sent float in the air, unread. But that silence is not your fault. You are simply someone who loves too vividly.",
        scientific: "Anxiety isn't a sign of weakness — it's your brain's threat response protecting a relationship you care about. Your racing heart means you're genuinely invested.",
        silent: "It hasn't been answered yet.\nYou are enough."
      },
      {
        poetic: "A rose only learns how deeply it was loved after the one who watered it has gone. The silence of 30 minutes is not an ending — your words are still blooming in someone's heart.",
        scientific: "The fear of being left is one of the most primal human fears. What you feel right now is not weakness. It is proof that you have the courage to love.",
        silent: "They haven't replied yet.\nThat's all it is."
      }
    ]
  },
  '시험/취업': {
    color: { name: 'Gold', hex: '#D4A017', emoji: '🌟' },
    messages: [
      {
        poetic: "When the study room lights go out, the stars shine just as bright. You, who stayed lit when no one was watching — you are the one who will shine longest.",
        scientific: "Comparison is a survival instinct. Your brain is wired to feel threatened when it senses you're falling behind. But that circuit is misfiring in today's world. Your timeline is your own.",
        silent: "You sat down today.\nThat is enough."
      },
      {
        poetic: "The one who crosses the desert keeps walking even when they can't see the oasis. You are not falling behind. You are on a path no one else has walked.",
        scientific: "The brain amplifies threat signals when we're exhausted. The fear you feel tonight is louder than reality. Rest is not giving up — it is strategy.",
        silent: "One more day.\nYou showed up."
      }
    ]
  },
  '돈/생계': {
    color: { name: 'Green', hex: '#4CAF50', emoji: '🌿' },
    messages: [
      {
        poetic: "The 3am balance is not your whole story. The one who opens their eyes in that hour has not given up. The numbers may shrink, but what you carry has not yet been counted.",
        scientific: "Early morning waking is when cortisol peaks. The fear you feel right now is amplified by biology, not reality. Close the numbers. In this moment, you are safe.",
        silent: "Numbers are not everything.\nYou are still breathing."
      },
      {
        poetic: "The Little Prince lived on a very small planet. But the smallness of his star never made his rose less precious. A small balance does not make your life less worthy.",
        scientific: "Financial anxiety triggers the same brain response as physical danger. Your nervous system is doing its job. But you are not in danger right now. You are just awake.",
        silent: "This moment will pass.\nYou are okay right now."
      }
    ]
  },
  '직장/커리어': {
    color: { name: 'Blue', hex: '#4A90D9', emoji: '💙' },
    messages: [
      {
        poetic: "You are not wearing a mask. Someone who shows up every day, feeling like they might fall apart — they are already one of the most resilient people alive. The courage no one sees is the most real courage.",
        scientific: "Impostor syndrome is most common in people who are genuinely capable. Those who lack ability don't feel it — they don't know their limits. Your fear is proof of how seriously you take this.",
        silent: "There is nothing to expose.\nYou are already doing it."
      },
      {
        poetic: "The tree in the forest doesn't know how deep its roots go. It simply stands each day. You are like that. You stood again today.",
        scientific: "The brain's threat detection works overtime in high-stakes environments. What feels like being found out is actually your brain preparing you to perform. You are ready.",
        silent: "You showed up today.\nThat is real."
      }
    ]
  },
  '무기력/막연': {
    color: { name: 'Purple', hex: '#9B59B6', emoji: '🔮' },
    messages: [
      {
        poetic: "There are nights when the heart grows heavy for no reason. It is not because you are weak — it is because you lived today with your whole body. Tomorrow morning will come. And you will live through it again.",
        scientific: "Sunday night anxiety is one of the most universal emotional patterns in the world. Your brain is scanning ahead for threats before Monday arrives. This is not your problem. It is a human survival circuit. You are not alone.",
        silent: "No reason needed.\nJust be here tonight."
      },
      {
        poetic: "Even the desert has its night. And that is when the most stars appear. The nights when you collapse for no reason — those are the hours you are preparing to meet tomorrow.",
        scientific: "Vague dread without a clear cause is often your nervous system processing accumulated stress. Nothing is wrong with you. Your body is doing maintenance. Rest is the answer.",
        silent: "You don't need to understand it.\nJust rest."
      }
    ]
  }
};

const KEYWORDS = {
  '연애/관계': ['카톡', '답장', '읽씹', '연애', '남친', '여친', '좋아', '사랑', '관계', '문자', '연락', '헤어', 'message', 'text', 'love', 'relationship', 'reply', 'ignored'],
  '시험/취업': ['시험', '취업', '공부', '독서실', '성적', '취준', '면접', '합격', '불합격', '점수', 'exam', 'study', 'job', 'career', 'test', 'interview', 'score'],
  '돈/생계': ['돈', '빚', '잔고', '월급', '생활비', '카드', '대출', '경제', '알바', 'money', 'debt', 'salary', 'bill', 'bank', 'broke', 'loan', 'finance'],
  '직장/커리어': ['직장', '회사', '상사', '업무', '야근', '가면', '무능', '커리어', '승진', '퇴사', 'work', 'boss', 'office', 'job', 'career', 'fired', 'promotion', 'impostor'],
  '무기력/막연': ['무기력', '막막', '답답', '모르겠', '왜', '이유', '일요일', '우울', '피곤', 'tired', 'hopeless', 'lost', 'empty', 'why', 'meaningless', 'exhausted']
};

function detectCategory(text) {
  const lower = text.toLowerCase();
  let maxScore = 0;
  let detected = '무기력/막연';
  for (const [category, keywords] of Object.entries(KEYWORDS)) {
    const score = keywords.filter(k => lower.includes(k)).length;
    if (score > maxScore) { maxScore = score; detected = category; }
  }
  return detected;
}

function getTodayNumber() {
  const today = new Date();
  const dateStr = `${today.getFullYear()}${today.getMonth() + 1}${today.getDate()}`;
  let sum = dateStr.split('').reduce((a, b) => a + parseInt(b), 0);
  while (sum > 9) sum = String(sum).split('').reduce((a, b) => a + parseInt(b), 0);
  return sum || 9;
}

const NUMEROLOGY = {
  1: { meaning: 'Number of new beginnings', message: 'A new door is opening for you today.' },
  2: { meaning: 'Number of balance & harmony', message: 'This anxiety is a signal to find deeper balance.' },
  3: { meaning: 'Number of creativity & expression', message: 'The creative force within you is awakening.' },
  4: { meaning: 'Number of stability & foundation', message: 'Though shaken, your roots run deep.' },
  5: { meaning: 'Number of change & freedom', message: 'This anxiety is the prelude to transformation.' },
  6: { meaning: 'Number of love & responsibility', message: 'The weight you carry is proof of how deeply you care.' },
  7: { meaning: 'Number of inner exploration', message: 'The universe is telling you this anxiety is a signal of growth.' },
  8: { meaning: 'Number of abundance & achievement', message: 'This difficulty is the path to greater abundance.' },
  9: { meaning: 'Number of completion & wisdom', message: 'When this cycle completes, you will emerge wiser.' },
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
    const resend = new Resend(process.env.RESEND_API_KEY);
    const category = detectCategory(anxiety);
    const data = HEALING_DATA[category];
    const msgSet = data.messages[Math.floor(Math.random() * data.messages.length)];
    const colorInfo = data.color;
    const todayNum = getTodayNumber();
    const numInfo = NUMEROLOGY[todayNum];

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
  <p class="color-name">${colorInfo.emoji} Your healing color today is ${colorInfo.name}</p>
</div>
<div class="card"><span class="label">🌙 Poetic healing</span><p>${msgSet.poetic}</p></div>
<div class="card"><span class="label">🧠 What neuroscience says</span><p>${msgSet.scientific}</p></div>
<div class="card"><span class="label">🤍 In silence</span><p>${msgSet.silent}</p></div>
<div class="num-card">
  <span class="label" style="color:#7a6030;">Today's numerology number</span>
  <p class="num">${todayNum}</p>
  <p class="num-m">${numInfo.meaning}</p>
  <p class="num-msg">${numInfo.message}</p>
</div>
<div class="upsell">
  <h3>✨ Deep Healing Package</h3>
  <p>7-day healing meditation plan, personalized color therapy guide, and extended purification ritual — all crafted just for you.</p>
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

    res.json({
      success: true,
      category,
      color: colorInfo,
      poetic: msgSet.poetic,
      scientific: msgSet.scientific,
      silent: msgSet.silent,
      number: todayNum,
      numberInfo: numInfo,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}
