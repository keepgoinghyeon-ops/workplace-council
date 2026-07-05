export const BEST_CRITERIA = [
  { id: "leadership", label: "리더십", desc: "조직에 대한 명확한 방향과 목표 제시" },
  { id: "communication", label: "소통능력", desc: "직원 의견 청취 및 원활한 커뮤니케이션" },
  { id: "fairness", label: "공정성", desc: "인사, 업무 배분, 평가 등에서 공정함" },
  { id: "expertise", label: "전문성", desc: "정책·업무에 대한 풍부한 지식과 문제해결 능력" },
  { id: "respect", label: "배려·존중", desc: "직원을 존중하고 인격적으로 대함" },
  { id: "motivation", label: "동기부여", desc: "직원의 성장과 업무 의욕을 적극 지원" },
];

export const WORST_CATEGORIES = [
  {
    title: "1. 신체·감정 폭력형",
    items: [
      { id: "w1a", label: "아래 직원에게 몸으로 위협(밀치기, 물건 던지기 등)하거나 과도한 고성·모욕적 언사를 함" },
      { id: "w1b", label: "회의·보고 시 강압적 태도로 정서적 압박을 가함" },
    ],
  },
  {
    title: "2. 모멸·비하형",
    items: [
      { id: "w2a", label: "외모, 나이, 성별, 출신, 학력 등을 이유로 공개적인 조롱·비하 발언을 함" },
      { id: "w2b", label: "작은 실수를 과대해석하여 공개적으로 망신을 주거나 모욕적 별명·칭호를 사용함" },
    ],
  },
  {
    title: "3. 업무 전가·차별형",
    items: [
      { id: "w3a", label: "자신의 업무를 직원에게 무리하게 전가하거나 특정 인원에게 불필요한 잡무를 반복 배정함" },
      { id: "w3b", label: "승진·교육·출장 기회 등에서 부당하게 배제함" },
    ],
  },
  {
    title: "4. 감시·통제형",
    items: [
      { id: "w4a", label: "과도한 보고 요구, 불필요한 실시간 업무 점검을 반복함" },
      { id: "w4b", label: "휴식·퇴근 후 업무 연락, 주말·야간 업무 강요를 함" },
      { id: "w4c", label: "CCTV, 메신저 등을 통한 사생활 침해 수준의 감시를 함" },
    ],
  },
  {
    title: "5. 사생활 개입형",
    items: [
      { id: "w5a", label: "사적 모임, 종교·정치 활동 등에 강제 참여를 요구함" },
      { id: "w5b", label: "부하직원의 가족·연애·재정 등 사생활에 과도하게 간섭함" },
      { id: "w5c", label: "사적인 심부름·업무를 지시함" },
    ],
  },
  {
    title: "6. 갈라치기·소문형",
    items: [
      { id: "w6a", label: "부하직원을 편 가르기하거나 불필요한 경쟁·대립을 조장함" },
      { id: "w6b", label: "확인되지 않은 소문·비방을 퍼뜨리고 특정 직원을 사회적으로 고립시킴" },
    ],
  },
];

const worstLabelMap = Object.fromEntries(
  WORST_CATEGORIES.flatMap((cat) => cat.items.map((item) => [item.id, item.label]))
);

export function getBestCriteriaLabels(ids) {
  return ids
    .map((id) => BEST_CRITERIA.find((c) => c.id === id)?.label)
    .filter(Boolean);
}

export function getWorstItemLabels(ids) {
  return ids.map((id) => worstLabelMap[id]).filter(Boolean);
}
