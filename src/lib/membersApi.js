const API_URL = import.meta.env.VITE_MEMBERS_API_URL?.trim();
const LOCAL_KEY = "wc-members";
const SESSION_KEY = "wc-member-session";

function normalizeApiResult(result) {
  if (!result || typeof result !== "object") return { success: false, error: "" };
  return {
    success: Boolean(result.success ?? result.성공),
    member: result.member ?? result.회원,
    error: result.error ?? result.오류 ?? result.에러 ?? "",
  };
}

function normalizeNetworkError(err) {
  if (!err || err.message === "Failed to fetch" || err.name === "TypeError") {
    return new Error(
      "회원 서버에 연결할 수 없습니다. Google Apps Script URL과 '모든 사용자' 공개 설정을 확인해 주세요."
    );
  }
  return err;
}

async function hashPassword(password, salt) {
  const raw = `${salt}:${password}`;
  const encoded = new TextEncoder().encode(raw);
  const digest = await crypto.subtle.digest("SHA-256", encoded);
  const bytes = Array.from(new Uint8Array(digest));
  return btoa(String.fromCharCode(...bytes));
}

function readLocalMembers() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]");
  } catch {
    return [];
  }
}

function writeLocalMembers(members) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(members));
}

async function apiRequest(payload) {
  if (!API_URL) throw new Error("회원 API URL이 설정되지 않았습니다.");

  let response;
  try {
    response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    throw normalizeNetworkError(err);
  }

  let result;
  try {
    result = await response.json();
  } catch {
    throw new Error("서버 응답을 확인할 수 없습니다.");
  }

  const normalized = normalizeApiResult(result);
  if (!response.ok || !normalized.success) {
    throw new Error(normalized.error || "요청에 실패했습니다.");
  }
  return normalized;
}

export function isMembersApiConfigured() {
  return Boolean(API_URL);
}

export function getMemberSession() {
  try {
    return JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null");
  } catch {
    return null;
  }
}

export function setMemberSession(member) {
  if (member) sessionStorage.setItem(SESSION_KEY, JSON.stringify(member));
  else sessionStorage.removeItem(SESSION_KEY);
}

export function isMemberLoggedIn() {
  return Boolean(getMemberSession());
}

export function logoutMember() {
  setMemberSession(null);
}

function normalizePhone(phone) {
  return String(phone || "").replace(/[^\d]/g, "");
}

function validateSignup(data) {
  if (!data.name?.trim()) return "이름을 입력해 주세요.";
  if (!data.employeeId?.trim()) return "다우오피스 사번을 입력해 주세요.";
  if (!data.affiliation?.trim()) return "소속을 입력해 주세요.";
  const phone = normalizePhone(data.phone);
  if (!phone || phone.length < 10) return "휴대전화번호를 올바르게 입력해 주세요.";
  const username = data.username?.trim();
  if (!username || username.length < 4) return "아이디는 4자 이상 입력해 주세요.";
  if (!/^[a-zA-Z0-9_]+$/.test(username)) return "아이디는 영문, 숫자, _ 만 사용할 수 있습니다.";
  if (!data.password || data.password.length < 6) return "비밀번호는 6자 이상 입력해 주세요.";
  if (data.password !== data.passwordConfirm) return "비밀번호 확인이 일치하지 않습니다.";
  return "";
}

export async function registerMember(data) {
  const validationError = validateSignup(data);
  if (validationError) throw new Error(validationError);

  const payload = {
    action: "register",
    name: data.name.trim(),
    employeeId: data.employeeId.trim(),
    affiliation: data.affiliation.trim(),
    phone: normalizePhone(data.phone),
    username: data.username.trim(),
    password: data.password,
  };

  if (API_URL) {
    const result = await apiRequest(payload);
    setMemberSession(result.member);
    return result.member;
  }

  const members = readLocalMembers();
  if (members.some((m) => m.username === payload.username)) {
    throw new Error("이미 사용 중인 아이디입니다.");
  }
  if (members.some((m) => m.employeeId === payload.employeeId)) {
    throw new Error("이미 가입된 사번입니다.");
  }

  const salt = crypto.randomUUID();
  const passwordHash = await hashPassword(payload.password, salt);
  const member = {
    id: crypto.randomUUID(),
    createdAt: new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" }),
    name: payload.name,
    employeeId: payload.employeeId,
    affiliation: payload.affiliation,
    phone: payload.phone,
    username: payload.username,
    passwordHash,
    salt,
  };

  writeLocalMembers([...members, member]);
  const session = { ...member };
  delete session.passwordHash;
  delete session.salt;
  setMemberSession(session);
  return session;
}

export async function loginMember(username, password) {
  const trimmedUsername = String(username || "").trim();
  if (!trimmedUsername) throw new Error("아이디를 입력해 주세요.");
  if (!password) throw new Error("비밀번호를 입력해 주세요.");

  if (API_URL) {
    const result = await apiRequest({
      action: "login",
      username: trimmedUsername,
      password,
    });
    setMemberSession(result.member);
    return result.member;
  }

  const members = readLocalMembers();
  const found = members.find((m) => m.username === trimmedUsername);
  if (!found) throw new Error("아이디 또는 비밀번호가 올바르지 않습니다.");

  const hash = await hashPassword(password, found.salt);
  if (hash !== found.passwordHash) {
    throw new Error("아이디 또는 비밀번호가 올바르지 않습니다.");
  }

  const session = { ...found };
  delete session.passwordHash;
  delete session.salt;
  setMemberSession(session);
  return session;
}
