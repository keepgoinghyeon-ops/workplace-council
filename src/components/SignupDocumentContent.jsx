function formatKrDate(dateStr) {
  if (!dateStr) return "20&nbsp;&nbsp;&nbsp;&nbsp;년&nbsp;&nbsp;&nbsp;&nbsp;월&nbsp;&nbsp;&nbsp;&nbsp;일";
  const [y, m, d] = dateStr.split("-");
  return `20${String(y).slice(2)}년 ${Number(m)}월 ${Number(d)}일`;
}

function formatPeriodDate(dateStr) {
  if (!dateStr) return ".  .  .";
  const [y, m, d] = dateStr.split("-");
  return `${y}. ${Number(m)}. ${Number(d)}.`;
}

export function ApplicationDocumentPage({ application, sig1 }) {
  const app = application || {};
  return (
    <div className="doc-page-a4">
      <p className="doc-attach">[별지 제2호서식]</p>
      <h1 className="doc-title-official">공무원직장협의회 가입신청서</h1>
      <table className="doc-tbl">
        <tbody>
          <tr>
            <th>소&nbsp;&nbsp;&nbsp;속</th>
            <td colSpan={3}>{app.affiliation || "—"}</td>
          </tr>
          <tr>
            <th>직&nbsp;&nbsp;&nbsp;급</th>
            <td colSpan={3}>{app.rank || "—"}</td>
          </tr>
          <tr>
            <th>이&nbsp;&nbsp;&nbsp;름</th>
            <td>{app.name || "—"}</td>
            <th>성&nbsp;&nbsp;&nbsp;별</th>
            <td>{app.gender || "—"}</td>
          </tr>
        </tbody>
      </table>
      <div className="doc-body-text">
        <p>위 신청인은 공무원 직장협의회의 설립·운영에 관한 법률 시행령 제6조 제1항의 규정에 의거 고용노동부공무원직장협의회의 회원으로 가입하고자 합니다.</p>
        <p>(급여에서 매월 직장협의회가 정하는 회비를 원천 공제하는 것에 동의함 : e-사람에서 개별 조치 또는 별도 납부)</p>
        <p>※ 소속 기관에 직협이 설립되어 전국 조직에 회비 납부 시까지 직장협의회 회비를 전국 조직에 직접 납부하는 것에 동의함.</p>
      </div>
      <div className="doc-sign-area">
        <p className="doc-sign-date" dangerouslySetInnerHTML={{ __html: formatKrDate(app.applicationDate || app.joinDate) }} />
        <p className="doc-sign-line">
          <span>신청인</span>
          <span className="doc-sign-name">{app.name}</span>
          <span className="doc-sig-box">
            {sig1 ? <img src={sig1} alt="서명" className="doc-sig-img" /> : <span className="doc-sig-ph">(인)</span>}
          </span>
        </p>
      </div>
      <p className="doc-recipient-main">고용노동부공무원직장협의회 귀중</p>
    </div>
  );
}

export function WithholdingDocumentPage({ application, withholding, sig2 }) {
  const app = application || {};
  const wh = withholding || {};
  const periodText = formatPeriodDate(wh.periodStart);
  const name = wh.name || app.name;
  return (
    <div className="doc-page-a4">
      <h1 className="doc-title-official">원천징수 동의(신규)서<sup>1)</sup></h1>
      <table className="doc-tbl">
        <tbody>
          <tr>
            <th>소&nbsp;&nbsp;&nbsp;속</th>
            <td colSpan={3}>{wh.affiliation || app.affiliation || "—"}</td>
          </tr>
          <tr>
            <th>직&nbsp;&nbsp;&nbsp;급</th>
            <td colSpan={3}>{wh.rank || app.rank || "—"}</td>
          </tr>
          <tr>
            <th>성&nbsp;&nbsp;&nbsp;명</th>
            <td>{name || "—"}</td>
            <th>생년월일</th>
            <td>{wh.dob ? formatPeriodDate(wh.dob) : "—"}</td>
          </tr>
        </tbody>
      </table>
      <div className="doc-body-text">
        <p>
          구분: 신규신청(동의) / 동의사항: 직협회비 / 금액(단위:원): 봉급의 0.6% / 기간: {periodText} / 동의사유: 직협회비 납부 동의
        </p>
        <p>본인은 「공무원보수규정」 제19조의2제1항제5호의 규정에 따라 상기 내역이 매월 본인의 보수에서 원천징수되는 것을 동의(또는 변경, 철회) 합니다.</p>
        <p>1) 동의사항은 1건당 1매의 서식을 작성합니다.</p>
        <p>2) 동의사유 등란에는 동의사항에 대한 구체적인 사유를 기재합니다.</p>
        <p>3) 동의(또는 변경, 철회)는 해당 동의사항에 대하여만 효력이 있습니다.</p>
        <p>4) 기간란을 기재하지 않은 경우에는 1년간의 효력이 있는 것으로 봅니다.</p>
        <p>5) 동의(또는 변경, 철회)를 철회하고자 하는 경우에는 별도의 서식을 작성하여 제출합니다.</p>
      </div>
      <div className="doc-sign-area">
        <p className="doc-sign-date" dangerouslySetInnerHTML={{ __html: formatKrDate(wh.consentDate) }} />
        <p className="doc-sign-line">
          <span>신청인 성명</span>
          <span className="doc-sign-name">{name}</span>
          <span className="doc-sig-box">
            {sig2 ? <img src={sig2} alt="서명" className="doc-sig-img" /> : <span className="doc-sig-ph">(인)</span>}
          </span>
        </p>
        <p className="doc-sig-note">※ (인)은 자필 서명으로 한다.</p>
      </div>
      <p className="doc-recipient-office">
        ( {wh.regionalOffice || "　　　"} )지방고용노동청 지출관 귀하
      </p>
    </div>
  );
}
