export const REGION_COLORS = {
  서울청: "#1557a0",
  중부청: "#0d6e4f",
  강원: "#5b3ea8",
  경기청: "#c47d0a",
  부산청: "#b53a2a",
  대구청: "#1a7a6e",
  대전청: "#2e5fa3",
  노동위원회: "#6b3a8a",
  기타기관: "#4a5568",
};

export const REGION_OPTIONS = Object.keys(REGION_COLORS);

export const DEFAULT_SITE_CONTENT = {
  popup: {
    enabled: true,
    eyebrow: "베스트·워스트 관리자 설문",
    title: "여러분의 리더를 추천해주세요.",
    period: "",
    desc: "관리자 역량과 리더십에 대한 의견을 들려주세요.\n베스트·워스트 중 하나만 작성하셔도 됩니다.",
    prize: "5명에 한명 씩 추첨하여 커피쿠폰 발송",
    ctaLabel: "설문 참여하기 →",
    ctaPage: 6,
  },
  survey: {
    eyebrow: "고용노동부 베스트·워스트 관리자 선정",
    title: "여러분의 리더를 추천해주세요.",
    period: "",
    heroDesc: "관리자 역량과 리더십에 대한 직원 의견을 수렴하여\n베스트 사례를 공유하고, 워스트 사례를 개선하기 위한 설문입니다.",
    purpose: "본 설문은 고용노동부 직원들의 관리자 역량과 리더십에 대한 의견을 수렴하여 베스트(Best) 사례를 공유하고, 워스트(Worst) 사례를 파악·개선하기 위한 목적으로 실시합니다.",
    instruction: "베스트·워스트 평가는 **둘 중 하나만** 작성하셔도 되며, 항목별 빈칸은 비워 두셔도 제출할 수 있습니다.",
    privacyNotice: "중복설문(한명의 리더를 한명의 설문자가 다른 내용으로 중복 설문 불가, 한명이 여러명의 리더를 설문하는 거은 가능)을 방지하고, 추첨 이벤트 당첨 선물 문자 발송을 위하여 성명, 연락처를 받고 있습니다. 취합 관리자는 비밀을 유지하고 익명을 보장합니다.",
    prize: "5명에 한명 씩 추첨하여 커피쿠폰 발송",
  },
  orgAsOf: "2026.10.15",
  hqExecutives: [
    { role: "의장", name: "김동식" },
    { role: "부의장", name: "양지현" },
    { role: "사무국장", name: "임현호" },
    { role: "총무1국장", name: "양일준" },
  ],
  hqUnit: [
    { unit: "본부", president: "공석", vp: "허균", secretary: "김정혜", etc: "염보라" },
  ],
  branches: [
    { region: "서울청", unit: "서울청", president: "공석", vp: "", secretary: "", etc: "" },
    { region: "서울청", unit: "서울강남", president: "조성웅", vp: "", secretary: "김하림", etc: "" },
    { region: "서울청", unit: "서울동부", president: "이예준", vp: "", secretary: "전예린", etc: "" },
    { region: "서울청", unit: "서울서부", president: "김혜성", vp: "", secretary: "", etc: "" },
    { region: "서울청", unit: "서울남부", president: "김응년", vp: "", secretary: "박수지", etc: "" },
    { region: "서울청", unit: "서울북부", president: "김성원", vp: "", secretary: "김태완", etc: "" },
    { region: "서울청", unit: "서울관악", president: "이창호", vp: "", secretary: "", etc: "" },
    { region: "중부청", unit: "중부청", president: "우승완(휴직)", vp: "", secretary: "최태석", etc: "" },
    { region: "중부청", unit: "인천북부", president: "박태용", vp: "", secretary: "", etc: "" },
    { region: "중부청", unit: "부천", president: "김영배", vp: "", secretary: "박지후", etc: "" },
    { region: "강원", unit: "강원(춘천)", president: "공석", vp: "", secretary: "손승태", etc: "" },
    { region: "강원", unit: "강릉", president: "박주화", vp: "", secretary: "한현규", etc: "" },
    { region: "강원", unit: "원주", president: "이경록", vp: "", secretary: "박동선", etc: "" },
    { region: "강원", unit: "태백", president: "김민수", vp: "", secretary: "배민기", etc: "" },
    { region: "강원", unit: "영월", president: "", vp: "", secretary: "나유진", etc: "" },
    { region: "경기청", unit: "경기청", president: "홍순규", vp: "", secretary: "이준현", etc: "" },
    { region: "경기청", unit: "성남", president: "황병의", vp: "조영환", secretary: "김벼리", etc: "박범우(감사)" },
    { region: "경기청", unit: "안양", president: "정윤순", vp: "", secretary: "공석", etc: "서동환" },
    { region: "경기청", unit: "안산", president: "공석", vp: "", secretary: "김민석", etc: "" },
    { region: "경기청", unit: "의정부", president: "공석", vp: "박해룡", secretary: "최수빈", etc: "" },
    { region: "경기청", unit: "고양", president: "배정돈", vp: "", secretary: "장승식", etc: "" },
    { region: "경기청", unit: "평택", president: "김만수", vp: "", secretary: "공석", etc: "" },
    { region: "부산청", unit: "부산청", president: "공석", vp: "공현도", secretary: "김명진", etc: "김근아" },
    { region: "부산청", unit: "부산동부", president: "공석", vp: "", secretary: "유병욱", etc: "" },
    { region: "부산청", unit: "부산북부", president: "공석", vp: "", secretary: "", etc: "" },
    { region: "부산청", unit: "창원", president: "최재원", vp: "", secretary: "윤신희", etc: "" },
    { region: "부산청", unit: "울산", president: "공석", vp: "", secretary: "", etc: "박준" },
    { region: "부산청", unit: "울산동부", president: "전혜현", vp: "", secretary: "", etc: "" },
    { region: "부산청", unit: "양산", president: "공석", vp: "", secretary: "김병학", etc: "" },
    { region: "부산청", unit: "진주", president: "유재화", vp: "", secretary: "", etc: "박찬곤(총무)" },
    { region: "부산청", unit: "통영", president: "이영란", vp: "", secretary: "서성봉", etc: "김은정" },
    { region: "대구청", unit: "대구청", president: "박준모", vp: "", secretary: "김다진", etc: "김대웅" },
    { region: "대구청", unit: "대구서부", president: "김동식", vp: "", secretary: "도동화", etc: "임성현" },
    { region: "대구청", unit: "포항", president: "변진기", vp: "", secretary: "한명혜", etc: "" },
    { region: "대구청", unit: "구미", president: "신광철", vp: "", secretary: "김승형", etc: "윤진건" },
    { region: "대구청", unit: "영주", president: "공석", vp: "", secretary: "조성일", etc: "" },
    { region: "대구청", unit: "안동", president: "공석", vp: "", secretary: "공석", etc: "" },
    { region: "대전청", unit: "대전청", president: "이용구", vp: "", secretary: "박재현", etc: "" },
    { region: "대전청", unit: "청주", president: "양일준", vp: "", secretary: "허한강", etc: "" },
    { region: "대전청", unit: "천안", president: "복기연", vp: "전봉기", secretary: "", etc: "" },
    { region: "대전청", unit: "충주", president: "장윤석", vp: "", secretary: "나종남", etc: "" },
    { region: "대전청", unit: "보령", president: "이승기", vp: "", secretary: "이혜원", etc: "" },
    { region: "대전청", unit: "서산", president: "김기선", vp: "", secretary: "김경주", etc: "" },
    { region: "노동위원회", unit: "중노위", president: "공석", vp: "", secretary: "이지형", etc: "" },
    { region: "노동위원회", unit: "서울지노위", president: "신상돈", vp: "", secretary: "최서현", etc: "" },
    { region: "노동위원회", unit: "부산지노위", president: "공석", vp: "", secretary: "공석", etc: "" },
    { region: "노동위원회", unit: "충남지노위", president: "공석", vp: "김춘숙", secretary: "신재현", etc: "이은규(총무)" },
    { region: "노동위원회", unit: "충북지노위", president: "이학진", vp: "", secretary: "", etc: "" },
    { region: "노동위원회", unit: "경북지노위", president: "김상현", vp: "이정주", secretary: "", etc: "" },
    { region: "기타기관", unit: "산심위", president: "김성경", vp: "전재영", secretary: "도경환", etc: "이지은(감사)" },
    { region: "기타기관", unit: "고객상담센터", president: "정명화", vp: "", secretary: "", etc: "황현지(총무)" },
  ],
};

const STALE_PERIOD_RE = /11\s*\.\s*16\s*\.?\s*~\s*11\s*\.\s*27/;

export function isStalePeriod(value) {
  return STALE_PERIOD_RE.test(String(value || "").replace(/\s/g, " "));
}

export function extractPeriodFromText(text) {
  for (const line of String(text || "").split("\n")) {
    const t = line.trim();
    const matched = t.match(/^설문기간\s*[:：]?\s*(.+)$/);
    if (matched) return matched[1].trim();
  }
  return "";
}

export function stripPeriodLines(text, keepPeriod = "") {
  const keep = String(keepPeriod || "").trim();
  return String(text || "")
    .split("\n")
    .map((line) => {
      let t = line;
      if (keep) t = t.split(keep).join("");
      t = t.replace(STALE_PERIOD_RE, "");
      t = t.replace(/설문기간\s*[:：]?\s*/g, "");
      return t.replace(/\s{2,}/g, " ").trim();
    })
    .filter(Boolean)
    .join("\n");
}

function firstNonStalePeriod(values) {
  const cleaned = values.map((v) => String(v || "").trim()).filter(Boolean);
  return cleaned.find((v) => !isStalePeriod(v)) || "";
}

export function mergeSiteContent(raw) {
  const base = JSON.parse(JSON.stringify(DEFAULT_SITE_CONTENT));
  if (!raw || typeof raw !== "object") return base;
  if (raw.popup && typeof raw.popup === "object") {
    base.popup = { ...base.popup, ...raw.popup };
  }
  if (raw.survey && typeof raw.survey === "object") {
    base.survey = { ...base.survey, ...raw.survey };
  }
  const period = firstNonStalePeriod([
    raw?.popup?.period,
    raw?.survey?.period,
    extractPeriodFromText(raw?.popup?.desc),
    extractPeriodFromText(raw?.survey?.heroDesc),
    extractPeriodFromText(raw?.popup?.prize),
  ]);
  base.popup.period = period;
  base.survey.period = period;
  base.popup.desc = stripPeriodLines(base.popup.desc, period);
  base.survey.heroDesc = stripPeriodLines(base.survey.heroDesc, period);
  if (isStalePeriod(base.popup.prize)) {
    base.popup.prize = stripPeriodLines(base.popup.prize, period);
  }
  if (isStalePeriod(base.survey.prize)) {
    base.survey.prize = stripPeriodLines(base.survey.prize, period);
  }
  if (raw.orgAsOf) base.orgAsOf = String(raw.orgAsOf);
  if (Array.isArray(raw.hqExecutives) && raw.hqExecutives.length) {
    base.hqExecutives = raw.hqExecutives.map((e) => ({
      role: String(e.role || ""),
      name: String(e.name || ""),
    }));
  }
  if (Array.isArray(raw.hqUnit) && raw.hqUnit.length) {
    base.hqUnit = raw.hqUnit.map((r) => ({
      unit: String(r.unit || ""),
      president: String(r.president || ""),
      vp: String(r.vp || ""),
      secretary: String(r.secretary || ""),
      etc: String(r.etc || ""),
    }));
  }
  if (Array.isArray(raw.branches) && raw.branches.length) {
    base.branches = raw.branches.map((r) => ({
      region: String(r.region || ""),
      unit: String(r.unit || ""),
      president: String(r.president || ""),
      vp: String(r.vp || ""),
      secretary: String(r.secretary || ""),
      etc: String(r.etc || ""),
    }));
  }
  return base;
}
