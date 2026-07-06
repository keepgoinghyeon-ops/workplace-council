/**
 * 회원 가입·로그인 API — Google Sheets
 *
 * [초기 설정]
 * 1. Google 스프레드시트 → Apps Script에 이 코드 붙여넣기
 * 2. setupMembersSheet() 실행
 * 3. 웹 앱 배포 (실행: 나, 액세스: 모든 사용자)
 * 4. URL을 VITE_MEMBERS_API_URL에 설정
 */

var MEMBERS_SHEET = "회원";
var HEADERS = ["ID", "가입일시", "이름", "사번", "소속", "휴대전화", "아이디", "비밀번호해시", "솔트"];

function setupMembersSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(MEMBERS_SHEET);
  if (!sheet) sheet = ss.insertSheet(MEMBERS_SHEET);
  sheet.clear();
  sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
  sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold");
  sheet.setFrozenRows(1);
}

function getMembersSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(MEMBERS_SHEET);
  if (!sheet) {
    setupMembersSheet();
    sheet = ss.getSheetByName(MEMBERS_SHEET);
  }
  return sheet;
}

function hashPassword_(password, salt) {
  var raw = salt + ":" + password;
  var digest = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    raw,
    Utilities.Charset.UTF_8
  );
  return Utilities.base64Encode(digest);
}

function normalizePhone_(phone) {
  return String(phone || "").replace(/[^\d]/g, "");
}

function findMemberByUsername_(username) {
  var sheet = getMembersSheet_();
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][6]).trim() === String(username).trim()) {
      return { row: i + 1, data: data[i] };
    }
  }
  return null;
}

function findMemberByEmployeeId_(employeeId) {
  var sheet = getMembersSheet_();
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][3]).trim() === String(employeeId).trim()) {
      return { row: i + 1, data: data[i] };
    }
  }
  return null;
}

function memberToPublic_(row) {
  return {
    id: String(row[0]),
    createdAt: String(row[1]),
    name: String(row[2]),
    employeeId: String(row[3]),
    affiliation: String(row[4]),
    phone: String(row[5]),
    username: String(row[6]),
  };
}

function registerMember_(data) {
  var name = String(data.name || "").trim();
  var employeeId = String(data.employeeId || "").trim();
  var affiliation = String(data.affiliation || "").trim();
  var phone = normalizePhone_(data.phone);
  var username = String(data.username || "").trim();
  var password = String(data.password || "");

  if (!name) return { success: false, error: "이름을 입력해 주세요." };
  if (!employeeId) return { success: false, error: "다우오피스 사번을 입력해 주세요." };
  if (!affiliation) return { success: false, error: "소속을 입력해 주세요." };
  if (!phone || phone.length < 10) return { success: false, error: "휴대전화번호를 올바르게 입력해 주세요." };
  if (!username || username.length < 4) return { success: false, error: "아이디는 4자 이상 입력해 주세요." };
  if (!/^[a-zA-Z0-9_]+$/.test(username)) return { success: false, error: "아이디는 영문, 숫자, _ 만 사용할 수 있습니다." };
  if (!password || password.length < 6) return { success: false, error: "비밀번호는 6자 이상 입력해 주세요." };

  if (findMemberByUsername_(username)) {
    return { success: false, error: "이미 사용 중인 아이디입니다." };
  }
  if (findMemberByEmployeeId_(employeeId)) {
    return { success: false, error: "이미 가입된 사번입니다." };
  }

  var salt = Utilities.getUuid();
  var hash = hashPassword_(password, salt);
  var id = Utilities.getUuid();
  var now = new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" });

  getMembersSheet_().appendRow([
    id, now, name, employeeId, affiliation, phone, username, hash, salt,
  ]);

  return { success: true, member: { id: id, createdAt: now, name: name, employeeId: employeeId, affiliation: affiliation, phone: phone, username: username } };
}

function loginMember_(data) {
  var username = String(data.username || "").trim();
  var password = String(data.password || "");

  if (!username) return { success: false, error: "아이디를 입력해 주세요." };
  if (!password) return { success: false, error: "비밀번호를 입력해 주세요." };

  var found = findMemberByUsername_(username);
  if (!found) return { success: false, error: "아이디 또는 비밀번호가 올바르지 않습니다." };

  var row = found.data;
  var hash = hashPassword_(password, String(row[8]));
  if (hash !== String(row[7])) {
    return { success: false, error: "아이디 또는 비밀번호가 올바르지 않습니다." };
  }

  return { success: true, member: memberToPublic_(row) };
}

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var action = data.action || "";

    if (action === "register") {
      return jsonResponse(registerMember_(data));
    }
    if (action === "login") {
      return jsonResponse(loginMember_(data));
    }

    return jsonResponse({ success: false, error: "unknown action" });
  } catch (err) {
    return jsonResponse({ success: false, error: String(err) });
  }
}

function doGet(e) {
  return jsonResponse({ success: true, service: "members-api", status: "ok" });
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
