// ✅ 실제 임원현황 데이터 (2026.06.30 기준)

const HQ_EXECUTIVES = [
  { role: "의장", name: "김동식", region: "본조 운영진" },
  { role: "부의장", name: "양지현", region: "본조 운영진" },
  { role: "사무국장", name: "임현호", region: "본조 운영진" },
  { role: "총무1국장", name: "양일준", region: "본조 운영진" },
];

const HQ_UNIT = [
  { unit: "본부", president: "조성근", vp: "허균", secretary: "김정혜", etc: "염보라" },
];

const BRANCHES = [
  // 서울청
  { region: "서울청", unit: "서울청", president: "공석", vp: "", secretary: "김정우", etc: "" },
  { region: "서울청", unit: "서울강남", president: "조성웅", vp: "", secretary: "김하림", etc: "" },
  { region: "서울청", unit: "서울동부", president: "이예준", vp: "", secretary: "전예린", etc: "" },
  { region: "서울청", unit: "서울서부", president: "김혜성", vp: "", secretary: "", etc: "" },
  { region: "서울청", unit: "서울남부", president: "김응년", vp: "", secretary: "박수지", etc: "" },
  { region: "서울청", unit: "서울북부", president: "김성원", vp: "", secretary: "김태완", etc: "" },
  { region: "서울청", unit: "서울관악", president: "이창호", vp: "", secretary: "", etc: "" },
  // 중부청
  { region: "중부청", unit: "중부청", president: "우승완(휴직)", vp: "", secretary: "안지민", etc: "" },
  { region: "중부청", unit: "인천북부", president: "박태용", vp: "", secretary: "", etc: "" },
  { region: "중부청", unit: "부천", president: "김영배", vp: "", secretary: "박지후", etc: "" },
  // 강원
  { region: "강원", unit: "강원(춘천)", president: "오기학", vp: "", secretary: "", etc: "" },
  { region: "강원", unit: "강릉", president: "주성혁", vp: "", secretary: "강승구", etc: "" },
  { region: "강원", unit: "원주", president: "이경록", vp: "", secretary: "박동선", etc: "" },
  { region: "강원", unit: "태백", president: "김민수", vp: "", secretary: "배민기", etc: "" },
  { region: "강원", unit: "영월", president: "이정우", vp: "", secretary: "", etc: "" },
  // 경기청
  { region: "경기청", unit: "경기청", president: "홍순규", vp: "", secretary: "", etc: "" },
  { region: "경기청", unit: "성남", president: "황병의", vp: "조영환", secretary: "김벼리", etc: "박범우(감사)" },
  { region: "경기청", unit: "안양", president: "정윤순", vp: "", secretary: "공석", etc: "서동환" },
  { region: "경기청", unit: "안산", president: "공석", vp: "", secretary: "김민석", etc: "" },
  { region: "경기청", unit: "의정부", president: "허혜경", vp: "박해룡", secretary: "손민정", etc: "" },
  { region: "경기청", unit: "고양", president: "배정돈", vp: "", secretary: "장승식", etc: "" },
  { region: "경기청", unit: "평택", president: "김만수", vp: "", secretary: "공석", etc: "" },
  // 부산청
  { region: "부산청", unit: "부산청", president: "김성식", vp: "김영미", secretary: "제갈윤", etc: "천민영(총무)" },
  { region: "부산청", unit: "부산동부", president: "공석", vp: "", secretary: "유병욱", etc: "" },
  { region: "부산청", unit: "부산북부", president: "정명화", vp: "", secretary: "", etc: "김근호(총무)" },
  { region: "부산청", unit: "창원", president: "최재원", vp: "", secretary: "윤신희", etc: "" },
  { region: "부산청", unit: "울산", president: "공석", vp: "", secretary: "이송은", etc: "최치환(총무)" },
  { region: "부산청", unit: "양산", president: "공석", vp: "김길수", secretary: "김병학", etc: "" },
  { region: "부산청", unit: "진주", president: "유재화", vp: "", secretary: "", etc: "박찬곤(총무)" },
  { region: "부산청", unit: "통영", president: "이영란", vp: "", secretary: "서성봉", etc: "김은정" },
  // 대구청
  { region: "대구청", unit: "대구청", president: "박준모", vp: "", secretary: "김다진", etc: "김대웅" },
  { region: "대구청", unit: "대구서부", president: "김동식", vp: "", secretary: "도동화", etc: "임성현" },
  { region: "대구청", unit: "포항", president: "변진기", vp: "", secretary: "한명혜", etc: "" },
  { region: "대구청", unit: "구미", president: "신광철", vp: "", secretary: "김승형", etc: "윤진건" },
  { region: "대구청", unit: "영주", president: "공석", vp: "", secretary: "조성일", etc: "" },
  { region: "대구청", unit: "안동", president: "공석", vp: "", secretary: "공석", etc: "" },
  // 대전청
  { region: "대전청", unit: "대전청", president: "이용구", vp: "", secretary: "박재현", etc: "" },
  { region: "대전청", unit: "청주", president: "양일준", vp: "", secretary: "", etc: "" },
  { region: "대전청", unit: "천안", president: "복기연", vp: "전봉기", secretary: "", etc: "" },
  { region: "대전청", unit: "충주", president: "공석", vp: "", secretary: "나종남", etc: "" },
  { region: "대전청", unit: "보령", president: "이승기", vp: "", secretary: "이혜원", etc: "" },
  { region: "대전청", unit: "서산", president: "김기선", vp: "", secretary: "김경주", etc: "" },
  // 노동위원회
  { region: "노동위원회", unit: "중노위", president: "공석", vp: "", secretary: "박필규", etc: "" },
  { region: "노동위원회", unit: "서울지노위", president: "신상돈", vp: "", secretary: "조유나", etc: "" },
  { region: "노동위원회", unit: "부산지노위", president: "공석", vp: "", secretary: "공석", etc: "" },
  { region: "노동위원회", unit: "충남지노위", president: "이용우", vp: "", secretary: "공석", etc: "" },
  { region: "노동위원회", unit: "충북지노위", president: "이학진", vp: "", secretary: "", etc: "" },
  { region: "노동위원회", unit: "경북지노위", president: "김상현", vp: "이정주", secretary: "", etc: "" },
  // 기타기관
  { region: "기타기관", unit: "산심위", president: "김성경", vp: "전재영", secretary: "도경환", etc: "이지은(감사)" },
  { region: "기타기관", unit: "고객상담센터", president: "김정원", vp: "", secretary: "", etc: "황현지(총무)" },
];

const REGION_COLORS = {
  "서울청": "#1557a0",
  "중부청": "#0d6e4f",
  "강원": "#5b3ea8",
  "경기청": "#c47d0a",
  "부산청": "#b53a2a",
  "대구청": "#1a7a6e",
  "대전청": "#2e5fa3",
  "노동위원회": "#6b3a8a",
  "기타기관": "#4a5568",
};

const JOIN_STEPS = [
  { title: "자격 확인", desc: "고용노동부 본부, 지방노동관서, 노동위원회 등 소속 공무원이면 누구나 가입 가능합니다." },
  { title: "가입 신청서 작성", desc: "'가입 신청' 페이지에서 입회원서와 자동이체 신청서를 온라인으로 작성·서명합니다." },
  { title: "운영진 검토 및 승인", desc: "신청 내용 확인 후 소속 지역 직협 담당자가 승인 여부를 안내드립니다." },
  { title: "직협회비 안내", desc: "직협 회비는 봉급의 0.6%로 급여에서 원천징수합니다." },
  { title: "회원 활동 시작", desc: "소송비용·경조사·질병 지원 등 각종 회원 혜택을 바로 이용하실 수 있습니다." },
];

// 지역별로 그룹핑
const groupByRegion = (data) => {
  return data.reduce((acc, row) => {
    if (!acc[row.region]) acc[row.region] = [];
    acc[row.region].push(row);
    return acc;
  }, {});
};

export default function PageJoin() {
  const grouped = groupByRegion(BRANCHES);

  return (
    <>
      {/* 히어로 */}
      <section className="hero">
        <div className="hero-eyebrow">가입 안내 & 조직</div>
        <h1>직장협의회와 함께하세요</h1>
        <p>
          간단한 절차로 가입하고, 전국 직장협의회 네트워크와 함께<br />
          더 나은 공직 환경을 만들어 나가세요.
        </p>
      </section>

      {/* 가입 절차 */}
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

      {/* 본조 운영진 */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">본조 운영진</h2>
            <p className="section-sub">전국 직장협의회 본조 대표 임원진입니다.</p>
          </div>
          <div className="card-grid card-grid-4" style={{ maxWidth: 860, margin: "0 auto 40px" }}>
            {HQ_EXECUTIVES.map((e, i) => (
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

      {/* 지역별 단위직협 */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">전국 단위직협 임원현황</h2>
            <p className="section-sub">2026.06.30 기준 · 총 {BRANCHES.length}개 단위직협</p>
          </div>

          {/* 본부 단위직협 현황 */}
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
                  {HQ_UNIT.map((r, i) => (
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
              {/* 지역 헤더 */}
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
