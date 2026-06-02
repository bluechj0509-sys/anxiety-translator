import express from 'express';
import cors from 'cors';
import { Resend } from 'resend';
import Anthropic from '@anthropic-ai/sdk';

const app = express();
app.use(cors());
app.use(express.json());

const resend = new Resend(process.env.RESEND_API_KEY);
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const COLOR_MAP = {
  '연애/관계': { color: '핑크', hex: '#E8A0BF', emoji: '🌸', bg: 'pink' },
  '시험/취업': { color: '골드', hex: '#D4A017', emoji: '🌟', bg: 'gold' },
  '돈/생계': { color: '초록', hex: '#4CAF50', emoji: '🌿', bg: 'green' },
  '직장/커리어': { color: '파랑', hex: '#4A90D9', emoji: '💙', bg: 'blue' },
  '무기력/막연': { color: '보라', hex: '#9B59B6', emoji: '🔮', bg: 'purple' },
};

const NUMEROLOGY = {
  1: { meaning: '새로운 시작의 숫자', message: '오늘 당신에게 새로운 문이 열리고 있어요.' },
  2: { meaning: '균형과 조화의 숫자', message: '지금 이 불안은 더 깊은 균형을 찾으라는 신호예요.' },
  3: { meaning: '창조와 표현의 숫자', message: '당신 안의 창조력이 깨어나려 하고 있어요.' },
  4: { meaning: '안정과 기반의 숫자', message: '흔들리는 것처럼 보여도, 당신의 뿌리는 깊어요.' },
  5: { meaning: '변화와 자유의 숫자', message: '이 불안은 변화의 전조예요. 두려워 말아요.' },
  6: { meaning: '사랑과 책임의 숫자', message: '당신이 느끼는 무게는 사랑하는 마음의 증거예요.' },
  7: { meaning: '내면 탐구의 숫자', message: '지금 불안이 성장의 신호임을 우주가 알려주고 있어요.' },
  8: { meaning: '풍요와 성취의 숫자', message: '이 어려움은 더 큰 풍요로 가는 길이에요.' },
  9: { meaning: '완성과 지혜의 숫자', message: '이 사이클이 완성되면 더 지혜로운 당신이 될 거예요.' },
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

app.post('/api/translate', async (req, res) => {
  const { anxiety, email } = req.body;
  if (!anxiety || !email) return res.status(400).json({ error: '입력값 오류' });

  try {
    const completion = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [{
        role: 'user',
        content: `다음 불안 텍스트를 분석해서 JSON으로만 응답해줘. 다른 텍스트 없이 JSON만.

불안 텍스트: "${anxiety}"

응답 형식:
{
  "category": "연애/관계" | "시험/취업" | "돈/생계" | "직장/커리어" | "무기력/막연",
  "root": "버림받을 공포" | "뒤처지는 압박" | "통제 불능 무력감" | "자책" | "이유 모를 막막함",
  "poetic": "시적 톤의 정화 언어 (2-3문장)",
  "scientific": "뇌과학 톤의 정화 언어 (2-3문장)",
  "silent": "침묵/여백 톤의 정화 언어 (1-2문장, 짧게)"
}`
      }]
    });

    const raw = completion.content[0].text.trim();
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    const analysis = JSON.parse(jsonMatch[0]);

    const colorInfo = COLOR_MAP[analysis.category] || COLOR_MAP['무기력/막연'];
    const todayNum = getTodayNumber();
    const numInfo = NUMEROLOGY[todayNum];

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  body { margin: 0; padding: 0; background: #0a0612; font-family: 'Georgia', serif; }
  .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
  .header { text-align: center; margin-bottom: 40px; }
  .header h1 { color: #E8D5FF; font-size: 28px; margin: 0 0 8px; letter-spacing: 2px; }
  .header p { color: #9B7EBD; font-size: 14px; margin: 0; }
  .color-section { background: linear-gradient(135deg, #1a0e2e, #2d1b4e); border: 1px solid #4a2d6e; border-radius: 16px; padding: 32px; margin-bottom: 24px; text-align: center; }
  .color-circle { width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 20px; background: ${colorInfo.hex}; box-shadow: 0 0 40px ${colorInfo.hex}66; }
  .color-title { color: #E8D5FF; font-size: 22px; margin: 0 0 8px; }
  .color-sub { color: #9B7EBD; font-size: 14px; margin: 0; }
  .message-section { background: #12091e; border: 1px solid #2a1a3e; border-radius: 16px; padding: 28px; margin-bottom: 24px; }
  .message-label { color: #7B5EA7; font-size: 11px; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 16px; }
  .message-text { color: #D4C5E8; font-size: 16px; line-height: 1.8; margin: 0; font-style: italic; }
  .number-section { background: linear-gradient(135deg, #1e1a0e, #2e2810); border: 1px solid #4e3d0e; border-radius: 16px; padding: 28px; margin-bottom: 32px; text-align: center; }
  .number-big { color: #D4A017; font-size: 64px; font-weight: bold; margin: 0 0 8px; }
  .number-meaning { color: #A89040; font-size: 14px; margin: 0 0 16px; }
  .number-msg { color: #C4A030; font-size: 15px; line-height: 1.7; margin: 0; font-style: italic; }
  .upsell { background: linear-gradient(135deg, #1a0e2e, #2d1b4e); border: 2px solid #7B5EA7; border-radius: 16px; padding: 32px; text-align: center; margin-bottom: 32px; }
  .upsell h3 { color: #E8D5FF; font-size: 20px; margin: 0 0 12px; }
  .upsell p { color: #9B7EBD; font-size: 14px; line-height: 1.7; margin: 0 0 24px; }
  .btn { display: inline-block; background: linear-gradient(135deg, #7B5EA7, #9B59B6); color: white; padding: 14px 32px; border-radius: 50px; text-decoration: none; font-size: 15px; letter-spacing: 1px; }
  .footer { text-align: center; color: #4a3a5e; font-size: 12px; }
</style>
</head>
<body>
<div class="container">
  <div class="header">
    <h1>🐰 불안 번역기</h1>
    <p>by MAMARU — 모루가 당신의 불안을 번역했어요</p>
  </div>

  <div class="color-section">
    <div class="color-circle"></div>
    <p class="color-title">${colorInfo.emoji} 오늘 당신의 치유 색은 ${colorInfo.color}</p>
    <p class="color-sub">${analysis.root}</p>
  </div>

  <div class="message-section">
    <p class="message-label">🌙 정화의 언어</p>
    <p class="message-text">${analysis.poetic}</p>
  </div>

  <div class="message-section">
    <p class="message-label">🧠 뇌과학이 말하는 것</p>
    <p class="message-text">${analysis.scientific}</p>
  </div>

  <div class="message-section">
    <p class="message-label">🤍 침묵의 언어</p>
    <p class="message-text">${analysis.silent}</p>
  </div>

  <div class="number-section">
    <p style="color:#A89040; font-size:12px; letter-spacing:3px; margin:0 0 12px;">오늘의 수비학 숫자</p>
    <p class="number-big">${todayNum}</p>
    <p class="number-meaning">${numInfo.meaning}</p>
    <p class="number-msg">${numInfo.message}</p>
  </div>

  <div class="upsell">
    <h3>✨ 심층 치유 패키지</h3>
    <p>더 깊은 치유를 원하신다면 — 7일 치유 명상 계획, 맞춤형 색채 치료 가이드, 확장된 정화 의식이 담긴 VIP 패스를 받아보세요.</p>
    <a href="https://anxiety-translator.lemonsqueezy.com/checkout/buy/bd63db8b-d363-4e3f-a56d-25df86133fb5" class="btn">🌸 $19 VIP 패스 받기</a>
  </div>

  <div class="footer">
    <p>불안 번역기 by MAMARU · @anxiety_translator</p>
    <p>이 이메일은 치유의 목적으로 발송되었습니다</p>
  </div>
</div>
</body>
</html>`;

    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: email,
      subject: `${colorInfo.emoji} 오늘 당신의 치유 색은 ${colorInfo.color}이에요 — 불안 번역기`,
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
    res.status(500).json({ error: '서버 오류가 발생했어요' });
  }
});

app.listen(3001, () => console.log('Server running on port 3001'));
