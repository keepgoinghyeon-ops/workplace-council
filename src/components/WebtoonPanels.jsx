/* 웹툰 스타일 만화 패널 — 1·2화 */

function ComicBubble({ name, text, style, tail = "bottom", thought = false }) {
  return (
    <div
      className={`comic-bubble comic-bubble--${tail}${thought ? " comic-bubble--thought" : ""}`}
      style={style}
    >
      {name && <span className="comic-bubble-name">{name}</span>}
      <p>{text}</p>
    </div>
  );
}

function ComicNarration({ text }) {
  return <div className="comic-narration">{text}</div>;
}
function ComicSfx({ text, style }) {
  return <div className="comic-sfx" style={style}>{text}</div>;
}

function ComicEmotion({ text, style }) {
  return <div className="comic-emotion" style={style}>{text}</div>;
}

function ComicSticker({ emoji, style }) {
  return <div className="comic-sticker" style={style}>{emoji}</div>;
}

/* ── 캐릭터 SVG (웹툰 스타일) ── */
function WebtoonEye({ cx, cy, mood, iris = "#3e3232" }) {
  if (mood === "happy") {
    return (
      <g>
        <ellipse cx={cx} cy={cy} rx="10" ry="11" fill="#fff" stroke="#1a1a1a" strokeWidth="2" />
        <circle cx={cx} cy={cy + 2} r="5" fill={iris} />
        <circle cx={cx + 2.5} cy={cy - 1} r="2" fill="#fff" />
        <circle cx={cx - 2} cy={cy + 4} r="1.2" fill="#fff" opacity="0.7" />
        <path d={`M${cx - 12} ${cy - 14} Q${cx} ${cy - 20} ${cx + 12} ${cy - 14}`} stroke="#3e3232" strokeWidth="2" fill="none" strokeLinecap="round" />
      </g>
    );
  }
  if (mood === "tired") {
    return (
      <g>
        <ellipse cx={cx} cy={cy} rx="10" ry="9" fill="#fff" stroke="#1a1a1a" strokeWidth="2" />
        <path d={`M${cx - 10} ${cy - 5} Q${cx} ${cy - 10} ${cx + 10} ${cy - 5}`} stroke="#1a1a1a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <circle cx={cx} cy={cy + 2} r="3.5" fill={iris} opacity="0.85" />
        <circle cx={cx + 2} cy={cy} r="1.2" fill="#fff" />
      </g>
    );
  }
  if (mood === "shocked") {
    return (
      <g>
        <ellipse cx={cx} cy={cy} rx="11" ry="13" fill="#fff" stroke="#1a1a1a" strokeWidth="2" />
        <circle cx={cx} cy={cy + 2} r="5" fill={iris} />
        <circle cx={cx + 2.5} cy={cy - 1} r="2.2" fill="#fff" />
        <circle cx={cx - 2} cy={cy + 5} r="1" fill="#fff" opacity="0.6" />
      </g>
    );
  }
  if (mood === "love") {
    return (
      <g>
        <ellipse cx={cx} cy={cy} rx="10" ry="12" fill="#fff" stroke="#1a1a1a" strokeWidth="2" />
        <circle cx={cx} cy={cy + 2} r="4.5" fill="#6b3fa0" />
        <circle cx={cx + 2} cy={cy - 1} r="2" fill="#fff" />
        <text x={cx - 5} y={cy - 16} fontSize="10">✨</text>
      </g>
    );
  }
  return (
    <g>
      <ellipse cx={cx} cy={cy} rx="10" ry="12" fill="#fff" stroke="#1a1a1a" strokeWidth="2" />
      <circle cx={cx} cy={cy + 2} r="4.5" fill={iris} />
      <circle cx={cx + 2.5} cy={cy - 1} r="2" fill="#fff" />
      <circle cx={cx - 2} cy={cy + 4} r="1.2" fill="#fff" opacity="0.6" />
    </g>
  );
}

function Face({ cx, cy, mood = "neutral", gender = "m" }) {
  const eyeL = cx - 14;
  const eyeR = cx + 14;
  const eyeY = cy - 2;
  const iris = gender === "f" ? "#4a3060" : "#2d4a7a";

  const mouths = {
    tired: <path d={`M${cx - 8} ${cy + 18} Q${cx} ${cy + 14} ${cx + 8} ${cy + 18}`} stroke="#c17f5a" strokeWidth="2" fill="none" strokeLinecap="round" />,
    happy: <path d={`M${cx - 10} ${cy + 16} Q${cx} ${cy + 26} ${cx + 10} ${cy + 16}`} stroke="#c17f5a" strokeWidth="2.5" fill="none" strokeLinecap="round" />,
    shocked: <ellipse cx={cx} cy={cy + 20} rx="7" ry="9" fill="#3e3232" />,
    love: <path d={`M${cx - 9} ${cy + 17} Q${cx} ${cy + 24} ${cx + 9} ${cy + 17}`} stroke="#e85d75" strokeWidth="2.5" fill="none" strokeLinecap="round" />,
    neutral: <path d={`M${cx - 7} ${cy + 18} Q${cx} ${cy + 22} ${cx + 7} ${cy + 18}`} stroke="#c17f5a" strokeWidth="2" fill="none" strokeLinecap="round" />,
  };

  const blush = (mood === "love" || mood === "happy") ? (
    <>
      <ellipse cx={cx - 22} cy={cy + 10} rx="8" ry="5" fill="#ffb3ba" opacity="0.45" />
      <ellipse cx={cx + 22} cy={cy + 10} rx="8" ry="5" fill="#ffb3ba" opacity="0.45" />
    </>
  ) : null;

  const hairTop = gender === "f"
    ? <path d={`M${cx - 32} ${cy - 8} Q${cx} ${cy - 42} ${cx + 32} ${cy - 8} Q${cx + 28} ${cy + 5} ${cx} ${cy - 2} Q${cx - 28} ${cy + 5} ${cx - 32} ${cy - 8}`} fill="#2c1810" />
    : <path d={`M${cx - 30} ${cy - 5} Q${cx} ${cy - 38} ${cx + 30} ${cy - 5} L${cx + 28} ${cy + 8} L${cx - 28} ${cy + 8} Z`} fill="#1a1a2e" />;

  const hairSide = gender === "f" ? (
    <>
      <path d={`M${cx - 32} ${cy - 5} Q${cx - 38} ${cy + 30} ${cx - 28} ${cy + 35} L${cx - 24} ${cy + 5} Z`} fill="#2c1810" />
      <path d={`M${cx + 32} ${cy - 5} Q${cx + 38} ${cy + 30} ${cx + 28} ${cy + 35} L${cx + 24} ${cy + 5} Z`} fill="#2c1810" />
    </>
  ) : null;

  return (
    <g>
      {hairSide}
      <ellipse cx={cx} cy={cy + 8} rx="32" ry="34" fill="#fde8d8" stroke="#1a1a1a" strokeWidth="2" />
      {hairTop}
      <WebtoonEye cx={eyeL} cy={eyeY} mood={mood} iris={iris} />
      <WebtoonEye cx={eyeR} cy={eyeY} mood={mood} iris={iris} />
      {mouths[mood] || mouths.neutral}
      {blush}
    </g>
  );
}

function Body({ cx, cy, color = "#3d5a80", tie = true }) {
  return (
    <g>
      <path d={`M${cx - 38} ${cy} L${cx - 45} ${cy + 90} L${cx + 45} ${cy + 90} L${cx + 38} ${cy} Z`} fill={color} stroke="#1a1a1a" strokeWidth="2" />
      <path d={`M${cx - 38} ${cy} Q${cx} ${cy + 18} ${cx + 38} ${cy} Z`} fill="#fff" stroke="#1a1a1a" strokeWidth="1.5" />
      {tie && <path d={`M${cx} ${cy + 4} L${cx - 6} ${cy + 35} L${cx} ${cy + 30} L${cx + 6} ${cy + 35} Z`} fill="#c17f5a" stroke="#1a1a1a" strokeWidth="1" />}
    </g>
  );
}

function Character({ x, y, mood, suit, gender = "m", scale = 1, flip = false }) {
  const cx = 0;
  const cy = -20;
  return (
    <g transform={`translate(${x},${y}) scale(${flip ? -scale : scale},${scale})`}>
      <Body cx={cx} cy={cy + 30} color={suit} tie={gender === "m"} />
      <Face cx={cx} cy={cy} mood={mood} gender={gender} />
    </g>
  );
}

function ComicFrame({ children, className = "" }) {
  return <div className={`comic-frame ${className}`}>{children}</div>;
}

/* ═══════════════════════════════════════
   1화 패널
═══════════════════════════════════════ */

export function Ep1Panel1() {
  return (
    <ComicFrame className="comic-frame--night">
      <svg className="comic-bg" viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice">
        <rect width="400" height="500" fill="#1a1a2e" />
        <rect x="280" y="40" width="100" height="120" fill="#0f2744" stroke="#2a4a7a" strokeWidth="2" rx="4" />
        <circle cx="300" cy="70" r="3" fill="#ffe66d" /><circle cx="330" cy="90" r="2" fill="#ffe66d" /><circle cx="350" cy="60" r="2.5" fill="#ffe66d" />
        <rect x="60" y="320" width="280" height="14" fill="#5a4030" rx="3" />
        <rect x="140" y="260" width="120" height="70" fill="#16213e" stroke="#2a4a7a" strokeWidth="2" rx="6" />
        <rect x="148" y="268" width="104" height="54" fill="#0d3b6e" rx="3" />
        <rect x="155" y="278" width="60" height="3" fill="#4ecdc4" rx="1" opacity="0.7" />
        <rect x="155" y="286" width="80" height="2" fill="#6b7280" rx="1" />
        <rect x="155" y="294" width="70" height="2" fill="#6b7280" rx="1" />
        <text x="310" y="100" fill="#888" fontSize="14" fontFamily="monospace">22:47</text>
        <Character x={200} y={310} mood="tired" suit="#3d5a80" />
        <text x="340" y="200" fontSize="40" opacity="0.6">💧</text>
      </svg>
      <ComicNarration text="시계는 밤 10시 47분… 커피만 세 번째 리필" />
      <ComicSticker emoji="☕×3" style={{ top: "42%", right: "6%" }} />
      <ComicBubble name="박감독관" text="히잉… 또 야근이야. 혼자 끙끙대기엔 이제 지쳤어. 누군가 내 말을 들어줄 곳은 없을까…?" thought style={{ top: "6%", left: "4%", maxWidth: "60%" }} />
      <ComicEmotion text="작은 목소리도, 혼자가 아니면 힘이 됩니다" />
    </ComicFrame>
  );
}

export function Ep1Panel2() {
  return (
    <ComicFrame className="comic-frame--office">
      <svg className="comic-bg" viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice">
        <rect width="400" height="500" fill="#f8f4ef" />
        <rect x="0" y="380" width="400" height="120" fill="#ebe4db" />
        <rect x="30" y="60" width="160" height="100" fill="#fff" stroke="#ddd" strokeWidth="1.5" rx="4" opacity="0.5" />
        <Character x={120} y={340} mood="happy" suit="#c17f5a" />
        <Character x={290} y={340} mood="neutral" suit="#3d5a80" scale={0.95} />
        <rect x="175" y="280" width="55" height="72" fill="#fff" stroke="#c17f5a" strokeWidth="2" rx="4" transform="rotate(-8 200 316)" />
        <text x="183" y="302" fontSize="8" fill="#c17f5a" fontWeight="bold">직협</text>
        <rect x="180" y="308" width="40" height="2" fill="#ccc" /><rect x="180" y="314" width="35" height="2" fill="#ccc" />
        <rect x="180" y="320" width="38" height="2" fill="#ccc" />
      </svg>
      <ComicNarration text="다음 날 아침, 옆자리 선배가 몰래 다가온다" />
      <ComicSticker emoji="🤫" style={{ top: "50%", left: "8%" }} />
      <ComicBubble name="선배 김감독관" text="박감독관~ 혼자 삼키지 마! 직협에 건의하면 우리 목소리가 공식으로 올라가. 나도 예전에 이렇게 바꿨어 😊" tail="right" style={{ top: "10%", left: "4%", maxWidth: "54%" }} />
      <ComicBubble name="박감독관" text="직협…요? 그거 먹는 거 아니었어요?! (진지) 처음 들어봐요!" tail="left" style={{ top: "36%", right: "4%", maxWidth: "48%" }} />
    </ComicFrame>
  );
}

export function Ep1Panel3() {
  return (
    <ComicFrame className="comic-frame--bright">
      <svg className="comic-bg" viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice">
        <rect width="400" height="500" fill="#f0fff4" />
        <rect x="80" y="180" width="240" height="200" fill="#fff" stroke="#3e3232" strokeWidth="2.5" rx="8" />
        <rect x="80" y="180" width="240" height="40" fill="#3e3232" rx="8 8 0 0" />
        <text x="130" y="206" fill="#fff" fontSize="14" fontWeight="bold" fontFamily="Noto Sans KR">직협 고충 접수 창구</text>
        <rect x="100" y="240" width="200" height="120" fill="#f5f0ea" rx="4" />
        <Character x={130} y={360} mood="happy" suit="#3d5a80" scale={0.9} />
        <rect x="155" y="300" width="70" height="90" fill="#fff" stroke="#c17f5a" strokeWidth="2" rx="3" transform="rotate(5 190 345)" />
        <text x="165" y="325" fontSize="9" fill="#c17f5a" fontWeight="bold">건의서</text>
        <text x="280" y="120" fontSize="48">✅</text>
      </svg>
      <ComicNarration text="손 떨리는 마음으로, 첫 건의서를 낸 날" />
      <ComicBubble name="박감독관" text="팀 전체가 힘들어요… 제 목소리가, 우리 모두의 목소리가 되길 바랍니다!" tail="bottom" style={{ top: "7%", left: "6%", maxWidth: "58%" }} />
      <ComicSfx text="뾰로롱~✨" style={{ bottom: "20%", right: "6%" }} />
      <ComicEmotion text="용기 낸 한 장의 건의서가, 변화의 시작이 됩니다" />
    </ComicFrame>
  );
}

export function Ep1Panel4() {
  return (
    <ComicFrame className="comic-frame--meeting">
      <svg className="comic-bg" viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice">
        <rect width="400" height="500" fill="#faf8f5" />
        <ellipse cx="200" cy="380" rx="170" ry="50" fill="#a07848" />
        <ellipse cx="200" cy="375" rx="170" ry="50" fill="#c49a6c" />
        <Character x={200} y={280} mood="neutral" suit="#3e3232" />
        <Character x={80} y={310} mood="neutral" suit="#3d5a80" scale={0.8} />
        <Character x={320} y={310} mood="neutral" suit="#4a6030" scale={0.8} flip />
        <rect x="20" y="80" width="110" height="80" fill="#fff" stroke="#ddd" strokeWidth="1.5" rx="6" />
        <text x="30" y="105" fontSize="9" fill="#3e3232" fontWeight="bold">업무분장 개선안</text>
        <rect x="30" y="115" width="70" height="3" fill="#ccc" rx="1" /><rect x="30" y="123" width="80" height="3" fill="#ccc" rx="1" />
      </svg>
      <ComicNarration text="노사협의회, 직협 대표가 떨리는 목소리로 말한다" />
      <ComicBubble name="직협 대표" text="현장에서 올라온 이 목소리, 무시할 수 없습니다. 박감독관님 건의와 함께한 동료들의 사연도 모두 전달하겠습니다." tail="bottom" style={{ top: "4%", left: "50%", transform: "translateX(-50%)", maxWidth: "74%" }} />
      <ComicEmotion text="한 사람의 이야기가, 모두의 이야기가 되는 순간" />
    </ComicFrame>
  );
}

export function Ep1Panel5() {
  return (
    <ComicFrame className="comic-frame--announce">
      <svg className="comic-bg" viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="announceBg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fff8f0" /><stop offset="100%" stopColor="#ffe8d0" />
          </linearGradient>
        </defs>
        <rect width="400" height="500" fill="url(#announceBg)" />
        <rect x="120" y="300" width="160" height="120" fill="#8b6542" rx="4" />
        <Character x={200} y={260} mood="happy" suit="#4a3060" />
        <text x="300" y="100" fontSize="36">🎉</text>
        <text x="60" y="420" fontSize="24">👏</text>
        <text x="320" y="420" fontSize="24">👏</text>
        <rect x="30" y="60" width="140" height="90" fill="#3e3232" rx="6" />
        <text x="45" y="90" fill="#4ecdc4" fontSize="11" fontWeight="bold">제도 개선 발표</text>
        <rect x="45" y="100" width="80" height="3" fill="#666" rx="1" />
        <rect x="45" y="110" width="100" height="3" fill="#c17f5a" rx="1" />
      </svg>
      <ComicBubble name="인사담당 과장" text="직원 여러분 의견을 반영합니다! 업무 분장 재조정, 초과근무 보상도 개선! (박수 요망)" tail="bottom" style={{ top: "5%", left: "6%", maxWidth: "66%" }} />
      <ComicSfx text="와아아~👏" style={{ bottom: "24%", left: "8%" }} />
      <ComicSticker emoji="🎊" style={{ top: "18%", right: "10%" }} />
    </ComicFrame>
  );
}

export function Ep1Panel6() {
  return (
    <ComicFrame className="comic-frame--sunset">
      <svg className="comic-bg" viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="sunsetBg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ff9a5c" /><stop offset="60%" stopColor="#ffc17a" /><stop offset="100%" stopColor="#ffe4b5" />
          </linearGradient>
        </defs>
        <rect width="400" height="500" fill="url(#sunsetBg)" />
        <circle cx="320" cy="120" r="50" fill="#ffdd44" opacity="0.85" />
        <rect x="0" y="350" width="80" height="150" fill="#3e3232" opacity="0.35" />
        <rect x="300" y="330" width="100" height="170" fill="#3e3232" opacity="0.35" />
        <rect x="150" y="320" width="100" height="180" fill="#2a1a0e" />
        <rect x="168" y="340" width="30" height="50" fill="#1a0e06" rx="2" />
        <Character x={240} y={340} mood="happy" suit="#3e3232" scale={0.95} />
        <text x="260" y="280" fontSize="28">🌅</text>
      </svg>
      <ComicNarration text="그해 첫 칼퇴근, 노을이 유난히 예쁜 날" />
      <ComicBubble name="박감독관" text="혼자 참았던 게 아니었어… 직협이 내 옆에 있었구나. 나도 이제 후배들한테 이 길 알려줄 거야!" tail="left" style={{ top: "9%", left: "5%", maxWidth: "60%" }} />
      <ComicSfx text="뿌듯…🌅" style={{ bottom: "28%", right: "10%", fontSize: "22px", color: "#ff8c42" }} />
      <div className="comic-end-line">✦ 1화 끝 — 작은 용기가 만든 기적 ✦</div>
    </ComicFrame>
  );
}

/* ═══════════════════════════════════════
   2화 패널
═══════════════════════════════════════ */

export function Ep2Panel1() {
  return (
    <ComicFrame className="comic-frame--shock">
      <svg className="comic-bg" viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice">
        <rect width="400" height="500" fill="#fff5f5" />
        <rect x="200" y="140" width="170" height="220" fill="#fff" stroke="#dc2626" strokeWidth="3" rx="6" />
        <polygon points="200,140 285,220 370,140" fill="#fee2e2" stroke="#dc2626" strokeWidth="2" />
        <rect x="215" y="200" width="140" height="40" fill="#fee2e2" rx="4" />
        <text x="230" y="225" fontSize="16" fill="#dc2626" fontWeight="bold">소 장</text>
        <rect x="300" y="155" width="50" height="50" fill="none" stroke="#dc2626" strokeWidth="2.5" rx="4" />
        <text x="308" y="185" fontSize="9" fill="#dc2626">법원</text>
        <Character x={110} y={340} mood="shocked" suit="#3d5a80" gender="f" />
        <line x1="160" y1="180" x2="190" y2="160" stroke="#dc2626" strokeWidth="3" opacity="0.5" />
        <line x1="155" y1="200" x2="185" y2="185" stroke="#dc2626" strokeWidth="3" opacity="0.5" />
      </svg>
      <ComicNarration text="봉투를 뜯자마자 심장이 쿵!" />
      <ComicBubble name="이감독관" text="에엣?! 소송이라니…! 제대로 일했는데, 왜 나 혼자 이걸…" tail="right" style={{ top: "7%", left: "4%", maxWidth: "52%" }} />
      <ComicSfx text="데헷?!" style={{ top: "34%", right: "5%" }} />
      <ComicEmotion text="막막할 때, 곁에 서 줄 사람이 필요합니다" />
    </ComicFrame>
  );
}

export function Ep2Panel2() {
  return (
    <ComicFrame className="comic-frame--phone">
      <svg className="comic-bg" viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice">
        <rect width="400" height="500" fill="#f0f8ff" />
        <rect x="0" y="0" width="200" height="500" fill="#e8f4ff" />
        <rect x="200" y="0" width="200" height="500" fill="#fff5f0" />
        <line x1="200" y1="0" x2="200" y2="500" stroke="#ccc" strokeWidth="3" strokeDasharray="8 4" />
        <Character x={100} y={340} mood="neutral" suit="#3d5a80" gender="f" scale={0.9} />
        <Character x={300} y={340} mood="happy" suit="#c17f5a" scale={0.9} flip />
        <rect x="130" y="290" width="28" height="48" fill="#1a1a2e" rx="5" />
        <rect x="242" y="290" width="28" height="48" fill="#1a1a2e" rx="5" />
        <text x="175" y="280" fontSize="32">📞</text>
      </svg>
      <ComicSticker emoji="📞💦" style={{ top: "42%", left: "42%" }} />
      <ComicBubble name="이감독관" text="선생님… 제가 잘못한 건 아닌데 소송을 당했어요. 솔직히 무서워요… 흑" tail="right" style={{ top: "7%", left: "3%", maxWidth: "46%" }} />
      <ComicBubble name="직협 담당자" text="이감독관님, 울지 마세요! 직무수행 소송은 직협이 끝까지 함께합니다. 혼자 싸우지 않으셔도 돼요 🤝" tail="left" style={{ top: "7%", right: "3%", maxWidth: "46%" }} />
      <ComicEmotion text="「혼자가 아니야」— 그 한마디가 가장 큰 위로가 됩니다" />
    </ComicFrame>
  );
}

export function Ep2Panel3() {
  return (
    <ComicFrame className="comic-frame--court">
      <svg className="comic-bg" viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice">
        <rect width="400" height="500" fill="#f5f0ff" />
        <rect x="50" y="80" width="300" height="60" fill="#3e3232" rx="4" />
        <text x="130" y="118" fill="#fff" fontSize="16" fontWeight="bold">⚖️ 직협 소송 지원</text>
        <Character x={200} y={300} mood="happy" suit="#3d5a80" gender="f" />
        <rect x="80" y="380" width="240" height="60" fill="#e8f5e9" stroke="#4caf50" strokeWidth="2" rx="8" />
        <text x="110" y="415" fontSize="13" fill="#2e7d32" fontWeight="bold">소송비용 지원 완료 ✓</text>
        <text x="300" y="200" fontSize="40">⚖️</text>
      </svg>
      <ComicNarration text="직협의 지원으로, 긴 싸움 끝에…" />
      <ComicBubble name="직협 소송지원" text="정당한 직무수행이었습니다. 소송비용도 지원 완료! 이감독관님, 고생 많으셨어요." tail="bottom" style={{ top: "5%", left: "7%", maxWidth: "66%" }} />
      <ComicBubble name="이감독관" text="직협이 없었으면… 정말 무너졌을 거예요. 고마워요… (눈물글글)" tail="bottom" style={{ top: "28%", left: "8%", maxWidth: "58%" }} />
      <ComicSfx text="훌쩍…😭→😊" style={{ bottom: "22%", right: "8%", fontSize: "20px" }} />
    </ComicFrame>
  );
}

export function Ep2Panel4() {
  return (
    <ComicFrame className="comic-frame--romance">
      <svg className="comic-bg" viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice">
        <rect width="400" height="500" fill="#fff8fc" />
        <rect x="0" y="350" width="400" height="150" fill="#f5eef5" />
        <Character x={140} y={340} mood="love" suit="#4a6fa5" gender="f" />
        <Character x={270} y={340} mood="love" suit="#3e3232" flip />
        <text x="185" y="280" fontSize="32">💕</text>
        <rect x="60" y="80" width="120" height="60" fill="#fff" stroke="#ddd" rx="4" opacity="0.6" />
      </svg>
      <ComicNarration text="같은 부서로 온 최감독관… 어색한 인사가 시작된다" />
      <ComicSticker emoji="💓" style={{ top: "48%", left: "44%" }} />
      <ComicBubble name="이감독관" text="어… 최감독관님! 직협 회원이셨군요? (속마음: 왠지 든든하고… 좋다?)" tail="right" style={{ top: "9%", left: "5%", maxWidth: "56%" }} />
      <ComicBubble name="최감독관" text="네! 저도요! (쑥스) …같이 일하면 좋겠습니다. 직협 덕에 만난 인연이니까요." tail="left" style={{ top: "30%", right: "5%", maxWidth: "50%" }} />
      <ComicSfx text="두근💕" style={{ top: "55%", right: "12%", color: "#e85d75" }} />
    </ComicFrame>
  );
}

export function Ep2Panel5() {
  return (
    <ComicFrame className="comic-frame--wedding">
      <svg className="comic-bg" viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="wedBg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fff0f8" /><stop offset="100%" stopColor="#fff9f5" />
          </linearGradient>
        </defs>
        <rect width="400" height="500" fill="url(#wedBg)" />
        <text x="30" y="60" fontSize="28">🌸</text>
        <text x="330" y="60" fontSize="28">🌸</text>
        <g transform="translate(130, 280)">
          <ellipse cx="0" cy="-20" rx="28" ry="26" fill="#fde8d8" stroke="#1a1a1a" strokeWidth="2" />
          <path d="M-28 -20 Q0 -55 28 -20 L28 0 Q0 10 -28 0 Z" fill="#2c1810" />
          <ellipse cx="-9" cy="-18" rx="6" ry="7" fill="#fff" stroke="#1a1a1a" strokeWidth="1.5" />
          <ellipse cx="9" cy="-18" rx="6" ry="7" fill="#fff" stroke="#1a1a1a" strokeWidth="1.5" />
          <circle cx="-9" cy="-16" r="3" fill="#6b3fa0" /><circle cx="9" cy="-16" r="3" fill="#6b3fa0" />
          <circle cx="-7" cy="-18" r="1.2" fill="#fff" /><circle cx="11" cy="-18" r="1.2" fill="#fff" />
          <path d="M-35 10 Q-20 80 0 100 Q20 80 35 10 Z" fill="#fff" stroke="#ddd" strokeWidth="2" />
          <path d="M-10 5 L0 25 L10 5" fill="#fff" stroke="#ddd" strokeWidth="1" />
        </g>
        <g transform="translate(270, 280)">
          <ellipse cx="0" cy="-20" rx="28" ry="26" fill="#fde8d8" stroke="#1a1a1a" strokeWidth="2" />
          <path d="M-28 -20 Q0 -55 28 -20 L28 0 Q0 10 -28 0 Z" fill="#1a1a2e" />
          <ellipse cx="-9" cy="-18" rx="6" ry="7" fill="#fff" stroke="#1a1a1a" strokeWidth="1.5" />
          <ellipse cx="9" cy="-18" rx="6" ry="7" fill="#fff" stroke="#1a1a1a" strokeWidth="1.5" />
          <circle cx="-9" cy="-16" r="3" fill="#2d4a7a" /><circle cx="9" cy="-16" r="3" fill="#2d4a7a" />
          <circle cx="-7" cy="-18" r="1.2" fill="#fff" /><circle cx="11" cy="-18" r="1.2" fill="#fff" />
          <path d="M-35 10 L-35 100 L35 100 L35 10 Z" fill="#1a1a2e" stroke="#1a1a1a" strokeWidth="2" />
          <rect x="-5" y="5" width="10" height="8" fill="#dc2626" rx="1" />
        </g>
        <text x="185" y="250" fontSize="36">💍</text>
        <text x="40" y="450" fontSize="20">👏</text>
        <text x="340" y="450" fontSize="20">👏</text>
      </svg>
      <ComicNarration text="1년 후, 웃음과 눈물이 섞인 결혼식" />
      <ComicBubble name="주례" text="두 분은 서로의 동료이자, 서로를 지켜준 직협의 동지입니다. 평생 행복하세요!" tail="bottom" style={{ top: "5%", left: "6%", maxWidth: "66%" }} />
      <ComicBubble name="이감독관 & 최감독관" text="직협에서 만나 결혼까지… 인생 최고의 동료예요! (눈물)" tail="bottom" style={{ top: "26%", left: "8%", maxWidth: "58%" }} />
      <ComicSfx text="축하해요~💒" style={{ bottom: "20%", left: "10%", color: "#e85d75" }} />
    </ComicFrame>
  );
}

export function Ep2Panel6() {
  return (
    <ComicFrame className="comic-frame--baby">
      <svg className="comic-bg" viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice">
        <rect width="400" height="500" fill="#f0fff4" />
        <text x="30" y="50" fontSize="24">⭐</text>
        <text x="340" y="50" fontSize="24">🌙</text>
        <Character x={110} y={320} mood="happy" suit="#c17f5a" gender="f" scale={0.85} />
        <Character x={290} y={320} mood="happy" suit="#3e3232" scale={0.85} flip />
        <ellipse cx="200" cy="340" rx="35" ry="30" fill="#ffe4cc" stroke="#1a1a1a" strokeWidth="2" />
        <ellipse cx="200" cy="318" rx="30" ry="14" fill="#f5d5b0" stroke="#1a1a1a" strokeWidth="1.5" />
        <ellipse cx="192" cy="340" rx="6" ry="7" fill="#fff" stroke="#1a1a1a" strokeWidth="1.5" />
        <ellipse cx="208" cy="340" rx="6" ry="7" fill="#fff" stroke="#1a1a1a" strokeWidth="1.5" />
        <circle cx="192" cy="341" r="3" fill="#3e3232" /><circle cx="208" cy="341" r="3" fill="#3e3232" />
        <circle cx="194" cy="339" r="1" fill="#fff" /><circle cx="210" cy="339" r="1" fill="#fff" />
        <path d="M165 350 Q170 380 200 385 Q230 380 235 350 Z" fill="#a8edea" stroke="#1a1a1a" strokeWidth="1.5" />
        <path d="M195 352 Q200 356 205 352" stroke="#c17f5a" strokeWidth="1.5" fill="none" />
        <text x="300" y="200" fontSize="36">👶</text>
      </svg>
      <ComicSticker emoji="👶✨" style={{ top: "38%", right: "8%" }} />
      <ComicBubble name="이감독관" text="여보~ 우리 아기 태어났어! 직협에 출산 축하금도 신청해야지, 잊지 말자!" tail="right" style={{ top: "7%", left: "4%", maxWidth: "54%" }} />
      <ComicBubble name="최감독관" text="당연하지! 직협이 우리 인생의 큰 순간마다 함께해줬잖아. 이번에도 고마워, 직협!" tail="left" style={{ top: "28%", right: "4%", maxWidth: "52%" }} />
      <ComicEmotion text="직협은 일터의 든든한 동반자, 인생의 따뜻한 축복이기도 합니다" />
      <div className="comic-end-line">✦ 2화 끝 — 함께라서 더 빛난 이야기 ✦</div>
    </ComicFrame>
  );
}

/* ── 에피소드 데이터 ── */
export const WEBTOON_EPISODES = [
  {
    id: 1,
    title: "1화 — 목소리가 제도를 바꿨다",
    subtitle: "웃프게 시작해, 뭉클하게 끝나는 직협 이야기",
    thumbnail: "✨",
    themeColor: "#2d8a6e",
    accentColor: "#5ec4a8",
    bgGradient: "linear-gradient(135deg, #a8e6cf 0%, #7ec8e3 50%, #ffd6a5 100%)",
    panels: [
      { Panel: Ep1Panel1, tipBox: null },
      { Panel: Ep1Panel2, tipBox: null },
      { Panel: Ep1Panel3, tipBox: null },
      { Panel: Ep1Panel4, tipBox: null },
      { Panel: Ep1Panel5, tipBox: null },
      { Panel: Ep1Panel6, tipBox: null, isLast: true },
    ],
  },
  {
    id: 2,
    title: "2화 — 직협이 내 편이 되어준 날",
    subtitle: "코믹한 하루들, 감동으로 이어지는 직협의 온기",
    thumbnail: "🌸",
    themeColor: "#d4567a",
    accentColor: "#ff8fab",
    bgGradient: "linear-gradient(135deg, #ffd6e8 0%, #ffeaa7 50%, #c3f0ca 100%)",
    panels: [
      { Panel: Ep2Panel1, tipBox: null },
      {
        Panel: Ep2Panel2,
        tipBox: {
          title: "💡 소송비용 지원 안내",
          items: [
            "대상: 직무수행 관련 소송 제기 또는 피소된 회원",
            "신청: 소속 지역 직장협의회에 서류 제출",
            "내용: 소송비용 지원 (세부 금액은 직협 문의)",
          ],
        },
      },
      { Panel: Ep2Panel3, tipBox: null },
      { Panel: Ep2Panel4, tipBox: null },
      {
        Panel: Ep2Panel5,
        tipBox: {
          title: "💡 결혼 축하금 안내",
          items: [
            "금액: 회원 결혼 시 각각 20만원 지급",
            "대상: 부부 모두 회원인 경우 각각 지급",
            "신청: 소속 지역 직장협의회에 결혼 증빙 서류 제출",
          ],
        },
      },
      {
        Panel: Ep2Panel6,
        tipBox: {
          title: "💡 출산 축하금 안내",
          items: [
            "금액: 출산 시 각각 20만원 지급",
            "대상: 부부 모두 회원인 경우 각각 지급",
            "신청: 소속 지역 직장협의회에 출생증명서 제출",
          ],
        },
        isLast: true,
      },
    ],
  },
];
