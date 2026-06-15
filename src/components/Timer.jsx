import { useEffect, useCallback } from 'react';
import './Timer.css';
import { formatTime } from '../utils/scorer';

export default function Timer({ secondsLeft, onExpire, isWarning }) {
  useEffect(() => {
    if (secondsLeft <= 0 && onExpire) {
      onExpire();
    }
  }, [secondsLeft, onExpire]);

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const warning = secondsLeft <= 600 && secondsLeft > 0; // < 10 min
  const critical = secondsLeft <= 60; // < 1 min

  return (
    <div className={`timer ${warning ? 'timer-warning' : ''} ${critical ? 'timer-critical' : ''}`}>
      <svg className="timer-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
        <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
      <span className="timer-display">
        {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
      </span>
      {warning && !critical && (
        <span className="timer-label">Còn ít thời gian!</span>
      )}
      {critical && (
        <span className="timer-label timer-label-critical">Sắp hết giờ!</span>
      )}
    </div>
  );
}
