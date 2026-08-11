# Database

PostgreSQL là nguồn dữ liệu chính. `schema.sql` dùng để đọc/đối chiếu, còn backend chạy migration trong `migrations/` bằng Flyway. `seed.sql` chỉ chứa dữ liệu danh mục/sản phẩm mẫu và không tạo tài khoản mặc định.

Chạy thủ công sau khi database sẵn sàng:

```powershell
psql -U web_gom -d web_gom -f database/seed.sql
```

Mọi thay đổi schema mới phải thêm migration mới (`V2__...sql`), không sửa migration đã chạy ở môi trường chia sẻ.
