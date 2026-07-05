/**
 * 베스트·워스트 설문 → Google Sheets 연동
 *
 * [설정 방법]
 * 1. Google 스프레드시트를 새로 만듭니다.
 * 2. 확장 프로그램 → Apps Script → 이 파일 내용을 붙여넣습니다.
 * 3. SHEET_NAME 값을 시트 탭 이름에 맞게 수정합니다(기본: "설문응답").
 * 4. setupSheet() 함수를 한 번 실행해 헤더 행을 만듭니다.
 * 5. 배포 → 새 배포 → 유형: 웹 앱
 *    - 실행 계정: 나
 *    - 액세스 권한: 모든 사용자
 * 6. 배포 URL을 복사해 프로젝트 .env 파일에 넣습니다.
 *    VITE_SURVEY_SUBMIT_URL=https://script.google.com/macros/s/....../exec
 *
 * [GitHub Pages]
 * Repository → Settings → Secrets → Actions
 * VITE_SURVEY_SUBMIT_URL = 위 URL
 */

var SHEET_NAME = "설문응답";

var HEADERS = [
  "제출일시",
  "응답ID",
  "베스트 항목",
  "베스트 관리자",
  "베스트 이유",
  "워스트 항목",
  "워스트 관리자",
  "워스트 이유",
  "기타 의견",
];

function setupSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }

  sheet.clear();
  sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
  sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold");
  sheet.setFrozenRows(1);
}

function getSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    setupSheet();
    sheet = ss.getSheetByName(SHEET_NAME);
  }

  return sheet;
}

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var sheet = getSheet_();

    sheet.appendRow([
      data.submittedAtLocal || data.submittedAt || new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" }),
      data.id || "",
      data.bestCriteriaText || "",
      data.bestManager || "",
      data.bestReason || "",
      data.worstItemsText || "",
      data.worstManager || "",
      data.worstReason || "",
      data.otherOpinion || "",
    ]);

    return jsonResponse({ success: true });
  } catch (err) {
    return jsonResponse({ success: false, error: String(err) });
  }
}

function doGet() {
  return jsonResponse({ success: true, message: "survey webhook ready" });
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
