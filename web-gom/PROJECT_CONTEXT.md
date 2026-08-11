# WEB GỐM — PROJECT CONTEXT

> Tài liệu bàn giao ngữ cảnh cho ChatGPT hoặc lập trình viên tiếp tục phát triển dự án.
> Cập nhật theo mã nguồn trong workspace ngày 07/08/2026.

## 1. Tổng quan dự án

Web Gốm là website thương mại điện tử bán sản phẩm gốm Việt. Dự án đang ở giai đoạn MVP, gồm:

- Frontend React + TypeScript + Vite + Tailwind CSS.
- Backend Spring Boot + Spring Security + JWT + Spring Data JPA.
- PostgreSQL và Flyway migration.
- Tích hợp hoặc chuẩn bị tích hợp Gemini, SMTP, VNPAY và Cloudinary.
- Docker Compose dùng để chạy PostgreSQL và Mailpit ở môi trường phát triển.

Mục tiêu dài hạn là hỗ trợ khách hàng duyệt sản phẩm, đăng ký/đăng nhập, đặt hàng, thanh toán, nhận email và sử dụng chatbot để được tư vấn sản phẩm gốm.

## 2. Cấu trúc thư mục

```text
web-gom/
├── frontend/                   # React/Vite frontend
│   ├── src/
│   │   ├── components/        # Các component giao diện
│   │   ├── data/mockData.ts   # Dữ liệu mẫu hiện tại
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   ├── styles.css
│   │   └── types.ts
│   ├── .env.example
│   ├── package.json
│   └── vite.config.ts
├── backend/                    # Spring Boot backend
│   ├── src/main/java/vn/gomviet/
│   │   ├── config/
│   │   ├── controller/
│   │   ├── dto/
│   │   ├── entity/
│   │   ├── exception/
│   │   ├── mapper/
│   │   ├── repository/
│   │   ├── security/
│   │   └── service/
│   ├── src/main/resources/application.yml
│   ├── src/test/
│   ├── .env.example
│   └── pom.xml
├── database/
│   ├── migrations/V1__init.sql
│   ├── schema.sql
│   ├── seed.sql
│   └── README.md
├── docs/ARCHITECTURE.md
├── scripts/start-dev.ps1
├── docker-compose.yml
└── README.md
```

## 3. Công nghệ sử dụng

### Frontend

- React.
- TypeScript.
- Vite.
- Tailwind CSS 4.
- Lucide React cho icon.
- Dữ liệu sản phẩm trên giao diện hiện vẫn lấy từ `src/data/mockData.ts`.

### Backend

- Java 21.
- Spring Boot 3.5.4.
- Spring Web.
- Spring Security.
- Spring Data JPA.
- Jakarta Validation.
- Spring Mail.
- JJWT 0.12.6.
- Flyway.
- PostgreSQL JDBC driver.
- Maven Wrapper.

### Hạ tầng và dịch vụ ngoài

- PostgreSQL 17.
- Mailpit cho SMTP local.
- Gemini API cho chatbot.
- VNPAY sandbox cho thanh toán.
- Cloudinary được chọn để lưu ảnh/video trên cloud.

## 4. Kiến trúc hiện tại

```text
React frontend
      │ REST/JSON
      ▼
Spring Boot controllers
      ▼
Services / business logic
      ▼
Repositories / JPA
      ▼
PostgreSQL

Backend ──► Gemini API
Backend ──► SMTP server
Backend ──► VNPAY
Backend ──► Cloudinary (chưa được triển khai bằng code)
```

Backend là ranh giới tin cậy: xác thực JWT, kiểm tra quyền, giá, tồn kho và dữ liệu do dịch vụ bên ngoài trả về. Secret chỉ được lấy từ biến môi trường và không được đưa vào source control.

## 5. Chức năng backend đã có

### 5.1. Xác thực

Các endpoint:

| Method | Endpoint | Quyền | Trạng thái |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Đã có |
| POST | `/api/auth/login` | Public | Đã có |
| POST | `/api/auth/refresh` | Public | Đã có |

Chi tiết:

- Email không phân biệt chữ hoa/chữ thường.
- Mật khẩu được băm bằng BCrypt.
- Access token sử dụng JWT và chứa email cùng role.
- Access token mặc định hết hạn sau 15 phút.
- Refresh token mặc định hết hạn sau 7 ngày.
- Refresh token được tạo ngẫu nhiên, database chỉ lưu SHA-256 hash.
- Khi refresh, token cũ bị thu hồi và một cặp token mới được phát hành.

### 5.2. Phân quyền

Các role:

- `CUSTOMER`
- `STAFF`
- `ADMIN`

Quy tắc hiện tại:

- `/api/auth/**`: public.
- `GET /api/products/**`: public.
- `/api/staff/**`: chỉ STAFF hoặc ADMIN.
- `/api/admin/**`: chỉ ADMIN.
- Các endpoint khác yêu cầu đăng nhập.
- Backend dùng session stateless và JWT filter.

Hiện `/api/staff/status` và `/api/admin/status` chỉ là endpoint kiểm tra quyền, chưa phải chức năng quản trị thực tế.

### 5.3. Sản phẩm

Endpoint:

| Method | Endpoint | Quyền | Chức năng |
|---|---|---|---|
| GET | `/api/products` | Public | Trả danh sách sản phẩm đang active |

Các lớp đã có:

- `Product` entity.
- `ProductRepository`.
- `ProductService`.
- `ProductMapper`.
- `ProductDto`.
- `ProductController`.

API trả về: `id`, `slug`, `name`, `description`, `price`, `stockQuantity`, `imageUrl`.

Chưa có tìm kiếm, lọc, phân trang, xem chi tiết và CRUD sản phẩm.

### 5.4. Chatbot Gemini

Endpoint:

| Method | Endpoint | Quyền | Chức năng |
|---|---|---|---|
| POST | `/api/chat` | Authenticated | Tư vấn sản phẩm bằng Gemini |

Luồng hiện tại:

1. Client gửi tối đa 12 tin nhắn, mỗi tin tối đa 2.000 ký tự.
2. Backend đọc catalog sản phẩm đang active từ database.
3. Backend gửi lịch sử chat và catalog rút gọn tới Gemini.
4. Gemini được yêu cầu trả JSON gồm `answer` và `recommendations`.
5. Backend loại bỏ recommendation có product ID không tồn tại hoặc đã hết hàng.

Model mặc định hiện là `gemini-2.5-flash`. Khi Gemini lỗi, backend trả lỗi `502 Bad Gateway`.

### 5.5. Email

Đã có `EmailService` sử dụng `JavaMailSender` để gửi email văn bản đơn giản.

Chưa nối email vào các luồng nghiệp vụ như:

- Xác minh tài khoản.
- Quên mật khẩu.
- Xác nhận đơn hàng.
- Thông báo trạng thái giao hàng.
- Xác nhận thanh toán.

### 5.6. VNPAY

Đã có `VnpayService`:

- Tạo URL thanh toán VNPAY.
- Quy đổi số tiền sang đơn vị VNPAY yêu cầu.
- Tạo chữ ký HMAC-SHA512.
- Hỗ trợ cấu hình sandbox qua biến môi trường.

Chưa có:

- Payment controller.
- API tạo thanh toán hoàn chỉnh từ đơn hàng.
- Return handler.
- IPN handler.
- Xác minh chữ ký response từ VNPAY.
- Cập nhật bảng `payments` và trạng thái đơn hàng.

### 5.7. Xử lý lỗi và validation

- Có `ApiException` mang HTTP status.
- Có `GlobalExceptionHandler` cho lỗi nghiệp vụ và validation.
- DTO đăng ký, đăng nhập, refresh token và chat đã có validation cơ bản.

## 6. Cloud ảnh và video

Quy ước mới của dự án:

- Từ nay tất cả ảnh và video phải lưu trên Cloudinary.
- Không lưu file media trực tiếp trong source code hoặc ổ đĩa của backend.
- Database chỉ lưu URL, `public_id`, loại tài nguyên và metadata cần thiết.
- Credential Cloudinary chỉ nằm trong `.env` hoặc secret manager của môi trường triển khai.
- Khi thay hoặc xóa media, backend cần đồng bộ việc xóa tài nguyên cũ trên Cloudinary.
- Backend phải kiểm tra MIME type, dung lượng và quyền của người upload.

Trạng thái thực tế tại thời điểm viết tài liệu:

- `.env` đã có cấu hình Cloudinary.
- `pom.xml` chưa có Cloudinary SDK.
- `application.yml` chưa ánh xạ cấu hình Cloudinary.
- Chưa có `CloudinaryConfig`, media service, upload controller hoặc API upload.
- Entity `Product` mới chỉ có một trường `imageUrl`; chưa có `publicId`, video hoặc bảng media riêng.
- Frontend vẫn dùng ảnh mẫu từ Unsplash và chưa gọi API upload.

Do đó, Cloudinary hiện mới ở mức cấu hình credential, chưa được tích hợp hoàn chỉnh.

## 7. Database

Flyway migration hiện tạo các enum:

- `order_status`: `PENDING`, `CONFIRMED`, `SHIPPING`, `COMPLETED`, `CANCELLED`.
- `payment_status`: `PENDING`, `PAID`, `FAILED`, `REFUNDED`.

Các bảng:

| Bảng | Mục đích | Entity Java hiện có |
|---|---|---|
| `users` | Người dùng và role | Có |
| `categories` | Danh mục sản phẩm | Chưa có |
| `products` | Sản phẩm, giá, tồn kho, URL ảnh | Có |
| `orders` | Đơn hàng | Chưa có |
| `order_items` | Chi tiết đơn hàng | Chưa có |
| `payments` | Giao dịch thanh toán | Chưa có |
| `refresh_tokens` | Refresh token đã băm | Có |

Database đã có index cho category của sản phẩm, user của đơn hàng và user của refresh token. File `seed.sql` tạo ba danh mục và hai sản phẩm mẫu, không tạo tài khoản mặc định.

## 8. Frontend hiện tại

Frontend mới tập trung vào trang chủ giới thiệu thương hiệu gốm Việt, gồm:

- Header.
- Hero section.
- Giới thiệu thương hiệu.
- Danh mục sản phẩm.
- Quy trình làm gốm.
- Sản phẩm nổi bật.
- Bộ sưu tập mới.
- Chính sách mua hàng.
- Footer.
- Nút chatbot.

Giao diện dùng tông nâu/kem và font Manrope, được xây dựng dựa trên frame thiết kế ban đầu. Sản phẩm và danh mục hiện lấy từ mock data; frontend chưa kết nối `GET /api/products`.

Các chức năng frontend chưa có:

- Routing nhiều trang.
- Đăng ký và đăng nhập.
- Quản lý access/refresh token.
- Trang danh sách và chi tiết sản phẩm thật.
- Tìm kiếm, lọc và phân trang.
- Giỏ hàng.
- Checkout.
- Đơn hàng của khách.
- Thanh toán VNPAY.
- Chat UI hoàn chỉnh và kết nối `/api/chat`.
- Trang STAFF/ADMIN.
- Upload ảnh/video lên cloud.

## 9. Biến môi trường

Không ghi giá trị thật vào tài liệu, source hoặc commit. Các tên biến dự kiến:

```dotenv
# Database
DB_URL=
DB_USERNAME=
DB_PASSWORD=

# JWT
JWT_SECRET=
JWT_ACCESS_EXPIRATION_MS=
JWT_REFRESH_EXPIRATION_MS=

# Gemini
GEMINI_API_KEY=
GEMINI_MODEL=

# SMTP
SMTP_HOST=
SMTP_PORT=
SMTP_USERNAME=
SMTP_PASSWORD=
SMTP_AUTH=
SMTP_STARTTLS=

# VNPAY
VNPAY_TMN_CODE=
VNPAY_HASH_SECRET=
VNPAY_PAY_URL=
VNPAY_RETURN_URL=

# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Frontend
FRONTEND_URL=
VITE_API_URL=
```

Lưu ý bảo mật quan trọng: file `.env.example` hiện có các chuỗi trông giống credential thật. Cần thay toàn bộ bằng placeholder, bảo đảm `.env` bị ignore và xoay vòng ngay các secret đã từng bị chia sẻ hoặc commit.

## 10. Cách chạy dự án

### PostgreSQL và Mailpit

```powershell
cd web-gom
docker compose up -d postgres mailpit
```

- PostgreSQL: `localhost:5432`.
- Mailpit UI: `http://localhost:8025`.
- Mailpit SMTP: `localhost:1025`.

### Backend

```powershell
cd web-gom/backend
Copy-Item .env.example .env
.\mvnw.cmd spring-boot:run
```

Backend mặc định chạy tại `http://localhost:8080`.

Kiểm thử và đóng gói:

```powershell
.\mvnw.cmd test
.\mvnw.cmd package
```

### Frontend

```powershell
cd web-gom/frontend
Copy-Item .env.example .env
npm.cmd install
npm.cmd run dev
```

Frontend mặc định chạy tại `http://localhost:5173`.

Build production:

```powershell
npm.cmd run build
```

## 11. Trạng thái kiểm thử

- Backend từng compile thành công.
- Có một Spring context smoke test.
- Kết quả gần nhất trong report: 1 test, 0 failure, 0 error.
- Chưa có unit test hoặc integration test đầy đủ cho auth, JWT, product, Gemini, VNPAY và Cloudinary.
- Frontend đã có cấu hình build TypeScript/Vite nhưng chưa có test tự động.

## 12. Các việc còn thiếu theo mức ưu tiên

### Ưu tiên 0 — Bảo mật

1. Xóa credential thật khỏi `.env.example`, chỉ giữ placeholder.
2. Xoay vòng mọi secret đã từng bị đưa vào file mẫu hoặc chia sẻ.
3. Kiểm tra lịch sử Git trước khi đẩy repository lên remote.
4. Bổ sung quy trình secret cho môi trường dev, staging và production.

### Ưu tiên 1 — Hoàn thiện nền tảng backend

1. Tích hợp Cloudinary thực tế cho ảnh và video.
2. Xây CRUD category/product cho STAFF/ADMIN.
3. Bổ sung upload, thay thế và xóa media an toàn.
4. Xây entity/repository/service/controller cho cart hoặc checkout, order, order item và payment.
5. Hoàn thiện VNPAY return/IPN và kiểm tra chữ ký.
6. Thêm logout/revoke refresh token và dọn token hết hạn.

### Ưu tiên 2 — Kết nối frontend

1. Thay mock data bằng API sản phẩm thật.
2. Thêm router và các trang auth, catalog, detail, cart, checkout, orders.
3. Tích hợp JWT an toàn và xử lý refresh token.
4. Hoàn thiện giao diện chatbot.
5. Xây dashboard STAFF/ADMIN.
6. Tích hợp upload media cloud trong màn hình quản trị.

### Ưu tiên 3 — Chất lượng và vận hành

1. Viết unit test và integration test.
2. Chuẩn hóa API error response và logging.
3. Thêm OpenAPI/Swagger.
4. Thêm pagination, sorting và filtering.
5. Thêm rate limiting cho auth, chat và upload.
6. Thiết lập CI/CD, monitoring, backup database và môi trường production.

## 13. Nguyên tắc cho ChatGPT khi tiếp tục dự án

Khi làm tiếp dự án này, cần tuân thủ:

1. Đọc mã nguồn hiện tại trước khi sửa, không giả định tài liệu luôn mới hơn code.
2. Không in, ghi lại hoặc commit secret.
3. Không lưu ảnh/video local; dùng Cloudinary và chỉ lưu tham chiếu trong database.
4. Backend phải xác minh quyền, dữ liệu, giá và tồn kho; không tin dữ liệu từ frontend.
5. Giữ kiến trúc controller/service/repository/entity/dto/mapper hiện tại.
6. Dùng Flyway migration mới cho mọi thay đổi schema; không sửa migration đã chạy trên môi trường dùng chung.
7. Khi thêm API phải cập nhật security rules, validation, exception handling và test.
8. Khi sửa frontend phải thay dần mock data bằng REST API, có loading/error/empty states.
9. Sau mỗi thay đổi phải chạy test backend và build frontend liên quan.
10. Nêu rõ phần đã hoàn thành, phần chưa hoàn thành và mọi giả định khi bàn giao.

## 14. Prompt gợi ý khi gửi tài liệu này cho ChatGPT

```text
Hãy đọc toàn bộ PROJECT_CONTEXT.md và kiểm tra mã nguồn thực tế trước khi thực hiện yêu cầu. Không được đưa secret vào source hoặc câu trả lời. Ảnh/video phải lưu trên Cloudinary, database chỉ lưu URL/public_id và metadata. Hãy giữ kiến trúc hiện tại, dùng Flyway cho thay đổi database, bổ sung validation và test phù hợp. Sau khi sửa, hãy chạy kiểm thử backend và build frontend rồi báo rõ file đã thay đổi, kết quả kiểm tra và phần còn thiếu.
```
