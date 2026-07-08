/**
 * 가입신청서 + 원천징수동의서 API — Google Sheets
 *
 * [초기 설정]
 * 1. Google 스프레드시트 → Apps Script에 이 코드 붙여넣기
 * 2. 스크립트 속성: SIGNUP_ADMIN_TOKEN = 관리자 비밀번호
 * 3. setupSignupSheet() 실행
 * 4. 웹 앱 배포 (모든 사용자) → VITE_SIGNUP_API_URL
 */

var SIGNUP_SHEET = "가입신청";
var HEADERS = ["ID", "제출일시", "성명", "소속", "직급", "신청일", "데이터JSON"];

function setupSignupSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SIGNUP_SHEET);
  if (!sheet) sheet = ss.insertSheet(SIGNUP_SHEET);
  sheet.clear();
  sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
  sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold");
  sheet.setFrozenRows(1);
}

function getSignupSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SIGNUP_SHEET);
  if (!sheet) {
    setupSignupSheet();
    sheet = ss.getSheetByName(SIGNUP_SHEET);
  }
  return sheet;
}

function getAdminToken_() {
  return PropertiesService.getScriptProperties().getProperty("SIGNUP_ADMIN_TOKEN");
}

function isAuthorized_(token) {
  var expected = getAdminToken_();
  return expected && String(token).trim() === String(expected).trim();
}

function checkAuth_(token) {
  var expected = getAdminToken_();
  if (!expected) {
    return { ok: false, error: "SIGNUP_ADMIN_TOKEN 스크립트 속성이 설정되지 않았습니다." };
  }
  if (String(token).trim() !== String(expected).trim()) {
    return { ok: false, error: "비밀번호가 올바르지 않습니다." };
  }
  return { ok: true };
}

function getSubmissions_() {
  var sheet = getSignupSheet_();
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];

  var list = [];
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    if (!row[0]) continue;
    var payload = {};
    try { payload = JSON.parse(row[6] || "{}"); } catch (e) { payload = {}; }
    var app = payload.application || payload.member || {};
    var wh = payload.withholding || payload.bank || {};
    list.push({
      id: String(row[0]),
      submittedAt: String(row[1]),
      name: String(row[2]),
      affiliation: String(row[3]),
      rank: String(row[4]),
      applicationDate: String(row[5]),
      application: app,
      withholding: wh,
      sig1: payload.sig1 || "",
      sig2: payload.sig2 || "",
    });
  }

  list.sort(function (a, b) {
    return String(b.submittedAt).localeCompare(String(a.submittedAt));
  });
  return list;
}

function createSubmission_(data) {
  var app = data.application || data.member || {};
  var wh = data.withholding || data.bank || {};

  if (!app.name && wh.name) app.name = wh.name;
  if (!app.affiliation && wh.affiliation) app.affiliation = wh.affiliation;

  if (!app.name || !String(app.name).trim()) {
    return { success: false, error: "이름을 입력하세요." };
  }
  if (!app.affiliation || !String(app.affiliation).trim()) {
    return { success: false, error: "소속을 입력하세요." };
  }

  var id = Utilities.getUuid();
  var now = new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" });
  var payload = {
    application: app,
    withholding: wh,
    sig1: data.sig1 || "",
    sig2: data.sig2 || "",
  };

  getSignupSheet_().appendRow([
    id,
    now,
    String(app.name).trim(),
    String(app.affiliation).trim(),
    String(app.rank || "").trim(),
    String(app.applicationDate || app.joinDate || "").trim(),
    JSON.stringify(payload),
  ]);

  return {
    success: true,
    submission: {
      id: id,
      submittedAt: now,
      name: String(app.name).trim(),
      affiliation: String(app.affiliation).trim(),
      rank: String(app.rank || "").trim(),
      applicationDate: String(app.applicationDate || app.joinDate || "").trim(),
      application: app,
      withholding: wh,
      sig1: data.sig1 || "",
      sig2: data.sig2 || "",
    },
  };
}

function deleteSubmission_(id) {
  var sheet = getSignupSheet_();
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(id)) {
      sheet.deleteRow(i + 1);
      return;
    }
  }
}

function doGet(e) {
  try {
    var action = (e && e.parameter && e.parameter.action) || "status";
    if (action === "status") {
      return jsonResponse({ success: true, service: "signup-api", status: "ok" });
    }
    if (action === "auth") {
      var auth = checkAuth_((e.parameter && e.parameter.adminToken) || "");
      return jsonResponse({ success: auth.ok, error: auth.error || "" });
    }
    if (action === "list") {
      if (!isAuthorized_((e.parameter && e.parameter.adminToken) || "")) {
        return jsonResponse({ success: false, error: "관리자 인증에 실패했습니다." });
      }
      return jsonResponse({ success: true, submissions: getSubmissions_() });
    }
    return jsonResponse({ success: false, error: "unknown action" });
  } catch (err) {
    return jsonResponse({ success: false, error: String(err) });
  }
}

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var action = data.action || "";

    if (action === "submit") {
      return jsonResponse(createSubmission_(data));
    }

    if (!isAuthorized_(data.adminToken || "")) {
      return jsonResponse({ success: false, error: "관리자 인증에 실패했습니다." });
    }

    if (action === "delete") {
      if (!data.id) return jsonResponse({ success: false, error: "ID가 없습니다." });
      deleteSubmission_(data.id);
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
