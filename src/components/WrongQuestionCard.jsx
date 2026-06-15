import './WrongQuestionCard.css';

export default function WrongQuestionCard({ item, index }) {
  const optionKeys = Object.keys(item.options || {}).sort();

  return (
    <div className="wrong-card animate-fade-in">
      <div className="wrong-card-header">
        <div className="flex items-center gap-3">
          <span className={`badge ${item.status === 'blank' ? 'badge-muted' : 'badge-danger'}`}>
            Câu {item.id}
          </span>
          <span className={`wrong-status-tag ${item.status}`}>
            {item.status === 'blank' ? '📭 Bỏ trống' : '✗ Sai'}
          </span>
        </div>
        <span className="text-xs text-muted">#{index + 1}</span>
      </div>

      {/* Question text */}
      <div className="wrong-card-question">
        <p>{item.question}</p>
      </div>

      {/* Options (read-only display) */}
      <div className="wrong-card-options">
        {optionKeys.map(key => {
          const isUser = item.userAnswer === key;
          const isCorrect = item.correctAnswer === key;
          let className = 'wrong-option';
          if (isCorrect) className += ' correct';
          else if (isUser && !isCorrect) className += ' wrong';

          return (
            <div key={key} className={className}>
              <span className="wrong-option-letter">{key}</span>
              <span className="wrong-option-text">{item.options[key]}</span>
              {isUser && !isCorrect && (
                <span className="wrong-option-tag wrong-tag">Bạn chọn</span>
              )}
              {isCorrect && (
                <span className="wrong-option-tag correct-tag">Đúng</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Answer summary */}
      <div className="wrong-card-summary">
        {item.userAnswer ? (
          <div className="wrong-summary-row">
            <span className="wrong-summary-label">Bạn chọn:</span>
            <span className="wrong-summary-val user">{item.userAnswer} — {item.options[item.userAnswer]}</span>
          </div>
        ) : (
          <div className="wrong-summary-row">
            <span className="wrong-summary-label">Bạn chọn:</span>
            <span className="wrong-summary-val blank">Bỏ trống</span>
          </div>
        )}
        <div className="wrong-summary-row">
          <span className="wrong-summary-label">Đáp án đúng:</span>
          <span className="wrong-summary-val correct-answer">
            {item.correctAnswer}
            {item.options[item.correctAnswer] ? ` — ${item.options[item.correctAnswer]}` : ''}
          </span>
        </div>
      </div>

      {/* Explanation */}
      {item.explanation && (
        <div className="wrong-card-explanation">
          <div className="explanation-header">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
              <path d="M12 16v-4M12 8h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Lời giải chi tiết
          </div>
          <p className="explanation-text">{item.explanation}</p>
        </div>
      )}
    </div>
  );
}
