const API_URL = import.meta.env.VITE_SIGNUP_API_URL?.trim();
const LOCAL_KEY = "wc-signup-submissions";
const AUTH_KEY = "wc-signup-admin-auth";
const TOKEN_KEY = "wc-signup-admin-token";

function normalizeApiResult(result) {
  if (!result || typeof result !== "object") return { success: false, error: "", submissions: [] };
  return {
    success: Boolean(result.success ?? result.성공),
    submissions: result.submissions ?? result.목록 ?? [],
    submission: result.submission ?? result.신청,
    error: result.error ?? result.오류 ?? result.에러 ?? "",
  };
}

function normalizeNetworkError(err) {
  if (!err || err.message === "Failed to fetch" || err.name === "TypeError") {
    return new Error(
      "가입신청 서버에 연결할 수 없습니다. Google Apps Script URL과 '모든 사용자' 공개 설정을 확인해 주세요."
    );
  }
  return err;
}

function readLocalSubmissions() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]");
  } catch {
    return [];
  }
}

function writeLocalSubmissions(items) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(items));
}

export function isSignupApiConfigured() {
  return Boolean(API_URL);
}

export function isSignupAdminAuthenticated() {
  return sessionStorage.getItem(AUTH_KEY) === "1";
}

export function getSignupAdminToken() {
  return sessionStorage.getItem(TOKEN_KEY) || "";
}

export function setSignupAdminAuthenticated(value, token = "") {
  if (value) {
    sessionStorage.setItem(AUTH_KEY, "1");
    if (token) sessionStorage.setItem(TOKEN_KEY, token);
  } else {
    sessionStorage.removeItem(AUTH_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
  }
}

async function apiGet(params) {
  if (!API_URL) throw new Error("가입신청 API URL이 설정되지 않았습니다.");
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
  if (!API_URL) throw new Error("가입신청 API URL이 설정되지 않았습니다.");
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

export async function submitSignupApplication({ application, withholding, sig1, sig2, member, bank }) {
  const app = { ...(application || member || {}) };
  const wh = { ...(withholding || bank || {}) };

  if (!app.name && wh.name) app.name = wh.name;
  if (!wh.name && app.name) wh.name = app.name;
  if (!app.affiliation && wh.affiliation) app.affiliation = wh.affiliation;
  if (!wh.affiliation && app.affiliation) wh.affiliation = app.affiliation;
  if (!app.rank && wh.rank) app.rank = wh.rank;
  if (!wh.rank && app.rank) wh.rank = app.rank;

  const payload = {
    action: "submit",
    application: app,
    withholding: wh,
    member: app,
    bank: wh,
    sig1,
    sig2,
  };

  if (API_URL) {
    const result = await apiPost(payload);
    return result.submission;
  }

  const submission = {
    id: crypto.randomUUID(),
    submittedAt: new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" }),
    name: app.name,
    affiliation: app.affiliation,
    rank: app.rank,
    applicationDate: app.applicationDate || app.joinDate,
    application: app,
    withholding: wh,
    sig1,
    sig2,
  };
  writeLocalSubmissions([submission, ...readLocalSubmissions()]);
  return submission;
}

export async function verifySignupAdminToken(token) {
  const trimmed = String(token || "").trim();
  if (!trimmed) return { ok: false, error: "비밀번호를 입력해 주세요." };

  if (API_URL) {
    try {
      const result = await apiGet({ action: "auth", adminToken: trimmed });
      if (result.success) {
        setSignupAdminAuthenticated(true, trimmed);
        return { ok: true };
      }
      return { ok: false, error: result.error || "비밀번호가 올바르지 않습니다." };
    } catch (err) {
      throw normalizeNetworkError(err);
    }
  }

  const localToken = import.meta.env.VITE_SIGNUP_ADMIN_TOKEN?.trim() || "admin";
  if (trimmed === localToken) {
    setSignupAdminAuthenticated(true, trimmed);
    return { ok: true };
  }
  return { ok: false, error: "비밀번호가 올바르지 않습니다." };
}

export async function fetchSignupSubmissions(adminToken) {
  if (API_URL) {
    const result = await apiGet({ action: "list", adminToken: adminToken || getSignupAdminToken() });
    return result.submissions || [];
  }
  return readLocalSubmissions();
}

export async function deleteSignupSubmission(id, adminToken) {
  if (API_URL) {
    await apiPost({ action: "delete", adminToken: adminToken || getSignupAdminToken(), id });
    return;
  }
  writeLocalSubmissions(readLocalSubmissions().filter((s) => s.id !== id));
}
