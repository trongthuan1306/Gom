export function Hero() {
  return (
    <section className="hero">
      <div className="hero-overlay" />

      {/* Floating pottery particles */}
      <div className="hero-particles" aria-hidden="true">
        <div className="particle p1" />
        <div className="particle p2" />
        <div className="particle p3" />
        <div className="particle p4" />
        <div className="particle p5" />
      </div>

      <div className="hero-content">
        <p className="eyebrow hero-anim-1">Tinh hoa từ đất · lửa · bàn tay</p>
        <h1 className="hero-anim-2">
          Gốm thủ công
          <br />
          cho nếp sống Việt
        </h1>
        <p className="hero-anim-3">
          Mỗi sản phẩm được tạo tác chậm rãi, mang theo dấu tay người thợ và vẻ đẹp mộc mạc bền lâu.
        </p>
        <a className="button light hero-anim-4 btn-shine" href="#products">
          Khám phá bộ sưu tập
        </a>
      </div>

      {/* Scroll indicator */}
      <div className="scroll-indicator" aria-hidden="true">
        <div className="scroll-mouse">
          <div className="scroll-wheel" />
        </div>
        <span>Kéo xuống</span>
      </div>
    </section>
  )
}
