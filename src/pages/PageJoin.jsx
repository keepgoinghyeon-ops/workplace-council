import { useEffect, useState } from "react";
import { DEFAULT_SITE_CONTENT, REGION_COLORS, mergeSiteContent } from "../data/defaultSiteContent";
import { fetchSiteContent } from "../lib/noticesApi";

const JOIN_STEPS = [
  { title: "자격 확인", desc: "고용노동부 본부, 지방노동관서, 노동위원회 등 소속 공무원이면 누구나 가입 가능합니다." },
  { title: "가입 신청서 작성", desc: "'가입 신청' 페이지에서 입회원서와 자동이체 신청서를 온라인으로 작성·서명합니다." },
  { title: "운영진 검토 및 승인", desc: "신청 내용 확인 후 소속 지역 직협 담당자가 승인 여부를 안내드립니다." },
  { title: "직협회비 안내", desc: "직협 회비는 봉급의 0.6%로 급여에서 원천징수합니다." },
  { title: "회원 활동 시작", desc: "소송비용·경조사·질병 지원 등 각종 회원 혜택을 바로 이용하실 수 있습니다." },
];

const groupByRegion = (data) => {
  return data.reduce((acc, row) => {
    if (!acc[row.region]) acc[row.region] = [];
    acc[row.region].push(row);
    return acc;
  }, {});
};

export default function PageJoin() {
  const [content, setContent] = useState(DEFAULT_SITE_CONTENT);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const raw = await fetchSiteContent();
        if (!cancelled) setContent(mergeSiteContent(raw));
      } catch {
        if (!cancelled) setContent(DEFAULT_SITE_CONTENT);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const hqExecutives = content.hqExecutives || [];
  const hqUnit = content.hqUnit || [];
  const branches = content.branches || [];
  const grouped = groupByRegion(branches);

  return (
    <>
      <section className="hero">
        <div className="hero-eyebrow">가입 안내 & 조직</div>
        <h1>직장협의회와 함께하세요</h1>
        <p>
          간단한 절차로 가입하고, 전국 직장협의회 네트워크와 함께<br />
          더 나은 공직 환경을 만들어 나가세요.
        </p>
      </section>

      <section className="section section-alt">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">가입 방법</h2>
            <p className="section-sub">5단계로 빠르게 완료되는 가입 절차를 안내합니다.</p>
          </div>
          <div className="join-steps">
            {JOIN_STEPS.map((s, i) => (
              <div key={i} className="join-step">
                <div className="join-step-num">{i + 1}</div>
                <div className="join-step-body">
                  <h4>{s.title}</h4>
                  <p>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">본조 운영진</h2>
            <p className="section-sub">전국 직장협의회 본조 대표 임원진입니다.</p>
          </div>
          <div className="card-grid card-grid-4" style={{ maxWidth: 860, margin: "0 auto 40px" }}>
            {hqExecutives.map((e, i) => (
              <div key={i} className="card card-accent" style={{ textAlign: "center", padding: "24px 16px" }}>
                <div style={{ fontSize: 32, marginBottom: 10 }}>
                  {i === 0 ? "👑" : i === 1 ? "🌟" : i === 2 ? "📋" : "📌"}
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--sky)", marginBottom: 4 }}>{e.role}</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: "var(--navy)" }}>{e.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">전국 단위직협 임원현황</h2>
            <p className="section-sub">{content.orgAsOf} 기준 · 총 {branches.length}개 단위직협</p>
          </div>

          <div style={{ marginBottom: 40 }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "var(--primary)",
              color: "#fff", padding: "6px 18px", borderRadius: "20px",
              fontSize: 14, fontWeight: 700, marginBottom: 12,
            }}>
              본부 단위직협 현황
            </div>

            <div className="org-table-wrap">
              <table className="org-table">
                <thead>
                  <tr>
                    <th>단위직협</th>
                    <th>회장</th>
                    <th>부회장</th>
                    <th>사무국장(총무)</th>
                    <th>기타임원</th>
                  </tr>
                </thead>
                <tbody>
                  {hqUnit.map((r, i) => (
                    <tr key={i}>
                      <td><span className="badge-hq">{r.unit}</span></td>
                      <td style={{ fontWeight: 700 }}>{r.president}</td>
                      <td>{r.vp}</td>
                      <td>{r.secretary}</td>
                      <td style={{ fontSize: 13, color: "var(--text-soft)" }}>{r.etc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {Object.entries(grouped).map(([region, rows]) => (
            <div key={region} style={{ marginBottom: 40 }}>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: REGION_COLORS[region] || "var(--navy)",
                color: "#fff", padding: "6px 18px", borderRadius: "20px",
                fontSize: 14, fontWeight: 700, marginBottom: 12,
              }}>
                {region} ({rows.length}개)
              </div>

              <div className="org-table-wrap">
                <table className="org-table">
                  <thead>
                    <tr>
                      <th>단위직협</th>
                      <th>직협회장</th>
                      <th>부회장</th>
                      <th>사무국장(총무)</th>
                      <th>기타임원</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r, i) => (
                      <tr key={i}>
                        <td>
                          <span className="badge-region" style={{ background: (REGION_COLORS[region] || "var(--navy)") + "22", color: REGION_COLORS[region] || "var(--blue)" }}>
                            {r.unit}
                          </span>
                        </td>
                        <td style={{ fontWeight: 700, color: r.president === "공석" ? "var(--gray-3)" : "var(--text)" }}>
                          {r.president || "-"}
                        </td>
                        <td style={{ color: r.vp === "공석" || !r.vp ? "var(--gray-3)" : "var(--text)" }}>
                          {r.vp || "-"}
                        </td>
                        <td style={{ color: r.secretary === "공석" || !r.secretary ? "var(--gray-3)" : "var(--text)" }}>
                          {r.secretary || "-"}
                        </td>
                        <td style={{ fontSize: 13, color: "var(--text-soft)" }}>{r.etc || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}

          <div className="law-box" style={{ marginBottom: 0 }}>
            <h4>📌 안내사항</h4>
            <p>
              개별 연락처는 다우리 조직도를 참고해주세요.<br />
              공석인 직위는 현재 선임 절차 진행 중이거나 임시 대행 중일 수 있습니다.<br />
              직협에 대한 문의사항은 본조 운영진이나, 해당 지청 직협의장에게 언제든지 문의해주세요.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
