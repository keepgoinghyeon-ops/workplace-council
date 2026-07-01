import { useState } from "react";

// ── 웹툰 데이터 ──────────────────────────────────────────────────────
const WEBTOONS = [
  {
    id: 1,
    title: "1화 — 목소리가 제도를 바꿨다",
    subtitle: "애로사항 건의부터 제도 개선까지",
    thumbnail: "🏛️",
    themeColor: "#1557a0",
    accentColor: "#3b9be8",
    bgGradient: "linear-gradient(135deg, #0d2b55 0%, #1557a0 100%)",
    panels: [
      {
        scene: "office_tired",
        speaker: "박사원",
        speakerRole: "고용노동부 5년차",
        mood: "frustrated",
        bg: "#f0f5fb",
        bubbleColor: "#fff",
        caption: "야근이 반복되는 어느 날 밤...",
        dialogue: "또 초과근무야... 이 업무량은 도저히 혼자 감당이 안 되는데. 이걸 어디다 얘기해야 하지?",
        visualDesc: "밤 늦은 사무실, 홀로 모니터 앞에 앉아 한숨 짓는 박사원",
        emoji: "😮‍💨",
        emojiCaption: "야근 중인 박사원",
      },
      {
        scene: "colleague_advice",
        speaker: "선배 김주임",
        speakerRole: "직장협의회 회원",
        mood: "friendly",
        bg: "#e8f4ff",
        bubbleColor: "#fff",
        caption: "옆자리 선배가 다가오며...",
        dialogue: "박사원, 그런 거 직협에 건의해봐! 직장협의회는 우리 직원들 고충을 공식적으로 접수해서 위에 전달해줘.",
        visualDesc: "따뜻한 미소로 직협 팜플렛을 건네는 선배",
        emoji: "🤝",
        emojiCaption: "직협을 소개하는 선배",
      },
      {
        scene: "submit_grievance",
        speaker: "박사원",
        speakerRole: "건의서 작성 중",
        mood: "hopeful",
        bg: "#f0fff4",
        bubbleColor: "#fff",
        caption: "직협 고충 접수 창구에서...",
        dialogue: "\"업무 분장 불균형으로 인한 초과근무 문제\"를 건의합니다. 제가 혼자가 아니라 팀 전체 문제예요.",
        visualDesc: "직협 접수 창구에 건의서를 제출하는 박사원, 표정이 한결 밝아짐",
        emoji: "📋",
        emojiCaption: "건의서 제출!",
      },
      {
        scene: "council_meeting",
        speaker: "직협 대표",
        speakerRole: "노사협의회 진행 중",
        mood: "professional",
        bg: "#fff8e8",
        bubbleColor: "#fff",
        caption: "노사협의회 회의실...",
        dialogue: "직원 대표로서 업무 분장 불균형 문제를 공식 안건으로 상정합니다. 현장 실태 자료를 첨부했습니다.",
        visualDesc: "회의 테이블에서 자료를 제시하는 직협 대표와 경청하는 관리자들",
        emoji: "🏛️",
        emojiCaption: "공식 노사협의회 개최",
      },
      {
        scene: "policy_change",
        speaker: "인사담당 과장",
        speakerRole: "제도 개선 발표",
        mood: "positive",
        bg: "#f0f5ff",
        bubbleColor: "#fff",
        caption: "한 달 후, 공식 발표...",
        dialogue: "직원 여러분의 건의를 반영하여 업무 분장 재조정 및 초과근무 보상 기준을 개선하겠습니다.",
        visualDesc: "전체 회의에서 제도 개선안을 발표하는 과장, 박수 치는 직원들",
        emoji: "📢",
        emojiCaption: "제도 개선 발표!",
      },
      {
        scene: "happy_ending",
        speaker: "박사원",
        speakerRole: "퇴근길에",
        mood: "happy",
        bg: "#f0fff4",
        bubbleColor: "#dcfce7",
        caption: "드디어 제시간에 퇴근하는 날...",
        dialogue: "목소리 하나가 조직을 바꿨어. 직협이 없었다면 혼자 속앓이만 했겠지. 나도 이제 후배들 목소리 전달해줘야지!",
        visualDesc: "밝은 표정으로 퇴근하는 박사원, 석양이 물드는 창문",
        emoji: "🌅",
        emojiCaption: "드디어 칼퇴근!",
        isLast: true,
      },
    ],
  },
  {
    id: 2,
    title: "2화 — 직협이 내 편이 되어준 날",
    subtitle: "소송 지원부터 결혼 축하금까지",
    thumbnail: "💑",
    themeColor: "#7c3aed",
    accentColor: "#a78bfa",
    bgGradient: "linear-gradient(135deg, #3b0764 0%, #7c3aed 100%)",
    panels: [
      {
        scene: "lawsuit_shock",
        speaker: "이주임",
        speakerRole: "근로감독관 3년차",
        mood: "shocked",
        bg: "#fef2f2",
        bubbleColor: "#fff",
        caption: "어느 날 갑자기 날아온 서류...",
        dialogue: "내가... 소송을 당했다고?! 민원인이 직무 수행 중 내 결정에 불복해서 소송을 제기했대. 어떡하지?",
        visualDesc: "법원 서류를 들고 얼굴이 창백해진 이주임",
        emoji: "😱",
        emojiCaption: "소송 서류 수령!",
      },
      {
        scene: "union_contact",
        speaker: "직협 담당자",
        speakerRole: "소송 지원팀",
        mood: "reassuring",
        bg: "#f0f5fb",
        bubbleColor: "#fff",
        caption: "직협에 연락하자...",
        dialogue: "걱정 마세요, 이주임님. 직무수행 관련 소송은 직협에서 소송비용을 지원합니다. 서류 준비 도와드릴게요!",
        visualDesc: "전화 통화로 안심시키는 직협 담당자, 이주임의 표정이 서서히 풀림",
        emoji: "📞",
        emojiCaption: "직협에 도움 요청",
      },
      {
        scene: "lawsuit_support",
        speaker: "직협 소송지원",
        speakerRole: "법률 서류 지원 완료",
        mood: "supportive",
        bg: "#eff6ff",
        bubbleColor: "#fff",
        caption: "직협의 소송비용 지원으로...",
        dialogue: "직무수행 중 발생한 정당한 공무 처리였음이 입증됐습니다. 소송비용은 직협에서 지원해드립니다!",
        visualDesc: "법정에서 승소 판결을 받는 이주임, 직협 담당자가 옆에서 지지",
        emoji: "⚖️",
        emojiCaption: "소송 지원 & 승소!",
        tipBox: {
          title: "💡 소송비용 지원 안내",
          items: [
            "대상: 직무수행 관련 소송 제기 또는 피소된 회원",
            "신청: 소속 지역 직장협의회에 서류 제출",
            "내용: 소송비용 지원 (세부 금액은 직협 문의)",
          ],
        },
      },
      {
        scene: "romance",
        speaker: "이주임",
        speakerRole: "부서 이동 후",
        mood: "happy",
        bg: "#fdf4ff",
        bubbleColor: "#fff",
        caption: "그러던 어느 날, 같은 부서로 발령 온 최주임...",
        dialogue: "최주임님도 직협 회원이셨군요? 오래 같이 일하면 좋겠는데요... (두근)",
        visualDesc: "첫 만남에 서로 어색하게 인사하는 이주임과 최주임, 배경에 하트",
        emoji: "💕",
        emojiCaption: "운명적인 만남",
      },
      {
        scene: "wedding",
        speaker: "주례",
        speakerRole: "결혼식장",
        mood: "joyful",
        bg: "#fff8f0",
        bubbleColor: "#fff",
        caption: "1년 후... 두 사람의 결혼식 날!",
        dialogue: "두 분이 고용노동부 공무원 부부로서 서로를 지지하며 살아가기를 바랍니다!",
        visualDesc: "웨딩드레스와 턱시도를 입은 행복한 두 사람, 하객들의 박수",
        emoji: "💒",
        emojiCaption: "부부공무원 탄생!",
        tipBox: {
          title: "💡 결혼 축하금 안내",
          items: [
            "금액: 회원 결혼 시 각각 20만원 지급",
            "대상: 부부 모두 회원인 경우 각각 지급",
            "신청: 소속 지역 직장협의회에 결혼 증빙 서류 제출",
          ],
        },
      },
      {
        scene: "baby",
        speaker: "이주임 & 최주임",
        speakerRole: "사내부부 1년 후",
        mood: "overjoyed",
        bg: "#f0fff4",
        bubbleColor: "#dcfce7",
        caption: "그리고 1년 후... 드디어!",
        dialogue: "여보, 우리 직협에 출산 축하금 신청하는 것도 잊지 마! 부부공무원이니까 둘 다 각각 20만원이야!",
        visualDesc: "아기를 안고 환하게 웃는 두 사람, 직협 안내문이 옆에 놓여 있음",
        emoji: "👶",
        emojiCaption: "출산 축하금도 각각 20만원!",
        tipBox: {
          title: "💡 출산 축하금 안내",
          items: [
            "금액: 출산 시 각각 20만원 지급",
            "대상: 부부 모두 회원인 경우 각각 지급",
            "신청: 소속 지역 직장협의회에 출생증명서 제출",
          ],
        },
        isLast: true,
      },
    ],
  },
];

// ── 패널 컴포넌트 ──────────────────────────────────────────────────
function WebtoonPanel({ panel, index, isActive, themeColor, accentColor }) {
  const moodEmojis = {
    frustrated: "😮‍💨", shocked: "😱", friendly: "😊",
    hopeful: "🌟", professional: "💼", positive: "📢",
    happy: "😄", reassuring: "🤗", supportive: "✊",
    joyful: "🎊", overjoyed: "🥰",
  };

  return (
    <div
      className={`wt-panel ${isActive ? "wt-panel--active" : ""}`}
      style={{ "--panel-bg": panel.bg, "--theme": themeColor, "--accent": accentColor }}
    >
      {/* 화수 배지 */}
      <div className="wt-panel-num" style={{ background: themeColor }}>
        {String(index + 1).padStart(2, "0")}
      </div>

      {/* 씬 캡션 */}
      {panel.caption && (
        <div className="wt-caption">{panel.caption}</div>
      )}

      {/* 비주얼 영역 */}
      <div className="wt-visual" style={{ background: panel.bg }}>
        <div className="wt-emoji-scene">
          <span className="wt-big-emoji">{panel.emoji}</span>
          <p className="wt-emoji-label">{panel.emojiCaption}</p>
        </div>
        <div className="wt-scene-desc">
          <span>🎨</span> {panel.visualDesc}
        </div>
      </div>

      {/* 말풍선 */}
      <div className="wt-bubble-wrap">
        <div className="wt-speaker">
          <span className="wt-speaker-name" style={{ color: themeColor }}>{panel.speaker}</span>
          <span className="wt-speaker-role">{panel.speakerRole}</span>
        </div>
        <div className="wt-bubble" style={{ background: panel.bubbleColor }}>
          <span className="wt-mood">{moodEmojis[panel.mood]}</span>
          <p>{panel.dialogue}</p>
        </div>
      </div>

      {/* 팁 박스 */}
      {panel.tipBox && (
        <div className="wt-tip" style={{ borderColor: accentColor }}>
          <p className="wt-tip-title" style={{ color: themeColor }}>{panel.tipBox.title}</p>
          <ul className="wt-tip-list">
            {panel.tipBox.items.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {/* 마지막 패널 */}
      {panel.isLast && (
        <div className="wt-end-badge" style={{ background: themeColor }}>
          ✦ END ✦
        </div>
      )}
    </div>
  );
}

// ── 메인 컴포넌트 ─────────────────────────────────────────────────
export default function PageWebtoon() {
  const [activeEpisode, setActiveEpisode] = useState(null);

  const ep = activeEpisode !== null ? WEBTOONS[activeEpisode] : null;

  return (
    <>
      {/* 히어로 */}
      <section
        className="wt-hero"
        style={{ background: ep ? ep.bgGradient : "linear-gradient(135deg, #0d2b55 0%, #1557a0 60%, #7c3aed 100%)" }}
      >
        <div className="hero-eyebrow">직협 웹툰</div>
        <h1 className="wt-hero-title">
          {ep ? ep.title : "직협이 내 편인 이유"}
        </h1>
        <p style={{ color: "rgba(255,255,255,0.82)", fontSize: 16, marginTop: 8 }}>
          {ep ? ep.subtitle : "만화로 쉽게 알아보는 직장협의회 이야기"}
        </p>
        {ep && (
          <button
            className="btn btn-outline"
            style={{ marginTop: 20 }}
            onClick={() => setActiveEpisode(null)}
          >
            ← 화 목록으로
          </button>
        )}
      </section>

      {/* 에피소드 목록 */}
      {activeEpisode === null && (
        <section className="section">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">에피소드 목록</h2>
              <p className="section-sub">직협과 함께하는 이야기, 지금 바로 읽어보세요.</p>
            </div>
            <div className="wt-episode-grid">
              {WEBTOONS.map((wt, i) => (
                <button
                  key={wt.id}
                  className="wt-episode-card"
                  onClick={() => setActiveEpisode(i)}
                >
                  <div className="wt-ep-thumb" style={{ background: wt.bgGradient }}>
                    <span>{wt.thumbnail}</span>
                    <div className="wt-ep-num-badge">제{wt.id}화</div>
                  </div>
                  <div className="wt-ep-info">
                    <p className="wt-ep-title">{wt.title}</p>
                    <p className="wt-ep-sub">{wt.subtitle}</p>
                    <p className="wt-ep-count">{wt.panels.length}컷</p>
                  </div>
                  <div className="wt-ep-arrow" style={{ color: wt.themeColor }}>▶</div>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 웹툰 뷰어 */}
      {ep && (
        <section className="section wt-viewer">
          <div className="wt-viewer-inner">
            {ep.panels.map((panel, i) => (
              <WebtoonPanel
                key={i}
                panel={panel}
                index={i}
                isActive={true}
                themeColor={ep.themeColor}
                accentColor={ep.accentColor}
              />
            ))}

            {/* 다음 에피소드 */}
            <div className="wt-next-wrap">
              {activeEpisode < WEBTOONS.length - 1 ? (
                <button
                  className="btn btn-blue"
                  style={{ background: WEBTOONS[activeEpisode + 1].themeColor }}
                  onClick={() => { setActiveEpisode(activeEpisode + 1); window.scrollTo(0, 0); }}
                >
                  다음화: {WEBTOONS[activeEpisode + 1].title} →
                </button>
              ) : (
                <button
                  className="btn btn-blue"
                  onClick={() => { setActiveEpisode(null); window.scrollTo(0, 0); }}
                >
                  ← 목록으로 돌아가기
                </button>
              )}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
