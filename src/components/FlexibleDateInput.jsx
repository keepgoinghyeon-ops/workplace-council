import { useState, useEffect, useRef } from "react";
import { isoToCompact, parseFlexibleDate } from "../lib/dateInput";

export default function FlexibleDateInput({
  value,
  onChange,
  id,
  className = "form-input",
  placeholder = "19800615",
  hint = "숫자 8자리(예: 19800615) 입력 또는 📅 달력 선택",
  style,
  inline = false,
}) {
  const [text, setText] = useState(() => isoToCompact(value));
  const hiddenDateRef = useRef(null);

  useEffect(() => {
    setText(isoToCompact(value));
  }, [value]);

  const emitChange = (iso) => {
    onChange(iso);
  };

  const commitText = (raw) => {
    const iso = parseFlexibleDate(raw);
    if (iso) {
      emitChange(iso);
      setText(isoToCompact(iso));
      return true;
    }
    return false;
  };

  const handleTextChange = (e) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 8);
    setText(digits);
    if (digits.length === 8) {
      commitText(digits);
    } else if (digits.length === 0) {
      emitChange("");
    }
  };

  const handleBlur = () => {
    if (!text) {
      emitChange("");
      return;
    }
    if (!commitText(text)) {
      setText(isoToCompact(value));
    }
  };

  const handleCalendarChange = (e) => {
    const iso = e.target.value;
    emitChange(iso);
    setText(isoToCompact(iso));
  };

  const openCalendar = () => {
    const el = hiddenDateRef.current;
    if (!el) return;
    try {
      if (typeof el.showPicker === "function") {
        el.showPicker();
      } else {
        el.click();
      }
    } catch {
      el.click();
    }
  };

  return (
    <div className={`signup-date-field${inline ? " signup-date-field--inline" : ""}`} style={style}>
      <div className="signup-date-input-wrap">
        <input
          id={id}
          type="text"
          inputMode="numeric"
          enterKeyHint="done"
          className={className}
          value={text}
          onChange={handleTextChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          maxLength={8}
          autoComplete="off"
          aria-label="날짜 숫자 입력"
        />
        <button
          type="button"
          className="signup-date-cal-btn"
          onClick={openCalendar}
          aria-label="달력에서 날짜 선택"
        >
          📅
        </button>
        <input
          ref={hiddenDateRef}
          type="date"
          className="signup-date-hidden"
          value={value || ""}
          onChange={handleCalendarChange}
          tabIndex={-1}
          aria-hidden="true"
        />
      </div>
      {hint && <p className="signup-date-hint">{hint}</p>}
    </div>
  );
}
