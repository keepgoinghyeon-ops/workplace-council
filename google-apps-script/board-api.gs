/**
 * Board API - Google Sheets + Google Drive
 *
 * Setup:
 * 1. Paste this entire file into Apps Script (Code.gs)
 * 2. Script property: BOARD_ADMIN_TOKEN = admin password
 * 3. Run migrateBoardSheet() and allow permissions
 * 4. Run setupDriveFolder() and allow Drive access
 * 5. Deploy > New deployment > Web app > Anyone
 * 6. Use the /exec URL as VITE_BOARD_API_URL
 *
 * API_VERSION 4: 사진 표시는 Drive 공개 URL 대신 action=file 프록시 사용
 */

var BOARD_SHEET = "자유게시판";
var DRIVE_FOLDER_NAME = "직협_자유게시판_첨부파일";
var HEADERS = ["ID", "작성일시", "지청명", "제목", "내용", "비공개", "첨부파일JSON", "수정키"];
var API_VERSION = 4;
var TITLE_MARK = "【제목】";
var BODY_MARK = "\n\n【본문】\n";

function decodeBoardBody_(raw) {
  var text = String(raw || "");
  if (text.indexOf(TITLE_MARK) !== 0) {
    return { title: "", content: text };
  }
  var rest = text.substring(TITLE_MARK.length);
  var idx = rest.indexOf(BODY_MARK);
  if (idx < 0) return { title: trim_(rest), content: "" };
  return {
    title: trim_(rest.substring(0, idx)),
    content: rest.substring(idx + BODY_MARK.length),
  };
}

function trim_(value) {
  return String(value || "").replace(/^\s+|\s+$/g, "");
}

function resolveTitleContent_(data) {
  var title = trim_(data.title || data["제목"] || "");
  var content = String(data.content || data["내용"] || "");
  var decoded = decodeBoardBody_(content);
  if (decoded.title) {
    if (!title) title = decoded.title;
    content = decoded.content;
  }
  return { title: title, content: trim_(content) };
}

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
  ensureBoardSchema_(getBoardSheetRaw_());
}

function setupDriveFolder() {
  getDriveFolder_();
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

/** 읽기 전용 — 시트 재구성/마이그레이션을 하지 않습니다. */
function getBoardSheetRead_() {
  return getBoardSheetRaw_();
}

/** 쓰기용 — 필요할 때만 스키마를 맞춥니다. */
function getBoardSheetWrite_() {
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
    map[trim_(headers[i])] = i;
  }
  return map;
}

function isExactNewSchema_(headers) {
  if (!headers || headers.length < HEADERS.length) return false;
  for (var i = 0; i < HEADERS.length; i++) {
    if (trim_(headers[i]) !== HEADERS[i]) return false;
  }
  return true;
}

function ensureBoardSchema_(sheet) {
  var lastCol = Math.max(sheet.getLastColumn(), 1);
  var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0].map(function (h) {
    return trim_(h);
  });
  if (isExactNewSchema_(headers)) return;

  var data = sheet.getDataRange().getValues();
  var map = headerIndexMap_(headers);
  var newData = [HEADERS];

  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    if (!row[0]) continue;

    var id = map["ID"] !== undefined ? row[map["ID"]] : row[0];
    var createdAt = map["작성일시"] !== undefined ? row[map["작성일시"]] : row[1];
    var office = map["지청명"] !== undefined ? row[map["지청명"]] : row[2];
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

function getAdminToken_() {
  return PropertiesService.getScriptProperties().getProperty("BOARD_ADMIN_TOKEN");
}

function isAuthorized_(token) {
  var expected = getAdminToken_();
  return expected && trim_(token) === trim_(expected);
}

function checkAuth_(token) {
  var expected = getAdminToken_();
  if (!expected) {
    return { ok: false, error: "BOARD_ADMIN_TOKEN 스크립트 속성이 설정되지 않았습니다." };
  }
  if (trim_(token) !== trim_(expected)) {
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
  // uc?export=view 는 '파일 없음'이 자주 나므로 thumbnail 사용
  return "https://drive.google.com/thumbnail?id=" + fileId + "&sz=w1600";
}

function viewUrl_(fileId) {
  return fileId ? "https://drive.google.com/file/d/" + fileId + "/view" : "";
}

function previewUrl_(fileId) {
  return fileId ? "https://drive.google.com/file/d/" + fileId + "/preview" : "";
}

function normalizeSavedFile_(f) {
  var mime = guessMime_(f.name, f.mimeType);
  var id = f.id || extractDriveId_(f.url || f.driveUrl || "");
  var isVideo = String(mime).indexOf("video/") === 0;
  return {
    name: f.name || "",
    mimeType: mime,
    id: id,
    url: f.url || mediaUrl_(id, mime),
    thumbUrl: f.thumbUrl || (id && !isVideo ? "https://drive.google.com/thumbnail?id=" + id + "&sz=w1600" : ""),
    previewUrl: f.previewUrl || previewUrl_(id),
    driveUrl: f.driveUrl || viewUrl_(id),
  };
}

function extractDriveId_(url) {
  var s = String(url || "");
  var m = s.match(/\/d\/([^/]+)/) || s.match(/[?&]id=([^&]+)/);
  return m ? m[1] : "";
}

function sharePublic_(file) {
  try {
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  } catch (e1) {
    try {
      file.setSharing(DriveApp.Access.ANYONE, DriveApp.Permission.VIEW);
    } catch (e2) {
      // Workspace 정책으로 공개 공유가 막혀 있어도
      // action=file 프록시로 사진은 표시 가능
    }
  }
}

function isInBoardFolder_(file) {
  try {
    var folder = getDriveFolder_();
    var parents = file.getParents();
    while (parents.hasNext()) {
      if (parents.next().getId() === folder.getId()) return true;
    }
  } catch (e) {}
  return false;
}

/** Drive 공개 URL 대신 웹앱이 파일을 직접 내려줌 (사진 표시용) */
function serveFile_(id) {
  if (!id) return fail_("파일 ID가 없습니다.");
  try {
    var file = DriveApp.getFileById(id);
    if (!isInBoardFolder_(file)) {
      return fail_("허용되지 않은 파일입니다.");
    }
    var blob = file.getBlob();
    var bytes = blob.getBytes();
    // Apps Script 응답 한도 고려 (약 4MB)
    if (bytes.length > 4 * 1024 * 1024) {
      return fail_("파일이 커서 미리보기를 지원하지 않습니다.");
    }
    return ok_({
      mimeType: blob.getContentType() || "application/octet-stream",
      data: Utilities.base64Encode(bytes),
      name: file.getName(),
      size: bytes.length,
    });
  } catch (err) {
    return fail_("파일을 불러오지 못했습니다: " + String(err));
  }
}

function saveFiles_(files) {
  if (!files || !files.length) return [];
  var folder = getDriveFolder_();
  var saved = [];

  files.forEach(function (f, idx) {
    if (!f || !f.data || !f.name) {
      throw new Error((idx + 1) + "번째 첨부파일 데이터가 비어 있습니다.");
    }
    var mime = guessMime_(f.name, f.mimeType);
    var decoded;
    try {
      decoded = Utilities.base64Decode(f.data);
    } catch (decodeErr) {
      throw new Error('"' + f.name + '" 디코딩에 실패했습니다.');
    }
    if (!decoded || !decoded.length) {
      throw new Error('"' + f.name + '" 내용이 비어 있습니다.');
    }
    var blob = Utilities.newBlob(decoded, mime, f.name);
    var file = folder.createFile(blob);
    sharePublic_(file);
    Utilities.sleep(200);
    var id = file.getId();
    var isVideo = String(mime).indexOf("video/") === 0;
    saved.push({
      name: f.name,
      mimeType: mime,
      id: id,
      // 사진은 프론트가 action=file 프록시로 불러옴
      url: isVideo ? previewUrl_(id) : "",
      thumbUrl: "",
      previewUrl: previewUrl_(id),
      driveUrl: viewUrl_(id),
      viaProxy: !isVideo,
    });
  });

  if (!saved.length) {
    throw new Error("첨부파일이 하나도 저장되지 않았습니다.");
  }
  return saved;
}

function cell_(row, map, key, fallbackIndex) {
  if (map[key] !== undefined) return row[map[key]];
  if (fallbackIndex !== undefined && fallbackIndex >= 0) return row[fallbackIndex];
  return "";
}

function getPosts_(includePrivate) {
  var sheet = getBoardSheetRead_();
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];

  var headers = data[0].map(function (h) { return trim_(h); });
  var map = headerIndexMap_(headers);
  var list = [];

  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    if (!row[0]) continue;

    var privateRaw = cell_(row, map, "비공개", headers[3] === "내용" ? 4 : 5);
    var isPrivate = parsePrivateFlag_(privateRaw);
    if (!includePrivate && isPrivate) continue;

    var title = "";
    var content = "";
    var filesRaw = "[]";
    var editKey = "";

    if (map["제목"] !== undefined && map["내용"] !== undefined) {
      title = String(cell_(row, map, "제목", -1) || "");
      content = String(cell_(row, map, "내용", -1) || "");
      filesRaw = cell_(row, map, "첨부파일JSON", -1) || "[]";
      editKey = String(cell_(row, map, "수정키", -1) || "");
    } else if (headers[3] === "내용") {
      // 구버전: ID, 작성일시, 지청명, 내용, 비공개
      content = String(row[3] || "");
      title = "";
    } else {
      title = String(row[3] || "");
      content = String(row[4] || "");
      filesRaw = row[6] || "[]";
      editKey = String(row[7] || "");
    }

    var decoded = decodeBoardBody_(content);
    if (decoded.title) {
      if (!trim_(title)) title = decoded.title;
      content = decoded.content;
    }

    var files = parseFiles_(filesRaw).map(function (f) {
      return normalizeSavedFile_(f);
    });

    list.push({
      id: String(cell_(row, map, "ID", 0)),
      createdAt: String(cell_(row, map, "작성일시", 1)),
      office: String(cell_(row, map, "지청명", 2) || ""),
      title: trim_(title),
      content: content,
      isPrivate: isPrivate,
      files: files,
      hasEditKey: Boolean(trim_(editKey)),
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
      return String(map["수정키"] !== undefined ? data[i][map["수정키"]] : "");
    }
  }
  return "";
}

function createPost_(data) {
  var office = trim_(data.office || "");
  var resolved = resolveTitleContent_(data);
  var title = resolved.title;
  var content = resolved.content;
  var editKey = trim_(data.editKey || data.editPassword || "");

  if (!office) return fail_("지청명을 입력해 주세요.");
  if (!title) return fail_("제목을 입력해 주세요.");
  if (!content) return fail_("내용을 입력해 주세요.");
  if (editKey.length < 4) return fail_("수정용 비밀번호를 4자 이상 입력해 주세요.");

  var filesInput = data.files || [];
  if (filesInput.length > 5) return fail_("첨부파일은 최대 5개까지 가능합니다.");

  var id = Utilities.getUuid();
  var now = new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" });
  var isPrivate = parsePrivateFlag_(data.isPrivate);
  var files = [];

  if (filesInput.length) {
    try {
      files = saveFiles_(filesInput);
    } catch (fileErr) {
      return fail_(
        "첨부파일 저장에 실패했습니다. Apps Script에서 setupDriveFolder()를 실행하고 Drive 권한을 허용한 뒤, 웹 앱을 새 버전으로 재배포해 주세요. (" +
          String(fileErr) + ")"
      );
    }
  }

  getBoardSheetWrite_().appendRow([
    id,
    now,
    office,
    title,
    content,
    isPrivate ? "Y" : "",
    JSON.stringify(files),
    editKey,
  ]);

  return ok_({
    post: {
      id: id,
      createdAt: now,
      office: office,
      title: title,
      content: content,
      isPrivate: isPrivate,
      files: files,
      hasEditKey: true,
    },
  });
}

function canEditPost_(sheet, id, data) {
  if (isAuthorized_(data.adminToken || "")) return true;
  var key = trim_(data.editKey || data.editPassword || "");
  if (!key) return false;
  return key === getEditKeyById_(sheet, id);
}

function updatePost_(data) {
  var id = data.id;
  if (!id) return fail_("ID가 없습니다.");

  var sheet = getBoardSheetWrite_();
  if (!canEditPost_(sheet, id, data)) {
    return fail_("수정 권한이 없습니다. 수정용 비밀번호를 확인해 주세요.");
  }

  var rowIndex = findRowIndexById_(sheet, id);
  if (rowIndex < 0) return fail_("게시글을 찾을 수 없습니다.");

  var dataRange = sheet.getDataRange().getValues();
  var map = headerIndexMap_(dataRange[0].map(String));
  var row = dataRange[rowIndex - 1];

  var office = data.office !== undefined ? trim_(data.office) : String(row[map["지청명"]] || "");
  var title = data.title !== undefined ? trim_(data.title) : String(row[map["제목"]] || "");
  var content = data.content !== undefined ? String(data.content) : String(row[map["내용"]] || "");
  if (data.title !== undefined || data.content !== undefined) {
    var resolvedUp = resolveTitleContent_({ title: title, content: content });
    title = resolvedUp.title;
    content = resolvedUp.content;
  }
  var isPrivate = data.isPrivate !== undefined
    ? parsePrivateFlag_(data.isPrivate)
    : parsePrivateFlag_(row[map["비공개"]]);
  var files = parseFiles_(row[map["첨부파일JSON"]]).map(normalizeSavedFile_);
  var editKey = String(row[map["수정키"]] || "");

  if (!office) return fail_("지청명을 입력해 주세요.");
  if (!title) return fail_("제목을 입력해 주세요.");
  if (!content) return fail_("내용을 입력해 주세요.");

  if (data.files && data.files.length) {
    if (data.files.length > 5) return fail_("첨부파일은 최대 5개까지 가능합니다.");
    try {
      files = saveFiles_(data.files);
    } catch (fileErr) {
      return fail_("첨부파일 저장에 실패했습니다. (" + String(fileErr) + ")");
    }
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

  return ok_({
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
  });
}

function deletePost_(id, data) {
  var sheet = getBoardSheetWrite_();
  if (!canEditPost_(sheet, id, data || {})) {
    return fail_("삭제 권한이 없습니다.");
  }
  var rowIndex = findRowIndexById_(sheet, id);
  if (rowIndex < 0) return fail_("게시글을 찾을 수 없습니다.");
  sheet.deleteRow(rowIndex);
  return ok_({});
}

function ok_(extra) {
  var out = { success: true, apiVersion: API_VERSION };
  if (extra) {
    for (var k in extra) {
      if (Object.prototype.hasOwnProperty.call(extra, k)) out[k] = extra[k];
    }
  }
  return out;
}

function fail_(message) {
  return { success: false, error: message, apiVersion: API_VERSION };
}

function doGet(e) {
  try {
    var action = (e && e.parameter && e.parameter.action) || "list";
    if (action === "status") {
      return jsonResponse(ok_({ service: "board-api", status: "ok" }));
    }
    if (action === "file") {
      return jsonResponse(serveFile_((e.parameter && e.parameter.id) || ""));
    }
    if (action === "list") {
      var adminToken = (e.parameter && e.parameter.adminToken) || "";
      var includePrivate = isAuthorized_(adminToken);
      return jsonResponse(ok_({ posts: getPosts_(includePrivate) }));
    }
    if (action === "auth") {
      var auth = checkAuth_((e.parameter && e.parameter.adminToken) || "");
      return jsonResponse({
        success: auth.ok,
        error: auth.error || "",
        apiVersion: API_VERSION,
      });
    }
    return jsonResponse(fail_("unknown action"));
  } catch (err) {
    return jsonResponse(fail_(String(err)));
  }
}

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return jsonResponse(fail_("요청 본문이 없습니다. 웹 앱 URL(/exec)과 배포 설정을 확인해 주세요."));
    }

    var data = JSON.parse(e.postData.contents);
    var action = data.action || "";

    if (action === "submit") {
      return jsonResponse(createPost_(data));
    }
    if (action === "update") {
      return jsonResponse(updatePost_(data));
    }
    if (action === "delete") {
      if (!data.id) return jsonResponse(fail_("ID가 없습니다."));
      if (isAuthorized_(data.adminToken || "") || trim_(data.editKey || data.editPassword || "")) {
        return jsonResponse(deletePost_(data.id, data));
      }
      return jsonResponse(fail_("삭제 권한이 없습니다."));
    }

    return jsonResponse(fail_("unknown action"));
  } catch (err) {
    return jsonResponse(fail_(String(err)));
  }
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
