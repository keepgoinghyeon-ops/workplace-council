/** YYYY-MM-DD 유효성 검사 */
export function isValidIsoDate(iso) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return false;
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
}

/** 19800615, 1980-06-15, 1980.06.15 → YYYY-MM-DD */
export function parseFlexibleDate(raw) {
  if (!raw || !String(raw).trim()) return "";
  const text = String(raw).trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(text) && isValidIsoDate(text)) return text;

  const digits = text.replace(/\D/g, "");
  if (digits.length === 8) {
    const iso = `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`;
    if (isValidIsoDate(iso)) return iso;
  }

  return "";
}

/** YYYY-MM-DD → 19800615 표시 */
export function isoToCompact(iso) {
  if (!iso) return "";
  return iso.replace(/-/g, "");
}
