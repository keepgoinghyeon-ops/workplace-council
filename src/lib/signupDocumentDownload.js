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
  if (!sig) return `<span style="color:#999;font-size:10pt;line-height:44px;">(인)</span>`;
  return `<img src="${sig}" alt="${escapeHtml(alt)}" width="96" height="44" style="max-width:96px;max-height:44px;" />`;
}

const DOC_STYLES = `
  @page { size: A4 portrait; margin: 18mm; }
  html, body {
    margin: 0;
    padding: 0;
    font-family: "Malgun Gothic", "Apple SD Gothic Neo", sans-serif;
    font-size: 12.5pt;
    color: #3e3232;
    line-height: 1.7;
  }
  .doc-sheet {
    max-width: 640px;
    margin: 0 auto;
    padding: 8mm 0;
  }
  @media print {
    html, body { padding: 0; }
    .doc-sheet { padding: 0; page-break-after: avoid; page-break-inside: avoid; }
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
  <div class="doc-sheet">
    <p style="font-size:11pt;color:#666;margin:0 0 12px;">[별지 제2호서식]</p>
    <h1 style="font-size:18pt;font-weight:800;text-align:center;letter-spacing:0.08em;margin:0 0 18px;">공무원직장협의회 가입신청서</h1>
    <table style="width:100%;border-collapse:collapse;margin-bottom:16px;font-size:11pt;">
      <tr>
        <th style="border:1px solid #999;padding:8px 10px;background:#f0f0f0;width:15%;">소속</th>
        <td style="border:1px solid #999;padding:8px 10px;">${escapeHtml(app.affiliation)}</td>
        <th style="border:1px solid #999;padding:8px 10px;background:#f0f0f0;width:15%;">직급</th>
        <td style="border:1px solid #999;padding:8px 10px;">${escapeHtml(app.rank)}</td>
      </tr>
      <tr>
        <th style="border:1px solid #999;padding:8px 10px;background:#f0f0f0;">이름</th>
        <td style="border:1px solid #999;padding:8px 10px;">${escapeHtml(app.name)}</td>
        <th style="border:1px solid #999;padding:8px 10px;background:#f0f0f0;">성별</th>
        <td style="border:1px solid #999;padding:8px 10px;">${escapeHtml(app.gender)}</td>
      </tr>
    </table>
    <div style="font-size:14pt;line-height:1.85;margin:14px 0;">
      <p style="margin:0 0 8px;">위 신청인은 공무원 직장협의회의 설립·운영에 관한 법률 시행령 제6조 제1항의 규정에 의거 고용노동부공무원직장협의회의 회원으로 가입하고자 합니다.</p>
      <p style="margin:0 0 8px;">(급여에서 매월 직장협의회가 정하는 회비를 원천 공제하는 것에 동의함 : e-사람에서 개별 조치 또는 별도 납부)</p>
      <p style="margin:0 0 8px;">※ 소속 기관에 직협이 설립되어 전국 조직에 회비 납부 시까지 직장협의회 회비를 전국 조직에 직접 납부하는 것에 동의함.</p>
    </div>
    <div style="margin-top:24px;text-align:right;">
      <p style="margin:0 0 14px;font-size:11pt;">${formatKrDate(app.applicationDate || app.joinDate)}</p>
      <p style="margin:0;font-size:11pt;">
        신청인&nbsp;&nbsp;<strong>${escapeHtml(app.name)}</strong>&nbsp;&nbsp;
        <span style="display:inline-block;width:96px;height:44px;border:1px solid #999;vertical-align:middle;text-align:center;">${sigImg(sig1, "서명")}</span>
      </p>
    </div>
    <p style="margin-top:28px;font-size:25pt;font-weight:700;text-align:center;">고용노동부공무원직장협의회 귀중</p>
  </div>`;
  return wrapDocument(`가입신청서 - ${app.name || ""}`, body);
}

export function buildWithholdingDocumentHtml({ application = {}, withholding = {}, sig2 }) {
  const app = application;
  const wh = withholding;
  const body = `
  <div class="doc-sheet">
    <h1 style="font-size:18pt;font-weight:800;text-align:center;letter-spacing:0.08em;margin:0 0 18px;">원천징수 동의(신규)서<sup>1)</sup></h1>
    <table style="width:100%;border-collapse:collapse;margin-bottom:16px;font-size:11pt;">
      <tr>
        <th style="border:1px solid #999;padding:8px 10px;background:#f0f0f0;width:15%;">소속</th>
        <td style="border:1px solid #999;padding:8px 10px;">${escapeHtml(wh.affiliation || app.affiliation)}</td>
        <th style="border:1px solid #999;padding:8px 10px;background:#f0f0f0;width:15%;">직급</th>
        <td style="border:1px solid #999;padding:8px 10px;">${escapeHtml(wh.rank || app.rank)}</td>
      </tr>
      <tr>
        <th style="border:1px solid #999;padding:8px 10px;background:#f0f0f0;">성명</th>
        <td style="border:1px solid #999;padding:8px 10px;">${escapeHtml(wh.name || app.name)}</td>
        <th style="border:1px solid #999;padding:8px 10px;background:#f0f0f0;">생년월일</th>
        <td style="border:1px solid #999;padding:8px 10px;">${escapeHtml(wh.dob ? formatPeriodDate(wh.dob) : "—")}</td>
      </tr>
    </table>
    <p style="margin:0 0 16px;font-size:11pt;">기간&nbsp;&nbsp;${escapeHtml(formatPeriodDate(wh.periodStart))}</p>
    <table style="width:100%;border-collapse:collapse;margin-bottom:16px;font-size:11pt;">
      <thead>
        <tr>
          <th style="border:1px solid #999;padding:8px 10px;background:#f0f0f0;">구분</th>
          <th style="border:1px solid #999;padding:8px 10px;background:#f0f0f0;">동의사항</th>
          <th style="border:1px solid #999;padding:8px 10px;background:#f0f0f0;">금액(단위:원)</th>
          <th style="border:1px solid #999;padding:8px 10px;background:#f0f0f0;">동의사유 등</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="border:1px solid #999;padding:8px 10px;text-align:center;">신규신청(동의)</td>
          <td style="border:1px solid #999;padding:8px 10px;text-align:center;">직협회비</td>
          <td style="border:1px solid #999;padding:8px 10px;text-align:center;">봉급의 0.6%</td>
          <td style="border:1px solid #999;padding:8px 10px;text-align:center;">직협회비 납부 동의</td>
        </tr>
      </tbody>
    </table>
    <div style="font-size:14pt;line-height:1.85;margin:14px 0;">
      <p style="margin:0 0 8px;">본인은 「공무원보수규정」 제19조의2제1항제5호의 규정에 따라 상기 내역이 매월 본인의 보수에서 원천징수되는 것을 동의(또는 변경, 철회) 합니다.</p>
    </div>
    <div style="margin-top:24px;text-align:right;">
      <p style="margin:0 0 14px;font-size:11pt;">${formatKrDate(wh.consentDate)}</p>
      <p style="margin:0;font-size:11pt;">
        신청인 성명&nbsp;&nbsp;<strong>${escapeHtml(wh.name || app.name)}</strong>&nbsp;&nbsp;
        <span style="display:inline-block;width:96px;height:44px;border:1px solid #999;vertical-align:middle;text-align:center;">${sigImg(sig2, "서명")}</span>
      </p>
      <p style="margin:8px 0 0;font-size:9pt;color:#666;">※ (인)은 자필 서명으로 한다.</p>
    </div>
    <p style="margin-top:24px;font-size:25pt;font-weight:700;text-align:left;">( ${escapeHtml(wh.regionalOffice || "　　　")} )지방고용노동청 지출관 귀하</p>
    <div style="margin-top:20px;font-size:9pt;color:#666;line-height:1.7;">
      <p style="margin:0 0 3px;">1) 동의사항은 1건당 1매의 서식을 작성합니다.</p>
      <p style="margin:0 0 3px;">2) 동의사유 등란에는 동의사항에 대한 구체적인 사유를 기재합니다.</p>
      <p style="margin:0 0 3px;">3) 동의(또는 변경, 철회)는 해당 동의사항에 대하여만 효력이 있습니다.</p>
      <p style="margin:0 0 3px;">4) 기간란을 기재하지 않은 경우에는 1년간의 효력이 있는 것으로 봅니다.</p>
      <p style="margin:0 0 3px;">5) 동의(또는 변경, 철회)를 철회하고자 하는 경우에는 별도의 서식을 작성하여 제출합니다.</p>
    </div>
  </div>`;
  return wrapDocument(`원천징수 동의서 - ${wh.name || app.name || ""}`, body);
}

function downloadFile(html, filename, format) {
  const mime = format === "doc" ? "application/msword" : "text/html;charset=utf-8";
  triggerFileDownload(html, filename, mime);
}

function openPrintWindow(html) {
  const win = window.open("", "_blank", "width=820,height=900");
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
  if (win.document.readyState === "complete") {
    setTimeout(doPrint, 300);
  } else {
    win.onload = () => setTimeout(doPrint, 300);
  }
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

async function renderHtmlToPdf(html, filename) {
  const iframe = document.createElement("iframe");
  iframe.setAttribute("aria-hidden", "true");
  Object.assign(iframe.style, {
    position: "fixed",
    left: "-10000px",
    top: "0",
    width: "794px",
    height: "1123px",
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
  await new Promise((resolve) => setTimeout(resolve, 300));

  try {
    const html2pdf = await getHtml2Pdf();
    const target = doc.body.querySelector(".doc-sheet") || doc.body;
    await html2pdf()
      .set({
        margin: [8, 8, 8, 8],
        filename,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          logging: false,
          scrollY: 0,
          windowWidth: 794,
        },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        pagebreak: { mode: ["avoid-all"] },
      })
      .from(target)
      .save();
  } finally {
    document.body.removeChild(iframe);
  }
}

export async function downloadApplicationDocumentPdf(props) {
  const { application, withholding, sig1 } = resolveSignupData(props);
  const html = buildApplicationDocumentHtml({ application, sig1 });
  await renderHtmlToPdf(html, getApplicationFilename(application, withholding, "pdf"));
}

export async function downloadWithholdingDocumentPdf(props) {
  const { application, withholding, sig2 } = resolveSignupData(props);
  const html = buildWithholdingDocumentHtml({ application, withholding, sig2 });
  await renderHtmlToPdf(html, getWithholdingFilename(application, withholding, "pdf"));
}

export async function downloadSignupDocumentPdf(props) {
  await downloadApplicationDocumentPdf(props);
  await new Promise((resolve) => setTimeout(resolve, 600));
  await downloadWithholdingDocumentPdf(props);
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

export function printApplicationDocument(props) {
  const { application, sig1 } = resolveSignupData(props);
  openPrintWindow(buildApplicationDocumentHtml({ application, sig1 }));
}

export function printWithholdingDocument(props) {
  const { application, withholding, sig2 } = resolveSignupData(props);
  openPrintWindow(buildWithholdingDocumentHtml({ application, withholding, sig2 }));
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
