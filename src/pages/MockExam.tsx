import { useState, useEffect } from 'react';
import { useTutor } from '../context/TutorContext';
import type { Question } from '../context/TutorContext';
import { Clock, Settings } from 'lucide-react';

export default function MockExam() {
  const { questions, updateStats, markQuestionWrong, markQuestionCorrect } = useTutor();
  const [examStatus, setExamStatus] = useState<'setup' | 'running' | 'finished'>('setup');
  const [examQuestions, setExamQuestions] = useState<Question[]>([]);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(0); // in seconds
  
  // Configuration State
  const [questionCount, setQuestionCount] = useState<number>(50);
  const [selectionMode, setSelectionMode] = useState<'random' | 'sequential'>('random');
  const [timeLimitMinutes, setTimeLimitMinutes] = useState<number>(30);
  const [shuffleOptions, setShuffleOptions] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Load configuration from local storage
  useEffect(() => {
    if (questions.length === 0) return;
    const savedConfig = localStorage.getItem('tutor_exam_config');
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig);
        if (config.questionCount) setQuestionCount(config.questionCount);
        if (config.selectionMode) setSelectionMode(config.selectionMode);
        if (config.timeLimitMinutes) setTimeLimitMinutes(config.timeLimitMinutes);
        if (typeof config.shuffleOptions === 'boolean') setShuffleOptions(config.shuffleOptions);
      } catch (e) {}
    } else {
      setQuestionCount(Math.min(50, questions.length));
    }
  }, [questions.length]);

  // Save config on change
  useEffect(() => {
    if (questions.length > 0) {
      localStorage.setItem('tutor_exam_config', JSON.stringify({
        questionCount,
        selectionMode,
        timeLimitMinutes,
        shuffleOptions
      }));
    }
  }, [questionCount, selectionMode, timeLimitMinutes, shuffleOptions, questions.length]);

  // Auto-suggest time when questionCount changes
  const handleQuestionCountChange = (val: number) => {
    setQuestionCount(val);
    if (val <= 20) setTimeLimitMinutes(15);
    else if (val <= 50) setTimeLimitMinutes(30);
    else if (val <= 100) setTimeLimitMinutes(60);
    else setTimeLimitMinutes(Math.round(val * 0.6)); // Roughly 0.6 mins per question
  };

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (examStatus === 'running' && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (examStatus === 'running' && timeLeft === 0) {
      finishExam();
    }
    return () => clearInterval(timer);
  }, [examStatus, timeLeft]);

  // Option Shuffler Helper
  const shuffleQuestionOptions = (q: Question): Question => {
    const options = [
      { key: 'A', value: q.A },
      { key: 'B', value: q.B },
      { key: 'C', value: q.C },
      { key: 'D', value: q.D }
    ].filter(o => o.value);
    
    // Shuffle options array
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }

    // Determine new correct key based on value matching
    const oldCorrectValue = q[q.correct as keyof Question];
    let newCorrectKey = q.correct;

    const newQ = { ...q, A: '', B: '', C: '', D: '' };
    const keys = ['A', 'B', 'C', 'D'];
    options.forEach((opt, idx) => {
      (newQ as any)[keys[idx]] = opt.value;
      if (opt.value === oldCorrectValue) {
        newCorrectKey = keys[idx];
      }
    });

    newQ.correct = newCorrectKey;
    return newQ as Question;
  };

  const startExam = () => {
    if (questionCount < 1 || questionCount > questions.length) {
      setErrorMsg(`Chỉ có ${questions.length} câu hỏi, vui lòng chọn số câu từ 1 đến ${questions.length}.`);
      return;
    }
    setErrorMsg('');

    let selected: Question[] = [];
    if (selectionMode === 'random') {
      const shuffled = [...questions].sort(() => 0.5 - Math.random());
      selected = shuffled.slice(0, questionCount);
    } else {
      selected = questions.slice(0, questionCount);
    }

    if (shuffleOptions) {
      selected = selected.map(q => shuffleQuestionOptions(q));
    }

    setExamQuestions(selected);
    setTimeLeft(timeLimitMinutes * 60);
    setExamStatus('running');
    setUserAnswers({});
  };

  const finishExam = () => {
    let correctCount = 0;
    examQuestions.forEach(q => {
      const uA = userAnswers[q.id];
      if (uA === q.correct) {
        correctCount++;
        markQuestionCorrect(q.id);
      } else {
        markQuestionWrong(q.id);
      }
    });
    updateStats(correctCount, examQuestions.length);
    setExamStatus('finished');
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (examStatus === 'setup') {
    return (
      <div className="glass-panel animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Settings size={40} className="gradient-text" style={{ marginBottom: '1rem' }} />
          <h2 className="gradient-text">Cấu hình Đề thi</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Tùy chỉnh bài thi phù hợp với nhu cầu ôn luyện của bạn.</p>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2.5rem' }}>
          
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '1rem', fontWeight: 'bold', fontSize: '1.1rem' }}>
              Số câu hỏi muốn làm: <span className="gradient-text">{questionCount} / {questions.length}</span> câu
            </label>
            <input 
              type="range" 
              min="1" 
              max={questions.length} 
              value={questionCount} 
              onChange={(e) => handleQuestionCountChange(Number(e.target.value))}
              style={{ width: '100%', marginBottom: '1.5rem', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
              <input 
                type="number" 
                min="1" 
                max={questions.length}
                value={questionCount}
                onChange={(e) => handleQuestionCountChange(Number(e.target.value))}
                style={{ padding: '0.6rem', borderRadius: '0.5rem', border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', width: '90px', fontSize: '1rem' }}
              />
              <button className="btn btn-secondary" style={{ padding: '0.6rem 1rem' }} onClick={() => handleQuestionCountChange(50)}>50</button>
              <button className="btn btn-secondary" style={{ padding: '0.6rem 1rem' }} onClick={() => handleQuestionCountChange(100)}>100</button>
              <button className="btn btn-secondary" style={{ padding: '0.6rem 1rem' }} onClick={() => handleQuestionCountChange(200)}>200</button>
              <button className="btn btn-secondary" style={{ padding: '0.6rem 1rem' }} onClick={() => handleQuestionCountChange(questions.length)}>Tất cả</button>
            </div>
            {errorMsg && <p style={{ color: 'var(--danger)', fontSize: '0.9rem', marginTop: '0.8rem' }}>{errorMsg}</p>}
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '1rem', fontWeight: 'bold', fontSize: '1.1rem' }}>Cách lấy câu hỏi:</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer', padding: '0.5rem', borderRadius: '0.5rem', background: selectionMode === 'random' ? 'rgba(59, 130, 246, 0.1)' : 'transparent' }}>
                <input type="radio" name="selectionMode" checked={selectionMode === 'random'} onChange={() => setSelectionMode('random')} style={{ width: '1.2rem', height: '1.2rem' }} />
                <div>
                  <div style={{ fontWeight: 'bold' }}>Ngẫu nhiên</div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Chọn ngẫu nhiên câu hỏi trong ngân hàng, không lặp lại.</div>
                </div>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer', padding: '0.5rem', borderRadius: '0.5rem', background: selectionMode === 'sequential' ? 'rgba(59, 130, 246, 0.1)' : 'transparent' }}>
                <input type="radio" name="selectionMode" checked={selectionMode === 'sequential'} onChange={() => setSelectionMode('sequential')} style={{ width: '1.2rem', height: '1.2rem' }} />
                <div>
                  <div style={{ fontWeight: 'bold' }}>Theo thứ tự</div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Lấy lần lượt từ câu 1 đến câu N.</div>
                </div>
              </label>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <label style={{ display: 'block', marginBottom: '0.8rem', fontWeight: 'bold', fontSize: '1.1rem' }}>
                Thời gian (phút):
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Clock size={20} color="var(--text-secondary)" />
                <input 
                  type="number" 
                  min="1" 
                  value={timeLimitMinutes}
                  onChange={(e) => setTimeLimitMinutes(Number(e.target.value))}
                  style={{ padding: '0.6rem', borderRadius: '0.5rem', border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', width: '100px', fontSize: '1rem' }}
                />
              </div>
            </div>

            <div style={{ flex: 1, minWidth: '200px' }}>
              <label style={{ display: 'block', marginBottom: '0.8rem', fontWeight: 'bold', fontSize: '1.1rem' }}>Tùy chọn trộn:</label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer', padding: '0.5rem', borderRadius: '0.5rem' }}>
                <input type="checkbox" checked={shuffleOptions} onChange={(e) => setShuffleOptions(e.target.checked)} style={{ width: '1.2rem', height: '1.2rem' }} />
                <span style={{ fontWeight: 'bold' }}>Trộn thứ tự đáp án</span>
              </label>
            </div>
          </div>

        </div>
        
        <button className="btn btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1.2rem' }} onClick={startExam}>
          BẮT ĐẦU THI
        </button>
      </div>
    );
  }

  if (examStatus === 'finished') {
    const score = Object.keys(userAnswers).reduce((acc, qId) => {
      const q = examQuestions.find(eq => eq.id === Number(qId));
      return acc + (q?.correct === userAnswers[Number(qId)] ? 1 : 0);
    }, 0);
    const percentage = Math.round((score / examQuestions.length) * 100);
    const scale10 = ((score / examQuestions.length) * 10).toFixed(1);

    return (
      <div className="animate-fade-in delay-100" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div className="glass-panel" style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 className="gradient-text" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Kết quả thi</h2>
          <h1 style={{ fontSize: '4rem', margin: '1rem 0', color: percentage >= 50 ? 'var(--success)' : 'var(--danger)' }}>{scale10}</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Bạn đã đúng {score} / {examQuestions.length} câu ({percentage}%)</p>
          <button className="btn btn-primary" style={{ marginTop: '2rem' }} onClick={() => setExamStatus('setup')}>Thi lại</button>
        </div>

        <h3 style={{ marginBottom: '1rem' }}>Chi tiết các câu sai</h3>
        {examQuestions.map((q, idx) => {
          const uA = userAnswers[q.id];
          const isCorrect = uA === q.correct;
          if (isCorrect) return null;

          return (
            <div key={q.id} className="glass-panel" style={{ marginBottom: '1rem', borderLeft: '4px solid var(--danger)' }}>
              <div style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Câu {idx + 1}</div>
              <h4 style={{ marginBottom: '1rem' }}>{q.question}</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ padding: '0.5rem', borderRadius: '0.5rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)' }}>
                  <strong>Bạn chọn:</strong> {uA ? `${uA}. ${q[uA as keyof Question]}` : 'Không chọn'}
                </div>
                <div style={{ padding: '0.5rem', borderRadius: '0.5rem', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' }}>
                  <strong>Đáp án đúng:</strong> {q.correct}. {q[q.correct as keyof Question]}
                </div>
              </div>
              {q.explanation && (
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                  <strong>Giải thích:</strong> {q.explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="glass-panel" style={{ 
        position: 'sticky', top: '1rem', zIndex: 10, marginBottom: '2rem', 
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '1rem 2rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: timeLeft < 60 ? 'var(--danger)' : 'var(--accent-primary)' }}>
          <Clock />
          <h2 style={{ margin: 0 }}>{formatTime(timeLeft)}</h2>
        </div>
        <button className="btn btn-secondary" onClick={finishExam}>Nộp bài sớm</button>
      </div>

      {examQuestions.map((q, idx) => (
        <div key={q.id} className="glass-panel" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <div style={{ 
              background: userAnswers[q.id] ? 'var(--accent-primary)' : 'var(--bg-secondary)', 
              color: userAnswers[q.id] ? '#fff' : 'var(--text-secondary)',
              padding: '0.2rem 0.8rem', borderRadius: '1rem', fontWeight: 'bold' 
            }}>
              {idx + 1}
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ marginBottom: '1.5rem', lineHeight: '1.5' }}>{q.question}</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {['A', 'B', 'C', 'D'].map(opt => (
                  q[opt as keyof Question] ? (
                    <div 
                      key={opt}
                      onClick={() => setUserAnswers(prev => ({ ...prev, [q.id]: opt }))}
                      style={{ 
                        padding: '1rem', 
                        borderRadius: '0.5rem', 
                        border: `1px solid ${userAnswers[q.id] === opt ? 'var(--accent-primary)' : 'var(--border)'}`,
                        background: userAnswers[q.id] === opt ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      <strong>{opt}.</strong> {q[opt as keyof Question]}
                    </div>
                  ) : null
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
      
      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <button className="btn btn-primary" style={{ padding: '1rem 3rem', fontSize: '1.2rem' }} onClick={finishExam}>Nộp bài</button>
      </div>
    </div>
  );
}
