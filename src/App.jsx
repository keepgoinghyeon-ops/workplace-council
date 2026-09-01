import { useState, useEffect } from "react";
import PageAbout from "./pages/PageAbout";
import PageJoin from "./pages/PageJoin";
import PageBenefits from "./pages/PageBenefits";
import PageSignup from "./pages/PageSignup";
import PageWebtoon from "./pages/PageWebtoon";
import PageSurvey from "./pages/PageSurvey";
import PageSurveyAdmin from "./pages/PageSurveyAdmin";
import PageNotices from "./pages/PageNotices";
import PageSignupAdmin from "./pages/PageSignupAdmin";
import PageBoard from "./pages/PageBoard";
import "./index.css";

const NAV_ITEMS = [
  { id: 1, label: "직장협의회란?" },
  { id: 2, label: "가입 안내 & 조직" },
  { id: 3, label: "회원 혜택" },
  { id: 4, label: "가입 신청" },
  { id: 9, label: "가입신청 관리" },
  { id: 7, label: "공지사항" },
  { id: 10, label: "자유게시판" },
  { id: 6, label: "베스트, 워스트 설문" },
  { id: 11, label: "설문 취합" },
];

const POPUP_HIDE_KEY = "wc-popup-hide-date";
const WEBTOON_POPUP_HIDE_KEY = "wc-webtoon-popup-hide";

const getTodayKey = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
};

const isPopupHiddenToday = () => localStorage.getItem(POPUP_HIDE_KEY) === getTodayKey();

export default function App() {
  const [activePage, setActivePage] = useState(1);
  const [showPopup, setShowPopup] = useState(false);
  const [showWebtoonPopup, setShowWebtoonPopup] = useState(
    () => sessionStorage.getItem(WEBTOON_POPUP_HIDE_KEY) !== "1"
  );

  useEffect(() => {
    if (isPopupHiddenToday()) return;
    const timer = setTimeout(() => setShowPopup(true), 600);
    return () => clearTimeout(timer);
  }, []);

  const closePopup = () => setShowPopup(false);

  const dismissPopupToday = () => {
    localStorage.setItem(POPUP_HIDE_KEY, getTodayKey());
    closePopup();
  };

  const closeWebtoonPopup = () => {
    sessionStorage.setItem(WEBTOON_POPUP_HIDE_KEY, "1");
    setShowWebtoonPopup(false);
  };

  const goToWebtoon = () => {
    setActivePage(5);
    closeWebtoonPopup();
  };

  return (
    <div className="app">

      {/* ── 오른쪽 롤 패널 (커피캔 행사 · 웹툰) ── */}
      {(showPopup || (showWebtoonPopup && activePage !== 5)) && (
        <aside className="side-roll-stack" aria-label="안내 패널">
          {showPopup && (
            <div className="side-roll-panel side-roll-panel--promo">
              <div className="side-roll-panel-head">
                <span>☕ 커피캔 행사</span>
                <button type="button" className="side-roll-close" onClick={closePopup} aria-label="닫기">✕</button>
              </div>
              <div className="side-roll-panel-body side-roll-panel-body--scroll">
                <div className="promo-popup-crop">
                  <img
                    src={`${import.meta.env.BASE_URL}coffee-can-event.png`}
                    alt="커피캔 행사 - 이거 마시면 직협 가입하는 거다"
                    className="promo-popup-image"
                  />
                </div>
                <button
                  type="button"
                  className="btn btn-primary side-roll-cta"
                  onClick={() => { setActivePage(4); closePopup(); }}
                >
                  가입 신청 →
                </button>
                <div className="side-roll-footer">
                  <button type="button" className="popup-dismiss" onClick={dismissPopupToday}>
                    오늘 그만
                  </button>
                </div>
              </div>
            </div>
          )}

          {showWebtoonPopup && activePage !== 5 && (
            <div className="side-roll-panel side-roll-panel--webtoon">
              <div className="side-roll-panel-head">
                <span>✨ 직협 웹툰</span>
                <button type="button" className="side-roll-close" onClick={closeWebtoonPopup} aria-label="닫기">✕</button>
              </div>
              <div className="side-roll-panel-body">
                <p className="side-roll-desc">직장협의회 이야기를 만화로 만나보세요!</p>
                <button type="button" className="side-roll-cta side-roll-cta--webtoon" onClick={goToWebtoon}>
                  웹툰 보러가기 →
                </button>
              </div>
            </div>
          )}
        </aside>
      )}

      {/* ── 헤더 ── */}
      <header className="header">
        <div className="header-inner">
          <nav className="nav">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                className={`nav-btn ${activePage === item.id ? "active" : ""}`}
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
        {activePage === 9 && <PageSignupAdmin />}
        {activePage === 5 && <PageWebtoon />}
        {activePage === 6 && <PageSurvey />}
        {activePage === 11 && <PageSurveyAdmin />}
        {activePage === 7 && <PageNotices />}
        {activePage === 10 && <PageBoard />}
      </main>

      {/* ── 푸터 ── */}
      <footer className="footer">
        <p>© 2025 고용노동부 전국 직장협의회. All rights reserved.</p>
        <p className="footer-sub">문의: 소속 지역 직장협의회</p>
      </footer>
    </div>
  );
}
