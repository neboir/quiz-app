import { useState } from 'react';
import ResultChart from '../components/ResultChart';
import WrongQuestionCard from '../components/WrongQuestionCard';
import { formatDuration } from '../utils/scorer';
import { exportToPDF, exportToExcel } from '../utils/exporter';
import { storage } from '../utils/storage';
import './ResultPage.css';

export default function ResultPage({ result, examTitle, examConfig, onHome, onRetryWrong }) {
  const [tab, setTab] = useState('overview'); // 'overview' | 'wrong'
  const [exporting, setExporting] = useState(null);

  const scoreColor =
    result.percentage >= 80
      ? 'var(--color-correct)'
      : result.percentage >= 50
      ? 'var(--accent-warning)'
      : 'var(--color-wrong)';

  const handleExportPDF = async () => {
    setExporting('pdf');
    try { await exportToPDF(result, examTitle); } finally { setExporting(null); }
  };

  const handleExportExcel = () => {
    setExporting('excel');
    try { exportToExcel(result, examTitle); } finally { setExporting(null); }
  };

  const handleRetryWrong = () => {
    const wrongBank = result.wrongAndBlank.map(q => ({
      id: q.id,
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
    }));
    onRetryWrong(wrongBank);
  };

  return (
    <div className="result-page">
      <div className="result-content">

        {/* Score hero */}
        <div className="result-hero card card-elevated animate-fade-in">
          <div className="result-hero-left">
            <div className="result-score-circle" style={{ '--score-color': scoreColor }}>
              <div className="result-score-inner">
                <span className="result-score-num">{result.score10}</span>
                <span className="result-score-denom">/10</span>
              </div>
            </div>
            <div className="result-meta">
              <h1 className="result-exam-title">{examTitle}</h1>
              <div className="result-badges">
                <span className="badge badge-primary">{result.percentage}% chính xác</span>
                <span className="badge badge-muted">⏱ {formatDuration(result.timeUsed)}</span>
              </div>
              <div className="result-stats-row">
                <div className="result-stat-item correct">
                  <span className="result-stat-num">{result.correct}</span>
                  <span className="result-stat-label">Câu đúng</span>
                </div>
                <div className="result-stat-item wrong">
                  <span className="result-stat-num">{result.wrong}</span>
                  <span className="result-stat-label">Câu sai</span>
                </div>
                <div className="result-stat-item blank">
                  <span className="result-stat-num">{result.blank}</span>
                  <span className="result-stat-label">Bỏ trống</span>
                </div>
                <div className="result-stat-item">
                  <span className="result-stat-num">{result.total}</span>
                  <span className="result-stat-label">Tổng câu</span>
                </div>
              </div>
            </div>
          </div>

          <div className="result-hero-chart">
            <ResultChart
              correct={result.correct}
              wrong={result.wrong}
              blank={result.blank}
            />
          </div>
        </div>

        {/* Action buttons */}
        <div className="result-actions animate-fade-in">
          <button className="btn btn-primary" onClick={onHome} id="btn-home">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M3 12L12 3l9 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 21V12h6v9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Về trang chủ
          </button>

          {result.wrongAndBlank.length > 0 && (
            <button className="btn btn-secondary" onClick={handleRetryWrong} id="btn-retry-wrong">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M1 4v6h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3.51 15a9 9 0 1 0 .49-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Ôn Tập Câu Sai ({result.wrongAndBlank.length} câu)
            </button>
          )}

          <button
            className="btn btn-ghost"
            onClick={handleExportPDF}
            disabled={exporting === 'pdf'}
            id="btn-export-pdf"
          >
            {exporting === 'pdf' ? (
              <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2"/>
                <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            )}
            Xuất PDF
          </button>

          <button
            className="btn btn-ghost"
            onClick={handleExportExcel}
            disabled={exporting === 'excel'}
            id="btn-export-excel"
          >
            {exporting === 'excel' ? (
              <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
                <path d="M3 9h18M3 15h18M9 3v18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            )}
            Xuất Excel
          </button>
        </div>

        {/* Wrong questions section */}
        {result.wrongAndBlank.length > 0 && (
          <div className="result-wrong-section animate-fade-in">
            <div className="result-section-header">
              <h2>
                <span className="result-section-icon">🔍</span>
                Các Câu Cần Xem Lại
                <span className="badge badge-danger">{result.wrongAndBlank.length} câu</span>
              </h2>
              <p className="text-sm text-secondary">
                Chỉ hiển thị câu làm sai và bỏ trống. Các câu đúng được ẩn để bảo mật đề thi.
              </p>
            </div>

            <div className="wrong-list">
              {result.wrongAndBlank.map((item, idx) => (
                <WrongQuestionCard key={item.id} item={item} index={idx} />
              ))}
            </div>
          </div>
        )}

        {result.wrongAndBlank.length === 0 && (
          <div className="result-perfect card animate-fade-in">
            <div className="result-perfect-icon">🏆</div>
            <h2>Xuất sắc! Tất cả đều đúng!</h2>
            <p>Bạn đã trả lời đúng tất cả {result.total} câu hỏi.</p>
          </div>
        )}
      </div>
    </div>
  );
}
