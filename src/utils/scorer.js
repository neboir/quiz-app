/**
 * Scoring logic
 */

/**
 * Score a completed exam
 * @param {Array} questions - Array of question objects
 * @param {Object} userAnswers - { [questionId]: selectedOption }
 * @param {number} timeUsed - seconds used
 * @returns {Object} result object
 */
export function scoreExam(questions, userAnswers, timeUsed) {
  let correct = 0;
  let wrong = 0;
  let blank = 0;

  const questionResults = questions.map(q => {
    const userAnswer = userAnswers[q.id];
    let status;

    if (!userAnswer) {
      status = 'blank';
      blank++;
    } else if (userAnswer === q.correctAnswer) {
      status = 'correct';
      correct++;
    } else {
      status = 'wrong';
      wrong++;
    }

    return {
      id: q.id,
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
      userAnswer: userAnswer || null,
      explanation: q.explanation,
      status,
    };
  });

  const total = questions.length;
  const score10 = total > 0 ? Math.round((correct / total) * 100) / 10 : 0;
  const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;

  return {
    total,
    correct,
    wrong,
    blank,
    score10: parseFloat(score10.toFixed(1)),
    percentage,
    timeUsed,
    questionResults,
    wrongAndBlank: questionResults.filter(r => r.status !== 'correct'),
  };
}

export function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function formatDuration(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}
