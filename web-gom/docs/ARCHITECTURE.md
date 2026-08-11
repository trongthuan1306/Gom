# Kiến trúc MVP

- Frontend React gọi REST API, chỉ giữ access token trong bộ nhớ khi tích hợp auth ở giai đoạn tiếp theo.
- Backend Spring Boot là ranh giới tin cậy: xác thực JWT, RBAC CUSTOMER/STAFF/ADMIN, kiểm tra giá và tồn kho.
- PostgreSQL lưu người dùng, catalog, đơn hàng, thanh toán và refresh token đã băm.
- Gemini chỉ nhận lịch sử chat giới hạn cùng catalog rút gọn. Kết quả JSON được backend kiểm tra lại với database.
- SMTP và VNPAY được gọi từ backend. Secret chỉ đến từ biến môi trường.

SRS: tại thời điểm khởi tạo, thư mục gốc không có file SRS. Tài liệu này phản ánh yêu cầu trực tiếp trong brief và cần được rà soát lại khi SRS được bổ sung.
