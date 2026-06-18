import { useState } from 'react';
import { useTutor } from '../context/TutorContext';
import type { Question } from '../context/TutorContext';
import { ArrowRight, CheckCircle, XCircle } from 'lucide-react';

export default function Practice() {
  const { questions, updateStats, markQuestionWrong, markQuestionCorrect } = useTutor();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [practiceQuestions, setPracticeQuestions] = useState<Question[]>([]);

  // Initialize random questions on first mount
  useState(() => {
    const shuffled = [...questions].sort(() => 0.5 - Math.random());
    setPracticeQuestions(shuffled.slice(0, 10)); // Default 10 questions for practice
  });

  if (practiceQuestions.length === 0) return <div>Loading...</div>;

  const currentQ = practiceQuestions[currentQuestionIndex];
  const isCorrect = selectedOption === currentQ.correct;

  const handleOptionClick = (option: string) => {
    if (isAnswered) return;
    setSelectedOption(option);
    setIsAnswered(true);

    const correct = option === currentQ.correct;
    updateStats(correct ? 1 : 0, 1);
    
    if (correct) {
      markQuestionCorrect(currentQ.id);
    } else {
      markQuestionWrong(currentQ.id);
    }
  };

  const handleNext = () => {
    setSelectedOption(null);
    setIsAnswered(false);
    setCurrentQuestionIndex(prev => prev + 1);
  };

  const getOptionStyle = (option: string) => {
    if (!isAnswered) {
      return selectedOption === option ? 'var(--bg-secondary)' : 'transparent';
    }
    if (option === currentQ.correct) {
      return 'rgba(16, 185, 129, 0.2)'; // Success green
    }
    if (selectedOption === option && selectedOption !== currentQ.correct) {
      return 'rgba(239, 68, 68, 0.2)'; // Danger red
    }
    return 'transparent';
  };

  if (currentQuestionIndex >= practiceQuestions.length) {
    return (
      <div className="glass-panel animate-fade-in" style={{ textAlign: 'center' }}>
        <h2 className="gradient-text" style={{ fontSize: '2rem', marginBottom: '1rem' }}>Hoàn thành bài luyện tập!</h2>
        <button className="btn btn-primary" onClick={() => window.location.href='/'}>Về trang chủ</button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in delay-100" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: 'var(--text-secondary)' }}>
        <span>Câu {currentQuestionIndex + 1} / {practiceQuestions.length}</span>
        <span>Chủ đề: {currentQ.chapter}</span>
      </div>

      <div className="glass-panel" style={{ marginBottom: '2rem' }}>
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
              {isCorrect ? 'Tuyệt vời! Bạn đã trả lời chính xác.' : `Chưa chính xác. Đáp án đúng là: ${currentQ.correct}`}
            </h3>
          </div>
          
          <div style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            <strong>Giải thích chi tiết: </strong> 
            {currentQ.explanation ? currentQ.explanation : "Đáp án đúng là " + currentQ.correct + " dựa trên kiến thức chương " + currentQ.chapter + ". Hãy ghi nhớ kỹ phần này nhé!"}
          </div>
        </div>
      )}

      {isAnswered && (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-primary animate-fade-in" onClick={handleNext}>
            Câu tiếp theo <ArrowRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
