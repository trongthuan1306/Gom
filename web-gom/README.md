# Web Gốm

Website bán đồ gốm full-stack, khởi tạo theo React/Vite/Tailwind CSS, Spring Boot/Security/JWT và PostgreSQL. MVP chuẩn bị sẵn ranh giới tích hợp Gemini, SMTP và VNPAY; không có secret thật trong source.

## Cấu trúc

```text
web-gom/
├── frontend/   React + Vite + Tailwind CSS
├── backend/    Spring Boot phân lớp
├── database/   schema, seed và Flyway migrations
├── docs/       tài liệu kiến trúc
├── scripts/    script hỗ trợ phát triển
├── docker-compose.yml
├── .gitignore
└── README.md
```

## Yêu cầu

- Node.js 20+ và npm
- Java 21
- Docker Desktop (khuyến nghị cho PostgreSQL/Mailpit)

## Chạy PostgreSQL và SMTP thử nghiệm

```powershell
cd web-gom
docker compose up -d postgres mailpit
```

PostgreSQL ở `localhost:5432`; giao diện Mailpit ở `http://localhost:8025`. Flyway của backend tạo schema khi ứng dụng chạy. Sau đó có thể nạp dữ liệu mẫu theo `database/README.md`.

## Chạy frontend

```powershell
cd web-gom/frontend
Copy-Item .env.example .env
npm.cmd install
npm.cmd run dev
```

Mở `http://localhost:5173`. Build production bằng `npm.cmd run build`.

## Chạy backend

```powershell
cd web-gom/backend
Copy-Item .env.example .env
.\mvnw.cmd spring-boot:run
```

Backend ở `http://localhost:8080`. Nếu shell không tự nạp `.env`, hãy đặt các biến môi trường trong phiên terminal hoặc cấu hình IDE. Build/test bằng `.\mvnw.cmd test` và `.\mvnw.cmd package`.

API khởi đầu: `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/refresh`, `GET /api/products`, `POST /api/chat`. `/api/staff/**` yêu cầu STAFF hoặc ADMIN; `/api/admin/**` chỉ cho ADMIN.

## Cấu hình tích hợp

Sao chép hai file `.env.example` thành `.env` và điền secret tại máy/deployment. Không commit `.env`. Gemini nhận catalog rút gọn và tối đa 12 tin nhắn; backend xác minh product ID và tồn kho trước khi trả kết quả. VNPAY đang dùng URL sandbox mặc định. SMTP local có thể đặt host `localhost`, port `1025`, tắt auth/TLS.

## Ghi chú thiết kế

Trang chủ bám frame Figma được cung cấp: container desktop 1290px, Manrope, bảng màu nâu/kem, heading uppercase, card bo 10px và nhịp section rộng. Nội dung cà phê đã đổi sang gốm; ảnh hiện dùng ảnh mẫu từ Unsplash để thay dễ dàng. Do thư mục ban đầu không có SRS, phần nào phụ thuộc SRS chi tiết cần được đối chiếu khi file được bổ sung.
