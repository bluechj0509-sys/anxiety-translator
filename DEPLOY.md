# 불안 번역기 배포 가이드

## 파일 구조
```
/
├── index.html          ← 프론트엔드 (GitHub에 올리기)
├── api/
│   ├── server.js       ← 백엔드 API
│   └── package.json
└── DEPLOY.md
```

## 배포 방법

### 1단계: GitHub에 올리기
1. github.com → New repository → `anxiety-translator`
2. 파일들 업로드 (index.html, api/server.js, api/package.json)

### 2단계: 프론트엔드 - Vercel
1. vercel.com 로그인 → Add New Project
2. GitHub repository 연결
3. Framework: Other
4. Deploy!
5. URL 복사 (예: https://anxiety-translator.vercel.app)

### 3단계: 백엔드 - Railway (무료)
1. railway.app 로그인 (GitHub으로)
2. New Project → Deploy from GitHub
3. 같은 repository 선택
4. Environment Variables 추가:
   - ANTHROPIC_API_KEY = (Claude API 키)
   - RESEND_API_KEY = (Resend API 키)
5. Deploy!
6. URL 복사 (예: https://anxiety-translator.railway.app)

### 4단계: 프론트엔드에 백엔드 URL 연결
index.html에서 이 줄 수정:
```js
const API_URL = 'http://localhost:3001';
```
→
```js
const API_URL = 'https://anxiety-translator.railway.app';
```

### 5단계: 모루 이미지 추가
index.html과 같은 폴더에 `moru.jpg` 파일 추가
(프로젝트의 짐 진 모루 이미지)

## 완료!
- 프론트엔드: https://anxiety-translator.vercel.app
- 결제: 레몬스퀴즈 링크 이미 연결됨 ✅
- 이메일: Resend로 자동 발송 ✅
