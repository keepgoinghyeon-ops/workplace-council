import { getBestCriteriaLabels, getWorstItemLabels } from "../data/surveyQuestions";

const API_URL = import.meta.env.VITE_SURVEY_SUBMIT_URL?.trim();
const LOCAL_KEY = "wc-survey-responses";
const AUTH_KEY = "wc-survey-admin-auth";
const TOKEN_KEY = "wc-survey-admin-token";

export function isSurveySubmitConfigured() {
  return Boolean(API_URL);
}

function normalizeApiResult(result) {
  if (!result || typeof result !== "object") return { success: false, responses: [], error: "" };
  return {
    success: Boolean(result.success ?? result.성공),
    responses: result.responses ?? result.목록 ?? [],
    error: result.error ?? result.오류 ?? result.에러 ?? "",
  };
}

function normalizeNetworkError(err) {
  if (!err || err.message === "Failed to fetch" || err.name === "TypeError") {
    return new Error(
      "설문 서버에 연결할 수 없습니다. Google Apps Script URL과 '모든 사용자' 공개 설정을 확인해 주세요."
    );
  }
  return err;
}

function readLocalResponses() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]");
  } catch {
    return [];
  }
}

function writeLocalResponses(items) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(items));
}

export function buildSurveyPayload(form) {
  const submittedAt = new Date().toISOString();
  const bestLabels = getBestCriteriaLabels(form.bestCriteria);
  const worstLabels = getWorstItemLabels(form.worstItems);

  return {
    id: crypto.randomUUID(),
    submittedAt,
    submittedAtLocal: new Date(submittedAt).toLocaleString("ko-KR", { timeZone: "Asia/Seoul" }),
    submitterName: form.submitterName.trim(),
    submitterPhone: form.submitterPhone.trim(),
    bestCriteria: bestLabels,
    bestCriteriaText: bestLabels.join(", "),
    bestManager: form.bestManager.trim(),
    bestReason: form.bestReason.trim(),
    worstItems: worstLabels,
    worstItemsText: worstLabels.join("\n"),
    worstManager: form.worstManager.trim(),
    worstReason: form.worstReason.trim(),
    otherOpinion: form.otherOpinion.trim(),
  };
}

async function apiGet(params) {
  if (!API_URL) throw new Error("설문 API URL이 설정되지 않았습니다.");
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
  if (!API_URL) throw new Error("설문 API URL이 설정되지 않았습니다.");
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

export async function submitSurvey(form) {
  if (!form.submitterName?.trim()) {
    throw new Error("성명을 입력해 주세요.");
  }
  if (!form.submitterPhone?.trim()) {
    throw new Error("연락처를 입력해 주세요.");
  }

  const payload = buildSurveyPayload(form);

  if (API_URL) {
    await apiPost({ action: "submit", ...payload });
    return payload;
  }

  writeLocalResponses([payload, ...readLocalResponses()]);
  return payload;
}

export function isSurveyAdminAuthenticated() {
  return sessionStorage.getItem(AUTH_KEY) === "1";
}

export function getSurveyAdminToken() {
  return sessionStorage.getItem(TOKEN_KEY) || "";
}

export function setSurveyAdminAuthenticated(value, token = "") {
  if (value) {
    sessionStorage.setItem(AUTH_KEY, "1");
    if (token) sessionStorage.setItem(TOKEN_KEY, token);
  } else {
    sessionStorage.removeItem(AUTH_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
  }
}

export async function verifySurveyAdminToken(token) {
  const trimmed = String(token || "").trim();
  if (!trimmed) return { ok: false, error: "비밀번호를 입력해 주세요." };

  if (API_URL) {
    try {
      const result = await apiGet({ action: "auth", adminToken: trimmed });
      if (result.success) {
        setSurveyAdminAuthenticated(true, trimmed);
        return { ok: true };
      }
      return { ok: false, error: result.error || "비밀번호가 올바르지 않습니다." };
    } catch (err) {
      throw normalizeNetworkError(err);
    }
  }

  const localToken = import.meta.env.VITE_SURVEY_ADMIN_TOKEN?.trim() || "admin";
  if (trimmed === localToken) {
    setSurveyAdminAuthenticated(true, trimmed);
    return { ok: true };
  }
  return { ok: false, error: "비밀번호가 올바르지 않습니다." };
}

export async function fetchSurveyResponses(adminToken) {
  if (API_URL) {
    const result = await apiGet({ action: "list", adminToken: adminToken || getSurveyAdminToken() });
    return result.responses || [];
  }
  return readLocalResponses();
}

export async function deleteSurveyResponse(id, adminToken) {
  if (API_URL) {
    await apiPost({ action: "delete", adminToken: adminToken || getSurveyAdminToken(), id });
    return;
  }
  writeLocalResponses(readLocalResponses().filter((r) => r.id !== id));
}

export function exportSurveyCsv(responses) {
  const headers = [
    "제출일시", "성명", "연락처", "베스트 항목", "베스트 관리자", "베스트 이유",
    "워스트 항목", "워스트 관리자", "워스트 이유", "기타 의견",
  ];
  const escape = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const rows = responses.map((r) => [
    r.submittedAtLocal || r.submittedAt,
    r.submitterName,
    r.submitterPhone,
    r.bestCriteriaText,
    r.bestManager,
    r.bestReason,
    r.worstItemsText,
    r.worstManager,
    r.worstReason,
    r.otherOpinion,
  ].map(escape).join(","));
  return "\uFEFF" + [headers.map(escape).join(","), ...rows].join("\n");
}
