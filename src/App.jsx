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

      {/* ── 커피캔 행사 홍보 팝업 ── */}
      {showPopup && (
        <div className="popup-overlay" onClick={closePopup}>
          <div className="popup-box popup-box--promo" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="popup-close" onClick={closePopup} aria-label="닫기">✕</button>
            <div className="promo-popup-crop">
              <img
                src={`${import.meta.env.BASE_URL}coffee-can-event.png`}
                alt="커피캔 행사 - 직협이 있기에 우리가 더 빛납니다. 오늘은 커피 한잔!"
                className="promo-popup-image"
              />
            </div>
            <div className="popup-actions">
              <button
                type="button"
                className="btn btn-primary promo-popup-cta"
                onClick={() => { setActivePage(4); closePopup(); }}
              >
                가입 신청 바로가기 →
              </button>
              <div className="popup-footer-actions">
                <button type="button" className="popup-dismiss" onClick={dismissPopupToday}>
                  오늘 그만보기
                </button>
                <span className="popup-footer-divider">|</span>
                <button type="button" className="popup-dismiss" onClick={closePopup}>닫기</button>
              </div>
            </div>
          </div>
        </div>
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
        {showWebtoonPopup && activePage !== 5 && (
          <div className="webtoon-nav-popup">
            <button type="button" className="webtoon-nav-popup-close" onClick={closeWebtoonPopup} aria-label="닫기">
              ✕
            </button>
            <p className="webtoon-nav-popup-eyebrow">NEW</p>
            <p className="webtoon-nav-popup-title">✨ 직협 웹툰</p>
            <p className="webtoon-nav-popup-desc">직장협의회 이야기를 만화로 만나보세요!</p>
            <button type="button" className="webtoon-nav-popup-btn" onClick={goToWebtoon}>
              웹툰 보러가기 →
            </button>
          </div>
        )}
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
        <p className="footer-sub">문의: 소속 지역 직장협의회 | 대표전화 1350</p>
      </footer>
    </div>
  );
}
