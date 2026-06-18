import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import questionsData from '../data/questions.json';

export interface Question {
  id: number;
  chapter: string;
  question: string;
  A: string;
  B: string;
  C: string;
  D: string;
  correct: string;
  explanation: string;
}

interface Stats {
  totalAnswered: number;
  totalCorrect: number;
}

interface TutorContextType {
  questions: Question[];
  wrongQuestions: number[]; // Store IDs of wrong questions
  stats: Stats;
  markQuestionWrong: (id: number) => void;
  markQuestionCorrect: (id: number) => void;
  updateStats: (correct: number, total: number) => void;
  getPredictedScore: () => number;
  getCompetenceLevel: () => string;
}

const TutorContext = createContext<TutorContextType | undefined>(undefined);

export function TutorProvider({ children }: { children: ReactNode }) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [wrongQuestions, setWrongQuestions] = useState<number[]>([]);
  const [stats, setStats] = useState<Stats>({ totalAnswered: 0, totalCorrect: 0 });

  useEffect(() => {
    // Load from local JSON
    setQuestions(questionsData as Question[]);
    
    // Load state from localStorage
    const savedWrong = localStorage.getItem('tutor_wrong_questions');
    const savedStats = localStorage.getItem('tutor_stats');
    if (savedWrong) setWrongQuestions(JSON.parse(savedWrong));
    if (savedStats) setStats(JSON.parse(savedStats));
  }, []);

  const markQuestionWrong = (id: number) => {
    setWrongQuestions(prev => {
      const newArray = prev.includes(id) ? prev : [...prev, id];
      localStorage.setItem('tutor_wrong_questions', JSON.stringify(newArray));
      return newArray;
    });
  };

  const markQuestionCorrect = (id: number) => {
    setWrongQuestions(prev => {
      const newArray = prev.filter(qId => qId !== id);
      localStorage.setItem('tutor_wrong_questions', JSON.stringify(newArray));
      return newArray;
    });
  };

  const updateStats = (correct: number, total: number) => {
    setStats(prev => {
      const newStats = {
        totalAnswered: prev.totalAnswered + total,
        totalCorrect: prev.totalCorrect + correct,
      };
      localStorage.setItem('tutor_stats', JSON.stringify(newStats));
      return newStats;
    });
  };

  const getPredictedScore = () => {
    if (stats.totalAnswered === 0) return 0;
    const accuracy = stats.totalCorrect / stats.totalAnswered;
    return Number((accuracy * 10).toFixed(1)); // Scale to 10 points
  };

  const getCompetenceLevel = () => {
    const score = getPredictedScore();
    if (stats.totalAnswered < 10) return "Cần làm thêm bài tập để đánh giá";
    if (score >= 8.5) return "Giỏi - Kiến thức vững vàng";
    if (score >= 7) return "Khá - Nắm được cơ bản nhưng cần luyện thêm";
    if (score >= 5) return "Trung bình - Còn hổng nhiều kiến thức";
    return "Yếu - Cần ôn tập lại từ đầu";
  };

  return (
    <TutorContext.Provider value={{
      questions,
      wrongQuestions,
      stats,
      markQuestionWrong,
      markQuestionCorrect,
      updateStats,
      getPredictedScore,
      getCompetenceLevel
    }}>
      {children}
    </TutorContext.Provider>
  );
}

export function useTutor() {
  const context = useContext(TutorContext);
  if (context === undefined) {
    throw new Error('useTutor must be used within a TutorProvider');
  }
  return context;
}
