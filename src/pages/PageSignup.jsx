import { useState, useRef, useEffect } from "react";

const BANKS = [
  "국민은행","신한은행","우리은행","하나은행","농협은행","기업은행","SC제일은행",
  "카카오뱅크","토스뱅크","새마을금고","수협은행","우체국","기타",
];

// ── 서명 캔버스 컴포넌트 ──────────────────────────────
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

  const start = (e) => {
    e.preventDefault();
    drawing.current = true;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };

  const draw = (e) => {
    e.preventDefault();
    if (!drawing.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const pos = getPos(e, canvas);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = "#0d2b55";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
    setHasSignature(true);
    onChange(canvas.toDataURL());
  };

  const stop = (e) => {
    e.preventDefault();
    drawing.current = false;
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
    onChange(null);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.addEventListener("touchstart", start, { passive: false });
    canvas.addEventListener("touchmove", draw, { passive: false });
    canvas.addEventListener("touchend", stop, { passive: false });
    return () => {
      canvas.removeEventListener("touchstart", start);
      canvas.removeEventListener("touchmove", draw);
      canvas.removeEventListener("touchend", stop);
    };
  }, []);

  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--navy)" }}>{label}</span>
        {hasSignature && (
          <button onClick={clear} style={{ fontSize: 12, color: "#e05252", background: "none", border: "none", cursor: "pointer" }}>
            ✕ 다시 서명
          </button>
        )}
      </div>
      <canvas
        ref={canvasRef}
        width={400}
        height={100}
        onMouseDown={start}
        onMouseMove={draw}
        onMouseUp={stop}
        onMouseLeave={stop}
        style={{
          width: "100%",
          height: 100,
          border: "1.5px solid var(--gray-2)",
          borderRadius: 8,
          background: hasSignature ? "#fff" : "#f7f9fc",
          cursor: "crosshair",
          display: "block",
          touchAction: "none",
        }}
      />
      <p style={{ fontSize: 11, color: "var(--gray-3)", marginTop: 4 }}>
        마우스 또는 손가락으로 서명해주세요
      </p>
    </div>
  );
}

// ── 메인 컴포넌트 ─────────────────────────────────────
const INIT_MEMBER = {
  name: "", dob: "", address: "", phone: "", affiliation: "",
  joinDate: new Date().toISOString().slice(0, 10),
  agree: false,
};
const INIT_BANK = {
  accountHolder: "", relation: "본인", bankName: "", accountNumber: "",
  monthlySalary: "", monthlyFee: "", payDay: "25", startDate: "",
};

export default function PageSignup() {
  const [step, setStep] = useState(1); // 1: 입회원서, 2: 자동이체, 3: 완료
  const [member, setMember] = useState(INIT_MEMBER);
  const [bank, setBank] = useState(INIT_BANK);
  const [sig1, setSig1] = useState(null); // 입회원서 서명
  const [sig2, setSig2] = useState(null); // 자동이체 서명
  const [errors, setErrors] = useState({});

  const setM = (f) => (e) => setMember((p) => ({ ...p, [f]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));
  const setB = (f) => (e) => setBank((p) => ({ ...p, [f]: e.target.value }));
  const ErrMsg = ({ field }) => errors[field] ? <span style={{ color: "#e05252", fontSize: 12, display: "block", marginTop: 3 }}>{errors[field]}</span> : null;

  const validateStep1 = () => {
    const e = {};
    if (!member.name.trim()) e.name = "성명을 입력하세요.";
    if (!member.dob.trim()) e.dob = "생년월일을 입력하세요.";
    if (!member.affiliation.trim()) e.affiliation = "소속을 입력하세요.";
    if (!member.phone.trim()) e.phone = "연락처를 입력하세요.";
    if (!sig1) e.sig1 = "서명을 해주세요.";
    if (!member.agree) e.agree = "개인정보 수집·이용에 동의해주세요.";
    return e;
  };

  const validateStep2 = () => {
    const e = {};
    if (!bank.monthlySalary) e.monthlySalary = "월 봉급액을 입력하세요.";
    if (!bank.accountHolder.trim()) e.accountHolder = "예금주명을 입력하세요.";
    if (!bank.bankName) e.bankName = "은행을 선택하세요.";
    if (!bank.accountNumber.trim()) e.accountNumber = "계좌번호를 입력하세요.";
    if (!bank.startDate) e.startDate = "이체 시작일을 선택하세요.";
    if (!sig2) e.sig2 = "서명을 해주세요.";
    return e;
  };

  const goStep2 = () => {
    const e = validateStep1();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setErrors({});
    setStep(2);
    window.scrollTo(0, 0);
  };

  const submit = () => {
    const e = validateStep2();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setErrors({});
    console.log("입회원서:", member, "서명:", sig1);
    console.log("자동이체:", bank, "서명:", sig2);
    setStep(3);
    window.scrollTo(0, 0);
  };

  // ── 완료 화면 ──
  if (step === 3) {
    return (
      <section className="section">
        <div className="container">
          <div className="form-wrap" style={{ textAlign: "center" }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
            <h3 style={{ fontSize: 24, fontWeight: 800, color: "var(--navy)", marginBottom: 8 }}>
              가입 신청이 완료되었습니다!
            </h3>
            <p style={{ color: "var(--text-soft)", marginBottom: 8 }}>
              <strong>{member.name}</strong>님, 신청해주셔서 감사합니다.
            </p>
            <p style={{ color: "var(--text-soft)", marginBottom: 28, fontSize: 14 }}>
              입회원서 및 자동이체 신청서가 접수되었습니다.<br />
              소속 지역 직장협의회에서 검토 후 연락드리겠습니다.<br />
              <em style={{ fontSize: 12, color: "var(--gray-3)" }}>문의: 소속 지역 직장협의회 담당자</em>
            </p>
            <button className="btn btn-blue" onClick={() => { setMember(INIT_MEMBER); setBank(INIT_BANK); setSig1(null); setSig2(null); setStep(1); }}>
              새로 신청하기
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      {/* 히어로 */}
      <section className="hero" style={{ paddingBottom: 48 }}>
        <div className="hero-eyebrow">가입 신청</div>
        <h1>직장협의회 가입 신청</h1>
        <p>입회원서와 자동이체 신청서를 온라인으로 작성하고 서명하세요.</p>
        {/* 스텝 인디케이터 */}
        <div style={{ display: "flex", justifyContent: "center", gap: 0, marginTop: 28 }}>
          {["입회원서 작성", "자동이체 신청", "신청 완료"].map((label, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center" }}>
              <div style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: "50%",
                  background: step > i + 1 ? "var(--gold)" : step === i + 1 ? "var(--white)" : "rgba(255,255,255,0.2)",
                  color: step === i + 1 ? "var(--navy)" : step > i + 1 ? "var(--navy)" : "rgba(255,255,255,0.5)",
                  fontWeight: 800, fontSize: 14,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {step > i + 1 ? "✓" : i + 1}
                </div>
                <span style={{ fontSize: 12, color: step === i + 1 ? "white" : "rgba(255,255,255,0.5)", fontWeight: step === i + 1 ? 700 : 400 }}>
                  {label}
                </span>
              </div>
              {i < 2 && <div style={{ width: 48, height: 2, background: "rgba(255,255,255,0.2)", margin: "0 4px 20px" }} />}
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="form-wrap" style={{ maxWidth: 680 }}>

            {/* ══ STEP 1: 입회원서 ══ */}
            {step === 1 && (
              <>
                <h2 className="form-title">📋 입회원서</h2>
                <p className="form-sub">고용노동부공무원직장협의회 가입 신청서입니다.</p>

                {/* 신청일 */}
                <div className="form-group">
                  <label className="form-label">신청일 <span className="req">*</span></label>
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

                {/* 안내문 */}
                <div style={{ background: "var(--light)", border: "1px solid var(--gray-2)", borderRadius: 8, padding: "16px 18px", marginBottom: 20, fontSize: 13, color: "var(--text-soft)", lineHeight: 1.8 }}>
                  본인은 고용노동부공무원직장협의회 회원으로 가입하고자 하며,
                  직장협의회 규약을 준수하고 회원으로서의 의무를 다할 것을 서약합니다.
                </div>

                {/* 서명 */}
                <div className="form-group">
                  <SignaturePad label="신청인 서명 *" onChange={setSig1} />
                  <ErrMsg field="sig1" />
                </div>

                {/* 개인정보 동의 */}
                <div className="form-agree">
                  <input type="checkbox" id="agree1" checked={member.agree} onChange={setM("agree")} />
                  <label htmlFor="agree1">
                    [필수] 개인정보 수집·이용에 동의합니다.
                    수집항목: 성명, 생년월일, 연락처, 소속 / 이용목적: 가입 심사 및 회원 관리 / 보유기간: 탈퇴 후 1년
                  </label>
                </div>
                <ErrMsg field="agree" />

                <button className="btn btn-blue btn-full" onClick={goStep2}>
                  다음: 자동이체 신청서 작성 →
                </button>
              </>
            )}

            {/* ══ STEP 2: 자동이체 신청서 ══ */}
            {step === 2 && (
              <>
                <h2 className="form-title">🏦 자동이체 신청서</h2>
                <p className="form-sub">회비 자동이체 정보를 입력해주세요.</p>

                {/* 신청인 정보 (읽기 전용) */}
                <div style={{ background: "var(--light)", borderRadius: 8, padding: "14px 16px", marginBottom: 24, fontSize: 13, color: "var(--text-soft)" }}>
                  신청인: <strong style={{ color: "var(--navy)" }}>{member.name}</strong> &nbsp;|&nbsp; 소속: <strong style={{ color: "var(--navy)" }}>{member.affiliation}</strong>
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
                      <option value="본인">본인</option>
                      <option value="배우자">배우자</option>
                      <option value="기타">기타</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">은행명 <span className="req">*</span></label>
                  <select className="form-select" value={bank.bankName} onChange={setB("bankName")}>
                    <option value="">은행을 선택하세요</option>
                    {BANKS.map((b) => <option key={b} value={b}>{b}</option>)}
                  </select>
                  <ErrMsg field="bankName" />
                </div>

                <div className="form-group">
                  <label className="form-label">계좌번호 <span className="req">*</span></label>
                  <input className="form-input" placeholder="숫자만 입력" value={bank.accountNumber} onChange={setB("accountNumber")} />
                  <ErrMsg field="accountNumber" />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    월 봉급액 <span className="req">*</span>
                    <span style={{ fontSize: 11, color: "var(--text-soft)", fontWeight: 400, marginLeft: 6 }}>
                      (회비 자동 계산: 월 봉급의 0.6%)
                    </span>
                  </label>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <input
                      className="form-input"
                      type="number"
                      placeholder="예) 3500000"
                      value={bank.monthlySalary}
                      onChange={(e) => {
                        const salary = e.target.value;
                        const fee = salary ? Math.round(Number(salary) * 0.006) : "";
                        setBank((p) => ({ ...p, monthlySalary: salary, monthlyFee: fee }));
                      }}
                      style={{ flex: 1 }}
                    />
                    <span style={{ fontSize: 13, color: "var(--text-soft)", whiteSpace: "nowrap" }}>원</span>
                  </div>
                  <ErrMsg field="monthlySalary" />
                  {bank.monthlyFee && (
                    <div style={{
                      marginTop: 8, padding: "10px 14px",
                      background: "var(--light)", borderRadius: 8,
                      border: "1.5px solid var(--sky)",
                      fontSize: 14, color: "var(--navy)", fontWeight: 700,
                    }}>
                      📌 월 회비: <span style={{ color: "var(--blue)", fontSize: 16 }}>
                        {Number(bank.monthlyFee).toLocaleString()}원
                      </span>
                      <span style={{ fontSize: 12, fontWeight: 400, color: "var(--text-soft)", marginLeft: 8 }}>
                        (연 {(Number(bank.monthlyFee) * 12).toLocaleString()}원)
                      </span>
                    </div>
                  )}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">이체일</label>
                    <select className="form-select" value={bank.payDay} onChange={setB("payDay")}>
                      {["5","10","15","20","25"].map((d) => <option key={d} value={d}>{d}일</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">월 이체금액</label>
                    <div className="form-input" style={{ background: "var(--gray-2)", color: "var(--navy)", fontWeight: 700 }}>
                      {bank.monthlyFee
                        ? `${Number(bank.monthlyFee).toLocaleString()}원 (봉급의 0.6%)`
                        : "봉급액 입력 시 자동 계산"}
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">이체 시작 연월 <span className="req">*</span></label>
                  <input className="form-input" type="month" value={bank.startDate} onChange={setB("startDate")} />
                  <ErrMsg field="startDate" />
                </div>

                {/* 안내문 */}
                <div style={{ background: "var(--light)", border: "1px solid var(--gray-2)", borderRadius: 8, padding: "14px 16px", marginBottom: 20, fontSize: 12, color: "var(--text-soft)", lineHeight: 1.8 }}>
                  ① 이체금액은 위에 표시한 금액으로 하되, 협의회 결정에 의거 변경될 수 있으며 변경 시 사전 통보합니다.<br />
                  ② 이체 금융기관의 사정으로 이체가 불능할 경우에는 직접 납부합니다.<br />
                  ③ 이체에 필요한 사항은 고용노동부공무원직장협의회에 일임합니다.
                </div>

                {/* 서명 */}
                <div className="form-group">
                  <SignaturePad label="신청인 서명 *" onChange={setSig2} />
                  <ErrMsg field="sig2" />
                </div>

                <div style={{ display: "flex", gap: 12 }}>
                  <button className="btn btn-outline" style={{ color: "var(--navy)", border: "2px solid var(--gray-2)", flex: 1 }} onClick={() => { setStep(1); window.scrollTo(0,0); }}>
                    ← 이전
                  </button>
                  <button className="btn btn-blue" style={{ flex: 2 }} onClick={submit}>
                    가입 신청 완료 →
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
