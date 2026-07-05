import { getBestCriteriaLabels, getWorstItemLabels } from "../data/surveyQuestions";

const SUBMIT_URL = import.meta.env.VITE_SURVEY_SUBMIT_URL?.trim();

export function isSurveySubmitConfigured() {
  return Boolean(SUBMIT_URL);
}

export function buildSurveyPayload(form) {
  const submittedAt = new Date().toISOString();
  const bestLabels = getBestCriteriaLabels(form.bestCriteria);
  const worstLabels = getWorstItemLabels(form.worstItems);

  return {
    id: crypto.randomUUID(),
    submittedAt,
    submittedAtLocal: new Date(submittedAt).toLocaleString("ko-KR", { timeZone: "Asia/Seoul" }),
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

export async function submitSurvey(form) {
  if (!SUBMIT_URL) {
    throw new Error(
      "설문 제출 URL이 설정되지 않았습니다. 관리자에게 Google Sheets 연동 설정을 요청해 주세요."
    );
  }

  const payload = buildSurveyPayload(form);

  const response = await fetch(SUBMIT_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(payload),
  });

  let result;
  try {
    result = await response.json();
  } catch {
    throw new Error("서버 응답을 확인할 수 없습니다. 잠시 후 다시 시도해 주세요.");
  }

  if (!response.ok || !result.success) {
    throw new Error(result.error || "제출에 실패했습니다. 잠시 후 다시 시도해 주세요.");
  }

  return payload;
}
