import { useState, useRef, useEffect } from "react";
import { submitSignupApplication, isSignupApiConfigured } from "../lib/signupApi";

const BANKS = [
  "국민은행","신한은행","우리은행","하나은행","농협은행","기업은행","SC제일은행",
  "카카오뱅크","토스뱅크","새마을금고","수협은행","우체국","기타",
];

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
  const start = (e) => { e.preventDefault(); drawing.current = true; const c = canvasRef.current; const ctx = c.getContext("2d"); const p = getPos(e,c); ctx.beginPath(); ctx.moveTo(p.x, p.y); };
  const draw  = (e) => { e.preventDefault(); if (!drawing.current) return; const c = canvasRef.current; const ctx = c.getContext("2d"); const p = getPos(e,c); ctx.lineTo(p.x,p.y); ctx.strokeStyle="#3e3232"; ctx.lineWidth=2.5; ctx.lineCap="round"; ctx.lineJoin="round"; ctx.stroke(); setHasSignature(true); onChange(c.toDataURL()); };
  const stop  = (e) => { e.preventDefault(); drawing.current = false; };
  const clear = () => { const c = canvasRef.current; c.getContext("2d").clearRect(0,0,c.width,c.height); setHasSignature(false); onChange(null); };

  useEffect(() => {
    const c = canvasRef.current;
    c.addEventListener("touchstart", start, { passive: false });
    c.addEventListener("touchmove",  draw,  { passive: false });
    c.addEventListener("touchend",   stop,  { passive: false });
    return () => { c.removeEventListener("touchstart", start); c.removeEventListener("touchmove", draw); c.removeEventListener("touchend", stop); };
  }, []);

  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
        <span style={{ fontSize:13, fontWeight:700, color:"var(--text)" }}>{label}</span>
        {hasSignature && <button type="button" onClick={clear} style={{ fontSize:12, color:"var(--accent)", background:"none", border:"none", cursor:"pointer" }}>✕ 다시 서명</button>}
      </div>
      <canvas ref={canvasRef} width={400} height={100}
        onMouseDown={start} onMouseMove={draw} onMouseUp={stop} onMouseLeave={stop}
        style={{ width:"100%", height:100, border:"1px solid var(--border)", borderRadius:8,
          background: hasSignature ? "#fff" : "var(--bg)", cursor:"crosshair", display:"block", touchAction:"none" }}
      />
      <p style={{ fontSize:11, color:"var(--text-light)", marginTop:4 }}>마우스 또는 손가락으로 서명해주세요</p>
    </div>
  );
}

const INIT_MEMBER = { name:"", dob:"", address:"", phone:"", affiliation:"", joinDate: new Date().toISOString().slice(0,10), agree:false };
const INIT_BANK   = { accountHolder:"", relation:"본인", bankName:"", accountNumber:"", monthlySalary:"", monthlyFee:"", payDay:"25", startDate:"" };

export default function PageSignup() {
  const [step, setStep]       = useState(1);
  const [member, setMember]   = useState(INIT_MEMBER);
  const [bank, setBank]       = useState(INIT_BANK);
  const [sig1, setSig1]       = useState(null);
  const [sig2, setSig2]       = useState(null);
  const [errors, setErrors]   = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const setM = (f) => (e) => setMember((p) => ({ ...p, [f]: e.target.type==="checkbox" ? e.target.checked : e.target.value }));
  const setB = (f) => (e) => setBank((p) => ({ ...p, [f]: e.target.value }));
  const ErrMsg = ({ field }) => errors[field] ? <span style={{ color:"var(--accent)", fontSize:12, display:"block", marginTop:3 }}>{errors[field]}</span> : null;

  const validateStep1 = () => {
    const e = {};
    if (!member.name.trim())        e.name        = "성명을 입력하세요.";
    if (!member.dob.trim())         e.dob         = "생년월일을 입력하세요.";
    if (!member.affiliation.trim()) e.affiliation = "소속을 입력하세요.";
    if (!member.phone.trim())       e.phone       = "연락처를 입력하세요.";
    if (!sig1)                      e.sig1        = "서명을 해주세요.";
    if (!member.agree)              e.agree       = "개인정보 수집·이용에 동의해주세요.";
    return e;
  };
  const validateStep2 = () => {
    const e = {};
    if (!bank.monthlySalary)         e.monthlySalary  = "월 봉급액을 입력하세요.";
    if (!bank.accountHolder.trim())  e.accountHolder  = "예금주명을 입력하세요.";
    if (!bank.bankName)              e.bankName       = "은행을 선택하세요.";
    if (!bank.accountNumber.trim())  e.accountNumber  = "계좌번호를 입력하세요.";
    if (!bank.startDate)             e.startDate      = "이체 시작일을 선택하세요.";
    if (!sig2)                       e.sig2           = "서명을 해주세요.";
    return e;
  };

  const goStep2 = () => { const e=validateStep1(); if(Object.keys(e).length>0){setErrors(e);return;} setErrors({}); setStep(2); window.scrollTo(0,0); };

  const handleSubmit = async () => {
    const e = validateStep2();
    if (Object.keys(e).length > 0) { setErrors(e); return; }

    setErrors({});
    setSubmitError("");
    setSubmitting(true);
    try {
      await submitSignupApplication({ member, bank, sig1, sig2 });
      setStep(3);
      window.scrollTo(0, 0);
    } catch (err) {
      setSubmitError(err.message || "제출에 실패했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setMember(INIT_MEMBER);
    setBank(INIT_BANK);
    setSig1(null);
    setSig2(null);
    setSubmitError("");
    setStep(1);
  };

  if (step === 3) return (
    <section className="section">
      <div className="container">
        <div className="form-wrap" style={{ textAlign:"center" }}>
          <div style={{ fontSize:56, marginBottom:16 }}>✅</div>
          <h3 style={{ fontSize:22, fontWeight:700, color:"var(--text)", marginBottom:16, fontFamily:"Noto Serif KR, serif" }}>
            제출이 완료되었습니다.
          </h3>
          <p style={{ color:"var(--text)", marginBottom:12, fontSize:15, lineHeight:1.9, fontWeight:600 }}>
            담당자(소속지청 의장)에게 연락주시면 바로 처리해드리겠습니다.
          </p>
          <p style={{ color:"var(--text-soft)", marginBottom:32, fontSize:14, lineHeight:1.9 }}>
            <strong>{member.name}</strong>님, 가입 신청해 주셔서 감사합니다.
          </p>
          <button type="button" className="btn btn-outline" style={{ width:"100%" }} onClick={reset}>새로 신청하기</button>
        </div>
      </div>
    </section>
  );

  const stepColor = (i) => step > i+1 ? "var(--accent)" : step === i+1 ? "var(--primary)" : "var(--border)";
  const stepTxtColor = (i) => step >= i+1 ? "white" : "var(--text-light)";

  return (
    <>
      <section className="hero" style={{ paddingBottom:48 }}>
        <div className="hero-eyebrow">가입 신청</div>
        <h1>직장협의회 가입 신청</h1>
        <p>입회원서와 자동이체 신청서를 온라인으로 작성하고 서명하세요.</p>
        <div style={{ display:"flex", justifyContent:"center", gap:0, marginTop:28 }}>
          {["입회원서 작성","자동이체 신청","신청 완료"].map((label,i) => (
            <div key={i} style={{ display:"flex", alignItems:"center" }}>
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:6 }}>
                <div style={{ width:36, height:36, borderRadius:"50%", background:stepColor(i), color:stepTxtColor(i), fontWeight:700, fontSize:14, display:"flex", alignItems:"center", justifyContent:"center", transition:"background 0.3s" }}>
                  {step > i+1 ? "✓" : i+1}
                </div>
                <span style={{ fontSize:12, color: step===i+1 ? "var(--text)" : "var(--text-light)", fontWeight: step===i+1 ? 700 : 400, fontFamily:"Noto Sans KR, sans-serif" }}>{label}</span>
              </div>
              {i < 2 && <div style={{ width:48, height:2, background:"var(--border)", margin:"0 4px 20px" }} />}
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="container">
          {!isSignupApiConfigured() && (
            <div className="survey-setup-notice" style={{ maxWidth: 640, margin: "0 auto 20px" }}>
              ℹ️ Google Apps Script 연동 전에는 이 브라우저에만 신청이 저장됩니다(테스트 모드).
            </div>
          )}
          <div className="form-wrap" style={{ maxWidth:640 }}>

            {step === 1 && <>
              <h2 className="form-title">📋 입회원서</h2>
              <p className="form-sub">고용노동부공무원직장협의회 가입 신청서입니다.</p>
              <div className="form-group">
                <label className="form-label">신청일</label>
                <input className="form-input" type="date" value={member.joinDate} onChange={setM("joinDate")} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">성명 <span className="req">*</span></label>
                  <input className="form-input" placeholder="홍길동" value={member.name} onChange={setM("name")} />
                  <ErrMsg field="name" />
                </div>
                <div className="form-group">
                  <label className="form-label">생년월일 <span className="req">*</span></label>
                  <input className="form-input" type="date" value={member.dob} onChange={setM("dob")} />
                  <ErrMsg field="dob" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">주소</label>
                <input className="form-input" placeholder="서울특별시 중구 ..." value={member.address} onChange={setM("address")} />
              </div>
              <div className="form-group">
                <label className="form-label">연락처 <span className="req">*</span></label>
                <input className="form-input" placeholder="010-0000-0000" value={member.phone} onChange={setM("phone")} />
                <ErrMsg field="phone" />
              </div>
              <div className="form-group">
                <label className="form-label">소속(기관명) <span className="req">*</span></label>
                <input className="form-input" placeholder="예) 00지청 00과" value={member.affiliation} onChange={setM("affiliation")} />
                <ErrMsg field="affiliation" />
              </div>
              <div style={{ background:"var(--bg-2)", border:"1px solid var(--border)", borderRadius:8, padding:"14px 18px", marginBottom:20, fontSize:13, color:"var(--text-soft)", lineHeight:1.9 }}>
                본인은 고용노동부공무원직장협의회 회원으로 가입하고자 하며, 직장협의회 규약을 준수하고 회원으로서의 의무를 다할 것을 서약합니다.
              </div>
              <div className="form-group">
                <SignaturePad label="신청인 서명 *" onChange={setSig1} />
                <ErrMsg field="sig1" />
              </div>
              <div className="form-agree">
                <input type="checkbox" id="agree1" checked={member.agree} onChange={setM("agree")} />
                <label htmlFor="agree1">[필수] 개인정보 수집·이용에 동의합니다. 수집항목: 성명, 생년월일, 연락처, 소속 / 이용목적: 가입 심사 및 회원 관리 / 보유기간: 탈퇴 후 1년</label>
              </div>
              <ErrMsg field="agree" />
              <button type="button" className="btn btn-primary btn-full" onClick={goStep2}>다음: 자동이체 신청서 작성 →</button>
            </>}

            {step === 2 && <>
              <h2 className="form-title">🏦 자동이체 신청서</h2>
              <p className="form-sub">회비 자동이체 정보를 입력해주세요.</p>
              <div style={{ background:"var(--bg-2)", borderRadius:8, padding:"12px 16px", marginBottom:24, fontSize:13, color:"var(--text-soft)" }}>
                신청인: <strong style={{ color:"var(--text)" }}>{member.name}</strong> &nbsp;|&nbsp; 소속: <strong style={{ color:"var(--text)" }}>{member.affiliation}</strong>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">예금주 <span className="req">*</span></label>
                  <input className="form-input" placeholder="홍길동" value={bank.accountHolder} onChange={setB("accountHolder")} />
                  <ErrMsg field="accountHolder" />
                </div>
                <div className="form-group">
                  <label className="form-label">신청인과의 관계</label>
                  <select className="form-select" value={bank.relation} onChange={setB("relation")}>
                    <option value="본인">본인</option><option value="배우자">배우자</option><option value="기타">기타</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">은행명 <span className="req">*</span></label>
                <select className="form-select" value={bank.bankName} onChange={setB("bankName")}>
                  <option value="">은행을 선택하세요</option>
                  {BANKS.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
                <ErrMsg field="bankName" />
              </div>
              <div className="form-group">
                <label className="form-label">계좌번호 <span className="req">*</span></label>
                <input className="form-input" placeholder="숫자만 입력" value={bank.accountNumber} onChange={setB("accountNumber")} />
                <ErrMsg field="accountNumber" />
              </div>
              <div className="form-group">
                <label className="form-label">월 봉급액 <span className="req">*</span> <span style={{ fontSize:11, color:"var(--text-light)", fontWeight:400 }}>(회비 자동 계산: 봉급의 0.6%)</span></label>
                <input className="form-input" type="number" placeholder="예) 3500000" value={bank.monthlySalary}
                  onChange={(e) => { const s=e.target.value; const f=s?Math.round(Number(s)*0.006):""; setBank(p=>({...p,monthlySalary:s,monthlyFee:f})); }} />
                <ErrMsg field="monthlySalary" />
                {bank.monthlyFee && (
                  <div style={{ marginTop:8, padding:"10px 14px", background:"var(--bg-2)", borderRadius:8, border:"1px solid var(--border)", fontSize:14, color:"var(--text)", fontWeight:700 }}>
                    📌 월 회비: <span style={{ color:"var(--accent)", fontSize:16 }}>{Number(bank.monthlyFee).toLocaleString()}원</span>
                    <span style={{ fontSize:12, fontWeight:400, color:"var(--text-soft)", marginLeft:8 }}>(연 {(Number(bank.monthlyFee)*12).toLocaleString()}원)</span>
                  </div>
                )}
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">이체일</label>
                  <select className="form-select" value={bank.payDay} onChange={setB("payDay")}>
                    {["5","10","15","20","25"].map(d=><option key={d} value={d}>{d}일</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">이체 시작 연월 <span className="req">*</span></label>
                  <input className="form-input" type="month" value={bank.startDate} onChange={setB("startDate")} />
                  <ErrMsg field="startDate" />
                </div>
              </div>
              <div style={{ background:"var(--bg-2)", border:"1px solid var(--border)", borderRadius:8, padding:"14px 16px", marginBottom:20, fontSize:12, color:"var(--text-soft)", lineHeight:1.9 }}>
                ① 이체금액은 위에 표시한 금액으로 하되, 협의회 결정에 의거 변경될 수 있으며 변경 시 사전 통보합니다.<br />
                ② 이체 금융기관의 사정으로 이체가 불능할 경우에는 직접 납부합니다.<br />
                ③ 이체에 필요한 사항은 고용노동부공무원직장협의회에 일임합니다.
              </div>
              <div className="form-group">
                <SignaturePad label="신청인 서명 *" onChange={setSig2} />
                <ErrMsg field="sig2" />
              </div>
              {submitError && <p className="survey-error">{submitError}</p>}
              <div style={{ display:"flex", gap:12 }}>
                <button type="button" className="btn btn-outline" style={{ flex:1 }} onClick={() => { setStep(1); window.scrollTo(0,0); }}>← 이전</button>
                <button type="button" className="btn btn-primary" style={{ flex:2 }} onClick={handleSubmit} disabled={submitting}>
                  {submitting ? "제출 중..." : "가입 신청 제출 →"}
                </button>
              </div>
            </>}

          </div>
        </div>
      </section>
    </>
  );
}
