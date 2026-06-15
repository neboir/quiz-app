/**
 * Shuffle questions and/or answer options
 */

function seededRandom(seed) {
  let s = seed;
  return function () {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function shuffleArray(arr, rng) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Shuffle the quiz
 * @param {Array} bank - Original question bank
 * @param {object} opts - { shuffleQuestions, shuffleOptions }
 * @returns {Array} - Shuffled quiz (original bank untouched)
 */
export function shuffleQuiz(bank, { shuffleQuestions = false, shuffleOptions = false } = {}) {
  const seed = Date.now();
  const rng = seededRandom(seed);

  let questions = bank.map(q => ({ ...q, options: { ...q.options } }));

  if (shuffleOptions) {
    questions = questions.map(q => {
      const optKeys = shuffleArray(Object.keys(q.options), seededRandom(rng() * 1e9));
      const newOptions = {};
      const keyMap = {}; // old key -> new key
      optKeys.forEach((oldKey, idx) => {
        const newKey = String.fromCharCode(65 + idx); // A, B, C...
        newOptions[newKey] = q.options[oldKey];
        keyMap[oldKey] = newKey;
      });
      return {
        ...q,
        options: newOptions,
        correctAnswer: keyMap[q.correctAnswer] || q.correctAnswer,
        _optionKeyMap: keyMap,
      };
    });
  }

  if (shuffleQuestions) {
    questions = shuffleArray(questions, seededRandom(rng() * 1e9));
  }

  return questions;
}
