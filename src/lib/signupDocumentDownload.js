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

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function sigImg(sig, alt) {
  if (!sig) return `<span class="sig-placeholder">(인)</span>`;
  return `<img src="${sig}" alt="${escapeHtml(alt)}" width="96" height="44" />`;
}

const DOC_STYLES = `
  @page { size: A4; margin: 20mm; }
  body {
    margin: 0;
    padding: 24px;
    font-family: "Malgun Gothic", "Apple SD Gothic Neo", sans-serif;
    font-size: 12.5pt;
    color: #3e3232;
    line-height: 1.7;
  }
  .doc-page {
    max-width: 640px;
    margin: 0 auto;
  }
  .doc-attach { font-size: 11pt; color: #666; }
  .doc-title {
    font-size: 18pt;
    font-weight: 800;
    text-align: center;
    letter-spacing: 0.08em;
    margin: 0 0 18px;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 16px;
    font-size: 11pt;
  }
  th, td {
    border: 1px solid #999;
    padding: 8px 10px;
    vertical-align: middle;
  }
  th {
    background: #f0f0f0;
    font-weight: 700;
    text-align: center;
    width: 15%;
  }
  .doc-body { font-size: 14pt; line-height: 1.85; margin: 14px 0; }
  .doc-body p { margin: 0 0 8px; }
  .doc-period { margin: 0 0 16px; font-size: 11pt; }
  .doc-sign-block { margin-top: 24px; text-align: right; }
  .doc-date { margin: 0 0 14px; font-size: 11pt; }
  .doc-sign-line { font-size: 11pt; }
  .doc-name { font-weight: 600; }
  .sig-box {
    display: inline-block;
    width: 96px;
    height: 44px;
    border: 1px solid #999;
    vertical-align: middle;
    text-align: center;
  }
  .sig-placeholder { color: #999; font-size: 10pt; line-height: 44px; }
  .doc-recipient {
    margin-top: 24px;
    font-size: 25pt;
    font-weight: 700;
    text-align: center;
  }
  .doc-recipient-office { text-align: left; font-size: 25pt; font-weight: 700; }
  .doc-sig-note { margin: 8px 0 0; font-size: 9pt; color: #666; text-align: right; }
  .doc-footnotes { margin-top: 20px; font-size: 9pt; color: #666; line-height: 1.7; }
  .doc-footnotes p { margin: 0 0 3px; }
`;

function resolveSignupData(props) {
  const application = props.application || props.member || {};
  const withholding = props.withholding || props.bank || {};
  return { application, withholding, sig1: props.sig1, sig2: props.sig2 };
}

function getBaseName(application, withholding) {
  return application.name || withholding.name || "신청서";
}

function getDateKey(application) {
  return (application.applicationDate || new Date().toISOString().slice(0, 10)).replace(/-/g, "");
}

function getApplicationFilename(application, withholding, ext) {
  return `가입신청서_${getBaseName(application, withholding)}_${getDateKey(application)}.${ext}`;
}

function getWithholdingFilename(application, withholding, ext) {
  return `원천징수동의서_${getBaseName(application, withholding)}_${getDateKey(application)}.${ext}`;
}

function triggerFileDownload(html, filename, mimeType) {
  const blob = new Blob(["\uFEFF", html], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function wrapDocument(title, bodyHtml) {
  return `<!DOCTYPE html>
<html lang="ko" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word">
<head>
  <meta charset="UTF-8" />
  <meta name="ProgId" content="Word.Document" />
  <meta name="Generator" content="Microsoft Word" />
  <title>${escapeHtml(title)}</title>
  <!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View></w:WordDocument></xml><![endif]-->
  <style>${DOC_STYLES}</style>
</head>
<body>
${bodyHtml}
</body>
</html>`;
}

export function buildApplicationDocumentHtml({ application = {}, sig1 }) {
  const app = application;
  const body = `
  <div class="doc-page">
    <p class="doc-attach">[별지 제2호서식]</p>
    <h1 class="doc-title">공무원직장협의회 가입신청서</h1>
    <table>
      <tr>
        <th>소속</th><td>${escapeHtml(app.affiliation)}</td>
        <th>직급</th><td>${escapeHtml(app.rank)}</td>
      </tr>
      <tr>
        <th>이름</th><td>${escapeHtml(app.name)}</td>
        <th>성별</th><td>${escapeHtml(app.gender)}</td>
      </tr>
    </table>
    <div class="doc-body">
      <p>위 신청인은 공무원 직장협의회의 설립·운영에 관한 법률 시행령 제6조 제1항의 규정에 의거 고용노동부공무원직장협의회의 회원으로 가입하고자 합니다.</p>
      <p>(급여에서 매월 직장협의회가 정하는 회비를 원천 공제하는 것에 동의함 : e-사람에서 개별 조치 또는 별도 납부)</p>
      <p>※ 소속 기관에 직협이 설립되어 전국 조직에 회비 납부 시까지 직장협의회 회비를 전국 조직에 직접 납부하는 것에 동의함.</p>
    </div>
    <div class="doc-sign-block">
      <p class="doc-date">${formatKrDate(app.applicationDate || app.joinDate)}</p>
      <p class="doc-sign-line">
        신청인&nbsp;&nbsp;<span class="doc-name">${escapeHtml(app.name)}</span>&nbsp;&nbsp;
        <span class="sig-box">${sigImg(sig1, "서명")}</span>
      </p>
    </div>
    <p class="doc-recipient">고용노동부공무원직장협의회 귀중</p>
  </div>`;
  return wrapDocument(`가입신청서 - ${app.name || ""}`, body);
}

export function buildWithholdingDocumentHtml({ application = {}, withholding = {}, sig2 }) {
  const app = application;
  const wh = withholding;
  const body = `
  <div class="doc-page">
    <h1 class="doc-title">원천징수 동의(신규)서<sup>1)</sup></h1>
    <table>
      <tr>
        <th>소속</th><td>${escapeHtml(wh.affiliation || app.affiliation)}</td>
        <th>직급</th><td>${escapeHtml(wh.rank || app.rank)}</td>
      </tr>
      <tr>
        <th>성명</th><td>${escapeHtml(wh.name || app.name)}</td>
        <th>생년월일</th><td>${escapeHtml(wh.dob ? formatPeriodDate(wh.dob) : "—")}</td>
      </tr>
    </table>
    <p class="doc-period">기간&nbsp;&nbsp;${escapeHtml(formatPeriodDate(wh.periodStart))}</p>
    <table>
      <thead>
        <tr>
          <th>구분</th><th>동의사항</th><th>금액(단위:원)</th><th>동의사유 등</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>신규신청(동의)</td><td>직협회비</td><td>봉급의 0.6%</td><td>직협회비 납부 동의</td>
        </tr>
      </tbody>
    </table>
    <div class="doc-body">
      <p>본인은 「공무원보수규정」 제19조의2제1항제5호의 규정에 따라 상기 내역이 매월 본인의 보수에서 원천징수되는 것을 동의(또는 변경, 철회) 합니다.</p>
    </div>
    <div class="doc-sign-block">
      <p class="doc-date">${formatKrDate(wh.consentDate)}</p>
      <p class="doc-sign-line">
        신청인 성명&nbsp;&nbsp;<span class="doc-name">${escapeHtml(wh.name || app.name)}</span>&nbsp;&nbsp;
        <span class="sig-box">${sigImg(sig2, "서명")}</span>
      </p>
      <p class="doc-sig-note">※ (인)은 자필 서명으로 한다.</p>
    </div>
    <p class="doc-recipient doc-recipient-office">( ${escapeHtml(wh.regionalOffice || "　　　")} )지방고용노동청 지출관 귀하</p>
    <div class="doc-footnotes">
      <p>1) 동의사항은 1건당 1매의 서식을 작성합니다.</p>
      <p>2) 동의사유 등란에는 동의사항에 대한 구체적인 사유를 기재합니다.</p>
      <p>3) 동의(또는 변경, 철회)는 해당 동의사항에 대하여만 효력이 있습니다.</p>
      <p>4) 기간란을 기재하지 않은 경우에는 1년간의 효력이 있는 것으로 봅니다.</p>
      <p>5) 동의(또는 변경, 철회)를 철회하고자 하는 경우에는 별도의 서식을 작성하여 제출합니다.</p>
    </div>
  </div>`;
  return wrapDocument(`원천징수 동의서 - ${wh.name || app.name || ""}`, body);
}

/** @deprecated 호환용 — 두 서식 HTML을 이어 붙인 버전 */
export function buildSignupDocumentHtml(props) {
  const { application, withholding, sig1, sig2 } = resolveSignupData(props);
  const appHtml = buildApplicationDocumentHtml({ application, sig1 });
  const whHtml = buildWithholdingDocumentHtml({ application, withholding, sig2 });
  const appBody = appHtml.match(/<body>([\s\S]*)<\/body>/i)?.[1] || "";
  const whBody = whHtml.match(/<body>([\s\S]*)<\/body>/i)?.[1] || "";
  return wrapDocument(
    `직협 가입신청 - ${application.name || ""}`,
    `${appBody}<p style="text-align:center;color:#999;margin:24px 0;">─────────── 절 취 선 ───────────</p>${whBody}`
  );
}

function downloadFile(html, filename, format) {
  const mime = format === "doc" ? "application/msword" : "text/html;charset=utf-8";
  triggerFileDownload(html, filename, mime);
}

export function downloadApplicationDocument(props, format = "doc") {
  const { application, withholding, sig1 } = resolveSignupData(props);
  const html = buildApplicationDocumentHtml({ application, sig1 });
  const ext = format === "doc" ? "doc" : "html";
  downloadFile(html, getApplicationFilename(application, withholding, ext), format);
}

export function downloadWithholdingDocument(props, format = "doc") {
  const { application, withholding, sig2 } = resolveSignupData(props);
  const html = buildWithholdingDocumentHtml({ application, withholding, sig2 });
  const ext = format === "doc" ? "doc" : "html";
  downloadFile(html, getWithholdingFilename(application, withholding, ext), format);
}

/** 가입신청서 + 원천징수동의서 각 1페이지씩 Word 파일 2개 다운로드 */
export function downloadSignupDocument(props) {
  downloadApplicationDocument(props, "doc");
  setTimeout(() => downloadWithholdingDocument(props, "doc"), 350);
}

export function downloadSignupDocumentAsWord(props) {
  downloadSignupDocument(props);
}

export function downloadSignupDocumentAsHtml(props) {
  downloadApplicationDocument(props, "html");
  setTimeout(() => downloadWithholdingDocument(props, "html"), 350);
}
