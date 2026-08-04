const API_URL = import.meta.env.VITE_BOARD_API_URL?.trim();
const LOCAL_KEY = "wc-board-posts";
const AUTH_KEY = "wc-board-admin-auth";
const TOKEN_KEY = "wc-board-admin-token";
const EDIT_KEYS_KEY = "wc-board-edit-keys";

/** 서버 board-api.gs 의 API_VERSION 과 맞춰야 제목·첨부가 정상 동작합니다. */
export const BOARD_API_REQUIRED_VERSION = 3;

const MAX_FILES = 5;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_VIDEO_BYTES = 12 * 1024 * 1024;

const IMAGE_EXT = /\.(png|jpe?g|gif|webp|bmp|svg)$/i;
const VIDEO_EXT = /\.(mp4|webm|mov|m4v|avi|mkv|ogg|ogv)$/i;

const TITLE_MARK = "【제목】";
const BODY_MARK = "\n\n【본문】\n";

/** 구버전 Apps Script(제목 열 없음)에서도 제목이 보이도록 본문에 제목을 함께 넣습니다. */
export function encodeBoardBody(title, content) {
  const t = String(title || "").trim();
  const c = String(content || "").trim();
  if (!t) return c;
  return `${TITLE_MARK}${t}${BODY_MARK}${c}`;
}

export function decodeBoardBody(raw) {
  const text = String(raw || "");
  if (!text.startsWith(TITLE_MARK)) {
    return { title: "", content: text };
  }
  const rest = text.slice(TITLE_MARK.length);
  const idx = rest.indexOf(BODY_MARK);
  if (idx < 0) {
    return { title: rest.trim(), content: "" };
  }
  return {
    title: rest.slice(0, idx).trim(),
    content: rest.slice(idx + BODY_MARK.length),
  };
}

function normalizeApiResult(result) {
  if (!result || typeof result !== "object") return { success: false, posts: [], error: "", apiVersion: 0 };
  return {
    success: Boolean(result.success ?? result.성공),
    posts: result.posts ?? result.목록 ?? [],
    post: result.post ?? result.게시글,
    error: result.error ?? result.오류 ?? result.에러 ?? "",
    apiVersion: Number(result.apiVersion ?? result.version ?? 0) || 0,
  };
}

function normalizeNetworkError(err) {
  if (!err || err.message === "Failed to fetch" || err.name === "TypeError") {
    return new Error(
      "자유게시판 서버에 연결할 수 없습니다. Google Apps Script URL과 '모든 사용자' 공개 설정을 확인해 주세요."
    );
  }
  return err;
}

function readLocalPosts() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]");
  } catch {
    return [];
  }
}

function writeLocalPosts(posts) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(posts));
}

function readEditKeys() {
  try {
    return JSON.parse(localStorage.getItem(EDIT_KEYS_KEY) || "{}");
  } catch {
    return {};
  }
}

export function rememberBoardEditKey(postId, editKey) {
  if (!postId || !editKey) return;
  const keys = readEditKeys();
  keys[postId] = String(editKey);
  localStorage.setItem(EDIT_KEYS_KEY, JSON.stringify(keys));
}

export function getRememberedBoardEditKey(postId) {
  return readEditKeys()[postId] || "";
}

export function normalizeBoardPost(raw = {}) {
  const files = (raw.files || raw.첨부 || raw.첨부파일 || []).map((f) => ({
    ...f,
    name: f.name || f.파일명 || "",
    mimeType: f.mimeType || f.type || "",
    url: f.url || f.link || "",
    driveUrl: f.driveUrl || f.drive || "",
    id: f.id || "",
  }));

  let title = String(raw.title || raw.제목 || "").trim();
  let content = String(raw.content || raw.내용 || "");
  const decoded = decodeBoardBody(content);
  if (decoded.title) {
    if (!title) title = decoded.title;
    content = decoded.content;
  }

  return {
    id: String(raw.id || ""),
    createdAt: String(raw.createdAt || raw.작성일시 || ""),
    office: String(raw.office || raw.지청명 || ""),
    title,
    content,
    isPrivate: Boolean(raw.isPrivate ?? raw.비공개),
    files,
    hasEditKey: Boolean(raw.hasEditKey ?? raw.수정키),
  };
}

export function isBoardApiConfigured() {
  return Boolean(API_URL);
}

export function isBoardAdminAuthenticated() {
  return sessionStorage.getItem(AUTH_KEY) === "1";
}

export function getBoardAdminToken() {
  return sessionStorage.getItem(TOKEN_KEY) || "";
}

export function setBoardAdminAuthenticated(value, token = "") {
  if (value) {
    sessionStorage.setItem(AUTH_KEY, "1");
    if (token) sessionStorage.setItem(TOKEN_KEY, token);
  } else {
    sessionStorage.removeItem(AUTH_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
  }
}

export function isImageFile(file) {
  const mime = (file?.mimeType || file?.type || "").toLowerCase();
  if (mime.startsWith("image/")) return true;
  const name = file?.name || "";
  if (IMAGE_EXT.test(name)) return true;
  const url = file?.url || "";
  if (/uc\?export=view/i.test(url) && !/\/preview/i.test(url)) return true;
  return false;
}

export function isVideoFile(file) {
  const mime = (file?.mimeType || file?.type || "").toLowerCase();
  if (mime.startsWith("video/")) return true;
  const name = file?.name || "";
  if (VIDEO_EXT.test(name)) return true;
  const url = file?.url || "";
  if (/\/preview/i.test(url) || /\/file\/d\//i.test(url)) {
    if (!isImageFile(file)) return true;
  }
  return false;
}

export function getVideoEmbedUrl(file) {
  if (!file) return "";
  if (file.id) return `https://drive.google.com/file/d/${file.id}/preview`;
  const url = String(file.url || "");
  if (url.includes("/preview")) return url;
  const match = url.match(/\/file\/d\/([^/]+)/) || String(file.driveUrl || "").match(/\/file\/d\/([^/]+)/);
  if (match?.[1]) return `https://drive.google.com/file/d/${match[1]}/preview`;
  return url;
}

export function getMediaOpenUrl(file) {
  if (!file) return "";
  return file.driveUrl || (file.id ? `https://drive.google.com/file/d/${file.id}/view` : file.url) || "";
}

export function validateBoardFiles(files) {
  const list = Array.from(files || []);
  if (list.length > MAX_FILES) {
    return `첨부파일은 최대 ${MAX_FILES}개까지 가능합니다.`;
  }
  for (const file of list) {
    const mime = file.type || "";
    const isImage = mime.startsWith("image/") || IMAGE_EXT.test(file.name || "");
    const isVideo = mime.startsWith("video/") || VIDEO_EXT.test(file.name || "");
    if (!isImage && !isVideo) {
      return `"${file.name}"은(는) 사진 또는 동영상만 첨부할 수 있습니다.`;
    }
    const limit = isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
    if (file.size > limit) {
      const mb = Math.round(limit / (1024 * 1024));
      return `"${file.name}" 용량이 너무 큽니다. ${isVideo ? "동영상" : "사진"}은 ${mb}MB 이하만 가능합니다.`;
    }
  }
  return "";
}

export async function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = String(reader.result || "").split(",")[1] || "";
      resolve({ name: file.name, mimeType: file.type, data: base64 });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function explainNonJsonResponse(text, status) {
  const sample = String(text || "").replace(/\s+/g, " ").trim().slice(0, 120);
  if (!sample) {
    return (
      "Google Apps Script가 빈 응답을 반환했습니다. " +
      "Apps Script에서 board-api.gs를 저장한 뒤 웹 앱을 '새 버전'으로 재배포하고, 액세스를 '모든 사용자'로 설정해 주세요. " +
      "URL은 /exec 로 끝나야 합니다."
    );
  }
  if (/<!DOCTYPE|<html|Sign in|로그인|accounts\.google/i.test(sample)) {
    return (
      "Google 로그인/권한 페이지가 반환되었습니다. " +
      "웹 앱 배포에서 액세스를 '모든 사용자'로 설정하고, Drive 권한 허용 후 새 버전으로 재배포해 주세요."
    );
  }
  if (/Error|Exception|Script function not found/i.test(sample)) {
    return (
      `Google Apps Script 실행 오류가 발생했습니다. (${status || "?"}) ` +
      "Apps Script 편집기에서 migrateBoardSheet / setupDriveFolder 를 직접 실행해 권한을 허용한 뒤 재배포해 주세요."
    );
  }
  return (
    `Google Apps Script 응답을 읽을 수 없습니다. (HTTP ${status || "?"}) ` +
    "URL이 /exec 인지, 최신 board-api.gs 재배포 여부를 확인해 주세요."
  );
}

async function parseJsonResponse(response) {
  const text = await response.text();
  if (!text || !String(text).trim()) {
    throw new Error(explainNonJsonResponse("", response.status));
  }
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(explainNonJsonResponse(text, response.status));
  }
}

async function apiGet(params) {
  if (!API_URL) throw new Error("자유게시판 API URL이 설정되지 않았습니다.");
  const query = new URLSearchParams({ ...params, _: String(Date.now()) });
  let response;
  try {
    response = await fetch(`${API_URL}?${query.toString()}`);
  } catch (err) {
    throw normalizeNetworkError(err);
  }
  const result = await parseJsonResponse(response);
  const normalized = normalizeApiResult(result);
  if (!response.ok || !normalized.success) {
    throw new Error(normalized.error || "요청에 실패했습니다.");
  }
  return normalized;
}

async function apiPost(payload) {
  if (!API_URL) throw new Error("자유게시판 API URL이 설정되지 않았습니다.");
  let response;
  try {
    response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    throw normalizeNetworkError(err);
  }
  const result = await parseJsonResponse(response);
  const normalized = normalizeApiResult(result);
  if (!response.ok || !normalized.success) {
    throw new Error(normalized.error || "요청에 실패했습니다.");
  }
  return normalized;
}

export async function fetchBoardApiStatus() {
  if (!API_URL) {
    return {
      configured: false,
      apiVersion: BOARD_API_REQUIRED_VERSION,
      supportsMedia: true,
      outdated: false,
    };
  }

  const fromVersion = (apiVersion, extra = {}) => ({
    configured: true,
    apiVersion,
    supportsMedia: apiVersion >= BOARD_API_REQUIRED_VERSION,
    outdated: apiVersion > 0 && apiVersion < BOARD_API_REQUIRED_VERSION,
    ...extra,
  });

  try {
    const result = await apiGet({ action: "status" });
    return fromVersion(result.apiVersion || 0);
  } catch {
    // status 액션이 없거나 실패한 경우 list 응답의 apiVersion으로 재확인
    try {
      const list = await apiGet({ action: "list" });
      return fromVersion(list.apiVersion || 0, { probedVia: "list" });
    } catch (err) {
      return {
        configured: true,
        apiVersion: 0,
        supportsMedia: true, // 판별 실패 시 첨부를 막지 않음
        outdated: false,
        unreachable: true,
        error: err.message || "서버 상태를 확인할 수 없습니다.",
      };
    }
  }
}

export async function fetchBoardPosts(adminToken) {
  const params = { action: "list" };
  const token = adminToken || (isBoardAdminAuthenticated() ? getBoardAdminToken() : "");
  if (token) params.adminToken = token;

  if (API_URL) {
    const result = await apiGet(params);
    return (result.posts || []).map(normalizeBoardPost);
  }

  const all = readLocalPosts().map(normalizeBoardPost);
  if (token) return all;
  return all.filter((p) => !p.isPrivate);
}

export async function submitBoardPost({
  office,
  title,
  content,
  isPrivate = false,
  files = [],
  editKey = "",
}) {
  const trimmedTitle = String(title || "").trim();
  const trimmedContent = String(content || "").trim();
  const trimmedKey = String(editKey || "").trim();
  if (!trimmedTitle) throw new Error("제목을 입력해 주세요.");
  if (!trimmedContent) throw new Error("내용을 입력해 주세요.");
  if (trimmedKey.length < 4) throw new Error("수정용 비밀번호를 4자 이상 입력해 주세요.");

  const fileError = validateBoardFiles(files);
  if (fileError) throw new Error(fileError);

  const encodedFiles = await Promise.all(Array.from(files || []).map(fileToBase64));
  // 구버전 서버는 title 필드를 무시하므로, 본문에 제목을 함께 넣어 호환합니다.
  const packedContent = encodeBoardBody(trimmedTitle, trimmedContent);

  const payload = {
    action: "submit",
    office,
    title: trimmedTitle,
    content: packedContent,
    isPrivate: Boolean(isPrivate),
    files: encodedFiles,
    editKey: trimmedKey,
  };

  if (API_URL) {
    const result = await apiPost(payload);
    const post = normalizeBoardPost(result.post || {
      office,
      title: trimmedTitle,
      content: packedContent,
      isPrivate,
      files: [],
    });
    // 서버가 제목을 완전히 누락한 경우(아주 옛 스크립트) 클라이언트가 보정
    if (!post.title) post.title = trimmedTitle;
    if (!post.content) post.content = trimmedContent;
    if (encodedFiles.length && !(post.files || []).length) {
      throw new Error(
        "글은 등록됐지만 첨부파일이 저장되지 않았습니다. Apps Script에 최신 board-api.gs를 붙여넣고 setupDriveFolder() 실행 후 웹 앱을 '새 버전'으로 재배포해 주세요. (apiVersion 3 필요)"
      );
    }
    rememberBoardEditKey(post.id, trimmedKey);
    return post;
  }

  const post = normalizeBoardPost({
    id: crypto.randomUUID(),
    createdAt: new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" }),
    office: String(office).trim(),
    title: trimmedTitle,
    content: packedContent,
    isPrivate: Boolean(isPrivate),
    files: encodedFiles.map((f) => ({
      name: f.name,
      url: `data:${f.mimeType};base64,${f.data}`,
      mimeType: f.mimeType,
    })),
    hasEditKey: true,
    editKey: trimmedKey,
  });
  const stored = { ...post, editKey: trimmedKey, content: packedContent, title: trimmedTitle };
  writeLocalPosts([stored, ...readLocalPosts()]);
  rememberBoardEditKey(post.id, trimmedKey);
  return post;
}

export async function updateBoardPost({
  id,
  office,
  title,
  content,
  isPrivate = false,
  files = [],
  clearFiles = false,
  editKey = "",
  adminToken = "",
}) {
  const trimmedTitle = String(title || "").trim();
  const trimmedContent = String(content || "").trim();
  if (!id) throw new Error("게시글 ID가 없습니다.");
  if (!trimmedTitle) throw new Error("제목을 입력해 주세요.");
  if (!trimmedContent) throw new Error("내용을 입력해 주세요.");

  const fileError = validateBoardFiles(files);
  if (fileError) throw new Error(fileError);

  const encodedFiles = files?.length
    ? await Promise.all(Array.from(files).map(fileToBase64))
    : [];

  const key = String(editKey || getRememberedBoardEditKey(id) || "").trim();
  const token = adminToken || (isBoardAdminAuthenticated() ? getBoardAdminToken() : "");
  const packedContent = encodeBoardBody(trimmedTitle, trimmedContent);

  if (API_URL) {
    const result = await apiPost({
      action: "update",
      id,
      office,
      title: trimmedTitle,
      content: packedContent,
      isPrivate: Boolean(isPrivate),
      files: encodedFiles,
      clearFiles: Boolean(clearFiles),
      editKey: key,
      adminToken: token,
    });
    if (key) rememberBoardEditKey(id, key);
    const post = normalizeBoardPost(result.post || {});
    if (!post.title) post.title = trimmedTitle;
    if (!post.content) post.content = trimmedContent;
    if (encodedFiles.length && !(post.files || []).length) {
      throw new Error(
        "수정은 됐지만 첨부파일이 저장되지 않았습니다. Apps Script에서 setupDriveFolder() 실행 후 웹 앱을 '새 버전'으로 재배포해 주세요."
      );
    }
    return post;
  }

  const posts = readLocalPosts();
  const idx = posts.findIndex((p) => p.id === id);
  if (idx < 0) throw new Error("게시글을 찾을 수 없습니다.");
  const existing = posts[idx];
  const ok = token || (key && key === String(existing.editKey || getRememberedBoardEditKey(id)));
  if (!ok) throw new Error("수정 권한이 없습니다. 수정용 비밀번호를 확인해 주세요.");

  const nextFiles = encodedFiles.length
    ? encodedFiles.map((f) => ({
        name: f.name,
        url: `data:${f.mimeType};base64,${f.data}`,
        mimeType: f.mimeType,
      }))
    : clearFiles
      ? []
      : existing.files || [];

  const updated = {
    ...existing,
    office: String(office).trim(),
    title: trimmedTitle,
    content: packedContent,
    isPrivate: Boolean(isPrivate),
    files: nextFiles,
  };
  posts[idx] = updated;
  writeLocalPosts(posts);
  if (key) rememberBoardEditKey(id, key);
  return normalizeBoardPost(updated);
}

export async function verifyBoardAdminToken(token) {
  const trimmed = String(token || "").trim();
  if (!trimmed) return { ok: false, error: "비밀번호를 입력해 주세요." };

  if (API_URL) {
    try {
      const result = await apiGet({ action: "auth", adminToken: trimmed });
      if (result.success) {
        setBoardAdminAuthenticated(true, trimmed);
        return { ok: true };
      }
      return { ok: false, error: result.error || "비밀번호가 올바르지 않습니다." };
    } catch (err) {
      throw normalizeNetworkError(err);
    }
  }

  const localToken = import.meta.env.VITE_BOARD_ADMIN_TOKEN?.trim() || "admin";
  if (trimmed === localToken) {
    setBoardAdminAuthenticated(true, trimmed);
    return { ok: true };
  }
  return { ok: false, error: "비밀번호가 올바르지 않습니다." };
}

export async function deleteBoardPost(id, adminToken, editKey = "") {
  const key = String(editKey || getRememberedBoardEditKey(id) || "").trim();
  const token = adminToken || (isBoardAdminAuthenticated() ? getBoardAdminToken() : "");

  if (API_URL) {
    await apiPost({
      action: "delete",
      adminToken: token,
      editKey: key,
      id,
    });
    return;
  }

  const posts = readLocalPosts();
  const existing = posts.find((p) => p.id === id);
  if (!existing) return;
  const ok = token || (key && key === String(existing.editKey || ""));
  if (!ok) throw new Error("삭제 권한이 없습니다.");
  writeLocalPosts(posts.filter((p) => p.id !== id));
}
