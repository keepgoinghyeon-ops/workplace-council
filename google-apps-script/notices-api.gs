/**
 * 공지사항 API — Google Sheets + Google Drive
 *
 * [초기 설정]
 * 1. Google 스프레드시트 생성 → Apps Script에 이 코드 붙여넣기
 * 2. 프로젝트 설정 → 스크립트 속성 추가:
 *    NOTICES_ADMIN_TOKEN = 운영진 비밀번호 (예: jikhyp2025!)
 * 3. setupNoticesSheet() 실행
 * 4. setupDriveFolder() 실행
 * 5. 웹 앱 배포 (모든 사용자) → URL을 .env에 설정
 *    VITE_NOTICES_API_URL=https://script.google.com/macros/s/....../exec
 */

var NOTICES_SHEET = "공지사항";
var DRIVE_FOLDER_NAME = "직협_공지_첨부파일";

var HEADERS = ["ID", "작성일시", "제목", "분류", "내용", "첨부파일JSON", "고정"];

function setupNoticesSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(NOTICES_SHEET);
  if (!sheet) sheet = ss.insertSheet(NOTICES_SHEET);
  sheet.clear();
  sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
  sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold");
  sheet.setFrozenRows(1);
}

function setupDriveFolder() {
  var folders = DriveApp.getFoldersByName(DRIVE_FOLDER_NAME);
  if (!folders.hasNext()) {
    DriveApp.createFolder(DRIVE_FOLDER_NAME);
  }
}

function getNoticesSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(NOTICES_SHEET);
  if (!sheet) {
    setupNoticesSheet();
    sheet = ss.getSheetByName(NOTICES_SHEET);
  }
  return sheet;
}

function getDriveFolder_() {
  var folders = DriveApp.getFoldersByName(DRIVE_FOLDER_NAME);
  if (folders.hasNext()) return folders.next();
  return DriveApp.createFolder(DRIVE_FOLDER_NAME);
}

function getAdminToken_() {
  return PropertiesService.getScriptProperties().getProperty("NOTICES_ADMIN_TOKEN");
}

function isAuthorized_(token) {
  var expected = getAdminToken_();
  return expected && String(token).trim() === String(expected).trim();
}

function checkAuth_(token) {
  var expected = getAdminToken_();
  if (!expected) {
    return { ok: false, error: "NOTICES_ADMIN_TOKEN 스크립트 속성이 설정되지 않았습니다." };
  }
  if (String(token).trim() !== String(expected).trim()) {
    return { ok: false, error: "비밀번호가 올바르지 않습니다." };
  }
  return { ok: true };
}

function getNotices_() {
  var sheet = getNoticesSheet_();
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];

  var notices = [];
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    if (!row[0]) continue;
    var files = [];
    try { files = JSON.parse(row[5] || "[]"); } catch (e) { files = []; }
    notices.push({
      id: String(row[0]),
      createdAt: String(row[1]),
      title: String(row[2]),
      category: String(row[3]),
      content: String(row[4]),
      files: files,
      pinned: row[6] === true || row[6] === "TRUE" || row[6] === "true",
    });
  }

  notices.sort(function (a, b) {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return String(b.createdAt).localeCompare(String(a.createdAt));
  });

  return notices;
}

function saveFiles_(files) {
  if (!files || !files.length) return [];
  var folder = getDriveFolder_();
  var saved = [];

  files.forEach(function (f) {
    if (!f.data || !f.name) return;
    var blob = Utilities.newBlob(
      Utilities.base64Decode(f.data),
      f.mimeType || "application/octet-stream",
      f.name
    );
    var file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    saved.push({
      name: f.name,
      url: file.getUrl(),
      mimeType: f.mimeType || "",
    });
  });

  return saved;
}

function createNotice_(data) {
  var sheet = getNoticesSheet_();
  var id = Utilities.getUuid();
  var now = new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" });
  var files = saveFiles_(data.files || []);

  sheet.appendRow([
    id,
    now,
    data.title || "",
    data.category || "공지",
    data.content || "",
    JSON.stringify(files),
    data.pinned ? "TRUE" : "FALSE",
  ]);

  return {
    id: id,
    createdAt: now,
    title: data.title,
    category: data.category,
    content: data.content,
    files: files,
    pinned: !!data.pinned,
  };
}

function deleteNotice_(id) {
  var sheet = getNoticesSheet_();
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
    var action = (e && e.parameter && e.parameter.action) || "list";
    if (action === "list") {
      return jsonResponse({ success: true, notices: getNotices_() });
    }
    if (action === "auth") {
      var auth = checkAuth_((e.parameter && e.parameter.adminToken) || "");
      return jsonResponse({
        success: auth.ok,
        error: auth.error || "",
      });
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

    if (action === "auth") {
      return jsonResponse({ success: isAuthorized_(data.adminToken || "") });
    }

    if (!isAuthorized_(data.adminToken || "")) {
      return jsonResponse({ success: false, error: "운영진 인증에 실패했습니다." });
    }

    if (action === "create") {
      if (!data.title || !data.title.trim()) {
        return jsonResponse({ success: false, error: "제목을 입력해 주세요." });
      }
      var notice = createNotice_(data);
      return jsonResponse({ success: true, notice: notice });
    }

    if (action === "delete") {
      if (!data.id) return jsonResponse({ success: false, error: "ID가 없습니다." });
      deleteNotice_(data.id);
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
