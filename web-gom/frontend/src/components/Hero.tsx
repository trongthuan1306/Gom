import { useEffect, useRef } from 'react'

export function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (videoRef.current) {
      // Set playback speed to 0.7x as requested
      videoRef.current.playbackRate = 0.7
    }
  }, [])

  return (
    <section className="hero">
      {/* Background Video with 0.7x Speed */}
      <video
        ref={videoRef}
        className="hero-video-bg"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        onLoadedMetadata={() => {
          if (videoRef.current) {
            videoRef.current.playbackRate = 0.7
          }
        }}
      >
        <source src="/videointro.mp4" type="video/mp4" />
      </video>

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
        <p className="eyebrow hero-anim-1">Hiên Gốm · Tinh hoa từ đất · lửa · bàn tay</p>
        <h1 className="hero-anim-2">
          Gốm thủ công
          <br />
          cho nếp sống an yên
        </h1>
        <p className="hero-anim-3">
          Tại Hiên Gốm, mỗi sản phẩm được tạo tác chậm rãi, mang theo dấu ấn tâm huyết của nghệ nhân và nét đẹp mộc mạc đương đại.
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
