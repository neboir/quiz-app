import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { BookOpen, Brain, Target, RefreshCw, PenTool } from 'lucide-react';
import { TutorProvider } from './context/TutorContext';

// Placeholders for pages
import Dashboard from './pages/Dashboard';
import Practice from './pages/Practice';
import MockExam from './pages/MockExam';
import Review from './pages/Review';
import Mistakes from './pages/Mistakes';

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-container">
      <nav className="glass-panel" style={{ marginBottom: '2rem', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Brain className="gradient-text" size={32} />
          <h2 className="gradient-text" style={{ margin: 0 }}>TutorAI</h2>
        </Link>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <Link to="/practice" className="nav-link"><PenTool size={18}/> Luyện tập</Link>
          <Link to="/exam" className="nav-link"><Target size={18}/> Thi thử</Link>
          <Link to="/review" className="nav-link"><BookOpen size={18}/> Ôn tập</Link>
          <Link to="/mistakes" className="nav-link"><RefreshCw size={18}/> Học từ câu sai</Link>
        </div>
      </nav>
      <main>
        {children}
      </main>
      
      <style>{`
        .nav-link {
          color: var(--text-secondary);
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 500;
          transition: color 0.2s;
        }
        .nav-link:hover {
          color: var(--text-primary);
        }
      `}</style>
    </div>
  );
}

function App() {
  return (
    <TutorProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/practice" element={<Practice />} />
            <Route path="/exam" element={<MockExam />} />
            <Route path="/review" element={<Review />} />
            <Route path="/mistakes" element={<Mistakes />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TutorProvider>
  );
}

export default App;
