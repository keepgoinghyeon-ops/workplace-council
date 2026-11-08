import { useEffect, useState } from "react";
import {
  DEFAULT_SITE_CONTENT,
  REGION_OPTIONS,
  mergeSiteContent,
} from "../data/defaultSiteContent";
import {
  fetchSiteContent,
  saveSiteContent,
  verifyAdminToken,
  getAdminToken,
  isAdminAuthenticated,
  setAdminAuthenticated,
  isNoticesApiConfigured,
} from "../lib/noticesApi";

const emptyExec = () => ({ role: "", name: "" });
const emptyHqUnit = () => ({ unit: "본부", president: "", vp: "", secretary: "", etc: "" });
const emptyBranch = () => ({
  region: REGION_OPTIONS[0],
  unit: "",
  president: "",
  vp: "",
  secretary: "",
  etc: "",
});

export default function PageSiteAdmin() {
  const [isAdmin, setIsAdmin] = useState(isAdminAuthenticated());
  const [adminToken, setAdminToken] = useState(getAdminToken());
  const [loginError, setLoginError] = useState("");
  const [tab, setTab] = useState("popup");
  const [content, setContent] = useState(DEFAULT_SITE_CONTENT);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const raw = await fetchSiteContent();
        if (!cancelled) setContent(mergeSiteContent(raw));
      } catch {
        if (!cancelled) setContent(DEFAULT_SITE_CONTENT);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    try {
      const result = await verifyAdminToken(adminToken);
      if (result.ok) setIsAdmin(true);
      else setLoginError(result.error || "비밀번호가 올바르지 않습니다.");
    } catch (err) {
      setLoginError(err.message || "로그인에 실패했습니다.");
    }
  };

  const handleLogout = () => {
    setAdminAuthenticated(false);
    setIsAdmin(false);
    setAdminToken("");
  };

  const updatePopup = (field, value) => {
    setContent((prev) => ({ ...prev, popup: { ...prev.popup, [field]: value } }));
  };

  const updateSurvey = (field, value) => {
    setContent((prev) => ({ ...prev, survey: { ...prev.survey, [field]: value } }));
  };

  const updateList = (key, index, field, value) => {
    setContent((prev) => {
      const next = [...(prev[key] || [])];
      next[index] = { ...next[index], [field]: value };
      return { ...prev, [key]: next };
    });
  };

  const addRow = (key, factory) => {
    setContent((prev) => ({ ...prev, [key]: [...(prev[key] || []), factory()] }));
  };

  const removeRow = (key, index) => {
    setContent((prev) => ({
      ...prev,
      [key]: (prev[key] || []).filter((_, i) => i !== index),
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const saved = await saveSiteContent(content, adminToken || getAdminToken());
      setContent(mergeSiteContent(saved));
      setMessage("저장했습니다. 홈페이지에 바로 반영됩니다. (팝업·설문 안내를 바꿨다면 방문자는 새로고침 후 보입니다)");
    } catch (err) {
      setError(err.message || "저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-eyebrow">운영</div>
          <h1>홈페이지 관리</h1>
          <p>설문 팝업·설문 안내·본조 운영진·단위직협 임원현황을 수정할 수 있습니다.</p>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <div className="survey-wrap" style={{ maxWidth: 980 }}>
            {!isNoticesApiConfigured() && (
              <div className="survey-setup-notice">
                ℹ️ 공지사항 API가 없으면 이 브라우저에만 저장됩니다. 모든 방문자가 보게 하려면 notices-api.gs를 재배포해 주세요.
              </div>
            )}

            {!isAdmin ? (
              <form className="board-form" onSubmit={handleLogin}>
                <h3>운영진 로그인</h3>
                <p className="form-sub">공지사항과 같은 운영진 비밀번호를 입력해 주세요.</p>
                <label className="form-label" htmlFor="site-admin-token">운영진 비밀번호</label>
                <input
                  id="site-admin-token"
                  className="form-input"
                  type="password"
                  value={adminToken}
                  onChange={(e) => setAdminToken(e.target.value)}
                />
                {loginError && <p className="survey-error">{loginError}</p>}
                <button type="submit" className="btn btn-primary" style={{ marginTop: 12 }}>로그인</button>
              </form>
            ) : (
              <>
                <div className="signup-admin-header">
                  <div className="site-admin-tabs">
                    {[
                      ["popup", "설문 팝업"],
                      ["survey", "설문 안내"],
                      ["hq", "본조 운영진"],
                      ["org", "임원현황"],
                    ].map(([id, label]) => (
                      <button
                        key={id}
                        type="button"
                        className={`nav-btn ${tab === id ? "active" : ""}`}
                        onClick={() => setTab(id)}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  <button type="button" className="popup-dismiss" onClick={handleLogout}>로그아웃</button>
                </div>

                {tab === "popup" && (
                  <div className="board-form">
                    <label className="form-label">
                      <input
                        type="checkbox"
                        checked={Boolean(content.popup?.enabled)}
                        onChange={(e) => updatePopup("enabled", e.target.checked)}
                      />{" "}
                      팝업 표시
                    </label>
                    <label className="form-label">상단 작은 제목</label>
                    <input className="form-input" value={content.popup?.eyebrow || ""} onChange={(e) => updatePopup("eyebrow", e.target.value)} />
                    <label className="form-label">제목</label>
                    <input className="form-input" value={content.popup?.title || ""} onChange={(e) => updatePopup("title", e.target.value)} />
                    <label className="form-label">설문기간</label>
                    <input className="form-input" value={content.popup?.period || ""} onChange={(e) => updatePopup("period", e.target.value)} />
                    <label className="form-label">안내 문구</label>
                    <textarea className="form-textarea" rows={4} value={content.popup?.desc || ""} onChange={(e) => updatePopup("desc", e.target.value)} />
                    <label className="form-label">추첨·혜택 문구</label>
                    <input className="form-input" value={content.popup?.prize || ""} onChange={(e) => updatePopup("prize", e.target.value)} />
                    <label className="form-label">버튼 글씨</label>
                    <input className="form-input" value={content.popup?.ctaLabel || ""} onChange={(e) => updatePopup("ctaLabel", e.target.value)} />
                  </div>
                )}

                {tab === "survey" && (
                  <div className="board-form">
                    <p className="form-sub">베스트·워스트 설문 페이지 상단과 안내 문구입니다. 줄바꿈은 그대로 반영됩니다. 강조는 **이렇게** 쓰면 됩니다.</p>
                    <label className="form-label">상단 작은 제목</label>
                    <input className="form-input" value={content.survey?.eyebrow || ""} onChange={(e) => updateSurvey("eyebrow", e.target.value)} />
                    <label className="form-label">제목</label>
                    <input className="form-input" value={content.survey?.title || ""} onChange={(e) => updateSurvey("title", e.target.value)} />
                    <label className="form-label">설문기간</label>
                    <input className="form-input" value={content.survey?.period || ""} onChange={(e) => updateSurvey("period", e.target.value)} />
                    <label className="form-label">상단 안내 문구</label>
                    <textarea className="form-textarea" rows={4} value={content.survey?.heroDesc || ""} onChange={(e) => updateSurvey("heroDesc", e.target.value)} />
                    <label className="form-label">추첨·혜택 문구</label>
                    <input className="form-input" value={content.survey?.prize || ""} onChange={(e) => updateSurvey("prize", e.target.value)} />
                    <label className="form-label">설문 목적</label>
                    <textarea className="form-textarea" rows={5} value={content.survey?.purpose || ""} onChange={(e) => updateSurvey("purpose", e.target.value)} />
                    <label className="form-label">작성 안내 (하나만 작성해도 된다는 안내 등)</label>
                    <textarea className="form-textarea" rows={3} value={content.survey?.instruction || ""} onChange={(e) => updateSurvey("instruction", e.target.value)} />
                    <label className="form-label">성명·연락처 수집 안내</label>
                    <textarea className="form-textarea" rows={5} value={content.survey?.privacyNotice || ""} onChange={(e) => updateSurvey("privacyNotice", e.target.value)} />
                  </div>
                )}

                {tab === "hq" && (
                  <div>
                    {(content.hqExecutives || []).map((row, i) => (
                      <div key={i} className="site-admin-row">
                        <input className="form-input" placeholder="직위" value={row.role} onChange={(e) => updateList("hqExecutives", i, "role", e.target.value)} />
                        <input className="form-input" placeholder="이름" value={row.name} onChange={(e) => updateList("hqExecutives", i, "name", e.target.value)} />
                        <button type="button" className="popup-dismiss" onClick={() => removeRow("hqExecutives", i)}>삭제</button>
                      </div>
                    ))}
                    <button type="button" className="btn btn-outline" onClick={() => addRow("hqExecutives", emptyExec)}>운영진 추가</button>
                  </div>
                )}

                {tab === "org" && (
                  <div>
                    <label className="form-label">기준일</label>
                    <input className="form-input" value={content.orgAsOf || ""} onChange={(e) => setContent((prev) => ({ ...prev, orgAsOf: e.target.value }))} />

                    <h4 style={{ margin: "20px 0 8px" }}>본부 단위직협</h4>
                    {(content.hqUnit || []).map((row, i) => (
                      <div key={i} className="site-admin-grid">
                        <input className="form-input" placeholder="단위직협" value={row.unit} onChange={(e) => updateList("hqUnit", i, "unit", e.target.value)} />
                        <input className="form-input" placeholder="회장" value={row.president} onChange={(e) => updateList("hqUnit", i, "president", e.target.value)} />
                        <input className="form-input" placeholder="부회장" value={row.vp} onChange={(e) => updateList("hqUnit", i, "vp", e.target.value)} />
                        <input className="form-input" placeholder="사무국장" value={row.secretary} onChange={(e) => updateList("hqUnit", i, "secretary", e.target.value)} />
                        <input className="form-input" placeholder="기타임원" value={row.etc} onChange={(e) => updateList("hqUnit", i, "etc", e.target.value)} />
                      </div>
                    ))}
                    <button type="button" className="btn btn-outline" onClick={() => addRow("hqUnit", emptyHqUnit)}>본부 행 추가</button>

                    <h4 style={{ margin: "24px 0 8px" }}>전국 단위직협 ({(content.branches || []).length}개)</h4>
                    {(content.branches || []).map((row, i) => (
                      <div key={i} className="site-admin-grid">
                        <select className="form-select" value={row.region} onChange={(e) => updateList("branches", i, "region", e.target.value)}>
                          {REGION_OPTIONS.map((r) => (
                            <option key={r} value={r}>{r}</option>
                          ))}
                        </select>
                        <input className="form-input" placeholder="단위직협" value={row.unit} onChange={(e) => updateList("branches", i, "unit", e.target.value)} />
                        <input className="form-input" placeholder="회장" value={row.president} onChange={(e) => updateList("branches", i, "president", e.target.value)} />
                        <input className="form-input" placeholder="부회장" value={row.vp} onChange={(e) => updateList("branches", i, "vp", e.target.value)} />
                        <input className="form-input" placeholder="사무국장" value={row.secretary} onChange={(e) => updateList("branches", i, "secretary", e.target.value)} />
                        <input className="form-input" placeholder="기타임원" value={row.etc} onChange={(e) => updateList("branches", i, "etc", e.target.value)} />
                        <button type="button" className="popup-dismiss" onClick={() => removeRow("branches", i)}>삭제</button>
                      </div>
                    ))}
                    <button type="button" className="btn btn-outline" onClick={() => addRow("branches", emptyBranch)}>단위직협 추가</button>
                  </div>
                )}

                {error && <p className="survey-error">{error}</p>}
                {message && <p className="form-sub" style={{ color: "#2e7d32" }}>{message}</p>}
                <button type="button" className="btn btn-primary" disabled={saving} onClick={handleSave} style={{ marginTop: 16 }}>
                  {saving ? "저장 중..." : "홈페이지에 저장"}
                </button>
              </>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
