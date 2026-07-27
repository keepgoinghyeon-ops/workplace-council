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
  if (!sig) return `<span class="doc-sig-ph">(인)</span>`;
  return `<img src="${sig}" alt="${escapeHtml(alt)}" class="doc-sig-img" />`;
}

/** A4 중앙 배치 — 인쇄·PDF 공통 */
const DOC_STYLES = `
  @page { size: A4 portrait; margin: 12mm; }
  * { box-sizing: border-box; }
  html { margin: 0; padding: 0; }
  body {
    margin: 0;
    padding: 0;
    width: 210mm;
    height: 297mm;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: "Malgun Gothic", "Apple SD Gothic Neo", sans-serif;
    font-size: 11pt;
    color: #000;
    background: #fff;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  body.doc-multi {
    display: block;
    width: 210mm;
    height: auto;
    min-height: auto;
  }
  body.doc-multi .doc-sheet {
    width: 210mm;
    height: 297mm;
    display: flex;
    align-items: center;
    justify-content: center;
    page-break-after: always;
    break-after: page;
  }
  body.doc-multi .doc-sheet:last-child {
    page-break-after: auto;
    break-after: auto;
  }
  .doc-page-a4 {
    width: 186mm;
    max-width: 186mm;
    padding: 4mm 2mm;
  }
  .doc-attach {
    font-size: 10pt;
    color: #333;
    margin: 0 0 10mm;
  }
  .doc-title-official {
    font-size: 17pt;
    font-weight: 800;
    text-align: center;
    letter-spacing: 0.12em;
    margin: 0 0 8mm;
    line-height: 1.4;
  }
  .doc-tbl {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 5mm;
    font-size: 11pt;
    table-layout: fixed;
  }
  .doc-tbl th,
  .doc-tbl td {
    border: 1px solid #000;
    padding: 7px 8px;
    vertical-align: middle;
    word-break: keep-all;
  }
  .doc-tbl th {
    width: 18%;
    font-weight: 700;
    text-align: center;
    background: #fff;
    letter-spacing: 0.15em;
  }
  .doc-tbl td {
    text-align: left;
    min-height: 32px;
  }
  .doc-body-text {
    font-size: 14pt;
    line-height: 1.9;
    margin: 5mm 0 8mm;
    text-align: justify;
  }
  .doc-body-text p { margin: 0 0 6px; }
  .doc-sign-area {
    margin-top: 10mm;
    text-align: right;
    font-size: 11pt;
  }
  .doc-sign-date {
    margin: 0 0 8mm;
    letter-spacing: 0.05em;
  }
  .doc-sign-line {
    margin: 0;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;
  }
  .doc-sign-name {
    min-width: 70px;
    text-align: center;
    font-weight: 600;
  }
  .doc-sig-box {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 22mm;
    height: 12mm;
    border: 1px solid #000;
    vertical-align: middle;
  }
  .doc-sig-img {
    max-width: 20mm;
    max-height: 11mm;
    object-fit: contain;
  }
  .doc-sig-ph {
    color: #666;
    font-size: 10pt;
  }
  .doc-sig-note {
    margin: 4px 0 0;
    font-size: 9pt;
    color: #333;
  }
  .doc-recipient-main {
    margin-top: 12mm;
    font-size: 25pt;
    font-weight: 700;
    text-align: center;
    letter-spacing: 0.02em;
    line-height: 1.35;
  }
  .doc-recipient-office {
    margin-top: 10mm;
    font-size: 25pt;
    font-weight: 700;
    text-align: left;
    letter-spacing: 0.02em;
    line-height: 1.35;
  }
  @media print {
    body.doc-multi { height: auto; }
    body.doc-multi .doc-sheet {
      page-break-after: always;
      break-after: page;
    }
    .doc-page-a4 {
      page-break-inside: avoid;
    }
  }
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

function getCombinedFilename(application, withholding) {
  return `가입신청_원천징수_${getBaseName(application, withholding)}_${getDateKey(application)}.pdf`;
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

function wrapDocument(title, bodyHtml, { multiPage = false } = {}) {
  const bodyClass = multiPage ? ' class="doc-multi"' : "";
  return `<!DOCTYPE html>
<html lang="ko" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word">
<head>
  <meta charset="UTF-8" />
  <meta name="ProgId" content="Word.Document" />
  <title>${escapeHtml(title)}</title>
  <style>${DOC_STYLES}</style>
</head>
<body${bodyClass}>
${bodyHtml}
</body>
</html>`;
}

function applicationPageInner({ application = {}, sig1 }) {
  const app = application;
  return `
  <div class="doc-page-a4">
    <p class="doc-attach">[별지 제2호서식]</p>
    <h1 class="doc-title-official">공무원직장협의회 가입신청서</h1>
    <table class="doc-tbl">
      <tr>
        <th>소&nbsp;&nbsp;&nbsp;속</th>
        <td colspan="3">${escapeHtml(app.affiliation)}</td>
      </tr>
      <tr>
        <th>직&nbsp;&nbsp;&nbsp;급</th>
        <td colspan="3">${escapeHtml(app.rank)}</td>
      </tr>
      <tr>
        <th>이&nbsp;&nbsp;&nbsp;름</th>
        <td>${escapeHtml(app.name)}</td>
        <th>성&nbsp;&nbsp;&nbsp;별</th>
        <td>${escapeHtml(app.gender)}</td>
      </tr>
    </table>
    <div class="doc-body-text">
      <p>위 신청인은 공무원 직장협의회의 설립·운영에 관한 법률 시행령 제6조 제1항의 규정에 의거 고용노동부공무원직장협의회의 회원으로 가입하고자 합니다.</p>
      <p>(급여에서 매월 직장협의회가 정하는 회비를 원천 공제하는 것에 동의함 : e-사람에서 개별 조치 또는 별도 납부)</p>
      <p>※ 소속 기관에 직협이 설립되어 전국 조직에 회비 납부 시까지 직장협의회 회비를 전국 조직에 직접 납부하는 것에 동의함.</p>
    </div>
    <div class="doc-sign-area">
      <p class="doc-sign-date">${formatKrDate(app.applicationDate || app.joinDate)}</p>
      <p class="doc-sign-line">
        <span>신청인</span>
        <span class="doc-sign-name">${escapeHtml(app.name)}</span>
        <span class="doc-sig-box">${sigImg(sig1, "서명")}</span>
      </p>
    </div>
    <p class="doc-recipient-main">고용노동부공무원직장협의회 귀중</p>
  </div>`;
}

function withholdingPageInner({ application = {}, withholding = {}, sig2 }) {
  const app = application;
  const wh = withholding;
  const periodText = wh.periodStart ? formatPeriodDate(wh.periodStart) : ".  .  .";
  const name = wh.name || app.name;
  return `
  <div class="doc-page-a4">
    <h1 class="doc-title-official">원천징수 동의(신규)서<sup>1)</sup></h1>
    <table class="doc-tbl">
      <tr>
        <th>소&nbsp;&nbsp;&nbsp;속</th>
        <td colspan="3">${escapeHtml(wh.affiliation || app.affiliation)}</td>
      </tr>
      <tr>
        <th>직&nbsp;&nbsp;&nbsp;급</th>
        <td colspan="3">${escapeHtml(wh.rank || app.rank)}</td>
      </tr>
      <tr>
        <th>성&nbsp;&nbsp;&nbsp;명</th>
        <td>${escapeHtml(name)}</td>
        <th>생년월일</th>
        <td>${escapeHtml(wh.dob ? formatPeriodDate(wh.dob) : "")}</td>
      </tr>
    </table>
    <div class="doc-body-text">
      <p>구분: 신규신청(동의) / 동의사항: 직협회비 / 금액(단위:원): 봉급의 0.6% / 기간: ${escapeHtml(periodText)} / 동의사유: 직협회비 납부 동의</p>
      <p>본인은 「공무원보수규정」 제19조의2제1항제5호의 규정에 따라 상기 내역이 매월 본인의 보수에서 원천징수되는 것을 동의(또는 변경, 철회) 합니다.</p>
      <p>1) 동의사항은 1건당 1매의 서식을 작성합니다.</p>
      <p>2) 동의사유 등란에는 동의사항에 대한 구체적인 사유를 기재합니다.</p>
      <p>3) 동의(또는 변경, 철회)는 해당 동의사항에 대하여만 효력이 있습니다.</p>
      <p>4) 기간란을 기재하지 않은 경우에는 1년간의 효력이 있는 것으로 봅니다.</p>
      <p>5) 동의(또는 변경, 철회)를 철회하고자 하는 경우에는 별도의 서식을 작성하여 제출합니다.</p>
    </div>
    <div class="doc-sign-area">
      <p class="doc-sign-date">${formatKrDate(wh.consentDate)}</p>
      <p class="doc-sign-line">
        <span>신청인 성명</span>
        <span class="doc-sign-name">${escapeHtml(name)}</span>
        <span class="doc-sig-box">${sigImg(sig2, "서명")}</span>
      </p>
      <p class="doc-sig-note">※ (인)은 자필 서명으로 한다.</p>
    </div>
    <p class="doc-recipient-office">( ${escapeHtml(wh.regionalOffice || "　　　")} )지방고용노동청 지출관 귀하</p>
  </div>`;
}

export function buildApplicationDocumentHtml(props) {
  const { application, sig1 } = resolveSignupData(props);
  return wrapDocument(`가입신청서 - ${application.name || ""}`, applicationPageInner({ application, sig1 }));
}

export function buildWithholdingDocumentHtml(props) {
  const { application, withholding, sig2 } = resolveSignupData(props);
  return wrapDocument(
    `원천징수 동의서 - ${withholding.name || application.name || ""}`,
    withholdingPageInner({ application, withholding, sig2 })
  );
}

export function buildCombinedSignupDocumentHtml(props) {
  const data = resolveSignupData(props);
  const body = `
  <div class="doc-sheet">${applicationPageInner(data)}</div>
  <div class="doc-sheet">${withholdingPageInner(data)}</div>`;
  return wrapDocument(`가입신청 - ${getBaseName(data.application, data.withholding)}`, body, { multiPage: true });
}

function downloadFile(html, filename, format) {
  const mime = format === "doc" ? "application/msword" : "text/html;charset=utf-8";
  triggerFileDownload(html, filename, mime);
}

function openPrintWindow(html) {
  const win = window.open("", "_blank", "width=900,height=1200");
  if (!win) {
    throw new Error("팝업이 차단되었습니다. 브라우저에서 팝업을 허용해 주세요.");
  }
  win.document.open();
  win.document.write(html);
  win.document.close();
  win.focus();
  const doPrint = () => {
    win.print();
    win.onafterprint = () => win.close();
  };
  const wait = () => setTimeout(doPrint, 400);
  if (win.document.readyState === "complete") wait();
  else win.onload = wait;
}

async function getHtml2Pdf() {
  const mod = await import("html2pdf.js");
  return mod.default;
}

function waitForImages(root) {
  const images = [...root.querySelectorAll("img")];
  if (!images.length) return Promise.resolve();
  return Promise.all(
    images.map(
      (img) =>
        new Promise((resolve) => {
          if (img.complete && img.naturalWidth > 0) resolve();
          else {
            img.onload = resolve;
            img.onerror = resolve;
            setTimeout(resolve, 800);
          }
        })
    )
  );
}

async function renderHtmlToPdf(html, filename, { pages = 1 } = {}) {
  const pageHeight = 1123;
  const totalHeight = pageHeight * pages;
  const iframe = document.createElement("iframe");
  iframe.setAttribute("aria-hidden", "true");
  Object.assign(iframe.style, {
    position: "fixed",
    left: "-10000px",
    top: "0",
    width: "794px",
    height: `${totalHeight}px`,
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
  await new Promise((resolve) => setTimeout(resolve, 350));

  try {
    const html2pdf = await getHtml2Pdf();
    await html2pdf()
      .set({
        margin: 0,
        filename,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          logging: false,
          scrollY: 0,
          width: 794,
          height: totalHeight,
          windowWidth: 794,
          windowHeight: totalHeight,
        },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        pagebreak: { mode: ["css", "legacy"], after: ".doc-sheet" },
      })
      .from(doc.body)
      .save();
  } finally {
    document.body.removeChild(iframe);
  }
}

export async function downloadSignupDocumentPdf(props) {
  const { application, withholding } = resolveSignupData(props);
  const html = buildCombinedSignupDocumentHtml(props);
  await renderHtmlToPdf(html, getCombinedFilename(application, withholding), { pages: 2 });
}

export function printSignupDocument(props) {
  openPrintWindow(buildCombinedSignupDocumentHtml(props));
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

export function downloadSignupDocument(props) {
  return downloadSignupDocumentPdf(props);
}

export function downloadSignupDocumentAsWord(props) {
  downloadApplicationDocument(props, "doc");
  setTimeout(() => downloadWithholdingDocument(props, "doc"), 400);
}

export function downloadSignupDocumentAsHtml(props) {
  downloadApplicationDocument(props, "html");
  setTimeout(() => downloadWithholdingDocument(props, "html"), 400);
}

export { DOC_STYLES };
