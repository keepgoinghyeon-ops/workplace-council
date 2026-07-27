import { useState } from "react";
import { ApplicationDocumentPage, WithholdingDocumentPage } from "./SignupDocumentContent";
import {
  downloadSignupDocumentPdf,
  downloadSignupDocumentAsWord,
} from "../lib/signupDocumentDownload";

function resolveData(props) {
  const application = props.application || props.member || {};
  const withholding = props.withholding || props.bank || {};
  return { application, withholding, sig1: props.sig1, sig2: props.sig2 };
}

export default function SignupPrintDocument(props) {
  const { application, withholding, sig1, sig2 } = resolveData(props);
  const data = { application, withholding, sig1, sig2 };
  const [pdfLoading, setPdfLoading] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handlePdfDownload = async () => {
    setPdfLoading(true);
    try {
      await downloadSignupDocumentPdf(data);
    } catch (err) {
      alert(err.message || "PDF 저장에 실패했습니다.");
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <div className="print-overlay">
      <div className="print-modal print-modal--wide">
        <div className="print-toolbar no-print">
          <span style={{ fontWeight: 700, fontSize: 15 }}>📄 신청서 미리보기 (A4 2페이지)</span>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button type="button" className="btn btn-primary" onClick={handlePrint}>
              인쇄 (2페이지)
            </button>
            <button type="button" className="btn btn-outline" disabled={pdfLoading} onClick={handlePdfDownload}>
              {pdfLoading ? "PDF 저장 중..." : "PDF 다운로드 (서명 포함)"}
            </button>
            <button type="button" className="btn btn-outline" onClick={() => downloadSignupDocumentAsWord(data)}>
              Word (서명 미포함)
            </button>
            <button type="button" className="btn btn-outline" onClick={props.onClose}>닫기</button>
          </div>
        </div>

        <div className="print-area print-area--combined" id="print-area">
          <div className="doc-sheet">
            <ApplicationDocumentPage application={application} sig1={sig1} />
          </div>
          <div className="doc-sheet">
            <WithholdingDocumentPage application={application} withholding={withholding} sig2={sig2} />
          </div>
        </div>
      </div>
    </div>
  );
}
