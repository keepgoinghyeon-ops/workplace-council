/**
 * 자유게시판 API — Google Sheets + Google Drive
 *
 * [초기 설정]
 * 1. Google 스프레드시트 → Apps Script에 이 코드 붙여넣기
 * 2. 스크립트 속성: BOARD_ADMIN_TOKEN = 관리자 비밀번호 (삭제용)
 * 3. migrateBoardSheet() 실행 (기존 데이터 유지 + 열 정리)
 * 4. setupDriveFolder() 실행
 * 5. 웹 앱 재배포(새 버전) → VITE_BOARD_API_URL
 */

var BOARD_SHEET = "자유게시판";
var DRIVE_FOLDER_NAME = "직협_자유게시판_첨부파일";
var HEADERS = ["ID", "작성일시", "지청명", "제목", "내용", "비공개", "첨부파일JSON", "수정키"];

function setupBoardSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(BOARD_SHEET);
  if (!sheet) sheet = ss.insertSheet(BOARD_SHEET);
  sheet.clear();
  sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
  sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold");
  sheet.setFrozenRows(1);
}

function migrateBoardSheet() {
  var sheet = getBoardSheetRaw_();
  ensureBoardSchema_(sheet);
}

function setupDriveFolder() {
  var folders = DriveApp.getFoldersByName(DRIVE_FOLDER_NAME);
  if (!folders.hasNext()) {
    DriveApp.createFolder(DRIVE_FOLDER_NAME);
  }
}

function getBoardSheetRaw_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(BOARD_SHEET);
  if (!sheet) {
    setupBoardSheet();
    sheet = ss.getSheetByName(BOARD_SHEET);
  }
  return sheet;
}

function getBoardSheet_() {
  var sheet = getBoardSheetRaw_();
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
    map[String(headers[i]).trim()] = i;
  }
  return map;
}

function isExactNewSchema_(headers) {
  if (headers.length < HEADERS.length) return false;
  for (var i = 0; i < HEADERS.length; i++) {
    if (String(headers[i]).trim() !== HEADERS[i]) return false;
  }
  return true;
}

function ensureBoardSchema_(sheet) {
  var lastCol = Math.max(sheet.getLastColumn(), 1);
  var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0].map(function (h) {
    return String(h).trim();
  });

  if (isExactNewSchema_(headers)) return;

  var data = sheet.getDataRange().getValues();
  var map = headerIndexMap_(headers);
  var newData = [HEADERS];

  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    if (!row[0]) continue;

    var id = pick_(row, map, "ID", 0);
    var createdAt = pick_(row, map, "작성일시", 1);
    var office = pick_(row, map, "지청명", 2);
    var title = "";
    var content = "";
    var isPrivate = "";
    var files = "[]";
    var editKey = "";

    if (map["제목"] !== undefined && map["내용"] !== undefined) {
      title = row[map["제목"]];
      content = row[map["내용"]];
      isPrivate = map["비공개"] !== undefined ? row[map["비공개"]] : "";
      files = map["첨부파일JSON"] !== undefined ? row[map["첨부파일JSON"]] : "[]";
      editKey = map["수정키"] !== undefined ? row[map["수정키"]] : "";
    } else if (headers[3] === "내용") {
      // 구버전: ID, 작성일시, 지청명, 내용, 비공개
      title = "";
      content = row[3];
      isPrivate = row[4];
    } else {
      title = row[3] || "";
      content = row[4] || "";
      isPrivate = row[5] || "";
      files = row[6] || "[]";
      editKey = row[7] || "";
    }

    newData.push([
      id,
      createdAt,
      office || "",
      title || "",
      content || "",
      isPrivate || "",
      files || "[]",
      editKey || "",
    ]);
  }

  sheet.clear();
  sheet.getRange(1, 1, newData.length, HEADERS.length).setValues(newData);
  sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold");
  sheet.setFrozenRows(1);
}

function pick_(row, map, key, fallbackIndex) {
  if (map[key] !== undefined) return row[map[key]];
  return row[fallbackIndex];
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

function guessMime_(name, mimeType) {
  if (mimeType) return String(mimeType);
  var n = String(name || "").toLowerCase();
  if (/\.png$/.test(n)) return "image/png";
  if (/\.jpe?g$/.test(n)) return "image/jpeg";
  if (/\.gif$/.test(n)) return "image/gif";
  if (/\.webp$/.test(n)) return "image/webp";
  if (/\.mp4$/.test(n)) return "video/mp4";
  if (/\.webm$/.test(n)) return "video/webm";
  if (/\.mov$/.test(n)) return "video/quicktime";
  if (/\.m4v$/.test(n)) return "video/x-m4v";
  return "application/octet-stream";
}

function mediaUrl_(fileId, mimeType) {
  if (!fileId) return "";
  if (String(mimeType || "").indexOf("video/") === 0) {
    return "https://drive.google.com/file/d/" + fileId + "/preview";
  }
  return "https://drive.google.com/uc?export=view&id=" + fileId;
}

function normalizeSavedFile_(f) {
  var mime = guessMime_(f.name, f.mimeType);
  var id = f.id || "";
  return {
    name: f.name || "",
    mimeType: mime,
    id: id,
    url: f.url || mediaUrl_(id, mime),
    driveUrl: f.driveUrl || (id ? "https://drive.google.com/file/d/" + id + "/view" : ""),
  };
}

function saveFiles_(files) {
  if (!files || !files.length) return [];
  var folder = getDriveFolder_();
  var saved = [];

  files.forEach(function (f) {
    if (!f.data || !f.name) return;
    var mime = guessMime_(f.name, f.mimeType);
    var blob = Utilities.newBlob(
      Utilities.base64Decode(f.data),
      mime,
      f.name
    );
    var file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    var id = file.getId();
    saved.push(normalizeSavedFile_({
      name: f.name,
      mimeType: mime,
      id: id,
      url: mediaUrl_(id, mime),
      driveUrl: file.getUrl(),
    }));
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

    var files = parseFiles_(row[map["첨부파일JSON"]]).map(function (f) {
      return normalizeSavedFile_(f);
    });

    list.push({
      id: String(row[map["ID"]]),
      createdAt: String(row[map["작성일시"]]),
      office: String(row[map["지청명"]] || ""),
      title: String(row[map["제목"]] || ""),
      content: String(row[map["내용"]] || ""),
      isPrivate: isPrivate,
      files: files,
      hasEditKey: Boolean(String(row[map["수정키"]] || "").trim()),
    });
  }

  list.sort(function (a, b) {
    return String(b.createdAt).localeCompare(String(a.createdAt));
  });
  return list;
}

function findRowIndexById_(sheet, id) {
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(id)) return i + 1;
  }
  return -1;
}

function getEditKeyById_(sheet, id) {
  var data = sheet.getDataRange().getValues();
  var map = headerIndexMap_(data[0].map(String));
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(id)) {
      return String(data[i][map["수정키"]] || "");
    }
  }
  return "";
}

function createPost_(data) {
  var office = data.office || "";
  var title = data.title || "";
  var content = data.content || "";
  var editKey = String(data.editKey || data.editPassword || "").trim();

  if (!String(office).trim()) {
    return { success: false, error: "지청명을 입력해 주세요." };
  }
  if (!String(title).trim()) {
    return { success: false, error: "제목을 입력해 주세요." };
  }
  if (!String(content).trim()) {
    return { success: false, error: "내용을 입력해 주세요." };
  }
  if (editKey.length < 4) {
    return { success: false, error: "수정용 비밀번호를 4자 이상 입력해 주세요." };
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
    editKey,
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
      hasEditKey: true,
    },
  };
}

function canEditPost_(sheet, id, data) {
  if (isAuthorized_(data.adminToken || "")) return true;
  var key = String(data.editKey || data.editPassword || "").trim();
  if (!key) return false;
  return key === getEditKeyById_(sheet, id);
}

function updatePost_(data) {
  var id = data.id;
  if (!id) return { success: false, error: "ID가 없습니다." };

  var sheet = getBoardSheet_();
  if (!canEditPost_(sheet, id, data)) {
    return { success: false, error: "수정 권한이 없습니다. 수정용 비밀번호를 확인해 주세요." };
  }

  var rowIndex = findRowIndexById_(sheet, id);
  if (rowIndex < 0) return { success: false, error: "게시글을 찾을 수 없습니다." };

  var dataRange = sheet.getDataRange().getValues();
  var map = headerIndexMap_(dataRange[0].map(String));
  var row = dataRange[rowIndex - 1];

  var office = data.office !== undefined ? String(data.office).trim() : String(row[map["지청명"]] || "");
  var title = data.title !== undefined ? String(data.title).trim() : String(row[map["제목"]] || "");
  var content = data.content !== undefined ? String(data.content).trim() : String(row[map["내용"]] || "");
  var isPrivate = data.isPrivate !== undefined ? parsePrivateFlag_(data.isPrivate) : parsePrivateFlag_(row[map["비공개"]]);
  var files = parseFiles_(row[map["첨부파일JSON"]]).map(normalizeSavedFile_);
  var editKey = String(row[map["수정키"]] || "");

  if (!office) return { success: false, error: "지청명을 입력해 주세요." };
  if (!title) return { success: false, error: "제목을 입력해 주세요." };
  if (!content) return { success: false, error: "내용을 입력해 주세요." };

  if (data.files && data.files.length) {
    if (data.files.length > 5) {
      return { success: false, error: "첨부파일은 최대 5개까지 가능합니다." };
    }
    files = saveFiles_(data.files);
  } else if (data.clearFiles) {
    files = [];
  }

  sheet.getRange(rowIndex, 1, rowIndex, HEADERS.length).setValues([[
    id,
    row[map["작성일시"]],
    office,
    title,
    content,
    isPrivate ? "Y" : "",
    JSON.stringify(files),
    editKey,
  ]]);

  return {
    success: true,
    post: {
      id: String(id),
      createdAt: String(row[map["작성일시"]]),
      office: office,
      title: title,
      content: content,
      isPrivate: isPrivate,
      files: files,
      hasEditKey: Boolean(editKey),
    },
  };
}

function deletePost_(id, data) {
  var sheet = getBoardSheet_();
  if (!canEditPost_(sheet, id, data || {})) {
    return { success: false, error: "삭제 권한이 없습니다." };
  }
  var rowIndex = findRowIndexById_(sheet, id);
  if (rowIndex < 0) return { success: false, error: "게시글을 찾을 수 없습니다." };
  sheet.deleteRow(rowIndex);
  return { success: true };
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
    if (action === "update") {
      return jsonResponse(updatePost_(data));
    }
    if (action === "delete") {
      if (!data.id) return jsonResponse({ success: false, error: "ID가 없습니다." });
      // 관리자 또는 수정키로 삭제
      if (isAuthorized_(data.adminToken || "") || String(data.editKey || data.editPassword || "").trim()) {
        return jsonResponse(deletePost_(data.id, data));
      }
      return jsonResponse({ success: false, error: "삭제 권한이 없습니다." });
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
