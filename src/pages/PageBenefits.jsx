const BENEFIT_GROUPS = [
  {
    groupTitle: "소송비용 지원",
    icon: "⚖️",
    items: [
      {
        title: "소송비용 지원",
        desc: "직협 회원이 직무수행 관련하여 소송을 제기하거나 피소된 경우 소송비용을 지원합니다.",
        badge: "직무관련",
      },
    ],
  },
  {
    groupTitle: "경조사 지원",
    icon: "💐",
    items: [
      {
        title: "유가족 지원",
        desc: "본인 및 배우자, 본인 및 배우자 부모, 자녀 사망 시 20만원을 지급합니다.",
        badge: "20만원",
      },
      {
        title: "결혼 축하금",
        desc: "회원 결혼 시 20만원을 지급합니다. 부부공무원의 경우 각각 지급됩니다.",
        badge: "20만원",
      },
      {
        title: "출산 축하금",
        desc: "회원 출산 시 20만원을 지급합니다. 부부공무원의 경우 각각 지급됩니다.",
        badge: "20만원",
      },
    ],
  },
  {
    groupTitle: "질병·건강 지원",
    icon: "🏥",
    items: [
      {
        title: "사망직원 유가족 지원",
        desc: "재직 중 사망 시 유가족에게 500만원을 지급합니다.",
        badge: "500만원",
      },
      {
        title: "재직자 질병 지원",
        desc: "질병으로 3개월 이상 휴직자에게 200만원을 지급합니다. 중질환의 경우 최대 300만원까지 지원합니다.",
        badge: "최대 300만원",
      },
    ],
  },
  {
    groupTitle: "퇴직·승진 지원",
    icon: "🎓",
    items: [
      {
        title: "퇴직자 지원",
        desc: "10년 이상 가입한 회원이 6급 이하로 퇴직 시 100만원을 지급합니다.",
        badge: "100만원",
      },
      {
        title: "승진 축하금",
        desc: "5급으로 승진하는 경우 10만원을 지급합니다.",
        badge: "10만원",
      },
    ],
  },
];

export default function PageBenefits({ onNavigate }) {
  return (
    <>
      {/* 히어로 */}
      <section className="hero">
        <div className="hero-eyebrow">회원 혜택</div>
        <h1>회원이 되면 이런 혜택을 누릴 수 있어요</h1>
        <p>
          소송비용부터 경조사, 질병, 퇴직까지<br />
          직장협의회가 회원의 삶 전반을 함께합니다.
        </p>
        <div className="hero-cta-row">
          <button className="btn btn-primary" onClick={() => onNavigate(4)}>
            지금 가입하고 혜택 받기 →
          </button>
        </div>
      </section>

      {/* 혜택 요약 하이라이트 */}
      <section className="section section-alt">
        <div className="container">
          <div className="benefit-highlight">
            <div className="benefit-highlight-icon">🌟</div>
            <div>
              <h3>직원 지원 사항 요약</h3>
              <p>
                소송비용 지원 · 사망직원 유가족 500만원 · 재직자 질병 최대 300만원 ·
                경조사(사망·결혼·출산) 각 20만원 · 퇴직자 최대 100만원 ·
                승진 축하금까지 — 소속 지역 직장협의회를 통해 신청하세요.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 혜택 그룹별 */}
      {BENEFIT_GROUPS.map((group, gi) => (
        <section
          key={gi}
          className={`section ${gi % 2 === 1 ? "section-alt" : ""}`}
        >
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">
                {group.icon} {group.groupTitle}
              </h2>
            </div>
            <div className="card-grid card-grid-3">
              {group.items.map((item, ii) => (
                <div key={ii} className="card card-gold">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                    <h3 style={{ marginBottom: 0 }}>{item.title}</h3>
                    <span
                      style={{
                        background: "var(--gold)",
                        color: "var(--navy)",
                        fontSize: "11px",
                        fontWeight: 700,
                        padding: "2px 10px",
                        borderRadius: "12px",
                        whiteSpace: "nowrap",
                        marginLeft: "8px",
                      }}
                    >
                      {item.badge}
                    </span>
                  </div>
                  <p>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* 신청 안내 */}
      <section className="section section-alt">
        <div className="container">
          <div className="law-box" style={{ marginBottom: 0 }}>
            <h4>📋 신청 & 문의</h4>
            <p>
              소속 지역 직장협의회에 신청 및 문의하세요.<br />
              <em>* 지원 사항은 고용노동부공무원직장협의회 회계집행 및 자산관리규정에 근거하여 지원됩니다.</em>
            </p>
          </div>
        </div>
      </section>

      {/* 하단 CTA */}
      <section className="section" style={{ background: "var(--navy)", textAlign: "center" }}>
        <h2 style={{ color: "var(--white)", fontSize: 26, fontWeight: 800, marginBottom: 12 }}>
          지금 바로 가입하고 혜택을 누려보세요
        </h2>
        <p style={{ color: "var(--gray-3)", marginBottom: 28 }}>
          가입은 5분이면 충분합니다. 소속 지역 직장협의회를 통해 각종 혜택을 신청하세요.
        </p>
        <button className="btn btn-primary" onClick={() => onNavigate(4)}>
          가입 신청 페이지로 이동 →
        </button>
      </section>
    </>
  );
}
