/**
 * 베스트·워스트 설문 → Google Sheets 연동
 *
 * [설정]
 * 1. Google 스프레드시트 → Apps Script에 이 코드 붙여넣기
 * 2. 스크립트 속성: SURVEY_ADMIN_TOKEN = 취합 관리자 비밀번호
 * 3. setupSheet() 실행
 * 4. 웹 앱 배포 (모든 사용자) → VITE_SURVEY_SUBMIT_URL
 */

var SHEET_NAME = "설문응답";

var HEADERS = [
  "제출일시",
  "응답ID",
  "성명",
  "연락처",
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
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);
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

function getAdminToken_() {
  return PropertiesService.getScriptProperties().getProperty("SURVEY_ADMIN_TOKEN");
}

function isAuthorized_(token) {
  var expected = getAdminToken_();
  return expected && String(token).trim() === String(expected).trim();
}

function checkAuth_(token) {
  var expected = getAdminToken_();
  if (!expected) {
    return { ok: false, error: "SURVEY_ADMIN_TOKEN 스크립트 속성이 설정되지 않았습니다." };
  }
  if (String(token).trim() !== String(expected).trim()) {
    return { ok: false, error: "비밀번호가 올바르지 않습니다." };
  }
  return { ok: true };
}

function hasIdentityColumns_(headerRow) {
  for (var i = 0; i < headerRow.length; i++) {
    if (String(headerRow[i]) === "성명") return true;
  }
  return false;
}

function getResponses_() {
  var sheet = getSheet_();
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];

  var withIdentity = hasIdentityColumns_(data[0]);
  var list = [];
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    if (!row[0] && !row[1]) continue;

    if (withIdentity) {
      list.push({
        id: String(row[1] || ""),
        submittedAtLocal: String(row[0]),
        submitterName: String(row[2] || ""),
        submitterPhone: String(row[3] || ""),
        bestCriteriaText: String(row[4] || ""),
        bestManager: String(row[5] || ""),
        bestReason: String(row[6] || ""),
        worstItemsText: String(row[7] || ""),
        worstManager: String(row[8] || ""),
        worstReason: String(row[9] || ""),
        otherOpinion: String(row[10] || ""),
      });
    } else {
      list.push({
        id: String(row[1] || ""),
        submittedAtLocal: String(row[0]),
        submitterName: "",
        submitterPhone: "",
        bestCriteriaText: String(row[2] || ""),
        bestManager: String(row[3] || ""),
        bestReason: String(row[4] || ""),
        worstItemsText: String(row[5] || ""),
        worstManager: String(row[6] || ""),
        worstReason: String(row[7] || ""),
        otherOpinion: String(row[8] || ""),
      });
    }
  }

  list.sort(function (a, b) {
    return String(b.submittedAtLocal).localeCompare(String(a.submittedAtLocal));
  });
  return list;
}

function submitResponse_(data) {
  if (!data.submitterName || !String(data.submitterName).trim()) {
    return { success: false, error: "성명을 입력해 주세요." };
  }
  if (!data.submitterPhone || !String(data.submitterPhone).trim()) {
    return { success: false, error: "연락처를 입력해 주세요." };
  }

  getSheet_().appendRow([
    data.submittedAtLocal || data.submittedAt || new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" }),
    data.id || Utilities.getUuid(),
    String(data.submitterName).trim(),
    String(data.submitterPhone).trim(),
    data.bestCriteriaText || "",
    data.bestManager || "",
    data.bestReason || "",
    data.worstItemsText || "",
    data.worstManager || "",
    data.worstReason || "",
    data.otherOpinion || "",
  ]);

  return { success: true };
}

function deleteResponse_(id) {
  var sheet = getSheet_();
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][1]) === String(id)) {
      sheet.deleteRow(i + 1);
      return;
    }
  }
}

function doGet(e) {
  try {
    var action = (e && e.parameter && e.parameter.action) || "status";
    if (action === "status") {
      return jsonResponse({ success: true, message: "survey webhook ready" });
    }
    if (action === "auth") {
      var auth = checkAuth_((e.parameter && e.parameter.adminToken) || "");
      return jsonResponse({ success: auth.ok, error: auth.error || "" });
    }
    if (action === "list") {
      if (!isAuthorized_((e.parameter && e.parameter.adminToken) || "")) {
        return jsonResponse({ success: false, error: "관리자 인증에 실패했습니다." });
      }
      return jsonResponse({ success: true, responses: getResponses_() });
    }
    return jsonResponse({ success: false, error: "unknown action" });
  } catch (err) {
    return jsonResponse({ success: false, error: String(err) });
  }
}

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var action = data.action || "submit";

    if (action === "submit") {
      return jsonResponse(submitResponse_(data));
    }

    if (!isAuthorized_(data.adminToken || "")) {
      return jsonResponse({ success: false, error: "관리자 인증에 실패했습니다." });
    }

    if (action === "delete") {
      if (!data.id) return jsonResponse({ success: false, error: "ID가 없습니다." });
      deleteResponse_(data.id);
      return jsonResponse({ success: true });
    }

    return jsonResponse({ success: false, error: "unknown action" });
  } catch (err) {
    return jsonResponse({ success: false, error: String(err) });
  }
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
