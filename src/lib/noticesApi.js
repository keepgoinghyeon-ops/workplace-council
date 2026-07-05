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

async function apiRequest(payload) {
  if (!API_URL) throw new Error("공지사항 API URL이 설정되지 않았습니다.");

  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(payload),
  });

  let result;
  try {
    result = await response.json();
  } catch {
    throw new Error("서버 응답을 확인할 수 없습니다.");
  }

  if (!response.ok || !result.success) {
    throw new Error(result.error || "요청에 실패했습니다.");
  }

  return result;
}

export async function fetchNotices() {
  if (API_URL) {
    const url = `${API_URL}?action=list&_=${Date.now()}`;
    const response = await fetch(url);
    const result = await response.json();
    if (!result.success) throw new Error(result.error || "공지사항을 불러올 수 없습니다.");
    return result.notices || [];
  }

  return readLocalNotices().sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return String(b.createdAt).localeCompare(String(a.createdAt));
  });
}

export async function verifyAdminToken(token) {
  if (API_URL) {
    const result = await apiRequest({ action: "auth", adminToken: token });
    if (result.success) setAdminAuthenticated(true, token);
    return result.success;
  }

  const localToken = import.meta.env.VITE_NOTICES_ADMIN_TOKEN?.trim() || "admin";
  if (token === localToken) {
    setAdminAuthenticated(true, token);
    return true;
  }
  return false;
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
