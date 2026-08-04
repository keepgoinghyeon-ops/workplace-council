/**
 * 자유게시판 API — Google Sheets + Google Drive
 *
 * [초기 설정]
 * 1. Google 스프레드시트 → Apps Script에 이 코드 붙여넣기
 * 2. 스크립트 속성: BOARD_ADMIN_TOKEN = 관리자 비밀번호 (삭제용)
 * 3. setupBoardSheet() 실행 (기존 시트가 있으면 migrateBoardSheet() 권장)
 * 4. setupDriveFolder() 실행
 * 5. 웹 앱 재배포 (모든 사용자) → VITE_BOARD_API_URL
 */

var BOARD_SHEET = "자유게시판";
var DRIVE_FOLDER_NAME = "직협_자유게시판_첨부파일";
var HEADERS = ["ID", "작성일시", "지청명", "제목", "내용", "비공개", "첨부파일JSON"];

function setupBoardSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(BOARD_SHEET);
  if (!sheet) sheet = ss.insertSheet(BOARD_SHEET);
  sheet.clear();
  sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
  sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold");
  sheet.setFrozenRows(1);
}

/** 기존 데이터를 유지하면서 제목·첨부파일 열을 추가합니다. */
function migrateBoardSheet() {
  var sheet = getBoardSheet_();
  ensureBoardSchema_(sheet);
}

function setupDriveFolder() {
  var folders = DriveApp.getFoldersByName(DRIVE_FOLDER_NAME);
  if (!folders.hasNext()) {
    DriveApp.createFolder(DRIVE_FOLDER_NAME);
  }
}

function getBoardSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(BOARD_SHEET);
  if (!sheet) {
    setupBoardSheet();
    sheet = ss.getSheetByName(BOARD_SHEET);
  }
  ensureBoardSchema_(sheet);
  return sheet;
}

function getDriveFolder_() {
  var folders = DriveApp.getFoldersByName(DRIVE_FOLDER_NAME);
  if (folders.hasNext()) return folders.next();
  return DriveApp.createFolder(DRIVE_FOLDER_NAME);
}

function headerIndexMap_(headers) {
  var map = {};
  for (var i = 0; i < headers.length; i++) {
    map[String(headers[i])] = i;
  }
  return map;
}

function ensureBoardSchema_(sheet) {
  var lastCol = Math.max(sheet.getLastColumn(), 1);
  var lastRow = Math.max(sheet.getLastRow(), 1);
  var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0].map(String);
  var map = headerIndexMap_(headers);

  if (map["제목"] !== undefined && map["첨부파일JSON"] !== undefined && map["내용"] !== undefined) {
    return;
  }

  var data = sheet.getDataRange().getValues();
  var newData = [HEADERS];

  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    if (!row[0]) continue;

    var id = row[map["ID"] !== undefined ? map["ID"] : 0];
    var createdAt = row[map["작성일시"] !== undefined ? map["작성일시"] : 1];
    var office = row[map["지청명"] !== undefined ? map["지청명"] : 2];
    var title = map["제목"] !== undefined ? row[map["제목"]] : "";
    var content = map["내용"] !== undefined ? row[map["내용"]] : (map["제목"] === undefined ? row[3] : "");
    var isPrivate = map["비공개"] !== undefined ? row[map["비공개"]] : (map["제목"] === undefined ? row[4] : "");
    var files = map["첨부파일JSON"] !== undefined ? row[map["첨부파일JSON"]] : "[]";

    // 구버전: ID, 작성일시, 지청명, 내용, 비공개
    if (map["제목"] === undefined && headers[3] === "내용") {
      content = row[3];
      isPrivate = row[4];
      title = "";
      files = "[]";
    }

    newData.push([
      id,
      createdAt,
      office,
      title || "",
      content || "",
      isPrivate || "",
      files || "[]",
    ]);
  }

  sheet.clear();
  sheet.getRange(1, 1, newData.length, HEADERS.length).setValues(newData);
  sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold");
  sheet.setFrozenRows(1);
}

function getAdminToken_() {
  return PropertiesService.getScriptProperties().getProperty("BOARD_ADMIN_TOKEN");
}

function isAuthorized_(token) {
  var expected = getAdminToken_();
  return expected && String(token).trim() === String(expected).trim();
}

function checkAuth_(token) {
  var expected = getAdminToken_();
  if (!expected) {
    return { ok: false, error: "BOARD_ADMIN_TOKEN 스크립트 속성이 설정되지 않았습니다." };
  }
  if (String(token).trim() !== String(expected).trim()) {
    return { ok: false, error: "비밀번호가 올바르지 않습니다." };
  }
  return { ok: true };
}

function parsePrivateFlag_(value) {
  return value === true || value === "Y" || String(value).toLowerCase() === "true" || value === "비공개";
}

function parseFiles_(raw) {
  try {
    var files = JSON.parse(raw || "[]");
    return Array.isArray(files) ? files : [];
  } catch (e) {
    return [];
  }
}

function mediaUrl_(fileId, mimeType) {
  if (!fileId) return "";
  if (String(mimeType || "").indexOf("video/") === 0) {
    return "https://drive.google.com/file/d/" + fileId + "/preview";
  }
  return "https://drive.google.com/uc?export=view&id=" + fileId;
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
    var id = file.getId();
    saved.push({
      name: f.name,
      mimeType: f.mimeType || "",
      id: id,
      url: mediaUrl_(id, f.mimeType),
      driveUrl: file.getUrl(),
    });
  });

  return saved;
}

function getPosts_(includePrivate) {
  var sheet = getBoardSheet_();
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];

  var map = headerIndexMap_(data[0].map(String));
  var list = [];

  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    if (!row[0]) continue;

    var isPrivate = parsePrivateFlag_(row[map["비공개"]]);
    if (!includePrivate && isPrivate) continue;

    list.push({
      id: String(row[map["ID"]]),
      createdAt: String(row[map["작성일시"]]),
      office: String(row[map["지청명"]] || ""),
      title: String(row[map["제목"]] || ""),
      content: String(row[map["내용"]] || ""),
      isPrivate: isPrivate,
      files: parseFiles_(row[map["첨부파일JSON"]]),
    });
  }

  list.sort(function (a, b) {
    return String(b.createdAt).localeCompare(String(a.createdAt));
  });
  return list;
}

function createPost_(data) {
  var office = data.office || "";
  var title = data.title || "";
  var content = data.content || "";

  if (!String(office).trim()) {
    return { success: false, error: "지청명을 입력해 주세요." };
  }
  if (!String(title).trim()) {
    return { success: false, error: "제목을 입력해 주세요." };
  }
  if (!String(content).trim()) {
    return { success: false, error: "내용을 입력해 주세요." };
  }

  var filesInput = data.files || [];
  if (filesInput.length > 5) {
    return { success: false, error: "첨부파일은 최대 5개까지 가능합니다." };
  }

  var id = Utilities.getUuid();
  var now = new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" });
  var isPrivate = parsePrivateFlag_(data.isPrivate);
  var files = saveFiles_(filesInput);

  getBoardSheet_().appendRow([
    id,
    now,
    String(office).trim(),
    String(title).trim(),
    String(content).trim(),
    isPrivate ? "Y" : "",
    JSON.stringify(files),
  ]);

  return {
    success: true,
    post: {
      id: id,
      createdAt: now,
      office: String(office).trim(),
      title: String(title).trim(),
      content: String(content).trim(),
      isPrivate: isPrivate,
      files: files,
    },
  };
}

function deletePost_(id) {
  var sheet = getBoardSheet_();
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
    if (action === "status") {
      return jsonResponse({ success: true, service: "board-api", status: "ok" });
    }
    if (action === "list") {
      var adminToken = (e.parameter && e.parameter.adminToken) || "";
      var includePrivate = isAuthorized_(adminToken);
      return jsonResponse({ success: true, posts: getPosts_(includePrivate) });
    }
    if (action === "auth") {
      var auth = checkAuth_((e.parameter && e.parameter.adminToken) || "");
      return jsonResponse({ success: auth.ok, error: auth.error || "" });
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
      return jsonResponse(createPost_(data));
    }

    if (!isAuthorized_(data.adminToken || "")) {
      return jsonResponse({ success: false, error: "관리자 인증에 실패했습니다." });
    }

    if (action === "delete") {
      if (!data.id) return jsonResponse({ success: false, error: "ID가 없습니다." });
      deletePost_(data.id);
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
