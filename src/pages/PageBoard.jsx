import { useState, useEffect, useCallback } from "react";
import {
  fetchBoardPosts,
  submitBoardPost,
  deleteBoardPost,
  verifyBoardAdminToken,
  getBoardAdminToken,
  isBoardAdminAuthenticated,
  setBoardAdminAuthenticated,
  isBoardApiConfigured,
} from "../lib/boardApi";

const GUIDE_TEXT =
  "자유게시판은 누구든지 자유형식에 맞게 작성할 수 있습니다. 직협에 바라는 점이나, 직협 차원에서 추진해 볼 만한 업무 제도 또는 환경 개선, 복지 제안 등을 현행문제점과 개선안으로 구성하여 작성해주시면 감사하겠습니다. 내용이 공유되는 만큼 서로를 객관적 근거없이 비방하는 말이나 비속어, 욕설 작성 시 삭제될 수 있음에 유의바랍니다.";

const EMPTY_FORM = { office: "", content: "" };

export default function PageBoard() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  const [showAdmin, setShowAdmin] = useState(false);
  const [isAdmin, setIsAdmin] = useState(isBoardAdminAuthenticated());
  const [adminToken, setAdminToken] = useState(getBoardAdminToken());
  const [loginError, setLoginError] = useState("");

  const loadPosts = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchBoardPosts();
      setPosts(data);
    } catch (err) {
      setError(err.message || "게시글을 불러올 수 없습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    if (!form.office.trim()) {
      setFormError("지청명을 입력해 주세요.");
      return;
    }
    if (!form.content.trim()) {
      setFormError("내용을 입력해 주세요.");
      return;
    }

    setSubmitting(true);
    try {
      await submitBoardPost({ office: form.office.trim(), content: form.content.trim() });
      setForm(EMPTY_FORM);
      setFormSuccess("게시글이 등록되었습니다. 감사합니다!");
      await loadPosts();
    } catch (err) {
      setFormError(err.message || "등록에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    try {
      const result = await verifyBoardAdminToken(adminToken);
      if (result.ok) {
        setIsAdmin(true);
      } else {
        setLoginError(result.error || "비밀번호가 올바르지 않습니다.");
      }
    } catch (err) {
      setLoginError(err.message || "로그인에 실패했습니다.");
    }
  };

  const handleAdminLogout = () => {
    setBoardAdminAuthenticated(false);
    setIsAdmin(false);
    setAdminToken("");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("이 게시글을 삭제하시겠습니까?")) return;
    try {
      await deleteBoardPost(id, adminToken || getBoardAdminToken());
      await loadPosts();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <>
      <section className="hero" style={{ paddingBottom: 48 }}>
        <div className="hero-eyebrow">소통</div>
        <h1>자유게시판</h1>
        <p>지청명과 함께 자유롭게 의견을 나눠 주세요.</p>
      </section>

      <section className="section section-alt">
        <div className="container">
          {!isBoardApiConfigured() && (
            <div className="survey-setup-notice" style={{ maxWidth: 820, margin: "0 auto 20px" }}>
              ℹ️ Google Apps Script 연동 전에는 이 브라우저에만 게시글이 저장됩니다(테스트 모드).
              운영 배포 시 <code>VITE_BOARD_API_URL</code>을 설정해 주세요.
            </div>
          )}

          <div className="board-wrap">
            <div className="board-guide">
              <h3>안내</h3>
              <p>{GUIDE_TEXT}</p>
            </div>

            <form className="board-form" onSubmit={handleSubmit}>
              <h3>글쓰기</h3>
              <div className="form-group">
                <label className="form-label" htmlFor="board-office">
                  지청명 <span className="req">*</span>
                </label>
                <input
                  id="board-office"
                  className="form-input"
                  value={form.office}
                  onChange={(e) => setForm((prev) => ({ ...prev, office: e.target.value }))}
                  placeholder="예: 서울지청, 부산지청"
                  maxLength={50}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="board-content">
                  내용 <span className="req">*</span>
                </label>
                <textarea
                  id="board-content"
                  className="form-textarea board-textarea"
                  value={form.content}
                  onChange={(e) => setForm((prev) => ({ ...prev, content: e.target.value }))}
                  placeholder="현행 문제점과 개선안을 자유롭게 작성해 주세요."
                  rows={10}
                />
              </div>
              {formError && <p className="survey-error">{formError}</p>}
              {formSuccess && <p className="board-success">{formSuccess}</p>}
              <button type="submit" className="btn btn-primary btn-full" disabled={submitting}>
                {submitting ? "등록 중..." : "게시글 등록"}
              </button>
            </form>

            <div className="board-list-section">
              <h3>게시글 목록 ({posts.length}건)</h3>
              {loading && <p className="notices-empty">불러오는 중...</p>}
              {error && <p className="survey-error">{error}</p>}
              {!loading && !error && posts.length === 0 && (
                <p className="notices-empty">아직 등록된 게시글이 없습니다. 첫 글을 남겨 보세요!</p>
              )}
              <div className="board-list">
                {posts.map((post) => (
                  <article key={post.id} className="board-card">
                    <div className="board-card-header">
                      <span className="board-office-badge">{post.office}</span>
                      <time className="board-date">{post.createdAt}</time>
                    </div>
                    <div className="board-card-content">{post.content}</div>
                    {isAdmin && (
                      <button
                        type="button"
                        className="notice-delete-btn"
                        onClick={() => handleDelete(post.id)}
                      >
                        삭제
                      </button>
                    )}
                  </article>
                ))}
              </div>
            </div>

            <div className="board-admin-toggle">
              <button
                type="button"
                className="popup-dismiss"
                onClick={() => setShowAdmin((v) => !v)}
              >
                {showAdmin ? "관리자 메뉴 닫기" : "관리자 (삭제)"}
              </button>
            </div>

            {showAdmin && (
              <div className="notices-admin-panel board-admin-panel">
                {!isAdmin ? (
                  <form onSubmit={handleAdminLogin} className="notices-login-form">
                    <h3>관리자 로그인</h3>
                    <p className="survey-instruction">부적절한 게시글 삭제용 관리자 메뉴입니다.</p>
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
                ) : (
                  <div className="signup-admin-header">
                    <p>관리자로 로그인됨 — 부적절한 게시글을 삭제할 수 있습니다.</p>
                    <button type="button" className="popup-dismiss" onClick={handleAdminLogout}>
                      로그아웃
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
