import { useState } from 'react';
import { useTutor } from '../context/TutorContext';
import type { Question } from '../context/TutorContext';
import { BookOpen, ChevronRight, ArrowLeft } from 'lucide-react';

export default function Review() {
  const { questions } = useTutor();
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);

  // Group by chapter
  const chapters = Array.from(new Set(questions.map(q => q.chapter))).filter(Boolean);

  if (selectedChapter) {
    const chapterQuestions = questions.filter(q => q.chapter === selectedChapter);

    return (
      <div className="animate-fade-in delay-100" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <button 
          className="btn btn-secondary" 
          style={{ marginBottom: '2rem' }}
          onClick={() => setSelectedChapter(null)}
        >
          <ArrowLeft size={18} /> Quay lại
        </button>

        <div className="glass-panel" style={{ marginBottom: '2rem', background: 'rgba(59, 130, 246, 0.1)' }}>
          <h2 className="gradient-text" style={{ marginBottom: '1rem' }}>Tóm tắt lý thuyết: {selectedChapter}</h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            Phần này tổng hợp các kiến thức cốt lõi về {selectedChapter.toLowerCase()}. 
            Hãy chú ý các định nghĩa cơ bản, các mốc thời gian quan trọng và sự kiện lịch sử (nếu có).
            Dưới đây là {chapterQuestions.length} câu hỏi liên quan để bạn ôn tập.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {chapterQuestions.map((q, idx) => (
            <div key={q.id} className="glass-panel">
              <div style={{ color: 'var(--accent-primary)', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                Câu {idx + 1}
              </div>
              <h4 style={{ marginBottom: '1rem', lineHeight: '1.5' }}>{q.question}</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {['A', 'B', 'C', 'D'].map(opt => (
                  q[opt as keyof Question] ? (
                    <div 
                      key={opt}
                      style={{ 
                        padding: '0.8rem 1rem', 
                        borderRadius: '0.5rem', 
                        background: opt === q.correct ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                        border: opt === q.correct ? '1px solid var(--success)' : '1px solid var(--border)',
                        color: opt === q.correct ? 'var(--success)' : 'var(--text-secondary)'
                      }}
                    >
                      <strong>{opt}.</strong> {q[opt as keyof Question]}
                      {opt === q.correct && <span style={{ marginLeft: '1rem', fontSize: '0.8rem' }}>✓ Đáp án đúng</span>}
                    </div>
                  ) : null
                ))}
              </div>
              {q.explanation && (
                <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  <strong>Giải thích:</strong> {q.explanation}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h2 className="gradient-text" style={{ marginBottom: '2rem', textAlign: 'center', fontSize: '2.5rem' }}>Ôn tập theo chủ đề</h2>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {chapters.map(chapter => {
          const count = questions.filter(q => q.chapter === chapter).length;
          return (
            <div 
              key={chapter} 
              className="glass-panel" 
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', transition: 'transform 0.2s' }}
              onClick={() => setSelectedChapter(chapter)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div className="btn-icon" style={{ background: 'rgba(16, 185, 129, 0.2)', color: 'var(--success)' }}>
                  <BookOpen size={24} />
                </div>
                <div>
                  <h3 style={{ margin: 0, marginBottom: '0.2rem' }}>{chapter}</h3>
                  <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.9rem' }}>{count} câu hỏi</p>
                </div>
              </div>
              <ChevronRight color="var(--text-secondary)" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
