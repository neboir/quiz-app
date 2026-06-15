import { useState, useEffect, useRef, useCallback } from 'react';
import QuestionCard from '../components/QuestionCard';
import QuestionNav from '../components/QuestionNav';
import Timer from '../components/Timer';
import { storage } from '../utils/storage';
import { scoreExam } from '../utils/scorer';
import './ExamPage.css';

export default function ExamPage({ examConfig, onFinish, onHome }) {
  const { questions, examTitle, durationSeconds } = examConfig;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [markedQuestions, setMarkedQuestions] = useState(new Set());
  const [secondsLeft, setSecondsLeft] = useState(durationSeconds);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const timerRef = useRef(null);
  const startTimeRef = useRef(Date.now());

  // Restore from localStorage
  useEffect(() => {
    const saved = storage.loadExamState();
    if (saved && saved.examTitle === examTitle && saved.questions?.length === questions.length) {
      const restore = window.confirm('Bạn có tiến trình thi chưa hoàn thành. Tiếp tục từ lần trước?');
      if (restore) {
        setUserAnswers(saved.userAnswers || {});
        setMarkedQuestions(new Set(saved.markedQuestions || []));
        setSecondsLeft(saved.secondsLeft || durationSeconds);
        setCurrentIndex(saved.currentIndex || 0);
        startTimeRef.current = Date.now() - ((durationSeconds - (saved.secondsLeft || durationSeconds)) * 1000);
      }
    }
  }, []);

  // Save to localStorage on changes
  useEffect(() => {
    if (!submitted) {
      storage.saveExamState({
        examTitle,
        questions: questions.map(q => q.id),
        userAnswers,
        markedQuestions: [...markedQuestions],
        secondsLeft,
        currentIndex,
        savedAt: Date.now(),
      });
    }
  }, [userAnswers, markedQuestions, secondsLeft, currentIndex, submitted]);

  // Countdown timer
  useEffect(() => {
    if (submitted) return;
    timerRef.current = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [submitted]);

  // Warn before leaving tab
  useEffect(() => {
    const handler = (e) => {
      if (!submitted) {
        e.preventDefault();
        e.returnValue = 'Bạn đang trong kỳ thi! Thoát sẽ mất tiến trình.';
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [submitted]);

  const handleAutoSubmit = useCallback(() => {
    if (submitted) return;
    setSubmitted(true);
    clearInterval(timerRef.current);
    storage.clearExamState();
    const timeUsed = durationSeconds - secondsLeft;
    const result = scoreExam(questions, userAnswers, Math.max(timeUsed, 1));
    onFinish(result, examTitle);
  }, [submitted, questions, userAnswers, durationSeconds, secondsLeft, examTitle, onFinish]);

  const handleManualSubmit = () => {
    const unanswered = questions.filter(q => !userAnswers[q.id]).length;
    if (unanswered > 0 && !showConfirm) {
      setShowConfirm(true);
      return;
    }
    doSubmit();
  };

  const doSubmit = () => {
    if (submitted) return;
    setSubmitted(true);
    clearInterval(timerRef.current);
    storage.clearExamState();
    const timeUsed = durationSeconds - secondsLeft;
    const result = scoreExam(questions, userAnswers, Math.max(timeUsed, 1));
    onFinish(result, examTitle);
  };

  const handleSelect = (key) => {
    setUserAnswers(prev => ({ ...prev, [questions[currentIndex].id]: key }));
  };

  const toggleMark = () => {
    const qId = questions[currentIndex].id;
    setMarkedQuestions(prev => {
      const s = new Set(prev);
      if (s.has(qId)) s.delete(qId);
      else s.add(qId);
      return s;
    });
  };

  const currentQuestion = questions[currentIndex];
  const answered = Object.keys(userAnswers).length;
  const progress = Math.round((answered / questions.length) * 100);

  return (
    <div className="exam-page">
      {/* Sidebar overlay (mobile) */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`exam-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h3>Danh Sách Câu</h3>
          <button className="btn btn-ghost btn-icon" onClick={() => setSidebarOpen(false)} aria-label="Đóng">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
        <div className="sidebar-body">
          <QuestionNav
            questions={questions}
            currentIndex={currentIndex}
            userAnswers={userAnswers}
            markedQuestions={markedQuestions}
            onJump={setCurrentIndex}
            onClose={() => setSidebarOpen(false)}
          />
        </div>
        <div className="sidebar-footer">
          <button
            className="btn btn-danger w-full"
            onClick={handleManualSubmit}
            id="btn-submit-sidebar"
          >
            Nộp Bài ({answered}/{questions.length})
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="exam-main">
        {/* Exam top bar */}
        <div className="exam-topbar">
          <div className="exam-topbar-left">
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setSidebarOpen(true)}
              id="btn-open-sidebar"
              aria-label="Mở danh sách câu"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <line x1="3" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <line x1="3" y1="18" x2="21" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Câu hỏi
            </button>
            <div className="exam-title-chip">
              <span className="truncate" style={{ maxWidth: 200 }}>{examTitle}</span>
            </div>
          </div>
          <div className="exam-topbar-right">
            <Timer secondsLeft={secondsLeft} onExpire={handleAutoSubmit} />
            <button
              className="btn btn-danger btn-sm"
              onClick={handleManualSubmit}
              id="btn-submit-top"
            >
              Nộp Bài
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="exam-progress">
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <span className="exam-progress-text">{answered}/{questions.length} câu đã làm</span>
        </div>

        {/* Confirm modal */}
        {showConfirm && (
          <div className="confirm-modal-overlay">
            <div className="confirm-modal card card-elevated animate-fade-in">
              <h3>Xác nhận nộp bài</h3>
              <p>Bạn còn <strong>{questions.length - answered}</strong> câu chưa trả lời. Bạn có chắc muốn nộp bài?</p>
              <div className="flex gap-3 mt-4">
                <button className="btn btn-ghost flex-1" onClick={() => setShowConfirm(false)}>
                  Tiếp tục làm
                </button>
                <button className="btn btn-danger flex-1" onClick={doSubmit} id="btn-confirm-submit">
                  Nộp bài ngay
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Question content */}
        <div className="exam-content">
          <QuestionCard
            question={currentQuestion}
            questionIndex={currentIndex}
            totalQuestions={questions.length}
            selectedAnswer={userAnswers[currentQuestion.id]}
            onSelect={handleSelect}
            isMarked={markedQuestions.has(currentQuestion.id)}
            onToggleMark={toggleMark}
          />

          {/* Navigation buttons */}
          <div className="exam-nav-btns">
            <button
              className="btn btn-ghost"
              onClick={() => setCurrentIndex(i => Math.max(0, i - 1))}
              disabled={currentIndex === 0}
              id="btn-prev"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Câu trước
            </button>

            <span className="exam-nav-counter">
              {currentIndex + 1} / {questions.length}
            </span>

            <button
              className="btn btn-primary"
              onClick={() => setCurrentIndex(i => Math.min(questions.length - 1, i + 1))}
              disabled={currentIndex === questions.length - 1}
              id="btn-next"
            >
              Câu tiếp
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
