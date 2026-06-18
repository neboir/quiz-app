import { Link } from 'react-router-dom';
import { useTutor } from '../context/TutorContext';
import { Target, PenTool, BookOpen, RefreshCw, Award, TrendingUp, AlertTriangle } from 'lucide-react';

export default function Dashboard() {
  const { stats, getPredictedScore, getCompetenceLevel, wrongQuestions } = useTutor();
  
  const score = getPredictedScore();
  const accuracy = stats.totalAnswered > 0 ? Math.round((stats.totalCorrect / stats.totalAnswered) * 100) : 0;

  return (
    <div className="animate-fade-in delay-100">
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 className="gradient-text" style={{ fontSize: '3rem', marginBottom: '1rem' }}>Sẵn sàng chinh phục kỳ thi?</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Luyện tập thông minh, đạt điểm tối đa với AI Tutor.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
          <div className="btn-icon" style={{ background: 'rgba(59, 130, 246, 0.2)', color: 'var(--accent-primary)' }}>
            <Award size={32} />
          </div>
          <h3 style={{ color: 'var(--text-secondary)' }}>Dự đoán điểm</h3>
          <h2 style={{ fontSize: '2.5rem', margin: 0 }}>{score} / 10</h2>
          <p style={{ color: 'var(--success)', textAlign: 'center' }}>{getCompetenceLevel()}</p>
        </div>

        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
          <div className="btn-icon" style={{ background: 'rgba(16, 185, 129, 0.2)', color: 'var(--success)' }}>
            <TrendingUp size={32} />
          </div>
          <h3 style={{ color: 'var(--text-secondary)' }}>Tỷ lệ chính xác</h3>
          <h2 style={{ fontSize: '2.5rem', margin: 0 }}>{accuracy}%</h2>
          <p style={{ color: 'var(--text-secondary)' }}>{stats.totalCorrect} / {stats.totalAnswered} câu đúng</p>
        </div>

        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
          <div className="btn-icon" style={{ background: 'rgba(239, 68, 68, 0.2)', color: 'var(--danger)' }}>
            <AlertTriangle size={32} />
          </div>
          <h3 style={{ color: 'var(--text-secondary)' }}>Cần ôn lại</h3>
          <h2 style={{ fontSize: '2.5rem', margin: 0 }}>{wrongQuestions.length}</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Câu hỏi làm sai</p>
        </div>
      </div>

      <h2 style={{ marginBottom: '1.5rem' }}>Chế độ học tập</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
        <Link to="/practice" style={{ textDecoration: 'none' }}>
          <div className="glass-panel" style={{ cursor: 'pointer', height: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <div className="btn-icon" style={{ background: 'rgba(59, 130, 246, 0.2)', color: 'var(--accent-primary)' }}>
                <PenTool size={24} />
              </div>
              <h3 style={{ color: 'var(--text-primary)', margin: 0 }}>Luyện tập</h3>
            </div>
            <p style={{ color: 'var(--text-secondary)' }}>Làm bài tập ngẫu nhiên có giải thích chi tiết ngay sau mỗi câu.</p>
          </div>
        </Link>

        <Link to="/exam" style={{ textDecoration: 'none' }}>
          <div className="glass-panel" style={{ cursor: 'pointer', height: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <div className="btn-icon" style={{ background: 'rgba(139, 92, 246, 0.2)', color: 'var(--accent-secondary)' }}>
                <Target size={24} />
              </div>
              <h3 style={{ color: 'var(--text-primary)', margin: 0 }}>Thi thử</h3>
            </div>
            <p style={{ color: 'var(--text-secondary)' }}>Giả lập kỳ thi thực tế với đồng hồ đếm ngược và chấm điểm tổng hợp.</p>
          </div>
        </Link>

        <Link to="/review" style={{ textDecoration: 'none' }}>
          <div className="glass-panel" style={{ cursor: 'pointer', height: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <div className="btn-icon" style={{ background: 'rgba(16, 185, 129, 0.2)', color: 'var(--success)' }}>
                <BookOpen size={24} />
              </div>
              <h3 style={{ color: 'var(--text-primary)', margin: 0 }}>Ôn tập</h3>
            </div>
            <p style={{ color: 'var(--text-secondary)' }}>Hệ thống lại kiến thức và lý thuyết theo từng chủ đề.</p>
          </div>
        </Link>

        <Link to="/mistakes" style={{ textDecoration: 'none' }}>
          <div className="glass-panel" style={{ cursor: 'pointer', height: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <div className="btn-icon" style={{ background: 'rgba(245, 158, 11, 0.2)', color: 'var(--warning)' }}>
                <RefreshCw size={24} />
              </div>
              <h3 style={{ color: 'var(--text-primary)', margin: 0 }}>Học từ câu sai</h3>
            </div>
            <p style={{ color: 'var(--text-secondary)' }}>Làm lại những câu đã sai đến khi đúng 100%.</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
