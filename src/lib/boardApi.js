const API_URL = import.meta.env.VITE_BOARD_API_URL?.trim();
const LOCAL_KEY = "wc-board-posts";
const AUTH_KEY = "wc-board-admin-auth";
const TOKEN_KEY = "wc-board-admin-token";

function normalizeApiResult(result) {
  if (!result || typeof result !== "object") return { success: false, posts: [], error: "" };
  return {
    success: Boolean(result.success ?? result.성공),
    posts: result.posts ?? result.목록 ?? [],
    post: result.post ?? result.게시글,
    error: result.error ?? result.오류 ?? result.에러 ?? "",
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

async function apiGet(params) {
  if (!API_URL) throw new Error("자유게시판 API URL이 설정되지 않았습니다.");
  const query = new URLSearchParams({ ...params, _: String(Date.now()) });
  let response;
  try {
    response = await fetch(`${API_URL}?${query.toString()}`);
  } catch (err) {
    throw normalizeNetworkError(err);
  }
  let result;
  try {
    result = await response.json();
  } catch {
    throw new Error("Google Apps Script 응답을 읽을 수 없습니다.");
  }
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
  let result;
  try {
    result = await response.json();
  } catch {
    throw new Error("서버 응답을 확인할 수 없습니다.");
  }
  const normalized = normalizeApiResult(result);
  if (!response.ok || !normalized.success) {
    throw new Error(normalized.error || "요청에 실패했습니다.");
  }
  return normalized;
}

export async function fetchBoardPosts() {
  if (API_URL) {
    const result = await apiGet({ action: "list" });
    return result.posts || [];
  }
  return readLocalPosts();
}

export async function submitBoardPost({ office, content }) {
  const payload = { action: "submit", office, content };

  if (API_URL) {
    const result = await apiPost(payload);
    return result.post;
  }

  const post = {
    id: crypto.randomUUID(),
    createdAt: new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" }),
    office: String(office).trim(),
    content: String(content).trim(),
  };
  writeLocalPosts([post, ...readLocalPosts()]);
  return post;
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

export async function deleteBoardPost(id, adminToken) {
  if (API_URL) {
    await apiPost({ action: "delete", adminToken: adminToken || getBoardAdminToken(), id });
    return;
  }
  writeLocalPosts(readLocalPosts().filter((p) => p.id !== id));
}
