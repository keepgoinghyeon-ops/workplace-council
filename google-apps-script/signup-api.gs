/**
 * Signup API - Google Sheets + Drive (signatures)
 *
 * Setup:
 * 1. Paste this entire file into its OWN Apps Script project (do not mix with board-api)
 * 2. Script property: SIGNUP_ADMIN_TOKEN = admin password
 * 3. Run ensureSignupSheet()  (기존 데이터 유지 — clear 하지 않음)
 * 4. Run setupSignupDriveFolder() and allow Drive
 * 5. Deploy > Web app > Execute as Me > Anyone > New version
 * 6. Use /exec URL as VITE_SIGNUP_API_URL
 *
 * 주의: setupSignupSheet() 예전 버전은 sheet.clear()로 데이터를 지웠습니다.
 *       반드시 ensureSignupSheet()만 사용하세요.
 */

var SIGNUP_SHEET = "가입신청";
var DRIVE_FOLDER_NAME = "직협_가입신청_서명";
var HEADERS = ["ID", "제출일시", "성명", "소속", "직급", "신청일", "데이터JSON"];
var API_VERSION = 3;

/**
 * 시트가 없으면 만들고, 헤더만 보정합니다.
 * 기존 데이터는 절대 삭제하지 않습니다.
 */
function ensureSignupSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SIGNUP_SHEET);
  if (!sheet) {
    sheet = ss.insertSheet(SIGNUP_SHEET);
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold");
    sheet.setFrozenRows(1);
    return "가입신청 시트를 새로 만들었습니다.";
  }

  var lastCol = Math.max(sheet.getLastColumn(), 1);
  var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  var empty = sheet.getLastRow() <= 1;
  var headerOk = true;
  for (var i = 0; i < HEADERS.length; i++) {
    if (String(headers[i] || "") !== HEADERS[i]) {
      headerOk = false;
      break;
    }
  }

  if (!headerOk && empty) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold");
    sheet.setFrozenRows(1);
    return "빈 시트에 헤더만 설정했습니다.";
  }

  sheet.setFrozenRows(1);
  return "가입신청 시트 확인 완료. 행 수: " + sheet.getLastRow();
}

/** @deprecated clear 위험이 있어 ensureSignupSheet로 위임합니다. */
function setupSignupSheet() {
  return ensureSignupSheet();
}

function setupSignupDriveFolder() {
  getDriveFolder_();
}

function getSignupSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SIGNUP_SHEET);
  if (!sheet) {
    ensureSignupSheet();
    sheet = ss.getSheetByName(SIGNUP_SHEET);
  }
  return sheet;
}

function getDriveFolder_() {
  var folders = DriveApp.getFoldersByName(DRIVE_FOLDER_NAME);
  if (folders.hasNext()) return folders.next();
  return DriveApp.createFolder(DRIVE_FOLDER_NAME);
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

function sharePublic_(file) {
  try {
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  } catch (e1) {
    try {
      file.setSharing(DriveApp.Access.ANYONE, DriveApp.Permission.VIEW);
    } catch (e2) {}
  }
}

/** dataURL 서명을 저장합니다. 작은 서명은 dataURL 유지(표시 안정), Drive는 백업. */
function storeSignature_(dataUrl, fileName) {
  if (!dataUrl) return "";
  var raw = String(dataUrl);
  if (raw.indexOf("http://") === 0 || raw.indexOf("https://") === 0) return raw;
  if (raw.indexOf("data:image") !== 0) return raw;

  var comma = raw.indexOf(",");
  if (comma < 0) return "";
  var meta = raw.substring(0, comma);
  var b64 = raw.substring(comma + 1);
  var mime = "image/png";
  var mimeMatch = meta.match(/data:([^;]+)/);
  if (mimeMatch) mime = mimeMatch[1];
  var ext = mime.indexOf("jpeg") >= 0 || mime.indexOf("jpg") >= 0 ? ".jpg" : ".png";

  // 압축된 서명은 시트에 dataURL로 두는 편이 미리보기·PDF에 안정적
  if (raw.length < 40000) {
    try {
      var blob = Utilities.newBlob(Utilities.base64Decode(b64), mime, fileName + ext);
      getDriveFolder_().createFile(blob);
    } catch (backupErr) {
      // Drive 백업 실패해도 dataURL로 제출 가능
    }
    return raw;
  }

  try {
    var bigBlob = Utilities.newBlob(Utilities.base64Decode(b64), mime, fileName + ext);
    var file = getDriveFolder_().createFile(bigBlob);
    sharePublic_(file);
    var id = file.getId();
    return "https://drive.google.com/thumbnail?id=" + id + "&sz=w800";
  } catch (err) {
    if (raw.length < 48000) return raw;
    throw new Error(
      "서명 저장에 실패했습니다. Apps Script에서 setupSignupDriveFolder()를 실행하고 Drive 권한을 허용한 뒤 웹 앱을 새 버전으로 재배포해 주세요. (" +
        String(err) +
        ")"
    );
  }
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
    try {
      payload = JSON.parse(row[6] || "{}");
    } catch (e) {
      payload = {};
    }
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
    // 최신 제출일시가 위로
    return (
      parseSignupTime_(b.submittedAt, b.applicationDate) -
      parseSignupTime_(a.submittedAt, a.applicationDate)
    );
  });
  return list;
}

/** ko-KR 제출일시 / YYYY-MM-DD 신청일을 밀리초로 변환 (최신순 정렬용) */
function parseSignupTime_(submittedAt, applicationDate) {
  var s = String(submittedAt || "").trim();
  if (s) {
    var direct = new Date(s);
    if (!isNaN(direct.getTime())) return direct.getTime();

    // 예: 2026. 8. 19. 오후 3:24:05 / 2026. 8. 19. 15:24:05
    var m = s.match(
      /(\d{4})\.\s*(\d{1,2})\.\s*(\d{1,2})\.?\s*(오전|오후)?\s*(\d{1,2}):(\d{2})(?::(\d{2}))?/
    );
    if (m) {
      var y = Number(m[1]);
      var mo = Number(m[2]) - 1;
      var d = Number(m[3]);
      var h = Number(m[5]);
      var mi = Number(m[6]);
      var sec = Number(m[7] || 0);
      if (m[4] === "오후" && h < 12) h += 12;
      if (m[4] === "오전" && h === 12) h = 0;
      return new Date(y, mo, d, h, mi, sec).getTime();
    }

    // 예: 2026. 8. 19.
    var dayOnly = s.match(/(\d{4})\.\s*(\d{1,2})\.\s*(\d{1,2})/);
    if (dayOnly) {
      return new Date(
        Number(dayOnly[1]),
        Number(dayOnly[2]) - 1,
        Number(dayOnly[3])
      ).getTime();
    }
  }

  var ad = String(applicationDate || "").trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(ad)) {
    var parts = ad.split("-");
    return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])).getTime();
  }
  return 0;
}

function createSubmission_(data) {
  var app = data.application || data.member || {};
  var wh = data.withholding || data.bank || {};

  if (!app.name && wh.name) app.name = wh.name;
  if (!app.affiliation && wh.affiliation) app.affiliation = wh.affiliation;
  if (!wh.name && app.name) wh.name = app.name;
  if (!wh.affiliation && app.affiliation) wh.affiliation = app.affiliation;
  if (!wh.rank && app.rank) wh.rank = app.rank;

  if (!app.name || !String(app.name).trim()) {
    return { success: false, error: "이름을 입력하세요.", apiVersion: API_VERSION };
  }
  if (!app.affiliation || !String(app.affiliation).trim()) {
    return { success: false, error: "소속을 입력하세요.", apiVersion: API_VERSION };
  }

  var id = Utilities.getUuid();
  var now = new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" });
  var safeName = String(app.name).trim().replace(/[\\/:*?"<>|]/g, "_");

  var sig1;
  var sig2;
  try {
    sig1 = storeSignature_(data.sig1 || "", "sig1_" + safeName + "_" + id);
    sig2 = storeSignature_(data.sig2 || "", "sig2_" + safeName + "_" + id);
  } catch (sigErr) {
    return { success: false, error: String(sigErr.message || sigErr), apiVersion: API_VERSION };
  }

  var payload = {
    application: app,
    withholding: wh,
    sig1: sig1,
    sig2: sig2,
  };

  var json = JSON.stringify(payload);
  if (json.length > 48000) {
    return {
      success: false,
      error: "제출 데이터가 너무 큽니다. 서명을 다시 간단히 작성한 뒤 제출해 주세요.",
      apiVersion: API_VERSION,
    };
  }

  try {
    getSignupSheet_().appendRow([
      id,
      now,
      String(app.name).trim(),
      String(app.affiliation).trim(),
      String(app.rank || "").trim(),
      String(app.applicationDate || app.joinDate || "").trim(),
      json,
    ]);
  } catch (sheetErr) {
    return {
      success: false,
      error: "시트 저장에 실패했습니다. ensureSignupSheet() 실행 여부를 확인해 주세요. (" + String(sheetErr) + ")",
      apiVersion: API_VERSION,
    };
  }

  return {
    success: true,
    apiVersion: API_VERSION,
    submission: {
      id: id,
      submittedAt: now,
      name: String(app.name).trim(),
      affiliation: String(app.affiliation).trim(),
      rank: String(app.rank || "").trim(),
      applicationDate: String(app.applicationDate || app.joinDate || "").trim(),
      application: app,
      withholding: wh,
      sig1: sig1,
      sig2: sig2,
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
      return jsonResponse({
        success: true,
        service: "signup-api",
        status: "ok",
        apiVersion: API_VERSION,
      });
    }
    if (action === "auth") {
      var auth = checkAuth_((e.parameter && e.parameter.adminToken) || "");
      return jsonResponse({
        success: auth.ok,
        error: auth.error || "",
        apiVersion: API_VERSION,
      });
    }
    if (action === "list") {
      if (!isAuthorized_((e.parameter && e.parameter.adminToken) || "")) {
        return jsonResponse({ success: false, error: "관리자 인증에 실패했습니다.", apiVersion: API_VERSION });
      }
      return jsonResponse({
        success: true,
        apiVersion: API_VERSION,
        submissions: getSubmissions_(),
      });
    }
    return jsonResponse({ success: false, error: "unknown action", apiVersion: API_VERSION });
  } catch (err) {
    return jsonResponse({ success: false, error: String(err), apiVersion: API_VERSION });
  }
}

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return jsonResponse({
        success: false,
        error: "요청 본문이 없습니다. 웹 앱 URL(/exec)과 배포 설정을 확인해 주세요.",
        apiVersion: API_VERSION,
      });
    }

    var data = JSON.parse(e.postData.contents);
    var action = data.action || "";

    if (action === "submit") {
      return jsonResponse(createSubmission_(data));
    }

    if (!isAuthorized_(data.adminToken || "")) {
      return jsonResponse({ success: false, error: "관리자 인증에 실패했습니다.", apiVersion: API_VERSION });
    }

    if (action === "delete") {
      if (!data.id) return jsonResponse({ success: false, error: "ID가 없습니다.", apiVersion: API_VERSION });
      deleteSubmission_(data.id);
      return jsonResponse({ success: true, apiVersion: API_VERSION });
    }

    return jsonResponse({ success: false, error: "unknown action", apiVersion: API_VERSION });
  } catch (err) {
    return jsonResponse({ success: false, error: String(err), apiVersion: API_VERSION });
  }
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
