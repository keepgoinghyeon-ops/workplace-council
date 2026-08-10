import { useState, useEffect, useCallback, useRef } from "react";
import {
  fetchBoardPosts,
  submitBoardPost,
  updateBoardPost,
  deleteBoardPost,
  verifyBoardAdminToken,
  getBoardAdminToken,
  isBoardAdminAuthenticated,
  setBoardAdminAuthenticated,
  isBoardApiConfigured,
  fetchBoardApiStatus,
  BOARD_API_REQUIRED_VERSION,
  validateBoardFiles,
  isImageFile,
  isVideoFile,
  getVideoEmbedUrl,
  getMediaOpenUrl,
  getImageDisplayCandidates,
  getRememberedBoardEditKey,
} from "../lib/boardApi";

const GUIDE_TEXT =
  "자유게시판은 누구든지 자유형식에 맞게 작성할 수 있습니다. 직협에 바라는 점이나, 직협 차원에서 추진해 볼 만한 업무 제도 또는 환경 개선, 복지 제안 등을 현행문제점과 개선안으로 구성하여 작성해주시면 감사하겠습니다. 내용이 공유되는 만큼 서로를 객관적 근거없이 비방하는 말이나 비속어, 욕설 작성 시 삭제될 수 있음에 유의바랍니다.";

const PRIVATE_NOTICE =
  "귀하가 작성한 글은 홈페이지내에서 비공개되나, 관리자는 확인가능하니 비속어, 근거없는 비방글은 삼가하여 주시기 바랍니다.";

const EMPTY_FORM = {
  office: "",
  title: "",
  content: "",
  isPrivate: false,
  files: [],
  editKey: "",
};

function BoardImage({ file }) {
  const candidates = getImageDisplayCandidates(file);
  const [index, setIndex] = useState(0);
  const src = candidates[index] || "";
  const openUrl = getMediaOpenUrl(file);

  if (!src && !openUrl) return null;

  return (
    <a
      href={openUrl || src}
      target="_blank"
      rel="noopener noreferrer"
      className="board-gallery-item"
    >
      {src ? (
        <img
          src={src}
          alt={file.name || "첨부 사진"}
          loading="lazy"
          onError={() => {
            if (index < candidates.length - 1) setIndex((v) => v + 1);
          }}
        />
      ) : (
        <span className="board-media-fallback">🖼 {file.name || "사진 보기"}</span>
      )}
    </a>
  );
}

function BoardMedia({ files }) {
  const list = files || [];
  if (!list.length) return null;

  const images = list.filter(isImageFile);
  const videos = list.filter((f) => isVideoFile(f) && !isImageFile(f));
  const others = list.filter((f) => !isImageFile(f) && !isVideoFile(f));

  return (
    <div className="board-media">
      {images.length > 0 && (
        <div className="board-gallery">
          {images.map((file, i) => (
            <BoardImage key={`img-${i}`} file={file} />
          ))}
        </div>
      )}
      {videos.map((file, i) => {
        const embed = getVideoEmbedUrl(file);
        const openUrl = getMediaOpenUrl(file) || embed;
        return (
          <div key={`vid-${i}`} className="board-video-wrap">
            {embed ? (
              <iframe
                src={embed}
                title={file.name || "첨부 동영상"}
                className="board-video-frame"
                allow="autoplay; encrypted-media; fullscreen"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
              />
            ) : null}
            <a href={openUrl} target="_blank" rel="noopener noreferrer" className="board-media-link">
              🎬 {file.name || "새 창에서 동영상 보기"}
            </a>
          </div>
        );
      })}
      {others.map((file, i) => (
        <a
          key={`other-${i}`}
          href={getMediaOpenUrl(file) || file.url}
          target="_blank"
          rel="noopener noreferrer"
          className="board-media-link"
        >
          📎 {file.name || "첨부파일"}
        </a>
      ))}
    </div>
  );
}

export default function PageBoard() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const fileInputRef = useRef(null);
  const formRef = useRef(null);

  const [expandedId, setExpandedId] = useState(null);
  const [apiStatus, setApiStatus] = useState(null);
  const [dismissApiBanner, setDismissApiBanner] = useState(false);

  const [showAdmin, setShowAdmin] = useState(false);
  const [isAdmin, setIsAdmin] = useState(isBoardAdminAuthenticated());
  const [adminToken, setAdminToken] = useState(getBoardAdminToken());
  const [loginError, setLoginError] = useState("");

  const loadPosts = useCallback(async (overrideAdminToken) => {
    setLoading(true);
    setError("");
    try {
      const token =
        overrideAdminToken !== undefined
          ? overrideAdminToken
          : isAdmin
            ? adminToken || getBoardAdminToken()
            : "";
      const data = await fetchBoardPosts(token || undefined);
      setPosts(data);
    } catch (err) {
      setError(err.message || "게시글을 불러올 수 없습니다.");
    } finally {
      setLoading(false);
    }
  }, [isAdmin, adminToken]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!isBoardApiConfigured()) {
        if (!cancelled) {
          setApiStatus({ configured: false, outdated: false, supportsMedia: true, apiVersion: BOARD_API_REQUIRED_VERSION });
        }
        return;
      }
      const status = await fetchBoardApiStatus();
      if (!cancelled) setApiStatus(status);
    })();
    return () => { cancelled = true; };
  }, []);

  const resetForm = () => {
    setForm({ ...EMPTY_FORM });
    setEditingId(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFilesChange = (e) => {
    const selected = Array.from(e.target.files || []);
    const err = validateBoardFiles(selected);
    if (err) {
      setFormError(err);
      setForm((prev) => ({ ...prev, files: [] }));
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    setFormError("");
    setForm((prev) => ({ ...prev, files: selected }));
  };

  const startEdit = (post) => {
    const remembered = getRememberedBoardEditKey(post.id);
    let key = remembered;
    if (!isAdmin && !key) {
      key = window.prompt("게시글 수정용 비밀번호를 입력해 주세요.") || "";
      if (!key.trim()) return;
    } else if (!isAdmin && key) {
      // remembered key available
    } else if (isAdmin && !key) {
      key = ""; // admin can update without edit key via admin token
    }

    setEditingId(post.id);
    setExpandedId(post.id);
    setForm({
      office: post.office || "",
      title: post.title || "",
      content: post.content || "",
      isPrivate: Boolean(post.isPrivate),
      files: [],
      editKey: key,
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
    setFormError("");
    setFormSuccess("수정할 내용을 바꾼 뒤 '수정 완료'를 눌러 주세요.");
    // 페이지 맨 위 경고 배너가 아니라 글쓰기/수정 폼으로 이동
    requestAnimationFrame(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    if (!form.office.trim()) {
      setFormError("지청명을 입력해 주세요.");
      return;
    }
    if (!form.title.trim()) {
      setFormError("제목을 입력해 주세요.");
      return;
    }
    if (!form.content.trim()) {
      setFormError("내용을 입력해 주세요.");
      return;
    }
    if (!editingId && form.editKey.trim().length < 4) {
      setFormError("수정용 비밀번호를 4자 이상 입력해 주세요.");
      return;
    }
    const fileErr = validateBoardFiles(form.files);
    if (fileErr) {
      setFormError(fileErr);
      return;
    }

    const wasPrivate = form.isPrivate;
    setSubmitting(true);
    try {
      if (editingId) {
        await updateBoardPost({
          id: editingId,
          office: form.office.trim(),
          title: form.title.trim(),
          content: form.content.trim(),
          isPrivate: wasPrivate,
          files: form.files,
          editKey: form.editKey,
          adminToken: isAdmin ? adminToken || getBoardAdminToken() : "",
        });
        setFormSuccess("게시글이 수정되었습니다.");
      } else {
        await submitBoardPost({
          office: form.office.trim(),
          title: form.title.trim(),
          content: form.content.trim(),
          isPrivate: wasPrivate,
          files: form.files,
          editKey: form.editKey.trim(),
        });
        setFormSuccess(
          wasPrivate
            ? "비공개 게시글이 등록되었습니다. 홈페이지 목록에는 표시되지 않습니다."
            : "게시글이 등록되었습니다. 감사합니다!"
        );
      }
      resetForm();
      await loadPosts();
    } catch (err) {
      const msg = err.message || (editingId ? "수정에 실패했습니다." : "등록에 실패했습니다.");
      if (/unknown action/i.test(msg)) {
        setFormError(
          "서버에 수정 기능이 없습니다. Apps Script에 최신 board-api.gs를 붙여넣고 웹 앱을 새 버전으로 재배포해 주세요."
        );
      } else {
        setFormError(msg);
      }
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
        await loadPosts(adminToken);
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
    loadPosts("");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("이 게시글을 삭제하시겠습니까?")) return;
    try {
      let editKey = getRememberedBoardEditKey(id);
      if (!isAdmin && !editKey) {
        editKey = window.prompt("삭제하려면 수정용 비밀번호를 입력해 주세요.") || "";
        if (!editKey.trim()) return;
      }
      await deleteBoardPost(
        id,
        isAdmin ? adminToken || getBoardAdminToken() : "",
        editKey
      );
      if (editingId === id) resetForm();
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
        <p>제목과 함께 자유롭게 의견을 나눠 주세요. 사진·동영상도 첨부할 수 있습니다.</p>
      </section>

      <section className="section section-alt">
        <div className="container">
          {!isBoardApiConfigured() && (
            <div className="survey-setup-notice" style={{ maxWidth: 820, margin: "0 auto 20px" }}>
              ℹ️ Google Apps Script 연동 전에는 이 브라우저에만 게시글이 저장됩니다(테스트 모드).
              운영 배포 시 <code>VITE_BOARD_API_URL</code>을 설정해 주세요.
            </div>
          )}
          {!dismissApiBanner && apiStatus?.configured && (apiStatus.apiVersion || 0) < BOARD_API_REQUIRED_VERSION && (
            <div className="survey-setup-notice" style={{ maxWidth: 820, margin: "0 auto 20px", borderColor: "#e65100" }}>
              ⚠️ 참고: 사진·동영상 첨부를 쓰려면 Apps Script 재배포가 필요합니다.
              (글 수정·제목 작성은 계속 가능합니다)
              <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button
                  type="button"
                  className="popup-dismiss"
                  onClick={async () => {
                    const status = await fetchBoardApiStatus();
                    setApiStatus(status);
                    alert(
                      status.apiVersion >= BOARD_API_REQUIRED_VERSION
                        ? `연결 정상 (apiVersion ${status.apiVersion}) — 첨부 사용 가능`
                        : `아직 apiVersion ${status.apiVersion || 0} 입니다. board-api.gs 붙여넣기 → setupDriveFolder 실행 → 웹 앱 새 버전 배포가 필요합니다.`
                    );
                  }}
                >
                  서버 버전 확인
                </button>
                <button type="button" className="popup-dismiss" onClick={() => setDismissApiBanner(true)}>
                  닫기
                </button>
              </div>
            </div>
          )}

          <div className="board-wrap">
            <div className="board-guide">
              <h3>안내</h3>
              <p>{GUIDE_TEXT}</p>
            </div>

            <form className="board-form" ref={formRef} onSubmit={handleSubmit}>
              <h3>{editingId ? "게시글 수정" : "글쓰기"}</h3>
              {editingId && (
                <p className="board-edit-banner">
                  수정 중입니다.{" "}
                  <button type="button" className="popup-dismiss" onClick={resetForm}>
                    수정 취소
                  </button>
                </p>
              )}
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
                <label className="form-label" htmlFor="board-title">
                  제목 <span className="req">*</span>
                </label>
                <input
                  id="board-title"
                  className="form-input"
                  value={form.title}
                  onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="게시글 제목을 입력해 주세요"
                  maxLength={100}
                  required
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
              <div className="form-group">
                <label className="form-label" htmlFor="board-files">
                  사진·동영상 첨부 {editingId ? "(선택 시 기존 첨부 교체)" : ""}
                </label>
                <input
                  id="board-files"
                  ref={fileInputRef}
                  type="file"
                  className="form-input"
                  accept="image/*,video/*"
                  multiple
                  onChange={handleFilesChange}
                />
                <p className="board-file-hint">
                  사진 최대 5MB, 동영상 최대 12MB · 최대 5개까지
                </p>
                {form.files.length > 0 && (
                  <div className="board-file-selected">
                    <span>선택됨: {form.files.map((f) => f.name).join(", ")}</span>
                    <button
                      type="button"
                      className="popup-dismiss"
                      onClick={() => {
                        setForm((prev) => ({ ...prev, files: [] }));
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                    >
                      첨부 취소
                    </button>
                  </div>
                )}
              </div>
              {!editingId && (
                <div className="form-group">
                  <label className="form-label" htmlFor="board-edit-key">
                    수정용 비밀번호 <span className="req">*</span>
                  </label>
                  <input
                    id="board-edit-key"
                    type="password"
                    className="form-input"
                    value={form.editKey}
                    onChange={(e) => setForm((prev) => ({ ...prev, editKey: e.target.value }))}
                    placeholder="나중에 수정할 때 사용할 비밀번호 (4자 이상)"
                    minLength={4}
                    autoComplete="new-password"
                  />
                  <p className="board-file-hint">작성자만 글을 수정·삭제할 수 있도록 비밀번호를 설정해 주세요.</p>
                </div>
              )}
              {editingId && !isAdmin && (
                <div className="form-group">
                  <label className="form-label" htmlFor="board-edit-key-edit">
                    수정용 비밀번호 <span className="req">*</span>
                  </label>
                  <input
                    id="board-edit-key-edit"
                    type="password"
                    className="form-input"
                    value={form.editKey}
                    onChange={(e) => setForm((prev) => ({ ...prev, editKey: e.target.value }))}
                    placeholder="등록 시 설정한 수정용 비밀번호"
                    autoComplete="current-password"
                  />
                </div>
              )}
              <div className="form-group board-private-group">
                <label className="board-private-option">
                  <input
                    type="checkbox"
                    checked={form.isPrivate}
                    onChange={(e) => setForm((prev) => ({ ...prev, isPrivate: e.target.checked }))}
                  />
                  <span>비공개로 작성</span>
                </label>
                {form.isPrivate && (
                  <p className="board-private-notice">{PRIVATE_NOTICE}</p>
                )}
              </div>
              {formError && <p className="survey-error">{formError}</p>}
              {formSuccess && <p className="board-success">{formSuccess}</p>}
              <button type="submit" className="btn btn-primary btn-full" disabled={submitting}>
                {submitting ? (editingId ? "수정 중..." : "등록 중...") : editingId ? "수정 완료" : "게시글 등록"}
              </button>
            </form>

            <div className="board-list-section">
              <h3>
                게시글 목록 ({posts.length}건)
                {isAdmin && <span className="board-admin-list-hint"> · 비공개 글 포함</span>}
              </h3>
              {loading && <p className="notices-empty">불러오는 중...</p>}
              {error && <p className="survey-error">{error}</p>}
              {!loading && !error && posts.length === 0 && (
                <p className="notices-empty">아직 등록된 게시글이 없습니다. 첫 글을 남겨 보세요!</p>
              )}
              <div className="board-list">
                {posts.map((post) => {
                  const expanded = expandedId === post.id;
                  const titleText = post.title?.trim() || "(제목 없음)";
                  const hasFiles = (post.files || []).length > 0;
                  const canAuthorEdit = Boolean(getRememberedBoardEditKey(post.id)) || post.hasEditKey;

                  if (!post.isPrivate) {
                    return (
                      <article key={post.id} className={`board-card ${expanded ? "board-card--open" : ""}`}>
                        <div className="board-card-header">
                          <span className="board-office-badge">{post.office}</span>
                          <time className="board-date">{post.createdAt}</time>
                        </div>
                        <button
                          type="button"
                          className="board-card-title-btn"
                          onClick={() => setExpandedId(expanded ? null : post.id)}
                          aria-expanded={expanded}
                        >
                          <h4 className="board-card-title">{titleText}</h4>
                          <span className="board-card-toggle">{expanded ? "▲ 접기" : "▼ 내용 보기"}</span>
                        </button>
                        {expanded && (
                          <div className="board-card-body">
                            <div className="board-card-content">{post.content}</div>
                            <BoardMedia files={post.files} />
                            <div className="board-card-actions">
                              {(canAuthorEdit || isAdmin) && (
                                <button type="button" className="btn btn-outline board-action-btn" onClick={() => startEdit(post)}>
                                  수정
                                </button>
                              )}
                              {(canAuthorEdit || isAdmin) && (
                                <button type="button" className="notice-delete-btn" onClick={() => handleDelete(post.id)}>
                                  삭제
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                        {!expanded && hasFiles && (
                          <p className="board-attach-hint">첨부파일 있음</p>
                        )}
                      </article>
                    );
                  }

                  return (
                    <article key={post.id} className="board-card board-card--private">
                      <div className="board-card-header">
                        <span className="board-office-badge">{post.office}</span>
                        <span className="board-private-badge">비공개</span>
                        <time className="board-date">{post.createdAt}</time>
                      </div>
                      <h4 className="board-card-title">{titleText}</h4>
                      <div className="board-card-content">{post.content}</div>
                      <BoardMedia files={post.files} />
                      <div className="board-card-actions">
                        {(canAuthorEdit || isAdmin) && (
                          <button type="button" className="btn btn-outline board-action-btn" onClick={() => startEdit(post)}>
                            수정
                          </button>
                        )}
                        {isAdmin && (
                          <button type="button" className="notice-delete-btn" onClick={() => handleDelete(post.id)}>
                            삭제
                          </button>
                        )}
                      </div>
                    </article>
                  );
                })}
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
                    <p className="survey-instruction">부적절한 게시글 삭제 및 비공개 글 확인용 관리자 메뉴입니다.</p>
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
                    <p>관리자로 로그인됨 — 공개·비공개 게시글을 확인하고 삭제할 수 있습니다.</p>
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
