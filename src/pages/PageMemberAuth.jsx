import { useState } from "react";
import {
  registerMember,
  loginMember,
  isMembersApiConfigured,
} from "../lib/membersApi";

const EMPTY_SIGNUP = {
  name: "",
  employeeId: "",
  affiliation: "",
  phone: "",
  username: "",
  password: "",
  passwordConfirm: "",
};

const EMPTY_LOGIN = { username: "", password: "" };

export default function PageMemberAuth({ onLogin }) {
  const [tab, setTab] = useState("signup");
  const [signup, setSignup] = useState(EMPTY_SIGNUP);
  const [login, setLogin] = useState(EMPTY_LOGIN);
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const setSignupField = (field) => (e) => {
    setSignup((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!agree) {
      setError("개인정보 수집·이용에 동의해 주세요.");
      return;
    }

    setSubmitting(true);
    try {
      const member = await registerMember(signup);
      setSuccess(`${member.name}님, 회원가입이 완료되었습니다. 자동으로 로그인되었습니다.`);
      setSignup(EMPTY_SIGNUP);
      setAgree(false);
      onLogin?.(member);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);
    try {
      const member = await loginMember(login.username, login.password);
      setSuccess(`${member.name}님, 환영합니다!`);
      setLogin(EMPTY_LOGIN);
      onLogin?.(member);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <section className="hero" style={{ paddingBottom: 48 }}>
        <div className="hero-inner">
          <div className="hero-eyebrow">고용노동부 전국 직장협의회</div>
          <h1 style={{ fontSize: "clamp(28px, 5vw, 42px)" }}>회원 가입 · 로그인</h1>
          <p>이름, 다우오피스 사번, 소속, 휴대전화번호로 가입하고 아이디·비밀번호로 로그인하세요.</p>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          {!isMembersApiConfigured() && (
            <div className="survey-setup-notice">
              ℹ️ Google Apps Script 연동 전에는 이 브라우저에만 회원 정보가 저장됩니다(테스트 모드).
              운영 배포 시 <code>VITE_MEMBERS_API_URL</code>을 설정해 주세요.
            </div>
          )}

          <div className="member-auth-wrap">
            <div className="member-auth-tabs">
              <button
                type="button"
                className={`member-auth-tab ${tab === "signup" ? "active" : ""}`}
                onClick={() => { setTab("signup"); setError(""); setSuccess(""); }}
              >
                회원가입
              </button>
              <button
                type="button"
                className={`member-auth-tab ${tab === "login" ? "active" : ""}`}
                onClick={() => { setTab("login"); setError(""); setSuccess(""); }}
              >
                로그인
              </button>
            </div>

            {tab === "signup" ? (
              <form onSubmit={handleSignup} className="member-auth-form">
                <h3>회원가입</h3>
                <p className="survey-instruction">
                  아래 정보를 입력하고 아이디·비밀번호를 설정해 주세요.
                </p>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">이름 <span className="req">*</span></label>
                    <input
                      className="form-input"
                      value={signup.name}
                      onChange={setSignupField("name")}
                      placeholder="홍길동"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">다우오피스 사번 <span className="req">*</span></label>
                    <input
                      className="form-input"
                      value={signup.employeeId}
                      onChange={setSignupField("employeeId")}
                      placeholder="사번 입력"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">소속 <span className="req">*</span></label>
                  <input
                    className="form-input"
                    value={signup.affiliation}
                    onChange={setSignupField("affiliation")}
                    placeholder="예) 서울지방고용노동청 OO국"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">휴대전화번호 <span className="req">*</span></label>
                  <input
                    className="form-input"
                    type="tel"
                    value={signup.phone}
                    onChange={setSignupField("phone")}
                    placeholder="010-0000-0000"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">아이디 <span className="req">*</span></label>
                    <input
                      className="form-input"
                      value={signup.username}
                      onChange={setSignupField("username")}
                      placeholder="4자 이상, 영문·숫자·_"
                      autoComplete="username"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">비밀번호 <span className="req">*</span></label>
                    <input
                      className="form-input"
                      type="password"
                      value={signup.password}
                      onChange={setSignupField("password")}
                      placeholder="6자 이상"
                      autoComplete="new-password"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">비밀번호 확인 <span className="req">*</span></label>
                  <input
                    className="form-input"
                    type="password"
                    value={signup.passwordConfirm}
                    onChange={setSignupField("passwordConfirm")}
                    placeholder="비밀번호 다시 입력"
                    autoComplete="new-password"
                  />
                </div>

                <label className="form-agree">
                  <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
                  [필수] 개인정보 수집·이용에 동의합니다. (이름, 사번, 소속, 연락처 / 회원 관리 목적)
                </label>

                {error && <p className="survey-error">{error}</p>}
                {success && <p className="notices-success">{success}</p>}

                <button type="submit" className="btn btn-primary btn-full" disabled={submitting}>
                  {submitting ? "가입 중..." : "회원가입"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleLogin} className="member-auth-form">
                <h3>로그인</h3>
                <p className="survey-instruction">
                  가입 시 설정한 아이디와 비밀번호로 로그인하세요.
                </p>

                <div className="form-group">
                  <label className="form-label">아이디</label>
                  <input
                    className="form-input"
                    value={login.username}
                    onChange={(e) => setLogin((p) => ({ ...p, username: e.target.value }))}
                    placeholder="아이디 입력"
                    autoComplete="username"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">비밀번호</label>
                  <input
                    className="form-input"
                    type="password"
                    value={login.password}
                    onChange={(e) => setLogin((p) => ({ ...p, password: e.target.value }))}
                    placeholder="비밀번호 입력"
                    autoComplete="current-password"
                  />
                </div>

                {error && <p className="survey-error">{error}</p>}
                {success && <p className="notices-success">{success}</p>}

                <button type="submit" className="btn btn-primary btn-full" disabled={submitting}>
                  {submitting ? "로그인 중..." : "로그인"}
                </button>

                <p className="member-auth-switch">
                  아직 회원이 아니신가요?{" "}
                  <button type="button" className="popup-dismiss" onClick={() => setTab("signup")}>
                    회원가입 하기
                  </button>
                </p>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
