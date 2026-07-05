# 고용노동부 전국 직장협의회 웹사이트

React + Vite로 제작된 직장협의회 공식 웹사이트입니다.

## 📁 파일 구조

```
workplace-council/
├── index.html
├── package.json
├── vite.config.js
├── src/
│   ├── main.jsx          # 진입점
│   ├── App.jsx           # 네비게이션 & 레이아웃
│   ├── index.css         # 전체 스타일
│   └── pages/
│       ├── PageAbout.jsx    # 1페이지: 직장협의회란?
│       ├── PageJoin.jsx     # 2페이지: 가입 안내 & 조직
│       ├── PageBenefits.jsx # 3페이지: 회원 혜택
│       └── PageSignup.jsx   # 4페이지: 가입 신청
└── .github/
    └── workflows/
        └── deploy.yml    # GitHub Pages 자동 배포
```

## 🚀 로컬 개발

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:5173` 접속

## 📦 빌드

```bash
npm run build
```

## ☁️ GitHub Pages 배포

1. GitHub에 이 저장소를 push합니다.
2. **Settings → Pages → Source**: `GitHub Actions` 선택
3. `main` 브랜치에 push하면 자동으로 빌드 & 배포됩니다.
4. 배포 주소: `https://<계정명>.github.io/<저장소명>/`

> ⚠️ 저장소명이 `<계정>.github.io`가 아닌 경우, `vite.config.js`에 `base` 옵션을 추가하세요:
> ```js
> export default defineConfig({ base: "/<저장소명>/", plugins: [react()] });
> ```

## ✏️ 내용 수정 방법

| 파일 | 수정 내용 |
|------|-----------|
| `PageJoin.jsx` 상단 `EXECUTIVES` | 전국 운영진 명단 |
| `PageJoin.jsx` 상단 `BRANCHES` | 지청별 회장 명단 |
| `PageBenefits.jsx` 상단 `BENEFIT_GROUPS` | 회원 혜택 목록 |
| `PageSignup.jsx` 상단 `DEPARTMENTS` | 부서 선택 목록 |
| `App.jsx` 푸터 | 연락처·이메일 |

## 📬 가입 신청 연동

현재 `PageSignup.jsx`의 `handleSubmit` 함수는 콘솔 출력만 합니다.  
실제 운영 시 아래 중 하나로 교체하세요:

- **이메일 전송**: EmailJS (https://emailjs.com) 무료 사용 가능
- **구글 스프레드시트**: Google Forms 연동 또는 Apps Script API
- **백엔드 API**: fetch로 POST 요청

```js
// EmailJS 예시 (handleSubmit 내부)
await emailjs.send("SERVICE_ID", "TEMPLATE_ID", form, "PUBLIC_KEY");
```
