export default function SignupPrintDocument({ member, bank, sig1, sig2, onClose }) {
  const handlePrint = () => window.print();

  return (
    <div className="print-overlay">
      <div className="print-modal">
        <div className="print-toolbar no-print">
          <span style={{ fontWeight: 700, fontSize: 15 }}>🖨️ 인쇄 미리보기</span>
          <div style={{ display: "flex", gap: 10 }}>
            <button type="button" className="btn btn-primary" onClick={handlePrint}>인쇄하기</button>
            <button type="button" className="btn btn-outline" onClick={onClose}>닫기</button>
          </div>
        </div>

        <div className="print-area" id="print-area">
          <div className="doc-page">
            <div className="doc-header">
              <div className="doc-stamp-area">
                <div className="doc-stamp-box">결<br />재</div>
                <div className="doc-stamp-box" />
                <div className="doc-stamp-box" />
              </div>
              <h1 className="doc-title">입 회 원 서</h1>
              <p className="doc-org">고용노동부공무원직장협의회 귀중</p>
            </div>

            <table className="doc-table">
              <tbody>
                <tr>
                  <th>성 명</th>
                  <td>{member.name}</td>
                  <th>생년월일</th>
                  <td>{member.dob}</td>
                </tr>
                <tr>
                  <th>주 소</th>
                  <td colSpan={3}>{member.address || "—"}</td>
                </tr>
                <tr>
                  <th>연락처</th>
                  <td>{member.phone}</td>
                  <th>신청일</th>
                  <td>{member.joinDate}</td>
                </tr>
                <tr>
                  <th>소속(기관명)</th>
                  <td colSpan={3}>{member.affiliation}</td>
                </tr>
              </tbody>
            </table>

            <div className="doc-body-text">
              <p>
                본인은 고용노동부공무원직장협의회 회원으로 가입하고자 하며,<br />
                직장협의회 규약을 준수하고 회원으로서의 의무를 다할 것을 서약합니다.
              </p>
            </div>

            <div className="doc-sign-row">
              <span className="doc-date">{member.joinDate} &nbsp;&nbsp; 신청인</span>
              <div className="doc-sig-box">
                {sig1 ? <img src={sig1} alt="서명" style={{ width: "100%", height: "100%", objectFit: "contain" }} /> : <span className="doc-sig-placeholder">서명</span>}
              </div>
              <span className="doc-sig-label">(서명 또는 인)</span>
            </div>

            <div className="doc-footer-note">
              * 지원 사항은 고용노동부공무원직장협의회 회계집행 및 자산관리규정에 근거하여 지원
            </div>
          </div>

          <div className="doc-divider no-print" />
          <div className="doc-page-break" />

          <div className="doc-page">
            <div className="doc-header">
              <div className="doc-stamp-area">
                <div className="doc-stamp-box">결<br />재</div>
                <div className="doc-stamp-box" />
                <div className="doc-stamp-box" />
              </div>
              <h1 className="doc-title">자동이체 신청서</h1>
              <p className="doc-sub-title">( 원천징수 동의서 )</p>
              <p className="doc-org">고용노동부공무원직장협의회 귀중</p>
            </div>

            <table className="doc-table">
              <tbody>
                <tr>
                  <th>신청인</th>
                  <td>{member.name}</td>
                  <th>소속</th>
                  <td>{member.affiliation}</td>
                </tr>
                <tr>
                  <th>예금주</th>
                  <td>{bank.accountHolder}</td>
                  <th>관 계</th>
                  <td>{bank.relation}</td>
                </tr>
                <tr>
                  <th>은행명</th>
                  <td>{bank.bankName}</td>
                  <th>계좌번호</th>
                  <td>{bank.accountNumber}</td>
                </tr>
                <tr>
                  <th>월 봉급액</th>
                  <td>{bank.monthlySalary ? `${Number(bank.monthlySalary).toLocaleString()}원` : "—"}</td>
                  <th>월 이체금액</th>
                  <td>{bank.monthlyFee ? `${Number(bank.monthlyFee).toLocaleString()}원 (봉급의 0.6%)` : "—"}</td>
                </tr>
                <tr>
                  <th>이체일</th>
                  <td>매월 {bank.payDay}일</td>
                  <th>이체 시작</th>
                  <td>{bank.startDate ? `${bank.startDate.replace("-", "년 ")}월` : "—"}</td>
                </tr>
              </tbody>
            </table>

            <div className="doc-body-text">
              <p style={{ marginBottom: 8 }}>위와 같이 자동이체를 신청합니다.</p>
              <ol className="doc-notice-list">
                <li>이체금액은 위에 표시한 금액으로 하되, 협의회 결정에 의거 변경될 수 있으며 변경 시 사전 통보합니다.</li>
                <li>이체 금융기관의 사정으로 이체가 불능할 경우에는 직접 납부합니다.</li>
                <li>이체에 필요한 사항은 고용노동부공무원직장협의회에 일임합니다.</li>
              </ol>
            </div>

            <div className="doc-sign-row">
              <span className="doc-date">{member.joinDate} &nbsp;&nbsp; 신청인</span>
              <div className="doc-sig-box">
                {sig2 ? <img src={sig2} alt="서명" style={{ width: "100%", height: "100%", objectFit: "contain" }} /> : <span className="doc-sig-placeholder">서명</span>}
              </div>
              <span className="doc-sig-label">(서명 또는 인)</span>
            </div>

            <div className="doc-footer-note">
              * 고용노동부공무원직장협의회 회계집행 및 자산관리규정에 근거하여 처리됩니다.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
