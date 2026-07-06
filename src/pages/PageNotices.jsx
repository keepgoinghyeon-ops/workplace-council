import { useState, useEffect, useCallback } from "react";
import {
  NOTICE_CATEGORIES,
  fetchNotices,
  createNotice,
  deleteNotice,
  verifyAdminToken,
  getAdminToken,
  isAdminAuthenticated,
  setAdminAuthenticated,
  isNoticesApiConfigured,
} from "../lib/noticesApi";

const EMPTY_FORM = { title: "", category: "공지", content: "", pinned: false, files: [] };

function isImageFile(file) {
  return file.mimeType?.startsWith("image/") || /\.(jpg|jpeg|png|gif|webp)$/i.test(file.name);
}

export default function PageNotices() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState(null);

  const [showAdmin, setShowAdmin] = useState(false);
  const [isAdmin, setIsAdmin] = useState(isAdminAuthenticated());
  const [adminToken, setAdminToken] = useState(getAdminToken());
  const [loginError, setLoginError] = useState("");

  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  const loadNotices = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchNotices();
      setNotices(data);
    } catch (err) {
      setError(err.message || "공지사항을 불러올 수 없습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotices();
  }, [loadNotices]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    try {
      const result = await verifyAdminToken(adminToken);
      if (result.ok) {
        setIsAdmin(true);
        setLoginError("");
      } else {
        setLoginError(result.error || "비밀번호가 올바르지 않습니다.");
      }
    } catch (err) {
      setLoginError(err.message || "로그인에 실패했습니다.");
    }
  };

  const handleLogout = () => {
    setAdminAuthenticated(false);
    setIsAdmin(false);
    setAdminToken("");
    setShowAdmin(false);
    setForm(EMPTY_FORM);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    if (!form.title.trim()) {
      setFormError("제목을 입력해 주세요.");
      return;
    }

    setSubmitting(true);
    try {
      await createNotice({
        title: form.title,
        category: form.category,
        content: form.content,
        pinned: form.pinned,
        files: form.files,
        adminToken: adminToken || getAdminToken(),
      });
      setForm(EMPTY_FORM);
      setFormSuccess("공지사항이 등록되었습니다.");
      await loadNotices();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("이 공지사항을 삭제하시겠습니까?")) return;
    try {
      await deleteNotice(id, adminToken || getAdminToken());
      await loadNotices();
      if (expandedId === id) setExpandedId(null);
    } catch (err) {
      alert(err.message);
    }
  };

  const getCategoryMeta = (id) => NOTICE_CATEGORIES.find((c) => c.id === id) || NOTICE_CATEGORIES[2];

  return (
    <>
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-eyebrow">고용노동부 전국 직장협의회</div>
          <h1 style={{ fontSize: "clamp(28px, 5vw, 42px)" }}>공지사항</h1>
          <p>
            직장협의회 규정, 행사 안내, 각종 공지를 확인하실 수 있습니다.
          </p>
          <div className="hero-cta-row">
            <button
              className={`btn ${showAdmin ? "btn-outline" : "btn-primary"}`}
              onClick={() => setShowAdmin((v) => !v)}
            >
              {showAdmin ? "목록 보기" : "🔐 운영진 등록"}
            </button>
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          {!isNoticesApiConfigured() && (
            <div className="survey-setup-notice">
              ℹ️ Google Apps Script 연동 전에는 이 브라우저에만 공지가 저장됩니다(테스트 모드).
              운영 배포 시 <code>VITE_NOTICES_API_URL</code>을 설정해 주세요.
            </div>
          )}

          {isNoticesApiConfigured() && error && (
            <div className="survey-setup-notice survey-setup-notice--warn">
              ⚠️ {error}
              <br />
              <span className="notices-api-hint">
                Apps Script → 배포 → 웹 앱 URL을 GitHub Secret <code>VITE_NOTICES_API_URL</code>에 넣고,
                액세스 권한을 <strong>모든 사용자</strong>로 설정했는지 확인해 주세요.
              </span>
            </div>
          )}

          {showAdmin && (
            <div className="notices-admin-panel">
              {!isAdmin ? (
                <form onSubmit={handleLogin} className="notices-login-form">
                  <h3>운영진 로그인</h3>
                  <p className="survey-instruction">
                    공지사항 등록은 운영진만 가능합니다. 관리자 비밀번호를 입력해 주세요.
                  </p>
                  <div className="form-group">
                    <label className="form-label">운영진 비밀번호</label>
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
              ) : (
                <form onSubmit={handleSubmit} className="notices-admin-form">
                  <div className="notices-admin-header">
                    <h3>공지사항 등록</h3>
                    <button type="button" className="popup-dismiss" onClick={handleLogout}>
                      로그아웃
                    </button>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">제목 <span className="req">*</span></label>
                      <input
                        className="form-input"
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        placeholder="예) 2025년 직장협의회 규정 개정 안내"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">분류</label>
                      <select
                        className="form-select"
                        value={form.category}
                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                      >
                        {NOTICE_CATEGORIES.map((c) => (
                          <option key={c.id} value={c.id}>{c.icon} {c.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">내용</label>
                    <textarea
                      className="form-textarea"
                      rows={6}
                      value={form.content}
                      onChange={(e) => setForm({ ...form, content: e.target.value })}
                      placeholder="공지 내용을 입력해 주세요."
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">첨부파일 (규정 PDF, 행사 사진 등)</label>
                    <input
                      type="file"
                      className="form-input"
                      multiple
                      accept="image/*,.pdf,.hwp,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip"
                      onChange={(e) => setForm({ ...form, files: Array.from(e.target.files || []) })}
                    />
                    {form.files.length > 0 && (
                      <p className="notices-file-hint">
                        선택됨: {form.files.map((f) => f.name).join(", ")}
                      </p>
                    )}
                  </div>

                  <label className="form-agree">
                    <input
                      type="checkbox"
                      checked={form.pinned}
                      onChange={(e) => setForm({ ...form, pinned: e.target.checked })}
                    />
                    상단 고정
                  </label>

                  {formError && <p className="survey-error">{formError}</p>}
                  {formSuccess && <p className="notices-success">{formSuccess}</p>}

                  <button type="submit" className="btn btn-primary btn-full" disabled={submitting}>
                    {submitting ? "등록 중..." : "공지사항 등록"}
                  </button>
                </form>
              )}
            </div>
          )}

          <div className="notices-list-wrap">
            {loading && <p className="notices-empty">불러오는 중...</p>}
            {!loading && !error && notices.length === 0 && (
              <p className="notices-empty">등록된 공지사항이 없습니다.</p>
            )}

              <div className="notices-list">
                {notices.map((notice) => {
                  const cat = getCategoryMeta(notice.category);
                  const expanded = expandedId === notice.id;
                  const imageFiles = (notice.files || []).filter(isImageFile);
                  const otherFiles = (notice.files || []).filter((f) => !isImageFile(f));

                  return (
                    <article
                      key={notice.id}
                      className={`notice-card ${notice.pinned ? "notice-card--pinned" : ""}`}
                    >
                      <button
                        type="button"
                        className="notice-card-header"
                        onClick={() => setExpandedId(expanded ? null : notice.id)}
                      >
                        <div className="notice-card-meta">
                          <span className={`notice-badge notice-badge--${notice.category}`}>
                            {cat.icon} {cat.label}
                          </span>
                          {notice.pinned && <span className="notice-pin">📌 고정</span>}
                          <span className="notice-date">{notice.createdAt}</span>
                        </div>
                        <h3 className="notice-title">{notice.title}</h3>
                        {!expanded && notice.content && (
                          <p className="notice-preview">
                            {notice.content.slice(0, 100)}{notice.content.length > 100 ? "…" : ""}
                          </p>
                        )}
                        <span className="notice-toggle">{expanded ? "▲ 접기" : "▼ 자세히"}</span>
                      </button>

                      {expanded && (
                        <div className="notice-card-body">
                          {notice.content && (
                            <div className="notice-content">{notice.content}</div>
                          )}

                          {imageFiles.length > 0 && (
                            <div className="notice-gallery">
                              {imageFiles.map((file, i) => (
                                <a
                                  key={i}
                                  href={file.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="notice-gallery-item"
                                >
                                  <img src={file.url} alt={file.name} loading="lazy" />
                                </a>
                              ))}
                            </div>
                          )}

                          {otherFiles.length > 0 && (
                            <ul className="notice-files">
                              {otherFiles.map((file, i) => (
                                <li key={i}>
                                  <a href={file.url} target="_blank" rel="noopener noreferrer">
                                    📎 {file.name}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          )}

                          {isAdmin && (
                            <button
                              type="button"
                              className="notice-delete-btn"
                              onClick={() => handleDelete(notice.id)}
                            >
                              삭제
                            </button>
                          )}
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            </div>
        </div>
      </section>
    </>
  );
}
