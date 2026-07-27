async function getHtml2Pdf() {
  const mod = await import("html2pdf.js");
  return mod.default;
}

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
  return `<img src="${sig}" alt="${escapeHtml(alt)}" />`;
}

const DOC_STYLES = `
  * { box-sizing: border-box; }
  body {
    margin: 0;
    padding: 32px 24px;
    font-family: "Malgun Gothic", "Apple SD Gothic Neo", sans-serif;
    font-size: 12.5px;
    color: #3e3232;
    line-height: 1.7;
    background: #fff;
  }
  .doc-page {
    max-width: 640px;
    margin: 0 auto 48px;
    padding-bottom: 32px;
    page-break-after: always;
  }
  .doc-page:last-child { page-break-after: auto; margin-bottom: 0; }
  .doc-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
  .doc-attach { font-size: 12px; color: #666; }
  .doc-title {
    font-size: 22px;
    font-weight: 800;
    text-align: center;
    letter-spacing: 0.08em;
    margin: 0 0 20px;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 18px;
    font-size: 13px;
  }
  th, td {
    border: 1px solid #c8bdb4;
    padding: 9px 12px;
    vertical-align: middle;
  }
  th {
    background: #f5f0eb;
    font-weight: 700;
    text-align: center;
    white-space: nowrap;
    width: 15%;
  }
  .doc-body { font-size: 14pt; line-height: 1.85; }
  .doc-body p { margin: 0 0 8px; }
  .doc-period { margin: 0 0 18px; font-size: 13px; }
  .doc-sign-block { margin-top: 28px; text-align: right; }
  .doc-date { margin: 0 0 16px; font-size: 13px; }
  .doc-sign-line {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    font-size: 13px;
  }
  .doc-name { min-width: 80px; text-align: center; font-weight: 600; }
  .sig-box {
    width: 100px;
    height: 48px;
    border: 1px solid #c8bdb4;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }
  .sig-box img { max-width: 100%; max-height: 100%; object-fit: contain; }
  .sig-placeholder { color: #999; font-size: 12px; }
  .doc-recipient { margin-top: 28px; font-size: 25pt; font-weight: 700; text-align: center; }
  .doc-recipient-office { text-align: left; margin-top: 20px; font-size: 25pt; font-weight: 700; }
  .doc-sig-note { margin: 8px 0 0; font-size: 11px; color: #666; text-align: right; }
  .doc-footnotes { margin-top: 24px; font-size: 11px; color: #666; line-height: 1.8; }
  .doc-footnotes p { margin: 0 0 3px; }
  .doc-cut-line {
    max-width: 640px;
    margin: 0 auto 32px;
    text-align: center;
    color: #999;
    font-size: 12px;
    letter-spacing: 0.1em;
  }
`;

function resolveSignupData(props) {
  const application = props.application || props.member || {};
  const withholding = props.withholding || props.bank || {};
  return { application, withholding, sig1: props.sig1, sig2: props.sig2 };
}

function getSignupPdfFilename(application, withholding) {
  const name = application.name || withholding.name || "신청서";
  const date = (application.applicationDate || new Date().toISOString().slice(0, 10)).replace(/-/g, "");
  return `직협가입신청_${name}_${date}.pdf`;
}

function waitForImages(root) {
  const images = [...root.querySelectorAll("img")];
  if (!images.length) return Promise.resolve();
  return Promise.all(
    images.map(
      (img) =>
        new Promise((resolve) => {
          if (img.complete) resolve();
          else {
            img.onload = resolve;
            img.onerror = resolve;
          }
        })
    )
  );
}

async function renderElementToPdf(element, filename) {
  const html2pdf = await getHtml2Pdf();
  await html2pdf()
    .set({
      margin: [10, 10, 10, 10],
      filename,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false, scrollY: 0 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      pagebreak: { mode: ["css", "legacy"], before: ".doc-page + .doc-cut-line" },
    })
    .from(element)
    .save();
}

async function renderHtmlToPdf(html, filename) {
  const iframe = document.createElement("iframe");
  iframe.setAttribute("aria-hidden", "true");
  Object.assign(iframe.style, {
    position: "fixed",
    left: "-10000px",
    top: "0",
    width: "794px",
    height: "0",
    border: "none",
    visibility: "hidden",
  });
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument;
  doc.open();
  doc.write(html);
  doc.close();

  await new Promise((resolve) => {
    if (doc.readyState === "complete") resolve();
    else iframe.onload = resolve;
  });
  await waitForImages(doc.body);
  await new Promise((resolve) => setTimeout(resolve, 150));

  try {
    await renderElementToPdf(doc.body, filename);
  } finally {
    document.body.removeChild(iframe);
  }
}

export function buildSignupDocumentHtml({ application = {}, withholding = {}, sig1, sig2 }) {
  const app = application;
  const wh = withholding;

  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>직협 가입신청서 - ${escapeHtml(app.name || wh.name || "")}</title>
  <style>${DOC_STYLES}</style>
</head>
<body>
  <div class="doc-page">
    <div class="doc-top">
      <span class="doc-attach">[별지 제2호서식]</span>
    </div>
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
      <div class="doc-sign-line">
        <span>신청인</span>
        <span class="doc-name">${escapeHtml(app.name)}</span>
        <span class="sig-box">${sigImg(sig1, "서명")}</span>
      </div>
    </div>
    <p class="doc-recipient">고용노동부공무원직장협의회 귀중</p>
  </div>

  <div class="doc-cut-line">─────────── 절 취 선 ───────────</div>

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
      <div class="doc-sign-line">
        <span>신청인 성명</span>
        <span class="doc-name">${escapeHtml(wh.name || app.name)}</span>
        <span class="sig-box">${sigImg(sig2, "서명")}</span>
      </div>
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
  </div>
</body>
</html>`;
}

export async function downloadSignupDocument(props) {
  const { application, withholding, sig1, sig2 } = resolveSignupData(props);
  const html = buildSignupDocumentHtml({ application, withholding, sig1, sig2 });
  const filename = getSignupPdfFilename(application, withholding);
  await renderHtmlToPdf(html, filename);
}

export async function downloadSignupDocumentFromElement(element, props) {
  if (!element) throw new Error("PDF로 변환할 문서 영역을 찾을 수 없습니다.");
  const { application, withholding } = resolveSignupData(props);
  const filename = getSignupPdfFilename(application, withholding);
  await renderElementToPdf(element, filename);
}
