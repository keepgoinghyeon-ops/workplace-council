import { useState, useEffect, useCallback } from "react";
import SignupPrintDocument from "../components/SignupPrintDocument";
import {
  fetchSignupSubmissions,
  verifySignupAdminToken,
  deleteSignupSubmission,
  getSignupAdminToken,
  isSignupAdminAuthenticated,
  setSignupAdminAuthenticated,
  isSignupApiConfigured,
} from "../lib/signupApi";

export default function PageSignupAdmin() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isAdmin, setIsAdmin] = useState(isSignupAdminAuthenticated());
  const [adminToken, setAdminToken] = useState(getSignupAdminToken());
  const [loginError, setLoginError] = useState("");

  const [printTarget, setPrintTarget] = useState(null);

  const loadSubmissions = useCallback(async () => {
    if (!isAdmin) return;
    setLoading(true);
    setError("");
    try {
      const data = await fetchSignupSubmissions(adminToken || getSignupAdminToken());
      setSubmissions(data);
    } catch (err) {
      setError(err.message || "신청 목록을 불러올 수 없습니다.");
    } finally {
      setLoading(false);
    }
  }, [isAdmin, adminToken]);

  useEffect(() => {
    loadSubmissions();
  }, [loadSubmissions]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    try {
      const result = await verifySignupAdminToken(adminToken);
      if (result.ok) {
        setIsAdmin(true);
      } else {
        setLoginError(result.error || "비밀번호가 올바르지 않습니다.");
      }
    } catch (err) {
      setLoginError(err.message || "로그인에 실패했습니다.");
    }
  };

  const handleLogout = () => {
    setSignupAdminAuthenticated(false);
    setIsAdmin(false);
    setAdminToken("");
    setSubmissions([]);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("이 가입신청을 삭제하시겠습니까?")) return;
    try {
      await deleteSignupSubmission(id, adminToken || getSignupAdminToken());
      await loadSubmissions();
      if (printTarget?.id === id) setPrintTarget(null);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <>
      {printTarget && (
        <SignupPrintDocument
          member={printTarget.member}
          bank={printTarget.bank}
          sig1={printTarget.sig1}
          sig2={printTarget.sig2}
          onClose={() => setPrintTarget(null)}
        />
      )}

      <section className="hero" style={{ paddingBottom: 48 }}>
        <div className="hero-inner">
          <div className="hero-eyebrow">관리자</div>
          <h1 style={{ fontSize: "clamp(28px, 5vw, 42px)" }}>가입신청 관리</h1>
          <p>제출된 입회원서·원천징수동의서를 확인하고 인쇄할 수 있습니다.</p>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          {!isSignupApiConfigured() && (
            <div className="survey-setup-notice">
              ℹ️ Google Apps Script 연동 전에는 이 브라우저에만 신청이 저장됩니다(테스트 모드).
              운영 배포 시 <code>VITE_SIGNUP_API_URL</code>을 설정해 주세요.
            </div>
          )}

          {!isAdmin ? (
            <div className="notices-admin-panel">
              <form onSubmit={handleLogin} className="notices-login-form">
                <h3>관리자 로그인</h3>
                <p className="survey-instruction">
                  가입신청 목록 조회 및 인쇄는 관리자만 가능합니다.
                </p>
                <div className="form-group">
                  <label className="form-label">관리자 비밀번호</label>
                  <input
                    type="password"
                    className="form-input"
                    value={adminToken}
                    onChange={(e) => setAdminToken(e.target.value)}
                    placeholder="비밀번호 입력"
                  />
                </div>
                {loginError && <p className="survey-error">{loginError}</p>}
                <button type="submit" className="btn btn-primary">로그인</button>
              </form>
            </div>
          ) : (
            <>
              <div className="signup-admin-header">
                <h3>가입신청 목록 ({submissions.length}건)</h3>
                <button type="button" className="popup-dismiss" onClick={handleLogout}>로그아웃</button>
              </div>

              {loading && <p className="notices-empty">불러오는 중...</p>}
              {error && <p className="survey-error">{error}</p>}
              {!loading && !error && submissions.length === 0 && (
                <p className="notices-empty">제출된 가입신청이 없습니다.</p>
              )}

              <div className="signup-admin-list">
                {submissions.map((item) => (
                  <article key={item.id} className="signup-admin-card">
                    <div className="signup-admin-card-main">
                      <h4>{item.name}</h4>
                      <p>{item.affiliation}</p>
                      <p className="signup-admin-meta">
                        {item.phone} · 신청일 {item.joinDate} · 제출 {item.submittedAt}
                      </p>
                    </div>
                    <div className="signup-admin-card-actions">
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => setPrintTarget(item)}
                      >
                        인쇄
                      </button>
                      <button
                        type="button"
                        className="notice-delete-btn"
                        onClick={() => handleDelete(item.id)}
                      >
                        삭제
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}
