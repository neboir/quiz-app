import * as pdfjsLib from 'pdfjs-dist';

// Set worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

/* ============================================================
   COLOUR HELPERS
   ============================================================ */

/**
 * Decide whether a PDF annotation colour is "yellow"
 * PDF.js returns colour as { r, g, b } with values 0-255,
 * or as an array [r, g, b].
 */
function isYellow(color) {
  if (!color) return false;
  const r = color.r ?? color[0] ?? 0;
  const g = color.g ?? color[1] ?? 0;
  const b = color.b ?? color[2] ?? 255;
  // Yellow: high red, high green, low blue
  // Allow for slight tone variations (pale yellow, gold…)
  return r > 180 && g > 170 && b < 110;
}

/* ============================================================
   BOUNDING BOX HELPERS
   ============================================================ */

/**
 * Get the bounding box of a text item in PDF user space.
 * item.transform = [scaleX, skewY, skewX, scaleY, tx, ty]
 */
function getItemBBox(item) {
  const [, , , scaleY, tx, ty] = item.transform;
  const h = item.height || Math.abs(scaleY) || 12;
  return {
    x1: tx,
    y1: ty,
    x2: tx + Math.abs(item.width),
    y2: ty + h,
  };
}

/**
 * Check whether two rectangles overlap.
 * rect can be a 4-element array [x1,y1,x2,y2] (PDF.js annotation format).
 */
function overlaps(bbox, rect) {
  const [rx1, ry1, rx2, ry2] = rect;
  // Normalise rect in case order is reversed
  const rMinX = Math.min(rx1, rx2);
  const rMaxX = Math.max(rx1, rx2);
  const rMinY = Math.min(ry1, ry2);
  const rMaxY = Math.max(ry1, ry2);
  return (
    bbox.x1 < rMaxX &&
    bbox.x2 > rMinX &&
    bbox.y1 < rMaxY &&
    bbox.y2 > rMinY
  );
}

/* ============================================================
   LINE BUILDER
   ============================================================ */

/**
 * Group PDF text items into logical lines by Y proximity.
 * Returns an array of line objects:
 *   { text: string, y: number, items: textItem[] }
 */
function buildLines(items, yThreshold = 4) {
  if (!items.length) return [];

  // Sort top-to-bottom (descending Y in PDF space)
  const sorted = [...items].sort((a, b) => b.transform[5] - a.transform[5]);

  const lines = [];
  let curLine = [sorted[0]];
  let curY = sorted[0].transform[5];

  for (let i = 1; i < sorted.length; i++) {
    const y = sorted[i].transform[5];
    if (Math.abs(y - curY) <= yThreshold) {
      curLine.push(sorted[i]);
    } else {
      lines.push(curLine);
      curLine = [sorted[i]];
      curY = y;
    }
  }
  if (curLine.length) lines.push(curLine);

  return lines.map(lineItems => {
    // Sort left-to-right within a line
    lineItems.sort((a, b) => a.transform[4] - b.transform[4]);
    return {
      text: lineItems.map(i => i.str).join(' ').trim(),
      y: lineItems[0].transform[5],
      items: lineItems,
    };
  });
}

/* ============================================================
   PUBLIC: extractTextFromPDF  (backward-compat, plain text)
   ============================================================ */
export async function extractTextFromPDF(file) {
  const data = await extractPDFData(file);
  return data.pages.map(p => p.lines.map(l => l.text).join('\n')).join('\n');
}

/* ============================================================
   PUBLIC: extractPDFData  (rich data including highlights)
   ============================================================ */

/**
 * Extract structured data from a PDF file.
 *
 * Returns:
 * {
 *   pages: [
 *     {
 *       pageNum: number,
 *       lines: [{ text, y, items }],
 *       yellowRects: number[][]   // [[x1,y1,x2,y2], ...]
 *     }
 *   ],
 *   fullText: string
 * }
 */
export async function extractPDFData(file) {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  const pages = [];

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);

    // ── Text content ────────────────────────────────────────
    const textContent = await page.getTextContent();
    const lines = buildLines(textContent.items);

    // ── Annotations (highlight rectangles) ──────────────────
    let yellowRects = [];
    try {
      const annotations = await page.getAnnotations();
      for (const ann of annotations) {
        if (ann.subtype === 'Highlight' && isYellow(ann.color)) {
          // ann.rect is [x1,y1,x2,y2]; quadPoints gives finer control
          if (ann.quadPoints && ann.quadPoints.length >= 8) {
            // Each set of 8 values = one quad: [x1,y1,x2,y2,x3,y3,x4,y4]
            for (let q = 0; q < ann.quadPoints.length; q += 8) {
              const qp = ann.quadPoints;
              const minX = Math.min(qp[q], qp[q+2], qp[q+4], qp[q+6]);
              const maxX = Math.max(qp[q], qp[q+2], qp[q+4], qp[q+6]);
              const minY = Math.min(qp[q+1], qp[q+3], qp[q+5], qp[q+7]);
              const maxY = Math.max(qp[q+1], qp[q+3], qp[q+5], qp[q+7]);
              yellowRects.push([minX, minY, maxX, maxY]);
            }
          } else if (ann.rect) {
            yellowRects.push(ann.rect);
          }
        }
      }
    } catch {
      // Some PDFs don't expose annotations — silently ignore
    }

    pages.push({ pageNum, lines, yellowRects });
  }

  const fullText = pages
    .map(p => p.lines.map(l => l.text).join('\n'))
    .join('\n');

  return { pages, fullText };
}

/* ============================================================
   PUBLIC: isItemHighlighted
   Check whether a given text item falls inside any yellow rect.
   ============================================================ */
export function isItemHighlighted(item, yellowRects) {
  if (!yellowRects || !yellowRects.length) return false;
  const bbox = getItemBBox(item);
  return yellowRects.some(rect => overlaps(bbox, rect));
}

/**
 * Given a line object and the page's yellowRects,
 * return true if the majority of character-width in the line is highlighted.
 */
export function isLineHighlighted(line, yellowRects) {
  if (!yellowRects || !yellowRects.length || !line.items.length) return false;
  let highlighted = 0;
  let total = 0;
  for (const item of line.items) {
    const w = Math.abs(item.width) || 1;
    total += w;
    if (isItemHighlighted(item, yellowRects)) highlighted += w;
  }
  return total > 0 && highlighted / total > 0.3; // >30% width highlighted
}
