const API_URL = import.meta.env.VITE_NOTICES_API_URL?.trim();
const LOCAL_KEY = "wc-notices";
const AUTH_KEY = "wc-notices-admin-auth";
const TOKEN_KEY = "wc-notices-admin-token";

export const NOTICE_CATEGORIES = [
  { id: "규정", label: "규정", icon: "📜" },
  { id: "행사", label: "행사", icon: "🎉" },
  { id: "공지", label: "공지", icon: "📢" },
  { id: "기타", label: "기타", icon: "📌" },
];

export function isNoticesApiConfigured() {
  return Boolean(API_URL);
}

export function isAdminAuthenticated() {
  return sessionStorage.getItem(AUTH_KEY) === "1";
}

export function getAdminToken() {
  return sessionStorage.getItem(TOKEN_KEY) || "";
}

export function setAdminAuthenticated(value, token = "") {
  if (value) {
    sessionStorage.setItem(AUTH_KEY, "1");
    if (token) sessionStorage.setItem(TOKEN_KEY, token);
  } else {
    sessionStorage.removeItem(AUTH_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
  }
}

function readLocalNotices() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]");
  } catch {
    return [];
  }
}

function writeLocalNotices(notices) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(notices));
}

function normalizeNetworkError(err) {
  if (!err || err.message === "Failed to fetch" || err.name === "TypeError") {
    return new Error(
      "공지사항 서버에 연결할 수 없습니다. Google Apps Script 웹 앱 URL(/exec)과 '모든 사용자' 공개 설정을 확인해 주세요."
    );
  }
  return err;
}

function normalizeApiResult(result) {
  if (!result || typeof result !== "object") return { success: false, notices: [], error: "" };
  return {
    success: Boolean(result.success ?? result.성공),
    notices: result.notices ?? result.알림 ?? [],
    notice: result.notice ?? result.공지,
    error: result.error ?? result.오류 ?? result.에러 ?? "",
  };
}

async function apiGet(params) {
  if (!API_URL) throw new Error("공지사항 API URL이 설정되지 않았습니다.");

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
    throw new Error(
      "Google Apps Script 응답을 읽을 수 없습니다. URL이 /exec 로 끝나는지 확인해 주세요."
    );
  }

  if (!response.ok) {
    const normalized = normalizeApiResult(result);
    throw new Error(normalized.error || `서버 응답 오류 (${response.status})`);
  }

  return normalizeApiResult(result);
}

async function apiRequest(payload) {
  if (!API_URL) throw new Error("공지사항 API URL이 설정되지 않았습니다.");

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

export async function fetchNotices() {
  if (API_URL) {
    try {
      const result = await apiGet({ action: "list" });
      if (!result.success) throw new Error(result.error || "공지사항을 불러올 수 없습니다.");
      return result.notices || [];
    } catch (err) {
      throw normalizeNetworkError(err);
    }
  }

  return readLocalNotices().sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return String(b.createdAt).localeCompare(String(a.createdAt));
  });
}

export async function verifyAdminToken(token) {
  const trimmed = String(token || "").trim();
  if (!trimmed) {
    return { ok: false, error: "비밀번호를 입력해 주세요." };
  }

  if (API_URL) {
    try {
      const result = await apiGet({ action: "auth", adminToken: trimmed });
      if (result.success) {
        setAdminAuthenticated(true, trimmed);
        return { ok: true };
      }
      return { ok: false, error: result.error || "비밀번호가 올바르지 않습니다." };
    } catch (err) {
      throw normalizeNetworkError(err);
    }
  }

  const localToken = import.meta.env.VITE_NOTICES_ADMIN_TOKEN?.trim() || "admin";
  if (trimmed === localToken) {
    setAdminAuthenticated(true, trimmed);
    return { ok: true };
  }
  return { ok: false, error: "비밀번호가 올바르지 않습니다." };
}

export async function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result.split(",")[1];
      resolve({ name: file.name, mimeType: file.type, data: base64 });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function createNotice({ title, category, content, pinned, files, adminToken }) {
  const encodedFiles = await Promise.all(Array.from(files || []).map(fileToBase64));

  if (API_URL) {
    const result = await apiRequest({
      action: "create",
      adminToken,
      title: title.trim(),
      category,
      content: content.trim(),
      pinned: !!pinned,
      files: encodedFiles,
    });
    return result.notice;
  }

  const notice = {
    id: crypto.randomUUID(),
    createdAt: new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" }),
    title: title.trim(),
    category,
    content: content.trim(),
    pinned: !!pinned,
    files: encodedFiles.map((f) => ({
      name: f.name,
      url: `data:${f.mimeType};base64,${f.data}`,
      mimeType: f.mimeType,
    })),
  };

  const notices = readLocalNotices();
  writeLocalNotices([notice, ...notices]);
  return notice;
}

export async function deleteNotice(id, adminToken) {
  if (API_URL) {
    await apiRequest({ action: "delete", adminToken, id });
    return;
  }

  writeLocalNotices(readLocalNotices().filter((n) => n.id !== id));
}
