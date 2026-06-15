/**
 * Export results to PDF and Excel
 */
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { formatDuration } from './scorer';

export function exportToPDF(result, examTitle = 'Kết quả thi') {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 15;
  let y = 20;

  const addLine = (text, size = 11, style = 'normal', color = [30, 30, 30]) => {
    doc.setFontSize(size);
    doc.setFont('helvetica', style);
    doc.setTextColor(...color);
    const lines = doc.splitTextToSize(text, pageW - margin * 2);
    lines.forEach(line => {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.text(line, margin, y);
      y += size * 0.5 + 1;
    });
    y += 2;
  };

  const addSeparator = () => {
    if (y > 270) { doc.addPage(); y = 20; }
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, y, pageW - margin, y);
    y += 5;
  };

  // Header
  addLine(examTitle, 18, 'bold', [30, 80, 200]);
  addLine(`Ngày thi: ${new Date().toLocaleDateString('vi-VN')}`, 10, 'normal', [100, 100, 100]);
  addSeparator();

  // Summary
  addLine('TỔNG KẾT', 13, 'bold');
  addLine(`Điểm: ${result.score10}/10`);
  addLine(`Tỷ lệ đúng: ${result.percentage}%`);
  addLine(`Câu đúng: ${result.correct}/${result.total}`);
  addLine(`Câu sai: ${result.wrong}/${result.total}`);
  addLine(`Câu bỏ trống: ${result.blank}/${result.total}`);
  addLine(`Thời gian làm bài: ${formatDuration(result.timeUsed)}`);
  addSeparator();

  // Wrong & blank
  if (result.wrongAndBlank.length > 0) {
    addLine('CÁC CÂU CẦN XEM LẠI', 13, 'bold', [200, 50, 50]);
    for (const q of result.wrongAndBlank) {
      if (y > 265) { doc.addPage(); y = 20; }
      addLine(`Câu ${q.id}: ${q.question}`, 10, 'bold');
      addLine(`Bạn chọn: ${q.userAnswer || '(bỏ trống)'}`, 10, 'normal', [180, 50, 50]);
      addLine(`Đáp án đúng: ${q.correctAnswer}`, 10, 'normal', [30, 150, 60]);
      if (q.explanation) {
        addLine(`Lời giải: ${q.explanation}`, 9, 'italic', [80, 80, 80]);
      }
      y += 2;
    }
  }

  doc.save(`${examTitle.replace(/\s+/g, '_')}_ketqua.pdf`);
}

export function exportToExcel(result, examTitle = 'Kết quả thi') {
  const wb = XLSX.utils.book_new();

  // Summary sheet
  const summaryData = [
    ['Tiêu đề đề thi', examTitle],
    ['Ngày thi', new Date().toLocaleDateString('vi-VN')],
    ['Điểm', `${result.score10}/10`],
    ['Tỷ lệ đúng (%)', result.percentage],
    ['Câu đúng', result.correct],
    ['Câu sai', result.wrong],
    ['Câu bỏ trống', result.blank],
    ['Tổng câu', result.total],
    ['Thời gian làm bài', formatDuration(result.timeUsed)],
  ];
  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Tổng kết');

  // Wrong/blank sheet
  const wrongData = [
    ['STT', 'Câu hỏi', 'Bạn chọn', 'Đáp án đúng', 'Kết quả', 'Lời giải'],
    ...result.wrongAndBlank.map(q => [
      q.id,
      q.question,
      q.userAnswer || '(bỏ trống)',
      q.correctAnswer,
      q.status === 'blank' ? 'Bỏ trống' : 'Sai',
      q.explanation || '',
    ]),
  ];
  const wsWrong = XLSX.utils.aoa_to_sheet(wrongData);
  XLSX.utils.book_append_sheet(wb, wsWrong, 'Câu sai & bỏ trống');

  XLSX.writeFile(wb, `${examTitle.replace(/\s+/g, '_')}_ketqua.xlsx`);
}
