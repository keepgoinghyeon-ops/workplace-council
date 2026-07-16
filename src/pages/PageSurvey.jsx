import { useState } from "react";
import { BEST_CRITERIA, WORST_CATEGORIES } from "../data/surveyQuestions";
import { isSurveySubmitConfigured, submitSurvey } from "../lib/surveyApi";

const emptyForm = () => ({
  submitterName: "",
  submitterPhone: "",
  bestCriteria: [],
  bestManager: "",
  bestReason: "",
  worstItems: [],
  worstManager: "",
  worstReason: "",
  otherOpinion: "",
});

export default function PageSurvey() {
  const [form, setForm] = useState(emptyForm);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const toggleBest = (id) => {
    setForm((prev) => ({
      ...prev,
      bestCriteria: prev.bestCriteria.includes(id)
        ? prev.bestCriteria.filter((v) => v !== id)
        : [...prev.bestCriteria, id],
    }));
  };

  const toggleWorst = (id) => {
    setForm((prev) => ({
      ...prev,
      worstItems: prev.worstItems.includes(id)
        ? prev.worstItems.filter((v) => v !== id)
        : [...prev.worstItems, id],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.submitterName.trim()) {
      setError("성명을 입력해 주세요.");
      return;
    }
    if (!form.submitterPhone.trim()) {
      setError("연락처를 입력해 주세요.");
      return;
    }

    const hasBest = form.bestCriteria.length > 0 || form.bestManager.trim() || form.bestReason.trim();
    const hasWorst = form.worstItems.length > 0 || form.worstManager.trim() || form.worstReason.trim();
    const hasOther = form.otherOpinion.trim();

    if (!hasBest && !hasWorst && !hasOther) {
      setError("베스트·워스트 평가 또는 기타 의견 중 하나 이상 작성해 주세요.");
      return;
    }

    setSubmitting(true);
    try {
      await submitSurvey(form);
      setSubmitted(true);
      setForm(emptyForm());
    } catch (err) {
      setError(err.message || "제출에 실패했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setForm(emptyForm());
    setError("");
  };

  if (submitted) {
    return (
      <>
        <section className="hero">
          <div className="hero-inner">
            <div className="hero-eyebrow">설문</div>
            <h1>제출이 완료되었습니다</h1>
            <p>
              소중한 의견을 보내 주셔서 감사합니다.<br />
              <strong>취합 관리자는 비밀을 유지하며, 설문 내용은 익명으로 처리됩니다.</strong>
            </p>
            <div className="hero-cta-row">
              <button className="btn btn-primary" onClick={handleReset}>
                추가 설문 작성
              </button>
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-eyebrow">고용노동부 베스트·워스트 관리자 선정</div>
          <h1 style={{ fontSize: "clamp(28px, 5vw, 42px)" }}>설문지</h1>
          <p>
            관리자 역량과 리더십에 대한 직원 의견을 수렴하여<br />
            베스트 사례를 공유하고, 워스트 사례를 개선하기 위한 설문입니다.
          </p>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <div className="survey-wrap">
            {!isSurveySubmitConfigured() && (
              <div className="survey-setup-notice">
                ⚠️ 설문 제출 연동 URL이 아직 설정되지 않았습니다. 관리자가 Google Sheets 연동을 완료해야 제출할 수 있습니다.
              </div>
            )}

            <div className="survey-purpose">
              <h3>1. 설문 목적</h3>
              <p>
                본 설문은 고용노동부 직원들의 관리자 역량과 리더십에 대한 의견을 수렴하여
                베스트(Best) 사례를 공유하고, 워스트(Worst) 사례를 파악·개선하기 위한 목적으로 실시합니다.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="survey-form">
              <div className="survey-section">
                <h3>2. 제출자 정보</h3>
                <p className="survey-privacy-notice">
                  중복 설문을 방지하기 위하여 성명, 연락처를 받고 있으며, 취합 관리자는 비밀을 유지하고 익명을 보장합니다.
                </p>
                <div className="form-group">
                  <label className="form-label">성명 <span className="form-required">*</span></label>
                  <input
                    className="form-input"
                    placeholder="실명을 입력해 주세요"
                    value={form.submitterName}
                    onChange={(e) => setForm({ ...form, submitterName: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">연락처 <span className="form-required">*</span></label>
                  <input
                    className="form-input"
                    type="tel"
                    placeholder="예) 010-1234-5678"
                    value={form.submitterPhone}
                    onChange={(e) => setForm({ ...form, submitterPhone: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="survey-section">
                <h3>3. 베스트 관리자 평가</h3>
                <p className="survey-instruction">
                  아래 항목을 기준으로 긍정적으로 평가하는 관리자를 떠올리며 해당 항목을 선택해 주세요.
                </p>
                <div className="survey-criteria-box survey-criteria-box--best">
                  {BEST_CRITERIA.map((c) => (
                    <label key={c.id} className="survey-check-item">
                      <input
                        type="checkbox"
                        checked={form.bestCriteria.includes(c.id)}
                        onChange={() => toggleBest(c.id)}
                      />
                      <span>
                        <strong>{c.label}</strong>: {c.desc}
                      </span>
                    </label>
                  ))}
                </div>
                <div className="form-group">
                  <label className="form-label">☞ 귀하가 생각하는 베스트 관리자 이름/직위</label>
                  <input
                    className="form-input"
                    placeholder="예) ○○지청 ○○과장"
                    value={form.bestManager}
                    onChange={(e) => setForm({ ...form, bestManager: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">☞ 그렇게 생각하는 이유 (간략히)</label>
                  <textarea
                    className="form-textarea"
                    rows={3}
                    placeholder="베스트 관리자로 생각하는 이유를 작성해 주세요."
                    value={form.bestReason}
                    onChange={(e) => setForm({ ...form, bestReason: e.target.value })}
                  />
                </div>
              </div>

              <div className="survey-section">
                <h3>4. 워스트 관리자 평가</h3>
                <p className="survey-instruction">
                  아래 항목을 기준으로 개선이 필요하다고 생각하는 관리자를 떠올리며 해당 항목을 선택해 주세요.
                </p>
                <div className="survey-criteria-box survey-criteria-box--worst">
                  {WORST_CATEGORIES.map((cat) => (
                    <div key={cat.title} className="survey-worst-group">
                      <h4>{cat.title}</h4>
                      {cat.items.map((item) => (
                        <label key={item.id} className="survey-check-item">
                          <input
                            type="checkbox"
                            checked={form.worstItems.includes(item.id)}
                            onChange={() => toggleWorst(item.id)}
                          />
                          <span>{item.label}</span>
                        </label>
                      ))}
                    </div>
                  ))}
                </div>
                <div className="form-group">
                  <label className="form-label">☞ 귀하가 생각하는 워스트 관리자 이름/직위</label>
                  <input
                    className="form-input"
                    placeholder="예) ○○지청 ○○과장"
                    value={form.worstManager}
                    onChange={(e) => setForm({ ...form, worstManager: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">☞ 그렇게 생각하는 이유 (구체적으로)</label>
                  <textarea
                    className="form-textarea"
                    rows={4}
                    placeholder="워스트 관리자로 생각하는 구체적인 이유를 작성해 주세요."
                    value={form.worstReason}
                    onChange={(e) => setForm({ ...form, worstReason: e.target.value })}
                  />
                </div>
              </div>

              <div className="survey-section">
                <h3>5. 기타 의견</h3>
                <p className="survey-instruction">
                  관리자 제도 개선 또는 직장협의회를 위해 바라는 점을 자유롭게 작성해 주세요.
                </p>
                <div className="form-group">
                  <textarea
                    className="form-textarea"
                    rows={5}
                    placeholder="기타 의견을 자유롭게 작성해 주세요."
                    value={form.otherOpinion}
                    onChange={(e) => setForm({ ...form, otherOpinion: e.target.value })}
                  />
                </div>
              </div>

              {error && <p className="survey-error">{error}</p>}

              <div className="survey-submit-wrap">
                <button
                  type="submit"
                  className="btn btn-primary btn-full"
                  disabled={submitting || !isSurveySubmitConfigured()}
                >
                  {submitting ? "제출 중..." : "설문 제출하기"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
