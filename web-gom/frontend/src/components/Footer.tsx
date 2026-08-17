export function Footer() {
  return (
    <footer>
      <div>
        <a className="brand-logo-link footer-logo" href="#" aria-label="Hiên Gốm">
          <img src="/logo.png" alt="Hiên Gốm" className="footer-logo-img" />
        </a>
        <p>
          Không gian gốm thủ công tuyển chọn, gìn giữ nét đẹp văn hóa Việt trong từng nếp sống đương đại.
        </p>
      </div>
      <div>
        <h3>Khám phá</h3>
        <a href="#categories">Danh mục</a>
        <a href="#products">Sản phẩm mới</a>
        <a href="#about">Câu chuyện Hiên Gốm</a>
      </div>
      <div>
        <h3>Hỗ trợ</h3>
        <a href="#policies">Giao hàng an toàn</a>
        <a href="#policies">Chính sách đổi trả</a>
        <a href="mailto:hiengom.support@gmail.com">hiengom.support@gmail.com</a>
      </div>
      <small>© 2026 Hiên Gốm. All rights reserved.</small>
    </footer>
  )
}
