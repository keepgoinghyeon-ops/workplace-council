import { useState } from "react";
import { WEBTOON_EPISODES } from "../components/WebtoonPanels";

function WebtoonPanel({ panel, index, themeColor, accentColor }) {
  const { Panel, tipBox, isLast } = panel;
  return (
    <div className="wt-panel wt-panel--comic">
      <div className="wt-panel-num" style={{ background: themeColor }}>{String(index + 1).padStart(2, "0")}</div>
      <Panel />
      {tipBox && (
        <div className="wt-tip" style={{ borderColor: accentColor }}>
          <p className="wt-tip-title" style={{ color: themeColor }}>{tipBox.title}</p>
          <ul className="wt-tip-list">
            {tipBox.items.map((item, i) => <li key={i}>{item}</li>)}
          </ul>
        </div>
      )}
      {isLast && <div className="wt-end-badge" style={{ background: themeColor }}>✦ THE END ✦</div>}
    </div>
  );
}

export default function PageWebtoon() {
  const [activeEpisode, setActiveEpisode] = useState(null);
  const ep = activeEpisode !== null ? WEBTOON_EPISODES[activeEpisode] : null;

  return (
    <>
      <section className="wt-hero" style={ep ? { background: ep.bgGradient, color: "white" } : {}}>
        <div className="hero-eyebrow" style={ep ? { background: "rgba(255,255,255,0.2)", color: "white" } : {}}>직협 웹툰</div>
        <h1 className="wt-hero-title" style={ep ? { color: "white" } : {}}>
          {ep ? ep.title : "직협이 내 편인 이유"}
        </h1>
        <p style={{ color: ep ? "rgba(255,255,255,0.8)" : "var(--text-soft)", fontSize: 15, marginTop: 8 }}>
          {ep ? ep.subtitle : "웃기고, 귀엽고, 마음 따뜻해지는 직협 이야기"}
        </p>
        {ep && (
          <button
            type="button"
            className="btn btn-outline"
            style={{ marginTop: 20, color: "white", borderColor: "rgba(255,255,255,0.5)" }}
            onClick={() => setActiveEpisode(null)}
          >
            ← 화 목록으로
          </button>
        )}
      </section>

      {activeEpisode === null && (
        <section className="section">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">에피소드 목록</h2>
              <p className="section-sub">직협과 함께하는 이야기, 지금 바로 읽어보세요.</p>
            </div>
            <div className="wt-episode-grid">
              {WEBTOON_EPISODES.map((wt, i) => (
                <button key={wt.id} type="button" className="wt-episode-card" onClick={() => setActiveEpisode(i)}>
                  <div className="wt-ep-thumb" style={{ background: wt.bgGradient }}>
                    <span>{wt.thumbnail}</span>
                    <div className="wt-ep-num-badge">제{wt.id}화</div>
                  </div>
                  <div className="wt-ep-info">
                    <p className="wt-ep-title">{wt.title}</p>
                    <p className="wt-ep-sub">{wt.subtitle}</p>
                    <p className="wt-ep-count">{wt.panels.length}컷 · 웹툰 형식</p>
                  </div>
                  <div className="wt-ep-arrow" style={{ color: wt.accentColor }}>▶</div>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {ep && (
        <section className="section wt-viewer">
          <div className="wt-viewer-inner">
            {ep.panels.map((panel, i) => (
              <WebtoonPanel
                key={i}
                panel={panel}
                index={i}
                themeColor={ep.themeColor}
                accentColor={ep.accentColor}
              />
            ))}
            <div className="wt-next-wrap">
              {activeEpisode < WEBTOON_EPISODES.length - 1 ? (
                <button
                  type="button"
                  className="btn btn-blue"
                  style={{ background: WEBTOON_EPISODES[activeEpisode + 1].themeColor }}
                  onClick={() => { setActiveEpisode(activeEpisode + 1); window.scrollTo(0, 0); }}
                >
                  다음화: {WEBTOON_EPISODES[activeEpisode + 1].title} →
                </button>
              ) : (
                <button
                  type="button"
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
