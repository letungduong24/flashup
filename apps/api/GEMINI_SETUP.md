# Hướng dẫn tích hợp Google Gemini API

## Bước 1: Lấy API Key từ Google AI Studio

1. Truy cập [Google AI Studio](https://aistudio.google.com/)
2. Đăng nhập bằng tài khoản Google của bạn
3. Click vào "Get API key" hoặc vào phần "API Keys"
4. Tạo API key mới (nếu chưa có)
5. Copy API key

## Bước 2: Cấu hình API Key

Thêm biến môi trường `GEMINI_API_KEY` vào file `.env` trong thư mục `apps/api`:

```env
GEMINI_API_KEY=your_api_key_here
```

## Bước 3: Sử dụng

Sau khi cấu hình xong, bạn có thể sử dụng chức năng tự động tạo flashcard:

1. Mở modal tạo flashcard mới
2. Nhập từ cần tạo flashcard
3. Click nút "Tự động tạo từ AI" (sẽ xuất hiện khi bạn nhập từ)
4. Hệ thống sẽ tự động:
   - Tạo nghĩa tiếng Việt
   - Tạo các ví dụ cách dùng
   - Tạo tags liên quan
   - Lấy audio từ Cambridge Dictionary (nếu có)

## Lưu ý

- API key miễn phí có giới hạn số lượng request mỗi phút
- Model sử dụng: `gemini-1.5-flash` (model nhanh và miễn phí)
- Nếu không có API key, chức năng này sẽ không hoạt động

