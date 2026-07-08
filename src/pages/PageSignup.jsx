import { useState, useRef, useEffect } from "react";
import { submitSignupApplication, isSignupApiConfigured } from "../lib/signupApi";

function SignaturePad({ label, onChange }) {
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const [hasSignature, setHasSignature] = useState(false);

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const src = e.touches ? e.touches[0] : e;
    return {
      x: (src.clientX - rect.left) * (canvas.width / rect.width),
      y: (src.clientY - rect.top) * (canvas.height / rect.height),
    };
  };
  const start = (e) => { e.preventDefault(); drawing.current = true; const c = canvasRef.current; const ctx = c.getContext("2d"); const p = getPos(e, c); ctx.beginPath(); ctx.moveTo(p.x, p.y); };
  const draw = (e) => { e.preventDefault(); if (!drawing.current) return; const c = canvasRef.current; const ctx = c.getContext("2d"); const p = getPos(e, c); ctx.lineTo(p.x, p.y); ctx.strokeStyle = "#3e3232"; ctx.lineWidth = 2.5; ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.stroke(); setHasSignature(true); onChange(c.toDataURL()); };
  const stop = (e) => { e.preventDefault(); drawing.current = false; };
  const clear = () => { const c = canvasRef.current; c.getContext("2d").clearRect(0, 0, c.width, c.height); setHasSignature(false); onChange(null); };

  useEffect(() => {
    const c = canvasRef.current;
    c.addEventListener("touchstart", start, { passive: false });
    c.addEventListener("touchmove", draw, { passive: false });
    c.addEventListener("touchend", stop, { passive: false });
    return () => { c.removeEventListener("touchstart", start); c.removeEventListener("touchmove", draw); c.removeEventListener("touchend", stop); };
  }, []);

  return (
    <div className="signup-sig-pad">
      <div className="signup-sig-pad-header">
        <span>{label}</span>
        {hasSignature && <button type="button" onClick={clear}>✕ 다시 서명</button>}
      </div>
      <canvas
        ref={canvasRef}
        width={400}
        height={100}
        onMouseDown={start}
        onMouseMove={draw}
        onMouseUp={stop}
        onMouseLeave={stop}
        className="signup-sig-canvas"
      />
      <p className="signup-sig-hint">마우스 또는 손가락으로 서명해주세요 (자필 서명)</p>
    </div>
  );
}

const today = () => new Date().toISOString().slice(0, 10);

const INIT_APPLICATION = {
  affiliation: "",
  rank: "",
  name: "",
  gender: "",
  applicationDate: today(),
};

const INIT_WITHHOLDING = {
  affiliation: "",
  rank: "",
  name: "",
  dob: "",
  periodStart: "",
  periodEnd: "",
  consentDate: today(),
  regionalOffice: "",
};

export default function PageSignup() {
  const [step, setStep] = useState(1);
  const [application, setApplication] = useState(INIT_APPLICATION);
  const [withholding, setWithholding] = useState(INIT_WITHHOLDING);
  const [sig1, setSig1] = useState(null);
  const [sig2, setSig2] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const setApp = (field) => (e) => setApplication((prev) => ({ ...prev, [field]: e.target.value }));
  const setWh = (field) => (e) => setWithholding((prev) => ({ ...prev, [field]: e.target.value }));
  const ErrMsg = ({ field }) => errors[field] ? <span className="signup-field-error">{errors[field]}</span> : null;

  const validateStep1 = () => {
    const e = {};
    if (!application.affiliation.trim()) e.affiliation = "소속을 입력하세요.";
    if (!application.rank.trim()) e.rank = "직급을 입력하세요.";
    if (!application.name.trim()) e.name = "이름을 입력하세요.";
    if (!application.gender) e.gender = "성별을 선택하세요.";
    if (!application.applicationDate) e.applicationDate = "신청일을 선택하세요.";
    if (!sig1) e.sig1 = "서명을 해주세요.";
    return e;
  };

  const validateStep2 = () => {
    const e = {};
    if (!withholding.dob) e.dob = "생년월일을 입력하세요.";
    if (!withholding.periodStart) e.periodStart = "기간 시작일을 입력하세요.";
    if (!withholding.periodEnd) e.periodEnd = "기간 종료일을 입력하세요.";
    if (!withholding.consentDate) e.consentDate = "동의일을 선택하세요.";
    if (!withholding.regionalOffice.trim()) e.regionalOffice = "지방고용노동청을 입력하세요.";
    if (!sig2) e.sig2 = "서명을 해주세요.";
    return e;
  };

  const goStep2 = () => {
    const e = validateStep1();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setErrors({});
    setWithholding((prev) => ({
      ...prev,
      affiliation: application.affiliation,
      rank: application.rank,
      name: application.name,
    }));
    setStep(2);
    window.scrollTo(0, 0);
  };

  const handleSubmit = async () => {
    const e = validateStep2();
    if (Object.keys(e).length > 0) { setErrors(e); return; }

    setErrors({});
    setSubmitError("");
    setSubmitting(true);
    try {
      await submitSignupApplication({ application, withholding, sig1, sig2 });
      setStep(3);
      window.scrollTo(0, 0);
    } catch (err) {
      setSubmitError(err.message || "제출에 실패했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setApplication({ ...INIT_APPLICATION, applicationDate: today() });
    setWithholding({ ...INIT_WITHHOLDING, consentDate: today() });
    setSig1(null);
    setSig2(null);
    setSubmitError("");
    setStep(1);
  };

  if (step === 3) {
    return (
      <section className="section">
        <div className="container">
          <div className="form-wrap" style={{ textAlign: "center" }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
            <h3 style={{ fontSize: 22, fontWeight: 700, color: "var(--text)", marginBottom: 16, fontFamily: "Noto Serif KR, serif" }}>
              제출이 완료되었습니다.
            </h3>
            <p style={{ color: "var(--text)", marginBottom: 12, fontSize: 15, lineHeight: 1.9, fontWeight: 600 }}>
              담당자(소속지청 의장)에게 연락주시면 바로 처리해드리겠습니다.
            </p>
            <p style={{ color: "var(--text-soft)", marginBottom: 32, fontSize: 14, lineHeight: 1.9 }}>
              <strong>{application.name}</strong>님, 가입 신청해 주셔서 감사합니다.
            </p>
            <button type="button" className="btn btn-outline" style={{ width: "100%" }} onClick={reset}>새로 신청하기</button>
          </div>
        </div>
      </section>
    );
  }

  const stepColor = (i) => (step > i + 1 ? "var(--accent)" : step === i + 1 ? "var(--primary)" : "var(--border)");
  const stepTxtColor = (i) => (step >= i + 1 ? "white" : "var(--text-light)");

  return (
    <>
      <section className="hero" style={{ paddingBottom: 48 }}>
        <div className="hero-eyebrow">가입 신청</div>
        <h1>직장협의회 가입 신청</h1>
        <p>공무원직장협의회 가입신청서와 원천징수 동의(신규)서를 작성하고 서명하세요.</p>
        <div style={{ display: "flex", justifyContent: "center", gap: 0, marginTop: 28 }}>
          {["가입신청서", "원천징수 동의서", "신청 완료"].map((label, i) => (
            <div key={label} style={{ display: "flex", alignItems: "center" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: stepColor(i), color: stepTxtColor(i), fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.3s" }}>
                  {step > i + 1 ? "✓" : i + 1}
                </div>
                <span style={{ fontSize: 12, color: step === i + 1 ? "var(--text)" : "var(--text-light)", fontWeight: step === i + 1 ? 700 : 400 }}>{label}</span>
              </div>
              {i < 2 && <div style={{ width: 48, height: 2, background: "var(--border)", margin: "0 4px 20px" }} />}
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="container">
          {!isSignupApiConfigured() && (
            <div className="survey-setup-notice" style={{ maxWidth: 720, margin: "0 auto 20px" }}>
              ℹ️ Google Apps Script 연동 전에는 이 브라우저에만 신청이 저장됩니다(테스트 모드).
            </div>
          )}

          <div className="form-wrap signup-official-form" style={{ maxWidth: 720 }}>
            {step === 1 && (
              <>
                <div className="signup-form-header">
                  <span className="signup-form-attach">[별지 제2호서식]</span>
                  <h2 className="signup-form-title">공무원직장협의회 가입신청서</h2>
                </div>

                <table className="signup-official-table">
                  <tbody>
                    <tr>
                      <th>소속</th>
                      <td>
                        <input className="signup-inline-input" value={application.affiliation} onChange={setApp("affiliation")} placeholder="소속 입력" />
                        <ErrMsg field="affiliation" />
                      </td>
                      <th>직급</th>
                      <td>
                        <input className="signup-inline-input" value={application.rank} onChange={setApp("rank")} placeholder="직급 입력" />
                        <ErrMsg field="rank" />
                      </td>
                    </tr>
                    <tr>
                      <th>이름</th>
                      <td>
                        <input className="signup-inline-input" value={application.name} onChange={setApp("name")} placeholder="이름 입력" />
                        <ErrMsg field="name" />
                      </td>
                      <th>성별</th>
                      <td>
                        <select className="signup-inline-input" value={application.gender} onChange={setApp("gender")}>
                          <option value="">선택</option>
                          <option value="남">남</option>
                          <option value="여">여</option>
                        </select>
                        <ErrMsg field="gender" />
                      </td>
                    </tr>
                  </tbody>
                </table>

                <div className="signup-form-static">
                  <p>위 신청인은 공무원 직장협의회의 설립·운영에 관한 법률 시행령 제6조 제1항의 규정에 의거 고용노동부공무원직장협의회의 회원으로 가입하고자 합니다.</p>
                  <p>(급여에서 매월 직장협의회가 정하는 회비를 원천 공제하는 것에 동의함 : e-사람에서 개별 조치 또는 별도 납부)</p>
                  <p>※ 소속 기관에 직협이 설립되어 전국 조직에 회비 납부 시까지 직장협의회 회비를 전국 조직에 직접 납부하는 것에 동의함.</p>
                </div>

                <div className="signup-form-date-row">
                  <label className="form-label">신청일 <span className="req">*</span></label>
                  <input className="form-input" type="date" value={application.applicationDate} onChange={setApp("applicationDate")} style={{ maxWidth: 200 }} />
                  <ErrMsg field="applicationDate" />
                </div>

                <SignaturePad label="신청인 서명 (인) *" onChange={setSig1} />
                <ErrMsg field="sig1" />

                <p className="signup-form-recipient">고용노동부공무원직장협의회 귀중</p>

                <button type="button" className="btn btn-primary btn-full" onClick={goStep2}>다음: 원천징수 동의서 작성 →</button>
              </>
            )}

            {step === 2 && (
              <>
                <div className="signup-form-header">
                  <h2 className="signup-form-title">원천징수 동의(신규)서</h2>
                </div>

                <table className="signup-official-table">
                  <tbody>
                    <tr>
                      <th>소속</th>
                      <td><span className="signup-readonly-value">{withholding.affiliation}</span></td>
                      <th>직급</th>
                      <td><span className="signup-readonly-value">{withholding.rank}</span></td>
                    </tr>
                    <tr>
                      <th>성명</th>
                      <td><span className="signup-readonly-value">{withholding.name}</span></td>
                      <th>생년월일</th>
                      <td>
                        <input className="signup-inline-input" type="date" value={withholding.dob} onChange={setWh("dob")} />
                        <ErrMsg field="dob" />
                      </td>
                    </tr>
                  </tbody>
                </table>

                <div className="signup-form-period">
                  <span className="signup-form-period-label">기간</span>
                  <input className="signup-inline-input signup-period-input" type="date" value={withholding.periodStart} onChange={setWh("periodStart")} />
                  <span>~</span>
                  <input className="signup-inline-input signup-period-input" type="date" value={withholding.periodEnd} onChange={setWh("periodEnd")} />
                  <ErrMsg field="periodStart" />
                  <ErrMsg field="periodEnd" />
                </div>

                <table className="signup-official-table signup-consent-table">
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
                      <td className="signup-fixed-cell">신규신청(동의)</td>
                      <td className="signup-fixed-cell">직협회비</td>
                      <td className="signup-fixed-cell">봉급의 0.6%</td>
                      <td className="signup-fixed-cell">직협회비 납부 동의</td>
                    </tr>
                  </tbody>
                </table>

                <div className="signup-form-static">
                  <p>본인은 「공무원보수규정」 제19조의2제1항제5호의 규정에 따라 상기 내역이 매월 본인의 보수에서 원천징수되는 것을 동의(또는 변경, 철회) 합니다.</p>
                </div>

                <div className="signup-form-date-row">
                  <label className="form-label">동의일 <span className="req">*</span></label>
                  <input className="form-input" type="date" value={withholding.consentDate} onChange={setWh("consentDate")} style={{ maxWidth: 200 }} />
                  <ErrMsg field="consentDate" />
                </div>

                <SignaturePad label="신청인 성명 (인) *" onChange={setSig2} />
                <ErrMsg field="sig2" />

                <div className="signup-form-recipient-input">
                  <span>(</span>
                  <input
                    className="signup-inline-input signup-office-input"
                    value={withholding.regionalOffice}
                    onChange={setWh("regionalOffice")}
                    placeholder="예: 서울"
                  />
                  <span>)지방고용노동청 지출관 귀하</span>
                  <ErrMsg field="regionalOffice" />
                </div>

                <div className="signup-form-footnotes">
                  <p>1) 동의사항은 1건당 1매의 서식을 작성합니다.</p>
                  <p>2) 동의사유 등란에는 동의사항에 대한 구체적인 사유를 기재합니다.</p>
                  <p>3) 동의(또는 변경, 철회)는 해당 동의사항에 대하여만 효력이 있습니다.</p>
                  <p>4) 기간란을 기재하지 않은 경우에는 1년간의 효력이 있는 것으로 봅니다.</p>
                  <p>5) 동의(또는 변경, 철회)를 철회하고자 하는 경우에는 별도의 서식을 작성하여 제출합니다.</p>
                </div>

                {submitError && <p className="survey-error">{submitError}</p>}
                <div style={{ display: "flex", gap: 12 }}>
                  <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => { setStep(1); window.scrollTo(0, 0); }}>← 이전</button>
                  <button type="button" className="btn btn-primary" style={{ flex: 2 }} onClick={handleSubmit} disabled={submitting}>
                    {submitting ? "제출 중..." : "가입 신청 제출 →"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
