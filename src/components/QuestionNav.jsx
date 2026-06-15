import './QuestionNav.css';

export default function QuestionNav({
  questions,
  currentIndex,
  userAnswers,
  markedQuestions,
  onJump,
  onClose,
}) {
  const getStatus = (q) => {
    if (markedQuestions.has(q.id)) return 'marked';
    if (userAnswers[q.id]) return 'answered';
    return 'unanswered';
  };

  const answered = questions.filter(q => userAnswers[q.id]).length;
  const marked = questions.filter(q => markedQuestions.has(q.id)).length;
  const unanswered = questions.length - answered;

  return (
    <div className="q-nav">
      {/* Legend */}
      <div className="q-nav-legend">
        <div className="q-nav-legend-item">
          <span className="q-nav-legend-dot answered" />
          <span>Đã làm ({answered})</span>
        </div>
        <div className="q-nav-legend-item">
          <span className="q-nav-legend-dot unanswered" />
          <span>Chưa làm ({unanswered})</span>
        </div>
        <div className="q-nav-legend-item">
          <span className="q-nav-legend-dot marked" />
          <span>Đánh dấu ({marked})</span>
        </div>
      </div>

      {/* Grid */}
      <div className="q-nav-grid">
        {questions.map((q, idx) => {
          const status = getStatus(q);
          const isCurrent = idx === currentIndex;
          return (
            <button
              key={q.id}
              className={`q-nav-btn ${status} ${isCurrent ? 'current' : ''}`}
              onClick={() => { onJump(idx); onClose?.(); }}
              title={`Câu ${q.id}${markedQuestions.has(q.id) ? ' ★' : ''}`}
              aria-label={`Nhảy tới câu ${q.id}`}
            >
              {q.id}
            </button>
          );
        })}
      </div>
    </div>
  );
}
