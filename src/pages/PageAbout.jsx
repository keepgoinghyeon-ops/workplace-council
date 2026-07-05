const LeafSvg = ({ color = "#7ec8e3" }) => (
  <svg viewBox="0 0 80 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M40 5C25 25 10 50 15 75C18 88 30 95 40 98C50 95 62 88 65 75C70 50 55 25 40 5Z"
      fill={color}
      opacity="0.6"
    />
    <path d="M40 20V90" stroke={color} strokeWidth="2" opacity="0.5" />
    <path d="M40 40C30 45 20 50 15 55" stroke={color} strokeWidth="1.5" opacity="0.4" />
    <path d="M40 55C50 60 60 65 65 70" stroke={color} strokeWidth="1.5" opacity="0.4" />
  </svg>
);

const FEATURES = [
  {
    key: "yellow",
    title: "전국",
    sub: "지방노동관서 · 노동위원회",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
        <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5C15 14.17 10.33 13 8 13zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
      </svg>
    ),
    leafColor: "#e8c547",
  },
  {
    key: "green",
    title: "누구나",
    sub: "고용노동부 소속 공무원",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
      </svg>
    ),
    leafColor: "#7ec87e",
  },
  {
    key: "blue",
    title: "법정",
    sub: "공식 협의기구",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 3L4 9v2h16V9L12 3zm-1 7v8h2v-8h-2zm4 0v8h2v-8h-2zM6 19h12v2H6v-2z" />
      </svg>
    ),
    leafColor: "#7eb8e8",
  },
  {
    key: "purple",
    title: "함께",
    sub: "더 나은 공직생활을 위해",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      </svg>
    ),
    leafColor: "#c49ee8",
  },
];

export default function PageAbout({ onNavigate }) {
  const roles = [
    {
      icon: "⚖️",
      title: "직원의 권익을 지킵니다",
      desc: "근무 중 겪는 고충, 불합리한 제도와 관행, 업무 부담 등 현장의 목소리를 모아 개선을 요구합니다.",
    },
    {
      icon: "🌱",
      title: "더 나은 근무환경을 만듭니다",
      desc: "업무능률 향상, 조직문화 증진, 일하고 싶은 조직문화 조성을 위해 노력합니다. (소송비용, 경조사, 유가족, 질병, 퇴직자 지원 등)",
    },
    {
      icon: "🤝",
      title: "어려울 때 함께합니다",
      desc: "회원의 고충 해소, 복무상 애로사항, 신무수행 중 발생하는 문제 등에 대해 함께 고민하고 지원합니다.",
    },
    {
      icon: "📢",
      title: "현장의 목소리를 전달합니다",
      desc: "본부와 기관장에게 직원들의 현실을 알리고, 정책과 제도가 현장에 맞게 운영될 수 있도록 의견을 제시합니다.",
    },
  ];

  const steps = [
    { title: "가입 신청", desc: "온라인 또는 서면 신청" },
    { title: "심사 승인", desc: "운영진 검토 후 승인" },
    { title: "회비 납부", desc: "연회비 자동이체 등록" },
    { title: "활동 시작", desc: "협의회 참여 및 혜택 수령" },
  ];

  return (
    <>
      {/* 히어로 */}
      <section className="hero">
        <div className="hero-deco hero-deco--blob1" />
        <div className="hero-deco hero-deco--blob2" />
        <div className="hero-deco hero-deco--blob3" />
        <div className="hero-deco hero-deco--leaf-left">
          <LeafSvg color="#7ec8e3" />
        </div>
        <div className="hero-deco hero-deco--leaf-right">
          <LeafSvg color="#7ec8e3" />
        </div>

        <div className="hero-inner">
          <div className="hero-eyebrow">고용노동부 공무원 직장협의회</div>
          <h1>직장협의회가 함께 합니다.</h1>
          <p>
            처음 공직에 들어와 낯선 업무와 조직문화에 적응하는 일,<br />
            현장에서 묵묵히 일하면서도 말하지 못한 어려움을 혼자 감당하는 일.<br />
            <strong>이제 혼자 고민하지 마십시오.</strong>
          </p>
          <div className="hero-cta-row">
            <button className="btn btn-primary" onClick={() => onNavigate(4)}>
              지금 바로 가입하기 →
            </button>
            <button className="btn btn-outline" onClick={() => onNavigate(2)}>
              가입 안내 보기
            </button>
          </div>
        </div>
      </section>

      {/* 4단 특징 */}
      <div className="feature-strip">
        {FEATURES.map((f) => (
          <div key={f.key} className={`feature-col feature-col--${f.key}`}>
            <div className={`feature-icon feature-icon--${f.key === "yellow" ? "orange" : f.key}`}>
              {f.icon}
            </div>
            <div className={`feature-title feature-title--${f.key === "yellow" ? "orange" : f.key}`}>
              {f.title}
            </div>
            <div className="feature-sub">{f.sub}</div>
            <div className={`feature-leaf ${f.key === "yellow" || f.key === "green" ? "feature-leaf--left" : "feature-leaf--right"}`}>
              <LeafSvg color={f.leafColor} />
            </div>
          </div>
        ))}
      </div>

      {/* 누가 가입할 수 있나요 */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">누가 가입할 수 있나요?</h2>
            <p className="section-sub">고용노동부 소속이라면 누구나 환영합니다.</p>
          </div>
          <div className="law-box">
            <h4>✅ 가입 대상</h4>
            <p>
              고용노동부 본부, 지방노동관서, 노동위원회 등 소속기관에 근무하는
              <strong> 고용노동부 소속 공무원은 누구나 가입할 수 있습니다.</strong><br />
              신규공무원도, 아직 가입하지 못한 직원도 함께할 수 있습니다.
            </p>
          </div>
          <div className="law-box">
            <h4>📜 관련 규정</h4>
            <p>
              직협은 근무환경 개선, 후생복리 증진, 고충 해소와 회원 권익 향상을 목적으로 하며,
              고용노동부 소속 공무원은 누구나 회원이 될 수 있도록 정하고 있습니다.<br />
              <em>* 지원 사항은 고용노동부공무원직장협의회 회계집행 및 자산관리규정에 근거하여 지원</em>
            </p>
          </div>
        </div>
      </section>

      {/* 직협이 하는 일 */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">직협은 이런 일을 합니다</h2>
            <p className="section-sub">
              우리 직원들의 목소리를 모으고, 더 나은 일터를 만들어가기 위해 함께하는 조직입니다.
            </p>
          </div>
          <div className="card-grid card-grid-3" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
            {roles.map((r, i) => (
              <div key={i} className="card card-accent">
                <div className="card-icon">{r.icon}</div>
                <h3>{r.title}</h3>
                <p>{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 직협 가입의 의미 */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">직협 가입은 이런 의미입니다</h2>
          </div>
          <div style={{ maxWidth: 720, margin: "0 auto" }}>
            <div className="law-box" style={{ marginBottom: 16 }}>
              <p>
                💬 내가 힘들 때 도움을 받을 수 있는 <strong>통로를 만드는 일</strong>입니다.<br />
                💬 동료의 어려움에 함께 힘을 보태는 <strong>연대의 일</strong>입니다.<br />
                💬 우리 조직을 더 건강하고 지속 가능한 일터로 바꾸는 <strong>작은 시작</strong>입니다.
              </p>
            </div>
            <div className="law-box">
              <h4>💡 한 사람의 목소리는 작을 수 있지만, 함께 모인 목소리는 조직을 바꿀 수 있습니다.</h4>
              <p>
                고용노동부공무원직장협의회는 여러분을 기다리고 있습니다.<br />
                더 나은 근무환경, 더 따뜻한 조직문화, 더 당당한 공직생활을 위해 지금 직협에 가입해 주세요.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 가입 프로세스 요약 */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">가입 절차 요약</h2>
            <p className="section-sub">간단한 4단계로 직장협의회 회원이 될 수 있습니다.</p>
          </div>
          <div className="process-steps">
            {steps.map((s, i) => (
              <div key={i} className="step">
                <div className="step-num">{i + 1}</div>
                <h4>{s.title}</h4>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: "40px" }}>
            <button className="btn btn-blue" onClick={() => onNavigate(2)}>
              자세한 가입 안내 보기 →
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
