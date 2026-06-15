import { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import ThemeToggle from './components/ThemeToggle';
import HomePage from './pages/HomePage';
import ExamPage from './pages/ExamPage';
import ResultPage from './pages/ResultPage';
import { storage } from './utils/storage';
import './App.css';

const PAGES = { HOME: 'home', EXAM: 'exam', RESULT: 'result' };

export default function App() {
  const [theme, setTheme] = useState(() => storage.loadTheme());
  const [page, setPage] = useState(PAGES.HOME);
  const [examConfig, setExamConfig] = useState(null);
  const [examResult, setExamResult] = useState(null);
  const [examTitle, setExamTitle] = useState('');

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    storage.saveTheme(theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === 'light' ? 'dark' : 'light');

  const handleStartExam = useCallback((config) => {
    setExamConfig(config);
    setExamTitle(config.examTitle);
    setPage(PAGES.EXAM);
  }, []);

  const handleFinishExam = useCallback((result, title) => {
    setExamResult(result);
    setExamTitle(title);
    storage.saveStats({
      examTitle: title,
      score10: result.score10,
      percentage: result.percentage,
      correct: result.correct,
      total: result.total,
    });
    setPage(PAGES.RESULT);
  }, []);

  const handleHome = useCallback(() => {
    setPage(PAGES.HOME);
    setExamConfig(null);
    setExamResult(null);
  }, []);

  const handleRetryWrong = useCallback((wrongBank) => {
    if (!wrongBank?.length) return;
    const config = {
      ...examConfig,
      questions: wrongBank,
      examTitle: `Ôn tập — ${examTitle}`,
    };
    setExamConfig(config);
    setExamTitle(config.examTitle);
    setPage(PAGES.EXAM);
  }, [examConfig, examTitle]);

  return (
    <div className="app">
      {page !== PAGES.EXAM && (
        <Header title="QuizPro">
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
          {page === PAGES.RESULT && (
            <button className="btn btn-ghost btn-sm" onClick={handleHome} id="btn-header-home">
              Trang chủ
            </button>
          )}
        </Header>
      )}

      {page === PAGES.EXAM && (
        <div className="exam-header-strip">
          <span className="exam-header-brand">QuizPro</span>
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
        </div>
      )}

      <main className="app-main">
        {page === PAGES.HOME && (
          <HomePage onStartExam={handleStartExam} />
        )}
        {page === PAGES.EXAM && examConfig && (
          <ExamPage
            examConfig={examConfig}
            onFinish={handleFinishExam}
            onHome={handleHome}
          />
        )}
        {page === PAGES.RESULT && examResult && (
          <ResultPage
            result={examResult}
            examTitle={examTitle}
            examConfig={examConfig}
            onHome={handleHome}
            onRetryWrong={handleRetryWrong}
          />
        )}
      </main>
    </div>
  );
}
