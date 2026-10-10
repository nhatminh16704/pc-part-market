import React from 'react';
import { Cpu, Mail, Phone, MapPin, Heart } from 'lucide-react';

const CURRENT_YEAR = new Date().getFullYear();

export const Footer: React.FC = () => {
  return (
    <footer className="mt-16 md:mt-20 bg-[#05070d] border-t border-white/10 pt-12 md:pt-14 pb-8 w-full min-w-0">
      <div className="container-custom grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">
        {/* Brand Col */}
        <div>
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-sky-400 flex items-center justify-center">
              <Cpu className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-extrabold font-heading">
              PC PART <span className="gradient-text">MARKET</span>
            </span>
          </div>
          <p className="text-slate-400 text-sm leading-relaxed mb-5">
            Nền tảng thương mại điện tử chuyên sâu cho tín đồ công nghệ, game thủ và nhà sáng tạo nội dung tại Việt Nam.
          </p>
          <div className="flex flex-col gap-2.5 text-slate-400 text-xs">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-sky-400" />
              <span>Tòa nhà TechHub, Q. Cầu Giấy, Hà Nội</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-sky-400" />
              <span>Hotline kỹ thuật: 1900 8888 (24/7)</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-sky-400" />
              <span>support@pcpartmarket.vn</span>
            </div>
          </div>
        </div>

        {/* Col 2 */}
        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider text-slate-200 mb-4">
            Danh Mục Nổi Bật
          </h4>
          <ul className="flex flex-col gap-2 text-xs text-slate-400">
            <li><a href="#products-section" className="hover:text-sky-400 transition-colors">Card Màn Hình (VGA RTX 40-Series)</a></li>
            <li><a href="#products-section" className="hover:text-sky-400 transition-colors">Vi Xử Lý Intel Gen 14 & AMD Ryzen 7000</a></li>
            <li><a href="#products-section" className="hover:text-sky-400 transition-colors">Bo Mạch Chủ Z790 / B760 / X670E</a></li>
            <li><a href="#products-section" className="hover:text-sky-400 transition-colors">RAM DDR5 Tốc Độ Cao 6000MHz+</a></li>
            <li><a href="#products-section" className="hover:text-sky-400 transition-colors">Ổ Cứng SSD NVMe PCIe Gen 4 & 5</a></li>
            <li><a href="#products-section" className="hover:text-sky-400 transition-colors">Nguồn Máy Tính Chuẩn ATX 3.0 / PCIe 5.0</a></li>
          </ul>
        </div>

        {/* Col 3 */}
        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider text-slate-200 mb-4">
            Chính Sách & Hỗ Trợ
          </h4>
          <ul className="flex flex-col gap-2 text-xs text-slate-400">
            <li><span className="hover:text-sky-400 transition-colors cursor-pointer">Chính sách bảo hành 1-đổi-1 30 ngày</span></li>
            <li><span className="hover:text-sky-400 transition-colors cursor-pointer">Quy trình giao hàng siêu tốc 2H</span></li>
            <li><span className="hover:text-sky-400 transition-colors cursor-pointer">Hướng dẫn build PC & tra cứu tương thích</span></li>
            <li><span className="hover:text-sky-400 transition-colors cursor-pointer">Thanh toán trả góp 0% lãi suất qua thẻ</span></li>
            <li><span className="hover:text-sky-400 transition-colors cursor-pointer">Chính sách hoàn tiền & đổi trả linh kiện</span></li>
          </ul>
        </div>

        {/* Col 4 */}
        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider text-slate-200 mb-4">
            Bản Tin Khuyến Mãi
          </h4>
          <p className="text-xs text-slate-400 mb-3 leading-relaxed">
            Nhận thông báo flash sale giảm giá combo CPU + VGA và mã giảm giá 500k cho đơn đầu tiên.
          </p>
          <div className="flex gap-2">
            <input 
              type="email" 
              placeholder="Email của bạn..." 
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-500 outline-none focus:border-sky-400"
            />
            <button className="bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs px-4 py-2 rounded-lg transition-colors">
              Đăng Ký
            </button>
          </div>
        </div>
      </div>

      <div className="container-custom border-t border-white/5 pt-6 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div>
          © {CURRENT_YEAR} PC Part Market Vietnam. Bản quyền thuộc về eShop Project.
        </div>
        <div className="flex items-center gap-1">
          Thiết kế với <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> dành cho cộng đồng PC Master Race
        </div>
      </div>
    </footer>
  );
};
