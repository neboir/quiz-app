import './QuestionCard.css';

export default function QuestionCard({
  question,
  questionIndex,
  totalQuestions,
  selectedAnswer,
  onSelect,
  isMarked,
  onToggleMark,
}) {
  const optionKeys = Object.keys(question.options).sort();

  return (
    <div className="question-card animate-fade-in">
      {/* Question header */}
      <div className="question-header">
        <div className="question-meta">
          <span className="badge badge-primary">Câu {question.id}</span>
          <span className="question-counter text-muted text-sm">
            {questionIndex + 1} / {totalQuestions}
          </span>
        </div>
        <button
          className={`mark-btn ${isMarked ? 'marked' : ''}`}
          onClick={onToggleMark}
          aria-label={isMarked ? 'Bỏ đánh dấu câu này' : 'Đánh dấu câu này'}
          title={isMarked ? 'Bỏ đánh dấu' : 'Đánh dấu câu này'}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill={isMarked ? 'currentColor' : 'none'}>
            <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {isMarked ? 'Đã đánh dấu' : 'Đánh dấu'}
        </button>
      </div>

      {/* Question text */}
      <div className="question-text">
        <p>{question.question}</p>
      </div>

      {/* Options */}
      <div className="question-options">
        {optionKeys.map(key => (
          <label
            key={key}
            className={`option-item ${selectedAnswer === key ? 'selected' : ''}`}
            htmlFor={`option-${question.id}-${key}`}
          >
            <input
              type="radio"
              id={`option-${question.id}-${key}`}
              name={`question-${question.id}`}
              value={key}
              checked={selectedAnswer === key}
              onChange={() => onSelect(key)}
              style={{ display: 'none' }}
            />
            <span className="option-letter">{key}</span>
            <span className="option-text">{question.options[key]}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
