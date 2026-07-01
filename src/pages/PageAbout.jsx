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
        <div className="hero-eyebrow">고용노동부 공무원 직장협의회</div>
        <h1>직장협의회가 함께합니다.</h1>
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
      </section>

      {/* 통계 */}
      <div className="stat-strip">
        <div className="stat-strip-inner">
          <div>
            <div className="stat-num">전국</div>
            <div className="stat-label">지방노동관서·노동위원회</div>
          </div>
          <div>
            <div className="stat-num">누구나</div>
            <div className="stat-label">고용노동부 소속 공무원</div>
          </div>
          <div>
            <div className="stat-num">법정</div>
            <div className="stat-label">공식 협의기구</div>
          </div>
          <div>
            <div className="stat-num">함께</div>
            <div className="stat-label">더 나은 공직생활을 위해</div>
          </div>
        </div>
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
