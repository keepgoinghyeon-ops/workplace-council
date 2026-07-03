import { useState } from "react";

// ── SVG 삽화 컴포넌트 ────────────────────────────────────
const Illustrations = {

  // 1화-1: 야근에 지친 직원
  tired_worker: () => (
    <svg viewBox="0 0 320 220" xmlns="http://www.w3.org/2000/svg" style={{width:"100%",maxWidth:320}}>
      <rect width="320" height="220" fill="#1a1a2e" rx="12"/>
      {/* 창문 밤하늘 */}
      <rect x="220" y="20" width="80" height="90" fill="#0f3460" rx="4"/>
      <circle cx="240" cy="40" r="3" fill="#ffe66d" opacity="0.8"/>
      <circle cx="260" cy="55" r="2" fill="#ffe66d" opacity="0.6"/>
      <circle cx="280" cy="35" r="2.5" fill="#ffe66d" opacity="0.7"/>
      <circle cx="255" cy="75" r="2" fill="#ffe66d" opacity="0.5"/>
      {/* 책상 */}
      <rect x="40" y="150" width="240" height="12" fill="#4a3728" rx="4"/>
      <rect x="55" y="162" width="8" height="40" fill="#3a2a1c"/>
      <rect x="257" y="162" width="8" height="40" fill="#3a2a1c"/>
      {/* 모니터 */}
      <rect x="120" y="90" width="100" height="65" fill="#16213e" rx="6" stroke="#2a4a7a" strokeWidth="2"/>
      <rect x="125" y="95" width="90" height="52" fill="#0d3b6e" rx="3"/>
      {/* 모니터 화면 — 코드/문서 */}
      <rect x="130" y="100" width="50" height="3" fill="#4ecdc4" rx="1" opacity="0.8"/>
      <rect x="130" y="107" width="70" height="2" fill="#6b7280" rx="1" opacity="0.6"/>
      <rect x="130" y="113" width="60" height="2" fill="#6b7280" rx="1" opacity="0.6"/>
      <rect x="130" y="119" width="75" height="2" fill="#c17f5a" rx="1" opacity="0.7"/>
      <rect x="130" y="125" width="45" height="2" fill="#6b7280" rx="1" opacity="0.6"/>
      <rect x="130" y="131" width="65" height="2" fill="#4ecdc4" rx="1" opacity="0.6"/>
      {/* 모니터 받침 */}
      <rect x="162" y="155" width="16" height="8" fill="#2a4a7a"/>
      <rect x="152" y="163" width="36" height="4" fill="#2a4a7a" rx="2"/>
      {/* 서류 더미 */}
      <rect x="50" y="130" width="60" height="20" fill="#e8e2d9" rx="2"/>
      <rect x="52" y="132" width="55" height="2" fill="#b0a898"/>
      <rect x="52" y="136" width="45" height="2" fill="#b0a898"/>
      <rect x="52" y="140" width="50" height="2" fill="#b0a898"/>
      {/* 커피잔 */}
      <ellipse cx="95" cy="148" rx="12" ry="5" fill="#6b4c2a"/>
      <rect x="83" y="138" width="24" height="12" fill="#8b6542" rx="3"/>
      <path d="M107 141 Q115 144 107 147" stroke="#6b4c2a" strokeWidth="2" fill="none"/>
      {/* 연기 */}
      <path d="M92 135 Q95 128 92 122" stroke="#888" strokeWidth="1.5" fill="none" opacity="0.5" strokeLinecap="round"/>
      <path d="M98 133 Q101 126 98 120" stroke="#888" strokeWidth="1.5" fill="none" opacity="0.4" strokeLinecap="round"/>
      {/* 캐릭터 */}
      {/* 의자 */}
      <rect x="155" y="170" width="40" height="6" fill="#3a2a1c" rx="2"/>
      <rect x="170" y="176" width="10" height="20" fill="#3a2a1c"/>
      {/* 몸 */}
      <rect x="158" y="120" width="34" height="50" fill="#2d4a7a" rx="8"/>
      {/* 팔 (팔꿈치 괸 자세) */}
      <rect x="148" y="140" width="12" height="28" fill="#2d4a7a" rx="5"/>
      <rect x="190" y="140" width="12" height="28" fill="#2d4a7a" rx="5"/>
      {/* 머리 */}
      <ellipse cx="175" cy="108" rx="22" ry="20" fill="#f5c5a3"/>
      {/* 앞머리/머리카락 */}
      <ellipse cx="175" cy="90" rx="22" ry="10" fill="#3e2a1c"/>
      <rect x="153" y="90" width="8" height="18" fill="#3e2a1c" rx="4"/>
      {/* 눈 — 반쯤 감긴 */}
      <rect x="165" y="106" width="8" height="3" fill="#3e2a1c" rx="1"/>
      <rect x="179" y="106" width="8" height="3" fill="#3e2a1c" rx="1"/>
      {/* 입 — 지친 표정 */}
      <path d="M170 116 Q175 113 180 116" stroke="#c17f5a" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      {/* 한숨 */}
      <text x="200" y="100" fontSize="20" fill="#6b7280" opacity="0.8">😮‍💨</text>
      {/* 시계 */}
      <circle cx="290" cy="60" r="15" fill="#16213e" stroke="#2a4a7a" strokeWidth="2"/>
      <line x1="290" y1="60" x2="290" y2="50" stroke="#4ecdc4" strokeWidth="2" strokeLinecap="round"/>
      <line x1="290" y1="60" x2="298" y2="63" stroke="#c17f5a" strokeWidth="2" strokeLinecap="round"/>
      <text x="270" y="88" fontSize="9" fill="#888">22:47</text>
    </svg>
  ),

  // 1화-2: 선배가 알려주는 장면
  colleague_tip: () => (
    <svg viewBox="0 0 320 220" xmlns="http://www.w3.org/2000/svg" style={{width:"100%",maxWidth:320}}>
      <rect width="320" height="220" fill="#fff9f5" rx="12"/>
      {/* 배경 오피스 */}
      <rect x="0" y="150" width="320" height="70" fill="#f5f0ea"/>
      <rect x="0" y="148" width="320" height="4" fill="#e8e2d9"/>
      {/* 선배 캐릭터 — 왼쪽 */}
      <ellipse cx="90" cy="85" rx="26" ry="24" fill="#f5c5a3"/>
      <ellipse cx="90" cy="64" rx="26" ry="12" fill="#3e2a1c"/>
      <rect x="64" y="64" width="10" height="22" fill="#3e2a1c" rx="4"/>
      <rect x="64" y="108" width="52" height="55" fill="#c17f5a" rx="10"/>
      <circle cx="80" cy="91" r="4" fill="#3e2a1c"/>
      <circle cx="100" cy="91" r="4" fill="#3e2a1c"/>
      <circle cx="81" cy="90" r="1.5" fill="#fff"/>
      <circle cx="101" cy="90" r="1.5" fill="#fff"/>
      <path d="M83 100 Q90 106 97 100" stroke="#c17f5a" strokeWidth="2" fill="none" strokeLinecap="round"/>
      {/* 팔 */}
      <rect x="116" y="115" width="28" height="10" fill="#c17f5a" rx="5"/>
      {/* 팸플릿 */}
      <rect x="135" y="105" width="50" height="65" fill="#fff" rx="4" stroke="#e8e2d9" strokeWidth="1.5"/>
      <rect x="140" y="112" width="40" height="4" fill="#3e3232" rx="2"/>
      <rect x="140" y="120" width="30" height="2" fill="#b0a898" rx="1"/>
      <rect x="140" y="125" width="35" height="2" fill="#b0a898" rx="1"/>
      <rect x="140" y="130" width="28" height="2" fill="#b0a898" rx="1"/>
      <rect x="140" y="138" width="40" height="15" fill="#c17f5a" rx="3" opacity="0.2"/>
      <rect x="143" y="142" width="34" height="2" fill="#c17f5a" rx="1" opacity="0.6"/>
      <rect x="143" y="147" width="25" height="2" fill="#c17f5a" rx="1" opacity="0.6"/>
      {/* 직협 로고 */}
      <circle cx="160" cy="108" r="5" fill="#c17f5a" opacity="0.3"/>
      <text x="156" y="111" fontSize="6" fill="#c17f5a" fontWeight="bold">직협</text>
      {/* 박사원 캐릭터 — 오른쪽 */}
      <ellipse cx="248" cy="88" rx="24" ry="22" fill="#f5c5a3"/>
      <ellipse cx="248" cy="69" rx="24" ry="11" fill="#2a1a0e"/>
      <rect x="248" y="64" width="24" height="12" fill="#2a1a0e" rx="0 6 0 0"/>
      <rect x="224" y="112" width="48" height="50" fill="#3e3232" rx="10"/>
      <circle cx="239" cy="95" r="3.5" fill="#3e2a1c"/>
      <circle cx="257" cy="95" r="3.5" fill="#3e2a1c"/>
      <circle cx="240" cy="94" r="1.5" fill="#fff"/>
      <circle cx="258" cy="94" r="1.5" fill="#fff"/>
      <path d="M242 103 Q248 108 254 103" stroke="#c17f5a" strokeWidth="2" fill="none" strokeLinecap="round"/>
      {/* 말풍선 — 선배 */}
      <rect x="10" y="10" width="130" height="46" fill="#3e3232" rx="10"/>
      <polygon points="55,56 65,56 60,66" fill="#3e3232"/>
      <text x="18" y="28" fontSize="10" fill="white" fontFamily="Noto Sans KR, sans-serif">직협에 건의해봐요!</text>
      <text x="18" y="42" fontSize="9" fill="#e8c4a8" fontFamily="Noto Sans KR, sans-serif">공식 접수 창구가 있어요 😊</text>
      {/* 말풍선 — 박사원 */}
      <rect x="185" y="12" width="120" height="38" fill="#fff" rx="10" stroke="#e8e2d9" strokeWidth="1.5"/>
      <polygon points="245,50 255,50 250,60" fill="#fff" stroke="#e8e2d9" strokeWidth="1"/>
      <text x="193" y="28" fontSize="9" fill="#3e3232" fontFamily="Noto Sans KR, sans-serif">직협이요? 처음</text>
      <text x="193" y="42" fontSize="9" fill="#3e3232" fontFamily="Noto Sans KR, sans-serif">들어봐요!</text>
    </svg>
  ),

  // 1화-3: 건의서 제출
  submit_form: () => (
    <svg viewBox="0 0 320 220" xmlns="http://www.w3.org/2000/svg" style={{width:"100%",maxWidth:320}}>
      <rect width="320" height="220" fill="#f0fff4" rx="12"/>
      {/* 접수 창구 */}
      <rect x="80" y="90" width="160" height="100" fill="#fff" rx="8" stroke="#e8e2d9" strokeWidth="1.5"/>
      <rect x="80" y="90" width="160" height="28" fill="#3e3232" rx="8 8 0 0"/>
      <text x="115" y="108" fontSize="11" fill="white" fontFamily="Noto Sans KR, sans-serif" fontWeight="bold">직협 고충 접수 창구</text>
      {/* 창구 내부 */}
      <rect x="92" y="128" width="136" height="52" fill="#f5f0ea" rx="4"/>
      <rect x="98" y="135" width="70" height="3" fill="#b0a898" rx="1"/>
      <rect x="98" y="142" width="90" height="3" fill="#b0a898" rx="1"/>
      <rect x="98" y="149" width="60" height="3" fill="#b0a898" rx="1"/>
      <rect x="98" y="156" width="80" height="3" fill="#b0a898" rx="1"/>
      {/* 서류 */}
      <rect x="170" y="115" width="45" height="58" fill="#fff" rx="3" stroke="#c17f5a" strokeWidth="1.5"/>
      <rect x="175" y="122" width="35" height="2" fill="#3e3232" rx="1"/>
      <rect x="175" y="128" width="28" height="2" fill="#b0a898" rx="1"/>
      <rect x="175" y="133" width="32" height="2" fill="#b0a898" rx="1"/>
      <rect x="175" y="138" width="25" height="2" fill="#b0a898" rx="1"/>
      <rect x="175" y="148" width="35" height="10" fill="#c17f5a" rx="2" opacity="0.15"/>
      <text x="176" y="157" fontSize="7" fill="#c17f5a" fontFamily="Noto Sans KR">건의 내용</text>
      {/* 캐릭터 */}
      <ellipse cx="60" cy="100" rx="22" ry="20" fill="#f5c5a3"/>
      <ellipse cx="60" cy="83" rx="22" ry="10" fill="#2a1a0e"/>
      <rect x="38" y="119" width="44" height="50" fill="#3e3232" rx="8"/>
      <circle cx="52" cy="106" r="3" fill="#3e2a1c"/>
      <circle cx="68" cy="106" r="3" fill="#3e2a1c"/>
      {/* 희망찬 표정 */}
      <path d="M54 114 Q60 120 66 114" stroke="#c17f5a" strokeWidth="2" fill="none" strokeLinecap="round"/>
      {/* 팔 (서류 내미는) */}
      <rect x="82" y="118" width="35" height="10" fill="#3e3232" rx="5"/>
      {/* 체크 이모지 */}
      <circle cx="270" cy="50" r="30" fill="#4ecdc4" opacity="0.15"/>
      <text x="248" y="62" fontSize="36">✅</text>
      <text x="238" y="82" fontSize="10" fill="#3e3232" fontFamily="Noto Sans KR">접수 완료!</text>
    </svg>
  ),

  // 1화-4: 회의
  council_meeting: () => (
    <svg viewBox="0 0 320 220" xmlns="http://www.w3.org/2000/svg" style={{width:"100%",maxWidth:320}}>
      <rect width="320" height="220" fill="#f5f0ea" rx="12"/>
      {/* 회의실 배경 */}
      <rect x="0" y="0" width="320" height="220" fill="#faf8f5"/>
      <rect x="0" y="170" width="320" height="50" fill="#f5f0ea"/>
      {/* 회의 테이블 */}
      <ellipse cx="160" cy="155" rx="130" ry="38" fill="#8b6542" opacity="0.9"/>
      <ellipse cx="160" cy="150" rx="130" ry="38" fill="#a07848"/>
      {/* 테이블 위 서류들 */}
      <rect x="100" y="138" width="35" height="22" fill="#fff" rx="2" stroke="#e8e2d9" strokeWidth="1" transform="rotate(-5 117 149)"/>
      <rect x="180" y="140" width="35" height="22" fill="#fff" rx="2" stroke="#e8e2d9" strokeWidth="1" transform="rotate(4 197 151)"/>
      <rect x="145" y="135" width="30" height="20" fill="#fff" rx="2" stroke="#e8e2d9" strokeWidth="1"/>
      {/* 캐릭터들 */}
      {/* 직협 대표 — 중앙 */}
      <ellipse cx="160" cy="95" rx="24" ry="22" fill="#f5c5a3"/>
      <ellipse cx="160" cy="76" rx="24" ry="11" fill="#3e2a1c"/>
      <rect x="136" y="116" width="48" height="45" fill="#3e3232" rx="8"/>
      {/* 발표 제스처 팔 */}
      <rect x="184" y="120" width="30" height="10" fill="#3e3232" rx="5"/>
      <circle cx="215" cy="120" r="7" fill="#f5c5a3"/>
      <circle cx="151" cy="101" r="3" fill="#3e2a1c"/>
      <circle cx="169" cy="101" r="3" fill="#3e2a1c"/>
      <path d="M154 110 Q160 115 166 110" stroke="#c17f5a" strokeWidth="2" fill="none" strokeLinecap="round"/>
      {/* 왼쪽 참석자 */}
      <ellipse cx="65" cy="115" rx="19" ry="18" fill="#f5d5b0"/>
      <ellipse cx="65" cy="100" rx="19" ry="9" fill="#2a1a0e"/>
      <rect x="46" y="132" width="38" height="40" fill="#2d4a7a" rx="7"/>
      <circle cx="57" cy="121" r="2.5" fill="#3e2a1c"/>
      <circle cx="73" cy="121" r="2.5" fill="#3e2a1c"/>
      <path d="M60 128 Q65 132 70 128" stroke="#c17f5a" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      {/* 오른쪽 참석자 */}
      <ellipse cx="255" cy="115" rx="19" ry="18" fill="#f5c5a3"/>
      <ellipse cx="255" cy="100" rx="19" ry="9" fill="#5a3020"/>
      <rect x="236" y="132" width="38" height="40" fill="#4a6030" rx="7"/>
      <circle cx="247" cy="121" r="2.5" fill="#3e2a1c"/>
      <circle cx="263" cy="121" r="2.5" fill="#3e2a1c"/>
      <path d="M250 128 Q255 132 260 128" stroke="#c17f5a" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      {/* 발표 자료 */}
      <rect x="10" y="30" width="90" height="60" fill="#fff" rx="6" stroke="#e8e2d9" strokeWidth="1.5"/>
      <rect x="16" y="38" width="78" height="4" fill="#3e3232" rx="2"/>
      <rect x="16" y="47" width="60" height="2" fill="#b0a898" rx="1"/>
      <rect x="16" y="53" width="70" height="2" fill="#b0a898" rx="1"/>
      <rect x="16" y="59" width="50" height="2" fill="#c17f5a" rx="1"/>
      <rect x="16" y="68" width="78" height="12" fill="#f5f0ea" rx="2"/>
      <rect x="20" y="72" width="30" height="4" fill="#4ecdc4" rx="1" opacity="0.6"/>
      <rect x="55" y="72" width="20" height="4" fill="#c17f5a" rx="1" opacity="0.6"/>
      <text x="18" y="40" fontSize="7" fill="#3e3232" fontFamily="Noto Sans KR">업무분장 개선안</text>
      {/* 말풍선 */}
      <rect x="105" y="20" width="150" height="40" fill="#3e3232" rx="8"/>
      <polygon points="155,60 165,60 160,70" fill="#3e3232"/>
      <text x="113" y="37" fontSize="9" fill="white" fontFamily="Noto Sans KR">초과근무 문제를 공식</text>
      <text x="113" y="52" fontSize="9" fill="#e8c4a8" fontFamily="Noto Sans KR">안건으로 상정합니다!</text>
    </svg>
  ),

  // 1화-5: 제도 개선 발표
  announcement: () => (
    <svg viewBox="0 0 320 220" xmlns="http://www.w3.org/2000/svg" style={{width:"100%",maxWidth:320}}>
      <rect width="320" height="220" fill="#fff8f0" rx="12"/>
      {/* 연단/발표대 */}
      <rect x="100" y="130" width="120" height="60" fill="#a07848" rx="4"/>
      <rect x="95" y="125" width="130" height="10" fill="#8b6542" rx="3"/>
      <rect x="140" y="115" width="40" height="15" fill="#6b4c2a" rx="2"/>
      {/* 발표자 */}
      <ellipse cx="160" cy="85" rx="26" ry="24" fill="#f5c5a3"/>
      <ellipse cx="160" cy="65" rx="26" ry="12" fill="#5a3020"/>
      <rect x="134" y="108" width="52" height="50" fill="#4a3060" rx="8"/>
      {/* 팔 올린 제스처 */}
      <rect x="100" y="115" width="38" height="10" fill="#4a3060" rx="5"/>
      <circle cx="100" cy="115" r="8" fill="#f5c5a3"/>
      <circle cx="150" cy="91" r="3.5" fill="#3e2a1c"/>
      <circle cx="170" cy="91" r="3.5" fill="#3e2a1c"/>
      <circle cx="151" cy="90" r="1.5" fill="#fff"/>
      <circle cx="171" cy="90" r="1.5" fill="#fff"/>
      {/* 활짝 웃는 표정 */}
      <path d="M152 102 Q160 110 168 102" stroke="#c17f5a" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      {/* 발표 배경 화면 */}
      <rect x="20" y="20" width="100" height="70" fill="#3e3232" rx="6"/>
      <rect x="25" y="26" width="90" height="58" fill="#1a1a2e" rx="3"/>
      <text x="30" y="42" fontSize="8" fill="#4ecdc4" fontFamily="Noto Sans KR" fontWeight="bold">제도 개선 발표</text>
      <rect x="30" y="48" width="60" height="2" fill="#6b7280" rx="1"/>
      <rect x="30" y="54" width="75" height="2" fill="#6b7280" rx="1"/>
      <rect x="30" y="60" width="50" height="2" fill="#c17f5a" rx="1"/>
      <rect x="30" y="68" width="80" height="12" fill="#2a4a3a" rx="2"/>
      <text x="33" y="78" fontSize="7" fill="#4ecdc4" fontFamily="Noto Sans KR">✓ 업무분장 재조정</text>
      {/* 청중 (박수) */}
      <ellipse cx="40" cy="175" rx="14" ry="13" fill="#f5d5b0"/>
      <rect x="26" y="187" width="28" height="25" fill="#2d4a7a" rx="5"/>
      <text x="22" y="200" fontSize="16">👏</text>
      <ellipse cx="280" cy="175" rx="14" ry="13" fill="#f5c5a3"/>
      <rect x="266" y="187" width="28" height="25" fill="#c17f5a" rx="5"/>
      <text x="262" y="200" fontSize="16">👏</text>
      {/* 폭죽 효과 */}
      <text x="200" y="40" fontSize="24">🎉</text>
      <text x="240" y="70" fontSize="20">✨</text>
      {/* 말풍선 */}
      <rect x="120" y="25" width="185" height="45" fill="#c17f5a" rx="8"/>
      <polygon points="175,70 185,70 180,80" fill="#c17f5a"/>
      <text x="128" y="42" fontSize="9" fill="white" fontFamily="Noto Sans KR">직원 의견을 반영하여</text>
      <text x="128" y="55" fontSize="9" fill="white" fontFamily="Noto Sans KR">업무 분장을 개선합니다!</text>
    </svg>
  ),

  // 1화-6: 칼퇴근
  happy_exit: () => (
    <svg viewBox="0 0 320 220" xmlns="http://www.w3.org/2000/svg" style={{width:"100%",maxWidth:320}}>
      <defs>
        <linearGradient id="sunset" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ff9a5c"/>
          <stop offset="50%" stopColor="#ffc17a"/>
          <stop offset="100%" stopColor="#ffe4b5"/>
        </linearGradient>
      </defs>
      <rect width="320" height="220" fill="url(#sunset)" rx="12"/>
      {/* 태양 */}
      <circle cx="260" cy="80" r="35" fill="#ffdd44" opacity="0.85"/>
      <circle cx="260" cy="80" r="28" fill="#ffe566"/>
      {/* 빌딩 실루엣 */}
      <rect x="0" y="130" width="60" height="90" fill="#3e3232" opacity="0.4"/>
      <rect x="55" y="150" width="40" height="70" fill="#3e3232" opacity="0.4"/>
      <rect x="250" y="120" width="70" height="100" fill="#3e3232" opacity="0.4"/>
      <rect x="230" y="145" width="35" height="75" fill="#3e3232" opacity="0.4"/>
      {/* 건물 출구 문 */}
      <rect x="130" y="130" width="60" height="90" fill="#2a1a0e" rx="0"/>
      <rect x="133" y="133" width="54" height="87" fill="#3e2a1c"/>
      <rect x="148" y="148" width="24" height="40" fill="#1a0e06" rx="2"/>
      <circle cx="169" cy="168" r="2" fill="#c17f5a"/>
      {/* 간판 */}
      <rect x="118" y="115" width="84" height="20" fill="#3e3232" rx="3"/>
      <text x="130" y="129" fontSize="9" fill="#e8c4a8" fontFamily="Noto Sans KR">고용노동부</text>
      {/* 캐릭터 — 가방 메고 나오는 */}
      <ellipse cx="200" cy="120" rx="22" ry="20" fill="#f5c5a3"/>
      <ellipse cx="200" cy="103" rx="22" ry="10" fill="#2a1a0e"/>
      <rect x="178" y="139" width="44" height="48" fill="#3e3232" rx="8"/>
      {/* 가방 */}
      <rect x="222" y="140" width="22" height="30" fill="#6b4c2a" rx="4"/>
      <rect x="224" y="135" width="18" height="8" fill="#5a3c1a" rx="2"/>
      {/* 팔 — 흔드는 */}
      <rect x="178" y="142" width="10" height="28" fill="#3e3232" rx="5" transform="rotate(-20 183 155)"/>
      {/* 활짝 웃는 눈/입 */}
      <path d="M192 127 Q196 122 200 127" stroke="#3e2a1c" strokeWidth="1.5" fill="#3e2a1c"/>
      <path d="M200 127 Q204 122 208 127" stroke="#3e2a1c" strokeWidth="1.5" fill="#3e2a1c"/>
      <path d="M193 136 Q200 143 207 136" stroke="#c17f5a" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      {/* 감탄/하트 */}
      <text x="225" y="105" fontSize="22">🌅</text>
      <text x="90" y="80" fontSize="18">💼</text>
      {/* 말풍선 */}
      <rect x="30" y="30" width="155" height="50" fill="white" rx="10" stroke="#e8e2d9" strokeWidth="1.5" opacity="0.92"/>
      <polygon points="155,80 165,80 160,92" fill="white" stroke="#e8e2d9" strokeWidth="1"/>
      <text x="40" y="50" fontSize="9.5" fill="#3e3232" fontFamily="Noto Sans KR">드디어 칼퇴근! 목소리</text>
      <text x="40" y="63" fontSize="9.5" fill="#3e3232" fontFamily="Noto Sans KR">하나가 조직을 바꿨어 💪</text>
    </svg>
  ),

  // 2화-1: 소송 서류 충격
  lawsuit_shock: () => (
    <svg viewBox="0 0 320 220" xmlns="http://www.w3.org/2000/svg" style={{width:"100%",maxWidth:320}}>
      <rect width="320" height="220" fill="#fff5f5" rx="12"/>
      {/* 서류 봉투 — 크게 */}
      <rect x="160" y="60" width="130" height="100" fill="#fff" rx="6" stroke="#c17f5a" strokeWidth="2"/>
      <polygon points="160,60 225,110 290,60" fill="#f5f0ea" stroke="#c17f5a" strokeWidth="1.5"/>
      <rect x="168" y="80" width="114" height="3" fill="#b0a898" rx="1"/>
      <rect x="168" y="88" width="90" height="3" fill="#b0a898" rx="1"/>
      <rect x="168" y="96" width="105" height="3" fill="#b0a898" rx="1"/>
      <rect x="168" y="108" width="114" height="25" fill="#fee2e2" rx="3"/>
      <text x="176" y="123" fontSize="8" fill="#dc2626" fontFamily="Noto Sans KR" fontWeight="bold">소 장</text>
      <text x="192" y="123" fontSize="7" fill="#dc2626" fontFamily="Noto Sans KR">  귀하에 대한 민사소송...</text>
      {/* 도장 */}
      <rect x="245" y="65" width="35" height="35" fill="none" stroke="#dc2626" strokeWidth="2" rx="3"/>
      <text x="250" y="79" fontSize="7" fill="#dc2626" fontFamily="Noto Sans KR">법원</text>
      <text x="248" y="90" fontSize="7" fill="#dc2626" fontFamily="Noto Sans KR">공식문서</text>
      {/* 캐릭터 — 충격 */}
      <ellipse cx="80" cy="100" rx="26" ry="24" fill="#f5c5a3"/>
      <ellipse cx="80" cy="80" rx="26" ry="12" fill="#2a1a0e"/>
      <rect x="54" y="123" width="52" height="55" fill="#2d4a7a" rx="8"/>
      {/* 충격 표정 — 동그란 눈, 벌린 입 */}
      <circle cx="69" cy="105" r="5" fill="#3e2a1c"/>
      <circle cx="91" cy="105" r="5" fill="#3e2a1c"/>
      <circle cx="70" cy="104" r="2" fill="#fff"/>
      <circle cx="92" cy="104" r="2" fill="#fff"/>
      <ellipse cx="80" cy="116" rx="6" ry="5" fill="#3e2a1c"/>
      {/* 떨리는 손 */}
      <rect x="106" y="118" width="55" height="10" fill="#2d4a7a" rx="5"/>
      <rect x="155" y="110" width="10" height="20" fill="#f5c5a3" rx="4"/>
      {/* 충격 효과 */}
      <text x="10" y="45" fontSize="28">😱</text>
      <line x1="110" y1="70" x2="130" y2="55" stroke="#dc2626" strokeWidth="2" opacity="0.5"/>
      <line x1="105" y1="80" x2="120" y2="65" stroke="#dc2626" strokeWidth="2" opacity="0.5"/>
      <line x1="115" y1="90" x2="135" y2="80" stroke="#dc2626" strokeWidth="2" opacity="0.5"/>
      {/* 말풍선 */}
      <rect x="10" y="50" width="145" height="42" fill="white" rx="8" stroke="#e8e2d9" strokeWidth="1.5"/>
      <polygon points="85,92 95,92 90,104" fill="white" stroke="#e8e2d9" strokeWidth="1"/>
      <text x="18" y="68" fontSize="9" fill="#dc2626" fontFamily="Noto Sans KR" fontWeight="bold">내가... 소송을?!</text>
      <text x="18" y="83" fontSize="8.5" fill="#6b7280" fontFamily="Noto Sans KR">직무수행 중이었는데...</text>
    </svg>
  ),

  // 2화-2: 직협 전화 상담
  phone_support: () => (
    <svg viewBox="0 0 320 220" xmlns="http://www.w3.org/2000/svg" style={{width:"100%",maxWidth:320}}>
      <rect width="320" height="220" fill="#f0f8ff" rx="12"/>
      {/* 분할 화면 효과 */}
      <rect x="0" y="0" width="155" height="220" fill="#e8f4ff" rx="12 0 0 12"/>
      <rect x="165" y="0" width="155" height="220" fill="#fff5f0" rx="0 12 12 0"/>
      <line x1="160" y1="0" x2="160" y2="220" stroke="#e8e2d9" strokeWidth="2"/>
      <text x="55" y="24" fontSize="10" fill="#3e3232" fontFamily="Noto Sans KR" textAnchor="middle" fontWeight="bold">이주임</text>
      <text x="235" y="24" fontSize="10" fill="#3e3232" fontFamily="Noto Sans KR" textAnchor="middle" fontWeight="bold">직협 담당자</text>
      {/* 이주임 — 왼쪽 */}
      <ellipse cx="70" cy="100" rx="24" ry="22" fill="#f5c5a3"/>
      <ellipse cx="70" cy="81" rx="24" ry="11" fill="#2a1a0e"/>
      <rect x="46" y="121" width="48" height="55" fill="#2d4a7a" rx="8"/>
      <circle cx="61" cy="107" r="3" fill="#3e2a1c"/>
      <circle cx="79" cy="107" r="3" fill="#3e2a1c"/>
      <path d="M63 116 Q70 122 77 116" stroke="#c17f5a" strokeWidth="2" fill="none" strokeLinecap="round"/>
      {/* 전화기 — 왼쪽 */}
      <rect x="82" y="108" width="32" height="52" fill="#1a1a2e" rx="6"/>
      <rect x="84" y="114" width="28" height="38" fill="#3b82f6" rx="2"/>
      <circle cx="98" cy="156" r="4" fill="#374151"/>
      {/* 직협 담당자 — 오른쪽 */}
      <ellipse cx="240" cy="100" rx="24" ry="22" fill="#f5d5b0"/>
      <ellipse cx="240" cy="81" rx="24" ry="11" fill="#5a3020"/>
      <rect x="216" y="121" width="48" height="55" fill="#c17f5a" rx="8"/>
      <circle cx="231" cy="107" r="3" fill="#3e2a1c"/>
      <circle cx="249" cy="107" r="3" fill="#3e2a1c"/>
      <circle cx="232" cy="106" r="1.5" fill="#fff"/>
      <circle cx="250" cy="106" r="1.5" fill="#fff"/>
      <path d="M233 115 Q240 121 247 115" stroke="#c17f5a" strokeWidth="2" fill="none" strokeLinecap="round"/>
      {/* 전화기 — 오른쪽 */}
      <rect x="196" y="108" width="32" height="52" fill="#1a1a2e" rx="6"/>
      <rect x="198" y="114" width="28" height="38" fill="#3b82f6" rx="2"/>
      <circle cx="212" cy="156" r="4" fill="#374151"/>
      {/* 통화 중 아이콘 */}
      <text x="138" y="115" fontSize="22">📞</text>
      <circle cx="160" cy="130" r="10" fill="#4ecdc4" opacity="0.3"/>
      {/* 말풍선 — 담당자 */}
      <rect x="162" y="32" width="148" height="52" fill="#3e3232" rx="8"/>
      <polygon points="215,84 225,84 220,96" fill="#3e3232"/>
      <text x="170" y="50" fontSize="8.5" fill="white" fontFamily="Noto Sans KR">걱정 마세요! 직무수행</text>
      <text x="170" y="64" fontSize="8.5" fill="white" fontFamily="Noto Sans KR">관련 소송은 직협에서</text>
      <text x="170" y="78" fontSize="8.5" fill="#e8c4a8" fontFamily="Noto Sans KR">소송비용 지원됩니다! 😊</text>
    </svg>
  ),

  // 2화-5: 결혼식
  wedding: () => (
    <svg viewBox="0 0 320 220" xmlns="http://www.w3.org/2000/svg" style={{width:"100%",maxWidth:320}}>
      <defs>
        <linearGradient id="weddingBg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff0f8"/>
          <stop offset="100%" stopColor="#fff9f5"/>
        </linearGradient>
      </defs>
      <rect width="320" height="220" fill="url(#weddingBg)" rx="12"/>
      {/* 꽃 장식 */}
      <text x="15" y="40" fontSize="24">🌸</text>
      <text x="265" y="40" fontSize="24">🌸</text>
      <text x="130" y="22" fontSize="16">✨</text>
      <text x="165" y="18" fontSize="14">💍</text>
      <text x="195" y="22" fontSize="16">✨</text>
      {/* 신부 */}
      <ellipse cx="115" cy="90" rx="24" ry="22" fill="#f5c5a3"/>
      <ellipse cx="115" cy="72" rx="24" ry="11" fill="#3e2a1c"/>
      {/* 웨딩드레스 */}
      <path d="M91 112 Q80 165 70 185 L160 185 Q150 165 139 112 Z" fill="white" stroke="#e8e2d9" strokeWidth="1"/>
      <path d="M91 112 L95 130 L115 140 L135 130 L139 112 Z" fill="white" stroke="#e8e2d9" strokeWidth="1"/>
      {/* 베일 */}
      <path d="M93 72 Q115 60 137 72 Q145 95 140 120 L90 120 Q85 95 93 72 Z" fill="rgba(255,255,255,0.8)" stroke="#e8e2d9" strokeWidth="1"/>
      <path d="M100 68 Q115 55 130 68" stroke="#e8e2d9" strokeWidth="2" fill="none"/>
      <circle cx="115" cy="96" r="4" fill="#3e2a1c"/>
      <circle cx="125" cy="96" r="4" fill="#3e2a1c"/>
      <path d="M111 105 Q117 111 123 105" stroke="#c17f5a" strokeWidth="2" fill="none" strokeLinecap="round"/>
      {/* 부케 */}
      <text x="80" y="155" fontSize="22">💐</text>
      {/* 신랑 */}
      <ellipse cx="205" cy="90" rx="24" ry="22" fill="#f5c5a3"/>
      <ellipse cx="205" cy="72" rx="24" ry="11" fill="#2a1a0e"/>
      {/* 턱시도 */}
      <rect x="181" y="112" width="48" height="75" fill="#1a1a2e" rx="4"/>
      <rect x="197" y="112" width="22" height="75" fill="white"/>
      <rect x="197" y="112" width="10" height="75" fill="white"/>
      <rect x="209" y="112" width="10" height="75" fill="white"/>
      <rect x="200" y="114" width="6" height="6" fill="#dc2626" rx="1"/>
      <circle cx="196" cy="96" r="4" fill="#3e2a1c"/>
      <circle cx="214" cy="96" r="4" fill="#3e2a1c"/>
      <circle cx="197" cy="95" r="1.5" fill="#fff"/>
      <circle cx="215" cy="95" r="1.5" fill="#fff"/>
      <path d="M199 105 Q205 111 211 105" stroke="#c17f5a" strokeWidth="2" fill="none" strokeLinecap="round"/>
      {/* 하트 */}
      <text x="148" y="100" fontSize="28">💕</text>
      {/* 하객 박수 */}
      <text x="20" y="200" fontSize="14">👏</text>
      <text x="45" y="205" fontSize="12">👏</text>
      <text x="255" y="200" fontSize="14">👏</text>
      <text x="278" y="205" fontSize="12">👏</text>
      {/* 말풍선 */}
      <rect x="88" y="28" width="144" height="32" fill="white" rx="8" stroke="#e8e2d9" strokeWidth="1.5"/>
      <polygon points="155,60 165,60 160,70" fill="white" stroke="#e8e2d9" strokeWidth="1"/>
      <text x="96" y="44" fontSize="9" fill="#3e3232" fontFamily="Noto Sans KR">부부공무원 결혼 축하금</text>
      <text x="96" y="56" fontSize="9" fill="#c17f5a" fontFamily="Noto Sans KR" fontWeight="bold">각각 20만원 지급! 💰</text>
    </svg>
  ),

  // 2화-6: 출산
  baby: () => (
    <svg viewBox="0 0 320 220" xmlns="http://www.w3.org/2000/svg" style={{width:"100%",maxWidth:320}}>
      <rect width="320" height="220" fill="#f0fff4" rx="12"/>
      {/* 배경 아기자기한 요소 */}
      <text x="20" y="40" fontSize="20">⭐</text>
      <text x="270" y="40" fontSize="20">🌙</text>
      <text x="145" y="20" fontSize="16">✨</text>
      {/* 엄마 — 왼쪽 */}
      <ellipse cx="100" cy="95" rx="24" ry="22" fill="#f5c5a3"/>
      <ellipse cx="100" cy="76" rx="24" ry="11" fill="#3e2a1c"/>
      <rect x="76" y="116" width="48" height="65" fill="#c17f5a" rx="8"/>
      {/* 아기 안은 팔 */}
      <rect x="120" y="120" width="50" height="14" fill="#c17f5a" rx="6"/>
      <circle cx="94" cy="101" r="4" fill="#3e2a1c"/>
      <circle cx="106" cy="101" r="4" fill="#3e2a1c"/>
      <circle cx="95" cy="100" r="1.5" fill="#fff"/>
      <circle cx="107" cy="100" r="1.5" fill="#fff"/>
      <path d="M96 110 Q100 116 106 110" stroke="#c17f5a" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      {/* 아기 */}
      <ellipse cx="175" cy="125" rx="22" ry="19" fill="#ffe4cc"/>
      <ellipse cx="175" cy="110" rx="22" ry="10" fill="#f5d5b0"/>
      {/* 아기 담요 */}
      <path d="M153 130 Q155 155 175 160 Q195 155 197 130 Z" fill="#a8edea"/>
      <path d="M153 130 Q175 140 197 130" fill="#c8f5f2" opacity="0.5"/>
      {/* 아기 얼굴 */}
      <circle cx="168" cy="128" r="2.5" fill="#3e2a1c"/>
      <circle cx="182" cy="128" r="2.5" fill="#3e2a1c"/>
      <path d="M170 136 Q175 140 180 136" stroke="#c17f5a" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      {/* 볼 */}
      <circle cx="163" cy="133" r="4" fill="#ffb3ba" opacity="0.5"/>
      <circle cx="187" cy="133" r="4" fill="#ffb3ba" opacity="0.5"/>
      {/* 아빠 — 오른쪽 */}
      <ellipse cx="245" cy="95" rx="24" ry="22" fill="#f5c5a3"/>
      <ellipse cx="245" cy="76" rx="24" ry="11" fill="#2a1a0e"/>
      <rect x="221" y="116" width="48" height="65" fill="#3e3232" rx="8"/>
      <circle cx="236" cy="101" r="4" fill="#3e2a1c"/>
      <circle cx="254" cy="101" r="4" fill="#3e2a1c"/>
      <circle cx="237" cy="100" r="1.5" fill="#fff"/>
      <circle cx="255" cy="100" r="1.5" fill="#fff"/>
      <path d="M239 110 Q245 116 251 110" stroke="#c17f5a" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      {/* 팔 — 어깨동무 */}
      <rect x="124" y="117" width="40" height="10" fill="#3e3232" rx="5"/>
      {/* 말풍선 */}
      <rect x="20" y="30" width="200" height="48" fill="white" rx="8" stroke="#e8e2d9" strokeWidth="1.5"/>
      <polygon points="85,78 95,78 90,90" fill="white" stroke="#e8e2d9" strokeWidth="1"/>
      <text x="28" y="50" fontSize="9" fill="#3e3232" fontFamily="Noto Sans KR">직협에 출산 축하금 신청해!</text>
      <text x="28" y="64" fontSize="9" fill="#c17f5a" fontFamily="Noto Sans KR" fontWeight="bold">부부공무원은 각각 20만원! 💚</text>
      {/* 장식 */}
      <text x="225" y="60" fontSize="24">👶</text>
      <text x="50" y="190" fontSize="16">🎀</text>
      <text x="245" y="190" fontSize="16">🎀</text>
    </svg>
  ),
};

// ── 웹툰 데이터 ──────────────────────────────────────────
const WEBTOONS = [
  {
    id: 1,
    title: "1화 — 목소리가 제도를 바꿨다",
    subtitle: "애로사항 건의부터 제도 개선까지",
    thumbnail: "🏛️",
    themeColor: "#3e3232",
    accentColor: "#c17f5a",
    bgGradient: "linear-gradient(135deg, #3e3232 0%, #6b4c2a 100%)",
    panels: [
      { IllustComp: Illustrations.tired_worker,   speaker:"박사원", speakerRole:"고용노동부 5년차", caption:"야근이 반복되는 어느 날 밤...", dialogue:"또 초과근무야... 이 업무량은 혼자 감당이 안 되는데. 어디다 얘기해야 하지?", mood:"😮‍💨" },
      { IllustComp: Illustrations.colleague_tip,  speaker:"선배 김주임", speakerRole:"직장협의회 회원", caption:"옆자리 선배가 다가오며...", dialogue:"박사원, 그런 거 직협에 건의해봐! 직장협의회는 우리 직원들 고충을 공식 접수해서 위에 전달해줘.", mood:"😊" },
      { IllustComp: Illustrations.submit_form,    speaker:"박사원", speakerRole:"건의서 작성 중", caption:"직협 고충 접수 창구에서...", dialogue:"업무 분장 불균형으로 인한 초과근무 문제를 건의합니다. 팀 전체 문제예요.", mood:"🌟" },
      { IllustComp: Illustrations.council_meeting,speaker:"직협 대표", speakerRole:"노사협의회 진행 중", caption:"노사협의회 회의실...", dialogue:"직원 대표로서 업무 분장 불균형 문제를 공식 안건으로 상정합니다. 현장 실태 자료를 첨부했습니다.", mood:"💼" },
      { IllustComp: Illustrations.announcement,   speaker:"인사담당 과장", speakerRole:"제도 개선 발표", caption:"한 달 후, 공식 발표...", dialogue:"직원 의견을 반영하여 업무 분장을 재조정하겠습니다! 초과근무 보상 기준도 함께 개선합니다.", mood:"📢" },
      { IllustComp: Illustrations.happy_exit,     speaker:"박사원", speakerRole:"퇴근길에", caption:"드디어 제시간에 퇴근하는 날...", dialogue:"목소리 하나가 조직을 바꿨어. 나도 이제 후배들 목소리 전달해줘야지!", mood:"😄", isLast:true },
    ],
  },
  {
    id: 2,
    title: "2화 — 직협이 내 편이 되어준 날",
    subtitle: "소송 지원부터 결혼·출산 축하금까지",
    thumbnail: "💑",
    themeColor: "#4a3060",
    accentColor: "#7c5a9a",
    bgGradient: "linear-gradient(135deg, #4a3060 0%, #7c5a9a 100%)",
    panels: [
      {
        IllustComp: Illustrations.lawsuit_shock, speaker:"이주임", speakerRole:"근로감독관 3년차",
        caption:"어느 날 갑자기 날아온 서류...", dialogue:"내가... 소송을 당했다고?! 직무 수행 중 내 결정에 불복해서 소송을 제기했대. 어떡하지?", mood:"😱",
      },
      {
        IllustComp: Illustrations.phone_support, speaker:"직협 담당자", speakerRole:"소송 지원팀",
        caption:"직협에 연락하자...", dialogue:"걱정 마세요! 직무수행 관련 소송은 직협에서 소송비용을 지원합니다. 서류 준비 도와드릴게요!", mood:"🤗",
        tipBox:{ title:"💡 소송비용 지원 안내", items:["대상: 직무수행 관련 소송 제기 또는 피소된 회원","신청: 소속 지역 직장협의회에 서류 제출","내용: 소송비용 지원 (세부 금액은 직협 문의)"] },
      },
      {
        IllustComp: Illustrations.phone_support, speaker:"직협 소송지원", speakerRole:"법률 서류 지원 완료",
        caption:"직협의 지원으로...", dialogue:"직무수행 중 발생한 정당한 공무 처리였음이 입증됐습니다. 소송비용은 직협에서 지원해드립니다!", mood:"⚖️",
      },
      {
        IllustComp: Illustrations.colleague_tip, speaker:"이주임", speakerRole:"부서 이동 후",
        caption:"그러던 어느 날, 같은 부서로 발령 온 최주임...", dialogue:"최주임님도 직협 회원이셨군요? 오래 같이 일하면 좋겠는데요... (두근)", mood:"💕",
      },
      {
        IllustComp: Illustrations.wedding, speaker:"주례", speakerRole:"결혼식장",
        caption:"1년 후... 두 사람의 결혼식 날!", dialogue:"두 분이 고용노동부 공무원 부부로서 서로를 지지하며 살아가기를 바랍니다!", mood:"💒",
        tipBox:{ title:"💡 결혼 축하금 안내", items:["금액: 회원 결혼 시 각각 20만원 지급","대상: 부부 모두 회원인 경우 각각 지급","신청: 소속 지역 직장협의회에 결혼 증빙 서류 제출"] },
      },
      {
        IllustComp: Illustrations.baby, speaker:"이주임 & 최주임", speakerRole:"사내부부 1년 후",
        caption:"그리고 1년 후... 드디어!", dialogue:"여보, 직협에 출산 축하금 신청하는 것도 잊지 마! 부부공무원이니까 둘 다 각각 20만원이야!", mood:"👶",
        tipBox:{ title:"💡 출산 축하금 안내", items:["금액: 출산 시 각각 20만원 지급","대상: 부부 모두 회원인 경우 각각 지급","신청: 소속 지역 직장협의회에 출생증명서 제출"] },
        isLast:true,
      },
    ],
  },
];

// ── 패널 컴포넌트 ────────────────────────────────────────
function WebtoonPanel({ panel, index, themeColor, accentColor }) {
  const { IllustComp, speaker, speakerRole, caption, dialogue, mood, tipBox, isLast } = panel;
  return (
    <div className="wt-panel wt-panel--active">
      <div className="wt-panel-num" style={{ background: themeColor }}>{String(index+1).padStart(2,"0")}</div>
      {caption && <div className="wt-caption">{caption}</div>}

      {/* SVG 삽화 */}
      <div style={{ margin:"0 20px 16px", borderRadius:12, overflow:"hidden", border:"1px solid var(--border)" }}>
        <IllustComp />
      </div>

      {/* 말풍선 */}
      <div className="wt-bubble-wrap">
        <div className="wt-speaker">
          <span className="wt-speaker-name" style={{ color: themeColor }}>{speaker}</span>
          <span className="wt-speaker-role">{speakerRole}</span>
        </div>
        <div className="wt-bubble">
          <span className="wt-mood">{mood}</span>
          <p>{dialogue}</p>
        </div>
      </div>

      {/* 팁 박스 */}
      {tipBox && (
        <div className="wt-tip" style={{ borderColor: accentColor }}>
          <p className="wt-tip-title" style={{ color: themeColor }}>{tipBox.title}</p>
          <ul className="wt-tip-list">
            {tipBox.items.map((item,i) => <li key={i}>{item}</li>)}
          </ul>
        </div>
      )}

      {isLast && <div className="wt-end-badge" style={{ background: themeColor }}>✦ END ✦</div>}
    </div>
  );
}

// ── 메인 컴포넌트 ────────────────────────────────────────
export default function PageWebtoon() {
  const [activeEpisode, setActiveEpisode] = useState(null);
  const ep = activeEpisode !== null ? WEBTOONS[activeEpisode] : null;

  return (
    <>
      <section className="wt-hero" style={ ep ? { background: ep.bgGradient, color:"white" } : {} }>
        <div className="hero-eyebrow" style={ ep ? { background:"rgba(255,255,255,0.2)", color:"white" } : {} }>직협 웹툰</div>
        <h1 className="wt-hero-title" style={ ep ? { color:"white" } : {} }>
          {ep ? ep.title : "직협이 내 편인 이유"}
        </h1>
        <p style={{ color: ep ? "rgba(255,255,255,0.8)" : "var(--text-soft)", fontSize:15, marginTop:8, fontFamily:"Noto Sans KR, sans-serif" }}>
          {ep ? ep.subtitle : "만화로 쉽게 알아보는 직장협의회 이야기"}
        </p>
        {ep && (
          <button className="btn btn-outline" style={{ marginTop:20, color:"white", borderColor:"rgba(255,255,255,0.5)" }}
            onClick={() => setActiveEpisode(null)}>← 화 목록으로</button>
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
              {WEBTOONS.map((wt,i) => (
                <button key={wt.id} className="wt-episode-card" onClick={() => setActiveEpisode(i)}>
                  <div className="wt-ep-thumb" style={{ background: wt.bgGradient }}>
                    <span>{wt.thumbnail}</span>
                    <div className="wt-ep-num-badge">제{wt.id}화</div>
                  </div>
                  <div className="wt-ep-info">
                    <p className="wt-ep-title">{wt.title}</p>
                    <p className="wt-ep-sub">{wt.subtitle}</p>
                    <p className="wt-ep-count">{wt.panels.length}컷 · SVG 삽화 포함</p>
                  </div>
                  <div className="wt-ep-arrow" style={{ color: wt.accentColor }}>▶</div>
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
            {ep.panels.map((panel,i) => (
              <WebtoonPanel key={i} panel={panel} index={i}
                themeColor={ep.themeColor} accentColor={ep.accentColor} />
            ))}
            <div className="wt-next-wrap">
              {activeEpisode < WEBTOONS.length-1 ? (
                <button className="btn btn-blue" style={{ background: WEBTOONS[activeEpisode+1].themeColor }}
                  onClick={() => { setActiveEpisode(activeEpisode+1); window.scrollTo(0,0); }}>
                  다음화: {WEBTOONS[activeEpisode+1].title} →
                </button>
              ) : (
                <button className="btn btn-blue" onClick={() => { setActiveEpisode(null); window.scrollTo(0,0); }}>
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
