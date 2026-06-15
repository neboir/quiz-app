import { isItemHighlighted } from './pdfParser';

// Patterns for single-line answer entries (used as question starts / simple answer sheets)
const ANSWER_LINE_PATTERNS = [
  // "1. B" or "1) B" or "1: B"
  /^(\d+)[.):\s]\s*([A-E])\s*$/,
  // "Câu 1: B" or "Câu 1. B" or "Câu 1 - B"
  /^(?:Câu|Question)\s*(\d+)\s*[.:)–-]\s*([A-E])\s*$/i,
  // "Câu 1\nĐáp án: B" handled via multi-line
  /^(\d+)[.)]\s*([A-E])\b/,
];

// Patterns to detect the start of a question block
const QUESTION_START_PATTERNS = [
  /^(?:Câu|Question|Câu hỏi)\s*(\d+)[.:)]\s*(.*)/i,
  /^(\d+)[.)]\s+((?!A[.)]|B[.)]|C[.)]|D[.)]).+)/,
  /^(\d+)\s*[-–]\s+((?!A[.)]|B[.)]|C[.)]|D[.)]).+)/,
];

// Patterns to detect answer options
const OPTION_PATTERNS = [
  /^([A-E])[.)]\s*(.*)/,
  /^([A-E])\s*[-–]\s*(.*)/,
  /^([A-E]):\s*(.*)/,
];

// Patterns to detect text-based answer lines (fallback)
const TEXT_ANSWER_REGEXES = [
  /^(?:Đáp án đúng|Đáp án|Chọn đáp án|Chọn|Key|Answer|Correct)[:\s]+([A-E])\b/i,
  /^(?:Đáp án đúng|Đáp án|Chọn|Key|Answer|Correct)\s+là\s+([A-E])\b/i,
  /^(?:Chọn)\s+([A-E])\b/i,
  /^=>\s*(?:Chọn|Đáp án)\s*([A-E])\b/i,
  /^(?:Đáp án đúng|Đáp án|Chọn|Key|Answer|Correct)[:\s]*([A-E])\s*$/i,
];

// Pattern to detect explanation block start
const EXPLANATION_START_REGEX = /^(?:Giải thích|Lời giải|Giải|Hướng dẫn giải|HD)[:\s]/i;

/**
 * Helper to identify if a line represents the start of a question block
 */
function detectQuestionStart(text) {
  // Check ANSWER_LINE_PATTERNS first (e.g. "1. B" or "Câu 1: B")
  for (const pattern of ANSWER_LINE_PATTERNS) {
    const m = text.match(pattern);
    if (m) {
      return { id: parseInt(m[1]), matchedTextAnswer: m[2].toUpperCase() };
    }
  }
  // Check standard start patterns (e.g. "Câu 1: Cho tam giác...")
  for (const pattern of QUESTION_START_PATTERNS) {
    const m = text.match(pattern);
    if (m) {
      return { id: parseInt(m[1]), matchedTextAnswer: null };
    }
  }
  return null;
}

/**
 * Parse raw answer data (either structured PDF data or plain text)
 * into a map of { questionId -> { correctAnswer, explanation } }
 *
 * @param {object|string} pdfDataOrText - PDF rich data from extractPDFData or raw text string
 * @returns {{ answers: Map<number, {correctAnswer: string, explanation: string}>, warnings: Array }}
 */
export function parseAnswers(pdfDataOrText) {
  let pages = [];
  
  if (typeof pdfDataOrText === 'string') {
    // Fallback: convert plain text into a dummy page structure
    pages = [{
      pageNum: 1,
      lines: pdfDataOrText.split('\n').map(l => ({ text: l, items: [], y: 0 })),
      yellowRects: []
    }];
  } else if (pdfDataOrText && typeof pdfDataOrText === 'object') {
    pages = pdfDataOrText.pages || [];
  }

  const answers = new Map();
  const warnings = [];

  // Flatten all lines across pages with page reference and yellowRects
  const allLines = [];
  for (const page of pages) {
    const yellowRects = page.yellowRects || [];
    for (const line of page.lines) {
      allLines.push({
        text: line.text,
        lineObj: line,
        pageNum: page.pageNum,
        yellowRects,
      });
    }
  }

  // Filter out empty lines
  const activeLines = allLines.filter(l => l.text.trim().length > 0);

  // Group lines into question blocks
  const blocks = [];
  let currentBlock = null;

  for (let i = 0; i < activeLines.length; i++) {
    const line = activeLines[i];
    const text = line.text.trim();

    const startInfo = detectQuestionStart(text);
    if (startInfo) {
      if (currentBlock) {
        blocks.push(currentBlock);
      }
      currentBlock = {
        id: startInfo.id,
        initialAnswer: startInfo.matchedTextAnswer,
        lines: [line],
      };
    } else {
      if (currentBlock) {
        currentBlock.lines.push(line);
      }
    }
  }
  if (currentBlock) {
    blocks.push(currentBlock);
  }

  // Parse each question block
  for (const block of blocks) {
    const qId = block.id;
    let detectedHighlightAnswer = null;
    let detectedTextAnswer = block.initialAnswer;
    let explanationLines = [];
    let isParsingExplanation = false;

    for (let j = 0; j < block.lines.length; j++) {
      const line = block.lines[j];
      const text = line.text.trim();

      // If we are already parsing explanation, gather all text lines
      if (isParsingExplanation) {
        explanationLines.push(text);
        continue;
      }

      // Check if this line starts the explanation section
      if (EXPLANATION_START_REGEX.test(text)) {
        isParsingExplanation = true;
        const restOfLine = text.replace(EXPLANATION_START_REGEX, '').trim();
        if (restOfLine.length > 0) {
          explanationLines.push(restOfLine);
        }
        continue;
      }

      // If not the first line, check if it defines the text answer (e.g. "Đáp án đúng: D")
      if (j > 0) {
        let matchedTextAns = false;
        for (const regex of TEXT_ANSWER_REGEXES) {
          const m = text.match(regex);
          if (m) {
            detectedTextAnswer = m[1].toUpperCase();
            matchedTextAns = true;
            break;
          }
        }
        if (matchedTextAns) {
          continue;
        }
      }

      // Check for yellow highlight on options in this line
      const lineObj = line.lineObj;
      const yellowRects = line.yellowRects;
      
      // Determine if it is an option line or contains option letters
      let isOptLine = false;
      for (const pattern of OPTION_PATTERNS) {
        if (pattern.test(text)) {
          isOptLine = true;
          break;
        }
      }

      if (isOptLine && lineObj && lineObj.items && yellowRects && yellowRects.length > 0) {
        let currentOption = null;
        for (const item of lineObj.items) {
          const itemText = item.str.trim();

          // Match option prefix (e.g., "A.", "A)", or "A")
          const optLetterMatch = itemText.match(/^([A-E])[.)\s-]*$/i);
          if (optLetterMatch) {
            currentOption = optLetterMatch[1].toUpperCase();
          } else {
            const optLetterMatch2 = itemText.match(/^([A-E])[.)\s-]/i);
            if (optLetterMatch2) {
              currentOption = optLetterMatch2[1].toUpperCase();
            }
          }

          if (currentOption && isItemHighlighted(item, yellowRects)) {
            detectedHighlightAnswer = currentOption;
          }
        }
      } else if (lineObj && lineObj.items && yellowRects && yellowRects.length > 0) {
        // Fallback: check if any highlighted item itself contains/is an option letter A-E
        for (const item of lineObj.items) {
          if (isItemHighlighted(item, yellowRects)) {
            const cleanStr = item.str.trim();
            const letterMatch = cleanStr.match(/^([A-E])[.)]?$/i);
            if (letterMatch) {
              detectedHighlightAnswer = letterMatch[1].toUpperCase();
            }
          }
        }
      }
    }

    // Resolve final correct answer
    let finalAnswer = null;
    if (detectedHighlightAnswer && detectedTextAnswer) {
      finalAnswer = detectedHighlightAnswer;
      if (detectedHighlightAnswer !== detectedTextAnswer) {
        warnings.push(
          `⚠️ Câu ${qId}: Đáp án tô vàng (${detectedHighlightAnswer}) khác với dòng 'Đáp án đúng' (${detectedTextAnswer})`
        );
      }
    } else if (detectedHighlightAnswer) {
      finalAnswer = detectedHighlightAnswer;
    } else if (detectedTextAnswer) {
      finalAnswer = detectedTextAnswer;
    }

    if (answers.has(qId)) {
      warnings.push(`⚠️ Trùng đáp án cho câu ${qId}`);
    }

    const explanation = explanationLines.join('\n').trim();

    answers.set(qId, {
      correctAnswer: finalAnswer,
      explanation,
    });
  }

  return { answers, warnings };
}
