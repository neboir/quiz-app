import { useState, useEffect } from 'react';
import { useTutor } from '../context/TutorContext';
import type { Question } from '../context/TutorContext';
import { ArrowRight, CheckCircle, XCircle, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Mistakes() {
  const { questions, wrongQuestions, markQuestionCorrect } = useTutor();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [mistakeQuestions, setMistakeQuestions] = useState<Question[]>([]);

  useEffect(() => {
    // Load wrong questions into the state on mount
    const qs = questions.filter(q => wrongQuestions.includes(q.id));
    setMistakeQuestions(qs.sort(() => 0.5 - Math.random()));
  }, [questions, wrongQuestions.length]); // Only reload when length changes to avoid shifting while answering

  if (wrongQuestions.length === 0) {
    return (
      <div className="glass-panel animate-fade-in" style={{ maxWidth: '500px', margin: '0 auto', textAlign: 'center', padding: '4rem 2rem' }}>
        <div style={{ display: 'inline-block', padding: '1.5rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '50%', color: 'var(--success)', marginBottom: '1.5rem' }}>
          <Trophy size={48} />
        </div>
        <h2 className="gradient-text" style={{ fontSize: '2rem', marginBottom: '1rem' }}>Thật tuyệt vời!</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Bạn không có câu trả lời sai nào cần ôn lại. Hãy tiếp tục phát huy ở chế độ Luyện tập hoặc Thi thử nhé.</p>
        <Link to="/" className="btn btn-primary">Về trang chủ</Link>
      </div>
    );
  }

  const currentQ = mistakeQuestions[currentQuestionIndex];
  
  if (!currentQ) {
    return <div style={{ textAlign: 'center', marginTop: '2rem' }}><h2 className="gradient-text">Đang tải...</h2></div>;
  }

  const isCorrect = selectedOption === currentQ.correct;

  const handleOptionClick = (option: string) => {
    if (isAnswered) return;
    setSelectedOption(option);
    setIsAnswered(true);

    if (option === currentQ.correct) {
      markQuestionCorrect(currentQ.id);
    }
  };

  const handleNext = () => {
    setSelectedOption(null);
    setIsAnswered(false);
    
    if (currentQuestionIndex + 1 < mistakeQuestions.length) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Finished round, if still have wrong questions it will remount/reload via useEffect
      // or we can force reload
      window.location.reload();
    }
  };

  const getOptionStyle = (option: string) => {
    if (!isAnswered) {
      return selectedOption === option ? 'var(--bg-secondary)' : 'transparent';
    }
    if (option === currentQ.correct) {
      return 'rgba(16, 185, 129, 0.2)'; 
    }
    if (selectedOption === option && selectedOption !== currentQ.correct) {
      return 'rgba(239, 68, 68, 0.2)'; 
    }
    return 'transparent';
  };

  return (
    <div className="animate-fade-in delay-100" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h2 className="gradient-text">Học từ câu sai</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Bạn có {wrongQuestions.length} câu cần làm lại cho đến khi đúng 100%.</p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: 'var(--text-secondary)' }}>
        <span>Câu {currentQuestionIndex + 1} / {mistakeQuestions.length}</span>
        <span>Chủ đề: {currentQ.chapter}</span>
      </div>

      <div className="glass-panel" style={{ marginBottom: '2rem', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', lineHeight: '1.6' }}>{currentQ.question}</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {['A', 'B', 'C', 'D'].map(opt => (
            currentQ[opt as keyof Question] ? (
              <div 
                key={opt}
                onClick={() => handleOptionClick(opt)}
                style={{ 
                  padding: '1rem 1.5rem', 
                  borderRadius: '1rem', 
                  border: `1px solid ${isAnswered && opt === currentQ.correct ? 'var(--success)' : isAnswered && selectedOption === opt ? 'var(--danger)' : 'var(--border)'}`,
                  background: getOptionStyle(opt),
                  cursor: isAnswered ? 'default' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ 
                  width: '32px', height: '32px', borderRadius: '50%', 
                  background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 'bold',
                  color: isAnswered && opt === currentQ.correct ? 'var(--success)' : 'inherit'
                }}>
                  {opt}
                </div>
                <span>{currentQ[opt as keyof Question]}</span>
              </div>
            ) : null
          ))}
        </div>
      </div>

      {isAnswered && (
        <div className="glass-panel animate-fade-in" style={{ 
            marginBottom: '2rem', 
            borderLeft: `4px solid ${isCorrect ? 'var(--success)' : 'var(--danger)'}`,
            background: isCorrect ? 'rgba(16, 185, 129, 0.05)' : 'rgba(239, 68, 68, 0.05)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            {isCorrect ? <CheckCircle color="var(--success)" /> : <XCircle color="var(--danger)" />}
            <h3 style={{ color: isCorrect ? 'var(--success)' : 'var(--danger)', margin: 0 }}>
              {isCorrect ? 'Tuyệt vời! Câu này đã được xóa khỏi danh sách lỗi.' : `Vẫn sai mất rồi. Đáp án đúng là: ${currentQ.correct}`}
            </h3>
          </div>
          
          <div style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            <strong>Kiến thức trọng tâm: </strong> 
            {currentQ.explanation ? currentQ.explanation : "Bạn cần đọc kỹ lại lý thuyết của chương " + currentQ.chapter + " để không bị nhầm lẫn nữa nhé."}
          </div>
        </div>
      )}

      {isAnswered && (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-primary animate-fade-in" onClick={handleNext}>
            {currentQuestionIndex + 1 < mistakeQuestions.length ? 'Câu tiếp theo' : 'Kiểm tra lại danh sách lỗi'} <ArrowRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
