# 📚 QuizPro - Hệ Thống Tạo Đề Thi Trắc Nghiệm Triết Học

QuizPro là một website hỗ trợ tự động chuyển đổi **đề thi trắc nghiệm môn Triết học Mác – Lênin và Kinh tế chính trị Mác – Lênin** từ file PDF thành bài thi online tương tác.

Người dùng chỉ cần tải lên:
- 📄 File PDF đề thi (chứa câu hỏi và các phương án A, B, C, D).
- 📄 File PDF đáp án và lời giải.

Hệ thống sẽ tự động phân tích, tạo ngân hàng câu hỏi và cho phép làm bài thi ngay trên trình duyệt.

---

## 🚀 Tính Năng Chính

### 📂 Tải Lên Đề Thi

Hỗ trợ 2 loại file PDF:

**1. PDF đề thi**
- Chứa nội dung câu hỏi.
- Bao gồm các đáp án lựa chọn:
  - A
  - B
  - C
  - D
- Không chứa đáp án đúng.

Ví dụ:

```
Câu 1: Phương pháp luận của triết học Mác – Lênin là gì?

A. Chủ nghĩa duy tâm
B. Chủ nghĩa duy vật biện chứng
C. Thuyết bất khả tri
D. Chủ nghĩa siêu hình
```

---

**2. PDF đáp án + lời giải**

Chứa:
- Đáp án đúng của từng câu.
- Giải thích chi tiết.

Ví dụ:

```
Câu 1

Đáp án đúng: B

Giải thích:
Triết học Mác – Lênin lấy chủ nghĩa duy vật biện chứng làm nền tảng phương pháp luận.
```

---

## 🔍 Phân Tích PDF Tự Động

Sau khi tải lên:

- Tự động đọc nội dung PDF.
- Nhận diện từng câu hỏi.
- Tách các phương án A, B, C, D.
- Ghép đáp án theo số thứ tự câu.
- Tách phần lời giải.
- Tạo ngân hàng câu hỏi hoàn chỉnh.

Cấu trúc dữ liệu:

```json
{
  "id": 1,
  "question": "Nội dung câu hỏi",
  "options": {
    "A": "...",
    "B": "...",
    "C": "...",
    "D": "..."
  },
  "correctAnswer": "B",
  "explanation": "Lời giải chi tiết"
}
```

---

## 📝 Chế Độ Làm Bài Thi

Giao diện thi trực tiếp trên trình duyệt với các chức năng:

- Chọn đáp án bằng một cú click.
- Chuyển câu trước / câu tiếp theo.
- Đánh dấu câu cần xem lại.
- Thanh điều hướng danh sách câu hỏi.
- Đồng hồ đếm thời gian làm bài.
- Tự động lưu tiến trình làm bài.

---

## 📊 Kết Quả Sau Khi Nộp Bài

Sau khi hoàn thành bài thi, hệ thống sẽ hiển thị:

- ✅ Điểm số.
- 📈 Tỷ lệ hoàn thành.
- ✔️ Số câu trả lời đúng.
- ❌ Số câu trả lời sai.
- ⏱️ Thời gian làm bài.

---

## 📖 Phân Tích Lỗi Sai

Để tránh lộ toàn bộ đáp án của đề thi:

- ❌ Không hiển thị lại tất cả đáp án.
- ❌ Không hiển thị lời giải của các câu làm đúng.

Hệ thống chỉ hiển thị:

### Các câu cần xem lại

Bao gồm:
- Những câu trả lời sai.
- Những câu chưa trả lời.

Với mỗi câu sẽ hiển thị:

- Câu hỏi.
- Đáp án bạn đã chọn.
- Đáp án đúng.
- Giải thích chi tiết.

---

## 🌙 Giao Diện

Hỗ trợ:

- 🌞 Light Mode.
- 🌙 Dark Mode.
- 📱 Responsive trên điện thoại.
- 💻 Tối ưu trên máy tính.

---

## 🔒 Bảo Mật Đáp Án

Để đảm bảo tính công bằng khi luyện tập:

- Không hiển thị toàn bộ đáp án sau khi thi.
- Chỉ cho xem lời giải ở các câu sai.
- Dữ liệu đáp án được xử lý riêng với đề thi.

---

## 🛠 Công Nghệ Sử Dụng

- HTML5
- CSS3
- JavaScript
- PDF.js
- LocalStorage

---

## ⚠️ Giới Hạn Hiện Tại

Phiên bản hiện tại chỉ hỗ trợ:

- ✅ Môn Triết học Mác – Lênin.
- ✅ Kinh tế chính trị Mác – Lênin.
- ✅ Đề trắc nghiệm 4 lựa chọn A/B/C/D.
- ✅ File PDF đề thi và PDF đáp án.

Chưa hỗ trợ:

- ❌ Đề Toán có công thức phức tạp.
- ❌ Hình ảnh, đồ thị, bảng biểu.
- ❌ Đề đúng/sai hoặc trả lời ngắn.
- ❌ Các môn THPT khác.

---

## 📌 Mục Tiêu

QuizPro được xây dựng với mục tiêu hỗ trợ sinh viên ôn tập các môn lý luận chính trị một cách nhanh chóng, trực quan và hiệu quả thông qua hình thức thi trắc nghiệm online.

---

## 📄 Giấy Phép

Dự án được phát triển phục vụ mục đích học tập và nghiên cứu.
