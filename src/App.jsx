import { useState, useEffect } from "react";
import PageAbout from "./pages/PageAbout";
import PageJoin from "./pages/PageJoin";
import PageBenefits from "./pages/PageBenefits";
import PageSignup from "./pages/PageSignup";
import PageWebtoon from "./pages/PageWebtoon";
import "./index.css";

const NAV_ITEMS = [
  { id: 1, label: "직장협의회란?" },
  { id: 2, label: "가입 안내 & 조직" },
  { id: 3, label: "회원 혜택" },
  { id: 4, label: "가입 신청" },
  { id: 5, label: "📖 직협 웹툰", highlight: true },
];

export default function App() {
  const [activePage, setActivePage] = useState(1);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowPopup(true), 600);
    return () => clearTimeout(timer);
  }, []);

  const closePopup = () => setShowPopup(false);

  return (
    <div className="app">

      {/* ── 마스코트 팝업 ── */}
      {showPopup && (
        <div className="popup-overlay" onClick={closePopup}>
          <div className="popup-box" onClick={(e) => e.stopPropagation()}>
            <button className="popup-close" onClick={closePopup}>✕</button>
            <div className="popup-bubble">
              <span>함께라면 두렵지 않아~</span>
              <div className="popup-bubble-tail" />
            </div>
            <div className="popup-mascot-wrap">
              <img
                src={`${import.meta.env.BASE_URL}mascot.jpg`}
                alt="직협 마스코트"
                className="popup-mascot"
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.parentNode.innerHTML = '<span style="font-size:80px">🐬</span>';
                }}
              />
            </div>
            <div className="popup-actions">
              <button
                className="btn btn-primary"
                style={{ fontSize: 14, padding: "10px 24px" }}
                onClick={() => { setActivePage(4); closePopup(); }}
              >
                지금 가입하기 →
              </button>
              <button className="popup-dismiss" onClick={closePopup}>닫기</button>
            </div>
          </div>
        </div>
      )}

      {/* ── 헤더 ── */}
      <header className="header">
        <div className="header-inner">
          <div className="logo" onClick={() => setActivePage(1)}>
            <span className="logo-badge">고용노동부</span>
            <span className="logo-title">전국 직장협의회</span>
          </div>
          <nav className="nav">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                className={`nav-btn ${activePage === item.id ? "active" : ""} ${item.highlight ? "nav-btn--highlight" : ""}`}
                onClick={() => setActivePage(item.id)}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* ── 페이지 콘텐츠 ── */}
      <main className="main">
        {activePage === 1 && <PageAbout onNavigate={setActivePage} />}
        {activePage === 2 && <PageJoin />}
        {activePage === 3 && <PageBenefits onNavigate={setActivePage} />}
        {activePage === 4 && <PageSignup />}
        {activePage === 5 && <PageWebtoon />}
      </main>

      {/* ── 푸터 ── */}
      <footer className="footer">
        <p>© 2025 고용노동부 전국 직장협의회. All rights reserved.</p>
        <p className="footer-sub">문의: 소속 지역 직장협의회 | 대표전화 1350</p>
      </footer>
    </div>
  );
}
