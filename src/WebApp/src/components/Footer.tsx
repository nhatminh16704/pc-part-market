import React from 'react';
import { Cpu, Mail, Phone, MapPin, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer style={{
      marginTop: '80px',
      backgroundColor: '#05070d',
      borderTop: '1px solid var(--border-subtle)',
      padding: '60px 24px 30px',
    }}>
      <div style={{
        maxWidth: '1360px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '40px',
        marginBottom: '40px',
      }}>
        {/* Brand Col */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Cpu size={20} color="#fff" />
            </div>
            <span style={{ fontSize: '1.3rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>
              PC PART <span className="gradient-text">MARKET</span>
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '20px' }}>
            Nền tảng thương mại điện tử chuyên sâu cho tín đồ công nghệ, game thủ và nhà sáng tạo nội dung tại Việt Nam.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', color: 'var(--text-dim)', fontSize: '0.88rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={16} color="var(--accent-sky)" />
              <span>Tòa nhà TechHub, Q. Cầu Giấy, Hà Nội</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Phone size={16} color="var(--accent-sky)" />
              <span>Hotline kỹ thuật: 1900 8888 (24/7)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Mail size={16} color="var(--accent-sky)" />
              <span>support@pcpartmarket.vn</span>
            </div>
          </div>
        </div>

        {/* Categories Col */}
        <div>
          <h4 style={{ fontSize: '1.05rem', marginBottom: '18px', color: '#fff' }}>Danh Mục Chính</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            <li><a href="#products-section" style={{ transition: 'color 0.2s' }}>Card Màn Hình (VGA / GPU)</a></li>
            <li><a href="#products-section" style={{ transition: 'color 0.2s' }}>Bộ Vi Xử Lý (Intel & AMD CPU)</a></li>
            <li><a href="#products-section" style={{ transition: 'color 0.2s' }}>Bo Mạch Chủ (Mainboard)</a></li>
            <li><a href="#products-section" style={{ transition: 'color 0.2s' }}>Bộ Nhớ Trong (RAM DDR4/DDR5)</a></li>
            <li><a href="#products-section" style={{ transition: 'color 0.2s' }}>Ổ Cứng SSD PCIe 4.0 / 5.0</a></li>
            <li><a href="#products-section" style={{ transition: 'color 0.2s' }}>Nguồn Máy Tính Chuẩn ATX 3.0</a></li>
          </ul>
        </div>

        {/* Support Col */}
        <div>
          <h4 style={{ fontSize: '1.05rem', marginBottom: '18px', color: '#fff' }}>Chính Sách & Hỗ Trợ</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            <li>Chính sách bảo hành 1-đổi-1 30 ngày</li>
            <li>Hướng dẫn đặt hàng & thanh toán</li>
            <li>Dịch vụ lắp đặt PC Gaming tại nhà</li>
            <li>Chính sách vận chuyển hỏa tốc 2H</li>
            <li>Tra cứu thông tin đơn hàng</li>
            <li>Chương trình trả góp 0% lãi suất</li>
          </ul>
        </div>

        {/* Newsletter Col */}
        <div>
          <h4 style={{ fontSize: '1.05rem', marginBottom: '18px', color: '#fff' }}>Nhận Bản Tin Khuyến Mãi</h4>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '16px' }}>
            Đăng ký để nhận voucher giảm giá 500.000₫ cho đơn hàng build PC đầu tiên.
          </p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input 
              type="email" 
              placeholder="Email của bạn..." 
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '10px 14px',
                color: '#fff',
                flex: 1,
                outline: 'none',
              }}
            />
            <button className="glow-btn" style={{ padding: '10px 16px', borderRadius: 'var(--radius-md)' }}>
              Đăng ký
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div style={{
        maxWidth: '1360px',
        margin: '0 auto',
        paddingTop: '24px',
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '16px',
        fontSize: '0.85rem',
        color: 'var(--text-dim)',
      }}>
        <div>
          © {new Date().getFullYear()} PC Part Market. Bản quyền thuộc về nhatminh16704. All rights reserved.
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>Phát triển với</span>
          <Heart size={14} color="var(--accent-rose)" fill="var(--accent-rose)" />
          <span>trên nền tảng .NET Aspire & React Vite</span>
        </div>
      </div>
    </footer>
  );
};
