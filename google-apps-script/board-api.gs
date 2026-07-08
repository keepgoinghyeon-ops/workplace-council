/**
 * 자유게시판 API — Google Sheets
 *
 * [초기 설정]
 * 1. Google 스프레드시트 → Apps Script에 이 코드 붙여넣기
 * 2. 스크립트 속성: BOARD_ADMIN_TOKEN = 관리자 비밀번호 (삭제용)
 * 3. setupBoardSheet() 실행
 * 4. 웹 앱 배포 (모든 사용자) → VITE_BOARD_API_URL
 */

var BOARD_SHEET = "자유게시판";
var HEADERS = ["ID", "작성일시", "지청명", "내용"];

function setupBoardSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(BOARD_SHEET);
  if (!sheet) sheet = ss.insertSheet(BOARD_SHEET);
  sheet.clear();
  sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
  sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold");
  sheet.setFrozenRows(1);
}

function getBoardSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(BOARD_SHEET);
  if (!sheet) {
    setupBoardSheet();
    sheet = ss.getSheetByName(BOARD_SHEET);
  }
  return sheet;
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

function getPosts_() {
  var sheet = getBoardSheet_();
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];

  var list = [];
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    if (!row[0]) continue;
    list.push({
      id: String(row[0]),
      createdAt: String(row[1]),
      office: String(row[2]),
      content: String(row[3]),
    });
  }

  list.sort(function (a, b) {
    return String(b.createdAt).localeCompare(String(a.createdAt));
  });
  return list;
}

function createPost_(data) {
  var office = data.office || "";
  var content = data.content || "";

  if (!String(office).trim()) {
    return { success: false, error: "지청명을 입력해 주세요." };
  }
  if (!String(content).trim()) {
    return { success: false, error: "내용을 입력해 주세요." };
  }

  var id = Utilities.getUuid();
  var now = new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" });

  getBoardSheet_().appendRow([
    id,
    now,
    String(office).trim(),
    String(content).trim(),
  ]);

  return {
    success: true,
    post: {
      id: id,
      createdAt: now,
      office: String(office).trim(),
      content: String(content).trim(),
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
      return jsonResponse({ success: true, posts: getPosts_() });
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
