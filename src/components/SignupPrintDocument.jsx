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

function resolveData(props) {
  const application = props.application || props.member || {};
  const withholding = props.withholding || props.bank || {};
  return { application, withholding, sig1: props.sig1, sig2: props.sig2 };
}

export default function SignupPrintDocument(props) {
  const { application, withholding, sig1, sig2 } = resolveData(props);
  const handlePrint = () => window.print();

  return (
    <div className="print-overlay">
      <div className="print-modal">
        <div className="print-toolbar no-print">
          <span style={{ fontWeight: 700, fontSize: 15 }}>🖨️ 인쇄 미리보기</span>
          <div style={{ display: "flex", gap: 10 }}>
            <button type="button" className="btn btn-primary" onClick={handlePrint}>인쇄하기</button>
            <button type="button" className="btn btn-outline" onClick={props.onClose}>닫기</button>
          </div>
        </div>

        <div className="print-area" id="print-area">
          <div className="doc-page doc-official">
            <div className="doc-official-top">
              <span className="doc-attach-label">[별지 제2호서식]</span>
              <h1 className="doc-official-title">공무원직장협의회 가입신청서</h1>
            </div>

            <table className="doc-table doc-official-table">
              <tbody>
                <tr>
                  <th>소속</th>
                  <td>{application.affiliation || "—"}</td>
                  <th>직급</th>
                  <td>{application.rank || "—"}</td>
                </tr>
                <tr>
                  <th>이름</th>
                  <td>{application.name || "—"}</td>
                  <th>성별</th>
                  <td>{application.gender || "—"}</td>
                </tr>
              </tbody>
            </table>

            <div className="doc-official-body">
              <p>위 신청인은 공무원 직장협의회의 설립·운영에 관한 법률 시행령 제6조 제1항의 규정에 의거 고용노동부공무원직장협의회의 회원으로 가입하고자 합니다.</p>
              <p>(급여에서 매월 직장협의회가 정하는 회비를 원천 공제하는 것에 동의함 : e-사람에서 개별 조치 또는 별도 납부)</p>
              <p>※ 소속 기관에 직협이 설립되어 전국 조직에 회비 납부 시까지 직장협의회 회비를 전국 조직에 직접 납부하는 것에 동의함.</p>
            </div>

            <div className="doc-official-sign-block">
              <p className="doc-official-date" dangerouslySetInnerHTML={{ __html: formatKrDate(application.applicationDate || application.joinDate) }} />
              <div className="doc-official-sign-line">
                <span>신청인</span>
                <span className="doc-official-name">{application.name}</span>
                <div className="doc-sig-box doc-sig-box--sm">
                  {sig1 ? <img src={sig1} alt="서명" /> : <span className="doc-sig-placeholder">(인)</span>}
                </div>
              </div>
            </div>

            <p className="doc-official-recipient">고용노동부공무원직장협의회 귀중</p>
          </div>

          <div className="doc-divider no-print" />
          <div className="doc-page-break" />

          <div className="doc-page doc-official">
            <h1 className="doc-official-title">원천징수 동의(신규)서<sup>1)</sup></h1>

            <table className="doc-table doc-official-table">
              <tbody>
                <tr>
                  <th>소속</th>
                  <td>{withholding.affiliation || application.affiliation || "—"}</td>
                  <th>직급</th>
                  <td>{withholding.rank || application.rank || "—"}</td>
                </tr>
                <tr>
                  <th>성명</th>
                  <td>{withholding.name || application.name || "—"}</td>
                  <th>생년월일</th>
                  <td>{withholding.dob || "—"}</td>
                </tr>
              </tbody>
            </table>

            <p className="doc-official-period">
              기간&nbsp;&nbsp;{formatPeriodDate(withholding.periodStart)}&nbsp;&nbsp;~&nbsp;&nbsp;{formatPeriodDate(withholding.periodEnd)}
            </p>

            <table className="doc-table doc-consent-table">
              <thead>
                <tr>
                  <th>구분</th>
                  <th>동의사항</th>
                  <th>금액(단위:원)</th>
                  <th>동의사유 등</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>신규신청(동의)</td>
                  <td>직협회비</td>
                  <td>봉급의 0.6%</td>
                  <td>직협회비 납부 동의</td>
                </tr>
              </tbody>
            </table>

            <div className="doc-official-body">
              <p>본인은 「공무원보수규정」 제19조의2제1항제5호의 규정에 따라 상기 내역이 매월 본인의 보수에서 원천징수되는 것을 동의(또는 변경, 철회) 합니다.</p>
            </div>

            <div className="doc-official-sign-block">
              <p className="doc-official-date" dangerouslySetInnerHTML={{ __html: formatKrDate(withholding.consentDate) }} />
              <div className="doc-official-sign-line">
                <span>신청인 성명</span>
                <span className="doc-official-name">{withholding.name || application.name}</span>
                <div className="doc-sig-box doc-sig-box--sm">
                  {sig2 ? <img src={sig2} alt="서명" /> : <span className="doc-sig-placeholder">(인)</span>}
                </div>
              </div>
              <p className="doc-official-sig-note">※ (인)은 자필 서명으로 한다.</p>
            </div>

            <p className="doc-official-recipient doc-official-recipient--office">
              ( {withholding.regionalOffice || "　　　"} )지방고용노동청 지출관 귀하
            </p>

            <div className="doc-official-footnotes">
              <p>1) 동의사항은 1건당 1매의 서식을 작성합니다.</p>
              <p>2) 동의사유 등란에는 동의사항에 대한 구체적인 사유를 기재합니다.</p>
              <p>3) 동의(또는 변경, 철회)는 해당 동의사항에 대하여만 효력이 있습니다.</p>
              <p>4) 기간란을 기재하지 않은 경우에는 1년간의 효력이 있는 것으로 봅니다.</p>
              <p>5) 동의(또는 변경, 철회)를 철회하고자 하는 경우에는 별도의 서식을 작성하여 제출합니다.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
