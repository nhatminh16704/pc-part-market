import React from 'react';
import { ShieldCheck, Truck, Wrench, ArrowRight, Zap, CheckCircle2 } from 'lucide-react';

interface HeroProps {
  onExploreClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onExploreClick }) => {
  return (
    <section style={{
      position: 'relative',
      padding: '48px 24px 36px',
      maxWidth: '1360px',
      margin: '0 auto',
      overflow: 'hidden',
    }}>
      {/* Background Glow Blobs */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        left: '20%',
        width: '450px',
        height: '450px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(56, 189, 248, 0.18) 0%, transparent 70%)',
        filter: 'blur(60px)',
        zIndex: 0,
        pointerEvents: 'none',
      }} />

      <div style={{
        position: 'absolute',
        bottom: '0%',
        right: '15%',
        width: '400px',
        height: '400px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)',
        filter: 'blur(60px)',
        zIndex: 0,
        pointerEvents: 'none',
      }} />

      {/* Grid Container */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        alignItems: 'center',
        gap: '40px',
      }}>
        {/* Left Column: Headlines & CTAs */}
        <div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'rgba(56, 189, 248, 0.1)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            borderRadius: 'var(--radius-full)',
            padding: '6px 14px',
            marginBottom: '20px',
          }}>
            <Zap size={15} color="var(--accent-sky)" />
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent-sky)' }}>
              1,625+ Linh Kiện Đã Sẵn Sàng Giao Ngay
            </span>
          </div>

          <h1 style={{
            fontSize: 'clamp(2.4rem, 5vw, 3.8rem)',
            fontWeight: 900,
            lineHeight: 1.1,
            marginBottom: '20px',
          }}>
            Xây Dựng Cỗ Máy <br />
            <span className="gradient-text">Gaming & Đồ Họa</span> <br />
            Trong Mơ Của Bạn
          </h1>

          <p style={{
            fontSize: '1.1rem',
            color: 'var(--text-muted)',
            marginBottom: '32px',
            maxWidth: '540px',
            lineHeight: 1.6,
          }}>
            Sàn thương mại điện tử chuyên sâu linh kiện PC chính hãng từ ASUS, MSI, GIGABYTE, Colorful. Cam kết 100% nguyên seal, bảo hành 36 tháng, giao siêu tốc toàn quốc.
          </p>

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '16px',
            marginBottom: '40px',
          }}>
            <button 
              onClick={onExploreClick}
              className="glow-btn"
              style={{ padding: '14px 28px', fontSize: '1rem', borderRadius: 'var(--radius-full)' }}
            >
              <span>Xem Linh Kiện Mới Nhất</span>
              <ArrowRight size={18} />
            </button>

            <button 
              className="secondary-btn"
              style={{ padding: '14px 24px', fontSize: '1rem', borderRadius: 'var(--radius-full)' }}
            >
              <Wrench size={18} color="var(--accent-purple)" />
              <span>Cấu Hình PC Tối Ưu</span>
            </button>
          </div>

          {/* Mini Trust Highlights */}
          <div style={{
            display: 'flex',
            gap: '24px',
            flexWrap: 'wrap',
            color: 'var(--text-dim)',
            fontSize: '0.88rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={16} color="var(--accent-emerald)" />
              <span>100% Hàng Chính Hãng</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={16} color="var(--accent-emerald)" />
              <span>Bảo Hành 1-Đổi-1 30 Ngày</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={16} color="var(--accent-emerald)" />
              <span>Hỗ Trợ Kỹ Thuật Trọn Đời</span>
            </div>
          </div>
        </div>

        {/* Right Column: Hero Visual Card */}
        <div style={{
          position: 'relative',
        }}>
          <div className="glass-panel hover-lift" style={{
            padding: '28px',
            position: 'relative',
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.9) 100%)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
          }}>
            {/* Tag Badge */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '18px',
            }}>
              <span style={{
                background: 'linear-gradient(90deg, #f43f5e, #fb7185)',
                color: '#fff',
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}>
                Siêu Phẩm Flagship
              </span>
              <span style={{
                fontSize: '0.85rem',
                color: 'var(--accent-emerald)',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}>
                ● Còn 8 sản phẩm
              </span>
            </div>

            {/* Hardware Image Showcase */}
            <div style={{
              position: 'relative',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              height: '240px',
              backgroundColor: '#0b0f19',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px',
            }}>
              <img 
                src="https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=800&q=80" 
                alt="RTX 4090 Rog Strix"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  filter: 'contrast(1.05)',
                  transition: 'transform 0.4s ease',
                }}
              />
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, rgba(11, 15, 25, 0.8) 0%, transparent 60%)',
              }} />
              <div style={{
                position: 'absolute',
                bottom: '12px',
                left: '16px',
                fontSize: '0.8rem',
                color: 'var(--text-muted)',
              }}>
                Architecture: <strong style={{ color: '#fff' }}>Ada Lovelace 4nm</strong>
              </div>
            </div>

            {/* Spec Details Preview */}
            <h3 style={{ fontSize: '1.25rem', marginBottom: '8px', lineHeight: 1.3 }}>
              VGA ASUS ROG Strix GeForce RTX 4090 OC Edition 24GB
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '16px' }}>
              Xung nhịp tối đa 2640 MHz • Quạt Axial-tech thế hệ mới • Khung hợp kim đúc nguyên khối.
            </p>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingTop: '16px',
              borderTop: '1px solid var(--border-subtle)',
            }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Giá Ưu Đãi</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-sky)', fontFamily: 'var(--font-heading)' }}>
                  52.990.000 ₫
                </div>
              </div>
              <button 
                onClick={onExploreClick}
                className="glow-btn"
                style={{ padding: '8px 18px', fontSize: '0.85rem' }}
              >
                Khám Phá Thêm
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Feature Badges Bar */}
      <div style={{
        marginTop: '48px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px',
      }}>
        <div className="glass-panel" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ padding: '10px', borderRadius: '12px', background: 'rgba(56, 189, 248, 0.1)', color: 'var(--accent-sky)' }}>
            <Truck size={24} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Giao Siêu Tốc 2H</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Miễn phí ship nội thành</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ padding: '10px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-emerald)' }}>
            <ShieldCheck size={24} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Bảo Hành 36 Tháng</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Cam kết 100% chính hãng</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ padding: '10px', borderRadius: '12px', background: 'rgba(139, 92, 246, 0.1)', color: 'var(--accent-purple)' }}>
            <Wrench size={24} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Hỗ Trợ Lắp Ráp PC</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Tối ưu dây & test benchmark</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ padding: '10px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.1)', color: 'var(--accent-amber)' }}>
            <Zap size={24} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Trả Góp 0% Lãi Suất</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Thủ tục duyệt trong 5 phút</div>
          </div>
        </div>
      </div>
    </section>
  );
};
