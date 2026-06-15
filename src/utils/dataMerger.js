/**
 * Merge questions and answers into complete question bank
 * with validation and detailed warnings
 */

/**
 * @param {Array} questions - from questionParser
 * @param {Map} answers - from answerParser
 * @returns {{ bank: Array, warnings: Array }}
 */
export function mergeData(questions, answers) {
  const warnings = [];
  const bank = [];

  const answerIds = new Set(answers.keys());
  const questionIds = new Set(questions.map(q => q.id));

  // Check for questions missing answers
  for (const q of questions) {
    if (!answerIds.has(q.id)) {
      warnings.push(`⚠️ Câu ${q.id}: Không tìm thấy đáp án tương ứng`);
    }
  }

  // Check for answers missing questions
  for (const id of answerIds) {
    if (!questionIds.has(id)) {
      warnings.push(`⚠️ Đáp án câu ${id}: Không tìm thấy câu hỏi tương ứng`);
    }
  }

  // Check total count mismatch
  if (questions.length !== answers.size) {
    warnings.push(
      `⚠️ Lệch số lượng: ${questions.length} câu hỏi nhưng ${answers.size} đáp án`
    );
  }

  // Merge
  for (const q of questions) {
    const ans = answers.get(q.id);
    bank.push({
      id: q.id,
      question: q.question,
      options: q.options,
      correctAnswer: ans ? ans.correctAnswer : null,
      explanation: ans ? ans.explanation : '',
    });
  }

  return { bank, warnings };
}

/**
 * Validate a completed question bank entry
 */
export function validateBank(bank) {
  const errors = [];
  for (const q of bank) {
    if (!q.question) errors.push(`Câu ${q.id}: Thiếu nội dung`);
    if (Object.keys(q.options).length < 2) errors.push(`Câu ${q.id}: Thiếu đáp án`);
    if (!q.correctAnswer) errors.push(`Câu ${q.id}: Thiếu đáp án đúng`);
    if (q.correctAnswer && !q.options[q.correctAnswer]) {
      errors.push(`Câu ${q.id}: Đáp án đúng "${q.correctAnswer}" không tồn tại trong danh sách`);
    }
  }
  return errors;
}
