/**
 * Parse questions from extracted PDF text
 * Supports multiple Vietnamese/English question formats
 */

// Patterns to detect the start of a question
const QUESTION_START_PATTERNS = [
  /^(?:Câu|Question|Câu hỏi)\s*(\d+)[.:)]\s*(.*)/i,
  /^(\d+)[.)]\s+((?!A[.)]|B[.)]|C[.)]|D[.)]).+)/,
  /^(\d+)\s*[-–]\s+((?!A[.)]|B[.)]|C[.)]|D[.)]).+)/,
];

// Patterns to detect answer options
const OPTION_PATTERNS = [
  /^([A-E])[.)]\s+(.*)/,
  /^([A-E])\s*[-–]\s+(.*)/,
  /^([A-E]):\s+(.*)/,
];

/**
 * Parse raw text into array of question objects
 * @param {string} text - Raw text from PDF
 * @returns {{ questions: Array, warnings: Array }}
 */
export function parseQuestions(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const questions = [];
  const warnings = [];

  let currentQuestion = null;
  let currentOption = null;
  let questionText = [];
  let optionText = [];

  const finalizeOption = () => {
    if (currentOption && optionText.length > 0 && currentQuestion) {
      currentQuestion.options[currentOption] = optionText.join(' ').trim();
      currentOption = null;
      optionText = [];
    }
  };

  const finalizeQuestion = () => {
    finalizeOption();
    if (currentQuestion) {
      currentQuestion.question = questionText.join(' ').trim();
      if (currentQuestion.question) {
        questions.push(currentQuestion);
      }
      currentQuestion = null;
      questionText = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check if this line starts a new question
    let questionMatch = null;
    for (const pattern of QUESTION_START_PATTERNS) {
      const m = line.match(pattern);
      if (m) {
        questionMatch = m;
        break;
      }
    }

    if (questionMatch) {
      finalizeQuestion();
      const qNum = parseInt(questionMatch[1]);
      const qText = questionMatch[2] || '';
      currentQuestion = {
        id: qNum,
        question: '',
        options: {},
        correctAnswer: null,
        explanation: '',
      };
      questionText = qText ? [qText] : [];
      continue;
    }

    // Check if this line starts an answer option
    let optionMatch = null;
    for (const pattern of OPTION_PATTERNS) {
      const m = line.match(pattern);
      if (m) {
        optionMatch = m;
        break;
      }
    }

    if (optionMatch && currentQuestion) {
      finalizeOption();
      currentOption = optionMatch[1].toUpperCase();
      optionText = optionMatch[2] ? [optionMatch[2]] : [];
      continue;
    }

    // Continuation of current option or question text
    if (currentOption && currentQuestion) {
      optionText.push(line);
    } else if (currentQuestion) {
      questionText.push(line);
    }
  }

  finalizeQuestion();

  // Validation
  const seenIds = new Set();
  for (const q of questions) {
    if (seenIds.has(q.id)) {
      warnings.push(`⚠️ Trùng số thứ tự câu ${q.id}`);
    }
    seenIds.add(q.id);

    const optCount = Object.keys(q.options).length;
    if (optCount < 2) {
      warnings.push(`⚠️ Câu ${q.id} có ít hơn 2 đáp án (tìm thấy ${optCount})`);
    }
    if (!q.question) {
      warnings.push(`⚠️ Câu ${q.id} thiếu nội dung câu hỏi`);
    }
  }

  // Sort by id
  questions.sort((a, b) => a.id - b.id);

  return { questions, warnings };
}
