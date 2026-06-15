import { useState, useCallback } from 'react';
import UploadZone from '../components/UploadZone';
import { extractTextFromPDF, extractPDFData } from '../utils/pdfParser';
import { parseQuestions } from '../utils/questionParser';
import { parseAnswers } from '../utils/answerParser';
import { mergeData, validateBank } from '../utils/dataMerger';
import { shuffleQuiz } from '../utils/shuffler';
import './HomePage.css';

const STEP = { UPLOAD: 'upload', ANALYZING: 'analyzing', READY: 'ready', ERROR: 'error' };

export default function HomePage({ onStartExam }) {
  const [questionFile, setQuestionFile] = useState(null);
  const [answerFile, setAnswerFile] = useState(null);
  const [step, setStep] = useState(STEP.UPLOAD);
  const [parseResult, setParseResult] = useState(null);
  const [warnings, setWarnings] = useState([]);
  const [errors, setErrors] = useState([]);

  // Exam config
  const [examTitle, setExamTitle] = useState('');
  const [examDuration, setExamDuration] = useState(60);
  const [shuffleQuestions, setShuffleQuestions] = useState(false);
  const [shuffleOptions, setShuffleOptions] = useState(false);

  const handleAnalyze = useCallback(async () => {
    if (!questionFile || !answerFile) return;
    setStep(STEP.ANALYZING);
    setWarnings([]);
    setErrors([]);

    try {
      const [qText, aPdfData] = await Promise.all([
        extractTextFromPDF(questionFile),
        extractPDFData(answerFile),
      ]);

      const { questions, warnings: qWarnings } = parseQuestions(qText);
      const { answers, warnings: aWarnings } = parseAnswers(aPdfData);
      const { bank, warnings: mWarnings } = mergeData(questions, answers);
      const validationErrors = validateBank(bank);

      const allWarnings = [...qWarnings, ...aWarnings, ...mWarnings];

      setParseResult({ bank, rawQCount: questions.length, rawACount: answers.size });
      setWarnings(allWarnings);
      setErrors(validationErrors);

      if (bank.length > 0) {
        setStep(STEP.READY);
      } else {
        setStep(STEP.ERROR);
        setErrors(prev => ['Không tìm thấy câu hỏi hợp lệ. Vui lòng kiểm tra định dạng PDF.', ...prev]);
      }
    } catch (err) {
      console.error(err);
      setStep(STEP.ERROR);
      setErrors([`Lỗi đọc PDF: ${err.message}`]);
    }
  }, [questionFile, answerFile]);

  const handleStartExam = () => {
    if (!parseResult?.bank?.length) return;
    const quiz = shuffleQuiz(parseResult.bank, { shuffleQuestions, shuffleOptions });
    onStartExam({
      questions: quiz,
      examTitle: examTitle || questionFile?.name?.replace('.pdf', '') || 'Đề thi',
      durationSeconds: Math.max(1, examDuration) * 60,
    });
  };

  const canAnalyze = questionFile && answerFile;

  return (
    <div className="home-page">
      <div className="home-hero">
        <div className="home-hero-bg" />
        <div className="home-hero-content">
          <div className="home-hero-badge">
            <span>🎓</span> Nền tảng luyện thi trực tuyến
          </div>
          <h1 className="home-hero-title">
            Thi Trắc Nghiệm
            <span className="gradient-text"> Thông Minh</span>
          </h1>
          <p className="home-hero-desc">
            Tải lên PDF đề thi và đáp án — hệ thống tự động phân tích, tạo ngân hàng câu hỏi và bắt đầu thi ngay lập tức.
          </p>
        </div>
      </div>

      <div className="home-content">
        {/* Upload Section */}
        <section className="home-section card card-elevated animate-fade-in">
          <div className="section-title">
            <div className="section-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <polyline points="17,8 12,3 7,8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="12" y1="3" x2="12" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <h2>Tải lên PDF</h2>
              <p className="text-sm text-secondary">Cần 2 file: đề thi và đáp án</p>
            </div>
          </div>

          <div className="upload-grid">
            <div>
              <label className="label">📄 File đề thi (câu hỏi)</label>
              <UploadZone
                id="upload-questions"
                label="Tải lên PDF đề thi"
                description="File chứa câu hỏi trắc nghiệm (không có đáp án)"
                file={questionFile}
                onFile={f => { setQuestionFile(f); setStep(STEP.UPLOAD); setParseResult(null); }}
              />
            </div>
            <div>
              <label className="label">📋 File đáp án + lời giải</label>
              <UploadZone
                id="upload-answers"
                label="Tải lên PDF đáp án"
                description="File chứa đáp án đúng và lời giải chi tiết"
                file={answerFile}
                onFile={f => { setAnswerFile(f); setStep(STEP.UPLOAD); setParseResult(null); }}
              />
            </div>
          </div>

          <button
            className="btn btn-primary btn-lg w-full mt-4"
            onClick={handleAnalyze}
            disabled={!canAnalyze || step === STEP.ANALYZING}
            id="btn-analyze"
          >
            {step === STEP.ANALYZING ? (
              <>
                <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                Đang phân tích PDF...
              </>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M9 11l3 3L22 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Phân Tích PDF
              </>
            )}
          </button>
        </section>

        {/* Parse Result */}
        {step === STEP.READY && parseResult && (
          <section className="home-section card card-elevated animate-fade-in">
            <div className="section-title">
              <div className="section-icon success">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M9 11l3 3 8-8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9c1.51 0 2.93.37 4.18 1.03" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <div>
                <h2>Kết Quả Phân Tích</h2>
                <p className="text-sm text-secondary">Sẵn sàng bắt đầu thi</p>
              </div>
            </div>

            <div className="parse-stats">
              <div className="parse-stat">
                <span className="parse-stat-value">{parseResult.bank.length}</span>
                <span className="parse-stat-label">Câu hỏi</span>
              </div>
              <div className="parse-stat">
                <span className="parse-stat-value">{parseResult.rawQCount}</span>
                <span className="parse-stat-label">Đề thi</span>
              </div>
              <div className="parse-stat">
                <span className="parse-stat-value">{parseResult.rawACount}</span>
                <span className="parse-stat-label">Đáp án</span>
              </div>
              <div className="parse-stat">
                <span className="parse-stat-value success">
                  {parseResult.bank.filter(q => q.correctAnswer).length}
                </span>
                <span className="parse-stat-label">Có đáp án</span>
              </div>
            </div>

            {/* Warnings */}
            {warnings.length > 0 && (
              <div className="warnings-list">
                <div className="warnings-title">⚠️ Cảnh báo ({warnings.length})</div>
                {warnings.slice(0, 10).map((w, i) => (
                  <div key={i} className="alert alert-warning" style={{ marginBottom: 4 }}>
                    {w}
                  </div>
                ))}
                {warnings.length > 10 && (
                  <div className="text-muted text-sm">... và {warnings.length - 10} cảnh báo khác</div>
                )}
              </div>
            )}

            {/* Config */}
            <div className="exam-config">
              <h3>Cấu hình đề thi</h3>
              <div className="config-grid">
                <div>
                  <label className="label" htmlFor="exam-title">Tên đề thi</label>
                  <input
                    id="exam-title"
                    className="input"
                    type="text"
                    placeholder={questionFile?.name?.replace('.pdf', '') || 'Đề thi trắc nghiệm'}
                    value={examTitle}
                    onChange={e => setExamTitle(e.target.value)}
                  />
                </div>
                <div>
                  <label className="label" htmlFor="exam-duration">
                    ⏱ Thời gian thi (phút) <span className="text-danger">*</span>
                  </label>
                  <input
                    id="exam-duration"
                    className="input"
                    type="number"
                    min={1}
                    max={300}
                    value={examDuration}
                    onChange={e => setExamDuration(Number(e.target.value))}
                    required
                  />
                </div>
              </div>

              <div className="config-checkboxes">
                <label className="config-check">
                  <input
                    type="checkbox"
                    checked={shuffleQuestions}
                    onChange={e => setShuffleQuestions(e.target.checked)}
                    id="shuffle-q"
                  />
                  <span className="config-check-box" />
                  🔀 Trộn thứ tự câu hỏi
                </label>
                <label className="config-check">
                  <input
                    type="checkbox"
                    checked={shuffleOptions}
                    onChange={e => setShuffleOptions(e.target.checked)}
                    id="shuffle-o"
                  />
                  <span className="config-check-box" />
                  🔀 Trộn thứ tự đáp án
                </label>
              </div>
            </div>

            <button
              className="btn btn-primary btn-lg w-full"
              onClick={handleStartExam}
              id="btn-start-exam"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <polygon points="5,3 19,12 5,21" fill="currentColor"/>
              </svg>
              Bắt Đầu Thi ({parseResult.bank.length} câu · {examDuration} phút)
            </button>
          </section>
        )}

        {/* Error state */}
        {step === STEP.ERROR && (
          <section className="home-section animate-fade-in">
            {errors.map((e, i) => (
              <div key={i} className="alert alert-danger">{e}</div>
            ))}
          </section>
        )}

        {/* Features */}
        <section className="home-features animate-fade-in">
          {[
            { icon: '⚡', title: 'Phân tích tức thì', desc: 'PDF.js xử lý trực tiếp trên trình duyệt, không cần upload server' },
            { icon: '🔒', title: 'Bảo mật đáp án', desc: 'Đáp án được mã hóa, không lộ trong giao diện khi đang thi' },
            { icon: '📊', title: 'Thống kê chi tiết', desc: 'Biểu đồ kết quả, phân tích câu sai, xuất PDF/Excel' },
            { icon: '♻️', title: 'Ôn tập thông minh', desc: 'Tự động tạo đề ôn từ các câu sai và bỏ trống' },
          ].map(f => (
            <div key={f.title} className="feature-card card">
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
