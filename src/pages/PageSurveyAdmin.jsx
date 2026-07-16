import { useState, useEffect, useCallback } from "react";
import {
  fetchSurveyResponses,
  verifySurveyAdminToken,
  deleteSurveyResponse,
  exportSurveyCsv,
  getSurveyAdminToken,
  isSurveyAdminAuthenticated,
  setSurveyAdminAuthenticated,
  isSurveySubmitConfigured,
} from "../lib/surveyApi";

export default function PageSurveyAdmin() {
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState(null);

  const [isAdmin, setIsAdmin] = useState(isSurveyAdminAuthenticated());
  const [adminToken, setAdminToken] = useState(getSurveyAdminToken());
  const [loginError, setLoginError] = useState("");

  const loadResponses = useCallback(async () => {
    if (!isAdmin) return;
    setLoading(true);
    setError("");
    try {
      const data = await fetchSurveyResponses(adminToken || getSurveyAdminToken());
      setResponses(data);
    } catch (err) {
      setError(err.message || "설문 목록을 불러올 수 없습니다.");
    } finally {
      setLoading(false);
    }
  }, [isAdmin, adminToken]);

  useEffect(() => {
    loadResponses();
  }, [loadResponses]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    try {
      const result = await verifySurveyAdminToken(adminToken);
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
    setSurveyAdminAuthenticated(false);
    setIsAdmin(false);
    setAdminToken("");
    setResponses([]);
    setExpandedId(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("이 설문 응답을 삭제하시겠습니까?")) return;
    try {
      await deleteSurveyResponse(id, adminToken || getSurveyAdminToken());
      await loadResponses();
      if (expandedId === id) setExpandedId(null);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleExportCsv = () => {
    const csv = exportSurveyCsv(responses);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `설문응답_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <section className="hero" style={{ paddingBottom: 48 }}>
        <div className="hero-inner">
          <div className="hero-eyebrow">관리자</div>
          <h1 style={{ fontSize: "clamp(28px, 5vw, 42px)" }}>설문 취합</h1>
          <p>베스트·워스트 설문 응답을 확인하고 CSV로 내려받을 수 있습니다.</p>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          {!isSurveySubmitConfigured() && (
            <div className="survey-setup-notice">
              ℹ️ Google Apps Script 연동 전에는 이 브라우저에만 설문이 저장됩니다(테스트 모드).
              운영 배포 시 <code>VITE_SURVEY_SUBMIT_URL</code>을 설정해 주세요.
            </div>
          )}

          {!isAdmin ? (
            <div className="notices-admin-panel">
              <form onSubmit={handleLogin} className="notices-login-form">
                <h3>관리자 로그인</h3>
                <p className="survey-instruction">
                  설문 응답 취합·조회는 취합 관리자만 가능합니다. 제출자 성명·연락처는 관리 목적으로만 사용하며 외부에 공개하지 않습니다.
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
                <h3>설문 응답 ({responses.length}건)</h3>
                <div className="signup-admin-header-actions">
                  {responses.length > 0 && (
                    <button type="button" className="btn btn-primary" onClick={handleExportCsv}>
                      CSV 내려받기
                    </button>
                  )}
                  <button type="button" className="popup-dismiss" onClick={handleLogout}>로그아웃</button>
                </div>
              </div>

              {loading && <p className="notices-empty">불러오는 중...</p>}
              {error && <p className="survey-error">{error}</p>}
              {!loading && !error && responses.length === 0 && (
                <p className="notices-empty">제출된 설문이 없습니다.</p>
              )}

              <div className="signup-admin-list">
                {responses.map((item) => (
                  <article key={item.id} className="signup-admin-card">
                    <div className="signup-admin-card-main">
                      <h4>
                        {item.submitterName || "(성명 미기재)"}
                        {item.submitterPhone ? ` · ${item.submitterPhone}` : ""}
                      </h4>
                      <p className="signup-admin-meta">제출 {item.submittedAtLocal || item.submittedAt}</p>
                      {(item.bestManager || item.worstManager) && (
                        <p className="survey-admin-summary">
                          {item.bestManager && <>베스트: {item.bestManager}</>}
                          {item.bestManager && item.worstManager && " · "}
                          {item.worstManager && <>워스트: {item.worstManager}</>}
                        </p>
                      )}
                    </div>
                    <div className="signup-admin-card-actions">
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                      >
                        {expandedId === item.id ? "접기" : "상세"}
                      </button>
                      <button
                        type="button"
                        className="notice-delete-btn"
                        onClick={() => handleDelete(item.id)}
                      >
                        삭제
                      </button>
                    </div>
                    {expandedId === item.id && (
                      <div className="survey-admin-detail">
                        <dl>
                          <dt>베스트 항목</dt>
                          <dd>{item.bestCriteriaText || "—"}</dd>
                          <dt>베스트 관리자</dt>
                          <dd>{item.bestManager || "—"}</dd>
                          <dt>베스트 이유</dt>
                          <dd>{item.bestReason || "—"}</dd>
                          <dt>워스트 항목</dt>
                          <dd style={{ whiteSpace: "pre-wrap" }}>{item.worstItemsText || "—"}</dd>
                          <dt>워스트 관리자</dt>
                          <dd>{item.worstManager || "—"}</dd>
                          <dt>워스트 이유</dt>
                          <dd>{item.worstReason || "—"}</dd>
                          <dt>기타 의견</dt>
                          <dd>{item.otherOpinion || "—"}</dd>
                        </dl>
                      </div>
                    )}
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
