/**
 * Signup API - Google Sheets + Drive (signatures)
 *
 * Setup:
 * 1. Paste this entire file into its OWN Apps Script project (do not mix with board-api)
 * 2. Script property: SIGNUP_ADMIN_TOKEN = admin password
 * 3. Run setupSignupSheet()
 * 4. Run setupSignupDriveFolder() and allow Drive
 * 5. Deploy > Web app > Execute as Me > Anyone > New version
 * 6. Use /exec URL as VITE_SIGNUP_API_URL
 */

var SIGNUP_SHEET = "가입신청";
var DRIVE_FOLDER_NAME = "직협_가입신청_서명";
var HEADERS = ["ID", "제출일시", "성명", "소속", "직급", "신청일", "데이터JSON"];
var API_VERSION = 2;

function setupSignupSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SIGNUP_SHEET);
  if (!sheet) sheet = ss.insertSheet(SIGNUP_SHEET);
  sheet.clear();
  sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
  sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold");
  sheet.setFrozenRows(1);
}

function setupSignupDriveFolder() {
  getDriveFolder_();
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

/** dataURL 또는 이미 URL인 서명을 Drive URL로 저장합니다. */
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

  try {
    var blob = Utilities.newBlob(Utilities.base64Decode(b64), mime, fileName + ext);
    var file = getDriveFolder_().createFile(blob);
    sharePublic_(file);
    var id = file.getId();
    // thumbnail 이 img/PDF 표시에 더 안정적입니다.
    return "https://drive.google.com/thumbnail?id=" + id + "&sz=w800";
  } catch (err) {
    // Drive 실패 시 작은 서명만 시트에 남기고, 너무 크면 비움
    if (raw.length < 40000) return raw;
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
    return String(b.submittedAt).localeCompare(String(a.submittedAt));
  });
  return list;
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
      error: "시트 저장에 실패했습니다. setupSignupSheet() 실행 여부를 확인해 주세요. (" + String(sheetErr) + ")",
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
