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

function explainNonJsonResponse(text, status) {
  const sample = String(text || "").replace(/\s+/g, " ").trim().slice(0, 120);
  if (!sample) {
    return (
      "가입신청 서버가 빈 응답을 반환했습니다. " +
      "signup-api.gs 웹 앱을 새 버전으로 재배포하고 액세스를 '모든 사용자'로 설정해 주세요. URL은 /exec 로 끝나야 합니다."
    );
  }
  if (/<!DOCTYPE|<html|Sign in|로그인|accounts\.google/i.test(sample)) {
    return "Google 로그인/권한 페이지가 반환되었습니다. 웹 앱 액세스를 '모든 사용자'로 설정한 뒤 새 버전으로 재배포해 주세요.";
  }
  return `가입신청 서버 응답을 읽을 수 없습니다. (HTTP ${status || "?"})`;
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

/** 서명 dataURL을 JPEG로 압축해 전송·시트 저장 한도를 넘지 않게 합니다. */
export async function compressSignatureDataUrl(dataUrl, maxWidth = 360, quality = 0.72) {
  if (!dataUrl || typeof dataUrl !== "string") return "";
  if (!dataUrl.startsWith("data:image")) return dataUrl;

  try {
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    let bitmap;
    try {
      bitmap = await createImageBitmap(blob);
    } catch {
      bitmap = null;
    }

    const drawToJpeg = (width, height, paint) => {
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, width);
      canvas.height = Math.max(1, height);
      const ctx = canvas.getContext("2d");
      if (!ctx) return dataUrl;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      paint(ctx, canvas.width, canvas.height);
      return canvas.toDataURL("image/jpeg", quality);
    };

    if (bitmap) {
      const scale = Math.min(1, maxWidth / Math.max(bitmap.width, 1));
      const out = drawToJpeg(
        Math.round(bitmap.width * scale),
        Math.round(bitmap.height * scale),
        (ctx, w, h) => {
          ctx.drawImage(bitmap, 0, 0, w, h);
          bitmap.close?.();
        }
      );
      return out;
    }

    // createImageBitmap 불가 시 Image 폴백
    return await new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        try {
          const scale = Math.min(1, maxWidth / Math.max(img.width, 1));
          resolve(
            drawToJpeg(
              Math.round(img.width * scale),
              Math.round(img.height * scale),
              (ctx, w, h) => ctx.drawImage(img, 0, 0, w, h)
            )
          );
        } catch {
          resolve(dataUrl);
        }
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    });
  } catch {
    return dataUrl;
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
  const result = await parseJsonResponse(response);
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
  const result = await parseJsonResponse(response);
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

  if (!String(app.name || "").trim()) throw new Error("이름을 입력하세요.");
  if (!String(app.affiliation || "").trim()) throw new Error("소속을 입력하세요.");
  if (!sig1) throw new Error("가입신청서 서명을 해주세요.");
  if (!sig2) throw new Error("원천징수 동의서 서명을 해주세요.");

  const [compactSig1, compactSig2] = await Promise.all([
    compressSignatureDataUrl(sig1),
    compressSignatureDataUrl(sig2),
  ]);

  if (!compactSig1 || !compactSig2) {
    throw new Error("서명 이미지를 처리하지 못했습니다. 서명란에 다시 서명한 뒤 제출해 주세요.");
  }

  const payload = {
    action: "submit",
    application: app,
    withholding: wh,
    member: app,
    bank: wh,
    sig1: compactSig1,
    sig2: compactSig2,
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
    sig1: compactSig1,
    sig2: compactSig2,
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
